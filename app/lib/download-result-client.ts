'use client';

export interface DownloadResultResponse {
  success?: boolean;
  downloadPageUrl?: string;
}

export async function readDownloadResultResponse(
  response: Response,
): Promise<Required<DownloadResultResponse>> {
  const result = await response.json() as DownloadResultResponse & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(result.error || 'Processing failed');
  }

  if (!result.success || !result.downloadPageUrl) {
    throw new Error(
      'Processing completed but the download result could not be created',
    );
  }

  return {
    success: true,
    downloadPageUrl: result.downloadPageUrl,
  };
}

export async function uploadBrowserDownloadResult({
  blob,
  toolSlug,
  originalName,
  outputName,
}: {
  blob: Blob;
  toolSlug: string;
  originalName: string;
  outputName: string;
}): Promise<Required<DownloadResultResponse>> {
  const formData = new FormData();

  formData.append('file', blob, outputName);
  formData.append('toolSlug', toolSlug);
  formData.append('originalName', originalName);
  formData.append('outputName', outputName);

  return readDownloadResultResponse(
    await fetch('/api/browser-download-result', {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
    }),
  );
}

export async function uploadBrowserPdfResult({
  blob,
  toolSlug,
  originalName,
  outputName,
}: {
  blob: Blob;
  toolSlug: string;
  originalName: string;
  outputName: string;
}): Promise<Required<DownloadResultResponse>> {
  const formData = new FormData();

  formData.append('file', blob, outputName);
  formData.append('toolSlug', toolSlug);
  formData.append('originalName', originalName);
  formData.append('outputName', outputName);

  return readDownloadResultResponse(
    await fetch('/api/pdf/browser-result', {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
    }),
  );
}
