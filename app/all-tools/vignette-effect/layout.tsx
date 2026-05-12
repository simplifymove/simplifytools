export const metadata = {
  title: 'Free Vignette Effect Tool - Add Edge Darkening to Photos',
  description: 'Add professional vignette effects to your photos. Darken edges to create focus and depth with adjustable strength controls.',
  keywords: 'vignette, vignette effect, edge darkening, photo effect, focus effect, professional',
  openGraph: {
    title: 'Free Vignette Effect Tool - Add Edge Darkening to Photos',
    description: 'Professional vignette effects to enhance your photos',
    type: 'website',
  },
};

export default function VignetteEffectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
