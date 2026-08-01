import Link from 'next/link';
import { EditorialGuide } from '@/app/components/EditorialGuide';
import { blogGuides, guideMetadata } from '@/app/blog/guides';

const guide = blogGuides[0];
export const metadata = guideMetadata(guide.slug);

export default function PdfWorkflowGuide() {
  return (
    <EditorialGuide {...guide}>
      <p className="text-xl leading-9 text-gray-800">
        A PDF can be too long, too large, out of order, unsearchable, or difficult to edit. Those symptoms sound similar when the immediate goal is “fix this PDF,” but they require different operations. Start by naming the problem you can observe. Then choose the smallest operation that solves it.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">A quick decision table</h2>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-[680px] w-full border-collapse text-left text-sm">
          <thead className="bg-gray-100 text-gray-950"><tr><th scope="col" className="p-4">Problem</th><th scope="col" className="p-4">Operation</th><th scope="col" className="p-4">What it changes</th><th scope="col" className="p-4">What it does not solve</th></tr></thead>
          <tbody className="divide-y divide-gray-200">
            <tr><th scope="row" className="p-4 font-semibold">Several PDFs belong together</th><td className="p-4">Merge</td><td className="p-4">File and page sequence</td><td className="p-4">Size, OCR, or page appearance</td></tr>
            <tr><th scope="row" className="p-4 font-semibold">Only certain pages are needed</th><td className="p-4">Split or extract</td><td className="p-4">Which pages remain together</td><td className="p-4">Content on those pages</td></tr>
            <tr><th scope="row" className="p-4 font-semibold">The complete document is too large</th><td className="p-4">Compress</td><td className="p-4">Encoding and document overhead</td><td className="p-4">Irrelevant pages or poor scans</td></tr>
            <tr><th scope="row" className="p-4 font-semibold">Scanned words cannot be searched</th><td className="p-4">OCR</td><td className="p-4">Adds or extracts recognized text</td><td className="p-4">Reliable visual reconstruction in Word</td></tr>
            <tr><th scope="row" className="p-4 font-semibold">The wording needs substantial editing</th><td className="p-4">PDF to Word</td><td className="p-4">Creates editable document content</td><td className="p-4">Pixel-perfect layout preservation</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-3xl font-bold text-gray-950">Merge changes organization, not page design</h2>
      <p>
        Merging appends the pages of complete source files into one document. It is appropriate when a proposal, pricing appendix, and signed terms must travel as one attachment. The order of inputs matters: a five-page file placed first contributes the first five pages. Portrait and landscape pages can coexist, and merging does not make their margins or paper sizes uniform.
      </p>
      <p>
        Use <Link href="/all-tools/pdf/merge-pdf" className="font-semibold text-blue-700 underline">Merge PDF</Link> only after checking that every source belongs in the final package. If the source contains unwanted pages, split it first. Otherwise the merge faithfully carries the clutter into the new file.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">Split when the real problem is page selection</h2>
      <p>
        Splitting separates one PDF into smaller documents or extracts a selected range. This is often a better response than compression. Suppose a 60-page report is 18 MB, but a client needs only pages 22–28. Compressing all 60 pages spends quality and processing effort on material the client should not receive. Extracting seven pages is both clearer and often smaller.
      </p>
      <aside className="rounded-xl border-l-4 border-orange-600 bg-orange-50 p-6">
        <h3 className="text-xl font-bold text-gray-950">Decision example: an application packet</h3>
        <p className="mt-2">Extract the requested pages with <Link href="/all-tools/pdf/split-pdf" className="font-semibold text-blue-700 underline">Split PDF</Link>, verify that confidential pages are absent, then merge the selected forms and evidence in the requested order. Compress only if the resulting packet still exceeds the portal limit.</p>
      </aside>

      <h2 className="text-3xl font-bold text-gray-950">Compress only when all pages are necessary</h2>
      <p>
        PDF compression rewrites streams and document objects to reduce avoidable storage. Results depend on the source. Text-heavy files with redundant objects may shrink differently from scans whose JPEG page images are already compressed. A second compression pass can produce little benefit, and no setting can guarantee an exact output size.
      </p>
      <p>
        Start with a moderate setting in <Link href="/all-tools/pdf/compress-pdf" className="font-semibold text-blue-700 underline">Compress PDF</Link>. Compare the result at normal reading size and at high zoom, particularly signatures, diagrams, fine print, and screenshots. Keep the original until you have checked links, forms, and visible details.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">OCR addresses scanned text</h2>
      <p>
        A scan is usually a set of page images inside a PDF. It can look like a document while containing no selectable characters. Optical character recognition estimates letters and words from pixels, producing searchable or extractable text. OCR does not make the scan itself sharper, and recognition can fail on handwriting, skewed pages, shadows, unusual fonts, low contrast, or languages the engine is not configured to read.
      </p>
      <p>
        Use <Link href="/all-tools/pdf/pdf-ocr" className="font-semibold text-blue-700 underline">PDF OCR</Link> when the key requirement is finding, copying, or indexing words from a scan. Always verify names, account numbers, dates, decimal points, and totals against the page image before relying on the recognized text.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">When PDF to Word is the better next step</h2>
      <p>
        OCR alone is enough when you want search or plain extracted text. Choose <Link href="/all-tools/pdf/pdf-to-word" className="font-semibold text-blue-700 underline">PDF to Word</Link> when the next task is revising paragraphs, adding comments, or building a new editable document from the wording. A PDF stores positioned page content; a Word document stores flowing structure. Columns, tables, images, footnotes, fonts, and spacing may therefore require manual reconstruction.
      </p>
      <h3 className="text-2xl font-bold text-gray-950">A sensible scan-to-edit workflow</h3>
      <ol className="list-decimal space-y-2 pl-6">
        <li>Check whether text can already be selected. If it can, OCR may be unnecessary.</li>
        <li>If the page is an image, improve obvious rotation or contrast problems before recognition.</li>
        <li>Run OCR or PDF-to-Word, depending on whether you need search or editing.</li>
        <li>Compare the output with the original page by page.</li>
        <li>Rebuild complex tables manually or with a table-specific extraction process.</li>
      </ol>

      <h2 className="text-3xl font-bold text-gray-950">Common workflow mistakes</h2>
      <ul className="list-disc space-y-3 pl-6">
        <li><strong>Compressing irrelevant pages:</strong> remove them first instead of degrading a document nobody needs in full.</li>
        <li><strong>Running OCR on selectable text:</strong> direct extraction is usually cleaner than recognizing pixels again.</li>
        <li><strong>Expecting merge to repair sources:</strong> malformed, encrypted, or damaged PDFs should be opened and repaired independently.</li>
        <li><strong>Treating Word as a visual clone:</strong> budget time to correct reading order and rebuild layout.</li>
        <li><strong>Discarding the original too early:</strong> transformed files should be verified before replacing an archival source.</li>
      </ul>

      <h2 className="text-3xl font-bold text-gray-950">Decision summary</h2>
      <p>
        Merge for one ordered package, split for page selection, compress for a complete document that remains too large, and OCR for words trapped in page images. Use PDF-to-Word when editable prose is the destination, with the expectation of manual cleanup. In multi-step jobs, select pages first, organize them second, and compress last so each operation addresses a real remaining problem.
      </p>
    </EditorialGuide>
  );
}
