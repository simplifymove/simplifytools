'use client';

import React, { useState, useMemo } from 'react';
import { Search, Edit2, X, CheckCircle, AlertCircle } from 'lucide-react';
import { ExtractedText, searchText, replaceText } from '@/app/lib/pdf-editor/textExtraction';

interface TextExtractionPanelProps {
  textItems: ExtractedText[];
  currentPage: number;
  isOpen: boolean;
  onClose: () => void;
  onTextEdit: (textId: string, newText: string) => void;
  editedTexts: Record<string, string>;
  isLoading?: boolean;
  error?: string | null;
}

export default function TextExtractionPanel({
  textItems,
  currentPage,
  isOpen,
  onClose,
  onTextEdit,
  editedTexts,
  isLoading = false,
  error = null,
}: TextExtractionPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Filter text by current page and search query
  const filteredItems = useMemo(() => {
    let items = textItems.filter((item) => item.pageNumber === currentPage);
    if (searchQuery) {
      items = searchText(items, searchQuery);
    }
    return items;
  }, [textItems, currentPage, searchQuery]);

  const handleEditStart = (item: ExtractedText) => {
    setEditingId(item.id);
    setEditValue(editedTexts[item.id] || item.text);
  };

  const handleEditSave = () => {
    if (editingId && editValue.trim()) {
      onTextEdit(editingId, editValue);
      setEditingId(null);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  // Count edited items
  const editedCount = Object.keys(editedTexts).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-gray-900 border-2 border-blue-500 rounded-lg w-96 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 shrink-0">
          <h3 className="text-lg font-semibold text-white">Edit Text</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 text-xs text-gray-400 shrink-0">
          <div className="flex justify-between">
            <span>
              {filteredItems.length} text items on page {currentPage}
            </span>
            {editedCount > 0 && (
              <span className="text-blue-400 font-medium flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {editedCount} edited
              </span>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="px-4 py-3 bg-red-900/30 border-b border-red-700 text-sm text-red-300 flex items-start gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="px-4 py-3 border-b border-gray-700 shrink-0">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Text Items List */}
        <div className="flex-1 overflow-y-auto p-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-xs text-gray-400">Extracting text...</p>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-8">
              {searchQuery
                ? 'No text items match your search'
                : 'No text items found on this page'}
            </p>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => {
                const isEditing = editingId === item.id;
                const isEdited = editedTexts[item.id];
                const displayText = editedTexts[item.id] || item.text;

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded border transition ${
                      isEditing
                        ? 'border-blue-500 bg-blue-900/20'
                        : isEdited
                        ? 'border-green-500 bg-green-900/10'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                  >
                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full px-2 py-1 bg-gray-900 border border-gray-600 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleEditSave}
                            className="flex-1 px-2 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="flex-1 px-2 py-1 text-xs font-medium bg-gray-700 hover:bg-gray-600 text-white rounded transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white wrap-break-word line-clamp-3">
                            {displayText}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.fontSize}pt • {item.fontName}
                          </p>
                        </div>
                        {isEdited && (
                          <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-1" />
                        )}
                        <button
                          onClick={() => handleEditStart(item)}
                          className="p-1 text-gray-400 hover:text-blue-400 transition shrink-0"
                          title="Edit text"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-700 flex gap-2 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium bg-gray-700 hover:bg-gray-600 text-white rounded transition"
          >
            Close
          </button>
          {editedCount > 0 && (
            <div className="flex-1 text-xs text-green-400 font-medium flex items-center justify-center bg-green-900/20 rounded">
              {editedCount} changes ready
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
