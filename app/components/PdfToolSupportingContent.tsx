import Link from 'next/link';

type Faq = {
  question: string;
  answer: string;
};

type SupportingContent = {
  intro: string;
  howTitle: string;
  how: string;
  useCases: string[];
  considerations: string[];
  faqs: Faq[];
};

const CONTENT: Record<string, SupportingContent> = {
  'word-to-pdf': {
    intro:
      'Word to PDF converts a supported Word document into PDF format for consistent viewing, sharing, and printing across devices.',
    howTitle: 'How Word to PDF conversion works',
    how:
      'Upload the Word document and start the conversion. The document is processed and written to a new PDF file that can be downloaded after conversion completes.',
    useCases: [
      'Share a document without requiring recipients to edit the Word source.',
      'Prepare reports, letters, proposals, or forms for PDF distribution.',
      'Create a fixed-page version for printing or archiving workflows.',
      'Convert a working document before sending it through another PDF tool.',
    ],
    considerations: [
      'Word and PDF use different layout models, so page breaks, fonts, spacing, or complex elements can change during conversion.',
      'Embedded fonts or unsupported document features may be substituted.',
      'Review headers, footers, tables, equations, and page breaks when formatting is important.',
      'Keep the original Word document if you need to continue editing the source content.',
    ],
    faqs: [
      {
        question: 'Will the PDF look exactly like the Word document?',
        answer:
          'Often it will be similar, but differences in fonts, page layout, or unsupported Word features can affect the result.',
      },
      {
        question: 'Can I edit the PDF like the original Word file?',
        answer:
          'PDF is primarily a fixed-layout output format. Keep the Word source when you need normal document editing.',
      },
      {
        question: 'Why can page breaks change?',
        answer:
          'Pagination can change when fonts, margins, or layout features are interpreted differently during conversion.',
      },
      {
        question: 'Should I check the result before sharing it?',
        answer:
          'Yes. Review important formatting, tables, images, and page breaks before distributing the converted PDF.',
      },
    ],
  },

  'pdf-to-powerpoint': {
    intro:
      'PDF to PowerPoint converts PDF page content into a PPTX presentation that can be opened in compatible presentation software.',
    howTitle: 'How PDF to PowerPoint conversion works',
    how:
      'Upload the PDF and start conversion. Page content is interpreted and transferred into a PowerPoint file for download.',
    useCases: [
      'Reuse PDF material in a presentation workflow.',
      'Turn report or document pages into presentation slides.',
      'Create a starting point for editing PDF content in presentation software.',
      'Prepare page-based content for meetings or training material.',
    ],
    considerations: [
      'PDF does not store native PowerPoint slide structure, so the result may not reproduce editable source objects exactly.',
      'Fonts, charts, grouped graphics, and complex layouts can change during conversion.',
      'Some page content may be represented as images or simplified elements.',
      'Review the PPTX before presenting or performing detailed editing.',
    ],
    faqs: [
      {
        question: 'Will every PDF element become editable?',
        answer:
          'Not necessarily. PDF page content may be converted into editable, simplified, or image-based elements depending on its structure.',
      },
      {
        question: 'Will the slide layout match the PDF?',
        answer:
          'The converter attempts to transfer page content, but differences can occur because PDF and PowerPoint use different layout models.',
      },
      {
        question: 'Can scanned PDF pages be converted?',
        answer:
          'Scanned pages are image-based and may remain largely image-oriented unless OCR or other recognition is involved.',
      },
      {
        question: 'Should I review fonts and graphics?',
        answer:
          'Yes. Check fonts, charts, positioning, and page-to-slide layout before using the presentation.',
      },
    ],
  },

  'powerpoint-to-pdf': {
    intro:
      'PowerPoint to PDF converts presentation slides into PDF pages for easier distribution, viewing, and printing.',
    howTitle: 'How PowerPoint to PDF conversion works',
    how:
      'Upload a supported presentation file and start the conversion. The slides are rendered into a PDF document that can be downloaded after processing.',
    useCases: [
      'Share presentation slides without requiring presentation software.',
      'Prepare slides for printing or document distribution.',
      'Create a fixed-layout copy of a presentation.',
      'Archive a presentation as a PDF document.',
    ],
    considerations: [
      'Animations, transitions, video playback, and interactive presentation behavior do not operate as normal animations inside a static PDF.',
      'Fonts unavailable during conversion can be substituted.',
      'Check slide dimensions, graphics, and text wrapping after conversion.',
      'Speaker notes and other presentation-only information may not appear unless explicitly supported.',
    ],
    faqs: [
      {
        question: 'Are animations preserved in the PDF?',
        answer:
          'A PDF is a static document format, so PowerPoint animation and transition behavior is not preserved as normal slide animation.',
      },
      {
        question: 'Can fonts change?',
        answer:
          'Yes. Font substitution can occur when a presentation uses fonts that are unavailable to the conversion environment.',
      },
      {
        question: 'Are videos still playable?',
        answer:
          'Do not assume embedded presentation media will remain interactive after conversion to a static PDF.',
      },
      {
        question: 'Why convert a presentation to PDF?',
        answer:
          'PDF is useful when you want a fixed-layout version that is easier to distribute, print, or archive.',
      },
    ],
  },

  'pdf-to-excel': {
    intro:
      'PDF to Excel attempts to move tabular and document data from PDF pages into an XLSX spreadsheet for further review and editing.',
    howTitle: 'How PDF to Excel conversion works',
    how:
      'Upload the PDF and start conversion. The converter analyzes PDF content and creates an Excel workbook from information it can interpret as structured data.',
    useCases: [
      'Move report tables into spreadsheet workflows.',
      'Recover rows and columns for analysis or manual cleanup.',
      'Convert recurring PDF reports into an editable workbook starting point.',
      'Reduce manual retyping of structured document data.',
    ],
    considerations: [
      'PDF pages do not contain native Excel worksheet structure.',
      'Merged cells, complex tables, multiple columns, and unusual layouts can require cleanup after conversion.',
      'Scanned documents may need OCR and can produce less reliable spreadsheet structure.',
      'Verify totals, decimals, dates, IDs, and column alignment before using converted data.',
    ],
    faqs: [
      {
        question: 'Will formulas from an original spreadsheet be recovered?',
        answer:
          'A PDF generally contains rendered values rather than the original spreadsheet formulas, so formulas should not be expected to return automatically.',
      },
      {
        question: 'Will every table convert correctly?',
        answer:
          'No. Results depend on the PDF structure and complexity of the table layout.',
      },
      {
        question: 'Can scanned tables be converted?',
        answer:
          'Image-based tables are harder to interpret because text recognition and table reconstruction are both required.',
      },
      {
        question: 'Should converted numbers be verified?',
        answer:
          'Yes. Verify important financial values, dates, totals, and column placement against the original PDF.',
      },
    ],
  },

  'pdf-to-csv': {
    intro:
      'PDF to CSV attempts to convert tabular PDF content into comma-separated data that can be opened in spreadsheet and data-processing tools.',
    howTitle: 'How PDF to CSV conversion works',
    how:
      'Upload the PDF and start the conversion. The tool interprets available tabular content and writes extracted rows and columns to CSV output.',
    useCases: [
      'Move simple PDF tables into a data workflow.',
      'Prepare extracted values for spreadsheet import.',
      'Create text-based tabular data from document reports.',
      'Reduce manual copying of repeated table rows.',
    ],
    considerations: [
      'CSV stores rows and columns but does not preserve PDF page design.',
      'Complex layouts, merged cells, multiline values, and borderless tables can be interpreted incorrectly.',
      'Scanned PDFs are more difficult because OCR may be required first.',
      'Check delimiters, row order, headers, numeric values, and column alignment after conversion.',
    ],
    faqs: [
      {
        question: 'Does CSV preserve PDF formatting?',
        answer:
          'No. CSV contains tabular text values and does not preserve fonts, graphics, page layout, or visual formatting.',
      },
      {
        question: 'Will all PDF tables become clean CSV rows?',
        answer:
          'Not necessarily. Table extraction depends on how the PDF content is structured.',
      },
      {
        question: 'Can CSV be opened in Excel?',
        answer:
          'CSV files can normally be imported or opened by spreadsheet software, although column interpretation can depend on the application and data.',
      },
      {
        question: 'Should I verify converted values?',
        answer:
          'Yes. Check important totals, decimal values, dates, IDs, and column placement against the source PDF.',
      },
    ],
  },

  'pdf-to-text': {
    intro:
      'PDF to Text converts readable PDF content into a plain TXT file. It is useful when you need the words from a document without its visual page design.',
    howTitle: 'How PDF to Text conversion works',
    how:
      'Upload the PDF and start conversion. Available textual content is extracted and written into a plain-text file for download.',
    useCases: [
      'Copy document text into another application.',
      'Create simple text for searching, indexing, or review.',
      'Remove page styling when only written content is needed.',
      'Prepare extracted text for another text-processing workflow.',
    ],
    considerations: [
      'TXT does not preserve fonts, images, page positioning, or full document layout.',
      'Columns, tables, headers, and footers can appear in a different reading order.',
      'Scanned image-only PDFs may require OCR rather than standard text extraction.',
      'Review important content when document reading order is complex.',
    ],
    faqs: [
      {
        question: 'Does PDF to Text preserve formatting?',
        answer:
          'No. TXT is plain text and does not preserve the visual PDF layout.',
      },
      {
        question: 'What if the PDF contains scanned pages?',
        answer:
          'Scanned pages may not have a usable text layer. PDF OCR is more appropriate when visible words are stored only as images.',
      },
      {
        question: 'Are images included?',
        answer:
          'Plain-text output is intended for textual content, not images or page graphics.',
      },
      {
        question: 'Why can reading order change?',
        answer:
          'PDF text can be positioned visually rather than stored as normal flowing paragraphs, which can affect extraction order.',
      },
    ],
  },

  'pdf-to-docx': {
    intro:
      'PDF to DOCX converts PDF content into a Word document and includes OCR-language and page-range controls for document workflows that may contain scanned pages.',
    howTitle: 'How PDF to DOCX conversion works',
    how:
      'Upload the PDF, choose the OCR language when needed, and optionally enter a page range. The selected content is processed and written into a DOCX document.',
    useCases: [
      'Create an editable Word starting point from PDF content.',
      'Process only selected pages from a longer document.',
      'Attempt text recognition on scanned document pages.',
      'Reuse document text in a Word-based editing workflow.',
    ],
    considerations: [
      'PDF and Word store layout differently, so formatting can change.',
      'Scanned pages depend on OCR and should be checked carefully.',
      'Complex tables, columns, text boxes, fonts, and graphics can require manual cleanup.',
      'OCR language selection should match the source document as closely as possible.',
    ],
    faqs: [
      {
        question: 'Can scanned PDFs be converted to DOCX?',
        answer:
          'The tool includes an OCR-language setting intended to help with scanned PDF pages.',
      },
      {
        question: 'Can I convert selected pages only?',
        answer:
          'Yes. Use the page-range option when only part of the document is needed.',
      },
      {
        question: 'Will the Word layout exactly match the PDF?',
        answer:
          'Not necessarily. PDF uses fixed page positioning while Word uses an editable document layout model.',
      },
      {
        question: 'Should OCR text be checked?',
        answer:
          'Yes. Verify names, numbers, punctuation, and other important content against the scanned source.',
      },
    ],
  },

  'pdf-to-pptx': {
    intro:
      'PDF to PPTX converts selected PDF page content into a PowerPoint presentation file for presentation-oriented editing and reuse.',
    howTitle: 'How PDF to PPTX conversion works',
    how:
      'Upload the PDF, optionally enter a page range, and start conversion. The selected PDF content is transferred into a PPTX presentation.',
    useCases: [
      'Turn selected report pages into presentation slides.',
      'Create a presentation starting point from PDF material.',
      'Reuse page graphics or text in slide-based workflows.',
      'Convert only the relevant pages from a long PDF.',
    ],
    considerations: [
      'PDF page elements do not contain native PowerPoint object structure.',
      'Complex layouts can become simplified or image-based.',
      'Fonts and object positioning can change.',
      'Review each slide before using it in a presentation.',
    ],
    faqs: [
      {
        question: 'Can I select PDF pages for conversion?',
        answer:
          'Yes. The current tool includes a page-range option.',
      },
      {
        question: 'Will all slide elements be editable?',
        answer:
          'Not necessarily. Some content may be represented as images or simplified elements.',
      },
      {
        question: 'Does the conversion recreate animations?',
        answer:
          'PDF pages do not contain the original PowerPoint animation structure, so animation should not be expected to be reconstructed.',
      },
      {
        question: 'Should I inspect the converted slides?',
        answer:
          'Yes. Check layout, fonts, graphics, and text placement before presenting.',
      },
    ],
  },

  'pdf-to-xlsx': {
    intro:
      'PDF to XLSX converts selected PDF content into an Excel workbook for spreadsheet-oriented review, cleanup, and analysis.',
    howTitle: 'How PDF to XLSX conversion works',
    how:
      'Upload the PDF, optionally choose a page range, and start conversion. The selected page content is analyzed and written into an XLSX workbook.',
    useCases: [
      'Move tables from selected PDF pages into Excel.',
      'Create an editable workbook from document data.',
      'Reduce manual copying of rows and columns.',
      'Prepare extracted information for spreadsheet analysis.',
    ],
    considerations: [
      'PDF does not preserve original spreadsheet formulas or worksheet logic.',
      'Complex tables and page layouts can require manual cleanup.',
      'Scanned tables are more difficult to reconstruct accurately.',
      'Verify important numbers, dates, totals, and column alignment.',
    ],
    faqs: [
      {
        question: 'Can I convert only selected pages?',
        answer:
          'Yes. Use the page-range option to limit conversion.',
      },
      {
        question: 'Are spreadsheet formulas recovered?',
        answer:
          'PDF usually contains rendered values rather than original spreadsheet formulas, so formulas should not be expected to return.',
      },
      {
        question: 'Will table formatting be identical?',
        answer:
          'Not necessarily. Spreadsheet structure is reconstructed from PDF page content and can require adjustment.',
      },
      {
        question: 'Should I verify numeric data?',
        answer:
          'Yes. Check important figures against the source document before relying on converted spreadsheet data.',
      },
    ],
  },

  'pdf-to-html': {
    intro:
      'PDF to HTML converts selected PDF content into an HTML document for browser-based viewing or further web editing.',
    howTitle: 'How PDF to HTML conversion works',
    how:
      'Upload the PDF, choose the OCR language when scanned pages are involved, optionally specify a page range, and start conversion. The selected content is written to HTML output.',
    useCases: [
      'Create browser-readable content from a PDF.',
      'Reuse document text in a web-content workflow.',
      'Convert selected pages rather than an entire document.',
      'Process scanned pages with the available OCR language option.',
    ],
    considerations: [
      'HTML and PDF use very different layout systems.',
      'Exact page positioning, fonts, columns, and graphics can change.',
      'OCR-derived text can contain recognition errors.',
      'Review generated markup and content before publishing it to a website.',
    ],
    faqs: [
      {
        question: 'Will HTML look exactly like the PDF?',
        answer:
          'Not necessarily. PDF uses fixed page layout while HTML is designed for browser rendering and responsive document flow.',
      },
      {
        question: 'Can scanned PDF pages be processed?',
        answer:
          'The tool includes an OCR-language option for workflows involving scanned pages.',
      },
      {
        question: 'Can I choose a page range?',
        answer:
          'Yes. The tool includes a page-range control.',
      },
      {
        question: 'Should generated HTML be reviewed before publishing?',
        answer:
          'Yes. Check text, structure, links, graphics, and accessibility before using generated HTML publicly.',
      },
    ],
  },

  'pdf-to-rtf': {
    intro:
      'PDF to RTF converts selected PDF content into Rich Text Format for editing in applications that support RTF documents.',
    howTitle: 'How PDF to RTF conversion works',
    how:
      'Upload the PDF, choose the OCR language when required, optionally select a page range, and convert the selected content into an RTF document.',
    useCases: [
      'Move PDF text into an editable rich-text document.',
      'Work with document content in software that supports RTF.',
      'Convert selected pages instead of an entire PDF.',
      'Use OCR-oriented processing for scanned pages when required.',
    ],
    considerations: [
      'RTF cannot represent every PDF layout feature exactly.',
      'Fonts, tables, columns, page positioning, and graphics can change.',
      'Scanned-page recognition can introduce OCR errors.',
      'Review the converted document before relying on formatting or important text.',
    ],
    faqs: [
      {
        question: 'What is RTF?',
        answer:
          'RTF is an editable rich-text document format supported by many word-processing applications.',
      },
      {
        question: 'Can I choose selected pages?',
        answer:
          'Yes. The current tool includes a page-range option.',
      },
      {
        question: 'Does RTF preserve the PDF layout exactly?',
        answer:
          'No guarantee should be assumed because PDF and RTF represent document layout differently.',
      },
      {
        question: 'Can scanned pages use OCR?',
        answer:
          'The current configuration includes an OCR-language option intended for scanned PDF workflows.',
      },
    ],
  },

  'pdf-to-epub': {
    intro:
      'PDF to EPUB converts PDF document content into EPUB format for e-book reading workflows. EPUB is designed for reflowable reading, while PDF normally uses fixed page positioning.',
    howTitle: 'How PDF to EPUB conversion works',
    how:
      'Upload the PDF and start conversion. The document content is interpreted and written into an EPUB file that can be opened in compatible e-book readers.',
    useCases: [
      'Prepare document text for reading in EPUB-compatible applications.',
      'Move long-form PDF content into an e-book workflow.',
      'Create a reflowable reading format from a fixed-page document.',
      'Use document content on devices that support EPUB files.',
    ],
    considerations: [
      'PDF and EPUB use different layout models, so page positioning does not transfer directly.',
      'Complex columns, tables, footnotes, graphics, and unusual page structures can change during conversion.',
      'Scanned image-only PDFs may not contain usable text unless recognition is performed separately.',
      'Review headings, paragraph order, images, and chapter flow in the converted EPUB.',
    ],
    faqs: [
      {
        question: 'Will EPUB keep the same PDF page layout?',
        answer:
          'Not necessarily. EPUB is commonly reflowable, so text adapts to the reader window instead of preserving fixed PDF pages.',
      },
      {
        question: 'What happens to images and complex layouts?',
        answer:
          'Some visual content can be transferred or simplified, but complex PDF layout does not always map cleanly into EPUB structure.',
      },
      {
        question: 'Can scanned PDFs convert well to EPUB?',
        answer:
          'Image-only scanned PDFs can require OCR before meaningful editable or reflowable text can be produced.',
      },
      {
        question: 'Should I review the e-book after conversion?',
        answer:
          'Yes. Check reading order, headings, spacing, images, and paragraph structure before relying on the EPUB.',
      },
    ],
  },

  'pdf-to-mobi': {
    intro:
      'PDF to MOBI converts PDF content into MOBI e-book format for compatible reading software and older e-reader workflows.',
    howTitle: 'How PDF to MOBI conversion works',
    how:
      'Upload the PDF and start conversion. The document content is interpreted and packaged into a MOBI file for download.',
    useCases: [
      'Convert document content for software that accepts MOBI.',
      'Prepare older e-book workflows from PDF source material.',
      'Move long-form reading material away from fixed PDF pages.',
      'Create a MOBI copy for compatible personal reading devices or applications.',
    ],
    considerations: [
      'MOBI and PDF use different document structures, so layout can change.',
      'Complex page designs, tables, columns, and embedded graphics may not reproduce exactly.',
      'Scanned PDFs may need OCR before meaningful text conversion is possible.',
      'MOBI is an older e-book format, so compatibility depends on the target reader or application.',
    ],
    faqs: [
      {
        question: 'Will the MOBI file look exactly like the PDF?',
        answer:
          'No exact layout match should be expected because MOBI is designed for e-book reading rather than fixed PDF page positioning.',
      },
      {
        question: 'Can scanned PDFs be converted?',
        answer:
          'Image-based scanned PDFs can require OCR before usable text can be converted into an e-book format.',
      },
      {
        question: 'Why would I use MOBI?',
        answer:
          'MOBI can be useful when working with older e-book readers or software that still supports the format.',
      },
      {
        question: 'Should I test the converted file?',
        answer:
          'Yes. Open it in the target reader and check text flow, headings, images, and chapter structure.',
      },
    ],
  },

  'pdf-to-azw3': {
    intro:
      'PDF to AZW3 converts PDF content into AZW3 e-book format for compatible Kindle-oriented reading workflows.',
    howTitle: 'How PDF to AZW3 conversion works',
    how:
      'Upload the PDF and start conversion. The document content is interpreted and written into an AZW3 e-book file.',
    useCases: [
      'Prepare long-form PDF content for AZW3-compatible readers.',
      'Create an e-book-oriented copy of a fixed-page document.',
      'Move reading material into a reflowable Kindle-compatible format.',
      'Use PDF content in applications that support AZW3 files.',
    ],
    considerations: [
      'Fixed PDF layout and reflowable e-book layout are fundamentally different.',
      'Tables, columns, footnotes, and complex graphics can require cleanup.',
      'Image-only scanned PDFs may need OCR before useful text conversion.',
      'Reader compatibility varies by device and application.',
    ],
    faqs: [
      {
        question: 'Does AZW3 preserve PDF pages exactly?',
        answer:
          'Not necessarily. AZW3 is intended for e-book reading and can reflow content rather than preserving fixed PDF pages.',
      },
      {
        question: 'What happens to complex formatting?',
        answer:
          'Complex formatting can be simplified or rearranged during conversion.',
      },
      {
        question: 'Can image-only PDFs convert to readable AZW3 text?',
        answer:
          'They may require OCR first because visible text in scanned pages can be stored only as images.',
      },
      {
        question: 'Should the output be checked on the target reader?',
        answer:
          'Yes. Verify headings, paragraph order, images, and navigation in the application or device where you plan to read it.',
      },
    ],
  },

  'epub-to-pdf': {
    intro:
      'EPUB to PDF converts an EPUB e-book into a fixed-page PDF document for printing, sharing, or viewing in PDF-compatible software.',
    howTitle: 'How EPUB to PDF conversion works',
    how:
      'Upload the EPUB file and start conversion. Reflowable e-book content is laid out into fixed PDF pages and written to a downloadable PDF.',
    useCases: [
      'Create a printable copy of EPUB reading material.',
      'Share content with someone who prefers PDF.',
      'Archive e-book content in a fixed-page format.',
      'Use EPUB content in document workflows that require PDF.',
    ],
    considerations: [
      'EPUB is reflowable while PDF uses fixed pages, so pagination is created during conversion.',
      'Fonts, margins, images, page breaks, and chapter flow can differ from the source e-book reader view.',
      'Interactive or reader-specific EPUB features may not transfer to static PDF.',
      'Review the resulting page layout before printing or distribution.',
    ],
    faqs: [
      {
        question: 'Why can the page count change?',
        answer:
          'EPUB content reflows according to screen and reader settings. PDF conversion creates fixed pages, so pagination is newly generated.',
      },
      {
        question: 'Are EPUB fonts always preserved?',
        answer:
          'Not necessarily. Font availability and embedding can affect the converted PDF.',
      },
      {
        question: 'Do interactive e-book features remain interactive?',
        answer:
          'A standard PDF is more static, so EPUB-specific reader behavior should not be assumed to transfer.',
      },
      {
        question: 'Should I review the PDF before printing?',
        answer:
          'Yes. Check chapter starts, images, page breaks, margins, and text flow.',
      },
    ],
  },

  'mobi-to-pdf': {
    intro:
      'MOBI to PDF converts MOBI e-book content into a fixed-page PDF document for compatible document, printing, and archiving workflows.',
    howTitle: 'How MOBI to PDF conversion works',
    how:
      'Upload the MOBI file and start conversion. The e-book content is rendered into fixed PDF pages and saved as a PDF document.',
    useCases: [
      'Create a PDF copy of MOBI reading material.',
      'Prepare content for printing.',
      'Open e-book content in PDF-oriented document workflows.',
      'Archive an older MOBI file in another commonly supported document format.',
    ],
    considerations: [
      'MOBI content can reflow while PDF pages are fixed.',
      'Page breaks and pagination are generated during conversion.',
      'Reader-specific formatting or features may not transfer directly.',
      'Review images, chapter structure, fonts, and page layout after conversion.',
    ],
    faqs: [
      {
        question: 'Will the PDF have the same pages as the MOBI reader?',
        answer:
          'Not necessarily. MOBI can reflow text according to reader settings, while PDF requires fixed pagination.',
      },
      {
        question: 'Can formatting change?',
        answer:
          'Yes. Fonts, spacing, page breaks, and image placement can differ.',
      },
      {
        question: 'Why convert MOBI to PDF?',
        answer:
          'PDF can be useful for printing, document sharing, or workflows that do not support MOBI.',
      },
      {
        question: 'Should converted pages be reviewed?',
        answer:
          'Yes. Check chapter flow, images, text wrapping, and page breaks.',
      },
    ],
  },

  'azw3-to-pdf': {
    intro:
      'AZW3 to PDF converts compatible AZW3 e-book content into fixed PDF pages for document-oriented viewing, printing, or archiving.',
    howTitle: 'How AZW3 to PDF conversion works',
    how:
      'Upload the AZW3 file and start conversion. The readable e-book content is rendered into a PDF document for download.',
    useCases: [
      'Create a fixed-page copy of compatible AZW3 content.',
      'Prepare e-book content for printing.',
      'Use AZW3 material in software that expects PDF files.',
      'Archive compatible reading material in PDF format.',
    ],
    considerations: [
      'AZW3 and PDF use different layout behavior, so pagination can change.',
      'Fonts, images, spacing, and chapter layout can differ from an e-reader view.',
      'Protected or restricted e-book files may not be convertible.',
      'Only convert files you are authorized to process.',
    ],
    faqs: [
      {
        question: 'Will every AZW3 file convert?',
        answer:
          'Not necessarily. Compatibility can depend on the file structure and whether restrictions or protection are present.',
      },
      {
        question: 'Why does pagination change?',
        answer:
          'E-book content is commonly reflowable, while PDF requires fixed pages.',
      },
      {
        question: 'Can I convert protected e-books?',
        answer:
          'Do not assume protected content can or should be converted. Only process files you are authorized to use.',
      },
      {
        question: 'Should the result be reviewed?',
        answer:
          'Yes. Check text flow, images, chapter headings, fonts, and page breaks.',
      },
    ],
  },

  'url-to-pdf': {
    intro:
      'URL to PDF captures a supported web page and renders it into a PDF document using the website URL you provide.',
    howTitle: 'How URL to PDF works',
    how:
      'Enter a supported website URL and start processing. The page is loaded by the conversion service and rendered into PDF output.',
    useCases: [
      'Save a web page as a document for offline reference.',
      'Create a PDF snapshot of accessible web content.',
      'Prepare web information for document-based sharing or review.',
      'Archive a page state for personal reference when permitted.',
    ],
    considerations: [
      'Web pages can change after capture, so the PDF represents the rendered state at processing time.',
      'Login-only content, interactive elements, animations, lazy-loaded content, or blocked resources may not render as expected.',
      'Responsive layout can differ from what you see in your own browser.',
      'Only capture content when you have the right or permission to do so.',
    ],
    faqs: [
      {
        question: 'Will the PDF look exactly like my browser view?',
        answer:
          'Not necessarily. Rendering can differ because of screen size, fonts, scripts, blocked resources, and responsive layout.',
      },
      {
        question: 'Can private or login-only pages be captured?',
        answer:
          'Pages that require authentication or special browser state may not be accessible to the conversion service.',
      },
      {
        question: 'Are videos and interactive controls preserved?',
        answer:
          'A PDF is static, so interactive website behavior should not be expected to remain interactive.',
      },
      {
        question: 'Can I capture any website?',
        answer:
          'Access and rendering depend on the target site, network availability, technical restrictions, and your authorization to use the content.',
      },
    ],
  },

  'ms-outlook-to-pdf': {
    intro:
      'Outlook to PDF converts a supported Outlook message file into PDF format for document-based viewing, sharing, or archiving.',
    howTitle: 'How Outlook to PDF conversion works',
    how:
      'Upload the supported Outlook file and start conversion. Readable message content is interpreted and rendered into a PDF document.',
    useCases: [
      'Archive an email message as a PDF.',
      'Create a fixed document copy for records or review.',
      'Share message content with someone who does not use Outlook.',
      'Include email correspondence in a document-based workflow.',
    ],
    considerations: [
      'Email message structure can include HTML, plain text, attachments, embedded images, metadata, and formatting that may render differently.',
      'Do not assume attachments are merged into the PDF unless the tool explicitly supports that behavior.',
      'Complex HTML email design can change during rendering.',
      'Handle confidential email content carefully and only process messages you are authorized to use.',
    ],
    faqs: [
      {
        question: 'Are email attachments included automatically?',
        answer:
          'Do not assume attachments are embedded in the converted PDF unless the tool explicitly provides that feature.',
      },
      {
        question: 'Can HTML email formatting change?',
        answer:
          'Yes. Complex HTML, remote images, fonts, and email-client-specific styling can render differently.',
      },
      {
        question: 'Why convert an Outlook message to PDF?',
        answer:
          'PDF can be useful for records, review, printing, or sharing a fixed copy of message content.',
      },
      {
        question: 'Should sensitive email be uploaded?',
        answer:
          'Use appropriate judgment with confidential information and only process messages you are authorized to handle.',
      },
    ],
  },

  'add-watermark': {
    intro:
      'Add Watermark places configurable text over selected PDF pages. You can control the watermark text, opacity, font size, rotation, and page range.',
    howTitle: 'How PDF watermarking works',
    how:
      'Upload the PDF, enter the watermark text, adjust opacity, font size, and rotation, and choose which pages should receive it. The tool creates a new PDF with the watermark applied.',
    useCases: [
      'Mark drafts, samples, or internal documents.',
      'Add a visible ownership or review label.',
      'Apply status text such as Draft or Confidential when appropriate.',
      'Watermark selected pages instead of the entire document.',
    ],
    considerations: [
      'A visible watermark is not a substitute for encryption, access control, or digital rights management.',
      'Low opacity can be difficult to read, while high opacity can obscure document content.',
      'Rotation and font size should be chosen so important underlying text remains readable.',
      'Only add branding or ownership marks you are authorized to use.',
    ],
    faqs: [
      {
        question: 'Can I watermark only certain pages?',
        answer:
          'Yes. The current tool includes a page-range control.',
      },
      {
        question: 'Can I adjust watermark transparency?',
        answer:
          'Yes. The opacity option controls how transparent or visible the watermark appears.',
      },
      {
        question: 'Can the watermark be rotated?',
        answer:
          'Yes. The tool includes a rotation setting in degrees.',
      },
      {
        question: 'Does a watermark prevent copying or editing?',
        answer:
          'No. A visible watermark is primarily a visual mark and should not be treated as access-control or encryption protection.',
      },
    ],
  },

  'add-numbers-to-pdf': {
    intro:
      'Add Page Numbers places sequential page numbers on selected PDF pages with configurable position, font size, starting number, and page range.',
    howTitle: 'How adding PDF page numbers works',
    how:
      'Upload the PDF, choose the number position and font size, set the starting number, and select the pages that should be numbered. The tool creates a new PDF with the numbering applied.',
    useCases: [
      'Number pages in reports, manuals, or handouts.',
      'Start numbering from a custom value.',
      'Apply numbers only to part of a document.',
      'Add visible page references before printing or review.',
    ],
    considerations: [
      'Displayed PDF page numbers are visual labels and can differ from the internal page index used by a PDF viewer.',
      'Existing headers, footers, or page content can overlap with added numbers.',
      'Choose position and font size carefully for documents with narrow margins.',
      'Review the first and last numbered pages before distributing the result.',
    ],
    faqs: [
      {
        question: 'Can numbering start from a number other than 1?',
        answer:
          'Yes. Use the Start Number setting to choose the first visible number.',
      },
      {
        question: 'Can I number selected pages only?',
        answer:
          'Yes. The tool includes a page-range option.',
      },
      {
        question: 'Where can page numbers be placed?',
        answer:
          'Use the Position control to select from the locations supported by the current tool.',
      },
      {
        question: 'Can added numbers overlap existing text?',
        answer:
          'Yes. Documents with existing headers, footers, or small margins should be reviewed after numbering.',
      },
    ],
  },

  'pdf-ocr': {
    intro:
      'PDF OCR recognizes text from scanned or image-based PDF pages. It is useful when words are visible on the page but cannot be selected, searched, or copied as normal PDF text.',
    howTitle: 'How PDF OCR works',
    how:
      'Upload a scanned PDF, choose the OCR language and output format, and optionally limit processing to a page range. The tool analyzes page images, recognizes visible characters, and produces a Word document, searchable PDF, or text file according to the selected output.',
    useCases: [
      'Make scanned document text searchable or copyable.',
      'Convert selected scanned pages into editable Word text.',
      'Create a text file for indexing, review, or downstream processing.',
      'Add a searchable text layer to compatible scanned PDF workflows.',
    ],
    considerations: [
      'OCR is recognition, not exact transcription. Names, numbers, punctuation, tables, and unusual fonts should be checked against the source page.',
      'Select the language that best matches the document because language choice can affect recognition.',
      'Low-resolution, blurred, skewed, handwritten, or heavily stylized text can reduce OCR accuracy.',
      'Use a page range when you only need part of a large document.',
    ],
    faqs: [
      {
        question: 'When should I use PDF OCR instead of PDF to Text?',
        answer:
          'Use OCR when the PDF contains scanned page images without a usable text layer. For PDFs that already contain selectable text, normal text extraction is usually more appropriate.',
      },
      {
        question: 'What output formats are available?',
        answer:
          'The current tool configuration supports Word document, searchable PDF, and text-file output.',
      },
      {
        question: 'Does OCR guarantee perfect text recognition?',
        answer:
          'No. Recognition depends on scan quality, language, typography, page layout, and image clarity. Important values should be checked against the original page.',
      },
      {
        question: 'Can I OCR only selected pages?',
        answer:
          'Yes. Use the page-range option when you only need particular pages.',
      },
    ],
  },

  'pdf-translator': {
    intro:
      'PDF Translator extracts readable content from a PDF and translates it into the selected target language. It is intended for understanding document text rather than reproducing every visual detail of the original page layout.',
    howTitle: 'How PDF translation works',
    how:
      'Upload a PDF, choose the target language, select the output mode, and optionally enter a page range. The document content is processed and translated into either text or PDF output according to the selected setting.',
    useCases: [
      'Read documents written in another supported language.',
      'Translate selected pages instead of processing an entire document.',
      'Create translated text for review or further editing.',
      'Prepare a translated PDF output when PDF format is preferred.',
    ],
    considerations: [
      'Translation can change wording, tone, terminology, and sentence structure.',
      'Technical, legal, financial, medical, and specialized terminology should be reviewed by a qualified person when accuracy matters.',
      'Scanned pages may depend on OCR before translation, so scan quality can affect the translated result.',
      'The translated output should not be assumed to preserve the source PDF layout exactly.',
    ],
    faqs: [
      {
        question: 'Can I translate only part of a PDF?',
        answer:
          'Yes. The tool includes a page-range option so you can process selected pages.',
      },
      {
        question: 'Can the translated result be downloaded as PDF?',
        answer:
          'The current configuration offers text output and PDF output.',
      },
      {
        question: 'How closely does the translated PDF follow the source layout?',
        answer:
          'Not necessarily. The tool focuses on translated document content, and layout can differ from the source.',
      },
      {
        question: 'Should important translations be reviewed?',
        answer:
          'Yes. Machine translation can produce incorrect or ambiguous wording, especially with specialized terminology.',
      },
    ],
  },

  'pdf-deskew': {
    intro:
      'PDF Deskew straightens scanned pages that appear tilted because the original paper was not aligned correctly during scanning or capture.',
    howTitle: 'How PDF deskewing works',
    how:
      'Upload the PDF and optionally enter a page range. The tool analyzes the selected scanned pages and adjusts page orientation to reduce visible skew before producing a processed PDF.',
    useCases: [
      'Straighten tilted document scans.',
      'Prepare scanned pages before OCR.',
      'Improve readability of forms, receipts, notes, or archived documents.',
      'Correct selected pages in a mixed-quality scan.',
    ],
    considerations: [
      'Deskewing corrects page tilt; it does not reconstruct missing or cropped content.',
      'Pages with little text, unusual graphics, or severe perspective distortion may be harder to align accurately.',
      'Review the processed pages when exact positioning matters.',
      'Use a page range if only some pages are skewed.',
    ],
    faqs: [
      {
        question: 'Does deskewing perform OCR?',
        answer:
          'No. Deskewing focuses on straightening page orientation. OCR is a separate operation for recognizing text.',
      },
      {
        question: 'Can I deskew only certain pages?',
        answer:
          'Yes. The tool provides a page-range option.',
      },
      {
        question: 'Will deskew fix perspective distortion?',
        answer:
          'It is designed primarily for page tilt. Strong perspective distortion may require additional image correction.',
      },
      {
        question: 'Should I deskew before OCR?',
        answer:
          'For visibly tilted scans, deskewing first can make the page easier for OCR systems to analyze.',
      },
    ],
  },

  'pdf-enhance-scan': {
    intro:
      'Enhance Scanned PDF adjusts scanned page appearance using contrast, sharpness, and denoising-oriented processing. It can help make faint or noisy scans easier to read before other document operations.',
    howTitle: 'How scanned PDF enhancement works',
    how:
      'Upload the scanned PDF, choose an enhancement level, and optionally select a page range. The selected pages are processed and written to a new PDF.',
    useCases: [
      'Improve readability of faded scans.',
      'Reduce visible scan noise before OCR.',
      'Prepare photographed or scanned paperwork for review.',
      'Apply enhancement only to affected pages in a longer PDF.',
    ],
    considerations: [
      'Enhancement changes the rendered appearance of scanned content and cannot restore information that is absent from the source.',
      'Higher enhancement is not always better; aggressive processing can alter fine details.',
      'Check signatures, small text, stamps, numbers, and faint markings after processing.',
      'For text recognition, compare OCR results before and after enhancement rather than assuming improvement.',
    ],
    faqs: [
      {
        question: 'What does the enhancement level change?',
        answer:
          'It controls the strength of the scan-processing adjustments applied by the tool.',
      },
      {
        question: 'Can enhancement recover missing text?',
        answer:
          'No. It can improve visible contrast or clarity, but it cannot recreate source information that was not captured.',
      },
      {
        question: 'Can I process selected pages?',
        answer:
          'Yes. Use the page-range option to limit processing.',
      },
      {
        question: 'Is enhancement the same as OCR?',
        answer:
          'No. Enhancement changes page appearance, while OCR recognizes characters from page images.',
      },
    ],
  },

  'extract-text-from-pdf': {
    intro:
      'Extract Text from PDF pulls textual content from selected PDF pages and saves the result as a text file. An OCR fallback option is available for scanned pages that do not contain normal selectable text.',
    howTitle: 'How PDF text extraction works',
    how:
      'Upload the PDF, optionally enter a page range, and choose whether OCR fallback should be used for scanned pages. The tool extracts available text and creates a TXT output.',
    useCases: [
      'Copy document text into another workflow.',
      'Create plain-text content for searching or indexing.',
      'Extract selected pages from a long PDF.',
      'Attempt OCR on image-based pages when normal extraction finds no text layer.',
    ],
    considerations: [
      'Plain-text output does not preserve the full visual PDF layout.',
      'Columns, tables, headers, footers, and complex reading order can appear differently in extracted text.',
      'OCR fallback can introduce recognition errors.',
      'Use table extraction instead when the main requirement is structured tabular data.',
    ],
    faqs: [
      {
        question: 'What happens to formatting?',
        answer:
          'TXT is a plain-text format, so page design, fonts, positioning, images, and most layout information are not preserved.',
      },
      {
        question: 'What is OCR fallback?',
        answer:
          'It allows the tool to try recognizing text from scanned or image-based pages when normal PDF text extraction is insufficient.',
      },
      {
        question: 'Can I extract only selected pages?',
        answer:
          'Yes. Leave the page range empty for all pages or enter the pages you need.',
      },
      {
        question: 'Should I use this for tables?',
        answer:
          'For structured tables, the dedicated Extract Tables from PDF tool is usually more appropriate.',
      },
    ],
  },

  'extract-images-pdf': {
    intro:
      'Extract Images from PDF collects image assets from selected PDF pages and packages the generated files for download.',
    howTitle: 'How PDF image extraction works',
    how:
      'Upload a PDF, choose the available image-format setting, and optionally limit extraction to a page range. The extracted image files are packaged into a ZIP archive.',
    useCases: [
      'Recover embedded photographs or graphics from a PDF.',
      'Collect images from selected pages.',
      'Prepare extracted assets for editing or review.',
      'Separate document images from surrounding PDF text.',
    ],
    considerations: [
      'A PDF page can contain multiple kinds of graphics, masks, backgrounds, and vector elements; not every visible element is necessarily stored as a standalone image.',
      'Extracted assets can differ in dimensions or appearance from the way they are displayed on the PDF page.',
      'Page text is not included as part of image extraction unless it is itself part of an image.',
      'Review extracted files before relying on them for reuse.',
    ],
    faqs: [
      {
        question: 'Why is the result downloaded as a ZIP?',
        answer:
          'A PDF can contain multiple extracted images, so the files are packaged together for download.',
      },
      {
        question: 'Can I extract from selected pages only?',
        answer:
          'Yes. The tool includes a page-range option.',
      },
      {
        question: 'Will every visible graphic become an image file?',
        answer:
          'Not necessarily. PDFs can contain vector graphics, text, masks, and composite page elements that are not stored as ordinary standalone images.',
      },
      {
        question: 'Does this extract PDF text?',
        answer:
          'No. Use the text-extraction tool when you need textual content.',
      },
    ],
  },

  'extract-tables-from-pdf': {
    intro:
      'Extract Tables from PDF attempts to turn tabular content from selected PDF pages into structured data for CSV-style or other supported table output.',
    howTitle: 'How PDF table extraction works',
    how:
      'Upload a PDF, choose the output-format option, and optionally select a page range. The tool analyzes page content for table structure and creates the requested tabular output.',
    useCases: [
      'Move simple PDF tables into spreadsheet workflows.',
      'Extract selected report pages containing tabular data.',
      'Create machine-readable rows and columns from digital documents.',
      'Reduce manual copying of repeated table values.',
    ],
    considerations: [
      'PDFs store visual page instructions rather than native spreadsheet rows and columns.',
      'Merged cells, multiline values, borderless tables, scanned pages, and complex layouts can reduce extraction accuracy.',
      'Important totals, dates, decimal values, IDs, and column alignment should be verified against the source PDF.',
      'Scanned tables may require OCR-oriented processing and can be less reliable than digital PDF tables.',
    ],
    faqs: [
      {
        question: 'Will every PDF table extract perfectly?',
        answer:
          'No. Results depend heavily on how the table is represented in the PDF and how complex the layout is.',
      },
      {
        question: 'Can I extract tables from selected pages?',
        answer:
          'Yes. The current tool configuration includes a page-range option.',
      },
      {
        question: 'Should I verify extracted numbers?',
        answer:
          'Yes. Verify important numeric values and column alignment before using extracted data for calculations or reporting.',
      },
      {
        question: 'What if my PDF contains a scanned table?',
        answer:
          'Image-based tables are more difficult to recover because text recognition and table-structure detection are both required.',
      },
    ],
  },
};

export function PdfToolSupportingContent({ toolId }: { toolId: string }) {
  const content = CONTENT[toolId];

  if (!content) {
    return null;
  }

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-8 py-14">
      <div className="space-y-12">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            About this PDF tool
          </h2>
          <p className="max-w-4xl text-gray-700 leading-7">
            {content.intro}
          </p>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {content.howTitle}
          </h2>
          <p className="max-w-4xl text-gray-700 leading-7">
            {content.how}
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-5">
            When this tool is useful
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {content.useCases.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-gray-200 bg-white p-5 text-sm leading-6 text-gray-700"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-5">
            Important considerations
          </h2>
          <ul className="space-y-3 text-gray-700">
            {content.considerations.map((item) => (
              <li key={item} className="flex gap-3 leading-7">
                <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-5">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {content.faqs.map((faq) => (
              <details
                key={faq.question}
                className="rounded-xl border border-gray-200 bg-white p-5"
              >
                <summary className="cursor-pointer font-semibold text-gray-900">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm leading-6 text-gray-700">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-5 text-sm leading-6 text-gray-700">
          Need another PDF operation?{' '}
          <Link
            href="/all-tools/pdf-tools"
            className="font-semibold text-indigo-700 underline underline-offset-2"
          >
            Browse all PDF tools
          </Link>
          .
        </div>
      </div>
    </section>
  );
}
