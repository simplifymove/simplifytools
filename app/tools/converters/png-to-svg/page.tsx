'use client';

import ConverterTemplate from '@/app/components/ConverterTemplate';

export default function PngToSvg() {
  return (
    <ConverterTemplate
      title="PNG to SVG"
      description="Convert PNG images to scalable vector graphics"
      fromFormat="png"
      toFormat="svg"
      acceptFormats=".png"
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
