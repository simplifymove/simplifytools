import ConverterTemplate from '@/app/components/ConverterTemplate';

export const metadata = {
  title: 'TIFF to PNG Converter',
  description: 'Convert TIFF images to PNG format',
};

export default function Page() {
  return (
    <ConverterTemplate
      title="TIFF to PNG Converter"
      description="Convert TIFF images to PNG format with lossless compression."
      fromFormat="tiff"
      toFormat="png"
      acceptFormats=".tiff,.tif"
      defaultOptions={{ quality: 90 }}
      optionInputs={[
        {
          key: 'quality',
          label: 'Output Quality',
          type: 'slider',
          min: 10,
          max: 100,
          step: 5,
          defaultValue: 90,
        },
      ]}
    />
  );
}
