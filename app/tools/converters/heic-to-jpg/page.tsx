import ConverterTemplate from '@/app/components/ConverterTemplate';

export const metadata = {
  title: 'HEIC to JPG Converter',
  description: 'Convert HEIC images from iPhone to JPG format',
};

export default function Page() {
  return (
    <ConverterTemplate
      title="HEIC to JPG Converter"
      description="Convert HEIC images (iPhone format) to JPG for universal compatibility."
      fromFormat="heic"
      toFormat="jpg"
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
