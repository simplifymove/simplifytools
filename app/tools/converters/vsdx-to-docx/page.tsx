'use client';

import ConverterTemplate from '@/app/components/ConverterTemplate';

export default function VsdxToDocx() {
  return (
    <ConverterTemplate
      title="VSDX to DOCX"
      description="Convert Visio VSDX diagrams to Word DOCX format"
      fromFormat="vsdx"
      toFormat="docx"
      acceptFormats=".vsdx"
      optionInputs={[]}
    />
  );
}
