export const metadata = {
  title: 'Free Invert Colors Tool - Create Negative Effects',
  description: 'Invert colors in your images for creative and artistic effects. Create negative color photos instantly.',
  keywords: 'invert colors, negative, color inversion, photo effect, artistic',
  openGraph: {
    title: 'Free Invert Colors Tool - Negative Effects',
    description: 'Invert image colors for creative effects',
    type: 'website',
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/invert-colors' },
};

export default function InvertColorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

