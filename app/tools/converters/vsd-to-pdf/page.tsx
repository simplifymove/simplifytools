'use client';

import ConverterTemplate from '@/app/components/ConverterTemplate';

export default function VsdToPdf() {
  return (
    <ConverterTemplate
      title="VSD to PDF"
      description="Convert Visio VSD diagrams to PDF format"
      fromFormat="vsd"
      toFormat="pdf"
      acceptFormats=".vsd"
      optionInputs={[]}
    />
  );
}
