'use client';

import ConverterTemplate from '@/app/components/ConverterTemplate';

export default function PsdToJpg() {
  return (
    <ConverterTemplate
      title="PSD to JPG"
      description="Convert Photoshop PSD files to JPG images"
      fromFormat="psd"
      toFormat="jpg"
      acceptFormats=".psd"
      defaultOptions={{ quality: 85 }}
      optionInputs={[
        {
          key: 'quality',
          label: 'Quality',
          type: 'slider',
          min: 50,
          max: 100,
          defaultValue: 85,
        }
      ]}
    />
  );
}
