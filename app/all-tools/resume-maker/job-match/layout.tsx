import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resume Maker with Job-Match Guidance & DOCX Download',
  description: 'Create and edit a resume using role-based templates, job-match guidance, design choices, preview, and DOCX download.',
  keywords: ['resume maker', 'free resume builder', 'resume builder online', 'create resume', 'professional resume template', 'job match resume', 'resume creator', 'resume builder free online'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/resume-maker/job-match',
    siteName: 'SimplifyConvert',
    title: 'Resume Maker with Job-Match Guidance & DOCX Download',
    description: 'Create and edit a resume with role-based templates, job-match guidance, preview, and DOCX download.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Resume maker with role-based templates and job-match guidance',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resume Maker with Job-Match Guidance & DOCX Download',
    description: 'Create and edit a resume with role-based templates, job-match guidance, preview, and DOCX download.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/resume-maker/job-match',
  },
};

export default function ResumeJobMatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
