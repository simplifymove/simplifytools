export const metadata = {
  title: 'Free Color Grader - Professional Photo Color Grading Tool',
  description: 'Grade your photos like a professional. Adjust hue, saturation, and color balance with intuitive controls for stunning visual results.',
  keywords: 'color grader, color grading, photo editor, hue adjustment, saturation, color correction',
  openGraph: {
    title: 'Free Color Grader - Professional Photo Color Grading Tool',
    description: 'Professional color grading for your photos with advanced controls',
    type: 'website',
  },
};

export default function ColorGraderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
