'use client';

import ConverterTemplate from '@/app/components/ConverterTemplate';

export default function VsdxToPdf() {
  return (
    <ConverterTemplate
      title="VSDX to PDF"
      description="Convert Visio VSDX diagrams to PDF format"
      fromFormat="vsdx"
      toFormat="pdf"
      acceptFormats=".vsdx"
      optionInputs={[]}
    />
  );
}
