import Link from 'next/link';
import { EditorialGuide } from '@/app/components/EditorialGuide';
import { blogGuides, guideMetadata } from '@/app/blog/guides';

const guide = blogGuides.find((item) => item.slug === 'image-tools-guide')!;

export const metadata = guideMetadata(guide.slug);

export default function ImageToolsGuide() {
  return (
    <EditorialGuide {...guide}>
      <p className="text-xl leading-9 text-gray-800">
        Image editing becomes much easier once you separate four things that
        people often mix together: format, dimensions, file size and visible
        content. Changing one does not automatically fix the others.
      </p>

      <p>
        A photo can have the correct dimensions but still be too large to
        upload. A PNG can support transparency but still contain an opaque
        background. A JPG can be converted to PNG without gaining any new
        detail. Knowing what actually needs to change helps you choose the right
        tool the first time.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Convert an image when you need a different format
      </h2>

      <p>
        Format conversion is useful when a website, application or workflow
        expects a particular file type. JPG is widely used for photographs,
        while PNG is useful when lossless storage or transparency support is
        important. Other formats make different tradeoffs between compatibility,
        features and file size.
      </p>

      <p>
        Conversion changes how the image is encoded. It does not recreate
        detail that was already lost in the source image.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Compress when the image is too heavy
      </h2>

      <p>
        Large images can slow websites, take longer to upload and exceed
        attachment limits. Compression aims to reduce the number of bytes
        required to store the image.
      </p>

      <p>
        The useful target is not always the smallest possible file. Excessive
        compression can introduce visible artifacts. A better goal is a file
        that is small enough for its destination while still looking acceptable
        at the size people will actually view it.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Resize when the pixel dimensions are wrong
      </h2>

      <p>
        A 4000-pixel-wide photograph may be unnecessary if it will only appear
        as a small website thumbnail. Resizing changes the image dimensions and
        can also reduce file size because fewer pixels need to be stored.
      </p>

      <p>
        When resizing, preserve the aspect ratio unless you intentionally want
        to stretch the image. Cropping is often a better solution when the
        destination requires a different shape.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Remove a background when the subject needs to stand alone
      </h2>

      <p>
        Product photos, profile images and design assets sometimes need the
        subject separated from its background. That is a content-editing task,
        not simply a format conversion.
      </p>

      <p>
        Fine details such as hair, fur, translucent objects and soft shadows can
        make background removal more difficult. Always inspect the edges of the
        processed image rather than judging it only from a small preview.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Transparency requires a format that can preserve it
      </h2>

      <p>
        If you remove a background and need the empty area to remain
        transparent, the output format must support transparency. Saving that
        result to a format without suitable transparency support can replace
        those areas with a solid background.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Cropping and resizing solve different problems
      </h2>

      <p>
        Resizing changes the dimensions of the whole image. Cropping removes
        part of the frame. If a landscape photograph needs to become a square
        profile picture, simply forcing it into square dimensions can distort
        faces and objects. Cropping the composition first is usually more
        natural.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Choose the operation by looking at the problem
      </h2>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-[680px] w-full border-collapse text-left text-sm">
          <thead className="bg-gray-100 text-gray-950">
            <tr>
              <th className="p-4">Problem</th>
              <th className="p-4">Operation to consider</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="p-4">The destination requires another format</td>
              <td className="p-4">Convert</td>
            </tr>
            <tr>
              <td className="p-4">The image file is too large</td>
              <td className="p-4">Compress</td>
            </tr>
            <tr>
              <td className="p-4">Width or height is unsuitable</td>
              <td className="p-4">Resize</td>
            </tr>
            <tr>
              <td className="p-4">The composition needs a different shape</td>
              <td className="p-4">Crop</td>
            </tr>
            <tr>
              <td className="p-4">The subject needs to be isolated</td>
              <td className="p-4">Remove background</td>
            </tr>
          </tbody>
        </table>
      </div>

      <aside className="rounded-xl border-l-4 border-orange-500 bg-orange-50 p-6">
        <h3 className="text-xl font-bold text-gray-950">
          Avoid repeatedly processing the same copy
        </h3>
        <p className="mt-2">
          Keep your original image and perform major edits from that source when
          possible. Repeatedly saving and recompressing an already processed
          image can gradually reduce quality, particularly with lossy formats.
        </p>
      </aside>

      <h2 className="text-3xl font-bold text-gray-950">
        Explore SimplifyConvert Image Tools
      </h2>

      <p>
        If you know whether the problem is format, size, dimensions, background
        or visible content, choosing a tool becomes much simpler. Browse the{' '}
        <Link
          href="/all-tools/image-tools"
          className="font-semibold text-orange-700 underline underline-offset-4"
        >
          Image Tools
        </Link>{' '}
        collection to find the workflow that matches the change you actually
        need.
      </p>
    </EditorialGuide>
  );
}
