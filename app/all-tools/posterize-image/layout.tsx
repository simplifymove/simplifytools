export const metadata = {
  title: 'Free Posterize Image Tool - Create Bold Poster Art Effects',
  description: 'Convert your photos into bold, vibrant poster art. Reduce colors to create striking artistic effects with adjustable color levels.',
  keywords: 'posterize, poster effect, color reduction, art effect, photo editor, bold colors',
  openGraph: {
    title: 'Free Posterize Image Tool - Create Bold Poster Art Effects',
    description: 'Transform photos into bold poster art with reduced color palettes',
    type: 'website',
  },
};

export default function PosterizeImageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
