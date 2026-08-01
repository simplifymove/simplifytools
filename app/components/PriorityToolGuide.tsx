import Link from 'next/link';

type ToolId =
  | 'merge-pdf'
  | 'compress-pdf'
  | 'pdf-to-word'
  | 'compress-image'
  | 'resize-image'
  | 'remove-background'
  | 'jpg-to-png'
  | 'compress-video'
  | 'csv-to-json'
  | 'json-formatter';

interface Guide {
  title: string;
  intro: string;
  useHeading: string;
  uses: string[];
  steps: string[];
  technicalHeading: string;
  technical: string[];
  exampleHeading: string;
  example: string;
  limitationsHeading: string;
  limitations: string[];
  troubleshootingHeading: string;
  troubleshooting: string[];
  category: { label: string; href: string };
  related: Array<{ label: string; href: string; detail: string }>;
  guideLink?: { label: string; href: string };
  faqs: Array<{ question: string; answer: string }>;
}

const guides: Record<ToolId, Guide> = {
  'merge-pdf': {
    title: 'Combine PDFs without changing their page content',
    intro: 'Merge PDF appends complete PDF files in the order shown and produces one PDF. It is useful for assembling related documents, but it does not edit text, normalize page dimensions, or make separate documents share one visual layout.',
    useHeading: 'Good reasons to merge documents',
    uses: ['Put a cover letter, proposal, and appendix into one delivery file.', 'Join monthly statements in chronological order.', 'Bundle forms and supporting evidence while keeping every source page.'],
    steps: ['Add at least two PDF files, each no larger than 100 MB.', 'Check the file list carefully; the first file supplies the first pages in the result.', 'Run the merge, download the PDF, and review the transition between source documents.'],
    technicalHeading: 'What happens to pages',
    technical: ['The server appends pages with PyPDF2 and uses PyMuPDF as a fallback.', 'Portrait, landscape, A4, Letter, and other page sizes can coexist in the merged output.', 'Merging changes document structure and page order, not the visible contents of each source page.'],
    exampleHeading: 'Example: prepare one client handoff',
    example: 'Upload proposal.pdf first, pricing.pdf second, and terms.pdf third. The result contains every proposal page, followed by pricing, followed by terms. If pricing.pdf is landscape, those pages remain landscape.',
    limitationsHeading: 'What merging will not fix',
    limitations: ['It does not remove duplicate pages, repair corrupt PDFs, compress large scans, or make page sizes uniform.', 'Password-protected or malformed source files may fail to open.', 'Bookmarks, forms, attachments, and other advanced PDF features may not combine exactly as expected; inspect the result.'],
    troubleshootingHeading: 'If the merged PDF looks wrong',
    troubleshooting: ['Wrong order: add files again in the intended sequence.', 'Upload rejected: confirm every file is a non-empty PDF under 100 MB.', 'One source fails: open that PDF independently and re-save or repair it before merging.'],
    category: { label: 'PDF tools', href: '/all-tools/pdf-tools' },
    related: [
      { label: 'Split PDF', href: '/all-tools/pdf/split-pdf', detail: 'Extract or separate pages before combining files.' },
      { label: 'Compress PDF', href: '/all-tools/pdf/compress-pdf', detail: 'Try to reduce the merged file size.' },
      { label: 'Rearrange PDF', href: '/all-tools/pdf/rearrange-pdf', detail: 'Change page order within a document.' },
    ],
    faqs: [
      { question: 'How many PDFs are required?', answer: 'The tool requires at least two PDF files and accepts up to the shared server file-count limit of 50.' },
      { question: 'Does merging change the text or images?', answer: 'It appends source pages; it does not intentionally rewrite visible page content. Advanced PDF features can behave differently, so review the result.' },
      { question: 'Why are some pages different sizes?', answer: 'Each page keeps the dimensions defined by its source PDF. Merging does not resize A4, Letter, portrait, or landscape pages to one standard.' },
      { question: 'What is the file-size limit?', answer: 'Each uploaded PDF is validated against a 100 MB limit.' },
    ],
  },
  'compress-pdf': {
    title: 'Reduce PDF overhead and stream size where possible',
    intro: 'Compress PDF rewrites PDF streams and document objects using the selected low, medium, or high level. The amount saved depends on how the source was created; a PDF that is already optimized may become only slightly smaller.',
    useHeading: 'When a compression pass is worth trying',
    uses: ['Bring an attachment closer to an email or portal limit.', 'Remove avoidable object overhead from a repeatedly edited PDF.', 'Reduce storage used by reports while retaining the PDF page structure.'],
    steps: ['Upload one PDF up to 100 MB.', 'Start with Medium; compare Low or High only if the result is not suitable.', 'Download and verify text, images, links, forms, and file size before replacing the original.'],
    technicalHeading: 'Why compression results vary',
    technical: ['The primary engine compresses PDF streams and can generate object streams; High also removes unreferenced objects.', 'A fallback rewrites the PDF with deflate compression and level-dependent garbage collection.', 'Text-heavy files with redundant objects may shrink differently from image-heavy scans whose images are already compressed.'],
    exampleHeading: 'Example: an 18 MB scanned report',
    example: 'A report made mostly from JPEG scans may show limited reduction because those page images were compressed before they entered the PDF. High compression can clean document overhead, but this tool does not promise a target such as 5 MB.',
    limitationsHeading: 'Compression boundaries',
    limitations: ['No percentage reduction is guaranteed, and output can occasionally be similar in size or larger.', 'The current implementation does not expose resolution or grayscale controls for embedded images.', 'Encrypted, damaged, or unusual PDFs may fail or require a specialized editor.'],
    troubleshootingHeading: 'When the result is still too large',
    troubleshooting: ['Try High, then inspect the document rather than assuming it is unchanged.', 'For image-heavy PDFs, reduce source image dimensions before creating the PDF.', 'If a portal has a strict limit, split the document into accepted sections.'],
    category: { label: 'PDF tools', href: '/all-tools/pdf-tools' },
    related: [
      { label: 'Split PDF', href: '/all-tools/pdf/split-pdf', detail: 'Divide a document when compression is not enough.' },
      { label: 'Merge PDF', href: '/all-tools/pdf/merge-pdf', detail: 'Combine finalized sections into one file.' },
      { label: 'PDF to JPG', href: '/all-tools/pdf/pdf-to-jpg', detail: 'Render pages as images for a different workflow.' },
    ],
    faqs: [
      { question: 'Will High always create the smallest PDF?', answer: 'Not always. It applies more cleanup, but the source structure and already-compressed assets determine the final size.' },
      { question: 'Does compression lower image resolution?', answer: 'The verified implementation compresses streams and cleans document objects; it does not expose an image-resolution control or promise image downsampling.' },
      { question: 'Why did my PDF barely shrink?', answer: 'Scanned pages and previously optimized PDFs often contain little compressible overhead. JPEG images inside a PDF may already be compressed.' },
      { question: 'Can I upload a PDF larger than 100 MB?', answer: 'No. The shared PDF validator rejects individual files over 100 MB.' },
    ],
  },
  'pdf-to-word': {
    title: 'Turn PDF text into a best-effort DOCX',
    intro: 'PDF to Word reads each PDF page and writes extracted text into a DOCX document. It is intended for recovering editable wording, not reproducing a pixel-perfect Word layout from a fixed-layout PDF.',
    useHeading: 'Documents that convert most predictably',
    uses: ['Text-based reports with a straightforward reading order.', 'Archived letters whose wording needs revision.', 'Scans that need a first OCR pass before manual cleanup.'],
    steps: ['Upload one PDF up to 100 MB.', 'Run the conversion; pages with an embedded text layer use direct extraction.', 'Open the DOCX and correct headings, paragraph breaks, tables, images, and OCR mistakes.'],
    technicalHeading: 'Text extraction and OCR behavior',
    technical: ['The converter adds a Page N heading for each source page and turns extracted lines into Word paragraphs.', 'If a page has no extractable text, it renders that page and attempts English OCR with EasyOCR.', 'The current route does not offer an OCR language selector and does not reconstruct the original PDF layout.'],
    exampleHeading: 'Example: convert a five-page policy scan',
    example: 'Pages with searchable text become editable paragraphs. A scanned signature page may go through OCR; the signature image itself is not recreated as an editable signature, and recognized names may need correction.',
    limitationsHeading: 'Expect manual formatting work',
    limitations: ['Columns can be read in an unexpected order.', 'Tables, charts, images, footnotes, fonts, spacing, and page geometry are not faithfully reconstructed.', 'Handwriting, low-resolution scans, skew, shadows, and non-English text can reduce OCR accuracy.'],
    troubleshootingHeading: 'Improve a difficult conversion',
    troubleshooting: ['Confirm that searchable text can be selected in the PDF; if not, expect OCR.', 'Use a clearer, upright scan with adequate contrast.', 'For complex tables, use a table-extraction workflow instead of expecting Word to recreate the grid.'],
    category: { label: 'PDF tools', href: '/all-tools/pdf-tools' },
    related: [
      { label: 'PDF OCR', href: '/all-tools/pdf/pdf-ocr', detail: 'Create searchable text from scanned pages.' },
      { label: 'PDF to Text', href: '/all-tools/pdf/pdf-to-text', detail: 'Extract plain text without DOCX formatting.' },
      { label: 'Extract Tables', href: '/all-tools/pdf/extract-tables-from-pdf', detail: 'Use a workflow focused on tabular content.' },
    ],
    faqs: [
      { question: 'Will the DOCX look exactly like the PDF?', answer: 'No. The implementation prioritizes text extraction and writes paragraphs by page; complex visual layout is not reconstructed.' },
      { question: 'Can it read a scanned PDF?', answer: 'When a page has no extractable text, the converter attempts English OCR. Recognition quality depends on the scan.' },
      { question: 'Are tables and images preserved?', answer: 'Do not rely on that. Tables can lose structure, and the current conversion path does not rebuild source images and page geometry in Word.' },
      { question: 'What should I review after conversion?', answer: 'Check reading order, paragraph breaks, headings, tables, names, numbers, punctuation, and every OCR-derived passage.' },
    ],
  },
  'compress-image': {
    title: 'Change encoding quality without changing dimensions',
    intro: 'The image compressor redraws one image to a browser Canvas at its original pixel dimensions and asks the browser encoder to save it at the selected quality. It targets encoded file size; it does not resize width or height.',
    useHeading: 'Choose compression when dimensions are already correct',
    uses: ['Reduce a JPG attachment while keeping its current width and height.', 'Compare several quality settings before publishing a web image.', 'Trim storage used by a lossy image without cropping it.'],
    steps: ['Choose a supported browser-decodable image up to 50 MB.', 'Set quality and compress; start near 70% and inspect details rather than relying on one universal value.', 'Compare the displayed original and result sizes, then view the downloaded image at 100% zoom.'],
    technicalHeading: 'How format affects the slider',
    technical: ['Processing happens in the browser with FileReader, Image, Canvas, and canvas.toBlob.', 'The canvas keeps the source dimensions and requests the source MIME type.', 'Quality has a visible effect on lossy encoders such as JPEG and WebP; browsers can ignore the quality argument for PNG, so PNG size may change little.'],
    exampleHeading: 'Example: prepare a 2400 × 1600 JPG for email',
    example: 'Compressing at 70% keeps the image at 2400 × 1600 but re-encodes its pixels. Fine texture may soften and the result may be smaller. If the attachment is still too large, resize the dimensions as a separate step.',
    limitationsHeading: 'What this compressor cannot promise',
    limitations: ['It cannot guarantee a target byte size or reduction percentage.', 'Repeated lossy compression can introduce block artifacts, halos, or banding.', 'Animated images are drawn as a single canvas frame, and browser codec support varies.'],
    troubleshootingHeading: 'If compression is ineffective',
    troubleshooting: ['PNG barely changes: use resizing or a format suited to photographic content.', 'Result is larger: the source may already be optimized; keep the smaller original.', 'Image will not load: try a common JPG, PNG, or WebP that your browser can decode.'],
    category: { label: 'Image tools', href: '/all-tools/image-tools' },
    related: [
      { label: 'Resize Image', href: '/all-tools/resize-image', detail: 'Reduce pixel dimensions as well as potential file size.' },
      { label: 'JPG to PNG', href: '/all-tools/jpg-to-png', detail: 'Change the container to PNG when that format is required.' },
      { label: 'Batch Compress Images', href: '/all-tools/batch-compress-images', detail: 'Work through multiple images in one workflow.' },
    ],
    faqs: [
      { question: 'Does compression change image dimensions?', answer: 'No. This tool keeps the Canvas width and height equal to the source image and changes encoding quality.' },
      { question: 'Why does PNG show little reduction?', answer: 'The browser PNG encoder can ignore the quality setting because PNG is lossless. Resizing dimensions may have a larger effect.' },
      { question: 'Where does compression run?', answer: 'The compression step runs in your browser. Preparing the final download uses the site download-result workflow.' },
      { question: 'What is the maximum input size?', answer: 'The page validates image inputs against a 50 MB limit.' },
    ],
  },
  'resize-image': {
    title: 'Set exact pixel dimensions with optional aspect locking',
    intro: 'Image Resizer redraws one source image at the width and height you enter. With Maintain Aspect Ratio enabled, changing one dimension recalculates the other from the original proportions so circles and faces are not stretched.',
    useHeading: 'Practical sizing jobs',
    uses: ['Create a smaller web image for a known content-column width.', 'Make a square avatar by deliberately unlocking the aspect ratio.', 'Prepare a thumbnail while retaining the original file separately.'],
    steps: ['Upload an image up to 50 MB and note its detected pixel dimensions.', 'Leave aspect ratio enabled for proportional scaling, or disable it only when distortion is intentional.', 'Enter both output dimensions, resize, and inspect sharp edges and text before downloading.'],
    technicalHeading: 'Downscaling versus upscaling',
    technical: ['Canvas performs the resampling in the browser and re-encodes with the source MIME type at a requested quality of 0.9.', 'Downscaling discards pixels and is useful for web delivery.', 'Upscaling invents intermediate pixels; it increases dimensions but cannot restore detail absent from the source.'],
    exampleHeading: 'Example: adapt a 3000 × 2000 photo for a website',
    example: 'Set width to 1200 with aspect ratio enabled. Height becomes 800, preserving the original 3:2 shape. A 1200 × 600 target would require unlocking the ratio and would visibly squash the photo; cropping is usually better for that target.',
    limitationsHeading: 'Resolution and print caveats',
    limitations: ['Pixel dimensions alone do not establish physical print size or print quality; DPI and viewing distance also matter.', 'Large upscales can look soft or pixelated.', 'The tool processes one image at a time and does not crop to fit a different aspect ratio.'],
    troubleshootingHeading: 'Avoid stretched or blurry output',
    troubleshooting: ['Unexpected shape: enable Maintain Aspect Ratio and change only one dimension.', 'Need an exact different ratio: crop first instead of stretching.', 'Browser struggles: reduce the requested dimensions or use a smaller source file.'],
    category: { label: 'Image tools', href: '/all-tools/image-tools' },
    related: [
      { label: 'Crop Image', href: '/all-tools/crop-image', detail: 'Change composition or aspect ratio without stretching.' },
      { label: 'Compress Image', href: '/all-tools/compress-image', detail: 'Tune encoding after dimensions are correct.' },
      { label: 'Batch Resize Images', href: '/all-tools/batch-resize-images', detail: 'Apply a shared size workflow to multiple files.' },
    ],
    faqs: [
      { question: 'What does Maintain Aspect Ratio do?', answer: 'It calculates the other dimension from the original width-to-height ratio whenever you change width or height.' },
      { question: 'Will making an image larger improve it?', answer: 'No. Upscaling adds pixels through interpolation but cannot recover detail that was not present in the source.' },
      { question: 'Should I resize or crop for a banner?', answer: 'Crop when the target has a different aspect ratio. Resizing to a mismatched ratio stretches the picture.' },
      { question: 'Does this tool run in the browser?', answer: 'Yes. The resize operation uses browser Canvas; the result then enters the download-result workflow when you download it.' },
    ],
  },
  'remove-background': {
    title: 'Create a cutout with model-generated edges',
    intro: 'Remove Background uploads a JPEG, PNG, or WebP image to a server model that estimates foreground and background. Standard mode uses U2Net; HQ mode uses BiRefNet General and can take longer.',
    useHeading: 'Subjects that usually give the model a clear signal',
    uses: ['A product photographed against a contrasting surface.', 'A profile image where the person is visually distinct from the background.', 'A simple object cutout for a presentation or catalog draft.'],
    steps: ['Upload a JPEG, PNG, or WebP no larger than 20 MB.', 'Try Standard first; use HQ when the edge needs another pass.', 'Choose PNG or WebP to retain transparency, or JPG to place the cutout on white.', 'Zoom into edges before downloading.'],
    technicalHeading: 'Output and model behavior',
    technical: ['The server runs rembg with U2Net or BiRefNet General and initially creates an RGBA PNG.', 'PNG keeps alpha transparency; WebP is encoded with quality 85; JPG is flattened onto white at quality 90.', 'Temporary model input, output, and script files are deleted in the request cleanup path.'],
    exampleHeading: 'Example: isolate a dark shoe on a light table',
    example: 'Standard mode may create a usable product cutout because the boundary is distinct. Choose PNG for a transparent catalog layer. If a pale shoelace blends into the table, HQ may improve it, but the missing edge can still require manual masking.',
    limitationsHeading: 'Edges that remain difficult',
    limitations: ['Hair, fur, smoke, glass, translucent fabric, motion blur, and fine spokes are hard segmentation cases.', 'Foreground and background with similar colors can produce missing or extra regions.', 'The tool has no manual brush or edge-refinement controls, and model output is not guaranteed to be exact.'],
    troubleshootingHeading: 'Get a cleaner cutout',
    troubleshooting: ['Use an image with stronger lighting and foreground/background contrast.', 'Try HQ mode once; if the same region fails, use an editor with a manual mask.', 'Transparency missing: choose PNG or WebP, because JPG is intentionally flattened to white.'],
    category: { label: 'Image tools', href: '/all-tools/image-tools' },
    related: [
      { label: 'Crop Image', href: '/all-tools/crop-image', detail: 'Tighten composition before or after creating a cutout.' },
      { label: 'Resize Image', href: '/all-tools/resize-image', detail: 'Set final cutout dimensions.' },
      { label: 'Compress Image', href: '/all-tools/compress-image', detail: 'Reduce delivery size after checking edges.' },
    ],
    faqs: [
      { question: 'Which formats can I upload?', answer: 'The server validates JPEG, PNG, and WebP input and enforces a 20 MB maximum.' },
      { question: 'Which output keeps transparency?', answer: 'Choose PNG or WebP. JPG cannot carry alpha transparency and is flattened onto a white background.' },
      { question: 'What is the difference between Standard and HQ?', answer: 'Standard uses U2Net. HQ uses BiRefNet General, which is a larger model and may take longer; neither guarantees a perfect edge.' },
      { question: 'Why did hair or glass disappear?', answer: 'Fine and translucent boundaries contain mixed foreground/background information, which segmentation models can classify incorrectly.' },
    ],
  },
  'jpg-to-png': {
    title: 'Re-encode a JPEG as PNG without inventing missing detail',
    intro: 'JPG to PNG decodes one JPEG in the browser, draws it to Canvas, and exports a PNG at the same dimensions. The new PNG avoids additional JPEG loss on later PNG saves, but it cannot undo artifacts already present in the JPG.',
    useHeading: 'When PNG is the required next format',
    uses: ['A design or publishing workflow specifically requires a PNG file.', 'You plan to add transparency later in an editor.', 'A screenshot-like image must be saved in a lossless container after starting from JPG.'],
    steps: ['Upload a JPG/JPEG up to 50 MB.', 'Review the decoded preview and convert it to PNG.', 'Download the result and compare file size and visible artifacts with the original.'],
    technicalHeading: 'Quality, transparency, and size',
    technical: ['The browser Canvas exports image/png at the source width and height.', 'Every JPG pixel is opaque, so conversion alone does not create a transparent background.', 'PNG lossless compression often produces a larger file for photographic content than the original lossy JPG.'],
    exampleHeading: 'Example: a 1600 × 900 product photo',
    example: 'The PNG remains 1600 × 900 and looks much like the decoded JPG, including existing block artifacts. It may be several times larger. To make the background transparent, run a background-removal or editing step after conversion.',
    limitationsHeading: 'Conversion is not restoration',
    limitations: ['Lost JPEG detail, color information, and sharpness cannot be reconstructed.', 'A PNG output does not automatically gain transparency.', 'Animated content is not created, and very large images can stress browser memory.'],
    troubleshootingHeading: 'Common surprises',
    troubleshooting: ['PNG is larger: that is normal for many photos; use JPG or WebP when small photographic files matter.', 'Background is still white: conversion changes format, not subject segmentation.', 'Upload fails: confirm the file is a decodable JPG/JPEG and under 50 MB.'],
    category: { label: 'Image tools', href: '/all-tools/image-tools' },
    related: [
      { label: 'Remove Background', href: '/all-tools/remove-background', detail: 'Create transparency rather than only changing format.' },
      { label: 'Compress Image', href: '/all-tools/compress-image', detail: 'Compare delivery size after conversion.' },
      { label: 'PNG to JPG', href: '/all-tools/png-to-jpg', detail: 'Return to a smaller photographic format when transparency is unnecessary.' },
    ],
    guideLink: { label: 'Read the JPG-to-PNG format guide', href: '/blog/jpg-to-png-conversion-guide' },
    faqs: [
      { question: 'Does PNG improve a JPG image?', answer: 'No. It prevents another lossy PNG save, but it cannot restore detail already discarded by JPEG compression.' },
      { question: 'Will the converted PNG be transparent?', answer: 'No. JPG has no alpha channel, so all decoded pixels are opaque. Transparency requires a separate editing or background-removal step.' },
      { question: 'Why is the PNG larger?', answer: 'PNG uses lossless compression, which is often less compact than JPEG for photographs and continuous-tone images.' },
      { question: 'Where does conversion happen?', answer: 'The JPG decode and PNG encode run in browser Canvas. Preparing the download uses the site download-result workflow.' },
    ],
  },
  'compress-video': {
    title: 'Balance video size, encoding time, and visible quality',
    intro: 'Compress Video uploads one MP4, MOV, AVI, or MKV and creates an MP4 with H.264 video and AAC audio. The Compression Level changes encoding speed and target bitrate; the CRF control adjusts visual quality, where lower values retain more detail and usually create larger files.',
    useHeading: 'Useful delivery scenarios',
    uses: ['Reduce a clip before attaching it to a message.', 'Prepare a smaller review copy for an upload portal.', 'Transcode a supported source into a broadly playable MP4.'],
    steps: ['Upload one supported video no larger than 500 MB.', 'Choose Low, Medium, or High compression and set CRF from 0 to 51.', 'Process the file, then compare duration, motion detail, audio, and file size with the source.'],
    technicalHeading: 'What the two controls change',
    technical: ['Low uses a faster preset and higher target video bitrate; High uses a slower preset and lower target bitrate.', 'CRF runs from 0 to 51: lower is higher fidelity and larger output; higher is more aggressive and can show artifacts.', 'Audio is encoded as AAC at 96 kb/s. Resolution is not exposed as a control on this page.'],
    exampleHeading: 'Example: shrink a 1080p screen recording for review',
    example: 'Try Medium with the default quality first. Static slides may compress well, while small interface text and rapid cursor movement can blur. If text is hard to read, lower CRF; if the file is still too large, raise CRF or try High compression.',
    limitationsHeading: 'Why final size is unpredictable',
    limitations: ['Duration, resolution, frame rate, source codec, motion, grain, and existing bitrate all affect the result.', 'An already efficient source can shrink little, and a very aggressive setting can damage text or motion detail.', 'Processing is limited by a 60-second API duration and can time out for demanding files even below 500 MB.'],
    troubleshootingHeading: 'Tune a failed or poor result',
    troubleshooting: ['Output looks blocky: lower CRF or choose a less aggressive compression level.', 'Output is too large: raise CRF gradually and compare again.', 'Request times out: trim the clip first or use a shorter/lower-resolution source.'],
    category: { label: 'Video tools', href: '/all-tools/video-tools' },
    related: [
      { label: 'Trim Video', href: '/all-tools/video/trim-video', detail: 'Remove unneeded duration before compression.' },
      { label: 'Resize Video', href: '/all-tools/video/resize-video', detail: 'Change resolution in a separate workflow.' },
      { label: 'Extract Audio', href: '/all-tools/video/extract-audio-from-video', detail: 'Keep only the audio track when video is unnecessary.' },
    ],
    faqs: [
      { question: 'Which input formats are accepted?', answer: 'The tool accepts MP4, MOV, AVI, and MKV files and produces MP4 output.' },
      { question: 'What does a lower CRF mean?', answer: 'Lower CRF retains more visual detail and normally creates a larger file. Higher CRF is more aggressive and can introduce artifacts.' },
      { question: 'Can I choose output resolution?', answer: 'No. This page exposes Compression Level and CRF, not a resolution setting. Use Resize Video for dimension changes.' },
      { question: 'Why did two videos compress differently?', answer: 'Sources differ in duration, resolution, motion, grain, codec, and bitrate, so the same settings do not produce the same reduction.' },
    ],
  },
  'csv-to-json': {
    title: 'Convert tabular CSV rows into a JSON array',
    intro: 'CSV to JSON treats the first CSV row as column headers and converts each following row into one JSON object. The current processing engine writes an array of row objects with two-space indentation.',
    useHeading: 'Where row-oriented JSON helps',
    uses: ['Prepare spreadsheet exports for an API import.', 'Inspect CSV records as named JSON fields.', 'Move a flat table into a JavaScript-friendly exchange format.'],
    steps: ['Upload one .csv file up to 100 MB.', 'Choose the delimiter actually used by the file: comma, semicolon, tab, or pipe.', 'Convert, then inspect header names, inferred values, missing fields, and row count before using the JSON.'],
    technicalHeading: 'Parsing rules to check',
    technical: ['The server uses pandas read_csv with the chosen single-character delimiter.', 'Column names come from the header row; duplicate or blank headers can be renamed or interpreted unexpectedly.', 'Pandas infers types, so identifiers with leading zeroes, dates, booleans, and empty values may not retain the representation you expect.'],
    exampleHeading: 'Worked example: two inventory rows',
    example: 'CSV input `sku,stock\n0012,7\n0013,0` becomes an array with one object per row. Because type inference can treat sku as a number, the leading zeroes may be lost; review identifier columns before importing the JSON.',
    limitationsHeading: 'Flat data stays flat',
    limitations: ['CSV has no native nested objects or arrays, so the converter does not invent nested JSON.', 'Malformed quoting, inconsistent field counts, or the wrong delimiter can stop parsing or shift columns.', 'The verified engine expects text readable by pandas and writes UTF-8 JSON; non-UTF-8 source encodings can fail.'],
    troubleshootingHeading: 'Diagnose a malformed conversion',
    troubleshooting: ['One giant column: select the correct delimiter.', 'Rows shifted: inspect embedded delimiter characters and make sure fields are correctly quoted.', 'Leading zeroes changed: normalize identifier columns after conversion or prepare them as text before upload.'],
    category: { label: 'Data tools', href: '/all-tools/data' },
    related: [
      { label: 'JSON Formatter', href: '/all-tools/code-tools/json-formatter', detail: 'Validate and re-indent the generated JSON.' },
      { label: 'CSV to XML', href: '/all-tools/data/csv-to-xml', detail: 'Use XML as the target format instead.' },
      { label: 'CSV to Excel', href: '/all-tools/data/csv-to-excel', detail: 'Move CSV into a spreadsheet workbook.' },
    ],
    faqs: [
      { question: 'Does the first row become data?', answer: 'No. The parser uses the first row as column headers, and subsequent rows become JSON objects.' },
      { question: 'Can I choose a semicolon or tab delimiter?', answer: 'Yes. The page offers comma, semicolon, tab, and pipe choices.' },
      { question: 'Will all values remain strings?', answer: 'Not necessarily. Pandas infers column types, which can change numeric-looking identifiers, booleans, dates, and missing values.' },
      { question: 'Can it create nested JSON?', answer: 'No. The current converter produces a flat array of row objects based on CSV columns.' },
    ],
  },
  'json-formatter': {
    title: 'Parse valid JSON and rewrite its indentation',
    intro: 'JSON Formatter sends the pasted text to the tool service, parses it as JSON, and serializes the same values with the selected indentation. Formatting changes whitespace and line breaks; it does not rename keys, sort fields, or transform values.',
    useHeading: 'Use formatting to inspect structure',
    uses: ['Expand a minified API response for debugging.', 'Check whether copied configuration is valid JSON.', 'Make nested objects and arrays easier to review in a code diff.'],
    steps: ['Paste JSON without passwords, tokens, private keys, or sensitive records.', 'Choose an indentation size; 2 spaces is the default.', 'Format the input, review any parse error, then copy or download the result.'],
    technicalHeading: 'JSON rules enforced by the parser',
    technical: ['Object keys and string values require double quotes.', 'Trailing commas, comments, single-quoted strings, undefined, and unquoted keys are invalid JSON.', 'The server uses JSON.parse followed by JSON.stringify with the requested indent.'],
    exampleHeading: 'Example: expose a nested API response',
    example: 'Input `{"user":{"id":42,"active":true},"roles":["editor"]}` becomes multiple indented lines. The number 42 remains a number, true remains a boolean, and array order is unchanged.',
    limitationsHeading: 'Formatting is not validation of meaning',
    limitations: ['Syntactically valid JSON can still violate an API schema or contain incorrect data.', 'The formatter does not repair malformed JSON automatically.', 'Very large input can exceed browser, request, or server processing limits.'],
    troubleshootingHeading: 'Fix common parse errors',
    troubleshooting: ['Unexpected token near a key: replace single quotes with double quotes and quote the key.', 'Error near a closing bracket: remove a trailing comma or find a missing value.', 'Unexpected end of input: close every object brace and array bracket.'],
    category: { label: 'Code tools', href: '/all-tools/code-tools' },
    related: [
      { label: 'JSON Validator', href: '/all-tools/code-tools/json-validator', detail: 'Focus on syntax validity and validation feedback.' },
      { label: 'JSON to CSV', href: '/all-tools/code-tools/json-to-csv', detail: 'Convert suitable JSON records into tabular data.' },
      { label: 'CSV to JSON', href: '/all-tools/data/csv-to-json', detail: 'Create JSON row objects from a CSV file.' },
    ],
    faqs: [
      { question: 'Does formatting change JSON values?', answer: 'No. It parses and serializes the same JSON-compatible values while changing whitespace and indentation.' },
      { question: 'Why are comments rejected?', answer: 'Comments are not part of the JSON standard accepted by JSON.parse.' },
      { question: 'Can it repair invalid JSON?', answer: 'No. Correct quotes, commas, brackets, and values in the input, then run the formatter again.' },
      { question: 'Is the JSON processed in my browser?', answer: 'No. The page sends input to the server-side code-tool API. Do not submit secrets or sensitive records.' },
    ],
  },
};

export function PriorityToolGuide({ toolId }: { toolId: ToolId }) {
  const guide = guides[toolId];
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <section className="border-t border-gray-200 bg-white px-4 py-14 md:px-8" data-priority-tool-guide={toolId}>
      <div className="mx-auto max-w-5xl space-y-12">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{guide.title}</h2>
          <p className="mt-4 text-lg leading-8 text-gray-700">{guide.intro}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{guide.useHeading}</h2>
            <ul className="mt-4 space-y-3 text-gray-700">{guide.uses.map((item) => <li key={item} className="flex gap-3"><span className="text-orange-600">•</span><span>{item}</span></li>)}</ul>
          </div>
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-6">
            <h2 className="text-2xl font-bold text-gray-900">How to use this tool</h2>
            <ol className="mt-4 space-y-3 text-gray-700">{guide.steps.map((step, index) => <li key={step} className="flex gap-3"><span className="font-bold text-orange-700">{index + 1}.</span><span>{step}</span></li>)}</ol>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">{guide.technicalHeading}</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-3">{guide.technical.map((item) => <li key={item} className="rounded-lg border border-gray-200 bg-gray-50 p-4 leading-7 text-gray-700">{item}</li>)}</ul>
        </div>

        <div className="rounded-xl border-l-4 border-blue-600 bg-blue-50 p-6">
          <h2 className="text-2xl font-bold text-gray-900">{guide.exampleHeading}</h2>
          <p className="mt-3 leading-7 text-gray-700">{guide.example}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{guide.limitationsHeading}</h2>
            <ul className="mt-4 space-y-3 text-gray-700">{guide.limitations.map((item) => <li key={item} className="flex gap-3"><span aria-hidden="true">—</span><span>{item}</span></li>)}</ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{guide.troubleshootingHeading}</h2>
            <ul className="mt-4 space-y-3 text-gray-700">{guide.troubleshooting.map((item) => <li key={item} className="flex gap-3"><span aria-hidden="true">→</span><span>{item}</span></li>)}</ul>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">Continue the workflow</h2>
          <p className="mt-3 text-gray-700">Return to <Link href={guide.category.href} className="font-semibold text-orange-700 underline">{guide.category.label}</Link>, or continue with a complementary tool:</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">{guide.related.map((item) => <Link key={item.href} href={item.href} className="rounded-lg border border-gray-200 p-4 hover:border-orange-500"><span className="font-semibold text-gray-900">{item.label}</span><span className="mt-1 block text-sm leading-6 text-gray-600">{item.detail}</span></Link>)}</div>
          {guide.guideLink && <p className="mt-5"><Link href={guide.guideLink.href} className="font-semibold text-blue-700 underline">{guide.guideLink.label}</Link></p>}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">Questions about this specific tool</h2>
          <div className="mt-5 space-y-3">{guide.faqs.map((faq) => <details key={faq.question} className="rounded-lg border border-gray-200 p-4"><summary className="cursor-pointer font-semibold text-gray-900">{faq.question}</summary><p className="mt-3 leading-7 text-gray-700">{faq.answer}</p></details>)}</div>
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </section>
  );
}

export type { ToolId as PriorityToolId };
