export const metadata = {
  title: 'Color Grader - Adjust Image Color Balance | SimplifyConvert',
  description: 'Adjust image color balance, hue, and saturation with browser-based controls and preview the result before downloading.',
  keywords: 'color grader, color grading, photo editor, hue adjustment, saturation, color correction',
  openGraph: {
    title: 'Free Color Grader - Professional Photo Color Grading Tool',
    description: 'Professional color grading for your photos with advanced controls',
    type: 'website',
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/color-grader' },
};

export default function ColorGraderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

