'use client';

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { ToolType } from '@/app/types/pdf-editor';

interface Props {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  onClose: () => void;
}

export default function MobileToolMenu({ activeTool, onToolChange, onClose }: Props) {
  const tools: { name: ToolType; label: string; emoji: string }[] = [
    { name: 'select', label: 'Select', emoji: '🔘' },
    { name: 'text', label: 'Text', emoji: '📝' },
    { name: 'whiteout', label: 'Whiteout', emoji: '⬜' },
    { name: 'shape', label: 'Shape', emoji: '⬛' },
    { name: 'highlight', label: 'Highlight', emoji: '🟨' },
    { name: 'drawing', label: 'Draw', emoji: '✏️' },
    { name: 'image', label: 'Image', emoji: '🖼️' },
    { name: 'signature', label: 'Signature', emoji: '✍️' },
    { name: 'link', label: 'Link', emoji: '🔗' },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {tools.map((tool) => (
        <button
          key={tool.name}
          onClick={() => {
            onToolChange(tool.name);
            onClose();
          }}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition ${
            activeTool === tool.name
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <span className="text-lg">{tool.emoji}</span>
          <span className="text-xs font-medium text-center">{tool.label}</span>
        </button>
      ))}
    </div>
  );
}

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

export function MobileSheet({ isOpen, onClose, children, title }: SheetProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 rounded-t-lg z-50 md:hidden max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <h3 className="text-white font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">{children}</div>
      </div>
    </>
  );
}
