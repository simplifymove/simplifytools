export const metadata = {
  title: 'Pixelate Image - Create a Block Pixel Effect | SimplifyConvert',
  description: 'Pixelate JPG, PNG, or WebP images in your browser, adjust the pixel block size, preview the effect, and download the result.',
  keywords: 'pixelate, mosaic, pixel art, blur, privacy effect',
  openGraph: {
    title: 'Free Pixelate Image Tool - Mosaic Effects',
    description: 'Create pixelated and mosaic effects on your photos',
    type: 'website',
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/pixelate-image' },
};

export default function PixelateImageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

