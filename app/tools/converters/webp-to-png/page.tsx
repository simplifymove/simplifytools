import ConverterTemplate from '@/app/components/ConverterTemplate';

export const metadata = {
  title: 'WebP to PNG Converter',
  description: 'Convert WebP images to PNG format with transparency support',
};

export default function Page() {
  return (
    <ConverterTemplate
      title="WebP to PNG Converter"
      description="Convert WebP images to PNG format while preserving transparency."
      fromFormat="webp"
      toFormat="png"
      acceptFormats=".webp"
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
