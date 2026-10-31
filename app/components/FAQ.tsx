'use client';

import React from 'react';
import { FAQPanel, FAQHeading, FAQList, FAQDisclosure, FAQQuestion, FAQAnswer } from './FAQDesign';

interface FAQItem {
  name: string;
  acceptedAnswer: {
    '@type': string;
    text: string;
  };
}

interface FAQProps {
  items: FAQItem[];
  colorClass?: 'purple' | 'orange' | 'pink' | 'blue' | 'teal' | 'green';
  bgColor?: 'white' | 'gray';
  schema?: boolean;
}

export function FAQ({ 
  items, 
  schema = true 
}: FAQProps) {
  return (
    <>
      {/* FAQ Schema */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: items.map((item) => ({
              '@type': 'Question',
              name: item.name,
              acceptedAnswer: item.acceptedAnswer,
            })),
          })}
        </script>
      )}

      <FAQPanel>
        <FAQHeading>Frequently Asked Questions</FAQHeading>
        <FAQList>
          {items.map((item, idx) => (
            <FAQDisclosure key={idx}>
              <FAQQuestion>{item.name}</FAQQuestion>
              <FAQAnswer>{item.acceptedAnswer.text}</FAQAnswer>
            </FAQDisclosure>
          ))}
        </FAQList>
      </FAQPanel>
    </>
  );
}
