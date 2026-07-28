import { Metadata } from 'next';
import { getToolById } from '@/app/lib/video-tools';
import { generateSoftwareApplicationSchema } from '@/app/lib/seo';

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
    description: 'Convert MP4 videos to MP3 audio instantly. Free online tool with multiple quality options (128, 192, 320 kbps). No installation, no signup required.',
    keywords: ['convert mp4 to mp3', 'mp4 to mp3 converter', 'extract audio from mp4', 'video to audio converter', 'free mp4 to mp3']
  },
  'mp4-to-wav': {
    title: 'Convert MP4 to WAV Online - Extract Audio as WAV Format',
    description: 'Extract audio from MP4 videos as WAV format. Free online converter with sample rate options (16kHz, 44.1kHz, 48kHz). Perfect for professional audio editing.',
    keywords: ['mp4 to wav', 'extract audio to wav', 'wav converter', 'lossless audio extraction', 'video to audio']
  },
  'mp4-to-avi': {
    title: 'Convert MP4 to AVI Online - Free Video Format Converter',
    description: 'Convert MP4 videos to AVI format instantly. Free online tool supporting multiple quality settings. No software installation needed.',
    keywords: ['convert mp4 to avi', 'mp4 to avi converter', 'avi format converter', 'video format conversion']
  },
  'mp4-to-mov': {
    title: 'Convert MP4 to MOV Online - Free Video Converter for Mac',
    description: 'Convert MP4 videos to MOV (QuickTime) format instantly. Free online converter optimized for Mac compatibility. Multiple quality options available.',
    keywords: ['convert mp4 to mov', 'mp4 to mov converter', 'quicktime converter', 'mov format', 'mac video conversion']
  },
  'mp4-to-gif': {
    title: 'Convert MP4 to GIF Online - Create Animated GIFs from Videos',
    description: 'Convert MP4 videos to animated GIF instantly. Free online tool with frame rate and dimension controls. Perfect for social media sharing.',
    keywords: ['mp4 to gif', 'video to gif converter', 'animated gif creator', 'mp4 to gif online', 'create gif from video']
  },
  'mp4-to-webm': {
    title: 'Convert MP4 to WebM Online - Free Web Video Format Converter',
    description: 'Convert MP4 videos to WebM format for web delivery. Free online converter optimized for smaller file sizes. Perfect for web developers.',
    keywords: ['convert mp4 to webm', 'mp4 to webm converter', 'webm video format', 'web video converter', 'html5 video']
  },
  'mp4-to-ogg': {
    title: 'Convert MP4 to OGG Online - Free Audio Format Converter',
    description: 'Convert MP4 audio to OGG format instantly. Free online converter with quality options. Open-source format ideal for web platforms.',
    keywords: ['mp4 to ogg', 'convert mp4 to ogg', 'ogg audio converter', 'theora format', 'vorbis audio']
  },
  
  // MOV Conversions
  'mov-to-mp4': {
    title: 'Convert MOV to MP4 Online - Free QuickTime Video Converter',
    description: 'Convert MOV (QuickTime) videos to MP4 format instantly. Free online converter with quality options. Compatible with all devices and platforms.',
    keywords: ['convert mov to mp4', 'mov to mp4 converter', 'quicktime to mp4', 'mov format converter', 'free mov converter']
  },
  'mov-to-mp3': {
    title: 'Convert MOV to MP3 - Extract Audio from QuickTime Videos',
    description: 'Extract audio from MOV (QuickTime) videos as MP3 instantly. Free online converter with multiple bitrate options. No installation required.',
    keywords: ['convert mov to mp3', 'mov to mp3 converter', 'extract audio from mov', 'quicktime to mp3', 'audio extraction']
  },
  'mov-to-avi': {
    title: 'Convert MOV to AVI Online - Free Video Format Converter',
    description: 'Convert MOV videos to AVI format instantly. Free online tool for windows compatibility. Multiple quality settings available.',
    keywords: ['convert mov to avi', 'mov to avi converter', 'quicktime to avi', 'video format conversion']
  },
  'mov-to-gif': {
    title: 'Convert MOV to GIF Online - Create Animated GIFs from Videos',
    description: 'Convert MOV videos to animated GIF instantly. Free online converter with customizable frame rates and dimensions. Perfect for web sharing.',
    keywords: ['mov to gif', 'convert mov to gif', 'video to gif converter', 'animated gif from mov']
  },
  
  // AVI Conversions
  'avi-to-mp4': {
    title: 'Convert AVI to MP4 Online - Free Video Format Converter',
    description: 'Convert AVI videos to MP4 format instantly. Free online converter with quality options. Compatible with all modern devices.',
    keywords: ['convert avi to mp4', 'avi to mp4 converter', 'avi format converter', 'video format conversion']
  },
  'avi-to-mp3': {
    title: 'Convert AVI to MP3 - Extract Audio from AVI Videos',
    description: 'Extract audio from AVI videos as MP3 instantly. Free online converter with quality settings. No installation needed.',
    keywords: ['avi to mp3', 'extract audio from avi', 'audio converter', 'avi audio extraction']
  },
  'avi-to-mov': {
    title: 'Convert AVI to MOV Online - Free Video Converter for Mac',
    description: 'Convert AVI videos to MOV (QuickTime) format instantly. Free online converter for Mac compatibility. Multiple quality options.',
    keywords: ['convert avi to mov', 'avi to mov converter', 'quicktime converter', 'mac video format']
  },
  'avi-to-mkv': {
    title: 'Convert AVI to MKV Online - Free Container Format Converter',
    description: 'Convert AVI videos to MKV container format instantly. Free online tool preserving high quality. Perfect for archival storage.',
    keywords: ['convert avi to mkv', 'avi to mkv converter', 'matroska format', 'video container']
  },
  'avi-to-gif': {
    title: 'Convert AVI to GIF Online - Create Animated GIFs from Videos',
    description: 'Convert AVI videos to animated GIF instantly. Free online converter with frame rate and dimension controls.',
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
    title: 'Trim Video Online - Free Video Trimming Tool',
    description: 'Trim unwanted sections from videos instantly. Free online tool with frame-accurate cutting. Supports all major formats.',
    keywords: ['trim video', 'video trimmer', 'cut video', 'video editor', 'remove sections']
  },
  'resize-video': {
    title: 'Resize Video Online - Free Video Dimension Changer',
    description: 'Change video dimensions instantly. Free online tool to resize videos for social media and streaming. No installation required.',
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
    title: 'Compress Video Online - Free Video File Size Reducer',
    description: 'Reduce video file size instantly. Free online compression tool with quality options. Perfect for sharing and storage.',
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
  const seoData = toolSEODatabase[slug] || {
    title: `${tool.title} - Free Online Video Tool | SimplifyConvert`,
    description: tool.description.length > 160 ? tool.description.substring(0, 157) + '...' : tool.description,
    keywords: [tool.title, 'video tool', 'free converter']
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'Is this tool really free?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'This tool can be used without a subscription or credit card. Processing limits can vary by tool, file type, and file size.'
                }
              },
              {
                '@type': 'Question',
                name: 'Do you store my files?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Files are uploaded to our server when processing is required and may remain temporarily while the request and download are handled. Avoid uploading sensitive or confidential content.'
                }
              },
              {
                '@type': 'Question',
                name: 'Which formats are supported?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'This tool supports multiple video and audio formats for maximum compatibility.'
                }
              },
              {
                '@type': 'Question',
                name: 'Is there a watermark on the output?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'No, there are no watermarks. Your converted files are clean and ready to use.'
                }
              }
            ]
          })
        }}
      />
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
