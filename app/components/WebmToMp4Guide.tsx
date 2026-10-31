export function WebmToMp4Guide() {
  return (
    <section
      className="mx-auto mt-12 max-w-6xl rounded-xl border border-gray-200 bg-white p-6 md:p-8"
      aria-labelledby="webm-to-mp4-guide-heading"
    >
      <h2
        id="webm-to-mp4-guide-heading"
        className="text-2xl font-bold text-gray-900"
      >
        Convert WebM to MP4: video codecs, audio, and compatibility
      </h2>

      <p className="mt-4 leading-7 text-gray-700">
        WebM is a media container often used for browser video,
        screen recordings, and web-based content. WebM recordings
        commonly contain VP8 or VP9 video with Opus audio.
        Converting WebM to MP4 can help when a website, editor,
        or application requires an MP4 file. Upload one readable
        WebM video, start processing, and download the result.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Supported input and output
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            This converter accepts one .webm file and produces
            an .mp4 file. The source must contain a video stream
            that the processing engine can decode. A file
            extension alone does not guarantee that every
            codec or damaged recording can be processed.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            What happens to VP9 and Opus?
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            The converter uses FFmpeg to re-encode video as H.264
            and available audio as AAC in an MP4 container.
            A synthetic WebM containing VP9 video and Opus
            audio was successfully converted to H.264/AAC MP4.
            This is not a simple file-extension rename.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            What if the WebM has no audio?
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            The converter cannot create sound that is missing
            from the original file. In a verified video-only
            WebM test, the resulting MP4 contained H.264 video
            without an audio stream. If your MP4 is silent,
            check whether the original WebM contains audio.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Will converting reduce file size?
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            Not necessarily. Re-encoding from VP9 to H.264
            can change file size and visual quality. The
            result depends on duration, resolution, motion,
            and source compression. This page currently
            offers no separate video-quality selector.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          When is WebM to MP4 useful?
        </h3>
        <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-gray-700">
          <li>
            <strong>Screen recordings:</strong> Convert a WebM
            recording for an editor that accepts H.264 MP4.
          </li>
          <li>
            <strong>File uploads:</strong> Prepare a video for
            a service that requires MP4 rather than WebM.
          </li>
          <li>
            <strong>Sharing videos:</strong> Create an MP4 copy
            for recipients using compatible playback software.
          </li>
        </ul>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Troubleshooting WebM to MP4 conversion
        </h3>
        <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-gray-700">
          <li>
            <strong>The MP4 has no sound:</strong> Check whether
            the source WebM contains an audio stream.
            Video-only recordings remain video-only.
          </li>
          <li>
            <strong>The conversion fails:</strong> Damaged
            files, unsupported source codecs, or server
            processing limits can prevent completion.
          </li>
          <li>
            <strong>The MP4 is larger:</strong> Different video
            codecs and encoding settings can produce larger
            output even when the format changes to MP4.
          </li>
          <li>
            <strong>The picture looks different:</strong>
            Re-encoding may introduce quality loss and cannot
            restore details missing from the source.
          </li>
          <li>
            <strong>The output will not play:</strong> Confirm
            that the target application supports MP4 with
            H.264 video and, when present, AAC audio.
          </li>
        </ul>
      </div>
    </section>
  );
}
