export function AviToMp4Guide() {
  return (
    <section
      className="mx-auto mt-12 max-w-6xl rounded-xl border border-gray-200 bg-white p-6 md:p-8"
      aria-labelledby="avi-to-mp4-guide-heading"
    >
      <h2
        id="avi-to-mp4-guide-heading"
        className="text-2xl font-bold text-gray-900"
      >
        Convert AVI video to MP4: formats, quality, and troubleshooting
      </h2>

      <p className="mt-4 leading-7 text-gray-700">
        AVI is a container format found in older recordings, exported
        videos, and some editing workflows. If an application requires
        MP4 instead, this converter can create an MP4 copy from a
        readable AVI file. Upload one AVI video, choose a quality
        setting, run the conversion, and review the downloaded result.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            What files does the converter accept?
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            This tool accepts one .avi file and produces an .mp4 file.
            The source needs a video stream that FFmpeg can decode.
            AVI files can contain different internal codecs, so a
            supported extension does not guarantee that every
            recording can be converted. Corrupted or unusual media
            may fail during processing.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            What do Low, Medium, and High mean?
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            The video is encoded using H.264. Low selects CRF 28,
            Medium selects CRF 23, and High selects CRF 18.
            Medium is the default. A lower CRF generally preserves
            more picture detail but can produce a larger file.
            These settings do not guarantee a particular output size.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Is this just an AVI extension change?
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            No. The converter re-encodes video as H.264 and uses AAC
            for audio in the MP4 container. Re-encoding takes
            processing time and may change visual quality, audio
            characteristics, and file size. It cannot recover
            details already lost in the original recording.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Will the MP4 play on every device?
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            H.264 video with AAC audio is widely supported, but
            playback still depends on the target application,
            device, and its supported media profiles. Test the
            downloaded MP4 in the intended player before deleting
            or replacing your original AVI.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          When is AVI to MP4 conversion useful?
        </h3>
        <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-gray-700">
          <li>
            <strong>Website uploads:</strong> Prepare an AVI recording
            for a service that accepts MP4 rather than AVI.
          </li>
          <li>
            <strong>Sharing older videos:</strong> Create an MP4 copy
            for someone whose playback software supports H.264/AAC.
          </li>
          <li>
            <strong>Editing projects:</strong> Generate an MP4 input
            for an editor that supports the resulting codecs.
          </li>
        </ul>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Troubleshooting AVI to MP4 conversion
        </h3>
        <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-gray-700">
          <li>
            <strong>Conversion fails:</strong> Check whether the
            original AVI plays correctly. Damaged files or codecs
            unavailable to the converter may prevent processing.
          </li>
          <li>
            <strong>The MP4 is larger than expected:</strong> Try
            Low quality if a smaller file matters more than
            preserving fine detail. Output size also depends on
            duration, resolution, motion, and source compression.
          </li>
          <li>
            <strong>The picture looks softer:</strong> Try High
            quality. Re-encoding is lossy, and it cannot restore
            detail that is already absent from the AVI.
          </li>
          <li>
            <strong>The result has no audio:</strong> Check whether
            the source contains a readable audio stream. Changing
            the container cannot create audio that is missing.
          </li>
          <li>
            <strong>Processing takes too long:</strong> Large or
            complex recordings require more encoding work.
            Server limits and timeouts can also affect completion.
          </li>
        </ul>
      </div>
    </section>
  );
}
