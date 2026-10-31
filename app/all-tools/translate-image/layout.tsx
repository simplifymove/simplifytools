import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Translate Image - OCR & Image Text Translation | SimplifyConvert',
  description: 'Detect and translate text in images, edit translated overlays, customize their appearance, and generate the translated result as PNG.',
  keywords: ['translate image', 'image translator', 'OCR translation', 'translate text in image', 'image OCR', 'photo translator'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/translate-image',
    siteName: 'SimplifyConvert',
    title: 'Translate Image - OCR & Image Text Translation',
    description: 'Detect and translate image text, edit translated overlays, and generate a PNG result.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Translate Image' }],
  },
  twitter: { card: 'summary_large_image', title: 'Translate Image', description: 'Detect and translate image text, edit translated overlays, and generate a PNG result.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/translate-image' },
};

export default function TranslateImageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
