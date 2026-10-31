export function CompressMovGuide() {
  return (
    <section
      className="mx-auto mt-12 max-w-6xl rounded-xl border border-gray-200 bg-white p-6 md:p-8"
      aria-labelledby="compress-mov-guide-heading"
    >
      <h2
        id="compress-mov-guide-heading"
        className="text-2xl font-bold text-gray-900"
      >
        How to compress a MOV video online
      </h2>

      <p className="mt-4 leading-7 text-gray-700">
        MOV is a video container commonly used for recordings and
        editing workflows. This tool accepts a .mov file, re-encodes
        its video and audio, and produces another .mov file. Upload
        your video, select Low, Medium, or High compression, start
        processing, and download the result. Compression can make
        a file easier to store or share, but the amount saved depends
        on the original recording.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Supported input and output
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            The tool accepts one .mov file and returns a .mov file.
            It encodes video using H.264 and audio using AAC. The
            original file must contain streams that FFmpeg can read.
            Damaged files or unsupported source codecs may prevent
            processing. The output remains a MOV container rather
            than being converted to MP4.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Choose a compression level
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            Low uses CRF 28 with a superfast encoding preset and a
            1200 kbps video bitrate limit. Medium, the default,
            uses CRF 32, a medium preset, and an 800 kbps limit.
            High uses CRF 40, a slow preset, and a 500 kbps limit.
            These settings control compression strength and
            encoding behavior, not an exact output size.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Understand the quality trade-off
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            Stronger compression generally reduces video detail.
            Low is a useful starting point when clarity matters.
            Medium balances file size and picture quality. High
            prioritizes a smaller file and may introduce visible
            softness, blockiness, or lost detail, especially in
            recordings containing text or fast movement.
            Compare the downloaded result with your source before
            deleting or replacing the original.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Why file size varies
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            Duration, resolution, motion, source bitrate, and the
            codecs already used in the original MOV all influence
            the result. A short or efficiently compressed video
            may remain the same size or become slightly larger
            after re-encoding. This tool does not guarantee a
            particular percentage reduction or maximum file size.
            Audio is re-encoded as AAC at 96 kbps.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          When is MOV compression useful?
        </h3>
        <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-gray-700">
          <li>
            <strong>Sharing recordings:</strong> Reduce the size
            of a MOV clip before sending it to colleagues or clients.
          </li>
          <li>
            <strong>Saving storage:</strong> Create a smaller copy
            of a recording when maximum visual detail is not needed.
          </li>
          <li>
            <strong>Preparing uploads:</strong> Try a compressed
            version when a service has a file-size restriction.
            Check the actual output size before uploading.
          </li>
          <li>
            <strong>Review copies:</strong> Produce a lighter copy
            for feedback while keeping the original high-quality
            recording for editing or archiving.
          </li>
        </ul>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Troubleshooting MOV compression
        </h3>
        <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-gray-700">
          <li>
            <strong>The file is not much smaller:</strong> The
            source may already be compressed efficiently. Longer
            or higher-bitrate recordings often provide more room
            for reduction, but results vary.
          </li>
          <li>
            <strong>The picture looks blurry:</strong> Try Low
            instead of Medium or High. Strong compression can
            remove fine details and cannot restore them later.
          </li>
          <li>
            <strong>Processing takes too long:</strong> High
            compression uses a slower encoding preset. Large,
            lengthy, or high-resolution videos can require
            additional processing time.
          </li>
          <li>
            <strong>The MOV will not open:</strong> Confirm that
            the receiving player supports MOV files containing
            H.264 video and AAC audio. The MOV extension alone
            does not guarantee compatibility.
          </li>
          <li>
            <strong>Compression fails:</strong> Check that the
            original file plays correctly. Corrupted files and
            unusual source codecs may not be readable.
          </li>
        </ul>
      </div>
    </section>
  );
}