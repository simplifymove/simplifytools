'use client';

import ConverterTemplate from '@/app/components/ConverterTemplate';

export default function VsdToPptx() {
  return (
    <ConverterTemplate
      title="VSD to PPTX"
      description="Convert Visio VSD diagrams to PowerPoint PPTX format"
      fromFormat="vsd"
      toFormat="pptx"
      acceptFormats=".vsd"
      optionInputs={[]}
    />
  );
}
