import ConverterTemplate from '@/app/components/ConverterTemplate';

export const metadata = {
  title: 'WebP to JPG Converter',
  description: 'Convert WebP images to JPG format',
};

export default function Page() {
  return (
    <ConverterTemplate
      title="WebP to JPG Converter"
      description="Convert WebP images to JPG format. Perfect for compatibility with older systems."
      fromFormat="webp"
      toFormat="jpg"
      acceptFormats=".webp"
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
