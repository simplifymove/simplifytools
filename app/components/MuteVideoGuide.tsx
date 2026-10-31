export function MuteVideoGuide() {
  return (
    <section
      className="mx-auto mt-12 max-w-6xl rounded-xl border border-gray-200 bg-white p-6 md:p-8"
      aria-labelledby="mute-video-guide-heading"
    >
      <h2
        id="mute-video-guide-heading"
        className="text-2xl font-bold text-gray-900"
      >
        How to remove audio from a video
      </h2>

      <p className="mt-4 leading-7 text-gray-700">
        Mute Video removes the audio stream from a video file and
        produces a silent MP4. Unlike lowering the playback volume,
        removing the audio stream means the resulting file does not
        contain the original soundtrack.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Supported input formats
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            Upload an MP4, MOV, AVI, MKV, or WebM file. The tool
            processes one video at a time and downloads the result
            as an MP4, regardless of the original file extension.
          </p>
          <p className="mt-3 leading-7 text-gray-700">
            A supported extension does not guarantee that every
            codec or damaged file can be processed. The video must
            contain a readable video stream.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            What happens to video quality?
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            The tool first attempts to copy the video stream without
            re-encoding it while removing audio. If the video codec
            cannot be copied into MP4, the tool attempts H.264
            encoding instead.
          </p>
          <p className="mt-3 leading-7 text-gray-700">
            Re-encoding can change image quality, file size, and
            processing time. Removing audio also does not remove
            subtitles or text already embedded in video frames.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          When is a silent video useful?
        </h3>
        <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-gray-700">
          <li>
            <strong>Presentations:</strong> Remove unwanted background
            conversations before adding a new narration or soundtrack.
          </li>
          <li>
            <strong>Social media:</strong> Prepare a silent clip for
            captions, graphics, or a separate audio track.
          </li>
          <li>
            <strong>Product demonstrations:</strong> Keep the visual
            walkthrough without recording-room noise.
          </li>
        </ul>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Troubleshooting audio removal
        </h3>
        <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-gray-700">
          <li>
            <strong>The file will not process:</strong> Check that the
            video is playable and uses a supported input format.
            Damaged files and unsupported codecs may fail.
          </li>
          <li>
            <strong>The output file size changed:</strong> MP4
            packaging and possible H.264 re-encoding can change
            file size even when the video duration stays similar.
          </li>
          <li>
            <strong>Text or captions remain visible:</strong> Audio
            removal does not erase captions burned into the picture.
          </li>
          <li>
            <strong>The original audio is needed later:</strong> Keep
            a separate copy of the source video. The downloaded
            silent MP4 does not preserve its audio track.
          </li>
        </ul>
      </div>
    </section>
  );
}
