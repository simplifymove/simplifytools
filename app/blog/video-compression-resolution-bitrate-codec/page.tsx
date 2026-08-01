import Link from 'next/link';
import { EditorialGuide } from '@/app/components/EditorialGuide';
import { blogGuides, guideMetadata } from '@/app/blog/guides';

const guide = blogGuides[4];
export const metadata = guideMetadata(guide.slug);

export default function VideoCompressionGuide() {
  return (
    <EditorialGuide {...guide}>
      <p className="text-xl leading-9 text-gray-800">
        Video file size is not determined by duration alone. A minute of slides, a minute of handheld night footage, and a minute of fast sport can demand very different amounts of data. Resolution, bitrate, codec, frame rate, audio, and the visual complexity of the source all influence the result.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">The useful mental model</h2>
      <p>
        For constant-bitrate media, approximate size is bitrate multiplied by duration. Real encoders often vary bitrate over time, spending more data on difficult scenes and less on simple ones, but the relationship remains useful: longer duration or higher average bitrate generally means a larger file. Resolution and frame rate affect how much visual information the encoder must represent; the codec determines how efficiently it can represent that information.
      </p>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-[700px] w-full border-collapse text-left text-sm">
          <thead className="bg-gray-100 text-gray-950"><tr><th scope="col" className="p-4">Lever</th><th scope="col" className="p-4">Reducing it usually does</th><th scope="col" className="p-4">Look for</th></tr></thead>
          <tbody className="divide-y divide-gray-200">
            <tr><th scope="row" className="p-4">Duration</th><td className="p-4">Removes data directly</td><td className="p-4">Whether unneeded introductions or pauses can be trimmed</td></tr>
            <tr><th scope="row" className="p-4">Resolution</th><td className="p-4">Uses fewer pixels per frame</td><td className="p-4">Small text, faces, and fine detail</td></tr>
            <tr><th scope="row" className="p-4">Bitrate / quality target</th><td className="p-4">Represents frames less precisely</td><td className="p-4">Blocks, smearing, banding, and edge damage</td></tr>
            <tr><th scope="row" className="p-4">Frame rate</th><td className="p-4">Uses fewer frames per second</td><td className="p-4">Motion smoothness and timing requirements</td></tr>
            <tr><th scope="row" className="p-4">Audio bitrate</th><td className="p-4">Reduces audio data</td><td className="p-4">Speech clarity, music detail, and stereo needs</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-3xl font-bold text-gray-950">Resolution: how many pixels each frame contains</h2>
      <p>
        Resolution is the frame’s width and height, such as 1920 × 1080 or 1280 × 720. Moving from 1080p to 720p greatly reduces the number of pixels an encoder must describe, but it also reduces the available spatial detail. That trade can be sensible for a small embedded player and harmful for a software tutorial whose interface text must remain readable.
      </p>
      <p>
        Use <Link href="/all-tools/video/resize-video" className="font-semibold text-blue-700 underline">Resize Video</Link> when output dimensions themselves need to change. The separate <Link href="/all-tools/video/compress-video" className="font-semibold text-blue-700 underline">Compress Video</Link> page exposes compression level and CRF rather than an output-resolution control.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">Bitrate and quality targets</h2>
      <p>
        Bitrate measures data per unit of time. At the same codec, resolution, and content, a higher bitrate usually gives the encoder more room to preserve detail and creates a larger file. A quality-based control such as CRF takes the reverse approach: you choose a quality target and let bitrate vary with scene difficulty. With the CRF convention used by common H.264 tools, lower values preserve more detail and usually create larger files; higher values are more aggressive.
      </p>
      <p>
        There is no single correct value. Animation with flat colors may stay clean at a setting that damages noisy camera footage. Evaluate faces, text, gradients, shadows, and fast motion rather than judging only the opening frame.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">Codec and container are not the same thing</h2>
      <p>
        A codec defines how video or audio is encoded and decoded. H.264, H.265/HEVC, AV1, VP9, and AAC are codecs. A container such as MP4, MOV, MKV, or WebM packages one or more streams with timing and metadata. Renaming an extension does not transcode the streams, and two MP4 files can use different codecs internally.
      </p>
      <aside className="rounded-xl border-l-4 border-pink-600 bg-pink-50 p-6">
        <h3 className="text-xl font-bold text-gray-950">Compatibility example</h3>
        <p className="mt-2">A portal requesting “MP4” may also expect H.264 video and AAC audio. Converting a MOV source with <Link href="/all-tools/video/mov-to-mp4" className="font-semibold text-blue-700 underline">MOV to MP4</Link> can create the requested container workflow, but you should still play the result in the destination environment and confirm its documented codec requirements.</p>
      </aside>

      <h2 className="text-3xl font-bold text-gray-950">Frame rate matters when motion matters</h2>
      <p>
        Frame rate describes how many frames appear each second. Higher frame rates can preserve smooth motion but give the encoder more frames to represent. Reducing frame rate may save data, yet it can make pans, gameplay, demonstrations, or sport look uneven. Avoid changing it merely because the number is available; preserve the source timing unless the destination calls for a different rate and you have checked motion quality.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">Why equal-duration videos differ in size</h2>
      <h3 className="text-2xl font-bold text-gray-950">Screen recording</h3>
      <p>
        A mostly static slide deck has large unchanged regions that inter-frame compression can represent efficiently. But tiny interface text and sharp cursor edges expose ringing or blur quickly. Reduce frame rate only if motion is unimportant, and protect legibility when adjusting quality or resolution.
      </p>
      <h3 className="text-2xl font-bold text-gray-950">Camera footage</h3>
      <p>
        Handheld movement, water, leaves, low-light sensor noise, film grain, and frequent scene changes are harder to predict from nearby frames. The encoder may need a higher bitrate to maintain comparable quality. Stabilizing or denoising can affect compressibility, but those are editing decisions with their own visual consequences.
      </p>
      <h3 className="text-2xl font-bold text-gray-950">Animation and graphics</h3>
      <p>
        Flat colors can compress efficiently, while sharp lines and text can reveal artifacts. A codec and pixel format may also change edge appearance or color precision. Always check the actual output rather than assuming animation is automatically small.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">Audio can be small—or significant</h2>
      <p>
        Total size includes video, audio, and container overhead. In a high-bitrate 4K clip, audio may be a small share. In a low-resolution talking-head clip or nearly static presentation, a high audio bitrate can represent a more noticeable fraction. Speech often needs less data than complex music, but excessively aggressive audio compression can make consonants, ambience, and music sound brittle.
      </p>
      <p>
        If the picture is unnecessary, <Link href="/all-tools/video/extract-audio-from-video" className="font-semibold text-blue-700 underline">Extract Audio</Link> can produce an audio-only workflow instead of spending bytes on unchanged video frames.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">Practical compression decisions</h2>
      <section className="space-y-4">
        <div className="rounded-xl border border-gray-200 p-5"><h3 className="text-xl font-bold text-gray-950">Email or chat attachment</h3><p className="mt-2">Trim unneeded duration first. If the clip is still too large, test a moderate quality adjustment. Reduce resolution only when the recipient does not need full-size detail.</p></div>
        <div className="rounded-xl border border-gray-200 p-5"><h3 className="text-xl font-bold text-gray-950">Upload portal with a strict cap</h3><p className="mt-2">Check container, codec, duration, dimensions, and byte limit. Make one change at a time and leave margin below the cap because metadata and encoder output vary.</p></div>
        <div className="rounded-xl border border-gray-200 p-5"><h3 className="text-xl font-bold text-gray-950">Screen-recorded tutorial</h3><p className="mt-2">Keep enough resolution for UI labels. Test the smallest text and fastest cursor movement. A lower frame rate may be acceptable for slides but distracting during interaction.</p></div>
        <div className="rounded-xl border border-gray-200 p-5"><h3 className="text-xl font-bold text-gray-950">Camera footage for review</h3><p className="mt-2">Create a smaller review copy while retaining the camera master. Grain and motion may limit reduction before artifacts become objectionable.</p></div>
      </section>

      <h2 className="text-3xl font-bold text-gray-950">A repeatable checking process</h2>
      <ol className="list-decimal space-y-3 pl-6">
        <li>Keep the source and note its duration, dimensions, frame rate, codecs, and size.</li>
        <li>Remove footage that the recipient does not need.</li>
        <li>Choose a compatible container and codecs for the destination.</li>
        <li>Test a representative short section containing motion, text, faces, dark areas, and audio.</li>
        <li>Adjust quality or bitrate, then resolution only if appropriate.</li>
        <li>Play the complete output, confirm duration and audio synchronization, and measure its actual size.</li>
      </ol>

      <h2 className="text-3xl font-bold text-gray-950">Decision summary</h2>
      <p>
        Reduce duration when footage is unnecessary, resolution when the destination needs fewer pixels, and bitrate or quality when the same frame dimensions can tolerate less detail. Choose codec and container for the complete playback chain, not just the filename. Preserve enough frame rate for motion and enough audio quality for the material. Because sources vary, practical compression is an inspect-and-measure process—not a guaranteed percentage.
      </p>
    </EditorialGuide>
  );
}
