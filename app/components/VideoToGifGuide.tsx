export function VideoToGifGuide() {
  return (
    <section
      className="mx-auto mt-12 max-w-6xl rounded-xl border border-gray-200 bg-white p-6 md:p-8"
      aria-labelledby="video-to-gif-guide-heading"
    >
      <h2
        id="video-to-gif-guide-heading"
        className="text-2xl font-bold text-gray-900"
      >
        How to convert a video into an animated GIF
      </h2>

      <p className="mt-4 leading-7 text-gray-700">
        Video to GIF turns a supported video into a looping-style animated
        image that can be shared where GIF files are supported. Upload one
        video, choose the frame rate and output width, run the conversion,
        and download the resulting GIF. GIF files do not include audio.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Supported video formats
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            Upload an MP4, MOV, AVI, MKV, or WebM file. The tool processes
            one file at a time and produces an animated GIF. The source
            must contain a readable video stream; damaged files or
            unsupported codecs may fail even when the extension is listed.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Choose the animation frame rate
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            Select 5, 10, 15, or 20 frames per second (fps). The default
            is 10 fps. A higher frame rate can make motion appear smoother
            but generally creates more frames and may increase file size.
            Lower frame rates can be useful for simple demonstrations.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Set the GIF width
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            The default width is 320 pixels, with an available range of
            100 to 1280 pixels. The tool scales the height to preserve
            the source aspect ratio. A narrower GIF often uses less
            storage, while a wider GIF can retain more visible detail.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Understand GIF quality and file size
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            Conversion uses FFmpeg palette generation to help represent
            the source colors in GIF format. GIF has a limited color
            palette compared with most videos, so gradients and fine
            detail may look different. Long clips, larger dimensions,
            and higher frame rates can produce large files.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Practical uses for animated GIFs
        </h3>
        <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-gray-700">
          <li>
            <strong>Product demonstrations:</strong> Show a short
            interface interaction or feature without requiring a video player.
          </li>
          <li>
            <strong>Instructions and tutorials:</strong> Illustrate a
            small sequence of actions in a help article or presentation.
          </li>
          <li>
            <strong>Visual reactions and previews:</strong> Turn a brief
            moment into an animated image for platforms that support GIFs.
          </li>
        </ul>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Troubleshooting Video to GIF
        </h3>
        <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-gray-700">
          <li>
            <strong>The GIF is too large:</strong> Try a smaller width
            or lower frame rate. A shorter source clip also reduces the
            number of frames that need to be stored.
          </li>
          <li>
            <strong>Motion looks choppy:</strong> Try 15 or 20 fps.
            Smoother animation may increase output size.
          </li>
          <li>
            <strong>Colors look different:</strong> GIF color limitations
            can affect gradients and detailed scenes. Consider keeping
            the original video when full-color fidelity matters.
          </li>
          <li>
            <strong>The conversion fails:</strong> Check that the source
            plays correctly and contains a supported video stream.
            Corrupted files and unusual codecs may not convert.
          </li>
          <li>
            <strong>Sound is missing:</strong> This is expected. Animated
            GIF files do not preserve the source video's audio track.
          </li>
        </ul>
      </div>
    </section>
  );
}
