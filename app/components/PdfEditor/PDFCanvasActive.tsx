'use client';

import React from 'react';

import LegacyPDFCanvas from './PDFCanvas';
import PDFCanvasV2 from './PDFCanvasV2';

type LegacyProps = React.ComponentProps<typeof LegacyPDFCanvas>;

type Props = LegacyProps & {
  onToolChange?: (tool: string) => void;
};

const USE_PDF_CANVAS_V2 =
  process.env.NEXT_PUBLIC_PDF_EDITOR_V2 !== 'false';

export default function PDFCanvasActive({
  onToolChange,
  ...props
}: Props) {
  if (USE_PDF_CANVAS_V2) {
    return (
      <PDFCanvasV2
        {...props}
        onToolChange={onToolChange}
      />
    );
  }

  return <LegacyPDFCanvas {...props} />;
}
