'use client';

import React from 'react';

interface Props {
  isActive: boolean;
}

export default function WhiteoutTool({ isActive }: Props) {
  if (!isActive) return null;

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-900 border-2 border-blue-500 rounded-lg p-3 text-white text-sm">
      <p>Click and drag to create a white rectangle over content</p>
    </div>
  );
}
