import sys
import tempfile
import unittest
from pathlib import Path
from types import ModuleType
from unittest.mock import patch

from python.engines.pdf_convert import PdfConvertEngine


ROOT = Path(__file__).resolve().parents[2]
OLE_MSG_SIGNATURE = b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"


class FakeAttachment:
    def __init__(self, filename):
        self.longFilename = filename


class FakeMessage:
    subject = "Quarterly <Review>"
    sender = "Sender <sender@example.com>"
    to = "Recipient <recipient@example.com>"
    cc = "Copy <copy@example.com>"
    bcc = "Hidden <hidden@example.com>"
    date = "2026-07-28 10:30:00+00:00"
    htmlBody = (
        b"<html><body><p>Hello <strong>team</strong>.</p>"
        b"<form><span>Preserved form text</span></form>"
        b"<img src='http://127.0.0.1/private.png' alt='blocked image'>"
        b"<script>unsafe()</script></body></html>"
    )
    body = "Plain fallback must not replace the HTML body."
    attachments = [
        FakeAttachment("report.pdf"),
        FakeAttachment("notes & actions.txt"),
    ]

    def __init__(self):
        self.closed = False

    def close(self):
        self.closed = True


class OutlookToPdfTests(unittest.TestCase):
    def render_with_stubbed_pipeline(self, input_path, extract_message=None):
        captured = {}

        def convert_html(input_paths, output_path, options):
            self.assertEqual(options, {})
            html_path = Path(input_paths[0])
            captured["html"] = html_path.read_text(encoding="utf-8")
            Path(output_path).write_bytes(b"%PDF-1.7\nstub\n")
            return output_path

        extract_msg_module = ModuleType("extract_msg")
        if extract_message is not None:
            extract_msg_module.openMsg = lambda _path: extract_message

        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "message.pdf"
            with patch.dict(sys.modules, {"extract_msg": extract_msg_module}), patch.object(
                PdfConvertEngine,
                "document_to_pdf",
                side_effect=convert_html,
            ) as converter:
                result = PdfConvertEngine.outlook_to_pdf(
                    [str(input_path)],
                    str(output),
                    {},
                )
            self.assertEqual(result, str(output))
            self.assertTrue(output.read_bytes().startswith(b"%PDF-"))
            converter.assert_called_once()

        return captured["html"]

    def test_real_msg_metadata_html_and_attachment_names_are_rendered(self):
        message = FakeMessage()
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "message.msg"
            source.write_bytes(OLE_MSG_SIGNATURE + b"stub compound file")
            rendered = self.render_with_stubbed_pipeline(source, message)

        self.assertIn("Quarterly &lt;Review&gt;", rendered)
        self.assertIn("Sender &lt;sender@example.com&gt;", rendered)
        self.assertIn("Recipient &lt;recipient@example.com&gt;", rendered)
        self.assertIn("Copy &lt;copy@example.com&gt;", rendered)
        self.assertIn("Hidden &lt;hidden@example.com&gt;", rendered)
        self.assertIn("2026-07-28 10:30:00+00:00", rendered)
        self.assertIn("<strong>team</strong>", rendered)
        self.assertIn("Preserved form text", rendered)
        self.assertNotIn("Plain fallback must not replace", rendered)
        self.assertNotIn("<script", rendered)
        self.assertNotIn("127.0.0.1", rendered)
        self.assertIn("report.pdf", rendered)
        self.assertIn("notes &amp; actions.txt", rendered)
        self.assertTrue(message.closed)

    def test_text_body_is_used_when_html_is_unavailable(self):
        message = FakeMessage()
        message.htmlBody = None
        message.body = "First line\nSecond <line>"

        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "plain.msg"
            source.write_bytes(OLE_MSG_SIGNATURE + b"stub compound file")
            rendered = self.render_with_stubbed_pipeline(source, message)

        self.assertIn("First line<br>Second &lt;line&gt;", rendered)

    def test_existing_rfc822_style_msg_fixture_remains_supported(self):
        fixture = ROOT / "tests" / "fixtures" / "documents" / "sample.msg"
        rendered = self.render_with_stubbed_pipeline(fixture)

        self.assertIn("Audit fixture", rendered)
        self.assertIn("audit@example.invalid", rendered)
        self.assertIn("Predictable audit message.", rendered)
        self.assertIn("<li>None</li>", rendered)


if __name__ == "__main__":
    unittest.main()
