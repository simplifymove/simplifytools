import ConverterTemplate from '@/app/components/ConverterTemplate';

export const metadata = {
  title: 'HEIC to PNG Converter',
  description: 'Convert HEIC images to PNG format with transparency',
};

export default function Page() {
  return (
    <ConverterTemplate
      title="HEIC to PNG Converter"
      description="Convert HEIC images to PNG format while preserving transparency."
      fromFormat="heic"
      toFormat="png"
      acceptFormats=".heic,.heif"
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
