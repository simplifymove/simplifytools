import type { Metadata } from 'next';
import { getAiStudioAccessForCurrentUser } from '@/lib/entitlements/ai-studio-server';
import { PremiumAccessRequired } from '../components/PremiumAccessRequired';
import PresentationMakerClient from './PresentationMakerClient';

export const metadata: Metadata = {
  title: 'AI Presentation Maker | AI Studio | SimplifyConvert',
  description:
    'Create professional presentations in minutes with AI-powered content planning, smart visual layouts, and PPTX export.',
  alternates: {
    canonical: 'https://simplifyconvert.com/ai-studio/presentation-maker',
  },
  openGraph: {
    title: 'AI Presentation Maker | AI Studio | SimplifyConvert',
    description:
      'Create professional presentations in minutes with AI-powered content planning, smart visual layouts, and PPTX export.',
    url: 'https://simplifyconvert.com/ai-studio/presentation-maker',
    siteName: 'SimplifyConvert',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Presentation Maker | AI Studio | SimplifyConvert',
    description:
      'Create professional presentations in minutes with AI-powered content planning, smart visual layouts, and PPTX export.',
  },
};

export const dynamic = 'force-dynamic';

export default async function AIPresentationMakerPage() {
  const access = await getAiStudioAccessForCurrentUser();

  if (!access.allowed) {
    return <PremiumAccessRequired toolName="AI Presentation Maker" returnTo="/ai-studio/presentation-maker" />;
  }

  return <PresentationMakerClient />;
}
