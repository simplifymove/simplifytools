export const metadata = {
  title: 'Hue & Saturation - Adjust Image Colors | SimplifyConvert',
  description: 'Adjust hue, saturation, and lightness in your browser, preview the color changes, and download the processed image.',
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

