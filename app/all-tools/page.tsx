import type { Metadata } from 'next';
import AllToolsClient from './AllToolsClient';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools',
  },
};

export default function AllToolsPage() {
  return <AllToolsClient />;
}
