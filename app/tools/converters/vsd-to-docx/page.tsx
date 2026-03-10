'use client';

import ConverterTemplate from '@/app/components/ConverterTemplate';

export default function VsdToDocx() {
  return (
    <ConverterTemplate
      title="VSD to DOCX"
      description="Convert Visio VSD diagrams to Word DOCX format"
      fromFormat="vsd"
      toFormat="docx"
      acceptFormats=".vsd"
      optionInputs={[]}
    />
  );
}
