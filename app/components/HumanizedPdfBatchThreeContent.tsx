'use client';

import FAQSection from '@/app/components/FAQSection';

export const BATCH_THREE_PDF_TOOL_IDS = new Set([
  'pdf-to-jpg',
  'pdf-to-png',
  'pdf-to-tiff',
  'jpg-to-pdf',
  'png-to-pdf',
  'tiff-to-pdf',
  'webp-to-pdf',
  'gif-to-pdf',
  'heic-to-pdf',
  'eps-to-pdf',
  'images-to-pdf',
]);

type ToolId =
  | 'pdf-to-jpg'
  | 'pdf-to-png'
  | 'pdf-to-tiff'
  | 'jpg-to-pdf'
  | 'png-to-pdf'
  | 'tiff-to-pdf'
  | 'webp-to-pdf'
  | 'gif-to-pdf'
  | 'heic-to-pdf'
  | 'eps-to-pdf'
  | 'images-to-pdf';

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
  'pdf-to-jpg': {
    sections: [
      {
        heading: 'Turn PDF Pages Into JPG Images',
        paragraphs: [
          'PDF to JPG is useful when you need individual document pages as ordinary image files. Instead of keeping the content inside a PDF, the converter renders the selected pages and creates JPG versions that can be opened or used like other images.',
          'This can help when a page needs to be inserted into a presentation, uploaded somewhere that accepts images instead of PDFs, or used as a visual reference without sharing the complete document.',
        ],
      },
      {
        heading: 'Each PDF Page Becomes an Image',
        paragraphs: [
          'A PDF can contain one page or many pages. During conversion, each processed page is rendered separately rather than combining the whole PDF into one long image.',
          'When multiple pages are converted, the resulting images are packaged together in a ZIP file for download.',
        ],
      },
      {
        heading: 'Choosing the Right DPI',
        paragraphs: [
          'DPI affects the resolution at which a PDF page is rendered. This tool provides 72, 150, 300, and 600 DPI options.',
          'Lower DPI can produce smaller images and may be enough for quick screen viewing. Higher DPI creates more pixels and can make small text or detailed graphics easier to inspect, but it can also increase output size and processing requirements.',
        ],
      },
      {
        heading: 'JPG Is a Raster Output',
        paragraphs: [
          'Converting a PDF to JPG is a rendering process. Text, vector graphics, and other page elements become pixels in the JPG image.',
          'If you need editable text or the original PDF structure, an image conversion may not be the right workflow.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does PDF to JPG extract the original images from my PDF?',
        answer: 'No. It renders PDF pages as JPG images. That is different from extracting image objects embedded inside a PDF.',
      },
      {
        question: 'Which DPI should I choose?',
        answer: 'Lower DPI may be sufficient for basic screen use, while higher DPI provides more image detail at the cost of larger output and additional processing.',
      },
      {
        question: 'What happens with a multi-page PDF?',
        answer: 'Each processed page becomes a separate JPG image, and multiple images are packaged in a ZIP file.',
      },
    ],
  },

  'pdf-to-png': {
    sections: [
      {
        heading: 'Render PDF Pages as PNG Images',
        paragraphs: [
          'PDF to PNG converts document pages into raster images. This is useful when you need a visual copy of a page for another application, website, presentation, or image-based workflow.',
          'Each selected PDF page is rendered separately rather than turning the entire document into one continuous image.',
        ],
      },
      {
        heading: 'PNG and PDF Store Content Differently',
        paragraphs: [
          'PDF pages can contain text, vectors, images, fonts, and positioning information. PNG is a pixel-based image format.',
          'During conversion, those PDF elements are rendered into pixels. The PNG represents the visual appearance of the page rather than preserving its editable PDF structure.',
        ],
      },
      {
        heading: 'Choose a Resolution for the Output',
        paragraphs: [
          'The converter provides 72, 150, and 300 DPI options.',
          'A lower setting creates fewer pixels and may be suitable for previews. Higher DPI gives the page more resolution and can make small text and detailed graphics easier to inspect, while also increasing file size and processing requirements.',
        ],
      },
      {
        heading: 'Process Only the Pages You Need',
        paragraphs: [
          'For a long document, converting every page can create many files that you do not need.',
          'You can process the entire PDF or specify a page range when only a particular diagram, form, chart, or section is required.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does every PDF page become a separate PNG?',
        answer: 'Yes. Processed pages are rendered individually, with multiple output images packaged together for download.',
      },
      {
        question: 'Can I select only some pages?',
        answer: 'Yes. The tool provides controls for processing all pages or specifying a page range.',
      },
      {
        question: 'Does PNG preserve editable PDF text?',
        answer: 'No. The page is rendered as an image, so its visible content becomes pixels.',
      },
    ],
  },

  'pdf-to-tiff': {
    sections: [
      {
        heading: 'Convert PDF Pages Into TIFF Images',
        paragraphs: [
          'PDF to TIFF renders PDF pages as TIFF image files. TIFF is commonly used in scanning, document imaging, publishing, and archival workflows where raster images are required.',
          'The conversion creates an image representation of each processed PDF page rather than preserving the PDF internal document structure.',
        ],
      },
      {
        heading: 'Choose the Resolution Before Rendering',
        paragraphs: [
          'The tool provides 72, 150, 300, and 600 DPI options.',
          'Higher DPI produces more pixels for the same page and can help with fine text, line drawings, or detailed graphics. It also increases the amount of image data that must be generated and stored.',
        ],
      },
      {
        heading: 'TIFF Output Uses LZW Compression',
        paragraphs: [
          'The generated TIFF images use LZW compression.',
          'LZW is a lossless compression method, but the PDF page has already been rasterized during conversion. This does not preserve the original PDF text, vector, font, or document structure.',
        ],
      },
      {
        heading: 'Multi-Page PDFs Produce Separate Images',
        paragraphs: [
          'Each processed PDF page is rendered as an image. When several pages are converted, the output images are packaged together in a ZIP file.',
          'You can specify a page range when only part of the document is required.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is the TIFF output compressed?',
        answer: 'Yes. The converter uses LZW compression for TIFF output.',
      },
      {
        question: 'Can I render a PDF at 600 DPI?',
        answer: 'Yes. The available settings include 72, 150, 300, and 600 DPI.',
      },
      {
        question: 'Will the TIFF contain editable PDF text?',
        answer: 'No. The PDF page is rendered into a raster image.',
      },
    ],
  },

  'jpg-to-pdf': {
    sections: [
      {
        heading: 'Combine JPG Images Into One PDF',
        paragraphs: [
          'JPG to PDF is useful when several image files need to be collected into a single document. Each uploaded image is placed on its own PDF page, and the pages are created in upload order.',
          'The current tool also accepts JPEG and PNG files in this workflow.',
        ],
      },
      {
        heading: 'Image Order Becomes Page Order',
        paragraphs: [
          'When multiple files are uploaded, their order matters. The first image becomes the first PDF page, followed by the remaining images in sequence.',
          'Check the upload order before conversion when the images represent scans, receipts, forms, or another ordered set.',
        ],
      },
      {
        heading: 'Images Are Fitted Onto PDF Pages',
        paragraphs: [
          'Images are placed onto PDF pages while maintaining their aspect ratio. Larger images may be resized so that they fit within the generated page.',
          'The PDF is therefore a newly generated document rather than an untouched container around the original JPG files.',
        ],
      },
      {
        heading: 'Keep the Original Images When They Matter',
        paragraphs: [
          'Creating a PDF can make images easier to distribute as one document, but it should not replace important source files.',
          'Keep the original JPG files if you may need their original dimensions, metadata, or independent image versions later.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can I combine multiple JPG files into one PDF?',
        answer: 'Yes. Multiple uploaded images are added to the resulting PDF as separate pages.',
      },
      {
        question: 'Does upload order matter?',
        answer: 'Yes. Images are processed in upload order, which determines their PDF page sequence.',
      },
      {
        question: 'Are large images resized?',
        answer: 'They may be scaled down to fit the generated PDF page while maintaining their aspect ratio.',
      },
    ],
  },

  'png-to-pdf': {
    sections: [
      {
        heading: 'Put PNG Images Into a PDF Document',
        paragraphs: [
          'PNG to PDF combines uploaded PNG images into one PDF. Each image is placed on a separate page, which can be useful for screenshots, graphics, diagrams, and exported designs.',
        ],
      },
      {
        heading: 'Transparency Is Flattened Onto White',
        paragraphs: [
          'PNG supports transparent areas, but this conversion does not preserve those areas as transparent PDF page regions.',
          'Transparent image areas are flattened onto a white background during processing. This matters for logos, illustrations, interface assets, and other files that rely on transparency.',
        ],
      },
      {
        heading: 'One Image Creates One PDF Page',
        paragraphs: [
          'The converter processes the uploaded images in sequence and creates a page for each one.',
          'Check the image order before conversion when page sequence matters.',
        ],
      },
      {
        heading: 'Keep Source PNGs When Transparency Matters',
        paragraphs: [
          'If transparent originals are important for future design or editing work, keep them separately.',
          'The PDF is useful as a document version, while the PNG remains the better source for workflows that depend on transparency.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Will transparent PNG backgrounds stay transparent?',
        answer: 'No. Transparent areas are flattened onto white during this conversion.',
      },
      {
        question: 'Can several PNG files become one PDF?',
        answer: 'Yes. Each uploaded PNG is placed on a separate page.',
      },
      {
        question: 'Does the tool stretch images to fill the page?',
        answer: 'The conversion maintains image aspect ratio rather than intentionally stretching the image to different proportions.',
      },
    ],
  },

  'tiff-to-pdf': {
    sections: [
      {
        heading: 'Turn TIFF Images Into a PDF',
        paragraphs: [
          'TIFF to PDF combines uploaded TIFF images into a PDF document. Each uploaded image is processed as a separate PDF page.',
          'This can be useful when scans or other TIFF-based material need to be distributed as one document.',
        ],
      },
      {
        heading: 'Multiple TIFF Files Can Become One Document',
        paragraphs: [
          'When several TIFF files are uploaded, they are processed in sequence and added to the same output PDF.',
          'Check the input order first when the files represent a scan sequence or another ordered document.',
        ],
      },
      {
        heading: 'TIFF and PDF Serve Different Purposes',
        paragraphs: [
          'TIFF is a raster image format, while PDF is a document container.',
          'This conversion places image content onto PDF pages. It does not turn text visible inside a TIFF scan into editable or searchable document text.',
        ],
      },
      {
        heading: 'Conversion Does Not Perform OCR',
        paragraphs: [
          'If a TIFF contains a scan of printed text, that text remains part of an image after conversion.',
          'Creating a PDF and recognizing text with OCR are separate operations.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can I combine several TIFF files into one PDF?',
        answer: 'Yes. Uploaded images are added as separate pages in the resulting document.',
      },
      {
        question: 'Does TIFF to PDF make scanned text searchable?',
        answer: 'No. This conversion creates PDF pages from images and does not itself perform OCR.',
      },
      {
        question: 'Should I keep the original TIFF files?',
        answer: 'For important source or archival images, retaining the originals is advisable because the PDF serves a different purpose.',
      },
    ],
  },

  'webp-to-pdf': {
    sections: [
      {
        heading: 'Create a PDF From WebP Images',
        paragraphs: [
          'WebP to PDF converts uploaded WebP images into PDF pages. Multiple WebP files can be combined into a single document, with each image placed on its own page.',
        ],
      },
      {
        heading: 'Upload Order Controls the Document Sequence',
        paragraphs: [
          'When several images are provided, their sequence becomes the page sequence in the PDF.',
          'Arrange the files before processing if their order carries meaning.',
        ],
      },
      {
        heading: 'WebP Becomes PDF Page Content',
        paragraphs: [
          'The converter opens the WebP image, prepares it for PDF placement, and adds it to a generated page.',
          'The resulting PDF is a new document rather than an unchanged copy of the original WebP file.',
        ],
      },
      {
        heading: 'Keep Original WebP Files for Image Work',
        paragraphs: [
          'A PDF can make a collection easier to share as a document, but the original WebP files remain useful when you later need to edit, optimize, or reuse them as images.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can multiple WebP files be combined?',
        answer: 'Yes. Each uploaded image becomes a page in the resulting PDF.',
      },
      {
        question: 'Does the PDF preserve the original WebP file itself?',
        answer: 'No. The WebP is processed and inserted as page content, so the PDF is a newly generated document.',
      },
      {
        question: 'What determines page order?',
        answer: 'The uploaded image order determines the sequence of pages.',
      },
    ],
  },

  'gif-to-pdf': {
    sections: [
      {
        heading: 'Convert GIF Files Into Static PDF Pages',
        paragraphs: [
          'GIF to PDF creates a PDF from uploaded GIF files, but the PDF output does not preserve GIF animation.',
          'The current conversion uses a static first-frame representation of each GIF for the PDF page.',
        ],
      },
      {
        heading: 'Animated GIFs Do Not Stay Animated',
        paragraphs: [
          'GIF files can contain multiple animation frames. This workflow uses the first frame of each GIF as the page image.',
          'If movement is important, this conversion is not an appropriate way to preserve it.',
        ],
      },
      {
        heading: 'Multiple GIF Files Can Form One PDF',
        paragraphs: [
          'You can upload multiple GIF files and combine their static first-frame representations into one PDF.',
          'Each uploaded GIF contributes a separate page, and upload order determines page order.',
        ],
      },
      {
        heading: 'Keep the Original GIFs',
        paragraphs: [
          'If the source files are animated, keep them after creating the PDF.',
          'The PDF provides a static document version, while the GIF files retain the animation.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Will an animated GIF continue playing in the PDF?',
        answer: 'No. This conversion uses the first frame of the GIF as a static PDF page.',
      },
      {
        question: 'Can I combine several GIFs into one PDF?',
        answer: 'Yes. Each uploaded GIF contributes a static page to the resulting document.',
      },
      {
        question: 'Does GIF to PDF capture every animation frame?',
        answer: 'No. The current conversion uses the first frame rather than creating a page for every frame.',
      },
    ],
  },

  'heic-to-pdf': {
    sections: [
      {
        heading: 'Create a PDF From HEIC Photos',
        paragraphs: [
          'HEIC to PDF combines uploaded HEIC images into a PDF document. Each successfully processed image is placed on a separate PDF page.',
        ],
      },
      {
        heading: 'HEIC Support Depends on Image Decoding',
        paragraphs: [
          'HEIC requires compatible decoding support on the processing system. The converter registers HEIC handling when the required decoder is available.',
          'A particular HEIC file can still fail if it cannot be decoded, is damaged, or uses unsupported content.',
        ],
      },
      {
        heading: 'Multiple Photos Can Become One PDF',
        paragraphs: [
          'Several HEIC images can be uploaded and processed together.',
          'The upload sequence determines the PDF page sequence, so arrange the photos first when order matters.',
        ],
      },
      {
        heading: 'A PDF Does Not Replace the Original Photo',
        paragraphs: [
          'The PDF is a document created from the decoded image. It should not be treated as an archival replacement for the original HEIC file.',
          'Keep the source photos when original image information or future editing matters.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can I combine multiple HEIC photos into one PDF?',
        answer: 'Yes, provided the uploaded HEIC images can be decoded successfully.',
      },
      {
        question: 'Why might a HEIC file fail to convert?',
        answer: 'HEIC processing depends on compatible decoding support, and damaged or unsupported files may not open correctly.',
      },
      {
        question: 'Does the PDF retain the original HEIC file?',
        answer: 'No. The image is decoded and used to create PDF page content.',
      },
    ],
  },

  'eps-to-pdf': {
    sections: [
      {
        heading: 'Convert EPS Artwork Into a PDF Page',
        paragraphs: [
          'EPS to PDF creates a PDF representation of EPS input without requiring you to manually recreate the artwork in another document format.',
          'This workflow should not be described as guaranteed vector-to-vector preservation.',
        ],
      },
      {
        heading: 'EPS Processing Depends on PostScript Support',
        paragraphs: [
          'EPS is a PostScript-based format. Processing depends on the available server rendering support, including PyMuPDF and, where required, Ghostscript.',
          'Some EPS files can fail if they contain unsupported content or cannot be rendered by the available environment.',
        ],
      },
      {
        heading: 'The EPS Is Rendered Before PDF Creation',
        paragraphs: [
          'The current workflow renders the first page of the EPS input into an image representation and then places that rendered result into the PDF.',
          'Claims that the conversion always preserves editable vectors or original EPS structure would therefore be inaccurate.',
        ],
      },
      {
        heading: 'Keep the Original EPS for Design Work',
        paragraphs: [
          'If the EPS contains editable vector artwork needed for design or print work, retain the original file.',
          'The generated PDF is useful as a rendered document representation but should not automatically be considered equivalent to the EPS source.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does EPS to PDF always preserve vector graphics as vectors?',
        answer: 'No. The current workflow renders the EPS before placing it into the PDF, so vector preservation should not be assumed.',
      },
      {
        question: 'Does EPS conversion require Ghostscript?',
        answer: 'Some EPS or PostScript processing can depend on available Ghostscript support. Compatibility varies with the file and processing environment.',
      },
      {
        question: 'Can I combine several EPS files into one PDF?',
        answer: 'Compatible EPS files can be processed in sequence and their rendered results added to the resulting PDF.',
      },
    ],
  },

  'images-to-pdf': {
    sections: [
      {
        heading: 'Combine Different Image Formats Into One PDF',
        paragraphs: [
          'Images to PDF is intended for situations where a collection of image files needs to become a single document.',
          'The current tool accepts JPG, PNG, GIF, WebP, TIFF, and HEIC inputs, allowing supported image types to be processed together in one workflow.',
        ],
      },
      {
        heading: 'Each Image Becomes a Separate Page',
        paragraphs: [
          'Uploaded images are processed in sequence and placed on individual PDF pages.',
          'This can be useful for photo collections, screenshots, scanned pages, receipts, diagrams, or mixed image sets that need to be organized into one file.',
        ],
      },
      {
        heading: 'Different Image Formats Behave Differently',
        paragraphs: [
          'Combining several image formats does not make their original characteristics identical.',
          'Transparent image areas may be flattened during preparation, animated GIFs are represented by a static frame, and HEIC files depend on compatible decoding support.',
        ],
      },
      {
        heading: 'Keep Important Source Images',
        paragraphs: [
          'Creating a PDF can make a mixed collection easier to distribute, print, or review, but it does not eliminate the value of the original files.',
          'Keep source images when you may need their original format, transparency, animation, dimensions, metadata, or editing capabilities later.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Which image formats can I combine?',
        answer: 'The current Images to PDF configuration accepts JPG, PNG, TIFF, WebP, GIF, and HEIC files.',
      },
      {
        question: 'Does every uploaded image become one page?',
        answer: 'Yes. Each processed image is placed on a separate PDF page.',
      },
      {
        question: 'Are all original image features preserved?',
        answer: 'No. The images are processed to create PDF page content, so features such as GIF animation or PNG transparency should not be assumed to remain unchanged.',
      },
    ],
  },
};

export default function HumanizedPdfBatchThreeContent({
  toolId,
}: {
  toolId: string;
}) {
  if (!BATCH_THREE_PDF_TOOL_IDS.has(toolId)) return null;

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
