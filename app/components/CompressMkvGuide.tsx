export function CompressMkvGuide() {
  return (
    <section
      className="mx-auto mt-12 max-w-6xl rounded-xl border border-gray-200 bg-white p-6 md:p-8"
      aria-labelledby="compress-mkv-guide-heading"
    >
      <h2
        id="compress-mkv-guide-heading"
        className="text-2xl font-bold text-gray-900"
      >
        How to compress an MKV video online
      </h2>

      <p className="mt-4 leading-7 text-gray-700">
        MKV, also called Matroska Video, is a flexible container
        used for recordings, downloaded videos, and media
        collections. This tool accepts one .mkv file, compresses
        its video, re-encodes its audio, and produces another
        .mkv file. Upload your video, choose Low, Medium, or
        High compression, start processing, and download the
        result. The original file remains useful if you later
        need its original quality or streams.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Supported input and output
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            The compressor accepts an .mkv file and returns
            another .mkv file. It encodes the video using H.264
            and the audio using AAC at 96 kbps. The source must
            contain media streams that the processing engine
            can read. The MKV container is retained, but the
            video and audio codecs may change from those in
            your original recording.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Choose a compression level
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            Low uses CRF 28, a superfast encoding preset, and
            a 1200 kbps video bitrate limit. Medium, the default,
            uses CRF 32, a medium preset, and an 800 kbps limit.
            High uses CRF 40, a slow preset, and a 500 kbps limit.
            These settings influence compression strength,
            encoding speed, and visual quality. They do not
            guarantee an exact output size or bitrate.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Understand the quality trade-off
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            Low is a useful starting point when picture detail
            matters. Medium aims for a smaller file while
            sacrificing more detail. High prioritizes strong
            compression and may introduce visible blur,
            blockiness, or loss of fine texture. Recordings
            containing small text, complex motion, or detailed
            backgrounds can make these changes easier to see.
            Preview the result before replacing your original.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            MKV compatibility and stream changes
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            MKV can contain many different video and audio
            codecs. This tool produces H.264 video with AAC
            audio rather than preserving every original codec.
            Check whether the intended player, device, or
            editing application supports those codecs in an
            MKV container. The current compression operation
            does not offer controls to preserve subtitles,
            multiple audio tracks, or attachments, so do not
            rely on it to retain those extra streams.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Why file size can vary
        </h3>
        <p className="mt-3 leading-7 text-gray-700">
          Compression results depend on the original video
          bitrate, duration, resolution, movement, and codecs.
          A large, high-bitrate MKV may become substantially
          smaller, while a very short or already efficiently
          compressed MKV can become slightly larger. Audio is
          encoded as AAC at 96 kbps, which also contributes
          to the final size. No particular percentage reduction
          is guaranteed for every uploaded video.
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          When is MKV compression useful?
        </h3>
        <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-gray-700">
          <li>
            <strong>Sharing recordings:</strong> Create a
            smaller MKV copy for colleagues or clients when
            the receiving software supports the output codecs.
          </li>
          <li>
            <strong>Reducing storage use:</strong> Compress
            large, high-bitrate videos when a reduction in
            picture quality is acceptable.
          </li>
          <li>
            <strong>Preparing uploads:</strong> Try a smaller
            MKV for a service that accepts the format. Verify
            its actual size before uploading.
          </li>
          <li>
            <strong>Making review copies:</strong> Keep an
            original recording for editing or archiving and
            use a compressed version for everyday viewing.
          </li>
        </ul>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Troubleshooting MKV compression
        </h3>
        <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-gray-700">
          <li>
            <strong>The compressed file is larger:</strong>
            Short videos or already compressed sources may
            offer little opportunity for further reduction.
          </li>
          <li>
            <strong>The picture looks blurry:</strong> Try
            Low compression instead of Medium or High.
            Stronger compression discards more visual detail.
          </li>
          <li>
            <strong>Playback does not work:</strong> Check
            support for H.264 video and AAC audio in MKV.
            The file extension alone does not ensure playback.
          </li>
          <li>
            <strong>Extra streams are missing:</strong>
            Retain the original MKV if subtitles, alternate
            audio tracks, or attachments are important.
          </li>
          <li>
            <strong>Processing is slow:</strong> High
            compression uses a slower encoding preset.
            Longer or higher-resolution videos take more time.
          </li>
          <li>
            <strong>Compression fails:</strong> Check whether
            the source plays correctly. Damaged files or
            unsupported source codecs can prevent processing.
          </li>
        </ul>
      </div>
    </section>
  );
}