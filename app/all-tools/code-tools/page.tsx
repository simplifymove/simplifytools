import type { Metadata } from 'next';
import CodeToolsClient from './CodeToolsClient';

export const metadata: Metadata = {
  title: 'Code Tools - Format, Validate, Encode & Convert',
  description: 'Browse developer utilities for formatting, validation, minification, encoding, decoding, conversion, and generation. Remove secrets before submitting input.',
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/code-tools',
  },
};

export default function CodeToolsPage() {
  return <CodeToolsClient />;
}
