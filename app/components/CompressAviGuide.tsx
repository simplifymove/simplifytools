export function CompressAviGuide() {
  return (
    <section
      className="mx-auto mt-12 max-w-6xl rounded-xl border border-gray-200 bg-white p-6 md:p-8"
      aria-labelledby="compress-avi-guide-heading"
    >
      <h2
        id="compress-avi-guide-heading"
        className="text-2xl font-bold text-gray-900"
      >
        How to compress an AVI video online
      </h2>

      <p className="mt-4 leading-7 text-gray-700">
        AVI is a video container used by many older recording and
        editing applications. This tool accepts an .avi file and
        produces a compressed .avi file. Upload your recording,
        choose Low, Medium, or High compression, start processing,
        and download the result. The output keeps the AVI container
        but re-encodes its video and audio streams.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Supported input and output
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            The compressor accepts one .avi video and returns an
            .avi file. The source must contain readable media
            streams. The output uses H.264 video and AAC audio.
            This differs from many older AVI recordings that use
            MPEG-4 or other video codecs with MP3 audio.
            Re-encoding changes the internal codecs rather than
            simply repackaging the original streams.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Choose a compression level
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            Low uses CRF 28, a superfast encoding preset, and a
            1200 kbps video bitrate limit. Medium is the default
            and uses CRF 32, a medium preset, and an 800 kbps
            limit. High uses CRF 40, a slow preset, and a 500 kbps
            limit. These are encoding settings, not guaranteed
            output bitrates or file sizes.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Balance quality and file size
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            Low compression is a sensible starting point when
            picture clarity matters. Medium reduces more detail
            to pursue a smaller file. High applies aggressive
            compression and may noticeably blur text, remove
            texture, or introduce blocky artifacts. Results vary
            with the source recording. Keep the original AVI
            until you have reviewed the compressed copy.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Understand AVI compatibility
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            An AVI extension does not guarantee playback in every
            AVI-compatible program. This tool writes H.264 video
            and AAC audio inside AVI. Modern FFmpeg-compatible
            players may decode these streams, but older AVI
            players, hardware devices, or editing applications
            may expect different codecs. Check the destination
            software before relying on the compressed file.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Why might the compressed AVI be larger?
        </h3>
        <p className="mt-3 leading-7 text-gray-700">
          Compression does not guarantee a smaller file. Very
          short videos and recordings that already use efficient
          compression can grow after re-encoding. File size also
          depends on resolution, duration, movement, source
          bitrate, and audio. The tool encodes audio as AAC at
          96 kbps, which may increase audio size when the
          original uses a much lower bitrate.
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          When is AVI compression useful?
        </h3>
        <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-gray-700">
          <li>
            <strong>Sharing large recordings:</strong> Create a
            smaller copy before transferring an AVI video.
          </li>
          <li>
            <strong>Saving storage:</strong> Reduce the space
            used by high-bitrate recordings when some quality
            loss is acceptable.
          </li>
          <li>
            <strong>Preparing uploads:</strong> Try a compressed
            AVI when a service accepts AVI files and has a size
            limit. Verify the actual output size and codecs.
          </li>
          <li>
            <strong>Creating review copies:</strong> Share a
            lighter version while retaining the original for
            editing, archiving, or future conversion.
          </li>
        </ul>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Troubleshooting AVI compression
        </h3>
        <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-gray-700">
          <li>
            <strong>The file became larger:</strong> The source
            may be short or already efficiently compressed.
            Compare output sizes before choosing a setting.
          </li>
          <li>
            <strong>The picture looks blurry:</strong> Choose
            Low compression. Medium and High discard more visual
            detail and cannot recover information once lost.
          </li>
          <li>
            <strong>The AVI does not play:</strong> Confirm that
            the player supports H.264 video and AAC audio inside
            an AVI container. Older AVI software may not.
          </li>
          <li>
            <strong>Processing is slow:</strong> High compression
            uses a slower encoding preset. Long or high-resolution
            recordings can take additional time.
          </li>
          <li>
            <strong>Compression fails:</strong> Check whether
            the original AVI plays correctly. Corrupted media
            or unsupported input codecs can prevent processing.
          </li>
        </ul>
      </div>
    </section>
  );
}