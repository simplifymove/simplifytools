import { Metadata } from 'next';
import { getToolById } from '@/app/lib/video-tools';
import { getVideoFaqs, getVideoMetadataDescription } from '@/app/lib/video-content-guidance';
import { generateSoftwareApplicationSchema } from '@/app/lib/seo';
import { notFound } from 'next/navigation';

interface Params {
  slug: string;
}

// Tool-specific SEO metadata database
const toolSEODatabase: Record<string, {
  title: string;
  description: string;
  keywords: string[];
}> = {
  // MP4 Conversions
  'mp4-to-mp3': {
    title: 'Convert MP4 to MP3 Online - Free Video to Audio Converter',
    description: 'Convert MP4 video audio to MP3 with selectable bitrate options including 128, 192, and 320 kbps. Processing time depends on the source file and selected settings.',
    keywords: ['convert mp4 to mp3', 'mp4 to mp3 converter', 'extract audio from mp4', 'video to audio converter', 'free mp4 to mp3']
  },
  'mp4-to-wav': {
    title: 'Convert MP4 to WAV Online - Extract Audio as WAV Format',
    description: 'Extract audio from MP4 videos as WAV with available sample-rate options including 16 kHz, 44.1 kHz, and 48 kHz. Output characteristics depend on the source audio and selected settings.',
    keywords: ['mp4 to wav', 'extract audio to wav', 'wav converter', 'lossless audio extraction', 'video to audio']
  },
  'mp4-to-avi': {
    title: 'Convert MP4 to AVI Online - Free Video Format Converter',
    description: 'Convert MP4 videos to AVI format using the available quality settings. Processing time and output characteristics depend on the source video and selected options.',
    keywords: ['convert mp4 to avi', 'mp4 to avi converter', 'avi format converter', 'video format conversion']
  },
  'mp4-to-mov': {
    title: 'Convert MP4 to MOV Online - Free Video Converter for Mac',
    description: 'Convert MP4 videos to MOV (QuickTime) format with available quality options. Playback compatibility can depend on the codecs used by the generated file and the target software.',
    keywords: ['convert mp4 to mov', 'mp4 to mov converter', 'quicktime converter', 'mov format', 'mac video conversion']
  },
  'mp4-to-gif': {
    title: 'Convert MP4 to GIF Online - Create Animated GIFs from Videos',
    description: 'Convert an MP4 video to an animated GIF using the available frame-rate and dimension controls. File size and visual quality depend on the selected settings and source video.',
    keywords: ['mp4 to gif', 'video to gif converter', 'animated gif creator', 'mp4 to gif online', 'create gif from video']
  },
  'mp4-to-webm': {
    title: 'Convert MP4 to WebM Online - Free Web Video Format Converter',
    description: 'Convert MP4 videos to WebM format for supported web and media workflows. Resulting file size and quality depend on the source video and selected conversion settings.',
    keywords: ['convert mp4 to webm', 'mp4 to webm converter', 'webm video format', 'web video converter', 'html5 video']
  },
  'mp4-to-ogg': {
    title: 'Convert MP4 to OGG Online - Free Audio Format Converter',
    description: 'Convert audio from an MP4 file to OGG using the available quality options. Processing time and output characteristics depend on the source media and selected settings.',
    keywords: ['mp4 to ogg', 'convert mp4 to ogg', 'ogg audio converter', 'theora format', 'vorbis audio']
  },
  
  // MOV Conversions
  'mov-to-mp4': {
    title: 'Convert MOV to MP4 Online - Free QuickTime Video Converter',
    description: 'Convert MOV (QuickTime) videos to MP4 with available quality options. Playback compatibility depends on the codecs in the generated MP4 and the target device or software.',
    keywords: ['convert mov to mp4', 'mov to mp4 converter', 'quicktime to mp4', 'mov format converter', 'free mov converter']
  },
  'mov-to-mp3': {
    title: 'Convert MOV to MP3 - Extract Audio from QuickTime Videos',
    description: 'Extract audio from MOV (QuickTime) videos as MP3 using the available bitrate options. Processing time depends on the source file and selected settings.',
    keywords: ['convert mov to mp3', 'mov to mp3 converter', 'extract audio from mov', 'quicktime to mp3', 'audio extraction']
  },
  'mov-to-avi': {
    title: 'Convert MOV to AVI Online - Free Video Format Converter',
    description: 'Convert MOV videos to AVI format using the available quality settings. Compatibility depends on the codecs in the generated AVI and the target software.',
    keywords: ['convert mov to avi', 'mov to avi converter', 'quicktime to avi', 'video format conversion']
  },
  'mov-to-gif': {
    title: 'Convert MOV to GIF Online - Create Animated GIFs from Videos',
    description: 'Convert MOV videos to animated GIFs using configurable frame-rate and dimension settings. File size and visual quality vary with the source video and selected options.',
    keywords: ['mov to gif', 'convert mov to gif', 'video to gif converter', 'animated gif from mov']
  },
  
  // AVI Conversions
  'avi-to-mp4': {
    title: 'Convert AVI to MP4 Online - Free Video Format Converter',
    description: 'Convert AVI videos to MP4 using the available quality options. Playback compatibility depends on the generated codecs and the target device or software.',
    keywords: ['convert avi to mp4', 'avi to mp4 converter', 'avi format converter', 'video format conversion']
  },
  'avi-to-mp3': {
    title: 'Convert AVI to MP3 - Extract Audio from AVI Videos',
    description: 'Extract audio from AVI videos as MP3 using the available quality settings. Processing time and output characteristics depend on the source file and selected options.',
    keywords: ['avi to mp3', 'extract audio from avi', 'audio converter', 'avi audio extraction']
  },
  'avi-to-mov': {
    title: 'Convert AVI to MOV Online - Free Video Converter for Mac',
    description: 'Convert AVI videos to MOV (QuickTime) format with available quality options. Playback compatibility depends on the generated codecs and target software.',
    keywords: ['convert avi to mov', 'avi to mov converter', 'quicktime converter', 'mac video format']
  },
  'avi-to-mkv': {
    title: 'Convert AVI to MKV Online - Free Container Format Converter',
    description: 'Convert AVI videos to MKV format. The resulting quality, file size, and playback compatibility depend on the source media, conversion settings, and target software.',
    keywords: ['convert avi to mkv', 'avi to mkv converter', 'matroska format', 'video container']
  },
  'avi-to-gif': {
    title: 'Convert AVI to GIF Online - Create Animated GIFs from Videos',
    description: 'Convert AVI videos to animated GIFs using the available frame-rate and dimension controls. Resulting file size and visual quality depend on the selected settings.',
    keywords: ['avi to gif', 'convert avi to gif', 'video to gif', 'animated gif creator']
  },
  
  // MKV Conversions
  'mkv-to-mp4': {
    title: 'Convert MKV to MP4 Online - Free Video Format Converter',
    description: 'Convert MKV (Matroska) videos to MP4 format instantly. Free online converter for streaming compatibility. Multiple quality options.',
    keywords: ['convert mkv to mp4', 'mkv to mp4 converter', 'matroska to mp4', 'video format converter']
  },
  'mkv-to-mp3': {
    title: 'Convert MKV to MP3 - Extract Audio from Matroska Videos',
    description: 'Extract audio from MKV videos as MP3 instantly. Free online converter with quality options. No installation required.',
    keywords: ['mkv to mp3', 'extract audio from mkv', 'matroska audio extraction', 'audio converter']
  },
  'mkv-to-avi': {
    title: 'Convert MKV to AVI Online - Free Video Format Converter',
    description: 'Convert MKV videos to AVI format instantly. Free online tool for compatibility. Multiple quality settings available.',
    keywords: ['convert mkv to avi', 'mkv to avi converter', 'matroska to avi', 'video format conversion']
  },
  'mkv-to-mov': {
    title: 'Convert MKV to MOV Online - Free QuickTime Video Converter',
    description: 'Convert MKV (Matroska) videos to MOV format instantly. Free online converter for Mac compatibility.',
    keywords: ['convert mkv to mov', 'mkv to mov converter', 'matroska to quicktime', 'mac video format']
  },
  'mkv-to-gif': {
    title: 'Convert MKV to GIF Online - Create Animated GIFs from Videos',
    description: 'Convert MKV videos to animated GIF instantly. Free online converter with customizable settings.',
    keywords: ['mkv to gif', 'video to gif', 'animated gif creator', 'matroska to gif']
  },
  
  // WebM & OGG Conversions
  'webm-to-mp4': {
    title: 'Convert WebM to MP4 Online - Free Web Video Converter',
    description: 'Convert WebM videos to MP4 format instantly. Free online converter for universal compatibility. Multiple quality options.',
    keywords: ['convert webm to mp4', 'webm to mp4 converter', 'vp9 to h264', 'video format converter']
  },
  'webm-to-mp3': {
    title: 'Convert WebM to MP3 - Extract Audio from WebM Videos',
    description: 'Extract audio from WebM videos as MP3 instantly. Free online converter with quality settings.',
    keywords: ['webm to mp3', 'extract audio from webm', 'audio converter', 'vorbis to mp3']
  },
  'webm-to-mov': {
    title: 'Convert WebM to MOV Online - Free Video Converter for Mac',
    description: 'Convert WebM videos to MOV format instantly. Free online converter for Mac compatibility.',
    keywords: ['convert webm to mov', 'webm to mov converter', 'quicktime format', 'mac video']
  },
  'ogg-to-mp3': {
    title: 'Convert OGG to MP3 Online - Free Audio Format Converter',
    description: 'Convert OGG audio files to MP3 instantly. Free online converter with quality options. No installation needed.',
    keywords: ['convert ogg to mp3', 'ogg to mp3 converter', 'audio format conversion', 'vorbis to mp3']
  },
  'ogg-to-wav': {
    title: 'Convert OGG to WAV Online - Free Audio Converter',
    description: 'Convert OGG audio to WAV (lossless) format instantly. Free online converter for professional audio editing.',
    keywords: ['convert ogg to wav', 'ogg to wav converter', 'audio format conversion', 'lossless audio']
  },
  
  // AAC Conversions
  'aac-to-mp3': {
    title: 'Convert AAC to MP3 Online - Free Audio Format Converter',
    description: 'Convert AAC audio files to MP3 instantly. Free online converter with multiple bitrate options. No installation required.',
    keywords: ['convert aac to mp3', 'aac to mp3 converter', 'audio format conversion', 'aac converter']
  },
  'aac-to-wav': {
    title: 'Convert AAC to WAV Online - Free Lossless Audio Converter',
    description: 'Convert AAC audio to WAV (lossless) format instantly. Free online converter perfect for professional audio editing.',
    keywords: ['convert aac to wav', 'aac to wav converter', 'lossless audio', 'audio format conversion']
  },
  'aac-to-flac': {
    title: 'Convert AAC to FLAC Online - Free Lossless Audio Converter',
    description: 'Convert AAC audio to FLAC (lossless) format instantly. Free online converter ideal for music archival and editing.',
    keywords: ['convert aac to flac', 'aac to flac converter', 'lossless audio format', 'audio conversion']
  },
  'aac-to-mp4': {
    title: 'Convert AAC to MP4 Online - Audio Container Format Converter',
    description: 'Convert AAC audio to MP4 container format instantly. Free online converter for multimedia use.',
    keywords: ['convert aac to mp4', 'aac to mp4 converter', 'audio container', 'mp4 format']
  },
  'aac-to-m4r': {
    title: 'Convert AAC to M4R Online - iPhone Ringtone Creator',
    description: 'Convert AAC audio to M4R (iPhone ringtone) format instantly. Free online converter for custom iPhone ringtones.',
    keywords: ['convert aac to m4r', 'aac to m4r converter', 'iphone ringtone', 'm4r format']
  },
  
  // M4A Conversions
  'm4a-to-mp3': {
    title: 'Convert M4A to MP3 Online - Free Audio Format Converter',
    description: 'Convert M4A (MPEG-4 Audio) to MP3 instantly. Free online converter with quality options. Perfect for iTunes files.',
    keywords: ['convert m4a to mp3', 'm4a to mp3 converter', 'audio format conversion', 'itunes to mp3']
  },
  'm4a-to-wav': {
    title: 'Convert M4A to WAV Online - Free Audio Converter',
    description: 'Convert M4A audio to WAV (lossless) format instantly. Free online converter for audio editing and professional use.',
    keywords: ['convert m4a to wav', 'm4a to wav converter', 'lossless audio', 'audio format conversion']
  },
  'm4a-to-mp4': {
    title: 'Convert M4A to MP4 Online - Audio Container Converter',
    description: 'Convert M4A audio files to MP4 container format instantly. Free online converter for multimedia playback.',
    keywords: ['convert m4a to mp4', 'm4a to mp4 converter', 'audio container', 'mp4 format']
  },
  
  // GIF Conversions
  'gif-to-mov': {
    title: 'Convert GIF to MOV Online - Animated GIF to Video Converter',
    description: 'Convert animated GIF files to MOV (QuickTime) video format instantly. Free online converter for Mac compatibility.',
    keywords: ['convert gif to mov', 'gif to mov converter', 'animated gif to video', 'quicktime format']
  },
  'gif-to-webp': {
    title: 'Convert GIF to WebP Online - Free Modern Image Format Converter',
    description: 'Convert animated GIFs to WebP format instantly. Free online converter for smaller file sizes and better compression.',
    keywords: ['convert gif to webp', 'gif to webp converter', 'webp format', 'image compression']
  },
  
  // Editing Tools
  'trim-video': {
    title: 'Trim Video by Start and End Time | MP4 Output',
    description: 'Keep one continuous video interval using start and end times. Learn about expected duration, stream-copy keyframes, supported inputs, and MP4 output.',
    keywords: ['trim video', 'video trimmer', 'cut video', 'video editor', 'remove sections']
  },
  'resize-video': {
    title: 'Resize Video Dimensions with Optional Aspect Preservation',
    description: 'Fit a video inside requested dimensions or scale to an exact width and height, with guidance about aspect ratio, upscaling, bitrate, and MP4 output.',
    keywords: ['resize video', 'video resizer', 'change video dimensions', 'video dimension converter']
  },
  'mute-video': {
    title: 'Mute Video Online - Free Audio Removal Tool',
    description: 'Remove audio from videos instantly. Free online mute video tool. Perfect for creating silent clips.',
    keywords: ['mute video', 'remove audio from video', 'silent video creator', 'audio removal']
  },
  'extract-audio-from-video': {
    title: 'Extract Audio from Video - Free Audio Extraction Tool',
    description: 'Extract audio from videos as MP3 or WAV instantly. Free online tool with quality options. No software needed.',
    keywords: ['extract audio from video', 'audio extractor', 'video to audio', 'extract sound from video']
  },
  'video-to-gif': {
    title: 'Convert Video to GIF Online - Free Animated GIF Creator',
    description: 'Convert any video to animated GIF instantly. Free online tool perfect for social media. Customize frame rate and size.',
    keywords: ['video to gif', 'convert video to gif', 'gif converter', 'animated gif creator']
  },
  'compress-video': {
    title: 'Compress Video - Preset and CRF Quality Controls',
    description: 'Compress MP4, MOV, AVI, or MKV into H.264 MP4 using a speed/bitrate preset and CRF quality control. Final size varies by source and settings.',
    keywords: ['compress video', 'video compressor', 'reduce video size', 'video file size']
  },
  'compress-mov': {
    title: 'Compress MOV Online - Reduce MOV File Size',
    description: 'Compress MOV video files instantly. Free online tool with quality options. No software installation needed.',
    keywords: ['compress mov', 'mov compressor', 'reduce mov size', 'mov file compression']
  },
  'compress-avi': {
    title: 'Compress AVI Online - Reduce AVI File Size',
    description: 'Compress AVI video files instantly. Free online tool with multiple quality settings. Perfect for sharing.',
    keywords: ['compress avi', 'avi compressor', 'reduce avi size', 'avi file compression']
  },
  'compress-mkv': {
    title: 'Compress MKV Online - Reduce MKV File Size',
    description: 'Compress MKV video files instantly. Free online tool preserving quality. No installation required.',
    keywords: ['compress mkv', 'mkv compressor', 'reduce mkv size', 'mkv file compression']
  },
  'video-to-webp': {
    title: 'Convert Video to WebP Online - Animated WebP Creator',
    description: 'Convert videos to animated WebP format instantly. Free online converter for web optimization. Smaller file sizes.',
    keywords: ['video to webp', 'convert video to webp', 'webp format', 'web image optimization']
  },
  
  // Transcription & Text Tools
  'audio-to-text': {
    title: 'Convert Audio to Text Online - Free Speech-to-Text Tool',
    description: 'Transcribe audio files to text instantly. Free online speech-to-text converter with high accuracy.',
    keywords: ['audio to text', 'speech to text', 'transcribe audio', 'audio transcription', 'voice to text']
  },
  'video-to-text': {
    title: 'Convert Video to Text - Free Video Transcription Tool',
    description: 'Transcribe videos to text instantly. Free online tool extracting and converting video audio to text.',
    keywords: ['video to text', 'transcribe video', 'video transcription', 'extract text from video']
  },
  'youtube-to-text': {
    title: 'Convert YouTube to Text - Free Video Transcription',
    description: 'Download YouTube videos and transcribe to text instantly. Free online converter for video analysis.',
    keywords: ['youtube to text', 'transcribe youtube video', 'youtube transcription', 'youtube to transcript']
  },
  'youtube-transcript': {
    title: 'YouTube Transcript Generator - Free Video Subtitle Extractor',
    description: 'Get transcripts from YouTube videos instantly. Free online tool extracting captions and generating transcripts.',
    keywords: ['youtube transcript', 'extract youtube captions', 'youtube subtitles', 'video transcript']
  },
  'transcribe-podcast': {
    title: 'Transcribe Podcast Online - Free Podcast Transcription Tool',
    description: 'Transcribe podcast audio files to text instantly. Free online converter for podcast analysis and content creation.',
    keywords: ['transcribe podcast', 'podcast transcription', 'audio transcription', 'convert podcast to text']
  },
  
  // Download Tools
  'instagram-download': {
    title: 'Download Instagram Videos - Free Instagram Video Downloader',
    description: 'Download videos from Instagram instantly. Free online tool supporting stories, reels, and posts. No app needed.',
    keywords: ['instagram downloader', 'download instagram video', 'instagram video saver', 'instagram reels downloader']
  },
  'tiktok-video-download': {
    title: 'Download TikTok Videos - Free TikTok Video Downloader',
    description: 'Download TikTok videos instantly. Free online downloader without watermark. Works on all devices.',
    keywords: ['tiktok downloader', 'download tiktok video', 'tiktok video saver', 'remove tiktok watermark']
  },
  'twitter-download': {
    title: 'Download Twitter Videos - Free Twitter Video Downloader',
    description: 'Download videos from Twitter/X instantly. Free online tool supporting all video types. No installation required.',
    keywords: ['twitter downloader', 'download twitter video', 'x video downloader', 'twitter video saver']
  },
  'facebook-download': {
    title: 'Download Facebook Videos - Free Facebook Video Downloader',
    description: 'Download videos from Facebook instantly. Free online downloader for posts and live videos.',
    keywords: ['facebook downloader', 'download facebook video', 'facebook video saver', 'facebook live downloader']
  },
  
  // Summarization
  'summarize-podcast': {
    title: 'Summarize Podcast Online - Free Podcast Summary Generator',
    description: 'Summarize podcast episodes instantly. Free online tool transcribing and summarizing audio content.',
    keywords: ['podcast summarizer', 'summarize podcast', 'podcast summary generator', 'podcast notes']
  },
  
  // Subtitle
  'add-subtitles': {
    title: 'Add Subtitles to Video Online - Free Subtitle Adder',
    description: 'Add subtitle files to videos instantly. Free online tool supporting all formats. Perfect for video localization.',
    keywords: ['add subtitles', 'subtitle adder', 'add captions to video', 'subtitle embedding']
  },
  
  // AI Tools
  'text-to-video': {
    title: 'Text to Video Generator - Free AI Video Creator',
    description: 'Generate videos from text prompts using AI instantly. Free online tool creating cinematic videos from descriptions.',
    keywords: ['text to video', 'ai video generator', 'generate video', 'video maker', 'ai video creation']
  }
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolById(slug);

  if (!tool) {
    return {
      title: 'Tool Not Found - SimplifyConvert',
      robots: { index: false },
    };
  }

  const baseUrl = 'https://simplifyconvert.com';
  const canonicalUrl = `${baseUrl}/all-tools/video/${slug}`;
  
  // Get tool-specific SEO or use defaults
  const configuredSeoData = toolSEODatabase[slug] || {
    title: `${tool.title} - Free Online Video Tool | SimplifyConvert`,
    description: tool.description.length > 160 ? tool.description.substring(0, 157) + '...' : tool.description,
    keywords: [tool.title, 'video tool', 'free converter']
  };
  const seoData = {
    ...configuredSeoData,
    description: getVideoMetadataDescription(tool),
  };

  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: canonicalUrl,
      siteName: 'SimplifyConvert',
      title: seoData.title,
      description: seoData.description,
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: tool.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoData.title,
      description: seoData.description,
      images: [`${baseUrl}/og-image.jpg`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      }
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function VideoSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const tool = getToolById(slug);
  if (!tool) {
    notFound();
  }
  const baseUrl = 'https://simplifyconvert.com';
  const canonicalUrl = `${baseUrl}/all-tools/video/${slug}`;
  const softwareSchema = tool
    ? generateSoftwareApplicationSchema({
        name: tool.title,
        description: tool.description,
        url: canonicalUrl,
        applicationCategory: 'MultimediaApplication',
      })
    : null;
  const faqItems = getVideoFaqs(tool);

  return (
    <>
      {children}
      {softwareSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
      )}
      {/* Schema Markup - FAQ Page */}
      {!['compress-video', 'trim-video', 'resize-video'].includes(slug) && <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqItems.map((faq) => ({
              '@type': 'Question',
              name: faq.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.a,
              },
            }))
          })
        }}
      />}
      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://simplifyconvert.com'
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'All Tools',
                item: 'https://simplifyconvert.com/all-tools'
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: 'Video Tools',
                item: 'https://simplifyconvert.com/all-tools/video-tools'
              },
              {
                '@type': 'ListItem',
                position: 4,
                name: tool?.title || 'Video Tool',
                item: canonicalUrl
              }
            ]
          })
        }}
      />
    </>
  );
}
