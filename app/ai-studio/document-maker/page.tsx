import type { Metadata } from 'next';
import { getAiStudioAccessForCurrentUser } from '@/lib/entitlements/ai-studio-server';
import { PremiumAccessRequired } from '../components/PremiumAccessRequired';
import DocumentMakerClient from './DocumentMakerClient';

export const metadata: Metadata = {
  title: 'AI Document Maker | AI Studio | SimplifyConvert',
  description:
    'Create reports, proposals, business plans, resumes, letters, and blog articles with AI Studio credits.',
  alternates: {
    canonical: 'https://simplifyconvert.com/ai-studio/document-maker',
  },
};

export const dynamic = 'force-dynamic';

export default async function AIDocumentMakerPage() {
  const access = await getAiStudioAccessForCurrentUser();

  if (!access.allowed) {
    return <PremiumAccessRequired toolName="AI Document Maker" returnTo="/ai-studio/document-maker" />;
  }

  return <DocumentMakerClient />;
}
