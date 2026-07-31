import type { ComponentProps, ReactNode } from 'react';
import Link from 'next/link';
import { getSignInPath } from '@/lib/auth/redirect';

interface ProtectedAiStudioLinkProps
  extends Omit<ComponentProps<typeof Link>, 'href'> {
  href: string;
  isAuthenticated: boolean;
  children: ReactNode;
}

export function ProtectedAiStudioLink({
  href,
  isAuthenticated,
  children,
  ...props
}: ProtectedAiStudioLinkProps) {
  return (
    <Link
      href={isAuthenticated ? href : getSignInPath(href)}
      {...props}
    >
      {children}
    </Link>
  );
}
