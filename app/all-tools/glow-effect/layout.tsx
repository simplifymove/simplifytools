export const metadata = {
  title: 'Free Glow Effect - Add Luminous Glow to Photos',
  description: 'Add glow, bloom, and luminous effects to images. Create stunning glowing photos.',
  keywords: 'glow effect, bloom, luminous, light effect, photo glow',
  openGraph: {
    title: 'Free Glow Effect - Luminous Photo Effects',
    description: 'Add beautiful glow and bloom effects to images',
    type: 'website',
  },
};

export default function GlowEffectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
