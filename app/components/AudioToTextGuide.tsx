export function AudioToTextGuide() {
  return (
    <section
      className="mx-auto mt-12 max-w-6xl rounded-xl border border-gray-200 bg-white p-6 md:p-8"
      aria-labelledby="audio-to-text-guide-heading"
    >
      <h2
        id="audio-to-text-guide-heading"
        className="text-2xl font-bold text-gray-900"
      >
        How to convert audio to text
      </h2>

      <p className="mt-4 leading-7 text-gray-700">
        Convert spoken words in an audio recording into a written
        transcript. Upload a supported file, select the spoken language,
        choose an output format, and start transcription. Speech
        recognition produces machine-generated text, so compare
        important passages with the original recording before
        publishing or sharing the result.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Supported audio formats
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            Upload an MP3, WAV, M4A, AAC, OGG, or FLAC file.
            The recording must contain readable audio. A supported
            extension does not guarantee that damaged files or unusual
            encodings can be decoded. This tool processes one audio
            recording at a time.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Select the spoken language
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            Choose English, Spanish, French, German, or Auto-detect.
            English is the default. Selecting the known spoken language
            can help the recognition model interpret the recording.
            Auto-detect estimates the language but can make mistakes,
            especially with short or mixed-language recordings.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Plain Text and JSON output
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            Plain Text displays recognized speech on the results page
            and provides a TXT download. JSON contains transcript
            segments with recognized words and their start and end
            times. JSON can be useful for scripts and applications
            that need structured transcription data.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            SRT and VTT subtitles
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            SRT and VTT provide timestamped text segments for caption
            workflows. SRT is commonly used by video editors and
            subtitle software. WebVTT can be used by compatible web
            video players. Both formats need review for incorrect
            words, timing, and sentence boundaries.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Steps to transcribe audio
        </h3>
        <ol className="mt-4 list-decimal space-y-3 pl-6 leading-7 text-gray-700">
          <li>Choose a supported audio file from your device.</li>
          <li>
            Select the spoken language, or choose Auto-detect if you
            are unsure.
          </li>
          <li>
            Choose Plain Text, SRT, VTT, or JSON from Output Format.
            Plain Text is selected by default.
          </li>
          <li>
            Click Transcribe Audio and wait for server-side processing
            to finish.
          </li>
          <li>
            Review the transcript or download the output file.
            Correct important words and timestamps as needed.
          </li>
        </ol>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Understanding transcription accuracy
        </h3>
        <p className="mt-3 leading-7 text-gray-700">
          Recognition accuracy depends on the recording. Clear speech,
          limited background noise, and a correctly selected language
          generally make the transcript easier to review. Overlapping
          speakers, music, unfamiliar names, technical vocabulary,
          strong accents, and clipped audio can introduce mistakes.
          Punctuation and sentence boundaries are estimated rather
          than verified. The tool does not guarantee a verbatim
          transcript or identify speakers reliably.
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Choosing the right transcript format
        </h3>
        <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-gray-700">
          <li>
            <strong>Plain Text:</strong> Draft notes, interviews, or
            written content that you intend to edit.
          </li>
          <li>
            <strong>SRT:</strong> Prepare subtitle files for compatible
            editing and captioning applications.
          </li>
          <li>
            <strong>VTT:</strong> Prepare timed captions for compatible
            HTML5 video players and web applications.
          </li>
          <li>
            <strong>JSON:</strong> Use text segments and timestamps in
            another program or data-processing workflow.
          </li>
        </ul>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Troubleshooting audio to text
        </h3>
        <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-gray-700">
          <li>
            <strong>Incorrect words:</strong> Check the selected
            language and listen to the source. Manually correct
            unfamiliar names and important terms.
          </li>
          <li>
            <strong>Missing speech:</strong> Check for silence,
            background noise, interruptions, or unclear sections
            in the original recording.
          </li>
          <li>
            <strong>Subtitle timing is inaccurate:</strong> Open the
            SRT or VTT file in a subtitle editor and compare the
            timestamps with playback.
          </li>
          <li>
            <strong>Processing is slow:</strong> Longer recordings
            require more recognition work, and server availability
            can affect completion time.
          </li>
          <li>
            <strong>Audio cannot be processed:</strong> Confirm the
            file plays correctly. Damaged audio or unsupported
            encoding may require re-exporting the recording.
          </li>
          <li>
            <strong>Wrong detected language:</strong> Select a
            specific available language instead of Auto-detect
            when the spoken language is known.
          </li>
        </ul>
      </div>
    </section>
  );
}
