"""Bounded nonblocking TCP relay for a restricted HTTPS CONNECT proxy.

Destination validation and process-level network isolation are separate
requirements. This module does not start listeners or outbound connections.
"""

from __future__ import annotations

import selectors
import socket
import time

from python.security.proxy_policy import ProxyPolicyError


BUFFER_SIZE = 16384
MAX_TUNNEL_SECONDS = 120
MAX_TRANSFER_BYTES = 100 * 1024 * 1024
IDLE_TIMEOUT_SECONDS = 15


def relay_tunnel(
    client: socket.socket,
    upstream: socket.socket,
    *,
    max_seconds: int = MAX_TUNNEL_SECONDS,
    max_bytes: int = MAX_TRANSFER_BYTES,
) -> int:
    """Relay both directions with bounded buffers, time and byte limits."""

    if type(max_seconds) is not int or not 1 <= max_seconds <= 300:
        raise ProxyPolicyError("Invalid tunnel lifetime.")

    if type(max_bytes) is not int or not 1 <= max_bytes <= MAX_TRANSFER_BYTES:
        raise ProxyPolicyError("Invalid tunnel transfer limit.")

    if client is upstream:
        raise ProxyPolicyError("Tunnel sockets must be distinct.")

    sockets = (client, upstream)
    peers = {client: upstream, upstream: client}
    pending = {client: bytearray(), upstream: bytearray()}
    read_open = {client: True, upstream: True}
    write_open = {client: True, upstream: True}
    transferred = 0
    started = time.monotonic()
    last_progress = started

    try:
        for sock in sockets:
            sock.setblocking(False)

        with selectors.DefaultSelector() as selector:
            while True:
                now = time.monotonic()

                if now - started >= max_seconds:
                    raise ProxyPolicyError("Tunnel lifetime exceeded.")

                if now - last_progress >= IDLE_TIMEOUT_SECONDS:
                    raise ProxyPolicyError("Tunnel idle timeout.")

                for source in sockets:
                    destination = peers[source]

                    if not read_open[source] and not pending[destination]:
                        if write_open[destination]:
                            try:
                                destination.shutdown(socket.SHUT_WR)
                            except OSError:
                                pass
                            write_open[destination] = False

                if all(not read_open[s] for s in sockets) and all(
                    not pending[s] for s in sockets
                ):
                    return transferred

                for sock in sockets:
                    try:
                        selector.unregister(sock)
                    except KeyError:
                        pass

                    events = 0
                    destination = peers[sock]

                    if (
                        read_open[sock]
                        and write_open[destination]
                        and not pending[destination]
                    ):
                        events |= selectors.EVENT_READ

                    if pending[sock] and write_open[sock]:
                        events |= selectors.EVENT_WRITE

                    if events:
                        selector.register(sock, events)

                timeout = min(
                    max_seconds - (now - started),
                    IDLE_TIMEOUT_SECONDS - (now - last_progress),
                )

                ready = selector.select(max(0, timeout))

                if not ready:
                    continue

                for key, mask in ready:
                    sock = key.fileobj

                    if mask & selectors.EVENT_WRITE and pending[sock]:
                        try:
                            count = sock.send(pending[sock])
                        except (BlockingIOError, InterruptedError):
                            count = 0

                        if count < 0 or count > len(pending[sock]):
                            raise ProxyPolicyError("Invalid tunnel send result.")

                        if count:
                            del pending[sock][:count]
                            last_progress = time.monotonic()

                    if mask & selectors.EVENT_READ and read_open[sock]:
                        destination = peers[sock]

                        if pending[destination]:
                            continue

                        remaining = max_bytes - transferred

                        try:
                            chunk = sock.recv(min(BUFFER_SIZE, remaining + 1))
                        except (BlockingIOError, InterruptedError):
                            continue

                        if not chunk:
                            read_open[sock] = False
                            continue

                        if len(chunk) > remaining:
                            raise ProxyPolicyError(
                                "Tunnel transfer limit exceeded."
                            )

                        pending[destination].extend(chunk)
                        transferred += len(chunk)
                        last_progress = time.monotonic()

    finally:
        for sock in sockets:
            try:
                sock.setblocking(True)
            except OSError:
                pass
