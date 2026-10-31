'use client';

import FAQSection from '@/app/components/FAQSection';

export const BATCH_SIX_PDF_TOOL_IDS = new Set([
  'protect-pdf',
  'unlock-pdf',
  'pdf-watermark-remover',
  'esign-pdf',
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
  'protect-pdf': {
    sections: [
      {
        heading: 'Add Password Protection to a PDF',
        paragraphs: [
          'Password protection is useful when you want a PDF to require a password before it can be opened. Upload the document, choose a password, and create a protected copy of the PDF.',
          'The current protection process uses PDF encryption and writes the pages into a newly protected PDF. Keep the password somewhere safe because recipients will need it to open the protected document.',
        ],
      },
      {
        heading: 'What This PDF Protection Does',
        paragraphs: [
          'The tool applies password-based encryption to the PDF. Its purpose is to restrict opening the document without the required password.',
          'The current implementation does not configure separate restrictions for printing, copying, or editing, so password protection should not be described as a complete document-rights management system.',
        ],
      },
      {
        heading: 'Choosing a PDF Password',
        paragraphs: [
          'Use a password that is difficult for other people to guess and avoid reusing an important account password. A longer password containing a mixture of characters generally provides better protection than a short or predictable one.',
          'Share the password separately from the PDF when practical, especially when the document contains information that should not be publicly accessible.',
        ],
      },
      {
        heading: 'Check the Protected File Before Sharing',
        paragraphs: [
          'After downloading the protected PDF, open it in a PDF reader and confirm that the expected password prompt appears.',
          'Keep an original copy of important documents. Password protection creates another version of the PDF and should not replace your only copy of the source document.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does Protect PDF require a password?',
        answer: 'Yes. A password is required before the protection process can run.',
      },
      {
        question: 'Does Protect PDF prevent printing, copying, and editing?',
        answer: 'The current implementation primarily protects access to the PDF with a password. It does not configure separate printing, copying, or editing restrictions.',
      },
      {
        question: 'Can I remove the protection later?',
        answer: 'If you know the correct password, you can use the Unlock PDF tool to create an unlocked copy.',
      },
      {
        question: 'Should I keep the original PDF?',
        answer: 'Yes. Keep an original copy of important documents in case you lose the password or need the unprotected source later.',
      },
    ],
  },

  'unlock-pdf': {
    sections: [
      {
        heading: 'Create an Unlocked Copy of a Password-Protected PDF',
        paragraphs: [
          'Unlock PDF is intended for documents you own or are authorized to access. Upload the protected PDF and provide the correct password so the document can be opened and written as a new PDF without the opening password.',
          'This is useful when you repeatedly work with your own protected document and no longer want to enter its password each time.',
        ],
      },
      {
        heading: 'The Correct Password Is Required',
        paragraphs: [
          'This tool does not guess, recover, or crack forgotten passwords. When the uploaded PDF is encrypted, the supplied password must successfully decrypt it before an unlocked copy can be created.',
          'If you do not know the password, obtain it from the document owner or original sender rather than attempting to bypass access controls.',
        ],
      },
      {
        heading: 'What Happens During Unlocking',
        paragraphs: [
          'After successful decryption, the PDF pages are copied into a newly written PDF without applying the original opening-password protection to the output.',
          'Because the document is rewritten, review important PDFs after processing rather than assuming every internal PDF feature will remain identical.',
        ],
      },
      {
        heading: 'Review the Result Before Replacing Your Original',
        paragraphs: [
          'Open the downloaded PDF and check the pages, text, images, links, forms, or other features that matter to your workflow.',
          'Keep the protected source until you have confirmed that the unlocked copy works as expected.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can Unlock PDF recover a forgotten password?',
        answer: 'No. The correct password is required for an encrypted PDF. The tool does not crack or recover unknown passwords.',
      },
      {
        question: 'What happens if I enter the wrong password?',
        answer: 'The PDF cannot be successfully decrypted and the unlock operation will fail.',
      },
      {
        question: 'Does unlocking change the PDF?',
        answer: 'The pages are written into a new PDF without the original opening-password protection. Review important output files because rewritten PDFs are not guaranteed to preserve every internal feature identically.',
      },
      {
        question: 'When should I use this tool?',
        answer: 'Use it for a password-protected PDF that you own or have permission to access and for which you know the required password.',
      },
    ],
  },

  'pdf-watermark-remover': {
    sections: [
      {
        heading: 'Attempt to Remove Detectable PDF Watermarks',
        paragraphs: [
          'PDF watermarks can be stored in several different ways, which makes automatic removal difficult. This tool looks for watermark-like content and attempts to remove or cover elements that match its detection rules.',
          'Results depend heavily on how the original PDF was created. A simple text watermark may be easier to identify than a watermark embedded inside an image or complex page artwork.',
        ],
      },
      {
        heading: 'How Watermark Detection Works',
        paragraphs: [
          'The default processing method examines PDF text spans for watermark indicators such as known watermark words and unusually large text positioned around the page center.',
          'Because this is heuristic detection rather than perfect semantic understanding, ordinary page content can sometimes resemble a watermark and a watermark can sometimes avoid detection.',
        ],
      },
      {
        heading: 'Why the Result May Need Manual Review',
        paragraphs: [
          'Removing overlapping content is inherently difficult. Covering a detected watermark area can affect nearby text or graphics, while rebuilding text may introduce font, color, positioning, or rendering differences.',
          'For that reason, the output should be reviewed page by page before it is used as a replacement for an important original document.',
        ],
      },
      {
        heading: 'When Automatic Watermark Removal May Not Work',
        paragraphs: [
          'Image-based watermarks, unusual graphics, complex transparency, uncommon watermark text, or content merged directly into page artwork may not be recognized by text-oriented detection.',
          'If no matching watermark is detected, the processing logic can return an unchanged copy rather than pretending that a watermark was successfully removed.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Will every PDF watermark be removed?',
        answer: 'No. Watermark removal depends on how the watermark is stored and whether it matches the detection rules.',
      },
      {
        question: 'Can watermark removal affect other content?',
        answer: 'Yes. Watermarks can overlap real page content, and removal or reconstruction may affect nearby text, graphics, fonts, colors, or positioning.',
      },
      {
        question: 'What happens if no watermark is detected?',
        answer: 'The current default processing method can return the PDF unchanged when it does not detect matching watermark content.',
      },
      {
        question: 'Should I check the resulting PDF?',
        answer: 'Yes. Review every important page before relying on the processed document, especially when the watermark overlaps text or graphics.',
      },
    ],
  },

  'esign-pdf': {
    sections: [
      {
        heading: 'Place a Visual Signature on a PDF',
        paragraphs: [
          'The eSign PDF tool places a signature image onto selected PDF pages. It is useful when you need the visible appearance of your signature on a document.',
          'You can position and size the signature before processing so that the resulting image appears in the intended area of the page.',
        ],
      },
      {
        heading: 'How the Signature Is Added',
        paragraphs: [
          'The signature is inserted into the PDF as an image overlay at the selected coordinates and dimensions. Depending on the selected page option, the signature can be placed on a specific page or applied across pages.',
          'Because the signature becomes visual page content, review its size and position in the downloaded PDF before sending the document to someone else.',
        ],
      },
      {
        heading: 'Visual eSignature Versus a Digital Certificate Signature',
        paragraphs: [
          'This tool adds a visible signature image. It should not be confused with a certificate-based digital signature that cryptographically verifies the signer and detects document changes through a digital certificate.',
          'If a recipient, organization, or legal workflow specifically requires certificate-backed signing, use a signing service or PDF application that provides that type of digital-signature infrastructure.',
        ],
      },
      {
        heading: 'Check Signature Placement Before Sharing',
        paragraphs: [
          'PDF pages can have different dimensions, so a position that looks suitable on one page may not be appropriate on another. Inspect the resulting document to make sure the signature does not cover important text.',
          'Keep the unsigned source document when it is important to preserve an original version for your records.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does eSign PDF add a visible signature?',
        answer: 'Yes. The current implementation places the supplied signature image onto the PDF page as an image overlay.',
      },
      {
        question: 'Is this a certificate-based digital signature?',
        answer: 'No. It is a visual signature-image placement tool and does not create a certificate-backed cryptographic digital signature.',
      },
      {
        question: 'Can I choose where the signature appears?',
        answer: 'Yes. Signature placement information includes the page, position, width, and height used when overlaying the image.',
      },
      {
        question: 'Should I inspect the signed PDF afterward?',
        answer: 'Yes. Check the signature position, size, page selection, and surrounding document content before sharing the resulting PDF.',
      },
    ],
  },
};

export default function HumanizedPdfBatchSixContent({
  toolId,
}: {
  toolId: string;
}) {
  const content = CONTENT[toolId];

  if (!content) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
      {content.sections.map((section) => (
        <section key={section.heading} className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            {section.heading}
          </h2>

          <div className="space-y-4">
            {section.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="text-lg text-gray-700 leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      ))}

      <div className="mt-16">
        <FAQSection
          title="Frequently Asked Questions"
          faqs={content.faqs}
          bgColor="white"
          borderTop={true}
          includeSchema={true}
        />
      </div>
    </div>
  );
}
