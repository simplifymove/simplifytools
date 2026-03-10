'use client';

import ConverterTemplate from '@/app/components/ConverterTemplate';

export default function VsdxToPptx() {
  return (
    <ConverterTemplate
      title="VSDX to PPTX"
      description="Convert Visio VSDX diagrams to PowerPoint PPTX format"
      fromFormat="vsdx"
      toFormat="pptx"
      acceptFormats=".vsdx"
      optionInputs={[]}
    />
  );
}
