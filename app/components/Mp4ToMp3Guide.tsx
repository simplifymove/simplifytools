export function Mp4ToMp3Guide() {
  return (
    <section
      className="mx-auto mt-12 max-w-6xl rounded-xl border border-gray-200 bg-white p-6 md:p-8"
      aria-labelledby="mp4-to-mp3-guide-heading"
    >
      <h2
        id="mp4-to-mp3-guide-heading"
        className="text-2xl font-bold text-gray-900"
      >
        MP4 to MP3: audio extraction and quality explained
      </h2>

      <p className="mt-4 leading-7 text-gray-700">
        An MP4 file can contain video, audio, and other streams. This
        converter creates an MP3 audio file from an available audio
        stream and excludes the video. The result is intended for
        listening rather than video playback.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Choosing an MP3 quality setting
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            Low, Medium, and High are encoding-quality choices, not
            guaranteed fixed bitrates. The converter uses FFmpeg
            variable-quality settings, so the resulting bitrate and
            file size depend on the audio content.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-gray-700">
            <li>
              Low: useful when a smaller file matters more than detail.
            </li>
            <li>
              Medium: a compromise between file size and sound quality.
            </li>
            <li>
              High: prioritizes preserving more audible detail during
              MP3 encoding and is the default selection.
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            What to expect from the output
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            MP3 uses lossy audio compression. Re-encoding cannot
            restore details already missing from the source recording.
            Choosing High does not turn noisy, distorted, or
            low-quality source audio into a higher-fidelity recording.
          </p>
          <p className="mt-3 leading-7 text-gray-700">
            Use the resulting MP3 for audio-only listening or sharing
            where MP3 is supported. Keep the original MP4 when you
            still need its video track.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Example: save the audio from a recorded presentation
        </h3>
        <p className="mt-3 leading-7 text-gray-700">
          Suppose you recorded a presentation as an MP4 and want to
          listen to its narration without watching the video. Upload
          the MP4, choose an audio-quality setting, start conversion,
          and review the downloaded MP3. Slides and other visuals
          will not appear in the audio file.
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Troubleshooting MP4 to MP3 conversion
        </h3>
        <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-gray-700">
          <li>
            <strong>No audio in the source:</strong> An MP4 without a
            usable audio stream cannot provide the intended MP3
            content. Check whether the original video plays sound.
          </li>
          <li>
            <strong>Conversion fails:</strong> The file may be
            damaged, use unsupported media characteristics, or
            exceed processing limits. Try another valid MP4 file.
          </li>
          <li>
            <strong>Output sounds worse:</strong> MP3 encoding can
            introduce additional quality loss. Try High quality,
            but remember that existing source distortion remains.
          </li>
          <li>
            <strong>Processing takes too long:</strong> Longer or
            more demanding files may take more time or time out.
            Consider working with a shorter source recording.
          </li>
        </ul>
      </div>
    </section>
  );
}