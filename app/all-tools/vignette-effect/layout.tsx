export const metadata = {
  title: 'Vignette Effect - Darken Image Edges | SimplifyConvert',
  description: 'Add an adjustable vignette-style edge-darkening effect to images in your browser and preview the result before downloading.',
  keywords: 'vignette, vignette effect, edge darkening, photo effect, focus effect, image vignette',
  openGraph: {
    title: 'Free Vignette Effect Tool - Add Edge Darkening to Photos',
    description: 'Add adjustable vignette-style edge darkening to your photos',
    type: 'website',
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/vignette-effect' },
};

export default function VignetteEffectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

