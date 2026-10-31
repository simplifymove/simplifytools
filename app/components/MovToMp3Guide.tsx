export function MovToMp3Guide() {
  return (
    <section
      aria-labelledby="mov-to-mp3-guide"
      className="max-w-6xl mx-auto mt-12 mb-12 rounded-xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm"
    >
      <h2
        id="mov-to-mp3-guide"
        className="text-2xl md:text-3xl font-bold text-gray-900 mb-4"
      >
        MOV to MP3: extract audio from QuickTime videos
      </h2>

      <p className="text-gray-700 leading-7 mb-6">
        MOV is a multimedia container commonly associated with QuickTime
        videos. A MOV file may contain video, audio, or both. This tool
        creates an MP3 audio file from an available audio stream in a
        supported MOV file. It does not convert the video pictures into
        sound, and a MOV file without usable audio cannot provide the
        intended MP3 recording.
      </p>

      <div className="space-y-7">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            How to convert a MOV file to MP3
          </h3>
          <ol className="list-decimal pl-6 space-y-2 text-gray-700 leading-7">
            <li>Select a MOV file containing the audio you want to keep.</li>
            <li>
              Choose Low, Medium, or High from the Audio Quality menu.
              Medium is the default selection.
            </li>
            <li>Start the conversion and wait for processing to finish.</li>
            <li>
              Open the resulting MP3 and listen to confirm that the
              expected audio is present.
            </li>
          </ol>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Understanding the MP3 quality options
          </h3>
          <p className="text-gray-700 leading-7 mb-3">
            The quality menu controls MP3 encoding rather than the
            resolution of the original MOV video. Low, Medium, and High
            correspond to variable-quality encoding settings, not
            guaranteed fixed bitrates. Actual file size and bitrate
            depend on the source audio.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 leading-7">
            <li>
              <strong>Low:</strong> prioritizes smaller audio files,
              potentially with more audible compression.
            </li>
            <li>
              <strong>Medium:</strong> balances file size and sound
              quality and is selected by default.
            </li>
            <li>
              <strong>High:</strong> uses a higher MP3 quality setting,
              which may produce a larger file.
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            What changes when you extract audio?
          </h3>
          <p className="text-gray-700 leading-7">
            The MP3 contains audio only, without the MOV video frames.
            MP3 encoding is lossy, so converting an existing compressed
            soundtrack can introduce additional quality loss. Choosing
            High cannot recover detail that is already missing from
            the original recording.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Example: save audio from a QuickTime recording
          </h3>
          <p className="text-gray-700 leading-7">
            Suppose you recorded a spoken presentation as a MOV file
            and want to listen without opening the video. Upload the
            MOV, choose an MP3 quality setting, and convert it. Check
            the resulting MP3 before deleting or archiving the original
            video, because the MP3 will not preserve its visuals.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Troubleshooting MOV to MP3 conversion
          </h3>
          <ul className="list-disc pl-6 space-y-3 text-gray-700 leading-7">
            <li>
              <strong>No sound in the output:</strong> Check whether
              the original MOV contains a usable audio stream.
              A silent or video-only recording cannot supply missing audio.
            </li>
            <li>
              <strong>File cannot be processed:</strong> MOV is a
              container format, and its internal codecs can vary.
              A damaged file or unsupported audio codec may prevent
              conversion. Try playing the original MOV first.
            </li>
            <li>
              <strong>Audio sounds worse than expected:</strong>
              Try the High setting, but remember that re-encoding
              cannot restore lost source quality.
            </li>
            <li>
              <strong>Output is larger than expected:</strong>
              Try Medium or Low and compare the result by listening.
              File size varies with the audio and selected setting.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}