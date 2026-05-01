'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
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
  bgColor = 'gray',
  borderTop = true,
  py = 'py-16',
  px = 'px-4 md:px-8'
}: FAQSectionProps) {
  const [openIndices, setOpenIndices] = useState<Set<number>>(() => new Set([0]));

  const bgClass = bgColor === 'white' ? 'bg-white' : 'bg-gray-50';
  const borderClass = borderTop ? 'border-t border-gray-200' : '';
  const paddingClass = `${py} ${px}`;

  const toggleFAQ = (index: number) => {
    const newOpenIndices = new Set(openIndices);
    if (newOpenIndices.has(index)) {
      newOpenIndices.delete(index);
    } else {
      newOpenIndices.add(index);
    }
    setOpenIndices(newOpenIndices);
  };

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

      {/* FAQ Section Wrapper */}
      <section className={`${paddingClass} ${bgClass} ${borderClass}`}>
        <div className="max-w-4xl mx-auto w-full">
          {/* FAQ Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h2>
            {description && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {description}
              </p>
            )}
          </div>

          {/* FAQ Items Container */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="w-full bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                  aria-expanded={openIndices.has(index)}
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    size={20}
                    className={`flex-shrink-0 text-gray-600 transition-transform ${
                      openIndices.has(index) ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Answer */}
                {openIndices.has(index) && (
                  <div className="px-6 pb-4 border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default FAQSection;
