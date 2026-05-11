'use client';

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Mouse,
  Type,
  Square,
  Highlighter,
  Image,
  Signature,
  PenTool,
  Save,
  Menu,
  Settings,
  FileText,
} from 'lucide-react';

interface Props {
  currentPage: number;
  totalPages: number;
  zoom: number;
  activeTool: string;
  canUndo: boolean;
  canRedo: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  onToolSelect?: (tool: string) => void;
  onSave?: () => void;
  onExtractText?: () => void;
  isExtractingText?: boolean;
  onMobileMenu?: () => void;
  onMobileProperties?: () => void;
}

const TOOLS = [
  { id: 'select', label: 'Select', icon: Mouse, tooltip: 'Select and move' },
  { id: 'text', label: 'Text', icon: Type, tooltip: 'Add text' },
  { id: 'shape', label: 'Shape', icon: Square, tooltip: 'Draw shapes' },
  { id: 'highlight', label: 'Highlight', icon: Highlighter, tooltip: 'Highlight text' },
  { id: 'drawing', label: 'Draw', icon: PenTool, tooltip: 'Draw freely' },
  { id: 'image', label: 'Image', icon: Image, tooltip: 'Add image' },
  { id: 'signature', label: 'Sign', icon: Signature, tooltip: 'Add signature' },
];

export default function Toolbar({
  currentPage,
  totalPages,
  zoom,
  activeTool,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onPrevPage,
  onNextPage,
  onToolSelect,
  onSave,
  onExtractText,
  isExtractingText,
  onMobileMenu,
  onMobileProperties,
}: Props) {
  return (
    <div className="bg-gray-800 border-b border-gray-700 flex flex-col gap-3 p-3">
      {/* Main Toolbar */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
            title="Redo (Ctrl+Y)"
          >
            <RotateCw className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-600" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={onZoomOut}
            className="p-2 hover:bg-gray-700 rounded transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-white" />
          </button>
          <span className="text-white text-xs w-10 text-center font-medium">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            className="p-2 hover:bg-gray-700 rounded transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-600" />

        {/* Page Navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={onPrevPage}
            disabled={currentPage === 1}
            className="p-2 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <span className="text-white text-xs font-medium px-2">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={onNextPage}
            disabled={currentPage === totalPages}
            className="p-2 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Mobile Menu Button (visible on mobile only) */}
        <button
          onClick={onMobileMenu}
          className="p-2 hover:bg-gray-700 rounded transition md:hidden"
          title="Tools menu"
        >
          <Menu className="w-4 h-4 text-white" />
        </button>

        {/* Mobile Properties Button (visible on mobile only) */}
        <button
          onClick={onMobileProperties}
          className="p-2 hover:bg-gray-700 rounded transition md:hidden"
          title="Properties"
        >
          <Settings className="w-4 h-4 text-white" />
        </button>

        {/* Extract Text Button */}
        <button
          onClick={onExtractText}
          disabled={isExtractingText}
          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-medium text-sm flex items-center gap-2 transition"
          title="Extract and edit existing PDF text"
        >
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">
            {isExtractingText ? 'Extracting...' : 'Extract Text'}
          </span>
        </button>

        {/* Save Button */}
        <button
          onClick={onSave}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm flex items-center gap-2 transition"
        >
          <Save className="w-4 h-4" />
          <span className="hidden sm:inline">Save</span>
        </button>
      </div>

      {/* Tools Toolbar (hidden on mobile) */}
      <div className="hidden md:flex items-center gap-1 overflow-x-auto pb-1">
        <span className="text-gray-400 text-xs font-medium px-2 shrink-0">Tools:</span>
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => onToolSelect?.(tool.id)}
              className={`p-2 rounded transition whitespace-nowrap text-xs font-medium flex items-center gap-1.5 ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title={tool.tooltip}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tool.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
