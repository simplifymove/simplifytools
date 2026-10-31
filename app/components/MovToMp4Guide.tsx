export function MovToMp4Guide() {
  return (
    <section
      className="mx-auto mt-12 max-w-6xl rounded-xl border border-gray-200 bg-white p-6 md:p-8"
      aria-labelledby="mov-to-mp4-guide-heading"
    >
      <h2
        id="mov-to-mp4-guide-heading"
        className="text-2xl font-bold text-gray-900"
      >
        How to convert MOV video to MP4
      </h2>

      <p className="mt-4 leading-7 text-gray-700">
        MOV is a video container commonly associated with QuickTime.
        Converting a MOV file to MP4 can make it easier to use in
        applications and workflows that accept MP4 uploads. Select a
        MOV file, choose a video quality setting, run the converter,
        and download the resulting MP4. Playback compatibility still
        depends on the receiving device or application.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Supported input and output
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            This converter accepts one .mov file and produces an .mp4
            file. The source must contain a readable video stream.
            A MOV extension does not guarantee that every internal
            codec is supported. Damaged or unusual source files may
            fail during conversion.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Choose Low, Medium, or High quality
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            Low uses stronger H.264 compression (CRF 28), Medium
            uses CRF 23, and High uses CRF 18. Medium is the default.
            Lower CRF values generally retain more visual detail,
            while higher values usually reduce file size. Actual
            results depend on the source video.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            What happens during conversion?
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            The converter uses FFmpeg to encode video with H.264
            and audio with AAC inside an MP4 container. This is
            re-encoding, not a simple file-extension rename or
            stream-copy operation. Processing can take longer for
            lengthy or high-resolution videos.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Understand quality and file size
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            High quality is useful when preserving detail matters,
            but the output may be larger. Low quality can be useful
            when a smaller file is more important. Conversion cannot
            recover details already missing from a compressed source,
            and an MP4 output is not guaranteed to be smaller than
            the original MOV file.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          When is MOV to MP4 useful?
        </h3>
        <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-gray-700">
          <li>
            <strong>Uploading video:</strong> Prepare a MOV recording
            for a service or application that accepts MP4 files.
          </li>
          <li>
            <strong>Sharing recordings:</strong> Create an MP4 copy
            for colleagues or recipients using different devices.
          </li>
          <li>
            <strong>Editing workflows:</strong> Produce an H.264/AAC
            MP4 for software that supports those codecs.
          </li>
        </ul>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Troubleshooting MOV to MP4
        </h3>
        <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-gray-700">
          <li>
            <strong>The conversion fails:</strong> Check whether
            the original MOV plays correctly. Corrupted files or
            unsupported source codecs can prevent conversion.
          </li>
          <li>
            <strong>The MP4 is too large:</strong> Try Low quality.
            File size also depends on duration, resolution, motion,
            and the source compression.
          </li>
          <li>
            <strong>The picture looks softer:</strong> Try High
            quality. Re-encoding is lossy and cannot restore
            information already lost in the source.
          </li>
          <li>
            <strong>The output will not play:</strong> Confirm that
            the target software supports MP4 with H.264 video and
            AAC audio. An MP4 extension alone does not guarantee
            compatibility with every player.
          </li>
          <li>
            <strong>Conversion takes time:</strong> Encoding work
            increases with video duration, resolution, and source
            complexity. Large files may take longer to process.
          </li>
        </ul>
      </div>
    </section>
  );
}
