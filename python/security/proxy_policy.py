"""Destination validation for a future restricted YouTube proxy.

This module is a policy component, not a network security boundary.
The proxy must connect to a validated, pinned IP address.
The downloader must separately be prevented from bypassing the proxy.
"""

from __future__ import annotations

import ipaddress
import re
from urllib.parse import urlsplit

from python.security.url_safety import _is_public_address


class ProxyPolicyError(ValueError):
    """Raised when a proxy destination violates the security policy."""


ALLOWED_HOSTS = frozenset({
    "youtube.com",
    "www.youtube.com",
    "m.youtube.com",
    "youtu.be",
    "www.youtube-nocookie.com",
})

ALLOWED_SUFFIXES = frozenset({
    ".googlevideo.com",
    ".ytimg.com",
})

_HOST_LABEL = re.compile(
    r"[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\Z"
)


def normalize_hostname(hostname: str) -> str:
    """Normalize and validate a DNS hostname."""

    if not isinstance(hostname, str):
        raise ProxyPolicyError("Invalid destination hostname.")

    hostname = hostname.lower()

    if hostname.endswith("."):
        hostname = hostname[:-1]

    if not hostname or len(hostname) > 253:
        raise ProxyPolicyError("Invalid destination hostname.")

    if not hostname.isascii():
        raise ProxyPolicyError("Non-ASCII hostnames are not supported.")

    labels = hostname.split(".")

    if any(
        not label
        or len(label) > 63
        or _HOST_LABEL.fullmatch(label) is None
        for label in labels
    ):
        raise ProxyPolicyError("Malformed destination hostname.")

    try:
        ipaddress.ip_address(hostname)
    except ValueError:
        pass
    else:
        raise ProxyPolicyError("Literal IP hostnames are not allowed.")

    return hostname


def validate_proxy_hostname(hostname: str) -> str:
    """Require an explicitly permitted YouTube-related hostname."""

    hostname = normalize_hostname(hostname)

    if hostname in ALLOWED_HOSTS:
        return hostname

    if any(
        hostname.endswith(suffix)
        and len(hostname) > len(suffix)
        for suffix in ALLOWED_SUFFIXES
    ):
        return hostname

    raise ProxyPolicyError("Destination hostname is not allowed.")


def validate_proxy_destination(
    url: str,
    resolved_addresses: list[str] | tuple[str, ...],
) -> tuple[str, tuple[str, ...]]:
    """Validate an HTTPS URL and all supplied DNS answers.

    Returns the normalized hostname and validated IP addresses.
    This function does not resolve DNS or establish a connection.
    """

    if not isinstance(url, str) or len(url) > 4096:
        raise ProxyPolicyError("Invalid destination URL.")

    try:
        parsed = urlsplit(url)
        port = parsed.port
    except (TypeError, ValueError) as exc:
        raise ProxyPolicyError("Malformed destination URL.") from exc

    if parsed.scheme.lower() != "https":
        raise ProxyPolicyError("Only HTTPS destinations are allowed.")

    if parsed.username is not None or parsed.password is not None:
        raise ProxyPolicyError("Embedded credentials are not allowed.")

    if port not in (None, 443):
        raise ProxyPolicyError("Destination port is not allowed.")

    hostname = validate_proxy_hostname(parsed.hostname)

    if not isinstance(resolved_addresses, (list, tuple)):
        raise ProxyPolicyError("DNS addresses must be a list or tuple.")

    if not resolved_addresses:
        raise ProxyPolicyError("Destination has no DNS addresses.")

    if any(
        not isinstance(address, str)
        or not address
        or "%" in address
        for address in resolved_addresses
    ):
        raise ProxyPolicyError("Invalid DNS address value.")

    addresses = tuple(resolved_addresses)

    if any(not _is_public_address(address) for address in addresses):
        raise ProxyPolicyError("Non-public destination IP rejected.")

    return hostname, addresses