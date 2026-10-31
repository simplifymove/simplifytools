export function MkvToMp4Guide() {
  return (
    <section
      className="mx-auto mt-12 max-w-6xl rounded-xl border border-gray-200 bg-white p-6 md:p-8"
      aria-labelledby="mkv-to-mp4-guide-heading"
    >
      <h2
        id="mkv-to-mp4-guide-heading"
        className="text-2xl font-bold text-gray-900"
      >
        Convert MKV to MP4: audio tracks, subtitles, and compatibility
      </h2>

      <p className="mt-4 leading-7 text-gray-700">
        MKV is a flexible video container that can hold video,
        multiple audio languages, subtitles, and other streams.
        MP4 is commonly accepted by websites and video applications.
        This tool converts one readable .mkv file into an .mp4
        file using server-side processing. The conversion re-encodes
        video and audio rather than merely renaming the file.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Supported input and output
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            Upload one .mkv video to create an .mp4 file. The
            source must contain a video stream that FFmpeg can
            decode. MKV supports many internal codecs, so an
            MKV extension alone does not guarantee successful
            conversion. Damaged or unusual media may fail.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            What video and audio codecs are used?
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            The converter encodes video as H.264 and audio as AAC
            inside the MP4 container. These formats are widely
            supported, but compatibility still depends on the
            destination player, device, and media requirements.
            Re-encoding may change quality and file size.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            What happens to multiple audio tracks?
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            The current converter uses FFmpeg automatic stream
            selection. It does not provide an audio-language
            selector or preserve every audio track. In a test
            with English and French audio tracks, the resulting
            MP4 retained only the English track. Check which
            language appears in your downloaded result.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Are embedded subtitles preserved?
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            Do not rely on this converter to preserve embedded
            subtitles. A tested MKV with an SRT subtitle stream
            produced an MP4 without that subtitle track.
            This tool does not offer subtitle-track selection
            or a setting to burn captions into the picture.
            Keep the original MKV if subtitles matter.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          How to convert an MKV file to MP4
        </h3>
        <ol className="mt-4 list-decimal space-y-3 pl-6 leading-7 text-gray-700">
          <li>Select one readable MKV video from your device.</li>
          <li>
            Start the conversion. This tool currently has no
            additional quality or track-selection controls.
          </li>
          <li>
            Download the resulting MP4 after processing completes.
          </li>
          <li>
            Play the MP4 and check its video, audio language,
            and subtitle requirements before replacing the MKV.
          </li>
        </ol>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Common MKV to MP4 questions and problems
        </h3>
        <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-gray-700">
          <li>
            <strong>Why is an audio language missing?</strong>
            The converter automatically selects an audio stream
            rather than preserving all language tracks.
          </li>
          <li>
            <strong>Where did my subtitles go?</strong>
            Embedded subtitles may be omitted. Keep the original
            file when captions or subtitle languages are needed.
          </li>
          <li>
            <strong>Why is the MP4 larger?</strong>
            Re-encoding does not guarantee smaller files.
            Output size depends on duration, resolution,
            motion, and source compression.
          </li>
          <li>
            <strong>Why does conversion fail?</strong>
            An unsupported internal codec, corrupted source,
            or processing limit may prevent completion.
          </li>
          <li>
            <strong>Why does conversion take time?</strong>
            H.264 encoding requires processing work, especially
            for long or high-resolution recordings.
          </li>
        </ul>
      </div>
    </section>
  );
}
