import Link from 'next/link';
import { EditorialGuide } from '@/app/components/EditorialGuide';
import { blogGuides, guideMetadata } from '@/app/blog/guides';

const guide = blogGuides[2];
export const metadata = guideMetadata(guide.slug);

export default function ImageCompressionGuide() {
  return (
    <EditorialGuide {...guide}>
      <p className="text-xl leading-9 text-gray-800">
        “Make this image smaller” can mean fewer bytes, fewer pixels, or both. Compression changes how pixel information is encoded. Resizing changes how many pixels exist. Knowing which lever you are pulling makes it easier to meet an upload limit without sacrificing more detail than necessary.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">Compression and resizing are separate operations</h2>
      <p>
        An image that is 3000 × 2000 pixels contains six million pixel positions. Reducing JPEG quality keeps those dimensions but represents the pixels less precisely. Resizing it to 1200 × 800 reduces the image to 960,000 positions. The second operation discards spatial detail, but it can remove far more data when the destination never displays the original dimensions.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-blue-200 bg-blue-50 p-6"><h3 className="text-xl font-bold text-gray-950">Compress when</h3><ul className="mt-3 list-disc space-y-2 pl-5"><li>The dimensions already match the destination.</li><li>You need to tune encoded size and visible artifacts.</li><li>Preserving width and height is a requirement.</li></ul></section>
        <section className="rounded-xl border border-orange-200 bg-orange-50 p-6"><h3 className="text-xl font-bold text-gray-950">Resize when</h3><ul className="mt-3 list-disc space-y-2 pl-5"><li>The source is much larger than its display area.</li><li>An upload form specifies pixel dimensions.</li><li>A thumbnail or preview does not need full-resolution pixels.</li></ul></section>
      </div>
      <p>
        SimplifyConvert keeps these jobs distinct: <Link href="/all-tools/compress-image" className="font-semibold text-blue-700 underline">Compress Image</Link> keeps the original Canvas dimensions while re-encoding, whereas <Link href="/all-tools/resize-image" className="font-semibold text-blue-700 underline">Resize Image</Link> redraws at the width and height you enter.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">Pixel dimensions set the detail ceiling</h2>
      <p>
        Width and height determine how much spatial information an image can carry. Downscaling combines source pixels into a smaller grid. It can make a file easier to deliver, but small text and fine texture may disappear. Upscaling creates more pixel positions through interpolation; it does not recover detail absent from the source. Physical print size also depends on output density and viewing distance, so pixel dimensions alone are not a promise of print quality.
      </p>
      <aside className="rounded-xl border-l-4 border-orange-600 bg-orange-50 p-6">
        <h3 className="text-xl font-bold text-gray-950">Web-upload example</h3>
        <p className="mt-2">A site displays a product photo at no more than 1200 pixels wide, but the camera original is 6000 × 4000. Resize a copy to 1200 × 800 first, then adjust JPEG or WebP quality while checking fabric texture and edges. Compressing the 6000-pixel original alone makes the browser download pixels it will immediately scale down.</p>
      </aside>

      <h2 className="text-3xl font-bold text-gray-950">What a quality setting actually controls</h2>
      <p>
        A lossy quality control tells an encoder how aggressively it may approximate the image. It is not a universal percentage of retained detail, and “70” in one encoder is not guaranteed to match “70” in another. Content matters: smooth skies reveal banding, text reveals ringing, and foliage or hair contains complex high-frequency detail that can be expensive to encode.
      </p>
      <h3 className="text-2xl font-bold text-gray-950">Common JPEG artifacts</h3>
      <ul className="list-disc space-y-3 pl-6">
        <li><strong>Blocking:</strong> square regions become visible in flat or heavily compressed areas.</li>
        <li><strong>Ringing:</strong> faint halos appear around text and high-contrast edges.</li>
        <li><strong>Smearing:</strong> fine texture such as grass, hair, or fabric blends together.</li>
        <li><strong>Banding:</strong> a smooth gradient breaks into visible steps.</li>
      </ul>
      <p>Inspect the output at 100% zoom as well as at its intended display size. A technically visible difference may be irrelevant in a small thumbnail, while a damaged word in a screenshot can make the image unusable.</p>

      <h2 className="text-3xl font-bold text-gray-950">Why PNG behaves differently</h2>
      <p>
        PNG normally uses lossless compression. Its encoder looks for patterns without intentionally approximating pixel values. Browser Canvas encoders may ignore a generic quality argument for PNG, so moving a quality slider can produce little or no reduction. A photograph converted from JPG to PNG can grow because PNG must reversibly represent the already-decoded photographic pixels.
      </p>
      <p>
        If PNG is required because the image needs transparency or crisp flat-color edges, reduce dimensions when appropriate or simplify the source artwork. If neither feature is needed, compare a photographic format instead. The <Link href="/blog/jpg-png-webp-avif-image-formats" className="font-semibold text-blue-700 underline">image-format comparison guide</Link> explains that choice in more detail.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">Why equal dimensions do not mean equal file sizes</h2>
      <p>Two 1200 × 800 images can differ greatly because encoded size depends on more than pixel count:</p>
      <ul className="list-disc space-y-3 pl-6">
        <li>Flat backgrounds and repeated shapes are easier to compress than noise, grain, hair, leaves, or water.</li>
        <li>Different formats and encoder settings represent the same visible scene differently.</li>
        <li>Transparency adds information, especially around soft edges.</li>
        <li>Metadata, color profiles, and editing history can add overhead.</li>
        <li>An image that has already been optimized may have little remaining redundancy.</li>
      </ul>

      <h2 className="text-3xl font-bold text-gray-950">A practical sequence for meeting an upload limit</h2>
      <ol className="list-decimal space-y-4 pl-6">
        <li><strong>Read the requirement.</strong> Note accepted formats, maximum bytes, and any exact dimensions.</li>
        <li><strong>Preserve a master.</strong> Work on a copy so each experiment starts from the best source.</li>
        <li><strong>Remove unnecessary pixels.</strong> Crop empty surroundings and resize to the largest useful display dimensions.</li>
        <li><strong>Choose the destination format.</strong> Keep transparency only if the destination needs it; use a photographic format for continuous-tone images.</li>
        <li><strong>Adjust quality gradually.</strong> Compare visual problem areas and actual bytes after every export.</li>
        <li><strong>Validate the upload.</strong> A file can meet a size limit yet fail because of dimensions, format, or color-mode requirements.</li>
      </ol>

      <h2 className="text-3xl font-bold text-gray-950">Repeated lossy saves have a cost</h2>
      <p>
        Each lossy encode makes decisions from the pixels it receives. Opening a JPEG, editing it, and saving another JPEG can discard information again—even if the new quality setting appears high. Repetition can strengthen halos and erase texture. Keep a lossless or highest-quality master when possible, make edits there, and create each delivery JPEG or WebP from that master instead of from the previous compressed copy.
      </p>
      <p>
        Format conversion alone does not reverse earlier loss. <Link href="/all-tools/jpg-to-png" className="font-semibold text-blue-700 underline">Converting JPG to PNG</Link> can avoid an additional lossy PNG encode, but the resulting PNG still contains the JPEG artifacts present at decode time. If the delivery system needs WebP, use <Link href="/all-tools/jpg-to-webp" className="font-semibold text-blue-700 underline">JPG to WebP</Link> from the best available source and compare the result.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">Decision summary</h2>
      <p>
        Resize when the destination needs fewer pixels; compress when dimensions are already appropriate but encoded size is not. Choose a format based on photographic content, sharp graphics, transparency, and recipient support. Because size cannot be predicted from dimensions alone, measure the actual output and inspect it. One deliberate export from a good master is safer than a chain of repeated lossy recompressions.
      </p>
    </EditorialGuide>
  );
}
