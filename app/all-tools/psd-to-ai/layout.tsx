import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PSD Converter | SimplifyConvert',
  robots: {
    index: false,
    follow: true,
  },
};

export default function PsdToAiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
