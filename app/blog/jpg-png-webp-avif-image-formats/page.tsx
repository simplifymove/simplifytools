import Link from 'next/link';
import { EditorialGuide } from '@/app/components/EditorialGuide';
import { blogGuides, guideMetadata } from '@/app/blog/guides';

const guide = blogGuides[1];
export const metadata = guideMetadata(guide.slug);

export default function ImageFormatsGuide() {
  return (
    <EditorialGuide {...guide}>
      <p className="text-xl leading-9 text-gray-800">
        Image format choice is a delivery decision. A photograph, a transparent logo, and a screenshot contain different kinds of visual information, so the same format will not encode all three equally well. The best choice is the one that preserves the features you need at a size and compatibility level your audience can use.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">The formats at a glance</h2>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-[720px] w-full border-collapse text-left text-sm">
          <thead className="bg-gray-100 text-gray-950"><tr><th scope="col" className="p-4">Format</th><th scope="col" className="p-4">Typical compression</th><th scope="col" className="p-4">Transparency</th><th scope="col" className="p-4">Often suitable for</th><th scope="col" className="p-4">Main caution</th></tr></thead>
          <tbody className="divide-y divide-gray-200">
            <tr><th scope="row" className="p-4">JPG/JPEG</th><td className="p-4">Lossy</td><td className="p-4">No</td><td className="p-4">Photographs and continuous tones</td><td className="p-4">Artifacts accumulate when repeatedly re-encoded</td></tr>
            <tr><th scope="row" className="p-4">PNG</th><td className="p-4">Lossless</td><td className="p-4">Yes, including partial alpha</td><td className="p-4">Logos, diagrams, interface captures</td><td className="p-4">Photographs can be much larger than JPG</td></tr>
            <tr><th scope="row" className="p-4">WebP</th><td className="p-4">Lossy or lossless</td><td className="p-4">Yes</td><td className="p-4">Web delivery needing flexible compression</td><td className="p-4">Check the requirements of non-browser software</td></tr>
            <tr><th scope="row" className="p-4">AVIF</th><td className="p-4">Lossy or lossless-capable</td><td className="p-4">Yes</td><td className="p-4">Modern web delivery at efficient sizes</td><td className="p-4">Encoding and application compatibility vary</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-3xl font-bold text-gray-950">Lossy and lossless describe encoding, not overall quality</h2>
      <p>
        Lossy encoding discards information to reduce size. At a careful setting, discarded differences may be hard to notice; at an aggressive setting, edges can develop ringing, gradients can band, and blocks can become visible. JPEG is the familiar example. Lossless encoding reconstructs the encoded pixel values exactly when decoded. PNG uses lossless compression, but that does not mean a PNG created from a JPEG recovers the JPEG’s discarded information.
      </p>
      <aside className="rounded-xl border-l-4 border-orange-600 bg-orange-50 p-6">
        <h3 className="text-xl font-bold text-gray-950">Conversion is not restoration</h3>
        <p className="mt-2">Changing a compressed JPG to PNG preserves the JPG’s currently decoded pixels; it cannot recreate texture, color detail, or sharpness lost when the JPG was made. The <Link href="/all-tools/jpg-to-png" className="font-semibold text-blue-700 underline">JPG to PNG converter</Link> also cannot invent transparency because JPEG has no alpha channel.</p>
      </aside>

      <h2 className="text-3xl font-bold text-gray-950">JPG: efficient for photographs</h2>
      <p>
        Photographs contain gradual changes, noise, and many colors. JPEG’s lossy model is designed for that material and is broadly supported by browsers, devices, office software, and publishing systems. It does not support transparency. It is a poor fit for tiny text, flat-color diagrams, and logos where compression halos around hard edges are conspicuous.
      </p>
      <p>
        If a transparent PNG no longer needs transparency and contains photographic content, <Link href="/all-tools/png-to-jpg" className="font-semibold text-blue-700 underline">PNG to JPG</Link> can produce a more suitable delivery file. Inspect the background and fine edges because flattening transparency and applying lossy compression are meaningful changes.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">PNG: exact pixels and useful transparency</h2>
      <p>
        PNG works well for interface screenshots, line art, icons, logos, and graphics with a limited palette or sharp boundaries. Its alpha channel can describe fully transparent and partially transparent pixels, making it useful for overlays. A PNG of a photograph may be far larger than a visually similar JPEG because lossless compression must retain every encoded pixel rather than approximate complex texture.
      </p>
      <h3 className="text-2xl font-bold text-gray-950">Why PNG sometimes becomes unexpectedly large</h3>
      <p>
        A 1600 × 900 photo contains 1.44 million pixels with irregular detail. JPEG can approximate that detail; PNG must represent it reversibly. Conversely, a 1600 × 900 diagram with a white background and a few flat colors contains repeated patterns that PNG can compress efficiently. Dimensions alone do not predict file size.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">WebP: a flexible web-oriented option</h2>
      <p>
        WebP supports lossy and lossless modes, transparency, and animation. That makes it useful when a site wants one modern family for photos and transparent graphics. It is widely usable in current browsers, but a recipient’s desktop application, content-management system, or print workflow may impose narrower requirements. Format support is an end-to-end question, not only a browser question.
      </p>
      <p>
        SimplifyConvert provides implemented routes for <Link href="/all-tools/jpg-to-webp" className="font-semibold text-blue-700 underline">JPG to WebP</Link>, <Link href="/all-tools/png-to-webp" className="font-semibold text-blue-700 underline">PNG to WebP</Link>, and <Link href="/all-tools/webp-to-jpg" className="font-semibold text-blue-700 underline">WebP to JPG</Link>. Converting a transparent WebP to JPG requires flattening transparency because JPG cannot store it.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">AVIF: efficient, modern, and worth compatibility checks</h2>
      <p>
        AVIF is based on AV1 image coding and can provide strong compression efficiency, including transparency and high-dynamic-range capabilities. It is useful for modern web image delivery when the publishing pipeline can encode it reliably and every important consumer can decode it. Encoding may take more work than older formats, and some editing, document, messaging, or legacy application workflows may still prefer JPG or PNG.
      </p>
      <p>
        This guide explains AVIF’s established format behavior but does not direct readers to a SimplifyConvert AVIF converter: the relevant site routes were not reliable enough to describe as supported editorial recommendations in this phase.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">Four practical choices</h2>
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 p-5"><h3 className="text-xl font-bold text-gray-950">Product photograph</h3><p className="mt-2">Start with JPG for broad delivery, or test lossy WebP/AVIF for a controlled web pipeline. Compare fine texture and gradients at the displayed size.</p></div>
        <div className="rounded-xl border border-gray-200 p-5"><h3 className="text-xl font-bold text-gray-950">Transparent logo</h3><p className="mt-2">Use PNG for predictable lossless edges and alpha, or lossless WebP where the full toolchain supports it. Do not use JPG if transparency must survive.</p></div>
        <div className="rounded-xl border border-gray-200 p-5"><h3 className="text-xl font-bold text-gray-950">Interface screenshot</h3><p className="mt-2">PNG often preserves small text and flat-color edges cleanly. A carefully tested lossless or high-quality WebP may reduce delivery size.</p></div>
        <div className="rounded-xl border border-gray-200 p-5"><h3 className="text-xl font-bold text-gray-950">Office attachment</h3><p className="mt-2">Choose the format the recipient’s software accepts. Compatibility can matter more than the smallest theoretical file.</p></div>
      </section>

      <h2 className="text-3xl font-bold text-gray-950">Decision summary</h2>
      <p>
        Use JPG for broadly compatible photographs, PNG for sharp graphics and dependable transparency, WebP for flexible modern web delivery, and AVIF where compression efficiency justifies compatibility and encoding checks. Preserve an original master, export for the destination, and judge quality at the actual display size. If file size is the problem rather than format compatibility, the separate guide to <Link href="/blog/image-compression-quality-file-size" className="font-semibold text-blue-700 underline">image compression, dimensions, and quality</Link> explains which lever to change first.
      </p>
    </EditorialGuide>
  );
}
