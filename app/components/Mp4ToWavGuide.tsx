export function Mp4ToWavGuide() {
  return (
    <section
      className="mx-auto mt-12 max-w-6xl rounded-xl border border-gray-200 bg-white p-6 md:p-8"
      aria-labelledby="mp4-to-wav-guide-heading"
    >
      <h2
        id="mp4-to-wav-guide-heading"
        className="text-2xl font-bold text-gray-900"
      >
        MP4 to WAV: sample rates and audio quality explained
      </h2>

      <p className="mt-4 leading-7 text-gray-700">
        MP4 is a container that can hold video and audio streams.
        This converter takes an available audio stream from an MP4,
        removes the video, and creates a WAV audio file. The source
        must contain usable audio for the conversion to succeed.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Choosing a WAV sample rate
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            The sample rate determines how many audio samples are
            stored per second. This tool provides three outpu
            settings:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-gray-700">
            <li>
              <strong>16 kHz:</strong> A lower sample rate that may
              suit speech recordings where smaller output files
              are preferred.
            </li>
            <li>
              <strong>44.1 kHz:</strong> The default setting, commonly
              used for general audio playback and editing.
            </li>
            <li>
              <strong>48 kHz:</strong> Common in video and audio
              production workflows.
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            What WAV conversion changes
          </h3>
          <p className="mt-3 leading-7 text-gray-700">
            The converter produces WAV audio using uncompressed PCM
            encoding. WAV files can be much larger than compressed
            formats such as MP3 or AAC, particularly for longer
            recordings or higher sample rates.
          </p>
          <p className="mt-3 leading-7 text-gray-700">
            Uncompressed output does not mean that previously los
            audio detail is restored. If the MP4 contains compressed
            or distorted audio, converting it to WAV cannot recover
            the original recording quality. Selecting a higher
            sample rate also cannot create missing detail.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Example: prepare presentation audio for editing
        </h3>
        <p className="mt-3 leading-7 text-gray-700">
          Suppose you recorded a presentation as an MP4 and need
          its narration in an audio editor. Upload the MP4, selec
          44.1 kHz or the sample rate required by your editing
          project, start conversion, and download the WAV file.
          The resulting file contains audio only, not slides
          or video frames.
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900">
          Troubleshooting MP4 to WAV conversion
        </h3>
        <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-gray-700">
          <li>
            <strong>No audio is produced:</strong> Check that the
            original MP4 contains a playable audio stream. A
            video-only recording cannot provide WAV audio.
          </li>
          <li>
            <strong>The WAV file is large:</strong> Uncompressed PCM
            uses more storage than compressed audio. A lower
            sample rate may reduce size, but can also remove
            higher-frequency audio information.
          </li>
          <li>
            <strong>The sound is unclear:</strong> Existing noise,
            clipping, and compression artifacts remain in the
            converted recording.
          </li>
          <li>
            <strong>Conversion fails:</strong> The MP4 may be
            damaged, contain unsupported media characteristics,
            or exceed processing limits. Try another valid MP4.
          </li>
        </ul>
      </div>
    </section>
  );
}
