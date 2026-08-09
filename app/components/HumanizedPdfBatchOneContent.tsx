type BatchOnePdfToolId =
  | 'merge-pdf'
  | 'split-pdf'
  | 'rotate-pdf'
  | 'rearrange-pdf'
  | 'crop-pdf'
  | 'pdf-page-deleter'
  | 'create-pdf'
  | 'add-numbers-to-pdf';

interface SupportingSection {
  heading: string;
  paragraphs: string[];
}

interface SupportingContent {
  sections: SupportingSection[];
  faqs: Array<{ question: string; answer: string }>;
}

const CONTENT: Record<BatchOnePdfToolId, SupportingContent> = {
  'merge-pdf': {
    sections: [
      {
        heading: 'What Happens When You Merge PDF Files?',
        paragraphs: [
          'Merging PDFs takes the pages from two or more PDF files and places them into one document. It is useful when related material has been saved as separate files but needs to be shared, archived, printed, or reviewed as a single PDF.',
          'The order matters. If you upload a cover sheet, a report, and an appendix in that sequence, the merged document should follow the same sequence. Check the file order before processing, especially when the documents have similar names.',
        ],
      },
      {
        heading: 'Merging Does Not Make Every Page Look the Same',
        paragraphs: [
          'A merged PDF can contain pages with different dimensions, orientations, margins, and visual styles. An A4 document can be combined with a landscape page or a scanned letter-size page without turning those pages into one common layout.',
          'That is often desirable because merging is primarily about combining documents, not redesigning them.',
          'If consistent page dimensions are important for printing or presentation, review the completed PDF and use an appropriate page or editing tool separately if adjustments are required.',
        ],
      },
      {
        heading: 'What Can Happen to Advanced PDF Features?',
        paragraphs: [
          'Ordinary page content generally makes merging straightforward, but a PDF can contain more than visible text and images. Forms, bookmarks, attachments, annotations, document-level navigation, signatures, and other advanced structures may behave differently after documents are combined.',
          'For an important business, legal, financial, or archival document, review those features in the merged result instead of assuming that everything outside the visible pages has been carried over unchanged.',
        ],
      },
      {
        heading: 'When Is Merge PDF Useful?',
        paragraphs: [
          'Common examples include combining an invoice with supporting receipts, joining chapters of a report, packaging application documents into one file, combining scanned paperwork, or creating one handout from several PDFs.',
          'If you only need a few pages from a large document, splitting or extracting the required pages first can produce a cleaner final file than merging the entire source document.',
        ],
      },
      {
        heading: 'Before You Download the Merged PDF',
        paragraphs: [
          'Open the result and check the first page, last page, page sequence, page orientation, and any forms or links that matter to you. Keep the original PDFs until you have confirmed that the combined document contains everything you expected.',
        ],
      },
    ],
    faqs: [
      { question: 'Does merging PDFs edit the text inside each page?', answer: 'No. The purpose of merging is to combine pages from separate PDF documents. It is not a substitute for editing the text or layout inside those pages.' },
      { question: 'Will all merged pages have the same size?', answer: 'Not necessarily. Source PDFs can use different page dimensions and orientations, and those differences may remain in the combined file.' },
      { question: 'Can I merge two unrelated PDF layouts?', answer: 'Yes, but review the result if consistent page dimensions or visual formatting matter.' },
    ],
  },
  'split-pdf': {
    sections: [
      {
        heading: 'What Does Splitting a PDF Actually Do?',
        paragraphs: [
          'Splitting a PDF creates smaller PDF documents from selected pages of a larger file. The source document is not rewritten on your device; the result consists of new files containing the pages selected by the split operation.',
          'This is useful when a large PDF contains several sections but only part of it needs to be sent, stored, or worked on separately.',
        ],
      },
      {
        heading: 'Choose the Split Method Based on the Result You Need',
        paragraphs: [
          'A page range is useful when you already know the section you want, such as pages 10–18 of a report.',
          'Splitting every page creates separate page-level documents. Splitting at regular intervals can be useful when a source PDF contains repeated groups such as statements, forms, or chapters of similar length.',
          'Check page numbers carefully before processing. The page number printed inside a document is not always the same as its position in the PDF. A report may have an unnumbered cover or introductory pages before its printed page 1.',
        ],
      },
      {
        heading: 'What Splitting Does Not Do',
        paragraphs: [
          'Splitting separates pages. It does not automatically extract individual paragraphs, images, tables, or sections from within a page.',
          'If the information you need occupies only part of a page, a crop, extraction, or editing tool may be more appropriate.',
          'Document-level features can also behave differently when pages are copied into separate PDFs. Bookmarks, forms, attachments, navigation, and other structures associated with the complete source document may not make sense or transfer fully to every split result.',
        ],
      },
      {
        heading: 'Practical Uses for Split PDF',
        paragraphs: [
          'You might split a PDF to send one chapter without sharing an entire manual, separate invoices from a combined billing file, extract a signed section from a larger packet, or divide a long scanned document into smaller files that are easier to manage.',
          'If you intend to reorganize pages rather than create separate files, use a rearrangement tool instead.',
        ],
      },
      {
        heading: 'Check the Result Before Discarding the Original',
        paragraphs: [
          'Confirm that every required page is present and that the page boundaries match what you intended. Keep the original PDF until the smaller files have been checked.',
        ],
      },
    ],
    faqs: [
      { question: 'Does splitting reduce PDF quality?', answer: 'Splitting is intended to copy selected PDF pages into new documents rather than deliberately reduce their visual quality. However, advanced document-level features may not transfer to every split file.' },
      { question: 'Is Split PDF the same as deleting pages?', answer: 'No. Splitting creates separate output documents from selected parts. Deleting pages creates one new PDF with specified pages removed.' },
      { question: 'Can splitting extract only one image or table from a page?', answer: 'No. Splitting works at the page level. Use an extraction tool when you need content from inside a page.' },
    ],
  },
  'rotate-pdf': {
    sections: [
      {
        heading: 'Rotate a Page Without Rewriting Its Content',
        paragraphs: [
          'PDF rotation changes how selected pages are oriented in the output document. It is useful when a scan, exported spreadsheet, presentation page, or mixed-orientation document opens sideways or upside down.',
          'Choose the required rotation and, when available, the pages that need the change. There is usually no reason to rotate correctly oriented pages just because another page in the document is wrong.',
        ],
      },
      {
        heading: 'Rotation and Deskew Are Different Problems',
        paragraphs: [
          'A page that is exactly sideways may need a 90-degree rotation. A scanned page that is only slightly tilted has a different problem.',
          'Deskewing attempts to correct a small angular misalignment inside a scanned page. Rotation changes the page orientation by a defined amount.',
          'If text is leaning by a few degrees rather than facing the wrong direction entirely, a deskew tool is the more appropriate choice.',
        ],
      },
      {
        heading: 'Mixed Page Orientations Can Be Intentional',
        paragraphs: [
          'Not every landscape page is an error. Reports often contain portrait text pages and landscape tables or diagrams.',
          'Look at the content before rotating an entire document. Changing every page to the same orientation can make intentionally designed pages harder to read.',
        ],
      },
      {
        heading: 'What Should You Check Afterwards?',
        paragraphs: [
          'Open the processed PDF and inspect the pages you changed as well as the pages around them. Confirm that the reading direction is correct and that the document still flows naturally.',
          'Rotation should not be described as a guarantee that every advanced PDF feature remains exactly unchanged. For important documents, retain the source until you have checked the result.',
        ],
      },
    ],
    faqs: [
      { question: 'Can Rotate PDF fix a slightly crooked scan?', answer: 'Not in the same way as deskewing. Rotation is intended for defined orientation changes such as 90, 180, or 270 degrees. Use PDF Deskew for small scan-angle corrections.' },
      { question: 'Do I have to rotate every page?', answer: 'No. When page selection is available, rotate only the pages that need correction.' },
      { question: 'Should landscape pages always be changed to portrait?', answer: 'No. Landscape orientation is often intentional for tables, drawings, slides, and other wide content.' },
    ],
  },
  'rearrange-pdf': {
    sections: [
      {
        heading: 'Put PDF Pages in the Order You Actually Need',
        paragraphs: [
          'The page content itself is not being rewritten. The task is about page sequence.',
        ],
      },
      {
        heading: 'Check the Whole Sequence, Not Just the Page You Moved',
        paragraphs: [
          'Moving one page changes the relationship between several pages. A page that was previously page 4 may become page 5 after another page is inserted ahead of it.',
          'Before processing, scan through the complete visual order from beginning to end. Pay particular attention to cover pages, tables of contents, chapter separators, signature pages, and appendices.',
        ],
      },
      {
        heading: 'Rearranging Is Different From Splitting or Deleting',
        paragraphs: [
          'Use rearrangement when all required pages should remain in one PDF but their sequence is wrong.',
          'Use Split PDF when sections should become separate documents. Use a page deletion tool when certain pages should not appear in the output at all.',
          'Choosing the operation that matches the intended result avoids unnecessary processing.',
        ],
      },
      {
        heading: 'Page Numbers Printed on the Page May Not Change',
        paragraphs: [
          'Reordering PDF pages does not necessarily rewrite page numbers that are already printed as part of the page content.',
          'For example, if a page visibly says “Page 8” and you move it earlier in the document, that printed label can still say “Page 8.”',
          'If visible numbering must match the new sequence, inspect the reordered PDF and handle page numbering separately.',
        ],
      },
      {
        heading: 'Review Navigation in Complex Documents',
        paragraphs: [
          "Documents with bookmarks, forms, links, attachments, or other advanced navigation deserve additional review after page reordering. Visual page order is only one part of a PDF's structure.",
        ],
      },
    ],
    faqs: [
      { question: 'Does rearranging a PDF edit the page content?', answer: 'No. It changes the order of pages rather than rewriting the text or graphics inside them.' },
      { question: 'Will printed page numbers update automatically?', answer: 'Not necessarily. Numbers already printed into page content are separate from the PDF page sequence.' },
      { question: 'When should I use Split PDF instead?', answer: 'Use Split PDF when you want separate documents. Rearrange PDF is for changing the order while keeping the required pages together.' },
    ],
  },
  'crop-pdf': {
    sections: [
      {
        heading: 'What Cropping a PDF Page Means',
        paragraphs: [
          'PDF cropping is different from cropping a simple image because PDF pages can contain text, vectors, images, annotations, and information outside the area currently being displayed.',
        ],
      },
      {
        heading: 'Cropped Content May Not Be Securely Deleted',
        paragraphs: [
          'This is especially important for confidential documents.',
          'Changing a PDF crop boundary should not be treated as a secure redaction method. Material outside the visible crop area may still exist in the underlying PDF.',
          'If information must be permanently removed for privacy, legal, or security reasons, use a proper redaction workflow and verify the result before sharing the document.',
        ],
      },
      {
        heading: 'Crop Only the Pages That Need It',
        paragraphs: [
          'A PDF may contain pages with different margins or dimensions. Applying one crop area indiscriminately can hide useful content on pages that were already correct.',
          'When page-range controls are available, inspect the affected pages and apply the crop deliberately.',
        ],
      },
      {
        heading: 'Cropping Does Not Reflow the Page',
        paragraphs: [
          'A crop does not behave like changing margins in a word processor. Text and images do not automatically move inward to fill the newly visible area.',
          'The existing page remains laid out as it was; the visible boundary is what changes.',
        ],
      },
      {
        heading: 'Useful Reasons to Crop a PDF',
        paragraphs: [
          'Cropping can help remove scanner borders from view, focus a PDF on a specific portion of a larger page, reduce distracting whitespace, or standardize the visible area of selected pages.',
          'For a crooked scan, use deskewing rather than trying to compensate with a crop alone.',
        ],
      },
    ],
    faqs: [
      { question: 'Does cropping permanently delete everything outside the crop box?', answer: 'Do not assume that it does. PDF cropping changes the visible page boundary and should not be used as a secure redaction method.' },
      { question: 'Will text reflow after I crop a page?', answer: 'No. Cropping changes the visible area; it does not reformat the document like a word processor.' },
      { question: 'Can I use Crop PDF to hide confidential information?', answer: 'It may hide information visually, but that is not sufficient for secure removal. Use a dedicated redaction process for sensitive content.' },
    ],
  },
  'pdf-page-deleter': {
    sections: [
      {
        heading: 'Remove Pages You Do Not Need in the New PDF',
        paragraphs: [
          'Typical examples include removing an accidental blank scan, an outdated cover sheet, duplicate pages, unwanted appendices, or pages that were included in the wrong document.',
        ],
      },
      {
        heading: 'Check Page Positions Carefully',
        paragraphs: [
          'The visible number printed on a page can differ from its actual position inside the PDF.',
          'A document may begin with a cover, contents page, or roman-numbered introduction. That means the page labelled “10” in the document might not be PDF page 10.',
          'Preview the document and confirm the actual pages before deleting them.',
        ],
      },
      {
        heading: 'Deleting a Page Removes Everything on That Page From the Output',
        paragraphs: [
          'Unlike cropping, page deletion removes the selected page from the new document rather than merely changing its visible boundary.',
          'That also means a mistaken deletion can remove text, images, signatures, or other information that you intended to keep.',
          'Keep the source PDF until the processed copy has been checked.',
        ],
      },
      {
        heading: "Consider the Document's Structure",
        paragraphs: [
          'Removing pages can affect the usefulness of a table of contents, bookmarks, internal references, forms, or text that refers to later page numbers.',
          'A visually correct output can therefore still require review when the source PDF has complex navigation or document-level features.',
        ],
      },
      {
        heading: 'Delete, Split, or Rearrange?',
        paragraphs: [
          'Delete pages when they should not appear in the new PDF.',
          'Split the PDF when the pages are still useful but should become separate documents.',
          'Rearrange pages when they all belong in the document but appear in the wrong order.',
        ],
      },
    ],
    faqs: [
      { question: 'Can I recover a page after it is removed from the processed PDF?', answer: 'The new output is created without the selected page. Keep your original PDF so you can return to it if the wrong page was selected.' },
      { question: 'Is deleting a page the same as cropping it?', answer: 'No. Deleting removes the complete selected page from the output. Cropping changes the visible area of a page.' },
      { question: 'Why might page numbers look wrong after deletion?', answer: 'Numbers printed inside page content do not necessarily update when PDF pages are removed.' },
    ],
  },
  'create-pdf': {
    sections: [
      {
        heading: 'Create One PDF From Images or Blank Pages',
        paragraphs: [
          'Uploaded images can become pages in a PDF, while blank-page creation can be useful when you need a simple empty PDF to work with afterwards.',
          'For image-based creation, the order of the source files determines how the resulting document is assembled, so check the sequence before processing.',
        ],
      },
      {
        heading: 'Turning an Image Into a PDF Does Not Improve the Image',
        paragraphs: [
          'Placing a JPG, PNG, or TIFF inside a PDF container does not restore detail that was missing from the original image.',
          'A small, blurred, heavily compressed, or low-resolution scan remains limited by its source quality.',
          'If the PDF will be printed or enlarged, inspect the source images before creating the document rather than expecting the PDF conversion to make them sharper.',
        ],
      },
      {
        heading: 'Image PDFs Are Different From Text PDFs',
        paragraphs: [
          'A page created from a photograph or scan may look like a normal document but still consist primarily of an image.',
          'That means the words visible on the page may not automatically be searchable, selectable, or easy to copy.',
          'OCR is a separate process used when searchable or extractable text is needed from scanned page images.',
        ],
      },
      {
        heading: 'Think About Page Order Before Processing',
        paragraphs: [
          'File names such as scan1, scan2, and scan10 can be easy to place in the wrong sequence when assembling a larger document.',
          'Review the order visually, especially for forms, receipts, handwritten notes, or multi-page scans.',
        ],
      },
      {
        heading: 'Server Processing and File Limits',
        paragraphs: [
          "The Create PDF operation uses SimplifyConvert's server-side PDF processing rather than keeping the complete conversion exclusively on your device.",
          'Image inputs are subject to the limits enforced by the tool. Large source images can also produce a large PDF, particularly when many pages are combined.',
        ],
      },
    ],
    faqs: [
      { question: 'Does creating a PDF improve the resolution of my images?', answer: 'No. The PDF can package the images as document pages, but it cannot restore image detail that is absent from the source.' },
      { question: 'Will text in a scanned image become searchable automatically?', answer: 'Not necessarily. Image-based pages may require OCR when searchable or extractable text is needed.' },
      { question: 'Is Create PDF processed entirely in my browser?', answer: 'No. The current PDF creation workflow uses server-side processing.' },
    ],
  },
  'add-numbers-to-pdf': {
    sections: [
      {
        heading: 'Add Visible Page Numbers to a PDF',
        paragraphs: [
          'Add Page Numbers places number labels onto PDF pages. It can be useful for reports, handouts, submissions, meeting packets, manuals, or scanned documents that need a clearer reading sequence.',
          'Depending on the available controls, you can choose the position, number size, starting value, and page range.',
        ],
      },
      {
        heading: 'PDF Page Position and Printed Page Number Are Separate Things',
        paragraphs: [
          'A PDF viewer already knows that a document has a first page, second page, and so on. Adding page numbers creates visible labels on the page itself.',
          'This distinction matters when a document already contains printed page numbers.',
          'Adding another set without checking the existing design can produce duplicate or conflicting numbering.',
        ],
      },
      {
        heading: 'Starting at 1 Is Not Always the Right Choice',
        paragraphs: [
          'A cover page may intentionally have no visible number. Introductory material might use a different numbering system, while the main content begins later.',
          "Use the starting-number and page-range controls according to the document's structure rather than automatically numbering every page.",
        ],
      },
      {
        heading: 'Page Numbers Are Added as an Overlay',
        paragraphs: [
          "Adding numbers does not rebuild the document's header or footer system as a word processor would.",
          'The number is placed onto the PDF page. Check pages that already contain text, logos, footnotes, or other content near the chosen position to make sure the new label does not overlap anything important.',
        ],
      },
      {
        heading: 'Check the First, Last, and Transition Pages',
        paragraphs: [
          'After processing, inspect the first numbered page, the final page, and any point where numbering begins after an unnumbered section.',
          'This catches common problems such as an incorrect starting value, unexpected overlap, or numbering applied to pages that were meant to remain unnumbered.',
        ],
      },
    ],
    faqs: [
      { question: 'Does Add Page Numbers change text already inside my PDF?', answer: 'The tool adds visible number overlays. It is not intended to rewrite the existing body text.' },
      { question: 'Can I start numbering after the cover page?', answer: 'Use the available page-range and starting-number controls to match the document structure.' },
      { question: 'What if my PDF already has printed page numbers?', answer: 'Review the document before adding another set. Existing numbers are part of the page content and are not automatically replaced.' },
    ],
  },
};

export const BATCH_ONE_PDF_TOOL_IDS = new Set<string>(Object.keys(CONTENT));

const HERO_DESCRIPTIONS: Partial<Record<BatchOnePdfToolId, string>> = {
  'rearrange-pdf': 'Rearranging a PDF changes the sequence of its pages. It is useful when scanned pages were captured in the wrong order, a report was assembled incorrectly, or supporting material needs to appear in a different position.',
  'crop-pdf': 'Cropping changes the visible page area. It can remove unwanted margins from view, focus attention on a particular region, or make inconsistent page boundaries more convenient to read.',
  'pdf-page-deleter': 'PDF Page Deleter creates an output document without the pages you select for removal.',
  'create-pdf': 'Create PDF is useful when the material you want to package as a PDF does not already exist as one document.',
};

export function getBatchOnePdfHeroDescription(toolId: string, fallback: string) {
  return HERO_DESCRIPTIONS[toolId as BatchOnePdfToolId] ?? fallback;
}

export function HumanizedPdfBatchOneContent({ toolId }: { toolId: string }) {
  const content = CONTENT[toolId as BatchOnePdfToolId];

  if (!content) {
    return null;
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <section className="border-t border-gray-200 bg-white px-4 py-14 md:px-8" data-pdf-batch-one-content={toolId}>
      <div className="mx-auto max-w-5xl space-y-12">
        {content.sections.map((section) => (
          <div key={section.heading}>
            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">{section.heading}</h2>
            <div className="mt-4 max-w-4xl space-y-4 text-base leading-7 text-gray-700 md:text-lg md:leading-8">
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </div>
        ))}

        <div>
          <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Frequently Asked Questions</h2>
          <div className="mt-5 space-y-4">
            {content.faqs.map((faq) => (
              <details key={faq.question} className="rounded-xl border border-gray-200 bg-white p-5">
                <summary className="cursor-pointer font-semibold text-gray-900">{faq.question}</summary>
                <p className="mt-3 leading-7 text-gray-700">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </section>
  );
}
