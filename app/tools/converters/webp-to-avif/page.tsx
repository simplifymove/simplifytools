import ConverterTemplate from '@/app/components/ConverterTemplate';

export const metadata = {
  title: 'WebP to AVIF Converter',
  description: 'Convert WebP images to AVIF format',
};

export default function Page() {
  return (
    <ConverterTemplate
      title="WebP to AVIF Converter"
      description="Convert WebP images to AVIF format for maximum compression."
      fromFormat="webp"
      toFormat="avif"
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
