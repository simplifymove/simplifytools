'use client';

import FAQSection from '@/app/components/FAQSection';

export const BATCH_SEVEN_PDF_TOOL_IDS = new Set([
  'add-text',
  'add-watermark',
  'annotate-pdf',
  'extract-text-from-pdf',
  'extract-images-pdf',
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
  'add-text': {
    sections: [
      {
        heading: 'Place New Text on a PDF Page',
        paragraphs: [
          'Add Text to PDF is intended for placing new text onto an existing PDF page. You can enter the text, choose the target page, set its position, adjust the font size, and select from the available text colors.',
          'This is different from rewriting existing PDF text. The tool places additional text at the coordinates you specify rather than treating the document like a word processor.',
        ],
      },
      {
        heading: 'Choose the Page and Text Position',
        paragraphs: [
          'The page-number control determines which PDF page receives the new text. Position controls determine where the text is placed on that page.',
          'PDF page dimensions and existing content vary, so a position that works well on one document may not suit another. Review the resulting PDF and adjust the coordinates if the text overlaps important content or appears outside the intended area.',
        ],
      },
      {
        heading: 'Font Size and Available Colors',
        paragraphs: [
          'You can choose a font size within the range provided by the tool and select from the available text colors. These settings affect the newly inserted text rather than the original PDF content.',
          'Choose a size and color that remain readable against the page background. Large text can cover existing material, while small text may be difficult to notice.',
        ],
      },
      {
        heading: 'When Add Text Is Useful',
        paragraphs: [
          'Adding text can be useful for short labels, references, identifiers, notes, or other information that needs to appear visibly on a PDF page.',
          'For comments, highlights, freehand marks, or other markup, the Annotate PDF tool is more appropriate. If you need to work with scanned text, OCR may be required instead.',
        ],
      },
      {
        heading: 'Review the Updated PDF',
        paragraphs: [
          'Check the target page after processing to confirm that the inserted text appears in the intended location and does not cover important information.',
          'Keep the original document when making important changes so you can compare the updated PDF with its source if necessary.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does Add Text replace existing PDF text?',
        answer:
          'No. It places new text onto the selected PDF page rather than replacing existing text like a word-processing editor.',
      },
      {
        question: 'Can I choose which page receives the text?',
        answer:
          'Yes. The tool includes a page-number setting for selecting the target page.',
      },
      {
        question: 'Can I control where the text appears?',
        answer:
          'Yes. X and Y position settings are available, although the best coordinates depend on the dimensions and content of the PDF page.',
      },
      {
        question: 'Can I choose the text color?',
        answer:
          'Yes. The current tool provides a selection of predefined text colors.',
      },
    ],
  },

  'add-watermark': {
    sections: [
      {
        heading: 'Add a Visible Text Watermark to PDF Pages',
        paragraphs: [
          'Add Watermark places configurable text over selected PDF pages. It can be used for labels such as Draft, Sample, Confidential, or other wording that you are authorized to place on the document.',
          'The watermark is a visible document mark. It should not be treated as encryption, access control, or a technical restriction on copying or editing the PDF.',
        ],
      },
      {
        heading: 'Control Watermark Appearance',
        paragraphs: [
          'The available settings include watermark text, opacity, font size, and rotation. Together, these controls determine how prominent the watermark appears over the underlying page.',
          'Lower opacity can make the mark less intrusive, while higher opacity can make it easier to see but may obscure document content. Font size and rotation should also be chosen with the page layout in mind.',
        ],
      },
      {
        heading: 'Apply the Watermark to Selected Pages',
        paragraphs: [
          'The page-range option lets you choose whether the watermark should be applied broadly or only to specified pages.',
          'This is useful when only part of a document needs a visible status or ownership mark. Check the resulting pages afterward to make sure the selected range and watermark placement suit the document.',
        ],
      },
      {
        heading: 'Watermarks Do Not Replace Document Security',
        paragraphs: [
          'A visible watermark can communicate status, ownership, review state, or intended use, but it does not by itself prevent someone from opening, copying, printing, or modifying a PDF.',
          'Use an appropriate security tool when the requirement is password protection rather than visual marking.',
        ],
      },
      {
        heading: 'Check Readability After Watermarking',
        paragraphs: [
          'Watermarks are placed over existing page content, so strong opacity or very large text can make underlying information harder to read.',
          'Review important names, numbers, signatures, tables, and other content after processing before sharing the watermarked PDF.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can I change watermark transparency?',
        answer:
          'Yes. The opacity setting controls how transparent or prominent the watermark appears.',
      },
      {
        question: 'Can the watermark be rotated?',
        answer:
          'Yes. The current tool provides a rotation setting in degrees.',
      },
      {
        question: 'Can I watermark selected pages?',
        answer:
          'Yes. Use the page-range setting to specify which pages should receive the watermark.',
      },
      {
        question: 'Does adding a watermark protect the PDF from editing?',
        answer:
          'No. The watermark is a visible mark and should not be considered encryption or document-rights protection.',
      },
    ],
  },

  'annotate-pdf': {
    sections: [
      {
        heading: 'Add Annotations to a PDF',
        paragraphs: [
          'Annotate PDF provides an interactive workspace for adding markup to an uploaded PDF. Add the annotations you need in the editor and save the result as a new PDF.',
          'This is useful for document review, visible markup, and drawing attention to particular content without replacing the original source file.',
        ],
      },
      {
        heading: 'Review Your Annotations Before Downloading',
        paragraphs: [
          'The page tracks annotation data created during the editing session, and the download action becomes available after annotations have been added.',
          'Before saving, check that the markup appears on the intended content and does not cover information that still needs to remain readable.',
        ],
      },
      {
        heading: 'Annotation Is Different from Rewriting PDF Text',
        paragraphs: [
          'Annotation adds markup around existing document content. It is different from replacing existing paragraphs or rebuilding the PDF layout.',
          'If you only need to place new text on a page, Add Text to PDF may be more appropriate.',
        ],
      },
      {
        heading: 'Keep the Original PDF When It Matters',
        paragraphs: [
          'The annotated PDF is a processed version of the uploaded document. Keep the original separately when the source file is important.',
          'Review names, numbers, signatures, tables, and other important information before sharing the annotated result.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can I download without adding an annotation?',
        answer: 'The current Annotate PDF page enables the annotation download action after annotation data has been added.',
      },
      {
        question: 'Does annotation replace existing PDF text?',
        answer: 'No. Annotation adds markup to the document rather than replacing the existing PDF text.',
      },
      {
        question: 'Should I review the annotated PDF before sharing it?',
        answer: 'Yes. Confirm that the markup is positioned as intended and that important content remains readable.',
      },
      {
        question: 'Should I keep the original PDF?',
        answer: 'Yes for important documents. Keep an unchanged source copy separately from the annotated result.',
      },
    ],
  },

  'extract-text-from-pdf': {
    sections: [
      {
        heading: 'Extract Available PDF Text into a TXT File',
        paragraphs: [
          'Extract Text from PDF reads textual content from the PDF pages you select and writes the extracted content into a plain-text file.',
          'Because TXT does not reproduce the visual PDF page, fonts, precise positioning, images, and much of the original layout are not preserved.',
        ],
      },
      {
        heading: 'Choose Which Pages to Extract',
        paragraphs: [
          'You can process the document broadly or specify a page range when you only need text from part of the PDF.',
          'Page selection can be useful for long documents where only certain sections are relevant. Review the generated text to confirm that the requested pages contain the information you expected.',
        ],
      },
      {
        heading: 'Optional OCR for Image-Based Pages',
        paragraphs: [
          'Normal PDF text extraction works when a page contains a usable text layer. Scanned pages may instead contain only an image of the original document.',
          'When OCR fallback is enabled and a page has no extracted text, the tool attempts character recognition on a rendered image of that page. OCR results can contain mistakes, especially with unclear scans, unusual fonts, handwriting, or complex layouts.',
        ],
      },
      {
        heading: 'Why Extracted Text Can Look Different',
        paragraphs: [
          'PDF documents store text and page positioning differently from ordinary plain-text documents. Multi-column pages, tables, headers, footers, and unusual reading orders may therefore appear differently after extraction.',
          'If your main requirement is structured table data, a dedicated table-extraction tool may be more suitable than plain-text extraction.',
        ],
      },
      {
        heading: 'Review Extracted Content Before Reuse',
        paragraphs: [
          'Check important names, numbers, dates, and other details before using extracted text in another document or workflow.',
          'This is particularly important when OCR fallback was required because character recognition is an interpretation of the page image rather than a guaranteed transcription.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does text extraction preserve the PDF layout?',
        answer:
          'No. The output is plain text, so the original fonts, images, page design, and precise positioning are not preserved.',
      },
      {
        question: 'Can scanned PDF pages be processed?',
        answer:
          'OCR fallback can be enabled so the tool attempts recognition when normal extraction finds no text on a page.',
      },
      {
        question: 'Is OCR always accurate?',
        answer:
          'No. Recognition quality depends on the scan, language, typography, image quality, and other characteristics of the page.',
      },
      {
        question: 'Can I extract only part of a PDF?',
        answer:
          'Yes. The tool includes a page-range option for selecting the pages to process.',
      },
    ],
  },

  'extract-images-pdf': {
    sections: [
      {
        heading: 'Extract Embedded Images from PDF Pages',
        paragraphs: [
          'Extract Images from PDF looks for image objects stored in the selected PDF pages and exports the images it can successfully process.',
          'This differs from converting an entire PDF page into an image. Text, vector artwork, and other visible page elements are not necessarily stored as standalone image objects and therefore may not appear as extracted files.',
        ],
      },
      {
        heading: 'Choose PNG or JPG Output',
        paragraphs: [
          'The tool provides PNG and JPG as available image-format choices for extracted files.',
          'The resulting dimensions and appearance depend on the image data stored inside the source PDF. An extracted image may therefore look different from the way it appeared when combined with text, masks, backgrounds, or other elements on the PDF page.',
        ],
      },
      {
        heading: 'Extract Images from Selected Pages',
        paragraphs: [
          'A page-range setting lets you limit image extraction to specific pages instead of scanning the entire document.',
          'This can be useful for large PDFs when you know approximately where the required photographs or graphics appear.',
        ],
      },
      {
        heading: 'Single and Multiple Image Results',
        paragraphs: [
          'When one image file is successfully extracted, the processing engine can return that image directly. When multiple images are successfully extracted, they are packaged together into a ZIP archive.',
          'A PDF that contains no extractable image objects can produce a no-images-found result even when the page contains visible text or vector graphics.',
        ],
      },
      {
        heading: 'Check Extracted Assets Before Reuse',
        paragraphs: [
          'PDFs can contain repeated images, masks, backgrounds, composite graphics, and other internal structures that affect extraction results.',
          'Review the exported files and make sure you have permission to reuse any photographs, illustrations, logos, or other material contained in the source document.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does this convert every PDF page into an image?',
        answer:
          'No. It extracts image objects found within selected PDF pages rather than rendering each complete page as an image.',
      },
      {
        question: 'Will every visible graphic be extracted?',
        answer:
          'Not necessarily. Text, vector graphics, masks, and composite elements may not exist as ordinary standalone image objects.',
      },
      {
        question: 'Why might I receive a ZIP file?',
        answer:
          'When multiple image files are successfully extracted, the tool packages them together into a ZIP archive.',
      },
      {
        question: 'What happens if only one image is extracted?',
        answer:
          'The current processing engine can return the single extracted image directly rather than creating a ZIP containing only one file.',
      },
    ],
  },
};

export default function HumanizedPdfBatchSevenContent({
  toolId,
}: {
  toolId: string;
}) {
  const content = CONTENT[toolId];

  if (!content) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-8 pb-16">
      <div className="space-y-10">
        {content.sections.map((section) => (
          <div key={section.heading}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {section.heading}
            </h2>

            <div className="space-y-4">
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-gray-600 leading-7"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        ))}

        <FAQSection
          title="Frequently Asked Questions"
          faqs={content.faqs}
        />
      </div>
    </section>
  );
}
