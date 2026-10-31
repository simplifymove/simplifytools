"""Validated DNS resolution for a future restricted HTTPS proxy.

Resolve once, validate every DNS result, and return a pinned IP address.
This module is not an HTTP proxy or an OS-level network security boundary.
"""

from __future__ import annotations

import ipaddress
import json
import socket
import subprocess
import sys
import threading
import time
from pathlib import Path
from urllib.parse import urlsplit

from python.security.proxy_dns_worker import (
    MAX_DNS_ANSWERS,
    MAX_OUTPUT_BYTES,
)

from python.security.proxy_policy import (
    ProxyPolicyError,
    validate_proxy_destination,
    validate_proxy_hostname,
)


DNS_TIMEOUT_SECONDS = 5


def _run_bounded_dns_worker(hostname: str) -> bytes:
    """Run an isolated DNS worker with bounded output and a hard deadline."""
    project_root = Path(__file__).resolve().parents[2]

    bootstrap = (
        "import runpy,sys;"
        "sys.path.insert(0,sys.argv[1]);"
        "sys.argv=['python.security.proxy_dns_worker',sys.argv[2]];"
        "runpy.run_module('python.security.proxy_dns_worker',run_name='__main__')"
    )

    command = [
        sys.executable,
        "-I",
        "-c",
        bootstrap,
        str(project_root),
        hostname,
    ]

    stdout_chunks = []
    stderr_chunks = []
    oversized = threading.Event()
    errors = []

    try:
        process = subprocess.Popen(
            command,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=str(project_root),
            shell=False,
        )
    except OSError as exc:
        raise ProxyPolicyError("DNS worker could not start.") from exc

    def read_stream(stream, chunks):
        remaining = MAX_OUTPUT_BYTES + 1

        try:
            while remaining > 0:
                chunk = stream.read(min(1024, remaining))

                if not chunk:
                    return

                chunks.append(chunk)
                remaining -= len(chunk)

            oversized.set()
        except OSError as exc:
            errors.append(exc)

    stdout_thread = threading.Thread(
        target=read_stream,
        args=(process.stdout, stdout_chunks),
        daemon=True,
    )
    stderr_thread = threading.Thread(
        target=read_stream,
        args=(process.stderr, stderr_chunks),
        daemon=True,
    )

    started = time.monotonic()
    timed_out = False

    try:
        stdout_thread.start()
        stderr_thread.start()

        deadline = started + DNS_TIMEOUT_SECONDS

        while process.poll() is None:
            if oversized.is_set():
                break

            remaining = deadline - time.monotonic()

            if remaining <= 0:
                timed_out = True
                break

            time.sleep(min(0.01, remaining))
    finally:
        cleanup_errors = []

        try:
            if process.poll() is None:
                process.kill()
        except OSError as exc:
            cleanup_errors.append(exc)

        try:
            process.wait(timeout=1)
        except (OSError, subprocess.TimeoutExpired) as exc:
            cleanup_errors.append(exc)

        for reader in (stdout_thread, stderr_thread):
            try:
                if reader.ident is not None:
                    reader.join(timeout=1)
            except RuntimeError as exc:
                cleanup_errors.append(exc)

        for stream in (process.stdout, process.stderr):
            if stream is not None:
                try:
                    stream.close()
                except OSError as exc:
                    cleanup_errors.append(exc)

        if cleanup_errors:
            raise ProxyPolicyError(
                'DNS worker cleanup failed.'
            ) from cleanup_errors[0]

    if stdout_thread.is_alive() or stderr_thread.is_alive() or errors:
        raise ProxyPolicyError("DNS worker pipe reader failed.")

    if timed_out:
        raise ProxyPolicyError("DNS worker exceeded its deadline.")

    stdout = b"".join(stdout_chunks)
    stderr = b"".join(stderr_chunks)

    if (
        oversized.is_set()
        or len(stdout) > MAX_OUTPUT_BYTES
        or len(stderr) > MAX_OUTPUT_BYTES
    ):
        raise ProxyPolicyError("DNS worker output exceeded its limit.")

    if process.returncode != 0:
        raise ProxyPolicyError("DNS worker rejected the request.")

    return stdout


def resolve_dns_with_deadline(hostname: str) -> list:
    """Resolve DNS through a bounded child process."""
    hostname = validate_proxy_hostname(hostname)

    output = _run_bounded_dns_worker(hostname)

    try:
        records = json.loads(output)
    except (ValueError, TypeError, UnicodeDecodeError) as exc:
        raise ProxyPolicyError("Malformed DNS subprocess response.") from exc

    if not isinstance(records, list) or not 1 <= len(records) <= MAX_DNS_ANSWERS:
        raise ProxyPolicyError("Invalid DNS record count.")

    answers = []

    for record in records:
        if not isinstance(record, list) or len(record) != 5:
            raise ProxyPolicyError("Malformed DNS record.")

        family, socktype, protocol, address, port = record

        if any(type(value) is not int for value in (
            family,
            socktype,
            protocol,
            port,
        )):
            raise ProxyPolicyError("Invalid DNS record field type.")

        if not isinstance(address, str):
            raise ProxyPolicyError("Invalid DNS address type.")

        if family == socket.AF_INET:
            sockaddr = (address, port)
        elif family == socket.AF_INET6:
            sockaddr = (address, port, 0, 0)
        else:
            raise ProxyPolicyError("Unsupported DNS family.")

        answers.append((
            family,
            socktype,
            protocol,
            "",
            sockaddr,
        ))

    return answers


def resolve_validated_destination(
    url: str,
    resolver=None,
) -> tuple[str, str]:
    """Return the validated hostname and first validated public IP."""

    if not isinstance(url, str):
        raise ProxyPolicyError("Destination URL must be a string.")

    try:
        parsed = urlsplit(url)
        hostname = validate_proxy_hostname(parsed.hostname)
    except (TypeError, ValueError) as exc:
        raise ProxyPolicyError("Invalid destination hostname.") from exc

    # Reject malformed URLs before any DNS activity.
    validate_proxy_destination(url, ["1.1.1.1"])

    if resolver is None:
        resolver = socket.getaddrinfo

    try:
        answers = resolver(
            hostname,
            443,
            type=socket.SOCK_STREAM,
        )
    except (OSError, TypeError, ValueError) as exc:
        raise ProxyPolicyError("Destination DNS resolution failed.") from exc

    addresses = []

    try:
        for answer in answers:
            if not isinstance(answer, (tuple, list)) or len(answer) != 5:
                raise ProxyPolicyError("Malformed DNS record.")

            family, socktype, protocol, _, sockaddr = answer

            if family not in (socket.AF_INET, socket.AF_INET6):
                raise ProxyPolicyError("Unsupported DNS address family.")

            if socktype != socket.SOCK_STREAM:
                raise ProxyPolicyError("Unsupported DNS socket type.")

            if protocol not in (0, socket.IPPROTO_TCP):
                raise ProxyPolicyError("Unsupported DNS protocol.")

            if not isinstance(sockaddr, (tuple, list)):
                raise ProxyPolicyError("Malformed DNS socket address.")

            expected_length = 2 if family == socket.AF_INET else 4

            if len(sockaddr) != expected_length:
                raise ProxyPolicyError("Malformed DNS socket address.")

            address, port = sockaddr[:2]

            if type(port) is not int or port != 443:
                raise ProxyPolicyError("Unexpected DNS destination port.")

            if not isinstance(address, str) or "%" in address:
                raise ProxyPolicyError("Invalid DNS IP address.")

            parsed_ip = ipaddress.ip_address(address)

            if family == socket.AF_INET and parsed_ip.version != 4:
                raise ProxyPolicyError("DNS IPv4 family mismatch.")

            if family == socket.AF_INET6 and parsed_ip.version != 6:
                raise ProxyPolicyError("DNS IPv6 family mismatch.")

            if family == socket.AF_INET6:
                flowinfo, scopeid = sockaddr[2:]

                if type(flowinfo) is not int or flowinfo != 0:
                    raise ProxyPolicyError("Unexpected IPv6 flow information.")

                if type(scopeid) is not int or scopeid != 0:
                    raise ProxyPolicyError("Unexpected IPv6 scope identifier.")

            addresses.append(address)

    except (TypeError, ValueError, IndexError, KeyError, AttributeError) as exc:
        raise ProxyPolicyError("Malformed DNS resolution result.") from exc

    validated_hostname, validated_addresses = validate_proxy_destination(
        url,
        addresses,
    )

    return validated_hostname, validated_addresses[0]