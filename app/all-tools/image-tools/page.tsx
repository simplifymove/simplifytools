import type { Metadata } from 'next';
import ImageToolsClient from './ImageToolsClient';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/image-tools',
  },
};

export default function ImageToolsPage() {
  return <ImageToolsClient />;
}
