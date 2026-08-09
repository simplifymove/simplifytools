import type { VideoTool } from './video-tools';

export interface VideoFaq {
  q: string;
  a: string;
}

export function getVideoInputGuidance(tool: VideoTool): { heading: string; text: string } {
  if (tool.inputMethod === 'url') {
    return {
      heading: 'Enter the source URL',
      text: 'Paste the public media URL in the URL field. This workflow does not accept a local file upload.',
    };
  }

  if (tool.inputMethod === 'both') {
    return {
      heading: 'Choose a file or enter a URL',
      text: `Upload one supported file (${tool.accepts.filter((value) => value !== 'url').join(', ')}) or enter a source URL. Use only one input method for each request.`,
    };
  }

  return {
    heading: 'Upload your file',
    text: `Choose one supported file from your device (${tool.accepts.join(', ')}). This workflow does not accept a source URL.`,
  };
}

export function getVideoOutputLabel(tool: VideoTool): string {
  if (tool.engine === 'transcribe') return 'transcript';
  if (tool.engine === 'summarize') return 'summary and text result';
  if (tool.engine === 'download') return 'downloaded media';
  if (tool.outputType === 'text') return 'text result';
  if (tool.category === 'conversion') return 'converted file';
  return 'processed file';
}

export function getVideoOutputGuidance(tool: VideoTool): string {
  const label = getVideoOutputLabel(tool);

  if (tool.engine === 'download') {
    return `When a configured provider can access the public source, continue to the download page for the ${label}. Provider availability, source restrictions, and removed or private content can prevent a result.`;
  }

  if (tool.engine === 'transcribe') {
    return `Review the ${label} against the source media, then download the text if it is useful. Names, accents, overlapping speech, and background noise can cause transcription errors.`;
  }

  if (tool.engine === 'summarize') {
    return `Review the ${label} against the source recording before relying on it. A summary can omit context, and transcription errors can affect the result.`;
  }

  return `When processing finishes, continue to the download page for the ${label}. Check the result before replacing your source file.`;
}

export function getVideoQualityGuidance(tool: VideoTool): string {
  if (tool.engine === 'download') {
    return 'Available format and quality depend on the public source and the configured download provider. Restricted or private media may not be accessible.';
  }

  if (tool.engine === 'transcribe') {
    return 'The output is text rather than a quality-preserved media conversion. Transcription is imperfect and should be checked against the recording.';
  }

  if (tool.engine === 'summarize') {
    return 'The output is a text summary, not a converted media file. Review it for missing context and transcription mistakes.';
  }

  if (tool.outputType === '.gif' || tool.outputType === '.webp') {
    return 'Animation conversion can change frame rate, color detail, dimensions, and file size compared with the source.';
  }

  if (tool.id.startsWith('compress-')) {
    return 'Compression trades file size against visible or audible quality. The result depends on the source, settings, duration, and content.';
  }

  if (tool.id === 'extract-audio-from-video' || /-to-(mp3|wav|ogg|flac)$/.test(tool.id)) {
    return 'Audio extraction or conversion uses an available audio stream and may re-encode it. It cannot restore audio that is missing from the source.';
  }

  if (tool.engine === 'edit') {
    return 'Editing can require re-encoding, so quality, codec characteristics, and file size may change. Review the processed result.';
  }

  return 'Container or codec conversion may re-encode the media. Output quality, compatibility, and file size can differ from the source.';
}

export function getVideoProcessingGuidance(tool: VideoTool): string {
  if (tool.inputMethod === 'url') {
    return 'The submitted URL is handled by SimplifyConvert\'s server-side media workflow. Availability depends on the source and the configured provider.';
  }

  return 'Uploaded files are processed by SimplifyConvert\'s server-side media tools. Temporary working files are scheduled for cleanup after processing, while completed downloads use the site\'s download-result workflow.';
}

export function getVideoLimitGuidance(tool: VideoTool): string {
  if (tool.inputMethod === 'url') {
    return 'This page accepts a URL instead of a file upload. Public source availability and provider limits determine whether processing succeeds.';
  }

  return 'Each uploaded file is subject to the current 500 MB server file-size limit. Processing can still fail or time out for demanding media.';
}

export function getVideoReadyGuidance(tool: VideoTool): string {
  if (tool.inputMethod === 'url') return 'Enter a public source URL and start processing.';
  if (tool.inputMethod === 'both') return 'Upload one file or enter a source URL, then start processing.';
  return 'Upload one supported file and start processing.';
}

export function getVideoMetadataDescription(tool: VideoTool): string {
  if (tool.engine === 'download') {
    return `${tool.title} accepts a public media URL. Results depend on source access and provider availability; private or restricted content may fail.`;
  }

  if (tool.engine === 'transcribe') {
    return `${tool.title} produces a text transcript from the supported input. Transcription can contain errors and should be checked against the source.`;
  }

  if (tool.engine === 'summarize') {
    return `${tool.title} produces a text summary from one supported recording. Review the result for transcription mistakes and missing context.`;
  }

  if (tool.id.startsWith('compress-')) {
    return `${tool.title} processes one supported file server-side. Smaller output can trade visible quality for size, depending on settings and content.`;
  }

  if (tool.outputType === '.gif' || tool.outputType === '.webp') {
    return `${tool.title} converts one supported file server-side. Frame rate, color detail, dimensions, quality, and file size can change.`;
  }

  if (tool.engine === 'edit') {
    return `${tool.title} processes one supported file server-side. Editing may re-encode media, so quality and file size can change.`;
  }

  return `${tool.title} converts one supported file server-side. Codec or container conversion may re-encode media and change quality or file size.`;
}

export function getVideoFaqs(tool: VideoTool): VideoFaq[] {
  return [
    {
      q: 'Is this tool free to use?',
      a: 'This tool can be used without a subscription or credit card. Processing availability and limits vary by workflow and input.',
    },
    {
      q: tool.inputMethod === 'url' ? 'How is the source URL processed?' : 'How is my uploaded file processed?',
      a: getVideoProcessingGuidance(tool),
    },
    {
      q: tool.inputMethod === 'url' ? 'Why might a public URL fail?' : 'What is the upload size limit?',
      a: getVideoLimitGuidance(tool),
    },
    {
      q: `What result does ${tool.title} create?`,
      a: getVideoOutputGuidance(tool),
    },
    {
      q: 'Can the result differ from the source?',
      a: getVideoQualityGuidance(tool),
    },
    ...(tool.engine === 'download'
      ? [{
          q: 'May I download any public media?',
          a: 'Only download media you own or have permission to use. Public visibility does not remove copyright, platform rules, or other usage restrictions.',
        }]
      : []),
  ];
}
