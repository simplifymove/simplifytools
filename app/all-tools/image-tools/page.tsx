import type { Metadata } from 'next';
import ImageToolsClient from './ImageToolsClient';

export const metadata: Metadata = {
  title: 'Image Tools - Resize, Compress, Convert & Edit',
  description: 'Browse image tools for resizing, compression, format conversion, cropping, and enhancement. Processing method and format support vary by tool.',
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/image-tools',
  },
};

export default function ImageToolsPage() {
  return <ImageToolsClient />;
}
