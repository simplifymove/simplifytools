export const metadata = {
  title: 'Free Add Opacity Tool - Control Image Transparency',
  description: 'Add transparency and opacity control to images. Create transparent PNG files.',
  keywords: 'opacity, transparency, PNG, transparent background, image transparency',
  openGraph: {
    title: 'Free Add Opacity Tool - Image Transparency',
    description: 'Control opacity and transparency in images',
    type: 'website',
  },
};

export default function AddOpacityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
