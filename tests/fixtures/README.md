# Functional audit fixtures

These files contain only predictable synthetic content. Generate the complete corpus with:

```powershell
npm run generate-fixtures
```

The generator creates:

- simple, multi-page, image-only, password-protected (`Audit123!`), and ruled-table PDFs;
- raster/vector image formats, including AVIF/HEIF containers;
- OOXML and legacy-compatible document samples;
- structured data and source-code text samples;
- one-second synthetic video and audio clips generated with the project FFmpeg binary;
- a small ZIP and ebook/container samples.

Fixtures are intentionally tiny, contain no personal data, and should be regenerated after changing the manifest. `npm run test:audit-manifest` verifies that every active canonical target has a functional contract and that every configured fixture exists and is non-empty.

`documents/sample.vsd` and `documents/sample.vsdx` are small parser regression fixtures from the Apache Tika project, licensed under Apache-2.0:

- https://github.com/apache/tika/blob/main/tika-parsers/tika-parsers-standard/tika-parsers-standard-modules/tika-parser-microsoft-module/src/test/resources/test-documents/testVISIO.vsd
- https://github.com/apache/tika/blob/main/tika-parsers/tika-parsers-standard/tika-parsers-standard-modules/tika-parser-microsoft-module/src/test/resources/test-documents/testVISIO.vsdx

They are retained rather than regenerated because this project has no standards-compliant Visio writer dependency. The legacy PowerPoint fixture is generated through the installed Microsoft PowerPoint application on Windows; a valid committed OLE fixture is retained on other platforms.
