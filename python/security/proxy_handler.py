"""Single-request CONNECT handler for a future restricted HTTPS proxy.

Not a server or network isolation boundary. Only a trusted, access-controlled
listener running under an enforced deployment security policy may invoke it.
"""

from __future__ import annotations

import ipaddress
import socket
import time

from python.security.proxy_policy import ProxyPolicyError
from python.security.proxy_request import MAX_REQUEST_BYTES, parse_connect_request
from python.security.proxy_resolver import resolve_validated_destination, resolve_dns_with_deadline
from python.security.proxy_tunnel import relay_tunnel


REQUEST_TIMEOUT_SECONDS = 10
CONNECT_TIMEOUT_SECONDS = 10


def handle_connect(client: socket.socket) -> int:
    """Handle one CONNECT request and return the number of relayed bytes."""

    upstream = None

    try:
        deadline = time.monotonic() + REQUEST_TIMEOUT_SECONDS

        request = bytearray()

        while not request.endswith(b"\r\n\r\n"):
            remaining = deadline - time.monotonic()

            if remaining <= 0:
                raise ProxyPolicyError("CONNECT request deadline exceeded.")

            client.settimeout(remaining)
            if len(request) >= MAX_REQUEST_BYTES:
                raise ProxyPolicyError("Proxy request too large.")

            chunk = client.recv(min(4096, MAX_REQUEST_BYTES - len(request)))

            if not chunk:
                raise ProxyPolicyError("Incomplete proxy request.")

            request.extend(chunk)

            if time.monotonic() >= deadline:
                raise ProxyPolicyError("CONNECT request deadline exceeded.")

            # Reject any bytes beyond the HTTP header terminator.
            terminator = request.find(b"\r\n\r\n")

            if terminator >= 0 and terminator + 4 != len(request):
                raise ProxyPolicyError("Unexpected data after CONNECT headers.")

        hostname = parse_connect_request(bytes(request))

        validated_hostname, address = resolve_validated_destination(
            f"https://{hostname}:443/",
            resolver=resolve_dns_with_deadline,
        )

        # Defense in depth: connect only to the validated IP literal.
        ipaddress.ip_address(address)

        upstream = socket.create_connection(
            (address, 443),
            timeout=CONNECT_TIMEOUT_SECONDS,
        )

        # The client performs its own TLS handshake and certificate validation.
        client.sendall(b"HTTP/1.1 200 Connection Established\r\n\r\n")

        client.settimeout(None)
        upstream.settimeout(None)

        return relay_tunnel(client, upstream)

    finally:
        if upstream is not None:
            upstream.close()
