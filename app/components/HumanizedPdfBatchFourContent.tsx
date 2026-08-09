'use client';

import FAQSection from '@/app/components/FAQSection';

export const BATCH_FOUR_PDF_TOOL_IDS = new Set([
  'pdf-to-docx',
  'pdf-to-pptx',
  'pdf-to-xlsx',
  'pdf-to-html',
  'pdf-to-rtf',
  'pdf-to-epub',
  'pdf-to-mobi',
  'pdf-to-azw3',
  'epub-to-pdf',
  'mobi-to-pdf',
  'azw3-to-pdf',
  'url-to-pdf',
  'ms-outlook-to-pdf',
]);

type Section = {
  heading: string;
  paragraphs: string[];
};

type FAQ = {
  question: string;
  answer: string;
};

type ToolContent = {
  sections: Section[];
  faqs: FAQ[];
};

const CONTENT: Record<string, ToolContent> = {
  'pdf-to-docx': {
    sections: [
      {
        heading: 'Turn PDF Text Into an Editable DOCX',
        paragraphs: [
          'PDF and Word documents are built differently. A PDF records content on fixed pages, while DOCX is designed for editing and flowing text. This converter therefore focuses on extracting usable text rather than rebuilding every visual element of the PDF.',
          'You can process the complete document or select a page range. When a page does not contain usable embedded text, OCR can be used as a fallback.',
        ],
      },
      {
        heading: 'What Happens to Scanned Pages',
        paragraphs: [
          'Scanned PDFs often contain images of text rather than text that can be selected or copied. For those pages, OCR attempts to recognize the visible characters and place the recognized text into the Word document.',
          'OCR is not exact. Scan quality, page rotation, unusual fonts, handwriting, background noise and small characters can affect recognition.',
        ],
      },
      {
        heading: 'Why the Word Layout Can Change',
        paragraphs: [
          'The current conversion extracts document text into DOCX and does not reconstruct the original fixed PDF layout.',
          'Columns, tables, graphics, text boxes, fonts and precise page positioning may therefore require manual work after conversion.',
        ],
      },
      {
        heading: 'Review Important Content Before Editing',
        paragraphs: [
          'For reports, contracts, applications, financial documents or academic material, compare names, numbers, dates and other important text with the PDF before relying on the converted Word file.',
          'Think of the DOCX as an editable starting point rather than a guaranteed replacement for the original document.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Will the DOCX look exactly like my PDF?',
        answer: 'No. The current conversion extracts text into DOCX rather than rebuilding the original fixed PDF layout.',
      },
      {
        question: 'Can scanned PDF pages be converted?',
        answer: 'Yes. OCR can be used when a page does not contain a usable text layer. Recognition accuracy depends on the scanned source.',
      },
      {
        question: 'Can I convert only selected pages?',
        answer: 'Yes. The tool includes a page-range option.',
      },
    ],
  },

  'pdf-to-pptx': {
    sections: [
      {
        heading: 'Put PDF Pages Into a PowerPoint Presentation',
        paragraphs: [
          'This tool is useful when complete PDF pages need to become slides in a PPTX presentation. Each selected PDF page is rendered and placed onto its own slide.',
          'That approach preserves the page as a visual reference but does not recreate the PDF as native PowerPoint objects.',
        ],
      },
      {
        heading: 'The Slides Are Image-Based',
        paragraphs: [
          'Text, diagrams, charts and other page elements are represented inside the rendered page image. They should not be expected to become separate editable PowerPoint text boxes, shapes or charts.',
          'If extensive editing is required, the converted presentation can serve as a starting point, but the underlying slide content may need to be rebuilt manually.',
        ],
      },
      {
        heading: 'Choose Only the Pages You Need',
        paragraphs: [
          'The page-range control lets you convert selected pages instead of the complete PDF. This is useful when only part of a report, brochure or document belongs in the presentation.',
        ],
      },
      {
        heading: 'Check Readability Before Presenting',
        paragraphs: [
          'A PDF page and a presentation slide can have different proportions. Small text or detailed tables may become difficult to read when the page is fitted onto a slide.',
          'Review the final PPTX in the presentation software you plan to use.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does each PDF page become one slide?',
        answer: 'Yes. Each selected PDF page is rendered and placed on a corresponding PowerPoint slide.',
      },
      {
        question: 'Will PDF text become editable PowerPoint text?',
        answer: 'No. The current conversion creates image-based slides rather than reconstructing native PowerPoint text and objects.',
      },
      {
        question: 'Can original PowerPoint animations be recovered?',
        answer: 'No. PDF files do not contain the original presentation animation, transition or speaker-note structure.',
      },
    ],
  },

  'pdf-to-xlsx': {
    sections: [
      {
        heading: 'Move PDF Tables Into an Excel Workbook',
        paragraphs: [
          'PDF to XLSX is primarily a data-extraction workflow. The converter examines selected PDF pages for tables and writes detected data into an Excel workbook.',
          'When no table is detected on a page, extracted page text can be used as fallback content.',
        ],
      },
      {
        heading: 'Why PDF Tables Can Be Difficult to Reconstruct',
        paragraphs: [
          'A PDF may only store values according to their visual positions on a page. It usually does not contain the original spreadsheet cells, formulas or workbook structure.',
          'Merged cells, multiline headings, irregular spacing and complicated reports can therefore require cleanup in Excel.',
        ],
      },
      {
        heading: 'Original Spreadsheet Logic Cannot Be Recovered',
        paragraphs: [
          'If the PDF came from Excel originally, formulas, workbook relationships and hidden spreadsheet logic are generally no longer present in the PDF.',
          'The output should be treated as extracted data, not as recovery of the original workbook.',
        ],
      },
      {
        heading: 'Verify Important Numbers',
        paragraphs: [
          'Check totals, decimal values, dates, percentages, identifiers and column assignments before using the XLSX for calculations or business decisions.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Are original Excel formulas restored?',
        answer: 'No. PDF normally contains the displayed values rather than the formulas or workbook logic that created them.',
      },
      {
        question: 'What happens when a page has no detected table?',
        answer: 'The current converter can use extracted page text as fallback content.',
      },
      {
        question: 'Can I select only certain pages?',
        answer: 'Yes. Use the page-range option when only part of the PDF is needed.',
      },
    ],
  },

  'pdf-to-html': {
    sections: [
      {
        heading: 'Extract PDF Text Into an HTML Document',
        paragraphs: [
          'PDF to HTML is intended for moving document text into a browser-readable format. It extracts text from selected PDF pages and writes that content into HTML.',
          'If a page has no usable text layer, OCR can be used as a fallback.',
        ],
      },
      {
        heading: 'HTML Does Not Recreate the PDF Page',
        paragraphs: [
          'PDF uses fixed page positioning while HTML is designed for flowing browser content. The conversion therefore does not reproduce the complete visual PDF layout.',
          'Columns, graphics, fonts, exact positioning and complex page design may be simplified or absent.',
        ],
      },
      {
        heading: 'OCR Text Still Needs Review',
        paragraphs: [
          'Scanned pages can be processed using the available OCR language setting, but recognition can contain errors.',
          'Check names, numbers and other important information against the original page.',
        ],
      },
      {
        heading: 'Treat the Output as a Starting Point for the Web',
        paragraphs: [
          'Before publishing generated HTML, review the structure, headings, accessibility, links and any content that needs web-specific formatting.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Will the HTML look exactly like the PDF?',
        answer: 'No. The current conversion extracts PDF text into HTML rather than recreating the complete fixed page layout.',
      },
      {
        question: 'Can scanned pages be processed?',
        answer: 'Yes. OCR can be used when a selected page does not contain usable embedded text.',
      },
      {
        question: 'Should the HTML be reviewed before publishing?',
        answer: 'Yes. Review content, structure, markup and accessibility before using the file on a public website.',
      },
    ],
  },

  'pdf-to-rtf': {
    sections: [
      {
        heading: 'Create an Editable Rich Text Document From PDF',
        paragraphs: [
          'RTF is an editable text format supported by many word processors. This converter extracts text from selected PDF pages and writes it into an RTF document.',
          'Pages without usable embedded text can use OCR fallback.',
        ],
      },
      {
        heading: 'RTF Is Better for Text Than Page Reproduction',
        paragraphs: [
          'PDF and RTF represent documents differently. The conversion is intended to make text reusable rather than reproduce every detail of the PDF page.',
          'Tables, columns, graphics, fonts and precise positioning may change or require manual reconstruction.',
        ],
      },
      {
        heading: 'Scans Depend on OCR',
        paragraphs: [
          'For scanned pages, recognition depends on image quality and the selected language. Blurred text, skewed pages and unusual characters can reduce accuracy.',
        ],
      },
      {
        heading: 'Check the Result in Your Word Processor',
        paragraphs: [
          'Review headings, paragraph breaks, special characters, numbers and other important information before using the RTF as a finished document.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does RTF preserve the complete PDF layout?',
        answer: 'No. The current conversion extracts document text into RTF rather than recreating the fixed PDF layout.',
      },
      {
        question: 'Can OCR be used on scanned pages?',
        answer: 'Yes. OCR fallback can be used when the PDF page has no usable text layer.',
      },
      {
        question: 'Can I convert selected pages only?',
        answer: 'Yes. The tool includes a page-range control.',
      },
    ],
  },

  'pdf-to-epub': {
    sections: [
      {
        heading: 'Turn a Fixed PDF Into an EPUB E-Book',
        paragraphs: [
          'EPUB is designed for e-book reading and commonly allows text to reflow according to screen size and reader settings. PDF uses fixed pages.',
          'The conversion uses the available Calibre e-book conversion engine to create an EPUB file from the PDF.',
        ],
      },
      {
        heading: 'Expect the Reading Layout to Change',
        paragraphs: [
          'A fixed PDF page cannot be transferred directly into a reflowable e-book without interpretation. Columns, tables, footnotes, page headers and complex visual layouts can move or change.',
        ],
      },
      {
        heading: 'Scanned PDFs Need Special Attention',
        paragraphs: [
          'Image-only scanned PDFs may not contain usable document text. If meaningful reflowable text is required, OCR may need to be performed before converting the document into an e-book format.',
        ],
      },
      {
        heading: 'Check the EPUB in a Real Reader',
        paragraphs: [
          'Open the result in the reading application or device you plan to use and check headings, paragraph order, images and navigation.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Will EPUB preserve the PDF page layout?',
        answer: 'Not necessarily. EPUB and PDF use different layout models and e-book content can reflow.',
      },
      {
        question: 'What engine performs the conversion?',
        answer: 'The current backend uses the Calibre ebook-convert utility.',
      },
      {
        question: 'Should I test the converted EPUB?',
        answer: 'Yes. Check reading order, headings, images and navigation in the intended reader.',
      },
    ],
  },

  'pdf-to-mobi': {
    sections: [
      {
        heading: 'Convert PDF Reading Material to MOBI',
        paragraphs: [
          'MOBI is an older e-book format still used by some readers and software. The converter uses the available Calibre e-book conversion engine to create a MOBI file from the PDF.',
        ],
      },
      {
        heading: 'PDF Pages and E-Book Flow Are Different',
        paragraphs: [
          'PDF places content on fixed pages while MOBI is designed around e-book reading. Page layout, tables, columns, images and spacing can therefore change.',
        ],
      },
      {
        heading: 'MOBI Compatibility Varies',
        paragraphs: [
          'MOBI is no longer the preferred format for many modern reading platforms. Check that the device or application you intend to use still supports it.',
        ],
      },
      {
        heading: 'Keep the Original PDF',
        paragraphs: [
          'The MOBI output is a reading-oriented derivative. Keep the PDF when original page appearance or document structure matters.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Will MOBI look exactly like the PDF?',
        answer: 'No exact page match should be expected because MOBI and PDF use different document models.',
      },
      {
        question: 'What performs the MOBI conversion?',
        answer: 'The current backend uses Calibre ebook-convert.',
      },
      {
        question: 'Should I check device compatibility?',
        answer: 'Yes. MOBI support varies across current e-book devices and applications.',
      },
    ],
  },

  'pdf-to-azw3': {
    sections: [
      {
        heading: 'Convert PDF Content Into AZW3',
        paragraphs: [
          'AZW3 is an e-book format used in Kindle-oriented reading workflows. The converter passes the PDF through the available Calibre e-book conversion engine and creates an AZW3 file.',
        ],
      },
      {
        heading: 'Fixed Pages Become E-Book Content',
        paragraphs: [
          'PDF and AZW3 are built for different reading models. Tables, columns, images, footnotes and page-specific formatting may be rearranged.',
        ],
      },
      {
        heading: 'Scanned Documents May Need OCR First',
        paragraphs: [
          'An image-only PDF may not contain text that can be reflowed meaningfully into an e-book. OCR can be useful before e-book conversion when searchable or selectable text is required.',
        ],
      },
      {
        heading: 'Test the Result on Your Reader',
        paragraphs: [
          'Check heading structure, paragraph order, images, navigation and overall readability on the application or device where you plan to read the AZW3 file.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does AZW3 preserve every PDF page exactly?',
        answer: 'No. E-book conversion can reorganize content instead of maintaining the fixed PDF page layout.',
      },
      {
        question: 'Which engine is used for conversion?',
        answer: 'The current backend uses Calibre ebook-convert.',
      },
      {
        question: 'Should I keep the source PDF?',
        answer: 'Yes when the original page design or document structure matters.',
      },
    ],
  },

  'epub-to-pdf': {
    sections: [
      {
        heading: 'Create Fixed PDF Pages From an EPUB E-Book',
        paragraphs: [
          'EPUB content normally adapts to the reader window and text settings. PDF requires fixed pages.',
          'The conversion uses Calibre ebook-convert to render compatible EPUB content into a PDF document.',
        ],
      },
      {
        heading: 'Pagination Is Created During Conversion',
        paragraphs: [
          'An EPUB does not have one universal page count. Font size, screen dimensions and reader settings can all change where content appears.',
          'The PDF therefore creates its own pagination during conversion.',
        ],
      },
      {
        heading: 'Reader Features May Not Transfer',
        paragraphs: [
          'Interactive or application-specific e-book features should not be expected to behave the same way in a static PDF.',
        ],
      },
      {
        heading: 'Review Before Printing',
        paragraphs: [
          'Check chapter starts, page breaks, fonts, images, margins and text flow before printing or distributing an important document.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Why can the PDF page count differ from my e-reader?',
        answer: 'EPUB content reflows according to reader settings, while PDF requires fixed pages generated during conversion.',
      },
      {
        question: 'What engine is used?',
        answer: 'The current backend uses Calibre ebook-convert.',
      },
      {
        question: 'Should I review the PDF before printing?',
        answer: 'Yes. Check pagination, images, fonts and chapter boundaries first.',
      },
    ],
  },

  'mobi-to-pdf': {
    sections: [
      {
        heading: 'Turn Compatible MOBI Content Into a PDF',
        paragraphs: [
          'MOBI to PDF creates fixed PDF pages from compatible MOBI e-book content using the available Calibre conversion engine.',
          'This can be useful for printing, archiving or working with software that expects PDF instead of an e-book format.',
        ],
      },
      {
        heading: 'The PDF Gets New Pagination',
        paragraphs: [
          'MOBI text can reflow according to reader settings. A PDF cannot, so page breaks and pagination are created during conversion.',
        ],
      },
      {
        heading: 'Formatting Can Change',
        paragraphs: [
          'Fonts, images, spacing, chapter breaks and reader-specific presentation may differ from what you see in a MOBI reader.',
        ],
      },
      {
        heading: 'Use Only Content You Are Allowed to Convert',
        paragraphs: [
          'Compatibility can also depend on the file structure and restrictions applied to the e-book. Only process files you are authorized to use.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Will the PDF use the same pages as my MOBI reader?',
        answer: 'Not necessarily. MOBI can reflow while PDF requires new fixed pagination.',
      },
      {
        question: 'What performs the conversion?',
        answer: 'The backend uses Calibre ebook-convert.',
      },
      {
        question: 'Can formatting change?',
        answer: 'Yes. Fonts, text flow, images and page breaks can differ.',
      },
    ],
  },

  'azw3-to-pdf': {
    sections: [
      {
        heading: 'Convert Compatible AZW3 Content Into PDF Pages',
        paragraphs: [
          'AZW3 to PDF uses the available Calibre conversion engine to create a fixed-page PDF from compatible e-book content.',
        ],
      },
      {
        heading: 'E-Book Pagination Is Not Fixed',
        paragraphs: [
          'An e-reader can reflow text according to screen size and reader preferences. PDF requires fixed page dimensions, so pagination is generated during conversion.',
        ],
      },
      {
        heading: 'Protected Files May Not Convert',
        paragraphs: [
          'Compatibility depends on the e-book structure and any restrictions applied to it. This tool should not be treated as a DRM or protection-removal service.',
        ],
      },
      {
        heading: 'Review the Result',
        paragraphs: [
          'Check text flow, chapter headings, images, fonts and page breaks before printing or archiving the converted PDF.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Will every AZW3 file convert?',
        answer: 'No guarantee should be assumed. Compatibility can depend on file structure and restrictions.',
      },
      {
        question: 'Does the converter remove DRM?',
        answer: 'No such behavior should be assumed. Protected or restricted e-books may not convert.',
      },
      {
        question: 'What engine performs the conversion?',
        answer: 'The current backend uses Calibre ebook-convert.',
      },
    ],
  },

  'url-to-pdf': {
    sections: [
      {
        heading: 'Capture an Accessible Web Page as a PDF',
        paragraphs: [
          'URL to PDF loads the web address you provide and creates a static PDF representation of the page that the conversion environment can access.',
          'The result is a snapshot of rendered web content rather than a copy of the website application itself.',
        ],
      },
      {
        heading: 'Your Browser and the Conversion Server Can See Different Things',
        paragraphs: [
          'Responsive layouts, fonts, scripts, blocked resources and network conditions can cause the rendered PDF to differ from the page shown in your browser.',
        ],
      },
      {
        heading: 'Login-Only Content May Not Be Available',
        paragraphs: [
          'A page that depends on your personal browser session, authentication cookies or restricted network access may not be accessible to the conversion service.',
        ],
      },
      {
        heading: 'Interactive Web Features Become Static',
        paragraphs: [
          'Videos, animations, forms and other interactive website behavior should not be expected to remain interactive in the resulting PDF.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Will the PDF exactly match my browser?',
        answer: 'Not necessarily. Rendering can differ because the conversion environment has its own browser state, viewport, fonts and network access.',
      },
      {
        question: 'Can private or login-only pages be captured?',
        answer: 'Pages that require your authenticated browser session may not be accessible to the conversion service.',
      },
      {
        question: 'Can every website be converted?',
        answer: 'No. Success depends on page accessibility, network availability and how the target site behaves during rendering.',
      },
    ],
  },

  'ms-outlook-to-pdf': {
    sections: [
      {
        heading: 'Create a PDF Copy of an Outlook MSG Email',
        paragraphs: [
          'Outlook to PDF converts a supported MSG message into a fixed document representation. This can be useful for records, printing or sharing readable message content with someone who does not use Outlook.',
        ],
      },
      {
        heading: 'The Message Is Rendered as a Document',
        paragraphs: [
          'The converter reads supported message information and body content, creates an intermediate HTML representation and then renders that document into PDF.',
        ],
      },
      {
        heading: 'Attachments Are Not Automatically Merged',
        paragraphs: [
          'The PDF should not be assumed to include arbitrary attached files as additional document pages. Attachments remain a separate concern unless a tool explicitly provides attachment-merging behavior.',
        ],
      },
      {
        heading: 'HTML Email Can Render Differently',
        paragraphs: [
          'Complex email templates, remote images, fonts and Outlook-specific styling can appear differently when rendered outside the original email client.',
          'Review important correspondence before archiving or distributing the PDF.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Are Outlook attachments merged into the PDF?',
        answer: 'No such behavior should be assumed. The converter creates a PDF representation of supported message content.',
      },
      {
        question: 'Will an HTML email look exactly like Outlook?',
        answer: 'Not necessarily. Client-specific styling, remote resources and fonts can render differently.',
      },
      {
        question: 'Why convert an MSG message to PDF?',
        answer: 'PDF can be convenient for records, review, printing or sharing readable email content without Outlook.',
      },
    ],
  },
};

export default function HumanizedPdfBatchFourContent({
  toolId,
}: {
  toolId: string;
}) {
  if (!BATCH_FOUR_PDF_TOOL_IDS.has(toolId)) return null;

  const content = CONTENT[toolId];

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-8 py-12">
      <div className="space-y-12">
        {content.sections.map((section) => (
          <div key={section.heading}>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {section.heading}
            </h2>

            <div className="space-y-4 text-gray-700 leading-relaxed">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        ))}

        <FAQSection
          title="Frequently Asked Questions"
          faqs={content.faqs}
          bgColor="white"
          borderTop={true}
          includeSchema={true}
        />
      </div>
    </section>
  );
}
