import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resume Maker - Free Online Resume Builder | SimplifyConvert',
  description: 'Create a professional resume online with job templates, editable sections, design choices, job-match guidance, preview, and DOCX download.',
  keywords: ['resume maker', 'resume builder', 'resume templates', 'job resume', 'resume generator'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/resume-maker',
    siteName: 'SimplifyConvert',
    title: 'Resume Maker - Free Online Resume Builder',
    description: 'Create professional resumes with editable templates, job-match guidance, preview, and DOCX download.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Resume Maker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resume Maker - Free Online Resume Builder',
    description: 'Create professional resumes with job-match guidance and DOCX download.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/resume-maker',
  },
};

export default function ResumeMakerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

