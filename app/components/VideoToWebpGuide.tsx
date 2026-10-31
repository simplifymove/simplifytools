export function VideoToWebpGuide() {
  return (
    <section
      className="mx-auto mt-12 max-w-6xl rounded-xl border border-gray-200 bg-white p-6 md:p-8"
      aria-labelledby="video-to-webp-guide-heading"
    >
      <h2
        id="video-to-webp-guide-heading"
        className="text-2xl font-bold text-gray-900"
      >
        How to convert a video to animated WebP
      </h2>

      <p className="mt-4 leading-7 text-gray-700">
        Video to WebP converts a supported video into an animated
        WebP image. Unlike a single-frame WebP picture, animated
        WebP can display a sequence of frames to show movement.
        Upload a video, adjust the quality setting if needed,
        start the conversion, and download the resulting .webp
        file. Animated WebP does not preserve the video's audio.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Supported video formats
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            Upload an MP4, MOV, AVI, MKV, or WebM file. The tool
            accepts one video at a time and produces a .webp
            image file. The source must contain readable video
            frames. A supported extension alone does not
            guarantee conversion when the file is damaged or
            uses an unsupported codec.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Adjust WebP quality
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            The Quality control accepts values from 0 to 100,
            with 80 selected by default. Lower values generally
            create smaller files with more visible compression.
            Higher values can preserve additional picture detail
            but often increase the output size. The setting
            controls image encoding quality rather than the
            number of frames in the animation.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Understand animation and frame rate
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            Animated WebP stores a sequence of images rather
            than a conventional video stream with sound. The
            current tool does not provide separate controls for
            animation frame rate, output dimensions, or clip
            trimming. Longer videos and higher-resolution
            sources may produce larger WebP files and take
            longer to process.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Animated WebP versus GIF
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            Both formats can display silent animation, but WebP
            supports richer image encoding than GIF's limited
            color palette. Animated WebP can be more efficient
            for some content, although a smaller file is not
            guaranteed. GIF may be more suitable when a
            destination specifically requires a .gif file.
            Check which formats your website or application
            accepts before choosing an output.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          What affects the final WebP file size?
        </h3>
        <p className="mt-3 leading-7 text-gray-700">
          Duration, resolution, frame rate, motion, visual
          complexity, and the selected quality value all
          influence the result. A short, simple animation may
          be compact, while a long video with detailed movement
          can create a large animated image. Increasing quality
          can substantially increase storage requirements.
          Review the downloaded file before using it on a
          performance-sensitive web page.
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Practical uses for animated WebP
        </h3>
        <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-gray-700">
          <li>
            <strong>Website demonstrations:</strong> Show a
            short interaction or product feature as a silent
            animation on a compatible website.
          </li>
          <li>
            <strong>Visual tutorials:</strong> Turn a brief
            sequence of actions into an image-based example
            for documentation or help content.
          </li>
          <li>
            <strong>Product previews:</strong> Create moving
            previews where the destination supports animated
            WebP instead of conventional video.
          </li>
          <li>
            <strong>Comparing formats:</strong> Try WebP and
            GIF versions of the same short clip, then compare
            visual quality, file size, and compatibility.
          </li>
        </ul>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Troubleshooting Video to WebP
        </h3>
        <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-gray-700">
          <li>
            <strong>The file is too large:</strong> Try a
            lower quality value or use a shorter source clip.
            Long animations can contain many frames.
          </li>
          <li>
            <strong>The picture looks blurry:</strong> Increase
            the quality value and compare the result. Higher
            quality may also increase the file size.
          </li>
          <li>
            <strong>The animation appears static:</strong>
            Confirm that the source contains visible movement
            and that the viewer supports animated WebP.
          </li>
          <li>
            <strong>The WebP will not open:</strong> Some
            applications support still WebP images but not
            animated WebP. Try a compatible browser or viewer.
          </li>
          <li>
            <strong>Sound is missing:</strong> This is expected.
            Animated WebP is an image format and does not
            contain the source video's audio track.
          </li>
          <li>
            <strong>Conversion fails:</strong> Verify that the
            source video plays correctly. Corrupted files and
            unsupported video codecs may prevent processing.
          </li>
        </ul>
      </div>
    </section>
  );
}