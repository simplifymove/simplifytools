export function Mp4ToAviGuide() {
  return (
    <section
      className="mx-auto mt-12 max-w-6xl rounded-xl border border-gray-200 bg-white p-6 md:p-8"
      aria-labelledby="mp4-to-avi-guide-heading"
    >
      <h2
        id="mp4-to-avi-guide-heading"
        className="text-2xl font-bold text-gray-900"
      >
        Convert MP4 to AVI: quality, codecs, and compatibility
      </h2>

      <p className="mt-4 leading-7 text-gray-700">
        MP4 and AVI are video container formats. Converting
        an MP4 file to AVI can be useful when a workflow
        specifically requires an AVI file. Upload one
        readable MP4 video, choose the quality setting,
        run the conversion, and download the AVI result.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Which files are supported?
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            This converter accepts one .mp4 file and
            produces an .avi file. The source must contain
            a video stream that FFmpeg can decode.
            A supported file extension does not guarantee
            that every internal codec or damaged file
            can be processed successfully.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            What codecs are used?
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            The current converter re-encodes video as H.264
            and available audio as AAC, then writes an AVI
            file. It does not simply rename the extension.
            Some older AVI players expect different codecs
            and may not support this output combination.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            What do the quality settings mean?
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            Low uses H.264 CRF 28, Medium uses CRF 23,
            and High uses CRF 18. Medium is the default.
            Lower CRF values generally retain more picture
            detail but may produce larger output files.
            These settings do not specify a fixed bitrate.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Will AVI improve video quality?
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            No. Changing the container does not recover
            detail already missing from the MP4.
            Re-encoding can introduce additional loss.
            Keep the original MP4 if preserving the
            original recording is important.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          How to convert MP4 to AVI
        </h3>
        <ol className="mt-4 list-decimal space-y-3 pl-6 leading-7 text-gray-700">
          <li>Upload a supported .mp4 video file.</li>
          <li>
            Choose Low, Medium, or High quality.
            Medium is selected by default.
          </li>
          <li>Start the conversion and wait for processing.</li>
          <li>
            Download the AVI file and test it in the
            application where you plan to use it.
          </li>
        </ol>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          AVI compatibility considerations
        </h3>
        <p className="mt-3 leading-7 text-gray-700">
          AVI describes the container, not a universal
          video codec. An application requesting AVI may
          also require a specific internal video or audio
          codec. This tool currently uses H.264 and AAC.
          If an older player or editing system requires
          another codec, this AVI output may not be
          compatible with that application.
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Troubleshooting MP4 to AVI conversion
        </h3>
        <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-gray-700">
          <li>
            <strong>The AVI will not play:</strong> Check
            whether the player supports H.264 video and
            AAC audio inside an AVI container.
          </li>
          <li>
            <strong>The file is larger:</strong> Re-encoding
            changes compression. High quality can increase
            output size, and AVI is not automatically smaller.
          </li>
          <li>
            <strong>The picture looks different:</strong>
            Lossy video re-encoding can introduce changes.
            High quality cannot restore missing source detail.
          </li>
          <li>
            <strong>Conversion fails:</strong> Corrupted media,
            unsupported source codecs, or processing limits
            may prevent successful conversion.
          </li>
          <li>
            <strong>An older device rejects the file:</strong>
            Confirm its required video and audio codecs.
            The AVI extension alone does not ensure support.
          </li>
        </ul>
      </div>
    </section>
  );
}
