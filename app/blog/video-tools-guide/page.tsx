import Link from 'next/link';
import { EditorialGuide } from '@/app/components/EditorialGuide';
import { blogGuides, guideMetadata } from '@/app/blog/guides';

const guide = blogGuides.find((item) => item.slug === 'video-tools-guide')!;

export const metadata = guideMetadata(guide.slug);

export default function VideoToolsGuide() {
  return (
    <EditorialGuide {...guide}>
      <p className="text-xl leading-9 text-gray-800">
        Video files can look simple from the outside: an MP4 on your phone, a
        clip from a camera, or a recording you want to share. Underneath, though,
        a video combines pictures, timing, compression and usually audio. That is
        why changing a video often involves more decisions than changing an
        image or document.
      </p>

      <p>
        You do not need to understand every technical detail before using a
        video tool. It helps, however, to know which part of the file is causing
        the problem.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Convert a video when compatibility is the problem
      </h2>

      <p>
        Conversion is useful when the application, website or device receiving
        your video expects a different format. The visible content may remain
        the same while the file is encoded into another container or codec.
      </p>

      <p>
        Before converting, check what the destination actually accepts. Changing
        a format simply because another extension is familiar can add an
        unnecessary processing step.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Compress when the file is too large to send or upload
      </h2>

      <p>
        A five-minute video can easily be much larger than a photograph or PDF.
        If upload limits or transfer time are the problem, compression is often
        more relevant than conversion.
      </p>

      <p>
        Video compression usually involves a tradeoff. Lower bitrates can reduce
        size, but pushing them too far may produce blockiness, smearing or a loss
        of fine detail, particularly in scenes with lots of movement.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Resolution is only one part of video quality
      </h2>

      <p>
        A 1080p video is not automatically better than every 720p video. Bitrate,
        codec efficiency and the quality of the original recording also matter.
        A heavily compressed high-resolution clip can look worse than a cleaner
        lower-resolution version.
      </p>

      <p>
        Reducing resolution can still be useful when the destination does not
        need the original dimensions. A small embedded website video, for
        example, may not benefit from carrying the same number of pixels as a
        large-screen master copy.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Trimming removes time; cropping removes part of the frame
      </h2>

      <p>
        These two operations are easy to confuse. Trimming shortens a video by
        removing time from the beginning, end or another section. Cropping keeps
        the duration but removes part of the visible picture.
      </p>

      <p>
        If your goal is simply to remove an unwanted intro or ending, trimming
        is the more direct operation.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Frame rate matters most when motion matters
      </h2>

      <p>
        Frame rate describes how many individual frames are shown each second.
        Higher frame rates can make motion look smoother, but they also increase
        the amount of visual information a file may need to store.
      </p>

      <p>
        Changing frame rate cannot recreate motion information that was never
        captured. Increasing a low-frame-rate source does not magically turn it
        into a genuinely high-frame-rate recording.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Audio contributes to the final file too
      </h2>

      <p>
        Video compression discussions often focus on the picture, but the audio
        track also has a codec and bitrate. For speech-heavy clips, sensible
        audio settings can reduce size without noticeably affecting the viewing
        experience.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Match the operation to the problem
      </h2>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-[680px] w-full border-collapse text-left text-sm">
          <thead className="bg-gray-100 text-gray-950">
            <tr>
              <th className="p-4">Problem</th>
              <th className="p-4">Operation to consider</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="p-4">The destination does not accept the format</td><td className="p-4">Convert</td></tr>
            <tr><td className="p-4">The file is too large</td><td className="p-4">Compress</td></tr>
            <tr><td className="p-4">The video contains extra time</td><td className="p-4">Trim</td></tr>
            <tr><td className="p-4">The visible frame includes unwanted areas</td><td className="p-4">Crop</td></tr>
            <tr><td className="p-4">The destination needs smaller dimensions</td><td className="p-4">Resize or reduce resolution</td></tr>
          </tbody>
        </table>
      </div>

      <aside className="rounded-xl border-l-4 border-orange-500 bg-orange-50 p-6">
        <h3 className="text-xl font-bold text-gray-950">
          Keep a good-quality source copy
        </h3>
        <p className="mt-2">
          Video is often compressed more than once as it moves between cameras,
          editors, messaging apps and social platforms. Keep the best available
          original so you do not have to build future versions from an already
          degraded copy.
        </p>
      </aside>

      <h2 className="text-3xl font-bold text-gray-950">
        Explore SimplifyConvert Video Tools
      </h2>

      <p>
        Once you know whether the issue is compatibility, file size, duration or
        another part of the video, browse{' '}
        <Link
          href="/all-tools/video-tools"
          className="font-semibold text-orange-700 underline underline-offset-4"
        >
          SimplifyConvert Video Tools
        </Link>{' '}
        and choose the operation that directly addresses it.
      </p>
    </EditorialGuide>
  );
}
