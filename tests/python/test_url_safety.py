import socket
import sys
import tempfile
import unittest
from io import BytesIO
from pathlib import Path
from types import ModuleType
from unittest.mock import patch

from PIL import Image

from python.engines.pdf_convert import PdfConvertEngine
from python.security.url_safety import UnsafeUrlError, validate_public_http_url


def resolver_for(*addresses):
    def resolve(_hostname, port, **_kwargs):
        results = []
        for address in addresses:
            family = socket.AF_INET6 if ":" in address else socket.AF_INET
            sockaddr = (address, port, 0, 0) if family == socket.AF_INET6 else (address, port)
            results.append((family, socket.SOCK_STREAM, socket.IPPROTO_TCP, "", sockaddr))
        return results

    return resolve


class UrlSafetyTests(unittest.TestCase):
    def assert_unsafe(self, url, resolver=resolver_for("93.184.216.34")):
        with self.assertRaises(UnsafeUrlError):
            validate_public_http_url(url, resolver=resolver)

    def test_public_https_and_http_destinations_are_accepted(self):
        self.assertEqual(
            validate_public_http_url(
                "https://example.test/path",
                resolver=resolver_for("93.184.216.34"),
            ),
            "https://example.test/path",
        )
        self.assertEqual(
            validate_public_http_url(
                "http://example.test/path",
                resolver=resolver_for("2606:4700:4700::1111"),
            ),
            "http://example.test/path",
        )

    def test_prohibited_schemes_and_credentials_are_rejected(self):
        self.assert_unsafe("file:///etc/passwd")
        self.assert_unsafe("ftp://example.test/file")
        self.assert_unsafe("https://user:password@example.test/")

    def test_localhost_loopback_private_and_link_local_are_rejected(self):
        destinations = [
            "http://localhost/",
            "http://service.localhost/",
            "http://127.0.0.1/",
            "http://[::1]/",
            "http://10.0.0.1/",
            "http://172.16.0.1/",
            "http://192.168.1.1/",
            "http://169.254.169.254/",
            "http://[fe80::1]/",
        ]
        for destination in destinations:
            with self.subTest(destination=destination):
                self.assert_unsafe(destination)

    def test_multicast_unspecified_and_reserved_are_rejected(self):
        destinations = [
            "http://0.0.0.0/",
            "http://224.0.0.1/",
            "http://240.0.0.1/",
            "http://192.0.2.1/",
            "http://[::]/",
            "http://[ff02::1]/",
            "http://[2001:db8::1]/",
        ]
        for destination in destinations:
            with self.subTest(destination=destination):
                self.assert_unsafe(destination)

    def test_hostname_resolving_to_private_address_is_rejected(self):
        self.assert_unsafe(
            "https://private.example.test/",
            resolver=resolver_for("10.1.2.3"),
        )

    def test_mixed_public_and_private_dns_answers_are_rejected(self):
        self.assert_unsafe(
            "https://mixed.example.test/",
            resolver=resolver_for("93.184.216.34", "192.168.1.10"),
        )

    def test_redirect_and_subresource_destinations_are_revalidated(self):
        self.assert_unsafe(
            "https://redirect-target.test/",
            resolver=resolver_for("127.0.0.1"),
        )
        self.assert_unsafe(
            "http://subresource.test/image.png",
            resolver=resolver_for("169.254.169.254"),
        )

    def test_converter_routes_redirects_and_subresources_through_validator(self):
        validated_urls = []
        routed_urls = [
            "https://public.example.test/",
            "https://redirect.example.test/",
            "http://private-subresource.test/image.png",
        ]
        aborted_urls = []

        def validate_for_browser(url):
            validated_urls.append(url)
            if "private-subresource" in url:
                raise UnsafeUrlError("non-public")
            return url

        class FakeRequest:
            def __init__(self, url):
                self.url = url

        class FakeRoute:
            def __init__(self, url):
                self.request = FakeRequest(url)

            def abort(self, _reason):
                aborted_urls.append(self.request.url)

            def continue_(self):
                return None

        class FakePage:
            url = "https://final.example.test/"

            def __init__(self, context):
                self.context = context

            def goto(self, _url, **_kwargs):
                for request_url in routed_urls:
                    self.context.route_handler(FakeRoute(request_url))

            def wait_for_load_state(self, *_args, **_kwargs):
                return None

            def wait_for_timeout(self, _timeout):
                return None

            def screenshot(self, **_kwargs):
                buffer = BytesIO()
                Image.new("RGB", (2, 2), "white").save(buffer, format="PNG")
                return buffer.getvalue()

            def close(self):
                return None

        class FakeContext:
            def set_default_timeout(self, _timeout):
                return None

            def set_default_navigation_timeout(self, _timeout):
                return None

            def route(self, _pattern, handler):
                self.route_handler = handler

            def route_web_socket(self, _pattern, handler):
                self.websocket_handler = handler

            def new_page(self):
                return FakePage(self)

            def close(self):
                return None

        class FakeBrowser:
            def new_context(self, **_kwargs):
                return FakeContext()

            def close(self):
                return None

        class FakeChromium:
            def launch(self):
                return FakeBrowser()

        class FakePlaywright:
            chromium = FakeChromium()

        class FakePlaywrightManager:
            def __enter__(self):
                return FakePlaywright()

            def __exit__(self, *_args):
                return None

        playwright_module = ModuleType("playwright")
        sync_api_module = ModuleType("playwright.sync_api")
        sync_api_module.TimeoutError = TimeoutError
        sync_api_module.sync_playwright = lambda: FakePlaywrightManager()
        playwright_module.sync_api = sync_api_module

        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "webpage.pdf"
            with patch.dict(
                sys.modules,
                {
                    "playwright": playwright_module,
                    "playwright.sync_api": sync_api_module,
                },
            ), patch(
                "python.security.url_safety.validate_public_http_url",
                side_effect=validate_for_browser,
            ):
                PdfConvertEngine.url_to_pdf(
                    [],
                    str(output),
                    {"url": "https://initial.example.test/"},
                )
            self.assertTrue(output.read_bytes().startswith(b"%PDF"))

        self.assertEqual(
            validated_urls,
            [
                "https://initial.example.test/",
                *routed_urls,
                "https://final.example.test/",
            ],
        )
        self.assertEqual(
            aborted_urls,
            ["http://private-subresource.test/image.png"],
        )


if __name__ == "__main__":
    unittest.main()
