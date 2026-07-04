import type { Metadata } from 'next';
import CodeToolsClient from './CodeToolsClient';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/code-tools',
  },
};

export default function CodeToolsPage() {
  return <CodeToolsClient />;
}
