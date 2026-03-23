'use client';

import { useEffect } from 'react';

interface SchemaProps {
  schema: Record<string, any>;
}

export function SchemaScript({ schema }: SchemaProps) {
  useEffect(() => {
    // Create script tag for structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    
    // Append to head
    document.head.appendChild(script);

    // Cleanup
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [schema]);

  return null;
}
