import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In - SimplifyConvert',
  description: 'Sign in to your SimplifyConvert account to save and manage your tools.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
