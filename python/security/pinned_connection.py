"""HTTPS connection helper for a future restricted downloader proxy.

The caller must provide a hostname and a previously validated IP address.
This helper connects to the supplied IP without performing another DNS lookup.

This module does not provide process-level network isolation or an HTTP proxy.
"""

from __future__ import annotations

import ipaddress
import socket
import ssl

from python.security.proxy_policy import (
    ProxyPolicyError,
    validate_proxy_destination,
)


def create_pinned_tls_connection(
    hostname: str,
    address: str,
    port: int = 443,
    timeout: float = 10.0,
) -> ssl.SSLSocket:
    """Connect to a validated IP using the original hostname for TLS."""

    if type(port) is not int or port != 443:
        raise ProxyPolicyError("Only HTTPS port 443 is allowed.")

    if isinstance(timeout, bool) or not isinstance(timeout, (int, float)):
        raise ProxyPolicyError("Invalid connection timeout.")

    if not 0 < timeout <= 60:
        raise ProxyPolicyError("Connection timeout is out of range.")

    validated_host, addresses = validate_proxy_destination(
        f"https://{hostname}:443/",
        [address],
    )

    pinned_address = addresses[0]

    try:
        ipaddress.ip_address(pinned_address)
    except ValueError as exc:
        raise ProxyPolicyError("Invalid pinned IP address.") from exc

    raw_socket = None

    try:
        # Connect to the validated IP, never the hostname.
        raw_socket = socket.create_connection(
            (pinned_address, port),
            timeout=timeout,
        )

        context = ssl.create_default_context()

        # TLS SNI and certificate verification use the original hostname.
        secure_socket = context.wrap_socket(
            raw_socket,
            server_hostname=validated_host,
        )

        return secure_socket

    except Exception:
        if raw_socket is not None:
            raw_socket.close()
        raise