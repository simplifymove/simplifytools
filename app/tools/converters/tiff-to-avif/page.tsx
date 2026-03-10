import ConverterTemplate from '@/app/components/ConverterTemplate';

export const metadata = {
  title: 'TIFF to AVIF Converter',
  description: 'Convert TIFF images to AVIF format',
};

export default function Page() {
  return (
    <ConverterTemplate
      title="TIFF to AVIF Converter"
      description="Convert TIFF images to AVIF format for modern compression."
      fromFormat="tiff"
      toFormat="avif"
      acceptFormats=".tiff,.tif"
      defaultOptions={{ quality: 85 }}
      optionInputs={[
        {
          key: 'quality',
          label: 'Output Quality',
          type: 'slider',
          min: 60,
          max: 95,
          step: 5,
          defaultValue: 85,
        },
      ]}
    />
  );
}
