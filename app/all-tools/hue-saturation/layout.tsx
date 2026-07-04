export const metadata = {
  title: 'Free Hue Saturation Tool - Adjust Colors',
  description: 'Adjust hue, saturation, and lightness independently. Fine-tune colors with precision.',
  keywords: 'hue, saturation, lightness, color adjustment, image editor',
  openGraph: {
    title: 'Free Hue Saturation Tool - Color Adjustment',
    description: 'Adjust image colors with independent controls',
    type: 'website',
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/hue-saturation' },
};

export default function HueSaturationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

