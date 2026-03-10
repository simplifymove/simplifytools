import ConverterTemplate from '@/app/components/ConverterTemplate';

export const metadata = {
  title: 'JPG to WebP Converter',
  description: 'Convert JPG images to modern WebP format',
};

export default function Page() {
  return (
    <ConverterTemplate
      title="JPG to WebP Converter"
      description="Convert JPG images to WebP format for better compression and modern web compatibility."
      fromFormat="jpg"
      toFormat="webp"
      acceptFormats=".jpg,.jpeg"
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
