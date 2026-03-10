import ConverterTemplate from '@/app/components/ConverterTemplate';

export const metadata = {
  title: 'HEIC to AVIF Converter',
  description: 'Convert HEIC images to AVIF format',
};

export default function Page() {
  return (
    <ConverterTemplate
      title="HEIC to AVIF Converter"
      description="Convert HEIC images to AVIF format for modern web and superior quality."
      fromFormat="heic"
      toFormat="avif"
      acceptFormats=".heic,.heif"
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
