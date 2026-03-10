import ConverterTemplate from '@/app/components/ConverterTemplate';

export const metadata = {
  title: 'TIFF to JPG Converter',
  description: 'Convert TIFF images to JPG format',
};

export default function Page() {
  return (
    <ConverterTemplate
      title="TIFF to JPG Converter"
      description="Convert TIFF images to JPG format for web distribution."
      fromFormat="tiff"
      toFormat="jpg"
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
