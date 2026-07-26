import csv
import tempfile
import unittest
from pathlib import Path

from python.engines.pdf_edit import PdfEditEngine
from python.engines.pdf_security import PdfSecurityEngine
from python.pdf_router import PdfRouter


ROOT = Path(__file__).resolve().parents[2]


class PdfRegressionTests(unittest.TestCase):
    def test_pdf_to_csv_extracts_table_as_text_csv(self):
        source = ROOT / "tests" / "fixtures" / "pdf" / "table.pdf"
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "table.csv"
            PdfRouter.process("pdf-to-csv", [str(source)], str(output), {})
            self.assertFalse(output.read_bytes().startswith(b"PK"))
            with output.open(newline="", encoding="utf-8") as handle:
                self.assertEqual(
                    list(csv.reader(handle)),
                    [["Name", "Amount"], ["Alpha", "10"], ["Beta", "20"]],
                )

    def test_watermark_legacy_all_uses_safe_default(self):
        source = ROOT / "tests" / "fixtures" / "pdf" / "simple.pdf"
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "watermark-removed.pdf"
            PdfSecurityEngine.remove_watermark(
                [str(source)],
                str(output),
                {"method": "all", "sensitivity": "medium"},
            )
            self.assertTrue(output.read_bytes().startswith(b"%PDF-"))

    def test_add_text_backend_inserts_requested_text(self):
        import fitz

        source = ROOT / "tests" / "fixtures" / "pdf" / "simple.pdf"
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "add-text.pdf"
            PdfEditEngine.add_text(
                [str(source)],
                str(output),
                {
                    "text": "Audit added text",
                    "pageNumber": 1,
                    "x": 50,
                    "y": 100,
                    "fontSize": 12,
                    "color": "0,0,0",
                },
            )
            with fitz.open(output) as document:
                self.assertIn("Audit added text", document[0].get_text())


if __name__ == "__main__":
    unittest.main()
