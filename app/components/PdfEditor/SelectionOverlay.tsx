'use client';

import React from 'react';
import type { ResizeHandle } from '@/app/lib/pdf-editor/interactionGeometry';

interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
  active?: boolean;
}

const handles: Array<{
  id: ResizeHandle;
  left: string;
  top: string;
  cursor: string;
}> = [
  { id: 'nw', left: '0%', top: '0%', cursor: 'nwse-resize' },
  { id: 'n', left: '50%', top: '0%', cursor: 'ns-resize' },
  { id: 'ne', left: '100%', top: '0%', cursor: 'nesw-resize' },
  { id: 'e', left: '100%', top: '50%', cursor: 'ew-resize' },
  { id: 'se', left: '100%', top: '100%', cursor: 'nwse-resize' },
  { id: 's', left: '50%', top: '100%', cursor: 'ns-resize' },
  { id: 'sw', left: '0%', top: '100%', cursor: 'nesw-resize' },
  { id: 'w', left: '0%', top: '50%', cursor: 'ew-resize' },
];

export default function SelectionOverlay({
  x,
  y,
  width,
  height,
  active = true,
}: Props) {
  if (!active) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute z-20 border border-orange-500"
      style={{
        left: x,
        top: y,
        width,
        height,
        boxShadow:
          '0 0 0 1px rgba(255,255,255,0.95), 0 0 0 2px rgba(249,115,22,0.20)',
      }}
    >
      {handles.map((handle) => (
        <span
          key={handle.id}
          data-pdf-resize-handle={handle.id}
          className="absolute h-3 w-3 rounded-[3px] border-2 border-orange-500 bg-white shadow-md"
          style={{
            left: handle.left,
            top: handle.top,
            cursor: handle.cursor,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
}
