'use client';

import ConverterTemplate from '@/app/components/ConverterTemplate';

export default function TiffToSvg() {
  return (
    <ConverterTemplate
      title="TIFF to SVG"
      description="Convert TIFF images to scalable vector graphics"
      fromFormat="tiff"
      toFormat="svg"
      acceptFormats=".tiff,.tif"
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
