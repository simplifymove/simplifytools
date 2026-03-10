'use client';

import ConverterTemplate from '@/app/components/ConverterTemplate';

export default function PsdToSvg() {
  return (
    <ConverterTemplate
      title="PSD to SVG"
      description="Convert Photoshop PSD to scalable vector graphics via PNG tracing"
      fromFormat="psd"
      toFormat="svg"
      acceptFormats=".psd"
      defaultOptions={{ corner_threshold: 100, curve_optimize: 2 }}
      optionInputs={[
        {
          key: 'corner_threshold',
          label: 'Corner Threshold',
          type: 'slider',
          min: 1,
          max: 180,
          defaultValue: 100,
        },
        {
          key: 'curve_optimize',
          label: 'Curve Optimization',
          type: 'slider',
          min: 0,
          max: 3,
          defaultValue: 2,
        }
      ]}
    />
  );
}
