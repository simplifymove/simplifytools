'use client';

import ConverterTemplate from '@/app/components/ConverterTemplate';

export default function PsdToPng() {
  return (
    <ConverterTemplate
      title="PSD to PNG"
      description="Convert Photoshop PSD files to PNG images"
      fromFormat="psd"
      toFormat="png"
      acceptFormats=".psd"
      defaultOptions={{ compress: 6 }}
      optionInputs={[
        {
          key: 'compress',
          label: 'Compression',
          type: 'slider',
          min: 0,
          max: 9,
          defaultValue: 6,
        }
      ]}
    />
  );
}
