import Link from 'next/link';
import { EditorialGuide } from '@/app/components/EditorialGuide';
import { blogGuides, guideMetadata } from '@/app/blog/guides';

const guide = blogGuides.find((item) => item.slug === 'all-tools-guide')!;

export const metadata = guideMetadata(guide.slug);

export default function AllToolsGuide() {
  return (
    <EditorialGuide {...guide}>
      <p className="text-xl leading-9 text-gray-800">
        A file can be perfectly fine and still be wrong for the job in front of
        you. A photo may be too large to upload. A PDF may contain the right
        pages in the wrong order. A spreadsheet may need to become CSV before
        another application can read it. These are small problems, but they can
        interrupt work surprisingly quickly.
      </p>

      <p>
        SimplifyConvert groups these everyday jobs into focused online tools.
        The useful part is not simply having many tools in one place. It is
        being able to choose an operation based on what you actually need to
        change.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Start by describing the problem in plain language
      </h2>

      <p>
        Before choosing a converter, ask yourself what is wrong with the current
        file. Do you need a different format? A smaller file? Different
        dimensions? Fewer pages? A transparent background? Or are you trying to
        create something that does not exist yet?
      </p>

      <p>
        That simple question prevents a common mistake: converting a file when
        conversion is not actually the solution. If a JPG is too large for a
        website, for example, converting it to PNG may make the file larger.
        Compression or resizing would usually be the more relevant operation.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        PDF tasks are usually about documents or pages
      </h2>

      <p>
        PDFs often need more than format conversion. You might receive several
        documents that belong together, need to remove unnecessary pages, reduce
        an attachment before emailing it, or add information to an existing
        document.
      </p>

      <p>
        In those situations, start with the{' '}
        <Link
          href="/all-tools/pdf-tools"
          className="font-semibold text-orange-700 underline underline-offset-4"
        >
          PDF Tools
        </Link>{' '}
        collection rather than searching for a generic converter.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Image tasks often involve more than the format
      </h2>

      <p>
        Images have several characteristics that can change independently:
        format, dimensions, file size, transparency and visible content. That is
        why “make this image suitable for my website” can mean very different
        things depending on the original file.
      </p>

      <p>
        The{' '}
        <Link
          href="/all-tools/image-tools"
          className="font-semibold text-orange-700 underline underline-offset-4"
        >
          Image Tools
        </Link>{' '}
        section is useful when you need to convert an image, reduce its size,
        resize it, work with its background or perform another visual operation.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Video files need a little more patience
      </h2>

      <p>
        Video files can be much larger than images and documents. Their size is
        influenced by duration, resolution, bitrate, frame rate, codec and
        audio. As a result, video conversion and compression can take longer
        than a simple document operation.
      </p>

      <p>
        If the task involves video, browse the{' '}
        <Link
          href="/all-tools/video-tools"
          className="font-semibold text-orange-700 underline underline-offset-4"
        >
          Video Tools
        </Link>{' '}
        collection and choose the operation that matches the result you need.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Data conversion is about structure, not appearance
      </h2>

      <p>
        CSV, JSON, XML and Excel files can all contain data, but they organize
        that data differently. A spreadsheet may contain multiple sheets,
        formulas and formatting, while CSV is essentially a flat table. JSON,
        meanwhile, can represent nested structures that do not fit naturally
        into rows and columns.
      </p>

      <p>
        When moving information between systems, use{' '}
        <Link
          href="/all-tools/data"
          className="font-semibold text-orange-700 underline underline-offset-4"
        >
          Data Tools
        </Link>{' '}
        and inspect the converted result before importing it somewhere else.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Some jobs begin with an idea instead of a file
      </h2>

      <p>
        A converter transforms something you already have. AI-assisted creation
        is different: you provide instructions and generate a new starting
        point. SimplifyConvert separates those workflows into AI Studio rather
        than treating them like ordinary file conversions.
      </p>

      <p>
        You can explore{' '}
        <Link
          href="/ai-studio"
          className="font-semibold text-orange-700 underline underline-offset-4"
        >
          AI Studio
        </Link>{' '}
        when you want to create a presentation, document or spreadsheet from a
        prompt.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        A quick way to choose the right category
      </h2>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-[680px] w-full border-collapse text-left text-sm">
          <thead className="bg-gray-100 text-gray-950">
            <tr>
              <th className="p-4">What you have</th>
              <th className="p-4">What you need</th>
              <th className="p-4">Where to start</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="p-4">PDF</td>
              <td className="p-4">Merge, split, edit, sign or compress</td>
              <td className="p-4">PDF Tools</td>
            </tr>
            <tr>
              <td className="p-4">Photo or graphic</td>
              <td className="p-4">Convert, resize, compress or edit</td>
              <td className="p-4">Image Tools</td>
            </tr>
            <tr>
              <td className="p-4">Video</td>
              <td className="p-4">Convert, compress or modify</td>
              <td className="p-4">Video Tools</td>
            </tr>
            <tr>
              <td className="p-4">Structured data</td>
              <td className="p-4">Move between data formats</td>
              <td className="p-4">Data Tools</td>
            </tr>
            <tr>
              <td className="p-4">An idea or prompt</td>
              <td className="p-4">Create a new file</td>
              <td className="p-4">AI Studio</td>
            </tr>
          </tbody>
        </table>
      </div>

      <aside className="rounded-xl border-l-4 border-orange-500 bg-orange-50 p-6">
        <h3 className="text-xl font-bold text-gray-950">
          Keep the original until you check the result
        </h3>
        <p className="mt-2">
          A useful habit for any conversion or editing workflow is to keep the
          source file until you have opened and checked the output. This matters
          especially when page order, transparency, image quality or structured
          data is important.
        </p>
      </aside>

      <h2 className="text-3xl font-bold text-gray-950">
        When you are not sure where a tool belongs
      </h2>

      <p>
        You do not need to memorize the categories. Open the{' '}
        <Link
          href="/all-tools"
          className="font-semibold text-orange-700 underline underline-offset-4"
        >
          complete All Tools directory
        </Link>{' '}
        and look for the task in the language you would normally use to
        describe it. The goal is to get from the problem to the appropriate
        workflow with as little unnecessary processing as possible.
      </p>
    </EditorialGuide>
  );
}
