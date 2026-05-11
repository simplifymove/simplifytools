'use client';

import React, { useState } from 'react';
import { PdfEdit } from '@/app/types/pdf-editor';
import { Link2, ExternalLink } from 'lucide-react';

interface Props {
  isActive: boolean;
  edit?: PdfEdit;
  onUpdate?: (updates: Partial<PdfEdit>) => void;
}

export default function LinkTool({ isActive, edit, onUpdate }: Props) {
  const [url, setUrl] = useState(edit?.url || '');
  const [linkType, setLinkType] = useState<'external' | 'internal'>(
    edit?.linkType || 'external'
  );
  const [showPreview, setShowPreview] = useState(true);

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    onUpdate?.({ url: newUrl });
  };

  const handleLinkTypeChange = (type: 'external' | 'internal') => {
    setLinkType(type);
    onUpdate?.({ linkType: type });
  };

  // When link tool is active but no edit selected, show helper
  if (isActive && !edit) {
    return (
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-900 border-2 border-blue-500 rounded-lg p-4 text-white text-sm max-w-md">
        <div className="flex items-center gap-2 mb-3">
          <Link2 className="w-4 h-4" />
          <p>Click and drag to create a link area</p>
        </div>

        <div className="bg-blue-900/30 border border-blue-500 rounded p-3 text-xs text-blue-200">
          <p>💡 After creating a link area, select it to edit the URL.</p>
        </div>
      </div>
    );
  }

  // When editing an existing link edit
  if (edit && edit.type === 'link') {
    return (
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-900 border-2 border-blue-500 rounded-lg p-4 text-white text-sm max-w-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Link Properties</h3>
        </div>

        <div className="space-y-3">
          {/* Link Type */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">
              Link Type
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleLinkTypeChange('external')}
                className={`flex-1 px-3 py-2 rounded transition text-xs flex items-center justify-center gap-1 ${
                  linkType === 'external'
                    ? 'bg-blue-600 border-blue-400'
                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                } border`}
              >
                <ExternalLink className="w-3 h-3" />
                External
              </button>
              <button
                onClick={() => handleLinkTypeChange('internal')}
                className={`flex-1 px-3 py-2 rounded transition text-xs border ${
                  linkType === 'internal'
                    ? 'bg-blue-600 border-blue-400'
                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                }`}
              >
                Internal
              </button>
            </div>
          </div>

          {/* URL Input */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">
              {linkType === 'external' ? 'URL' : 'Page Number'}
            </label>
            <input
              type={linkType === 'external' ? 'url' : 'number'}
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder={
                linkType === 'external'
                  ? 'https://example.com'
                  : 'Enter page number'
              }
              className="w-full px-3 py-2 text-sm bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Link Preview */}
          {showPreview && url && (
            <div className="bg-gray-800 border border-gray-600 rounded p-3">
              <p className="text-xs text-gray-400 mb-1">Preview:</p>
              <p className="text-xs text-blue-400 break-all">{url}</p>
            </div>
          )}

          {/* Opacity */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-400">Opacity</label>
              <span className="text-xs text-gray-300">{Math.round((edit.opacity ?? 1) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={(edit.opacity ?? 1) * 100}
              onChange={(e) => onUpdate?.({ opacity: parseFloat(e.target.value) / 100 })}
              className="w-full"
            />
          </div>

          {/* Info */}
          <div className="bg-blue-900/30 border border-blue-500 rounded p-2 text-xs text-blue-200">
            <p>💡 Links are clickable areas on the PDF. Set opacity to 0% to make invisible.</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
