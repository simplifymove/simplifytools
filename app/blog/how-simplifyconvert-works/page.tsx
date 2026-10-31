import Link from 'next/link';
import { EditorialGuide } from '@/app/components/EditorialGuide';
import { blogGuides, guideMetadata } from '@/app/blog/guides';

const guide = blogGuides.find(
  (item) => item.slug === 'how-simplifyconvert-works'
)!;

export const metadata = guideMetadata(guide.slug);

export default function HowSimplifyConvertWorksGuide() {
  return (
    <EditorialGuide {...guide}>
      <p className="text-xl leading-9 text-gray-800">
        SimplifyConvert brings file conversion, editing, compression, data
        utilities, and AI-assisted creation into one browser-based workspace.
        Instead of installing a separate application for every small task, you
        can choose the operation you need, provide the required input, review
        the available settings, process the file, and download the result.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        The basic SimplifyConvert workflow
      </h2>

      <p>
        Most tools follow a straightforward sequence. First, choose a tool that
        matches the job you actually need to perform. For example, converting
        an image format is different from reducing its file size, and merging
        PDF pages is different from editing content inside a PDF.
      </p>

      <ol className="list-decimal space-y-4 pl-6">
        <li>
          <strong className="text-gray-950">Choose the right tool.</strong>{' '}
          Browse the relevant category or use the All Tools directory to locate
          a converter, editor, compressor, utility, or AI workflow.
        </li>
        <li>
          <strong className="text-gray-950">Provide the input.</strong>{' '}
          Depending on the tool, this may be a PDF, image, video, spreadsheet,
          data file, text prompt, or another supported format.
        </li>
        <li>
          <strong className="text-gray-950">Review available settings.</strong>{' '}
          Some operations need only one click, while others expose controls such
          as dimensions, quality, output format, page selection, or editing
          options.
        </li>
        <li>
          <strong className="text-gray-950">Process the task.</strong>{' '}
          SimplifyConvert sends the input through the workflow required by that
          particular tool.
        </li>
        <li>
          <strong className="text-gray-950">Review and download the result.</strong>{' '}
          Where a preview is available, check the result before saving it to
          your device.
        </li>
      </ol>

      <h2 className="text-3xl font-bold text-gray-950">
        Start with the problem, not the file extension
      </h2>

      <p>
        Two files with the same extension can require completely different
        operations. A JPG that is too large for a website may need compression
        or resizing, while another JPG may need its background removed. A PDF
        might need page merging, compression, text editing, or a signature.
      </p>

      <p>
        Identifying the task first helps avoid unnecessary conversions and
        repeated processing. When possible, keep the original file available so
        you can return to it if the first output does not suit your needs.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        PDF tools
      </h2>

      <p>
        PDF workflows cover several different kinds of work. Page-organization
        tools can combine or separate documents, compression tools target file
        size, and editing tools work with visible page content.
      </p>

      <p>
        Browse the{' '}
        <Link
          href="/all-tools/pdf-tools"
          className="font-semibold text-orange-700 underline underline-offset-4"
        >
          PDF Tools
        </Link>{' '}
        category when working with documents that need merging, conversion,
        compression, editing, signing, or related PDF operations.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Image tools
      </h2>

      <p>
        Image tasks often involve a tradeoff between appearance, dimensions,
        transparency, format compatibility, and file size. Converting JPG to PNG
        does not automatically improve image detail, and compressing an image is
        different from changing its pixel dimensions.
      </p>

      <p>
        The{' '}
        <Link
          href="/all-tools/image-tools"
          className="font-semibold text-orange-700 underline underline-offset-4"
        >
          Image Tools
        </Link>{' '}
        collection includes converters as well as resizing, compression,
        background, enhancement, and visual-editing utilities.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Video tools
      </h2>

      <p>
        Video processing can involve considerably more data than a document or
        image. Resolution, duration, bitrate, frame rate, codec, and audio all
        influence processing time and output size.
      </p>

      <p>
        Use the{' '}
        <Link
          href="/all-tools/video-tools"
          className="font-semibold text-orange-700 underline underline-offset-4"
        >
          Video Tools
        </Link>{' '}
        area for supported conversion, editing, compression, and other
        video-related workflows.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Data conversion tools
      </h2>

      <p>
        Data formats are not interchangeable containers with identical
        capabilities. CSV represents a flat table, Excel can preserve workbook
        features, and JSON can represent nested objects and arrays. Converting
        between them may therefore require decisions about how structure and
        data types should be represented.
      </p>

      <p>
        Browse{' '}
        <Link
          href="/all-tools/data"
          className="font-semibold text-orange-700 underline underline-offset-4"
        >
          Data Tools
        </Link>{' '}
        when preparing CSV, JSON, XML, Excel, or related structured data for a
        different destination.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        AI Studio works differently from a normal converter
      </h2>

      <p>
        Traditional conversion tools begin with an existing file and transform
        it. AI Studio begins with instructions and uses an AI workflow to create
        new material. That distinction matters because generated content should
        be reviewed rather than treated as automatically correct.
      </p>

      <p>
        SimplifyConvert AI Studio currently includes workflows for creating
        presentations, documents, and spreadsheets. You can explore them from{' '}
        <Link
          href="/ai-studio"
          className="font-semibold text-orange-700 underline underline-offset-4"
        >
          AI Studio
        </Link>
        .
      </p>

      <aside className="rounded-xl border-l-4 border-orange-500 bg-orange-50 p-6">
        <h3 className="text-xl font-bold text-gray-950">
          Review generated files before using them
        </h3>
        <p className="mt-2">
          Whether a file is converted, edited, compressed, or AI-generated,
          open the downloaded result and check the information that matters to
          your workflow. For important documents, also keep the original input
          until you have confirmed the output.
        </p>
      </aside>

      <h2 className="text-3xl font-bold text-gray-950">
        What happens when a tool needs more settings?
      </h2>

      <p>
        Some tasks cannot be represented by a single Convert button. An image
        compressor may need a quality setting. A resize operation needs target
        dimensions. A PDF editor needs interactive controls for placing and
        transforming content.
      </p>

      <p>
        SimplifyConvert exposes those settings when they materially affect the
        result, while simpler conversions can remain intentionally
        straightforward.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Choosing between conversion, compression, editing, and creation
      </h2>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-[700px] w-full border-collapse text-left text-sm">
          <thead className="bg-gray-100 text-gray-950">
            <tr>
              <th scope="col" className="p-4">Goal</th>
              <th scope="col" className="p-4">Typical operation</th>
              <th scope="col" className="p-4">Example</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="p-4">Change file representation</td>
              <td className="p-4">Convert</td>
              <td className="p-4">JPG to PNG</td>
            </tr>
            <tr>
              <td className="p-4">Reduce storage or transfer size</td>
              <td className="p-4">Compress</td>
              <td className="p-4">Compress Image</td>
            </tr>
            <tr>
              <td className="p-4">Change visible content</td>
              <td className="p-4">Edit</td>
              <td className="p-4">Edit PDF</td>
            </tr>
            <tr>
              <td className="p-4">Reorganize existing content</td>
              <td className="p-4">Merge or split</td>
              <td className="p-4">Merge PDF</td>
            </tr>
            <tr>
              <td className="p-4">Generate new material from instructions</td>
              <td className="p-4">AI creation</td>
              <td className="p-4">Presentation Maker</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-3xl font-bold text-gray-950">
        A practical way to explore SimplifyConvert
      </h2>

      <p>
        If you already know the job you need to perform, open its category
        directly. If you are not sure which category contains it, start with
        the{' '}
        <Link
          href="/all-tools"
          className="font-semibold text-orange-700 underline underline-offset-4"
        >
          All Tools directory
        </Link>
        . It provides one place to discover the available converters, editors,
        utilities, and AI-assisted workflows.
      </p>
    </EditorialGuide>
  );
}
