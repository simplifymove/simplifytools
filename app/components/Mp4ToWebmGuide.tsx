export function Mp4ToWebmGuide() {
  return (
    <section
      className="mx-auto mt-12 max-w-6xl rounded-xl border border-gray-200 bg-white p-6 md:p-8"
      aria-labelledby="mp4-to-webm-guide-heading"
    >
      <h2
        id="mp4-to-webm-guide-heading"
        className="text-2xl font-bold text-gray-900"
      >
        How to convert MP4 to WebM
      </h2>

      <p className="mt-4 leading-7 text-gray-700">
        Use this converter to create a WebM video from an MP4 file.
        Upload your MP4, choose a quality level, start the conversion,
        and download the resulting .webm file. The conversion
        re-encodes video using VP9 and audio using Opus when an audio
        stream is available. It does not simply rename the file.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Supported input and output
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            This tool accepts an MP4 file and produces a WebM file.
            The source must contain a readable video stream.
            A .mp4 extension does not guarantee successful conversion
            if the media is damaged or uses an unsupported codec.
            The converter processes one uploaded file at a time.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Choose a quality level
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            Low prioritizes smaller video output with stronger
            compression. Medium balances picture quality and file
            size and is the default. High retains more visual detail
            but may create a larger file. Actual output size depends
            on the source video, motion, resolution, and audio.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Why use WebM?
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            WebM is a video container commonly used for web playback.
            VP9 video and Opus audio can be useful for supported
            browsers, web applications, and media workflows.
            Check the playback requirements of your target platform
            before replacing an existing MP4 file.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            MP4 versus WebM
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            MP4 and WebM are containers rather than single codecs.
            MP4 is widely supported across devices and editing
            software, while WebM is frequently used for browser
            delivery. Neither format is automatically smaller or
            better for every source. Conversion can also introduce
            some quality loss because the video is re-encoded.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Steps to convert your video
        </h3>
        <ol className="mt-4 list-decimal space-y-3 pl-6 leading-7 text-gray-700">
          <li>Select an MP4 file from your device.</li>
          <li>
            Choose Low, Medium, or High from the Quality Level menu.
            Medium is selected by default.
          </li>
          <li>Start the conversion and wait for processing to finish.</li>
          <li>Download the WebM file and test it in your intended player.</li>
        </ol>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Understanding conversion results
        </h3>
        <p className="mt-3 leading-7 text-gray-700">
          Lower quality settings generally reduce video bitrate and
          file size, but may introduce visible compression artifacts.
          Higher quality settings can preserve finer details, especially
          in scenes with movement or texture. The tool does not provide
          separate controls for output dimensions, frame rate, or audio
          bitrate. Large and long videos may take longer to process.
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          When should you keep MP4 instead?
        </h3>
        <p className="mt-3 leading-7 text-gray-700">
          Keep an MP4 version when your destination requires MP4,
          your editing application does not accept WebM, or you need
          broad compatibility with older devices. For a website,
          test WebM playback in the browsers you support and consider
          providing an MP4 alternative where appropriate.
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Troubleshooting MP4 to WebM
        </h3>
        <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-gray-700">
          <li>
            <strong>The output is larger than the MP4:</strong> Try
            Medium or Low quality. WebM does not guarantee a smaller
            file than every MP4 source.
          </li>
          <li>
            <strong>The picture looks blurry:</strong> Try High
            quality and compare the output with the original.
          </li>
          <li>
            <strong>Conversion takes too long:</strong> VP9 encoding
            can be computationally intensive, particularly for
            high-resolution or lengthy videos.
          </li>
          <li>
            <strong>The file will not play:</strong> Confirm that
            your browser or media player supports WebM with VP9
            video and Opus audio.
          </li>
          <li>
            <strong>Audio is missing:</strong> Check whether the
            source MP4 contains an audio stream. The converter
            cannot restore sound that is absent from the input.
          </li>
          <li>
            <strong>Conversion fails:</strong> Verify that the MP4
            plays correctly and is not corrupted. Unsupported
            codecs or incomplete uploads may prevent processing.
          </li>
        </ul>
      </div>
    </section>
  );
}
