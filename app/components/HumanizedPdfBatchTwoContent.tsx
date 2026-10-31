'use client';

import FAQSection from '@/app/components/FAQSection';

export const BATCH_TWO_PDF_TOOL_IDS = new Set([
  'pdf-to-word',
  'word-to-pdf',
  'pdf-to-powerpoint',
  'powerpoint-to-pdf',
  'pdf-to-excel',
  'pdf-to-csv',
  'pdf-to-text',
  'extract-tables-from-pdf',
]);

type ToolId =
  | 'pdf-to-word'
  | 'word-to-pdf'
  | 'pdf-to-powerpoint'
  | 'powerpoint-to-pdf'
  | 'pdf-to-excel'
  | 'pdf-to-csv'
  | 'pdf-to-text'
  | 'extract-tables-from-pdf';

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

const CONTENT: Record<ToolId, ToolContent> = {
  'pdf-to-word': {
    sections: [
      {
        heading: 'What PDF to Word Conversion Does',
        paragraphs: [
          'A PDF is designed primarily for consistent viewing, while a Word document is designed for editing. Converting between the two therefore involves more than changing a file extension.',
          'This tool extracts available text from the PDF and places that content into a DOCX document. If a page does not contain an extractable text layer, OCR can be used as a fallback to try to recognize visible text.',
        ],
      },
      {
        heading: 'Why the Word Document May Look Different',
        paragraphs: [
          'PDF pages store content according to a fixed page layout. Word documents use flowing paragraphs, margins, styles, and other editable structures. Those models do not map perfectly to one another.',
          'The resulting DOCX is intended to make the document text easier to reuse and edit. It should not be treated as an exact visual reconstruction of the original PDF.',
        ],
      },
      {
        heading: 'Text PDFs and Scanned PDFs',
        paragraphs: [
          'A digitally generated PDF usually contains a text layer that can be extracted directly. A scanned PDF may instead contain photographs or scans of printed pages.',
          'When OCR is needed, recognition quality depends on the source. Small text, handwriting, unusual fonts, shadows, skewed scans, low resolution, and complex page backgrounds can all produce recognition mistakes.',
        ],
      },
      {
        heading: 'Check the DOCX Before Reusing It',
        paragraphs: [
          'Review headings, paragraph breaks, lists, tables, symbols, page references, and any important numbers after conversion. Documents with columns, forms, positioned text, or complex layouts may require manual formatting in your word processor.',
          'For contracts, applications, academic material, financial documents, or other important files, compare the converted text with the original PDF before relying on it.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does PDF to Word preserve the original page layout?',
        answer: 'No exact layout preservation is promised. The tool extracts PDF text into DOCX, so page positioning, columns, tables, fonts, spacing, and other formatting can change.',
      },
      {
        question: 'Can this tool process a scanned PDF?',
        answer: 'OCR can be used as a fallback when a PDF page has no extractable text layer. OCR results depend on the clarity and structure of the scanned page.',
      },
      {
        question: 'Should I check the Word file after conversion?',
        answer: 'Yes. Review important text, numbers, tables, headings, and formatting against the original PDF before using the converted document.',
      },
    ],
  },

  'word-to-pdf': {
    sections: [
      {
        heading: 'What Happens When Word Is Converted to PDF',
        paragraphs: [
          'Word documents are editable files whose appearance can depend on fonts, page settings, styles, images, tables, and the software used to render them. PDF is a fixed-page format intended to keep a document easier to view and share consistently.',
          'This tool sends the DOC or DOCX file through the available document-conversion process and produces a PDF version for download.',
        ],
      },
      {
        heading: 'Why a Converted PDF Can Look Different',
        paragraphs: [
          'A Word document may rely on fonts or layout behavior that is not reproduced identically by the conversion environment. Line breaks, page breaks, tables, headers, footers, image placement, and spacing can therefore move.',
          'The more complex the source document is, the more useful it is to inspect the resulting PDF rather than assuming every page remained unchanged.',
        ],
      },
      {
        heading: 'Documents Worth Checking Carefully',
        paragraphs: [
          'Resumes, contracts, invoices, forms, reports, academic papers, and documents with tightly positioned elements deserve an extra review after conversion. Check page count, margins, headings, tables, images, footnotes, and any signature areas.',
          'If the document uses uncommon fonts, keeping a copy of the original Word file is especially useful in case you need to adjust the source and convert it again.',
        ],
      },
      {
        heading: 'PDF Is Better for Sharing Than Further Editing',
        paragraphs: [
          'Converting to PDF is useful when the main goal is distribution, printing, archiving, or presenting a more fixed version of a document. If you expect substantial editing later, keep the original DOC or DOCX as your working copy.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can Word formatting change during PDF conversion?',
        answer: 'Yes. Fonts, spacing, page breaks, tables, images, and other layout details can change depending on the source document and conversion environment.',
      },
      {
        question: 'Should I keep my original Word document?',
        answer: 'Yes, especially for important files. The Word document remains the better source if you need to edit the content or correct layout after conversion.',
      },
      {
        question: 'What should I check in the resulting PDF?',
        answer: 'Check page count, headings, line and page breaks, tables, images, margins, headers, footers, and any content where exact placement matters.',
      },
    ],
  },

  'pdf-to-powerpoint': {
    sections: [
      {
        heading: 'Turning PDF Pages Into Presentation Slides',
        paragraphs: [
          'PDF pages and PowerPoint slides are both page-like formats, but they are built for different purposes. A PDF normally represents a finished page, while a presentation contains slides that may include separately editable text, shapes, charts, and other objects.',
          'For this conversion, PDF pages are used to create slides rather than reconstructing every original PDF element as an independently editable PowerPoint object.',
        ],
      },
      {
        heading: 'What You Can Expect From the PPTX',
        paragraphs: [
          'The result is useful when you want PDF pages available inside a PowerPoint presentation, for example as reference material, handouts, reports, or pages that need to be presented in slide form.',
          'Do not expect paragraphs, charts, diagrams, or other objects visible in the PDF to automatically become native editable PowerPoint elements.',
        ],
      },
      {
        heading: 'Page Shape and Slide Shape May Differ',
        paragraphs: [
          'A portrait PDF page placed into a presentation slide may leave unused space around the page. Wide or unusually sized PDF pages can also require scaling to fit the slide.',
          'Review readability after conversion, particularly when the PDF contains small text or detailed tables that were originally designed for a printed page.',
        ],
      },
      {
        heading: 'Use the PDF as the Source of Record',
        paragraphs: [
          'If exact page appearance or document content matters, retain the original PDF. The PPTX is a presentation-oriented derivative and may be better suited to showing the pages than to editing their underlying content.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Will PDF text become editable PowerPoint text?',
        answer: 'Not necessarily. The conversion is page-based, so PDF content should not be assumed to become separate native PowerPoint text boxes, shapes, or charts.',
      },
      {
        question: 'Why can a PDF page look small on a slide?',
        answer: 'PDF page dimensions and PowerPoint slide dimensions can differ. The page may need to be scaled to fit inside the slide area.',
      },
      {
        question: 'Should I keep the original PDF?',
        answer: 'Yes. Keep the original PDF when its exact content or page appearance is important.',
      },
    ],
  },

  'powerpoint-to-pdf': {
    sections: [
      {
        heading: 'Why Convert a Presentation to PDF',
        paragraphs: [
          'A PowerPoint presentation is designed for presenting and editing slides. A PDF is often more convenient when you need a fixed document for sharing, printing, review, or archiving.',
          'This tool converts PPT or PPTX files through the available presentation-conversion environment and produces a PDF for download.',
        ],
      },
      {
        heading: 'Animations and Interactive Features Do Not Translate Like Slides',
        paragraphs: [
          'PDF is a static document format. Slide animations, transitions, embedded media, presenter interactions, and other presentation behavior should not be expected to work in the resulting PDF.',
          'The PDF represents rendered slide content rather than the full interactive presentation experience.',
        ],
      },
      {
        heading: 'Fonts and Layout Still Need a Visual Check',
        paragraphs: [
          'Presentations can use custom fonts, tightly positioned text, charts, images, SmartArt-like elements, and other complex layouts. Rendering differences can affect wrapping, alignment, spacing, or page appearance.',
          'Check each important slide after conversion, particularly title slides, diagrams, charts, tables, and slides where elements sit close to the edges.',
        ],
      },
      {
        heading: 'Keep the Presentation for Future Editing',
        paragraphs: [
          'The PDF is useful as a shareable output, but the original PowerPoint file should remain your editable source. Keep both when the presentation may need future revisions.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Will PowerPoint animations work in the PDF?',
        answer: 'No. PDF is a static document format, so presentation animations and transitions should not be expected to remain interactive.',
      },
      {
        question: 'Can fonts or slide layout change?',
        answer: 'They can. Rendering may differ when a presentation uses fonts or layout features that are handled differently by the conversion environment.',
      },
      {
        question: 'Should I review every slide?',
        answer: 'Review slides where layout matters, especially charts, diagrams, tables, custom fonts, tightly positioned text, and content near slide edges.',
      },
    ],
  },

  'pdf-to-excel': {
    sections: [
      {
        heading: 'PDF to Excel Is Mainly a Table Extraction Task',
        paragraphs: [
          'A PDF does not store spreadsheet cells in the same way as an Excel workbook. What looks like a table on a PDF page may be stored as positioned text, drawing instructions, or an image.',
          'This tool looks for table-like content and creates an XLSX workbook from what it can detect. The result should be treated as extracted data rather than a reconstruction of the original document.',
        ],
      },
      {
        heading: 'Why Some Tables Extract Better Than Others',
        paragraphs: [
          'Clear tables with consistent rows, columns, spacing, and readable text are easier to interpret. Merged cells, multi-line headings, irregular spacing, rotated text, nested tables, and visually complex reports can make extraction less reliable.',
          'Scanned pages add another difficulty because the visible table may not contain an underlying text layer.',
        ],
      },
      {
        heading: 'Check Numbers Before Using the Spreadsheet',
        paragraphs: [
          'A spreadsheet can look structured even when individual values were placed in the wrong column or interpreted incorrectly. Review totals, decimal values, dates, negative numbers, percentages, identifiers, and column headings.',
          'For accounting, financial analysis, inventory, research, or other consequential work, compare the extracted workbook with the PDF before using it for calculations or decisions.',
        ],
      },
      {
        heading: 'Expect Cleanup in Excel',
        paragraphs: [
          'Depending on the source PDF, you may need to rename columns, remove extra rows, correct cell placement, combine fragments, or adjust number formats after extraction. Keeping the original PDF nearby makes that cleanup easier.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does PDF to Excel recreate the original spreadsheet?',
        answer: 'No. The tool extracts detected table content from a PDF into XLSX. It does not recover the original spreadsheet formulas, formatting, workbook structure, or source file.',
      },
      {
        question: 'Why are some values placed in the wrong cells?',
        answer: 'PDF tables are often stored as positioned page content rather than true spreadsheet cells. Complex layouts can make row and column detection difficult.',
      },
      {
        question: 'Should extracted numbers be verified?',
        answer: 'Yes. Verify important numbers, dates, totals, percentages, identifiers, and column relationships against the original PDF.',
      },
    ],
  },

  'pdf-to-csv': {
    sections: [
      {
        heading: 'When CSV Is Useful for PDF Data',
        paragraphs: [
          'CSV is a simple tabular data format. It works well when the useful part of a PDF is a table that you want to inspect in a spreadsheet, import into another system, or process as rows and columns.',
          'The conversion depends on detecting table structure in the PDF. A visual table is not always stored internally as a clean grid.',
        ],
      },
      {
        heading: 'CSV Does Not Preserve Document Appearance',
        paragraphs: [
          'CSV stores values separated into fields and rows. It does not preserve PDF fonts, page design, colors, images, charts, paragraph formatting, or the visual appearance of the source document.',
          'Use this conversion when the data matters more than the page layout.',
        ],
      },
      {
        heading: 'Table Structure Can Need Cleanup',
        paragraphs: [
          'Merged headings, blank cells, wrapped labels, irregular columns, footnotes, repeated page headers, and multi-line values can make a detected table difficult to represent cleanly in CSV.',
          'After conversion, open the file and confirm that each value appears under the intended heading and that rows have not been split or combined incorrectly.',
        ],
      },
      {
        heading: 'Verify Data Before Importing It Elsewhere',
        paragraphs: [
          'If you plan to import the CSV into accounting software, a database, analytics software, or another automated workflow, validate the extracted data first. A small extraction error can become harder to notice after the data enters another system.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does CSV preserve the PDF layout?',
        answer: 'No. CSV is a row-and-column data format and does not preserve the visual design of a PDF page.',
      },
      {
        question: 'Why might a PDF table convert incorrectly?',
        answer: 'A table that looks structured visually may actually consist of separately positioned text or other page elements, making row and column detection imperfect.',
      },
      {
        question: 'Can I directly import the CSV into another system?',
        answer: 'You can use the CSV in compatible software, but important extracted data should be checked against the source PDF before automated importing or analysis.',
      },
    ],
  },

  'pdf-to-text': {
    sections: [
      {
        heading: 'What PDF to Text Extracts',
        paragraphs: [
          'PDF to Text is useful when you need the written content of a document without its page design. The tool extracts available text from the PDF and saves it in a plain TXT file.',
          'Plain text does not retain the full structure of the original PDF. Fonts, images, colors, positioned elements, and most visual formatting are not part of a TXT file.',
        ],
      },
      {
        heading: 'Reading Order Can Be Different From Visual Order',
        paragraphs: [
          'PDF text is often stored according to positions on a page rather than as ordinary paragraphs. In multi-column pages, forms, sidebars, tables, or complex layouts, extracted text can therefore appear in an unexpected sequence.',
          'A PDF that looks perfectly readable on screen is not necessarily internally organized in the same order a person reads it.',
        ],
      },
      {
        heading: 'Scanned Pages Need Different Treatment',
        paragraphs: [
          'If a page is only an image and has no text layer, ordinary text extraction may return little or no useful content. OCR is the appropriate approach when visible words need to be recognized from scanned page images.',
          'Recognition from scans can contain mistakes, so important extracted text should still be compared with the page image.',
        ],
      },
      {
        heading: 'Plain Text Is Best for Content, Not Layout',
        paragraphs: [
          'TXT is useful for searching, quoting, indexing, note-taking, basic text analysis, and moving written content into another editor. If page appearance, tables, diagrams, or precise positioning matter, keep the PDF as the reference.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Will PDF to Text keep the PDF formatting?',
        answer: 'No. TXT is plain text and does not preserve the PDF page design, fonts, images, colors, or precise positioning.',
      },
      {
        question: 'Why can extracted text appear in the wrong order?',
        answer: 'PDF content can be stored as positioned text fragments. Columns, tables, sidebars, and other layouts can affect the order in which those fragments are extracted.',
      },
      {
        question: 'What happens with a scanned PDF?',
        answer: 'A scanned page may have no extractable text layer. OCR is needed to recognize visible text from the page image, and recognition can contain errors.',
      },
    ],
  },

  'extract-tables-from-pdf': {
    sections: [
      {
        heading: 'How Table Extraction From PDF Works',
        paragraphs: [
          'A table that appears on a PDF page is not necessarily stored as a real table. It may be made from individual text fragments positioned to look like rows and columns.',
          'This tool detects table-like structures in the selected PDF pages and lets you export the first detected table as CSV or Excel (XLSX).',
        ],
      },
      {
        heading: 'Choose the Pages That Contain the Table You Need',
        paragraphs: [
          'If the PDF is long, using the page-range option can focus processing on the part of the document that contains the relevant table. This is also useful when a report contains many unrelated tables.',
          'Because the tool exports the first table it detects from the processed pages, page selection can affect which table becomes the result.',
        ],
      },
      {
        heading: 'Why Table Detection Can Be Imperfect',
        paragraphs: [
          'Simple tables with clear columns and consistent rows are easier to detect. Merged cells, nested headings, missing borders, wrapped text, irregular spacing, rotated content, or decorative layouts can make the structure ambiguous.',
          'Scanned tables can be more difficult because the page may contain an image rather than directly extractable text.',
        ],
      },
      {
        heading: 'Always Review the Extracted Table',
        paragraphs: [
          'Check headings, row boundaries, column placement, dates, decimal values, totals, and any blank cells after extraction. If the table will be used for calculations, reporting, financial work, or importing into another system, compare it with the PDF first.',
          'Extraction is a starting point for reusable data. Some PDFs will still require manual cleanup.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does this tool extract every table in the PDF?',
        answer: 'The current tool detects tables in the processed pages and exports the first detected table as CSV or XLSX.',
      },
      {
        question: 'Can I choose CSV or Excel output?',
        answer: 'Yes. The tool provides CSV and Excel (XLSX) as output-format options.',
      },
      {
        question: 'Why should I verify the extracted table?',
        answer: 'PDF tables are not always stored as true rows and columns. Complex layouts can cause values, headings, or cell boundaries to be interpreted incorrectly.',
      },
    ],
  },
};

export default function HumanizedPdfBatchTwoContent({
  toolId,
}: {
  toolId: string;
}) {
  if (!BATCH_TWO_PDF_TOOL_IDS.has(toolId)) return null;

  const content = CONTENT[toolId as ToolId];

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
