'use client';

import FAQSection from '@/app/components/FAQSection';

export const BATCH_FIVE_PDF_TOOL_IDS = new Set([
  'compress-pdf',
  'pdf-translator',
  'pdf-ocr',
  'pdf-deskew',
  'pdf-enhance-scan',
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
  'compress-pdf': {
    sections: [
      {
        heading: 'Reduce PDF File Size Without Assuming a Fixed Result',
        paragraphs: [
          'PDF compression is useful when a document is larger than you want for uploading, emailing, archiving, or sharing. The amount of reduction depends on what is already inside the file, so two PDFs of similar page count can compress very differently.',
          'A PDF that already uses efficient compression may change only slightly. A document containing redundant or less efficiently stored data may offer more room for reduction.',
        ],
      },
      {
        heading: 'What PDF Compression Can Change',
        paragraphs: [
          'Compression works on the internal PDF data rather than simply removing pages. The goal is to produce a smaller valid PDF where the document allows it, but there is no reliable percentage that applies to every file.',
          'If the original PDF is already optimized, running another compression pass does not guarantee a meaningfully smaller result.',
        ],
      },
      {
        heading: 'Compression Is Different From Resizing a Document',
        paragraphs: [
          'Compressing a PDF is not the same as changing its page dimensions, cropping its margins, or deleting pages. Those operations solve different problems.',
          'If the file is large because it contains pages you do not need, removing or extracting those pages may be more appropriate than relying on compression alone.',
        ],
      },
      {
        heading: 'Check the Result Before Replacing the Original',
        paragraphs: [
          'Open the compressed document and check the pages that matter before deleting your source file. Pay particular attention to complex documents, embedded graphics, forms, unusual fonts, and other content that may behave differently after PDF processing.',
          'Keeping the original is especially useful when the document is important or may need to be processed again later.',
        ],
      },
    ],
    faqs: [
      {
        question: 'How much smaller will my PDF become?',
        answer: 'There is no fixed reduction. The result depends on how the original PDF stores its content and how much additional compression is possible.',
      },
      {
        question: 'Will every PDF become smaller?',
        answer: 'Not necessarily. A PDF that is already efficiently compressed may show little reduction, and a smaller output cannot be guaranteed for every file.',
      },
      {
        question: 'Should I keep the original PDF?',
        answer: 'Yes when the document matters. Review the compressed result before replacing or deleting the original file.',
      },
    ],
  },

  'pdf-translator': {
    sections: [
      {
        heading: 'Translate Text Extracted From a PDF',
        paragraphs: [
          'PDF translation begins with the text that can be obtained from the document. A text-based PDF usually provides a better starting point than a scan because its characters already exist as document text.',
          'For scanned pages, text recognition may be needed before translation. Recognition and translation are separate steps, so an error introduced while reading the page can also affect the translated result.',
        ],
      },
      {
        heading: 'Choose the Pages and Target Language You Need',
        paragraphs: [
          'Use the page-range option when only part of a document needs translation. This can be useful for long reports, manuals, forms, or documents where only a specific section is relevant.',
          'The target language controls the requested translation output. Always review names, numbers, technical terms, legal wording, dates, and domain-specific terminology rather than assuming automated translation is final.',
        ],
      },
      {
        heading: 'Translated Content May Not Match the Original Layout',
        paragraphs: [
          'Languages differ in word length, sentence structure, punctuation, and reading direction. Translated text therefore does not necessarily occupy the same amount of space as the source text.',
          'A translated PDF should be treated as a generated result rather than a guarantee that every line, table, font, column, or visual relationship will reproduce exactly.',
        ],
      },
      {
        heading: 'Review Important Translations',
        paragraphs: [
          'Automated translation can be useful for understanding and working with document content, but it can misinterpret context or specialized language.',
          'For contracts, certificates, medical material, financial documents, regulatory content, or other high-stakes uses, have the translated text checked by an appropriately qualified person before relying on it.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can PDF Translator work with scanned PDFs?',
        answer: 'Scanned pages may require text recognition before their content can be translated. Recognition quality depends on the scan and can affect the translation.',
      },
      {
        question: 'Will the translated PDF keep the exact original layout?',
        answer: 'Not necessarily. Translation changes text length and structure, and generated output may differ from the source document in spacing, fonts, tables, columns, or page flow.',
      },
      {
        question: 'Should important translations be reviewed?',
        answer: 'Yes. Automated translation can contain mistakes, especially with specialized terminology or context-sensitive material.',
      },
    ],
  },

  'pdf-ocr': {
    sections: [
      {
        heading: 'Use OCR When PDF Pages Contain Images Instead of Usable Text',
        paragraphs: [
          'A scanned PDF may look like a normal document while each page is actually an image. In that situation, selecting or copying the words may not work because the characters are not stored as ordinary PDF text.',
          'Optical character recognition, or OCR, examines the rendered page and attempts to identify characters so that usable text can be produced from the scan.',
        ],
      },
      {
        heading: 'OCR Accuracy Depends on the Source',
        paragraphs: [
          'Clear, straight, high-resolution pages with readable type generally give OCR a better starting point. Blur, shadows, handwriting, decorative fonts, low contrast, compression artifacts, skew, and complicated layouts can make recognition harder.',
          'OCR should therefore be treated as recognition rather than a guaranteed transcription of every character.',
        ],
      },
      {
        heading: 'Choose the Output That Fits the Next Task',
        paragraphs: [
          'The tool can produce different output types depending on what you want to do with the recognized content. A text-oriented result can be useful when you mainly need the words, while document output may be more convenient for further editing.',
          'Changing the output format does not make recognition more accurate. The recognized text should still be checked against the source when accuracy matters.',
        ],
      },
      {
        heading: 'Deskew or Improve Difficult Scans First',
        paragraphs: [
          'If pages are noticeably tilted or difficult to read, correcting the scan before OCR can provide a cleaner source for recognition. Enhancement can also help some low-contrast scanned material.',
          'These operations cannot recreate information that was never captured clearly in the original scan, so severely blurred or missing characters may still require manual correction.',
        ],
      },
      {
        heading: 'Review OCR Before Reusing the Text',
        paragraphs: [
          'Common OCR errors include confusing similar-looking letters and numbers, losing punctuation, misreading columns, or joining text in the wrong order.',
          'Check names, account references, dates, totals, addresses, technical values, and other important details against the original PDF before using recognized text elsewhere.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What is PDF OCR for?',
        answer: 'PDF OCR is useful when pages contain scanned images and you need the tool to recognize characters and produce usable text from them.',
      },
      {
        question: 'Is OCR always accurate?',
        answer: 'No. Recognition depends on factors such as scan quality, resolution, contrast, page angle, fonts, handwriting, and document layout.',
      },
      {
        question: 'Can OCR restore text that is unreadable in the scan?',
        answer: 'Not reliably. OCR can only work from information visible in the source image and cannot guarantee recovery of characters that were not captured clearly.',
      },
    ],
  },

  'pdf-deskew': {
    sections: [
      {
        heading: 'Straighten Scanned Pages That Were Captured at an Angle',
        paragraphs: [
          'Deskewing is intended for scanned pages that appear tilted because the paper was not aligned correctly during scanning or capture. The tool analyzes selected pages and attempts to correct that page-image angle.',
          'This is different from rotating a page by 90, 180, or 270 degrees. Rotation changes page orientation, while deskewing deals with smaller unwanted tilt within a scanned page.',
        ],
      },
      {
        heading: 'Deskewing Works on the Rendered Page',
        paragraphs: [
          'The selected PDF pages are processed as rendered page images so their visible scan can be analyzed and corrected. The processed pages are then used to create the resulting PDF.',
          'Because of that workflow, deskewing should not be described as simply changing a PDF rotation flag or preserving every original internal PDF object unchanged.',
        ],
      },
      {
        heading: 'Not Every Page Needs the Same Correction',
        paragraphs: [
          'A multi-page scan may contain some straight pages and some tilted ones. Use the page-range control when only part of the document needs correction.',
          'Automatic angle detection also depends on the visible content. Pages with little text, unusual graphics, heavy noise, or inconsistent alignment may be harder to interpret.',
        ],
      },
      {
        heading: 'Check the Corrected PDF',
        paragraphs: [
          'Review the output after deskewing, particularly near page edges and on pages with tables, diagrams, handwriting, or unusual layouts.',
          'Deskewing can improve alignment, but it cannot restore details lost through blur, poor focus, low resolution, or incomplete scanning.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is deskewing the same as rotating a PDF?',
        answer: 'No. Rotation changes the page orientation by a chosen angle, while deskewing attempts to correct smaller unwanted tilt within a scanned page.',
      },
      {
        question: 'Can I deskew only selected pages?',
        answer: 'Yes. The page-range option can be used when correction is needed only for part of the PDF.',
      },
      {
        question: 'Will deskewing fix a blurry scan?',
        answer: 'No. Deskewing addresses page angle. It cannot recreate detail that was lost because the original scan was blurred, out of focus, or too low in resolution.',
      },
    ],
  },

  'pdf-enhance-scan': {
    sections: [
      {
        heading: 'Improve the Readability of Scanned PDF Pages',
        paragraphs: [
          'Scan enhancement is intended for PDFs whose pages come from scanned or photographed documents. Image processing can adjust characteristics such as contrast, sharpness, and noise to make some page content easier to see.',
          'The result depends heavily on the source. A mildly faded scan may respond differently from a page with severe blur, shadows, clipping, or very low resolution.',
        ],
      },
      {
        heading: 'Choose an Enhancement Level Carefully',
        paragraphs: [
          'Different documents need different amounts of processing. A stronger setting is not automatically better for every page.',
          'Heavy enhancement can make some text or edges more pronounced, but it can also emphasize noise or change the appearance of fine details. Compare the result with the source before deciding which version to keep.',
        ],
      },
      {
        heading: 'Enhancement Processes the Visible Scan',
        paragraphs: [
          'The tool works with rendered page imagery rather than repairing the original physical document. The enhanced pages are used to produce the resulting PDF.',
          'For that reason, enhancement cannot recreate letters, signatures, photographs, stamps, or other details that were never captured clearly in the source.',
        ],
      },
      {
        heading: 'Enhancement and OCR Solve Different Problems',
        paragraphs: [
          'Enhancing a scan changes its visible image. OCR attempts to recognize characters and turn what it sees into usable text.',
          'If your goal is to copy or reuse words from scanned pages, OCR may be the next step after improving a difficult scan. Even then, recognized text should be reviewed for errors.',
        ],
      },
      {
        heading: 'Keep the Original Scan When It Matters',
        paragraphs: [
          'An enhanced PDF is a processed derivative of the source. Keep the original when the scan has evidentiary, archival, contractual, financial, or other importance.',
          'Compare important details against the original before relying on the enhanced version or using it as the basis for further processing.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What does Enhance Scanned PDF do?',
        answer: 'It applies image-processing adjustments to rendered scan pages to improve characteristics such as contrast, sharpness, or noise where possible.',
      },
      {
        question: 'Can enhancement restore missing detail?',
        answer: 'No. Processing can improve some visible information, but it cannot reliably recreate details that were not captured in the original scan.',
      },
      {
        question: 'Is scan enhancement the same as OCR?',
        answer: 'No. Enhancement changes the visible page image, while OCR attempts to recognize characters and produce usable text.',
      },
    ],
  },
};

export default function HumanizedPdfBatchFiveContent({
  toolId,
}: {
  toolId: string;
}) {
  const content = CONTENT[toolId];

  if (!content) {
    return null;
  }

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-8 pb-16">
      <div className="space-y-10">
        {content.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {section.heading}
            </h2>

            <div className="space-y-4 text-gray-700 leading-relaxed">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}

        <FAQSection
          faqs={content.faqs}
          title="Frequently asked questions"
        />
      </div>
    </section>
  );
}
