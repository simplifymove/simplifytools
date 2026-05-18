'use client';

import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Dynamic layout for all image tool pages at [slug]
 * Applies error boundary and consistent structure to all tools
 * This wraps every tool page with global error handling
 */

export default function ImageToolLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const slug = pathname?.split('/').pop();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Tool page content with error boundary semantics */}
      <div className="flex-1">
        {children}
      </div>

      {/* Global error tracking pixel (silent monitoring) */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Global error handler for unhandled exceptions
            window.addEventListener('error', function(event) {
              // Log unhandled errors to monitoring service
              if (event.message && !event.message.includes('ResizeObserver')) {
                fetch('/api/image-tools/report-error', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    toolId: '${slug || 'unknown'}',
                    toolName: 'Image Tool: ${slug || 'unknown'}',
                    errorType: 'UNHANDLED_EXCEPTION',
                    errorMessage: event.message,
                    userMessage: 'An unexpected error occurred. Please try again.',
                    url: window.location.href,
                    timestamp: new Date().toISOString(),
                    systemInfo: {
                      userAgent: navigator.userAgent,
                      platform: navigator.platform,
                    }
                  })
                }).catch(() => {});
              }
            });

            // Global promise rejection handler
            window.addEventListener('unhandledrejection', function(event) {
              fetch('/api/image-tools/report-error', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  toolId: '${slug || 'unknown'}',
                  toolName: 'Image Tool: ${slug || 'unknown'}',
                  errorType: 'UNHANDLED_PROMISE_REJECTION',
                  errorMessage: event.reason?.message || String(event.reason),
                  userMessage: 'An unexpected error occurred. Please refresh and try again.',
                  url: window.location.href,
                  timestamp: new Date().toISOString(),
                  systemInfo: {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                  }
                })
              }).catch(() => {});
            });
          `,
        }}
      />
    </div>
  );
}
