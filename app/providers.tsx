'use client';

import { SessionProvider } from 'next-auth/react';
import React, { ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import { ToastProvider } from './components/common/ToastProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <MotionConfig reducedMotion="user">
        <ToastProvider>
          {children}
        </ToastProvider>
      </MotionConfig>
    </SessionProvider>
  );
}
