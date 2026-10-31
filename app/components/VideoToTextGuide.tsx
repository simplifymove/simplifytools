export function VideoToTextGuide() {
  return (
    <section
      className="mx-auto mt-12 max-w-6xl rounded-xl border border-gray-200 bg-white p-6 md:p-8"
      aria-labelledby="video-to-text-guide-heading"
    >
      <h2
        id="video-to-text-guide-heading"
        className="text-2xl font-bold text-gray-900"
      >
        How to convert video to text
      </h2>

      <p className="mt-4 leading-7 text-gray-700">
        Video to Text converts spoken dialogue in a video into a written
        transcript. Upload a supported video, choose the spoken language,
        and select whether you need readable text, subtitles, or structured
        transcription data. The tool extracts the audio track and uses
        speech recognition to identify words. Results are machine-generated,
        so review important names, numbers, and quotations against the video.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Supported video formats
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            Upload MP4, MOV, AVI, MKV, or WebM video files. The video must
            contain a usable audio track with spoken content. A silent
            video, damaged file, or unsupported internal audio codec may
            produce no transcript or cause processing to fail. The tool
            handles one uploaded video at a time.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Select the spoken language
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            Choose English, Spanish, French, German, or Auto-detect.
            English is selected by default. Use a specific language
            when you know what is spoken in the recording. Auto-detect
            estimates the language and may be less reliable for short
            clips, overlapping speakers, or mixed-language dialogue.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Plain Text and JSON transcripts
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            Plain Text shows recognized speech on the results page and
            provides a TXT download. Choose this for meeting notes,
            interviews, research, or drafting written summaries.
            JSON provides transcript segments with start and end times,
            making it useful when an application needs structured
            speech-recognition output.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            SRT and VTT subtitle files
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            Choose SRT for a numbered list of subtitle cues with timestamps,
            or VTT for WebVTT subtitle cues. These formats can help you
            prepare captions for compatible video players and editors.
            Timing and sentence boundaries are estimated automatically.
            Review the generated captions before publishing them.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Steps to transcribe a video
        </h3>
        <ol className="mt-3 list-decimal space-y-3 pl-6 leading-7 text-gray-700">
          <li>
            Select a supported video file containing audible speech.
          </li>
          <li>
            Choose the language spoken in the video, or select
            Auto-detect if you are unsure.
          </li>
          <li>
            Select Plain Text, SRT, VTT, or JSON according to how you
            intend to use the transcript.
          </li>
          <li>
            Click Transcribe Video and allow the audio extraction and
            speech-recognition process to finish.
          </li>
          <li>
            Read the displayed text or download the generated output,
            then compare it with the original video for accuracy.
          </li>
        </ol>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          How video transcription works
        </h3>
        <p className="mt-3 leading-7 text-gray-700">
          The tool reads the video&apos;s audio track and converts it
          into a mono audio signal suitable for speech recognition.
          The transcription model then analyzes that audio and produces
          text segments. It does not read words printed on screen,
          recognize slides, or extract text from individual video frames.
          For example, a title card without narration will not become
          part of the transcript simply because its words are visible.
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Choosing between a transcript and subtitles
        </h3>
        <p className="mt-3 leading-7 text-gray-700">
          Use Plain Text when you primarily need the spoken content for
          reading, searching, editing, or taking notes. Choose SRT or
          VTT when you need timestamped caption cues to import into
          compatible software. Choose JSON when you need segment
          information for further processing. Subtitle files contain
          estimated timing, not a manually verified caption track.
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Understanding transcription accuracy
        </h3>
        <p className="mt-3 leading-7 text-gray-700">
          Clear speech with limited background noise generally gives
          recognition a better starting point. Music, accents, technical
          terminology, multiple speakers, clipped audio, and low volume
          can affect the result. The transcript may omit words or insert
          incorrect ones. This tool does not guarantee verbatim
          transcription, speaker identification, or publication-ready
          subtitles. Check sensitive or consequential information
          against the original recording.
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Troubleshooting video to text
        </h3>
        <div className="mt-3 space-y-4 leading-7 text-gray-700">
          <p>
            <strong className="text-gray-900">
              No speech appears in the transcript:
            </strong>{' '}
            Confirm that the uploaded video contains an audible
            spoken audio track rather than only music, silence,
            or text displayed on screen.
          </p>
          <p>
            <strong className="text-gray-900">
              The transcript contains incorrect words:
            </strong>{' '}
            Try the correct language setting and use a recording
            with clearer speech when possible. Review unfamiliar
            names, numbers, and specialized vocabulary manually.
          </p>
          <p>
            <strong className="text-gray-900">
              The video cannot be processed:
            </strong>{' '}
            Check that the file is not corrupted and that its audio
            stream can be decoded. A supported file extension alone
            does not guarantee compatibility with every codec.
          </p>
          <p>
            <strong className="text-gray-900">
              Subtitles do not align perfectly:
            </strong>{' '}
            Automatically estimated cue timings may require
            adjustment in a subtitle editor before publishing.
          </p>
        </div>
      </div>
    </section>
  );
}
