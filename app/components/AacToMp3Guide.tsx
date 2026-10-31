export function AacToMp3Guide() {
  return (
    <section
      className="mx-auto mt-12 max-w-6xl rounded-xl border border-gray-200 bg-white p-6 md:p-8"
      aria-labelledby="aac-to-mp3-guide-heading"
    >
      <h2
        id="aac-to-mp3-guide-heading"
        className="text-2xl font-bold text-gray-900"
      >
        Convert AAC to MP3: quality settings and audio compatibility
      </h2>

      <p className="mt-4 leading-7 text-gray-700">
        AAC and MP3 are widely used compressed audio formats.
        Converting AAC to MP3 can help when a player, editor,
        or upload service requires an MP3 file. This tool
        accepts one .aac audio file, converts it using FFmpeg,
        and provides an .mp3 file for download.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Supported input and output
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            Select a readable .aac file to produce an .mp3
            file. The audio must use a codec and file structure
            that FFmpeg can decode. Damaged or unsupported
            sources may fail. This converter does not restore
            audio details missing from the original recording.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Is AAC to MP3 lossless?
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            No. AAC and MP3 are both lossy compression formats.
            Converting between them requires re-encoding,
            which can introduce additional quality loss.
            Choosing High quality can reduce new encoding
            artifacts, but cannot recover previously lost
            audio information.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Understanding the MP3 quality settings
        </h3>
        <p className="mt-3 leading-7 text-gray-700">
          The quality selector controls FFmpeg MP3 encoding
          using the -q:a setting. Lower numeric values request
          higher quality. These are not fixed bitrates, and
          output size varies depending on the audio content.
        </p>
        <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-gray-700">
          <li>
            <strong>Low (9):</strong> Prioritizes smaller output
            and may introduce more audible compression artifacts.
          </li>
          <li>
            <strong>Medium (5):</strong> The default setting,
            balancing file size and encoding quality.
          </li>
          <li>
            <strong>High (2):</strong> Requests higher-quality
            MP3 encoding and may produce a larger file.
          </li>
        </ul>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          How to convert AAC audio to MP3
        </h3>
        <ol className="mt-4 list-decimal space-y-3 pl-6 leading-7 text-gray-700">
          <li>Upload one supported .aac audio file.</li>
          <li>
            Select Low, Medium, or High quality.
            Medium is selected by default.
          </li>
          <li>Start the AAC to MP3 conversion.</li>
          <li>
            Download the MP3 and listen to it to confirm
            that the sound meets your needs.
          </li>
        </ol>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          When is AAC to MP3 useful?
        </h3>
        <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-gray-700">
          <li>
            <strong>Older audio players:</strong> Create an MP3
            copy for software or hardware that requires MP3.
          </li>
          <li>
            <strong>Editing workflows:</strong> Prepare an MP3
            file for an application that does not accept AAC.
          </li>
          <li>
            <strong>File submissions:</strong> Convert audio
            when an upload form specifically requests MP3.
          </li>
        </ul>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Troubleshooting AAC to MP3 conversion
        </h3>
        <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-gray-700">
          <li>
            <strong>The file is larger than expected:</strong>
            Higher encoding quality can increase file size.
            No quality setting guarantees a specific bitrate.
          </li>
          <li>
            <strong>The audio sounds different:</strong>
            Lossy re-encoding can introduce audible changes.
            Keep the original AAC file as a backup.
          </li>
          <li>
            <strong>Conversion fails:</strong> Check whether
            the file is a valid, readable AAC recording.
            Corrupted data or processing limits may cause errors.
          </li>
          <li>
            <strong>The source is already low quality:</strong>
            Selecting High cannot restore missing frequencies
            or remove existing compression artifacts.
          </li>
        </ul>
      </div>
    </section>
  );
}
