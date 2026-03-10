// Shared video/audio tools registry
// Maps 58 tools to 5 shared engines

export type VideoToolEngine = 'convert' | 'edit' | 'download' | 'transcribe' | 'summarize';

export type ToolOption = {
  id: string;
  label: string;
  type: 'select' | 'number' | 'text' | 'checkbox' | 'time';
  required?: boolean;
  default?: any;
  options?: Array<{ label: string; value: any }>;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
};

export type VideoTool = {
  id: string;
  title: string;
  description: string;
  engine: VideoToolEngine;
  category: 'conversion' | 'editing' | 'download' | 'transcription' | 'summarization';
  accepts: string[]; // file extensions or 'url'
  outputType: string; // file extension or 'text' or 'multiple'
  inputMethod: 'file' | 'url' | 'both';
  options: ToolOption[];
  icon?: string;
};

export const videoTools: Record<string, VideoTool> = {
  // ============ PHASE 1: FFmpeg-only tools ============

  // Conversions
  'mp4-to-mp3': {
    id: 'mp4-to-mp3',
    title: 'MP4 to MP3',
    description: 'Convert MP4 video to MP3 audio',
    engine: 'convert',
    category: 'conversion',
    accepts: ['.mp4'],
    outputType: '.mp3',
    inputMethod: 'file',
    options: [
      {
        id: 'audioQuality',
        label: 'Audio Quality',
        type: 'select',
        default: '2',
        options: [
          { label: 'Low (128 kbps)', value: '9' },
          { label: 'Medium (192 kbps)', value: '5' },
          { label: 'High (320 kbps)', value: '2' },
        ],
      },
    ],
  },

  'mov-to-mp4': {
    id: 'mov-to-mp4',
    title: 'MOV to MP4',
    description: 'Convert MOV video to MP4 format',
    engine: 'convert',
    category: 'conversion',
    accepts: ['.mov'],
    outputType: '.mp4',
    inputMethod: 'file',
    options: [
      {
        id: 'videoQuality',
        label: 'Video Quality',
        type: 'select',
        default: 'medium',
        options: [
          { label: 'Low', value: 'low' },
          { label: 'Medium', value: 'medium' },
          { label: 'High', value: 'high' },
        ],
      },
    ],
  },

  'mp4-to-wav': {
    id: 'mp4-to-wav',
    title: 'MP4 to WAV',
    description: 'Extract audio from MP4 as WAV format',
    engine: 'convert',
    category: 'conversion',
    accepts: ['.mp4'],
    outputType: '.wav',
    inputMethod: 'file',
    options: [
      {
        id: 'sampleRate',
        label: 'Sample Rate',
        type: 'select',
        default: '44100',
        options: [
          { label: '16 kHz', value: '16000' },
          { label: '44.1 kHz', value: '44100' },
          { label: '48 kHz', value: '48000' },
        ],
      },
    ],
  },

  // Editing
  'mute-video': {
    id: 'mute-video',
    title: 'Mute Video',
    description: 'Remove audio from a video file',
    engine: 'edit',
    category: 'editing',
    accepts: ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
    outputType: 'same',
    inputMethod: 'file',
    options: [],
  },

  'extract-audio-from-video': {
    id: 'extract-audio-from-video',
    title: 'Extract Audio from Video',
    description: 'Extract audio track from video as MP3 or WAV',
    engine: 'edit',
    category: 'editing',
    accepts: ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.m4v'],
    outputType: '.mp3',
    inputMethod: 'file',
    options: [
      {
        id: 'outputFormat',
        label: 'Output Format',
        type: 'select',
        default: 'mp3',
        options: [
          { label: 'MP3', value: 'mp3' },
          { label: 'WAV', value: 'wav' },
          { label: 'AAC', value: 'aac' },
        ],
      },
      {
        id: 'audioQuality',
        label: 'Audio Quality',
        type: 'select',
        default: '5',
        options: [
          { label: 'Low (128 kbps)', value: '9' },
          { label: 'Medium (192 kbps)', value: '5' },
          { label: 'High (320 kbps)', value: '2' },
        ],
      },
    ],
  },

  'trim-video': {
    id: 'trim-video',
    title: 'Trim Video',
    description: 'Trim a video by start and end time',
    engine: 'edit',
    category: 'editing',
    accepts: ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
    outputType: 'same',
    inputMethod: 'file',
    options: [
      {
        id: 'startTime',
        label: 'Start Time (MM:SS)',
        type: 'text',
        required: true,
        placeholder: '00:15',
      },
      {
        id: 'endTime',
        label: 'End Time (MM:SS)',
        type: 'text',
        required: true,
        placeholder: '00:45',
      },
    ],
  },

  'resize-video': {
    id: 'resize-video',
    title: 'Resize Video',
    description: 'Resize video to specific width and height',
    engine: 'edit',
    category: 'editing',
    accepts: ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
    outputType: 'same',
    inputMethod: 'file',
    options: [
      {
        id: 'width',
        label: 'Width (pixels)',
        type: 'number',
        required: true,
        placeholder: '1920',
        min: 160,
        max: 7680,
      },
      {
        id: 'height',
        label: 'Height (pixels)',
        type: 'number',
        required: true,
        placeholder: '1080',
        min: 120,
        max: 4320,
      },
      {
        id: 'keepAspect',
        label: 'Keep Aspect Ratio',
        type: 'checkbox',
        default: true,
      },
    ],
  },

  'video-to-gif': {
    id: 'video-to-gif',
    title: 'Video to GIF',
    description: 'Convert video to animated GIF',
    engine: 'edit',
    category: 'editing',
    accepts: ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
    outputType: '.gif',
    inputMethod: 'file',
    options: [
      {
        id: 'fps',
        label: 'Frames Per Second',
        type: 'select',
        default: '10',
        options: [
          { label: '5 fps', value: '5' },
          { label: '10 fps', value: '10' },
          { label: '15 fps', value: '15' },
          { label: '20 fps', value: '20' },
        ],
      },
      {
        id: 'scale',
        label: 'Width (auto-scales height)',
        type: 'number',
        default: 320,
        min: 100,
        max: 1280,
      },
    ],
  },

  'compress-video': {
    id: 'compress-video',
    title: 'Compress Video',
    description: 'Reduce video file size with quality options',
    engine: 'edit',
    category: 'editing',
    accepts: ['.mp4', '.mov', '.avi', '.mkv'],
    outputType: '.mp4',
    inputMethod: 'file',
    options: [
      {
        id: 'preset',
        label: 'Compression Level',
        type: 'select',
        default: 'medium',
        options: [
          { label: 'Low compression (faster)', value: 'fast' },
          { label: 'Medium compression', value: 'medium' },
          { label: 'High compression (slower)', value: 'slow' },
        ],
      },
      {
        id: 'crf',
        label: 'Quality (lower = better, 0-51)',
        type: 'number',
        default: 28,
        min: 0,
        max: 51,
      },
    ],
  },

  // ============ PHASE 2: Compression & Web formats ============

  'compress-mov': {
    id: 'compress-mov',
    title: 'Compress MOV',
    description: 'Compress MOV file to reduce size',
    engine: 'edit',
    category: 'editing',
    accepts: ['.mov'],
    outputType: '.mov',
    inputMethod: 'file',
    options: [
      {
        id: 'preset',
        label: 'Compression Level',
        type: 'select',
        default: 'medium',
        options: [
          { label: 'Low', value: 'fast' },
          { label: 'Medium', value: 'medium' },
          { label: 'High', value: 'slow' },
        ],
      },
    ],
  },

  'compress-avi': {
    id: 'compress-avi',
    title: 'Compress AVI',
    description: 'Compress AVI file to reduce size',
    engine: 'edit',
    category: 'editing',
    accepts: ['.avi'],
    outputType: '.avi',
    inputMethod: 'file',
    options: [
      {
        id: 'preset',
        label: 'Compression Level',
        type: 'select',
        default: 'medium',
        options: [
          { label: 'Low', value: 'fast' },
          { label: 'Medium', value: 'medium' },
          { label: 'High', value: 'slow' },
        ],
      },
    ],
  },

  'compress-mkv': {
    id: 'compress-mkv',
    title: 'Compress MKV',
    description: 'Compress MKV file to reduce size',
    engine: 'edit',
    category: 'editing',
    accepts: ['.mkv'],
    outputType: '.mkv',
    inputMethod: 'file',
    options: [
      {
        id: 'preset',
        label: 'Compression Level',
        type: 'select',
        default: 'medium',
        options: [
          { label: 'Low', value: 'fast' },
          { label: 'Medium', value: 'medium' },
          { label: 'High', value: 'slow' },
        ],
      },
    ],
  },

  'video-to-webp': {
    id: 'video-to-webp',
    title: 'Video to WebP',
    description: 'Convert video to WebP animated format',
    engine: 'edit',
    category: 'editing',
    accepts: ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
    outputType: '.webp',
    inputMethod: 'file',
    options: [
      {
        id: 'quality',
        label: 'Quality (0-100)',
        type: 'number',
        default: 80,
        min: 0,
        max: 100,
      },
    ],
  },

  'mp4-to-webm': {
    id: 'mp4-to-webm',
    title: 'MP4 to WebM',
    description: 'Convert MP4 to WebM format',
    engine: 'convert',
    category: 'conversion',
    accepts: ['.mp4'],
    outputType: '.webm',
    inputMethod: 'file',
    options: [
      {
        id: 'quality',
        label: 'Quality Level',
        type: 'select',
        default: 'medium',
        options: [
          { label: 'Low', value: 'low' },
          { label: 'Medium', value: 'medium' },
          { label: 'High', value: 'high' },
        ],
      },
    ],
  },

  // ============ PHASE 3: Transcription tools ============

  'audio-to-text': {
    id: 'audio-to-text',
    title: 'Audio to Text',
    description: 'Transcribe audio file to text',
    engine: 'transcribe',
    category: 'transcription',
    accepts: ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac'],
    outputType: 'text',
    inputMethod: 'file',
    options: [
      {
        id: 'language',
        label: 'Language',
        type: 'select',
        default: 'en',
        options: [
          { label: 'English', value: 'en' },
          { label: 'Spanish', value: 'es' },
          { label: 'French', value: 'fr' },
          { label: 'German', value: 'de' },
          { label: 'Auto-detect', value: 'auto' },
        ],
      },
      {
        id: 'outputFormat',
        label: 'Output Format',
        type: 'select',
        default: 'text',
        options: [
          { label: 'Plain Text', value: 'text' },
          { label: 'SRT (subtitles)', value: 'srt' },
          { label: 'VTT (subtitles)', value: 'vtt' },
          { label: 'JSON', value: 'json' },
        ],
      },
    ],
  },

  'video-to-text': {
    id: 'video-to-text',
    title: 'Video to Text',
    description: 'Extract audio and transcribe video to text',
    engine: 'transcribe',
    category: 'transcription',
    accepts: ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
    outputType: 'text',
    inputMethod: 'file',
    options: [
      {
        id: 'language',
        label: 'Language',
        type: 'select',
        default: 'en',
        options: [
          { label: 'English', value: 'en' },
          { label: 'Spanish', value: 'es' },
          { label: 'French', value: 'fr' },
          { label: 'German', value: 'de' },
          { label: 'Auto-detect', value: 'auto' },
        ],
      },
      {
        id: 'outputFormat',
        label: 'Output Format',
        type: 'select',
        default: 'text',
        options: [
          { label: 'Plain Text', value: 'text' },
          { label: 'SRT (subtitles)', value: 'srt' },
          { label: 'VTT (subtitles)', value: 'vtt' },
          { label: 'JSON', value: 'json' },
        ],
      },
    ],
  },

  'youtube-to-text': {
    id: 'youtube-to-text',
    title: 'YouTube to Text',
    description: 'Download YouTube video and transcribe to text',
    engine: 'transcribe',
    category: 'transcription',
    accepts: ['url'],
    outputType: 'text',
    inputMethod: 'url',
    options: [
      {
        id: 'url',
        label: 'YouTube URL',
        type: 'text',
        required: true,
        placeholder: 'https://www.youtube.com/watch?v=...',
      },
      {
        id: 'language',
        label: 'Language',
        type: 'select',
        default: 'en',
        options: [
          { label: 'English', value: 'en' },
          { label: 'Spanish', value: 'es' },
          { label: 'French', value: 'fr' },
          { label: 'Auto-detect', value: 'auto' },
        ],
      },
      {
        id: 'outputFormat',
        label: 'Output Format',
        type: 'select',
        default: 'text',
        options: [
          { label: 'Plain Text', value: 'text' },
          { label: 'SRT', value: 'srt' },
          { label: 'VTT', value: 'vtt' },
          { label: 'JSON', value: 'json' },
        ],
      },
    ],
  },

  'youtube-transcript': {
    id: 'youtube-transcript',
    title: 'YouTube Transcript',
    description: 'Get transcript from YouTube video',
    engine: 'transcribe',
    category: 'transcription',
    accepts: ['url'],
    outputType: 'text',
    inputMethod: 'url',
    options: [
      {
        id: 'url',
        label: 'YouTube URL',
        type: 'text',
        required: true,
        placeholder: 'https://www.youtube.com/watch?v=...',
      },
      {
        id: 'outputFormat',
        label: 'Format',
        type: 'select',
        default: 'text',
        options: [
          { label: 'Plain Text', value: 'text' },
          { label: 'SRT', value: 'srt' },
          { label: 'VTT', value: 'vtt' },
        ],
      },
    ],
  },

  'transcribe-podcast': {
    id: 'transcribe-podcast',
    title: 'Transcribe Podcast',
    description: 'Transcribe podcast audio file',
    engine: 'transcribe',
    category: 'transcription',
    accepts: ['.mp3', '.m4a', '.wav', '.ogg'],
    outputType: 'text',
    inputMethod: 'file',
    options: [
      {
        id: 'language',
        label: 'Language',
        type: 'select',
        default: 'en',
        options: [
          { label: 'English', value: 'en' },
          { label: 'Spanish', value: 'es' },
          { label: 'Auto-detect', value: 'auto' },
        ],
      },
      {
        id: 'outputFormat',
        label: 'Output Format',
        type: 'select',
        default: 'text',
        options: [
          { label: 'Plain Text', value: 'text' },
          { label: 'SRT', value: 'srt' },
          { label: 'JSON with timestamps', value: 'json' },
        ],
      },
    ],
  },

  // ============ PHASE 4: Downloader tools (placeholder) ============

  'instagram-download': {
    id: 'instagram-download',
    title: 'Instagram Download',
    description: 'Download video from Instagram',
    engine: 'download',
    category: 'download',
    accepts: ['url'],
    outputType: '.mp4',
    inputMethod: 'url',
    options: [
      {
        id: 'url',
        label: 'Instagram URL',
        type: 'text',
        required: true,
        placeholder: 'https://www.instagram.com/p/...',
      },
    ],
  },

  'tiktok-video-download': {
    id: 'tiktok-video-download',
    title: 'TikTok Video Download',
    description: 'Download video from TikTok',
    engine: 'download',
    category: 'download',
    accepts: ['url'],
    outputType: '.mp4',
    inputMethod: 'url',
    options: [
      {
        id: 'url',
        label: 'TikTok URL',
        type: 'text',
        required: true,
        placeholder: 'https://www.tiktok.com/@.../video/...',
      },
    ],
  },

  'twitter-download': {
    id: 'twitter-download',
    title: 'Twitter Download',
    description: 'Download video from Twitter/X',
    engine: 'download',
    category: 'download',
    accepts: ['url'],
    outputType: '.mp4',
    inputMethod: 'url',
    options: [
      {
        id: 'url',
        label: 'Twitter/X URL',
        type: 'text',
        required: true,
        placeholder: 'https://twitter.com/.../status/...',
      },
    ],
  },

  'facebook-download': {
    id: 'facebook-download',
    title: 'Facebook Download',
    description: 'Download video from Facebook',
    engine: 'download',
    category: 'download',
    accepts: ['url'],
    outputType: '.mp4',
    inputMethod: 'url',
    options: [
      {
        id: 'url',
        label: 'Facebook URL',
        type: 'text',
        required: true,
        placeholder: 'https://www.facebook.com/.../videos/...',
      },
    ],
  },

  // ============ PHASE 5: Summarization & Subtitles ============

  'summarize-podcast': {
    id: 'summarize-podcast',
    title: 'Summarize Podcast',
    description: 'Transcribe and summarize podcast audio',
    engine: 'summarize',
    category: 'summarization',
    accepts: ['.mp3', '.m4a', '.wav', '.ogg'],
    outputType: 'text',
    inputMethod: 'file',
    options: [
      {
        id: 'summaryType',
        label: 'Summary Type',
        type: 'select',
        default: 'mixed',
        options: [
          { label: 'Short summary + bullets', value: 'mixed' },
          { label: 'Detailed summary', value: 'detailed' },
          { label: 'Bullet points only', value: 'bullets' },
        ],
      },
    ],
  },

  'add-subtitles': {
    id: 'add-subtitles',
    title: 'Add Subtitles',
    description: 'Add subtitle file to video',
    engine: 'edit',
    category: 'editing',
    accepts: ['.mp4', '.mov', '.avi', '.mkv'],
    outputType: '.mp4',
    inputMethod: 'file',
    options: [
      {
        id: 'subtitleMode',
        label: 'Subtitle Mode',
        type: 'select',
        default: 'soft',
        options: [
          { label: 'Soft subtitles (selectable)', value: 'soft' },
          { label: 'Burned subtitles (embedded)', value: 'burned' },
        ],
      },
    ],
  },

  // ============ ADDITIONAL CONVERSIONS ============

  'mp4-to-avi': {
    id: 'mp4-to-avi',
    title: 'MP4 to AVI',
    description: 'Convert MP4 to AVI format',
    engine: 'convert',
    category: 'conversion',
    accepts: ['.mp4'],
    outputType: '.avi',
    inputMethod: 'file',
    options: [
      {
        id: 'quality',
        label: 'Quality',
        type: 'select',
        default: 'medium',
        options: [
          { label: 'Low', value: 'low' },
          { label: 'Medium', value: 'medium' },
          { label: 'High', value: 'high' },
        ],
      },
    ],
  },

  'avi-to-mp4': {
    id: 'avi-to-mp4',
    title: 'AVI to MP4',
    description: 'Convert AVI to MP4 format',
    engine: 'convert',
    category: 'conversion',
    accepts: ['.avi'],
    outputType: '.mp4',
    inputMethod: 'file',
    options: [
      {
        id: 'quality',
        label: 'Quality',
        type: 'select',
        default: 'medium',
        options: [
          { label: 'Low', value: 'low' },
          { label: 'Medium', value: 'medium' },
          { label: 'High', value: 'high' },
        ],
      },
    ],
  },

  'mov-to-mp3': {
    id: 'mov-to-mp3',
    title: 'MOV to MP3',
    description: 'Extract audio from MOV as MP3',
    engine: 'convert',
    category: 'conversion',
    accepts: ['.mov'],
    outputType: '.mp3',
    inputMethod: 'file',
    options: [
      {
        id: 'audioQuality',
        label: 'Audio Quality',
        type: 'select',
        default: '5',
        options: [
          { label: 'Low (128 kbps)', value: '9' },
          { label: 'Medium (192 kbps)', value: '5' },
          { label: 'High (320 kbps)', value: '2' },
        ],
      },
    ],
  },

  'aac-to-mp3': {
    id: 'aac-to-mp3',
    title: 'AAC to MP3',
    description: 'Convert AAC audio to MP3',
    engine: 'convert',
    category: 'conversion',
    accepts: ['.aac'],
    outputType: '.mp3',
    inputMethod: 'file',
    options: [
      {
        id: 'quality',
        label: 'Quality',
        type: 'select',
        default: '5',
        options: [
          { label: 'Low', value: '9' },
          { label: 'Medium', value: '5' },
          { label: 'High', value: '2' },
        ],
      },
    ],
  },

  'webm-to-mp3': {
    id: 'webm-to-mp3',
    title: 'WebM to MP3',
    description: 'Extract audio from WebM as MP3',
    engine: 'convert',
    category: 'conversion',
    accepts: ['.webm'],
    outputType: '.mp3',
    inputMethod: 'file',
    options: [],
  },

  'ogg-to-wav': {
    id: 'ogg-to-wav',
    title: 'OGG to WAV',
    description: 'Convert OGG audio to WAV',
    engine: 'convert',
    category: 'conversion',
    accepts: ['.ogg'],
    outputType: '.wav',
    inputMethod: 'file',
    options: [],
  },

  'avi-to-mov': {
    id: 'avi-to-mov',
    title: 'AVI to MOV',
    description: 'Convert AVI to MOV format',
    engine: 'convert',
    category: 'conversion',
    accepts: ['.avi'],
    outputType: '.mov',
    inputMethod: 'file',
    options: [],
  },

  'mkv-to-gif': {
    id: 'mkv-to-gif',
    title: 'MKV to GIF',
    description: 'Convert MKV video to GIF',
    engine: 'edit',
    category: 'editing',
    accepts: ['.mkv'],
    outputType: '.gif',
    inputMethod: 'file',
    options: [
      {
        id: 'fps',
        label: 'Frames Per Second',
        type: 'select',
        default: '10',
        options: [
          { label: '5 fps', value: '5' },
          { label: '10 fps', value: '10' },
          { label: '15 fps', value: '15' },
        ],
      },
    ],
  },

  'avi-to-mkv': {
    id: 'avi-to-mkv',
    title: 'AVI to MKV',
    description: 'Convert AVI to MKV format',
    engine: 'convert',
    category: 'conversion',
    accepts: ['.avi'],
    outputType: '.mkv',
    inputMethod: 'file',
    options: [],
  },

  'aac-to-m4r': {
    id: 'aac-to-m4r',
    title: 'AAC to M4R',
    description: 'Convert AAC to M4R (iPhone ringtone)',
    engine: 'convert',
    category: 'conversion',
    accepts: ['.aac'],
    outputType: '.m4r',
    inputMethod: 'file',
    options: [],
  },

  'mp4-to-mov': {
    id: 'mp4-to-mov',
    title: 'MP4 to MOV',
    description: 'Convert MP4 to MOV format',
    engine: 'convert',
    category: 'conversion',
    accepts: ['.mp4'],
    outputType: '.mov',
    inputMethod: 'file',
    options: [],
  },

  'mkv-to-mp3': {
    id: 'mkv-to-mp3',
    title: 'MKV to MP3',
    description: 'Extract audio from MKV as MP3',
    engine: 'convert',
    category: 'conversion',
    accepts: ['.mkv'],
    outputType: '.mp3',
    inputMethod: 'file',
    options: [],
  },

  'mov-to-avi': {
    id: 'mov-to-avi',
    title: 'MOV to AVI',
    description: 'Convert MOV to AVI format',
    engine: 'convert',
    category: 'conversion',
    accepts: ['.mov'],
    outputType: '.avi',
    inputMethod: 'file',
    options: [],
  },

  'avi-to-gif': {
    id: 'avi-to-gif',
    title: 'AVI to GIF',
    description: 'Convert AVI video to animated GIF',
    engine: 'edit',
    category: 'editing',
    accepts: ['.avi'],
    outputType: '.gif',
    inputMethod: 'file',
    options: [
      {
        id: 'scale',
        label: 'Width',
        type: 'number',
        default: 320,
        min: 100,
        max: 1280,
      },
    ],
  },

  'aac-to-wav': {
    id: 'aac-to-wav',
    title: 'AAC to WAV',
    description: 'Convert AAC audio to WAV',
    engine: 'convert',
    category: 'conversion',
    accepts: ['.aac'],
    outputType: '.wav',
    inputMethod: 'file',
    options: [],
  },

  'aac-to-flac': {
    id: 'aac-to-flac',
    title: 'AAC to FLAC',
    description: 'Convert AAC to FLAC lossless audio',
    engine: 'convert',
    category: 'conversion',
    accepts: ['.aac'],
    outputType: '.flac',
    inputMethod: 'file',
    options: [],
  },

  'mkv-to-mp4': {
    id: 'mkv-to-mp4',
    title: 'MKV to MP4',
    description: 'Convert MKV to MP4 format',
    engine: 'convert',
    category: 'conversion',
    accepts: ['.mkv'],
    outputType: '.mp4',
    inputMethod: 'file',
    options: [],
  },

  'mov-to-gif': {
    id: 'mov-to-gif',
    title: 'MOV to GIF',
    description: 'Convert MOV video to animated GIF',
    engine: 'edit',
    category: 'editing',
    accepts: ['.mov'],
    outputType: '.gif',
    inputMethod: 'file',
    options: [
      {
        id: 'scale',
        label: 'Width',
        type: 'number',
        default: 320,
      },
    ],
  },

  'gif-to-mov': {
    id: 'gif-to-mov',
    title: 'GIF to MOV',
    description: 'Convert animated GIF to MOV video',
    engine: 'convert',
    category: 'conversion',
    accepts: ['.gif'],
    outputType: '.mov',
    inputMethod: 'file',
    options: [],
  },

  'm4a-to-mp4': {
    id: 'm4a-to-mp4',
    title: 'M4A to MP4',
    description: 'Convert M4A audio to MP4 video container',
    engine: 'convert',
    category: 'conversion',
    accepts: ['.m4a'],
    outputType: '.mp4',
    inputMethod: 'file',
    options: [],
  },

  'mkv-to-avi': {
    id: 'mkv-to-avi',
    title: 'MKV to AVI',
    description: 'Convert MKV to AVI format',
    engine: 'convert',
    category: 'conversion',
    accepts: ['.mkv'],
    outputType: '.avi',
    inputMethod: 'file',
    options: [],
  },

  'avi-to-mp3': {
    id: 'avi-to-mp3',
    title: 'AVI to MP3',
    description: 'Extract audio from AVI as MP3',
    engine: 'convert',
    category: 'conversion',
    accepts: ['.avi'],
    outputType: '.mp3',
    inputMethod: 'file',
    options: [],
  },

  'm4a-to-mp3': {
    id: 'm4a-to-mp3',
    title: 'M4A to MP3',
    description: 'Convert M4A audio to MP3',
    engine: 'convert',
    category: 'conversion',
    accepts: ['.m4a'],
    outputType: '.mp3',
    inputMethod: 'file',
    options: [],
  },

  'mp4-to-gif': {
    id: 'mp4-to-gif',
    title: 'MP4 to GIF',
    description: 'Convert MP4 video to animated GIF',
    engine: 'edit',
    category: 'editing',
    accepts: ['.mp4'],
    outputType: '.gif',
    inputMethod: 'file',
    options: [
      {
        id: 'scale',
        label: 'Width',
        type: 'number',
        default: 320,
      },
    ],
  },

  'ogg-to-mp3': {
    id: 'ogg-to-mp3',
    title: 'OGG to MP3',
    description: 'Convert OGG audio to MP3',
    engine: 'convert',
    category: 'conversion',
    accepts: ['.ogg'],
    outputType: '.mp3',
    inputMethod: 'file',
    options: [],
  },

  'm4a-to-wav': {
    id: 'm4a-to-wav',
    title: 'M4A to WAV',
    description: 'Convert M4A audio to WAV',
    engine: 'convert',
    category: 'conversion',
    accepts: ['.m4a'],
    outputType: '.wav',
    inputMethod: 'file',
    options: [],
  },

  'gif-to-webp': {
    id: 'gif-to-webp',
    title: 'GIF to WebP',
    description: 'Convert animated GIF to WebP',
    engine: 'convert',
    category: 'conversion',
    accepts: ['.gif'],
    outputType: '.webp',
    inputMethod: 'file',
    options: [
      {
        id: 'quality',
        label: 'Quality',
        type: 'number',
        default: 80,
        min: 0,
        max: 100,
      },
    ],
  },

  'webm-to-mov': {
    id: 'webm-to-mov',
    title: 'WebM to MOV',
    description: 'Convert WebM video to MOV format',
    engine: 'convert',
    category: 'conversion',
    accepts: ['.webm'],
    outputType: '.mov',
    inputMethod: 'file',
    options: [],
  },

  'mkv-to-mov': {
    id: 'mkv-to-mov',
    title: 'MKV to MOV',
    description: 'Convert MKV to MOV format',
    engine: 'convert',
    category: 'conversion',
    accepts: ['.mkv'],
    outputType: '.mov',
    inputMethod: 'file',
    options: [],
  },

  'aac-to-mp4': {
    id: 'aac-to-mp4',
    title: 'AAC to MP4',
    description: 'Convert AAC audio to MP4 container',
    engine: 'convert',
    category: 'conversion',
    accepts: ['.aac'],
    outputType: '.mp4',
    inputMethod: 'file',
    options: [],
  },

  'webm-to-mp4': {
    id: 'webm-to-mp4',
    title: 'WebM to MP4',
    description: 'Convert WebM video to MP4 format',
    engine: 'convert',
    category: 'conversion',
    accepts: ['.webm'],
    outputType: '.mp4',
    inputMethod: 'file',
    options: [],
  },

  'mp4-to-ogg': {
    id: 'mp4-to-ogg',
    title: 'MP4 to OGG',
    description: 'Convert MP4 audio to OGG format',
    engine: 'convert',
    category: 'conversion',
    accepts: ['.mp4'],
    outputType: '.ogg',
    inputMethod: 'file',
    options: [],
  },
};

export function getToolById(id: string): VideoTool | undefined {
  return videoTools[id];
}

export function getAllTools(): VideoTool[] {
  return Object.values(videoTools);
}

export function getToolsByEngine(engine: VideoToolEngine): VideoTool[] {
  return Object.values(videoTools).filter((tool) => tool.engine === engine);
}

export function getToolsByCategory(category: string): VideoTool[] {
  return Object.values(videoTools).filter((tool) => tool.category === category);
}
