export function ExtractAudioFromVideoGuide() {
  return (
    <section
      className="mx-auto mt-12 max-w-6xl rounded-xl border border-gray-200 bg-white p-6 md:p-8"
      aria-labelledby="extract-audio-guide-heading"
    >
      <h2
        id="extract-audio-guide-heading"
        className="text-2xl font-bold text-gray-900"
      >
        Extract Audio from Video: formats, settings, and limitations
      </h2>

      <p className="mt-4 leading-7 text-gray-700">
        This tool creates an audio-only file from an available audio
        stream in a supported video. It removes the video portion from
        the output and converts the audio to your selected format.
        The source video must contain a usable audio stream.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Choosing an output format
          </h3>
          <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-gray-700">
            <li>
              <strong>MP3:</strong> A widely supported compressed audio
              format suitable for listening and sharing. MP3 encoding
              is lossy.
            </li>
            <li>
              <strong>WAV:</strong> The tool produces uncompressed PCM
              audio in a WAV container. Files are generally larger,
              and converting to WAV cannot restore quality already
              lost in the original recording.
            </li>
            <li>
              <strong>AAC:</strong> A compressed audio format useful
              when AAC playback is supported. The output uses the
              selected AAC format rather than preserving the video.
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Understanding audio quality settings
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            Low, Medium, and High represent encoding-quality
            selections, not guaranteed fixed bitrates. Their effect
            depends on the selected output codec. In particular,
            WAV output uses uncompressed PCM audio, so these choices
            should not be interpreted as WAV bitrate presets.
          </p>
          <p className="mt-3 leading-7 text-gray-700">
            Re-encoding cannot improve a noisy or low-quality
            recording beyond the information present in the source.
            Listen to the output before discarding the original video.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Example: save narration from a recorded lesson
        </h3>
        <p className="mt-3 leading-7 text-gray-700">
          If a recorded lesson contains spoken narration, upload the
          supported video file, select MP3 for convenient listening
          or WAV for uncompressed output, and start processing.
          Download the resulting audio file and check that the
          narration is complete. Visual slides and captions are not
          included in the audio-only output.
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Troubleshooting audio extraction
        </h3>
        <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-gray-700">
          <li>
            <strong>No sound in the result:</strong> Check whether the
            original video has an audible, usable audio stream.
            A silent video cannot supply missing speech or music.
          </li>
          <li>
            <strong>Conversion fails:</strong> Confirm that the file
            uses a supported video format and is not damaged.
            Some media streams may be incompatible with processing.
          </li>
          <li>
            <strong>Unexpected file size:</strong> WAV files can be
            much larger than compressed MP3 or AAC files. Output size
            also depends on the recording duration and audio content.
          </li>
          <li>
            <strong>Playback problems:</strong> Check whether your
            audio player supports the selected output format,
            especially AAC files.
          </li>
        </ul>
      </div>
    </section>
  );
}
