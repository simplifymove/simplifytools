import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Film Noir - Free Online High Contrast Black & White Tool',
  description: 'Convert photos to classic film noir style with high contrast black and white. Create dramatic film noir images instantly.',
  keywords: ['film noir', 'black and white', 'high contrast', 'dramatic', 'photo effect', 'online tool'],
  openGraph: {
    title: 'Film Noir - Free Online High Contrast Black & White Tool',
    description: 'Convert photos to classic film noir style with dramatic high contrast.',
    url: 'https://simplifyconvert.com/all-tools/film-noir',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
