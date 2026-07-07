import type { Metadata } from 'next';
import { getAiStudioAccessForCurrentUser } from '@/lib/entitlements/ai-studio-server';
import { PremiumAccessRequired } from '../components/PremiumAccessRequired';
import SpreadsheetMakerClient from './SpreadsheetMakerClient';

export const metadata: Metadata = {
  title: 'AI Spreadsheet Maker | AI Studio | SimplifyConvert',
  description:
    'Create budgets, sales reports, project trackers, invoices, comparison tables, and plans with AI Studio credits.',
  alternates: {
    canonical: 'https://simplifyconvert.com/ai-studio/spreadsheet-maker',
  },
};

export const dynamic = 'force-dynamic';

export default async function AISpreadsheetMakerPage() {
  const access = await getAiStudioAccessForCurrentUser();

  if (!access.allowed) {
    return <PremiumAccessRequired toolName="AI Spreadsheet Maker" returnTo="/ai-studio/spreadsheet-maker" />;
  }

  return <SpreadsheetMakerClient />;
}
