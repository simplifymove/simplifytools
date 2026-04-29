import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Resume Maker Online with Job Match Templates',
  description: 'Build professional resumes with job matching. Free resume maker with multiple templates. Create, customize, and download your resume instantly.',
  keywords: ['resume maker', 'free resume builder', 'resume builder online', 'create resume', 'professional resume template', 'job match resume', 'resume creator', 'resume builder free online'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/resume-maker/job-match',
    siteName: 'SimplifyConvert',
    title: 'Free Resume Maker Online with Job Match Templates',
    description: 'Build professional resumes with job matching. Free resume maker with multiple templates. Create, customize, and download instantly.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Free resume maker tool with job matching and professional templates',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Resume Maker Online with Job Match Templates',
    description: 'Build professional resumes with job matching. Free resume maker with templates. Create, customize, download instantly',
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
