"""Public HTTP(S) URL validation for server-side browser conversions."""

from __future__ import annotations

import ipaddress
import re
import socket
from typing import Callable, Iterable, Sequence
from urllib.parse import SplitResult, parse_qs, urlsplit


class UnsafeUrlError(ValueError):
    """Raised when a URL could access a non-public destination."""


AddressResolver = Callable[..., Sequence[tuple]]


def _parse_url(raw_url: str) -> SplitResult:
    try:
        parsed = urlsplit(raw_url)
        _ = parsed.port
    except (TypeError, ValueError) as exc:
        raise UnsafeUrlError("Invalid URL.") from exc

    if parsed.scheme.lower() not in {"http", "https"}:
        raise UnsafeUrlError("Only HTTP and HTTPS URLs are allowed.")
    if parsed.username is not None or parsed.password is not None:
        raise UnsafeUrlError("URLs containing embedded credentials are not allowed.")
    if not parsed.hostname:
        raise UnsafeUrlError("The URL must include a hostname.")
    return parsed


def _is_public_address(address: str) -> bool:
    try:
        ip = ipaddress.ip_address(address.split("%", 1)[0])
    except ValueError:
        return False

    if isinstance(ip, ipaddress.IPv6Address) and ip.ipv4_mapped is not None:
        ip = ip.ipv4_mapped
    return (
        ip.is_global
        and not ip.is_multicast
        and not ip.is_unspecified
        and not ip.is_reserved
        and not ip.is_loopback
        and not ip.is_link_local
        and not ip.is_private
    )


def _resolved_addresses(
    hostname: str,
    port: int,
    resolver: AddressResolver,
) -> Iterable[str]:
    try:
        results = resolver(hostname, port, type=socket.SOCK_STREAM)
    except OSError as exc:
        raise UnsafeUrlError("The URL hostname could not be resolved.") from exc

    seen: set[str] = set()
    for result in results:
        try:
            address = result[4][0]
        except (IndexError, TypeError):
            continue
        if address not in seen:
            seen.add(address)
            yield address


def validate_public_http_url(
    raw_url: str,
    resolver: AddressResolver = socket.getaddrinfo,
) -> str:
    """Validate that every address for an HTTP(S) URL is globally routable."""

    parsed = _parse_url(raw_url)
    hostname = parsed.hostname.rstrip(".").lower()
    if hostname == "localhost" or hostname.endswith(".localhost"):
        raise UnsafeUrlError("Localhost destinations are not allowed.")
    if "%" in hostname:
        raise UnsafeUrlError("Scoped IP addresses are not allowed.")

    try:
        literal = ipaddress.ip_address(hostname)
    except ValueError:
        literal = None

    if literal is not None:
        if not _is_public_address(str(literal)):
            raise UnsafeUrlError("The URL resolves to a non-public network address.")
        return raw_url

    port = parsed.port or (443 if parsed.scheme.lower() == "https" else 80)
    addresses = list(_resolved_addresses(hostname, port, resolver))
    if not addresses:
        raise UnsafeUrlError("The URL hostname did not resolve to an address.")
    if any(not _is_public_address(address) for address in addresses):
        raise UnsafeUrlError("The URL resolves to a non-public network address.")
    return raw_url

def validate_youtube_video_url(raw_url: str) -> str:
    """Validate and canonicalize a supported YouTube video URL.

    This performs structural validation only. Downloaders must
    separately enforce network and redirect safety.
    """
    if not isinstance(raw_url, str) or len(raw_url) > 2048:
        raise UnsafeUrlError("Invalid YouTube URL.")

    parsed = _parse_url(raw_url)
    hostname = parsed.hostname.rstrip(".").lower()

    if parsed.scheme.lower() != "https":
        raise UnsafeUrlError("YouTube URLs must use HTTPS.")

    if parsed.port not in (None, 443):
        raise UnsafeUrlError("Unsupported YouTube URL port.")

    if parsed.fragment:
        raise UnsafeUrlError("YouTube URL fragments are not supported.")

    if hostname in {"youtube.com", "www.youtube.com", "m.youtube.com"}:
        if parsed.path == "/watch":
            values = parse_qs(parsed.query, keep_blank_values=True)
            video_ids = values.get("v", [])

            if len(video_ids) != 1:
                raise UnsafeUrlError("A single YouTube video ID is required.")

            video_id = video_ids[0]
        else:
            match = re.fullmatch(
                r"/(?:shorts|live|embed)/([A-Za-z0-9_-]{11})/?",
                parsed.path,
            )

            if not match:
                raise UnsafeUrlError("Unsupported YouTube video URL.")

            video_id = match.group(1)

    elif hostname == "youtu.be":
        match = re.fullmatch(
            r"/([A-Za-z0-9_-]{11})/?",
            parsed.path,
        )

        if not match:
            raise UnsafeUrlError("Unsupported YouTube short URL.")

        video_id = match.group(1)

    else:
        raise UnsafeUrlError("Only YouTube video URLs are supported.")

    if not re.fullmatch(r"[A-Za-z0-9_-]{11}", video_id):
        raise UnsafeUrlError("Invalid YouTube video ID.")

    return f"https://www.youtube.com/watch?v={video_id}"
