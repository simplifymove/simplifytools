'use client';

import React from 'react';
import { motion } from 'framer-motion';

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
  colorClass = 'purple', 
  bgColor = 'white',
  schema = true 
}: FAQProps) {
  const colorMap = {
    purple: {
      border: 'border-gray-300 hover:border-purple-300',
      text: 'group-open:text-purple-600',
      accent: 'text-purple-600'
    },
    orange: {
      border: 'border-gray-300 hover:border-orange-300',
      text: 'group-open:text-orange-600',
      accent: 'text-orange-600'
    },
    pink: {
      border: 'border-gray-300 hover:border-pink-300',
      text: 'group-open:text-pink-600',
      accent: 'text-pink-600'
    },
    blue: {
      border: 'border-gray-300 hover:border-blue-300',
      text: 'group-open:text-blue-600',
      accent: 'text-blue-600'
    },
    teal: {
      border: 'border-gray-300 hover:border-teal-300',
      text: 'group-open:text-teal-600',
      accent: 'text-teal-600'
    },
    green: {
      border: 'border-gray-300 hover:border-green-300',
      text: 'group-open:text-green-600',
      accent: 'text-green-600'
    }
  };

  const colors = colorMap[colorClass];
  const bgClass = bgColor === 'gray' ? 'bg-gray-50' : 'bg-white';

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

      {/* FAQ Section Wrapper */}
      <section className={`py-16 px-4 md:px-8 ${bgClass} border-t border-gray-200`}>
        <div className="max-w-4xl mx-auto w-full">
          <motion.div
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              {items.map((item, idx) => (
                <details 
                  key={idx} 
                  className={`group w-full border rounded-lg p-4 transition cursor-pointer ${colors.border}`}
                >
                  <summary className={`flex cursor-pointer items-center justify-between font-semibold text-gray-900 ${colors.text}`}>
                    {item.name}
                    <span className="transition group-open:rotate-180 flex-shrink-0">▼</span>
                  </summary>
                  <p className="mt-3 text-gray-700">{item.acceptedAnswer.text}</p>
                </details>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
