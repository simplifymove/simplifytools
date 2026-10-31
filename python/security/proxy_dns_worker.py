"""DNS lookup worker for a future restricted HTTPS CONNECT proxy.

This module is intended to run as a short-lived subprocess under a parent
that enforces a hard deadline, output limits, and OS-level security policy.

It does not validate DNS results for use as connection destinations.
The parent must validate every returned address before connecting.
"""

from __future__ import annotations

import json
import socket
import sys

from python.security.proxy_policy import (
    ProxyPolicyError,
    validate_proxy_hostname,
)

MAX_DNS_ANSWERS = 32
MAX_OUTPUT_BYTES = 4096


def resolve_for_parent(hostname: str) -> list[list]:
    """Resolve a permitted hostname and serialize bounded DNS records."""
    hostname = validate_proxy_hostname(hostname)

    answers = socket.getaddrinfo(
        hostname,
        443,
        type=socket.SOCK_STREAM,
    )

    if not isinstance(answers, list):
        raise ProxyPolicyError("Malformed DNS response.")

    if not 1 <= len(answers) <= MAX_DNS_ANSWERS:
        raise ProxyPolicyError("Invalid DNS answer count.")

    records = []

    for answer in answers:
        if not isinstance(answer, tuple) or len(answer) != 5:
            raise ProxyPolicyError("Malformed DNS answer.")

        family, socktype, protocol, _, sockaddr = answer

        if family not in (socket.AF_INET, socket.AF_INET6):
            raise ProxyPolicyError("Unsupported DNS family.")

        if socktype != socket.SOCK_STREAM:
            raise ProxyPolicyError("Unsupported DNS socket type.")

        if protocol not in (0, socket.IPPROTO_TCP):
            raise ProxyPolicyError("Unsupported DNS protocol.")

        if not isinstance(sockaddr, tuple):
            raise ProxyPolicyError("Malformed DNS socket address.")

        expected_length = 2 if family == socket.AF_INET else 4

        if len(sockaddr) != expected_length:
            raise ProxyPolicyError("Malformed DNS socket address.")

        address, port = sockaddr[:2]

        if not isinstance(address, str):
            raise ProxyPolicyError("Invalid DNS address.")

        if type(port) is not int or port != 443:
            raise ProxyPolicyError("Unexpected DNS port.")

        if family == socket.AF_INET6:
            flowinfo, scopeid = sockaddr[2:]

            if type(flowinfo) is not int or flowinfo != 0:
                raise ProxyPolicyError("Unexpected IPv6 flow information.")

            if type(scopeid) is not int or scopeid != 0:
                raise ProxyPolicyError("Unexpected IPv6 scope identifier.")

        records.append([
            family,
            socktype,
            protocol,
            address,
            port,
        ])

    return records


def main() -> int:
    """Print one bounded JSON result for the parent process."""
    if len(sys.argv) != 2:
        return 2

    try:
        records = resolve_for_parent(sys.argv[1])
        payload = json.dumps(
            records,
            separators=(",", ":"),
            ensure_ascii=True,
        ).encode("ascii")

        if len(payload) > MAX_OUTPUT_BYTES:
            return 2

        sys.stdout.buffer.write(payload + b"\n")
        sys.stdout.buffer.flush()
        return 0

    except (ProxyPolicyError, OSError, ValueError, TypeError):
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
