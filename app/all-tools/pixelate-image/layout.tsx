export const metadata = {
  title: 'Free Pixelate Image Tool - Create Mosaic Effects',
  description: 'Pixelate and mosaic your images for privacy or artistic effects. Adjust pixel size for perfect pixelation instantly.',
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

