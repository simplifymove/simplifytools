import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile Photo Maker - Free Profile Picture Maker | SimplifyConvert',
  description: 'Create a square profile photo with automatic background removal, face-aware framing, solid, gradient or blurred backgrounds, and multiple output sizes.',
  keywords: ['profile photo maker', 'profile picture maker', 'photo editor', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/profile-photo-maker',
    siteName: 'SimplifyConvert',
    title: 'Profile Photo Maker - Free Profile Picture Maker',
    description: 'Create square profile photos with background removal, face-aware framing, and solid, gradient or blurred backgrounds.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Profile Photo Maker' }],
  },
  twitter: { card: 'summary_large_image', title: 'Profile Photo Maker - Free Profile Picture Maker', description: 'Create square profile photos with background removal, face-aware framing, and solid, gradient or blurred backgrounds.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/profile-photo-maker' },
};

export default function ProfilePhotoMakerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

