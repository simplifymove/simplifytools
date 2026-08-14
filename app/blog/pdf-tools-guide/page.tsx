import Link from 'next/link';
import { EditorialGuide } from '@/app/components/EditorialGuide';
import { blogGuides, guideMetadata } from '@/app/blog/guides';

const guide = blogGuides.find((item) => item.slug === 'pdf-tools-guide')!;

export const metadata = guideMetadata(guide.slug);

export default function PdfToolsGuide() {
  return (
    <EditorialGuide {...guide}>
      <p className="text-xl leading-9 text-gray-800">
        “I need to change this PDF” sounds like one task, but it can describe
        half a dozen different problems. Sometimes the pages need reorganizing.
        Sometimes the document is too large to send. In other cases, you need
        to add content, sign a form or turn another file into a PDF.
      </p>

      <p>
        Choosing the right PDF tool starts with identifying what should be
        different when you are finished.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Merge PDFs when separate files belong together
      </h2>

      <p>
        Imagine receiving an application form, supporting document and receipt
        as three separate PDFs when the recipient expects one attachment. That
        is a merging problem. The content itself does not need rewriting; the
        documents simply need to become one file in the correct order.
      </p>

      <p>
        A dedicated merge workflow is usually cleaner than printing files back
        to PDF or copying their contents into another application.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Split a PDF when you only need part of it
      </h2>

      <p>
        The opposite situation is just as common. A long PDF may contain one
        chapter, invoice or form that needs to be shared separately. Splitting
        lets you create a smaller document from selected pages without changing
        the original.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Compress a PDF when file size is the actual problem
      </h2>

      <p>
        If a document opens correctly but is too large for an upload limit or
        email attachment, changing its format may be unnecessary. Compression
        targets file size while trying to keep the document useful.
      </p>

      <p>
        Results vary because PDFs can contain very different material. A
        document made mostly of text behaves differently from a scanned PDF
        containing a full-page image on every page.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Edit when the visible page itself needs to change
      </h2>

      <p>
        Editing is different from organizing pages. If you need to add text,
        place a shape, draw on a page, add an image, highlight an area or apply
        a signature, you need an editor rather than a merger or converter.
      </p>

      <p>
        SimplifyConvert's{' '}
        <Link
          href="/all-tools/pdf/edit-pdf"
          className="font-semibold text-orange-700 underline underline-offset-4"
        >
          Edit PDF
        </Link>{' '}
        workspace is intended for those interactive page-level changes.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Convert when another format is genuinely required
      </h2>

      <p>
        Conversion makes sense when the destination application or workflow
        requires a different file type. The important question is what needs to
        survive the conversion. Text, images, page layout and editable
        structure do not always translate perfectly between fundamentally
        different formats.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Signing and editing are related, but not identical
      </h2>

      <p>
        Adding a signature is a focused document task. If the rest of the PDF
        is already correct, you should not need to rebuild the document just to
        place a signature. After signing, check its position and size before
        downloading the finished file.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Scanned PDFs need special attention
      </h2>

      <p>
        A PDF page that looks like text to your eyes may actually be a scanned
        image. That affects searching, copying and editing. OCR workflows are
        designed to recognize characters inside those images, but recognition
        can be affected by scan quality, unusual fonts, handwriting, skewed
        pages and low contrast.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Match the problem to the operation
      </h2>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-[680px] w-full border-collapse text-left text-sm">
          <thead className="bg-gray-100 text-gray-950">
            <tr>
              <th className="p-4">Situation</th>
              <th className="p-4">Likely operation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="p-4">Several PDFs should become one file</td>
              <td className="p-4">Merge</td>
            </tr>
            <tr>
              <td className="p-4">You only need selected pages</td>
              <td className="p-4">Split or extract</td>
            </tr>
            <tr>
              <td className="p-4">The PDF exceeds a file-size limit</td>
              <td className="p-4">Compress</td>
            </tr>
            <tr>
              <td className="p-4">Visible page content needs changing</td>
              <td className="p-4">Edit</td>
            </tr>
            <tr>
              <td className="p-4">A signature needs to be placed</td>
              <td className="p-4">Sign</td>
            </tr>
            <tr>
              <td className="p-4">A scanned page needs searchable text</td>
              <td className="p-4">OCR</td>
            </tr>
          </tbody>
        </table>
      </div>

      <aside className="rounded-xl border-l-4 border-orange-500 bg-orange-50 p-6">
        <h3 className="text-xl font-bold text-gray-950">
          Check important PDFs after processing
        </h3>
        <p className="mt-2">
          Open the downloaded document and inspect page order, orientation,
          readability and any content you added. For forms, contracts and other
          important documents, keep the untouched original as well.
        </p>
      </aside>

      <h2 className="text-3xl font-bold text-gray-950">
        Explore the PDF collection
      </h2>

      <p>
        Once you know what needs to change, browse{' '}
        <Link
          href="/all-tools/pdf-tools"
          className="font-semibold text-orange-700 underline underline-offset-4"
        >
          SimplifyConvert PDF Tools
        </Link>{' '}
        and choose the workflow that directly matches that task. Starting with
        the problem instead of repeatedly converting the document usually
        produces a simpler workflow.
      </p>
    </EditorialGuide>
  );
}
