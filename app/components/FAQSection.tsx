'use client';

import React from 'react';
import { FAQPanel, FAQHeading, FAQList, FAQDisclosure, FAQQuestion, FAQAnswer } from './FAQDesign';
import { generateFAQSchema } from '@/app/lib/seo';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  description?: string;
  faqs: FAQItem[];
  includeSchema?: boolean;
  bgColor?: 'white' | 'gray';
  borderTop?: boolean;
  py?: string;
  px?: string;
}

export function FAQSection({ 
  title = 'Frequently Asked Questions', 
  description, 
  faqs, 
  includeSchema = true,
}: FAQSectionProps) {
  return (
    <>
      {/* JSON-LD Schema */}
      {includeSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateFAQSchema(faqs)),
          }}
          suppressHydrationWarning
        />
      )}

      <FAQPanel>
        <FAQHeading>{title}</FAQHeading>
        {description && <p className="mt-4 text-center text-lg text-slate-600 max-w-2xl mx-auto">{description}</p>}
        <FAQList>
          {faqs.map((faq, index) => (
            <FAQDisclosure key={index}>
              <FAQQuestion>{faq.question}</FAQQuestion>
              <FAQAnswer>{faq.answer}</FAQAnswer>
            </FAQDisclosure>
          ))}
        </FAQList>
      </FAQPanel>
    </>
  );
}

export default FAQSection;
