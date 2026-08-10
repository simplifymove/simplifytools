export const metadata = {
  title: 'Free Glow Effect - Add Luminous Glow to Photos',
  description: 'Apply configurable glow and luminous-style effects to images using browser-based processing.',
  keywords: 'glow effect, bloom, luminous, light effect, photo glow',
  openGraph: {
    title: 'Free Glow Effect - Luminous Photo Effects',
    description: 'Apply configurable glow and bloom-style effects to images',
    type: 'website',
    url: 'https://simplifyconvert.com/all-tools/glow-effect',
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/glow-effect' },
};

export default function GlowEffectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
