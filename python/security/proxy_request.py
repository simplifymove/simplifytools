"""Strict CONNECT request validation for a future restricted proxy.

This parser does not start a server or establish network connections.
"""

from __future__ import annotations

from python.security.proxy_policy import (
    ProxyPolicyError,
    validate_proxy_hostname,
)

MAX_REQUEST_BYTES = 8192


def parse_connect_request(data: bytes) -> str:
    """Validate one complete HTTP/1.1 CONNECT request."""

    if not isinstance(data, bytes):
        raise ProxyPolicyError("Proxy request must be bytes.")

    if not data or len(data) > MAX_REQUEST_BYTES:
        raise ProxyPolicyError("Proxy request size rejected.")

    if not data.endswith(b"\r\n\r\n"):
        raise ProxyPolicyError("Incomplete proxy request.")

    normalized_lines = data.replace(b"\r\n", b"")

    if (
        b"\r" in normalized_lines
        or b"\n" in normalized_lines
        or any(byte < 32 or byte == 127 for byte in normalized_lines)
    ):
        raise ProxyPolicyError("Invalid request control characters.")

    try:
        text = data.decode("ascii")
    except UnicodeDecodeError as exc:
        raise ProxyPolicyError("Non-ASCII proxy request.") from exc

    lines = text[:-4].split("\r\n")

    if not lines:
        raise ProxyPolicyError("Missing request line.")

    parts = lines[0].split(" ")

    if len(parts) != 3 or any(not part for part in parts):
        raise ProxyPolicyError("Malformed CONNECT request line.")

    method, authority, version = parts

    if method != "CONNECT" or version not in ("HTTP/1.0", "HTTP/1.1"):
        raise ProxyPolicyError("Only HTTP CONNECT is allowed.")

    if authority.count(":") != 1:
        raise ProxyPolicyError("Invalid CONNECT authority.")

    hostname, port = authority.rsplit(":", 1)

    if port != "443":
        raise ProxyPolicyError("Only HTTPS port 443 is allowed.")

    validated_hostname = validate_proxy_hostname(hostname)

    if hostname != validated_hostname:
        raise ProxyPolicyError("Noncanonical CONNECT hostname.")

    hostname = validated_hostname

    if len(lines) > 17:
        raise ProxyPolicyError("Too many proxy headers.")

    seen = set()

    for line in lines[1:]:
        if not line or line[0] in " \t":
            raise ProxyPolicyError("Invalid proxy header.")

        if ":" not in line:
            raise ProxyPolicyError("Malformed proxy header.")

        name, value = line.split(":", 1)
        normalized = name.lower()

        if not name or not name.isascii():
            raise ProxyPolicyError("Invalid proxy header name.")

        if not name.replace("-", "").isalnum():
            raise ProxyPolicyError("Invalid proxy header name.")

        if normalized in seen:
            raise ProxyPolicyError("Duplicate proxy header.")

        seen.add(normalized)

        if normalized != "host":
            raise ProxyPolicyError("Unexpected proxy header.")

        if value != " " + authority:
            raise ProxyPolicyError("CONNECT Host header mismatch.")

    if version == "HTTP/1.1" and seen != {"host"}:
        raise ProxyPolicyError("HTTP/1.1 CONNECT Host header required.")

    if version == "HTTP/1.0" and seen not in (set(), {"host"}):
        raise ProxyPolicyError("Invalid HTTP/1.0 CONNECT headers.")

    return hostname
