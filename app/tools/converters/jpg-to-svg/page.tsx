'use client';

import ConverterTemplate from '@/app/components/ConverterTemplate';

export default function JpgToSvg() {
  return (
    <ConverterTemplate
      title="JPG to SVG"
      description="Convert JPG images to scalable vector graphics"
      fromFormat="jpg"
      toFormat="svg"
      acceptFormats=".jpg,.jpeg"
      defaultOptions={{ corner_threshold: 100, curve_optimize: 2, color_optimize: true }}
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
