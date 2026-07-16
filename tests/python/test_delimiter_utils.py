import unittest

from python.engines.delimiter_utils import normalize_delimiter


class NormalizeDelimiterTests(unittest.TestCase):
    def test_semantic_delimiters(self):
        self.assertEqual(normalize_delimiter("comma"), ",")
        self.assertEqual(normalize_delimiter("semicolon"), ";")
        self.assertEqual(normalize_delimiter("tab"), "\t")
        self.assertEqual(normalize_delimiter("pipe"), "|")

    def test_direct_single_character_delimiter(self):
        self.assertEqual(normalize_delimiter(":"), ":")

    def test_invalid_multi_character_delimiter(self):
        with self.assertRaisesRegex(ValueError, "Unsupported delimiter"):
            normalize_delimiter("comma-separated")

    def test_empty_and_unsupported_names_are_rejected(self):
        with self.assertRaisesRegex(ValueError, "cannot be empty"):
            normalize_delimiter("")
        with self.assertRaisesRegex(ValueError, "Unsupported delimiter"):
            normalize_delimiter("colon")


if __name__ == "__main__":
    unittest.main()
