'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PdfEdit } from '@/app/types/pdf-editor';

interface Props {
  edit?: PdfEdit;
  isActive: boolean;
  onUpdate?: (updates: Partial<PdfEdit>) => void;
  onCreateNew?: (text: string, x: number, y: number) => void;
}

export default function TextTool({ edit, isActive, onUpdate, onCreateNew }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempText, setTempText] = useState(edit?.text || '');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTempText(edit?.text || '');
    if (edit && isActive) {
      setIsEditing(true);
    }
  }, [edit, isActive]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSaveText = () => {
    if (edit) {
      onUpdate?.({ text: tempText });
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSaveText();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setTempText(edit?.text || '');
    }
  };

  // When text tool is active but no edit selected, show helper
  if (isActive && !edit) {
    return (
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-900 border-2 border-blue-500 rounded-lg p-3 text-white text-sm">
        <p>Click and drag to create a text box, then type</p>
      </div>
    );
  }

  // When editing an existing text edit
  if (isEditing && edit) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-gray-900 border-2 border-blue-500 rounded-lg p-6 w-96 max-h-96 flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-white">Edit Text</h3>
          
          <textarea
            ref={inputRef}
            value={tempText}
            onChange={(e) => setTempText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded focus:border-blue-500 focus:outline-none resize-none"
            placeholder="Enter text..."
          />

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setIsEditing(false);
                setTempText(edit.text || '');
              }}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveText}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Save (Ctrl+Enter)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
