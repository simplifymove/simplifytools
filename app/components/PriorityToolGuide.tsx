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
  | 'json-formatter'
  | 'split-pdf'
  | 'pdf-to-jpg'
  | 'png-to-jpg'
  | 'webp-to-jpg'
  | 'crop-image'
  | 'trim-video'
  | 'resize-video'
  | 'excel-to-csv'
  | 'json-to-xml'
  | 'json-validator';

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
    guideLink: { label: 'Compare merging, splitting, compression, OCR, and PDF-to-Word workflows', href: '/blog/merge-split-compress-ocr-pdf-guide' },
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
    guideLink: { label: 'Choose between PDF compression, splitting, OCR, and related operations', href: '/blog/merge-split-compress-ocr-pdf-guide' },
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
    guideLink: { label: 'Learn when PDF-to-Word is more appropriate than OCR alone', href: '/blog/merge-split-compress-ocr-pdf-guide' },
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
    guideLink: { label: 'Understand how compression, dimensions, and image content affect file size', href: '/blog/image-compression-quality-file-size' },
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
    guideLink: { label: 'Compare resizing with image-quality compression', href: '/blog/image-compression-quality-file-size' },
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
    guideLink: { label: 'Learn how resolution, bitrate, codec, and audio affect video size', href: '/blog/video-compression-resolution-bitrate-codec' },
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
    guideLink: { label: 'Compare CSV, Excel, and JSON before converting data', href: '/blog/csv-excel-json-data-formats' },
    faqs: [
      { question: 'Does the first row become data?', answer: 'No. The parser uses the first row as column headers, and subsequent rows become JSON objects.' },
      { question: 'Can I choose a semicolon or tab delimiter?', answer: 'Yes. The page offers comma, semicolon, tab, and pipe choices.' },
      { question: 'Will all values remain strings?', answer: 'Not necessarily. Pandas infers column types, which can change numeric-looking identifiers, booleans, dates, and missing values.' },
      { question: 'Can it create nested JSON?', answer: 'No. The current converter produces a flat array of row objects based on CSV columns.' },
    ],
  },
  'split-pdf': {
    title: 'Separate a PDF by individual pages, selected pages, or fixed-size chunks',
    intro: 'Split PDF creates new PDF documents from an existing file. It can separate every page, extract an explicit selection, or divide the document into sequential groups of up to N pages without rewriting the visible page content.',
    useHeading: 'Choose the split mode that matches the task',
    uses: ['Create one PDF per page for individual distribution.', 'Extract selected pages such as 2-5,8 from a longer document.', 'Break a large document into ordered three-page or ten-page sections.'],
    steps: ['Upload one PDF no larger than 100 MB.', 'Choose All Pages, Page Range, or Every N Pages and enter the relevant value.', 'Process the PDF, then inspect the returned PDF or ZIP and confirm the page boundaries.'],
    technicalHeading: 'How pages are grouped',
    technical: ['All Pages produces one single-page PDF for every source page.', 'Page Range accepts comma-separated pages and inclusive ranges, removes duplicates, sorts the selection, and skips out-of-range page numbers when at least one requested page is valid.', 'Every N Pages creates sequential chunks of up to N pages; multiple outputs are packaged as ZIP, while a single resulting chunk is returned as PDF.'],
    exampleHeading: 'Example: divide a ten-page handbook every three pages',
    example: 'With Every N Pages set to 3, the outputs contain pages 1-3, 4-6, 7-9, and 10. Their filenames describe those boundaries, and the original page order is retained inside every chunk.',
    limitationsHeading: 'What splitting does not change',
    limitations: ['It does not edit, compress, OCR, rotate, or normalize the selected pages.', 'Malformed range syntax can fail; ranges must use positive integers such as 2-5,8.', 'Bookmarks, document-level attachments, forms, and other advanced features may not transfer to each new fragment exactly as expected.'],
    troubleshootingHeading: 'Resolve selection problems',
    troubleshooting: ['No valid pages: compare the requested numbers with the document page count.', 'Unexpected order: selected pages are deduplicated and sorted into source order rather than preserving typed order.', 'Invalid N: enter a whole number greater than zero; a value larger than the page count creates one chunk.'],
    category: { label: 'PDF tools', href: '/all-tools/pdf-tools' },
    related: [
      { label: 'Merge PDF', href: '/all-tools/pdf/merge-pdf', detail: 'Reassemble selected sections in a new file order.' },
      { label: 'Compress PDF', href: '/all-tools/pdf/compress-pdf', detail: 'Reduce a required section when it remains too large.' },
      { label: 'Rearrange PDF', href: '/all-tools/pdf/rearrange-pdf', detail: 'Change page order without separating the document.' },
    ],
    guideLink: { label: 'Choose between splitting, merging, compression, OCR, and PDF-to-Word', href: '/blog/merge-split-compress-ocr-pdf-guide' },
    faqs: [
      { question: 'What does Every N Pages do?', answer: 'It creates sequential groups containing up to N pages. A ten-page PDF with N set to 3 becomes groups 1-3, 4-6, 7-9, and 10.' },
      { question: 'Can I extract non-adjacent pages?', answer: 'Yes. Page Range accepts comma-separated values and ranges, such as 1,3,7-9.' },
      { question: 'What happens to page content?', answer: 'The selected source pages are copied into new PDFs. Splitting does not intentionally edit or resize their visible content.' },
      { question: 'Why did an out-of-range page disappear?', answer: 'Out-of-range numbers are skipped when the selection also contains valid pages. If no requested page is valid, processing fails.' },
    ],
  },
  'pdf-to-jpg': {
    title: 'Render each selected PDF page as a JPEG image',
    intro: 'PDF to JPG rasterizes complete pages rather than extracting embedded pictures. Text, vectors, annotations, and scanned content are flattened into pixels, with one JPG produced for every converted page.',
    useHeading: 'When page images are the useful output',
    uses: ['Create previews for a system that accepts images but not PDF.', 'Turn selected report pages into shareable photographic files.', 'Rasterize a scanned or text-based page into the same image workflow.'],
    steps: ['Upload one PDF up to 100 MB.', 'Choose 72, 150, 300, or 600 DPI and select all pages or enter a page range.', 'Convert, download the JPG or ZIP, and inspect small text and fine lines at the intended display size.'],
    technicalHeading: 'Resolution and output behavior',
    technical: ['PyMuPDF renders each page at the selected DPI; doubling DPI doubles both pixel dimensions and roughly quadruples the pixel count.', 'The rendered RGB image is saved as JPEG at encoder quality 95.', 'Multiple page images are returned in a ZIP; a one-page selection can be returned as one JPG.'],
    exampleHeading: 'Example: create web previews for pages 2 and 4',
    example: 'Choose Selected Pages, enter 2,4, and start at 150 DPI. The result contains page_2.jpg and page_4.jpg. If small labels are unclear, compare 300 DPI, understanding that it produces larger pixel dimensions and usually larger files.',
    limitationsHeading: 'Raster output loses PDF capabilities',
    limitations: ['Text is no longer selectable or searchable as text in the JPG.', 'Links, forms, layers, vectors, and accessibility structure are flattened into page pixels.', 'JPEG has no transparency and can show artifacts around fine text or diagrams; very high DPI uses more memory and storage.'],
    troubleshootingHeading: 'Improve an unsuitable render',
    troubleshooting: ['Blurry small text: try a higher DPI and compare the actual viewing size.', 'File is too large: use a lower DPI or convert only the required pages.', 'Need crisp line art or transparency: use PDF to PNG instead of JPG.'],
    category: { label: 'PDF tools', href: '/all-tools/pdf-tools' },
    related: [
      { label: 'PDF to PNG', href: '/all-tools/pdf/pdf-to-png', detail: 'Use lossless page images where sharp edges matter.' },
      { label: 'Split PDF', href: '/all-tools/pdf/split-pdf', detail: 'Extract PDF pages without rasterizing them.' },
      { label: 'PDF OCR', href: '/all-tools/pdf/pdf-ocr', detail: 'Recognize text instead of turning pages into images.' },
    ],
    guideLink: { label: 'Read the PDF workflow decision guide', href: '/blog/merge-split-compress-ocr-pdf-guide' },
    faqs: [
      { question: 'Does it extract pictures from the PDF?', answer: 'No. It renders the complete appearance of each selected page as one JPG.' },
      { question: 'What does DPI change?', answer: 'DPI controls the render scale. Higher DPI creates more pixels and can preserve smaller page details, but increases processing and output size.' },
      { question: 'Are scanned PDFs handled differently?', answer: 'Both scanned and text-based pages are rasterized. A scan already contains page-image limitations, while a text PDF loses selectable text in the JPG output.' },
      { question: 'When should I choose PNG?', answer: 'PNG is often preferable for diagrams, interface captures, fine text, or workflows that need lossless page pixels or transparency support.' },
    ],
  },
  'png-to-jpg': {
    title: 'Flatten a PNG into an opaque JPEG for photographic delivery',
    intro: 'PNG to JPG decodes one PNG in browser Canvas and exports a same-dimension JPEG. This is useful when a destination requires JPG or when a photographic PNG is unnecessarily large, but transparency and lossless PNG pixels cannot be carried into JPEG.',
    useHeading: 'Good reasons to choose JPG output',
    uses: ['Prepare an opaque photograph for a JPG-only upload field.', 'Reduce the delivery size of photographic content currently stored as PNG.', 'Create a broadly accepted copy while retaining the PNG master.'],
    steps: ['Upload a browser-decodable PNG and review its transparent areas.', 'Choose JPEG quality from 10% to 100%, convert, then inspect the opaque background and high-contrast edges.', 'Download the JPG and compare its dimensions, appearance, and actual size with the source.'],
    technicalHeading: 'What Canvas changes',
    technical: ['The browser draws the PNG at its source width and height and exports image/jpeg.', 'JPEG cannot encode alpha transparency; this implementation does not provide a background-color control.', 'The selected 10% to 100% quality is passed to the browser JPEG encoder; when no value is supplied, it defaults to 90%.'],
    exampleHeading: 'Example: convert a transparent product image',
    example: 'A 1400 × 1400 PNG remains 1400 × 1400, but transparent pixels become opaque during JPEG export. Inspect the result before publishing; if a specific white or brand-color background is required, composite that background in an editor before conversion.',
    limitationsHeading: 'Information that cannot survive',
    limitations: ['Transparency is permanently flattened in the JPG copy.', 'JPEG recompression can add halos, blocks, or softened text and does not guarantee a smaller file.', 'Quality controls encoder compression, not a guaranteed retained-detail percentage or target file size.'],
    troubleshootingHeading: 'Handle common surprises',
    troubleshooting: ['Background looks wrong: add the intended solid background before exporting to JPG.', 'Graphic edges look soft: keep PNG for logos, text, or flat-color artwork.', 'JPG is not smaller: retain the smaller source or resize dimensions if the destination permits it.'],
    category: { label: 'Image tools', href: '/all-tools/image-tools' },
    related: [
      { label: 'JPG to PNG', href: '/all-tools/jpg-to-png', detail: 'Create a PNG copy without claiming to restore lost JPEG detail.' },
      { label: 'Compress Image', href: '/all-tools/compress-image', detail: 'Compare encoding changes without changing dimensions.' },
      { label: 'Resize Image', href: '/all-tools/resize-image', detail: 'Reduce pixel dimensions when the image is oversized.' },
    ],
    guideLink: { label: 'Compare JPG, PNG, WebP, and AVIF behavior', href: '/blog/jpg-png-webp-avif-image-formats' },
    faqs: [
      { question: 'What happens to transparent pixels?', answer: 'They cannot remain transparent because JPEG has no alpha channel. Inspect the opaque result before using it.' },
      { question: 'Does conversion change pixel dimensions?', answer: 'No. The Canvas width and height match the decoded PNG dimensions.' },
      { question: 'Will the JPG always be smaller?', answer: 'No. Content and prior optimization matter; flat-color PNG graphics can already be efficient.' },
      { question: 'Is JPG appropriate for logos?', answer: 'Usually not when sharp edges or transparency matter. PNG is generally the safer delivery format for that material.' },
    ],
  },
  'webp-to-jpg': {
    title: 'Create a JPEG copy for systems that do not accept WebP',
    intro: 'WebP to JPG re-encodes a browser-decoded WebP at the same dimensions. Its main purpose is compatibility with a recipient or application that specifically requires JPEG, not automatic quality improvement.',
    useHeading: 'Compatibility-driven use cases',
    uses: ['Provide a JPG to older editing or document software.', 'Prepare a WebP photograph for a JPG-only form.', 'Create an alternate delivery copy while preserving the WebP original.'],
    steps: ['Choose one WebP file and preview it in the browser.', 'Set JPEG quality from 60% to 95% and convert.', 'Inspect transparency, text, gradients, and file size before downloading.'],
    technicalHeading: 'Re-encoding behavior',
    technical: ['Browser Canvas decodes the WebP and exports a same-size image/jpeg.', 'The selected quality value is passed to the JPEG encoder; it is not a guaranteed measure of retained detail or target size.', 'Canvas handles one decoded frame, so animated WebP content is not preserved as animation.'],
    exampleHeading: 'Example: prepare a WebP product photo for a legacy catalog',
    example: 'Convert the opaque photo at 85% first and inspect fabric texture and edges. If the source contains transparency, the JPEG copy becomes opaque; create the required background explicitly in an editor when its color matters.',
    limitationsHeading: 'Compatibility has conversion costs',
    limitations: ['JPEG cannot preserve WebP transparency or animation.', 'Lossy WebP artifacts remain and JPEG encoding can add another generation of loss.', 'Metadata such as animation timing and format-specific properties is not carried through this Canvas conversion.'],
    troubleshootingHeading: 'Choose a better result',
    troubleshooting: ['Visible artifacts: raise JPEG quality or return to a better source master.', 'Unexpected background: flatten the source onto the desired color before converting.', 'JPG grows larger: keep WebP unless the destination specifically requires JPEG.'],
    category: { label: 'Image tools', href: '/all-tools/image-tools' },
    related: [
      { label: 'JPG to WebP', href: '/all-tools/jpg-to-webp', detail: 'Create a WebP delivery copy from JPG.' },
      { label: 'WebP to PNG', href: '/all-tools/webp-to-png', detail: 'Use PNG when transparency must be retained.' },
      { label: 'Compress Image', href: '/all-tools/compress-image', detail: 'Compare file-size options for an existing format.' },
    ],
    guideLink: { label: 'Compare JPG, PNG, WebP, and AVIF use cases', href: '/blog/jpg-png-webp-avif-image-formats' },
    faqs: [
      { question: 'Why convert WebP to JPG?', answer: 'Convert when the receiving application or upload field accepts JPEG but not WebP.' },
      { question: 'Does the quality slider guarantee a file size?', answer: 'No. It controls the browser JPEG encoder, while source dimensions and visual complexity determine the resulting bytes.' },
      { question: 'Will transparency survive?', answer: 'No. JPEG has no alpha transparency, and this page does not offer a background-color control.' },
      { question: 'What happens to animated WebP?', answer: 'The Canvas workflow produces one still JPG, so animation and timing are not preserved.' },
    ],
  },
  'crop-image': {
    title: 'Remove pixels outside a selected image boundary',
    intro: 'Crop Image keeps a rectangular portion of one image and discards everything outside it. Cropping changes composition and output dimensions; it is different from resizing, which resamples the whole frame.',
    useHeading: 'Use cropping to change composition',
    uses: ['Remove empty borders or distracting surroundings.', 'Select a square, 4:3, 16:9, or 3:2 region for a destination layout.', 'Create a tighter subject frame before resizing or compression.'],
    steps: ['Upload an image and drag the crop rectangle or its handles.', 'Choose Free or an aspect-ratio preset, and optionally adjust preview zoom or rotation.', 'Select PNG, JPG, or WebP, create the crop, and verify its boundaries and output dimensions.'],
    technicalHeading: 'Selection and encoding details',
    technical: ['The selection is stored as percentages and mapped back to source-image pixels for the output Canvas.', 'The cropped Canvas uses only the selected width and height; it does not scale the crop to a separate target size.', 'JPG exports at quality 0.92, while PNG or WebP use the browser encoder through Canvas.'],
    exampleHeading: 'Example: make a landscape banner from a portrait-heavy photo',
    example: 'Choose 16:9, move the crop box so the subject remains inside it, and create the crop. The result removes pixels above, below, or beside the selected region. Resize afterward only if the banner also needs an exact pixel width.',
    limitationsHeading: 'Cropping cannot create missing detail',
    limitations: ['Pixels outside the selection are absent from the new file; keep the original if you may need a different composition.', 'A small crop has fewer pixels and can look soft if later enlarged.', 'JPEG output cannot retain transparency, and format conversion can change file size or introduce lossy artifacts.'],
    troubleshootingHeading: 'Correct an awkward crop',
    troubleshooting: ['Subject is cut off: enlarge or move the selection before creating the result.', 'Need exact output dimensions: crop to composition first, then use Resize Image.', 'Wrong proportions: choose the intended aspect preset and inspect the generated dimensions.'],
    category: { label: 'Image tools', href: '/all-tools/image-tools' },
    related: [
      { label: 'Resize Image', href: '/all-tools/resize-image', detail: 'Set exact pixel dimensions after composition is correct.' },
      { label: 'Compress Image', href: '/all-tools/compress-image', detail: 'Adjust encoded size after cropping.' },
      { label: 'Rotate Image', href: '/all-tools/rotate-image', detail: 'Correct orientation as a separate operation.' },
    ],
    guideLink: { label: 'Learn when resizing before compression makes sense', href: '/blog/image-compression-quality-file-size' },
    faqs: [
      { question: 'Is cropping the same as resizing?', answer: 'No. Cropping removes pixels outside a rectangle; resizing resamples the complete image to new dimensions.' },
      { question: 'Which aspect ratios are available?', answer: 'The UI offers Free, 1:1, 4:3, 16:9, and 3:2 selections.' },
      { question: 'Does cropping reduce quality?', answer: 'The retained source region is drawn at its selected pixel size, but the chosen output format can re-encode it and a small crop will not tolerate large upscaling.' },
      { question: 'Which outputs are available?', answer: 'The page can create PNG, JPG, or WebP output through browser Canvas.' },
    ],
  },
  'trim-video': {
    title: 'Keep one continuous section between a start and end time',
    intro: 'Trim Video removes the material before the chosen start and after the chosen end. It produces an MP4 containing one continuous interval; it does not join multiple highlights or remove a section from the middle.',
    useHeading: 'Practical trimming tasks',
    uses: ['Remove setup time from the beginning of a recording.', 'Create a short review excerpt from a longer clip.', 'Discard an unneeded ending before compression or sharing.'],
    steps: ['Upload one MP4, MOV, AVI, MKV, or WebM up to 500 MB.', 'Enter start and end times in MM:SS, with the end later than the start.', 'Trim and verify the first frame, last frame, duration, audio synchronization, and playback.'],
    technicalHeading: 'Timing and codec behavior',
    technical: ['The engine calculates output duration as end time minus start time and rejects a non-positive range, a start beyond the source, or a requested interval longer than one hour.', 'FFmpeg first attempts stream copy, which avoids re-encoding but can begin near a codec keyframe rather than an exact arbitrary frame.', 'For certain stream-copy failures, the fallback re-encodes H.264 video at CRF 28 with AAC audio.'],
    exampleHeading: 'Example: keep a demonstration from 00:15 to 01:05',
    example: 'The expected interval is 50 seconds. Play the result from the beginning and near the end: stream-copy seeking can land near available keyframes, so observed boundaries may not be frame-exact for every source.',
    limitationsHeading: 'What a single trim cannot do',
    limitations: ['It cannot combine multiple non-contiguous moments into one highlight reel.', 'Stream copy depends on source keyframes and container/codec compatibility.', 'Damaged files, incompatible streams, invalid times, or demanding files can fail or exceed processing limits.'],
    troubleshootingHeading: 'Fix timing and playback issues',
    troubleshooting: ['End rejected: make it later than the start and within the source duration.', 'Boundary is slightly early or late: keyframe placement can limit stream-copy precision.', 'Need several excerpts: trim them separately and use a video editor to join them.'],
    category: { label: 'Video tools', href: '/all-tools/video-tools' },
    related: [
      { label: 'Compress Video', href: '/all-tools/video/compress-video', detail: 'Reduce the retained clip after duration is correct.' },
      { label: 'Resize Video', href: '/all-tools/video/resize-video', detail: 'Change the retained clip dimensions.' },
      { label: 'Extract Audio', href: '/all-tools/video/extract-audio-from-video', detail: 'Keep only the audio when pictures are unnecessary.' },
    ],
    guideLink: { label: 'Understand duration, bitrate, resolution, and codec tradeoffs', href: '/blog/video-compression-resolution-bitrate-codec' },
    faqs: [
      { question: 'How is expected duration calculated?', answer: 'It is the end timestamp minus the start timestamp. For example, 00:15 to 01:05 is 50 seconds.' },
      { question: 'Is trimming frame-accurate?', answer: 'Not guaranteed. The primary stream-copy path seeks around codec keyframes, which can affect exact boundaries.' },
      { question: 'Does the tool re-encode the video?', answer: 'It first attempts stream copy. A limited fallback path re-encodes H.264 video and AAC audio when certain copy failures occur.' },
      { question: 'What files can I upload?', answer: 'The configured inputs are MP4, MOV, AVI, MKV, and WebM, with a 500 MB request limit.' },
    ],
  },
  'resize-video': {
    title: 'Fit a video into new pixel dimensions',
    intro: 'Resize Video re-encodes the picture into a requested width and height and returns MP4. With aspect preservation enabled, the source fits inside the requested box without stretching; the actual output can be smaller than one requested dimension.',
    useHeading: 'When dimensions need to change',
    uses: ['Create a smaller review copy from a high-resolution source.', 'Fit footage within a platform maximum width and height.', 'Deliberately create exact dimensions when stretching is acceptable.'],
    steps: ['Upload MP4, MOV, AVI, MKV, or WebM up to 500 MB.', 'Enter width from 160-7680 and height from 120-4320, then decide whether to preserve aspect ratio.', 'Resize and inspect dimensions, shape, small text, motion detail, audio, and file size.'],
    technicalHeading: 'Scaling and encoding behavior',
    technical: ['Aspect-preserving mode uses FFmpeg scale with force_original_aspect_ratio=decrease, fitting inside the requested box without padding.', 'Aspect-preserving dimensions are adjusted down to even numbers when necessary; disabling it scales to the exact width and height and can distort the picture.', 'Video is re-encoded at a 5000 kb/s target while the existing audio stream is copied into the MP4 output.'],
    exampleHeading: 'Example: fit 1920 × 1080 footage inside 1080 × 1080',
    example: 'With aspect ratio enabled, a 16:9 source fits inside the square box as approximately 1080 × 607 rather than stretching to a square. Disable preservation only if an exact 1080 × 1080 distorted frame is intentionally required.',
    limitationsHeading: 'Resolution is not recovered detail',
    limitations: ['Upscaling increases pixel dimensions but cannot reconstruct detail absent from the source.', 'A fixed 5000 kb/s video target does not guarantee smaller output; low-bitrate sources can become larger.', 'Copied audio must be compatible with the MP4 container, and unusual streams can fail.'],
    troubleshootingHeading: 'Resolve size or shape problems',
    troubleshooting: ['Output is not the exact box: aspect preservation fits inside it; disable the option only if stretching is acceptable.', 'Output looks soft: avoid unnecessary upscaling or choose dimensions closer to the source.', 'File grew: resizing and file-size compression are separate; compare Compress Video after choosing dimensions.'],
    category: { label: 'Video tools', href: '/all-tools/video-tools' },
    related: [
      { label: 'Compress Video', href: '/all-tools/video/compress-video', detail: 'Tune encoded size after choosing dimensions.' },
      { label: 'Trim Video', href: '/all-tools/video/trim-video', detail: 'Remove unnecessary duration before resizing.' },
      { label: 'Video to MP4', href: '/all-tools/video/mov-to-mp4', detail: 'Use an MP4 conversion workflow without dimension changes.' },
    ],
    guideLink: { label: 'Learn how resolution, bitrate, codec, and frame rate interact', href: '/blog/video-compression-resolution-bitrate-codec' },
    faqs: [
      { question: 'What does Keep Aspect Ratio do?', answer: 'It fits the source inside the requested width and height without stretching. One output dimension can therefore be smaller than the entered box.' },
      { question: 'Will upscaling improve quality?', answer: 'No. It creates more pixels through scaling but cannot recover missing source detail.' },
      { question: 'Does a lower resolution guarantee a smaller file?', answer: 'No. The output also depends on duration, content, source encoding, and the fixed video bitrate used by this route.' },
      { question: 'What happens to audio?', answer: 'The resize command copies the source audio stream rather than re-encoding it.' },
    ],
  },
  'excel-to-csv': {
    title: 'Export the first worksheet or every worksheet as CSV',
    intro: 'Excel to CSV converts spreadsheet cells into delimited text. First Sheet Only returns one CSV; All Sheets returns a ZIP containing one UTF-8 CSV for each worksheet so no sheet is silently omitted.',
    useHeading: 'Choose the export scope deliberately',
    uses: ['Export the first worksheet for a database import.', 'Package every worksheet as separate CSV files for system migration.', 'Choose comma, semicolon, tab, or pipe delimiters for a receiving application.'],
    steps: ['Upload XLSX, XLS, XLSM, or XLSB up to 100 MB.', 'Choose First Sheet Only or All Sheets (as ZIP), then select the required delimiter.', 'Convert and verify filenames, headers, row counts, identifiers, dates, formulas, and encoding.'],
    technicalHeading: 'Workbook-to-text behavior',
    technical: ['The first-sheet mode returns text/csv; all-sheets mode returns application/zip with one CSV per worksheet.', 'Worksheet names are converted to safe filenames and collisions receive numeric suffixes; empty sheets still receive a predictable CSV member.', 'CSV output uses UTF-8 with a byte-order mark and preserves string identifiers such as leading-zero values when they are stored as text.'],
    exampleHeading: 'Example: export an inventory workbook with three tabs',
    example: 'Choose All Sheets for Stock, Suppliers, and Archive. The ZIP contains Stock.csv, Suppliers.csv, and Archive.csv in workbook order. If two sheet names normalize to the same safe filename, the later file receives _2 rather than overwriting the first.',
    limitationsHeading: 'Spreadsheet features that CSV cannot represent',
    limitations: ['CSV does not retain cell colors, widths, merged cells, charts, macros, formulas, multiple worksheets, or validation rules.', 'Formula export depends on values available to the spreadsheet reader; verify calculated results against Excel.', 'Displayed date, currency, percentage, and identifier formatting can differ from underlying cell values.'],
    troubleshootingHeading: 'Check an unexpected export',
    troubleshooting: ['One CSV expected but ZIP returned: select First Sheet Only.', 'Columns import incorrectly: match the receiving system delimiter and encoding settings.', 'Identifier changed: confirm the source cell is stored as text and compare the CSV before import.'],
    category: { label: 'Data tools', href: '/all-tools/data' },
    related: [
      { label: 'CSV to Excel', href: '/all-tools/data/csv-to-excel', detail: 'Place a flat CSV into an XLSX workbook.' },
      { label: 'CSV to JSON', href: '/all-tools/data/csv-to-json', detail: 'Turn a flat CSV into row objects.' },
      { label: 'Split Excel', href: '/all-tools/data/split-excel', detail: 'Divide workbook content without converting to CSV.' },
    ],
    guideLink: { label: 'Compare CSV, Excel, and JSON before exporting', href: '/blog/csv-excel-json-data-formats' },
    faqs: [
      { question: 'Can it export every worksheet?', answer: 'Yes. All Sheets creates a ZIP containing one CSV for every worksheet, including empty sheets.' },
      { question: 'How are worksheet filenames created?', answer: 'Unsafe characters are replaced, empty normalized names receive a numbered fallback, and duplicate names receive numeric suffixes.' },
      { question: 'Are formulas preserved?', answer: 'No. CSV cannot store formulas. Verify the exported values, especially when workbook calculations have not been refreshed.' },
      { question: 'Which delimiters are supported?', answer: 'The UI offers comma, semicolon, tab, and pipe delimiters.' },
    ],
  },
  'json-to-xml': {
    title: 'Map JSON objects and arrays into XML elements',
    intro: 'JSON to XML reads one JSON file and creates an XML document. You can choose the root element name and the repeated item element used for a top-level array; nested object keys become element names.',
    useHeading: 'Use conversion when an XML-shaped handoff is required',
    uses: ['Wrap a JSON array in a named XML collection.', 'Create element-based XML for a system that does not accept JSON.', 'Inspect how nested JSON becomes a hierarchy of elements.'],
    steps: ['Upload a UTF-8 JSON file up to 100 MB.', 'Enter valid root and item element names, or keep the defaults root and item.', 'Convert, parse the XML in the destination system, and compare arrays, nulls, booleans, numbers, and keys.'],
    technicalHeading: 'Element mapping rules',
    technical: ['A top-level object becomes children of the configured root; a top-level array uses the configured item element for each entry.', 'Nested objects recurse into child elements, while nested arrays repeat their JSON property name.', 'Configurable names must begin with a letter or underscore, use letters, digits, period, underscore, or hyphen, and cannot start with the reserved XML prefix.'],
    exampleHeading: 'Example: create an inventory document',
    example: 'For JSON [{"sku":"001","stock":4}] with rootTag inventory and itemTag product, the document contains <inventory><product><sku>001</sku><stock>4</stock></product></inventory>, with pretty-print whitespace added.',
    limitationsHeading: 'JSON and XML do not share one data model',
    limitations: ['The converter creates elements only; it does not infer XML attributes or namespaces.', 'Numbers, booleans, strings, and null become element text, so original JSON types are not encoded explicitly.', 'JSON property names that are invalid XML names are normalized, which can make distinct keys collide.'],
    troubleshootingHeading: 'Resolve conversion errors',
    troubleshooting: ['Invalid root or item name: use a letter or underscore first and avoid spaces or colons.', 'Unexpected repeated tags: nested arrays repeat their property element name by design.', 'Types changed after round-trip: XML text does not retain JSON primitive-type metadata.'],
    category: { label: 'Data tools', href: '/all-tools/data' },
    related: [
      { label: 'XML to JSON', href: '/all-tools/data/xml-to-json', detail: 'Convert element-oriented XML toward JSON.' },
      { label: 'JSON Formatter', href: '/all-tools/code-tools/json-formatter', detail: 'Check and indent JSON before file conversion.' },
      { label: 'JSON Validator', href: '/all-tools/code-tools/json-validator', detail: 'Confirm JSON syntax before converting.' },
    ],
    guideLink: { label: 'Review data-format structure and conversion ambiguity', href: '/blog/csv-excel-json-data-formats' },
    faqs: [
      { question: 'Can I change the root element?', answer: 'Yes. A valid rootTag value becomes the document root; an empty value uses root.' },
      { question: 'Where is itemTag used?', answer: 'It names repeated elements for entries in a top-level JSON array. An empty value uses item.' },
      { question: 'Does it create XML attributes?', answer: 'No. The current conversion model creates elements and text only.' },
      { question: 'Are JSON types preserved?', answer: 'No. Primitive values become XML text, so a later reader needs its own rules to infer numbers, booleans, strings, or nulls.' },
    ],
  },
  'json-validator': {
    title: 'Check whether text follows JSON syntax',
    intro: 'JSON Validator sends the entered text to the code-tool service and runs JSON.parse. It reports valid JSON or a parser error with a calculated line and column when a character position is available.',
    useHeading: 'Validation answers a narrow question',
    uses: ['Check copied API data before importing it.', 'Find syntax errors in configuration or fixtures.', 'Distinguish invalid JSON from data that is valid but semantically wrong.'],
    steps: ['Paste JSON without secrets, tokens, or sensitive records.', 'Run validation and read the parser message and reported location.', 'Correct syntax, validate again, then use a schema-specific tool if the data must follow a contract.'],
    technicalHeading: 'Rules enforced by JSON.parse',
    technical: ['Object keys and strings require double quotes; single quotes are invalid.', 'Trailing commas, comments, undefined, NaN, and unquoted keys are not accepted JSON.', 'Objects and arrays must be correctly nested and every opening brace or bracket must close in order.'],
    exampleHeading: 'Example: diagnose a trailing comma',
    example: 'The text {"active":true,} is rejected because JSON does not allow the comma before the closing brace. Removing that comma makes the syntax valid, but does not prove that active is an allowed field for a particular API.',
    limitationsHeading: 'Syntax validity is not data validity',
    limitations: ['The tool does not validate against JSON Schema or an API contract.', 'It does not repair malformed input or verify whether values are truthful.', 'Input is processed by the server-side code API, so confidential material should not be submitted.'],
    troubleshootingHeading: 'Fix common parser failures',
    troubleshooting: ['Error near a property: quote the key and use double-quoted string values.', 'Error near a closing brace or bracket: remove a trailing comma or add a missing value.', 'Unexpected end: close every open array, object, and string.'],
    category: { label: 'Code tools', href: '/all-tools/code-tools' },
    related: [
      { label: 'JSON Formatter', href: '/all-tools/code-tools/json-formatter', detail: 'Indent valid JSON after its syntax passes.' },
      { label: 'JSON Schema Validator', href: '/all-tools/code-tools/json-schema-validator', detail: 'Check data against an explicit JSON Schema.' },
      { label: 'JSON to XML', href: '/all-tools/data/json-to-xml', detail: 'Convert validated JSON into element-based XML.' },
    ],
    faqs: [
      { question: 'Does this validator use JSON Schema?', answer: 'No. It checks JSON syntax with JSON.parse. Use JSON Schema Validator for contract validation.' },
      { question: 'Why are single quotes rejected?', answer: 'JSON strings and object keys require double quotes.' },
      { question: 'Are trailing commas allowed?', answer: 'No. Remove the comma immediately before a closing brace or bracket.' },
      { question: 'Does validation format or repair JSON?', answer: 'No. It reports syntax validity and parser errors; JSON Formatter is the separate indentation workflow.' },
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
