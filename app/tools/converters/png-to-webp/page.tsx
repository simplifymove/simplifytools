import ConverterTemplate from '@/app/components/ConverterTemplate';

export const metadata = {
  title: 'PNG to WebP Converter',
  description: 'Convert PNG images to WebP format',
};

export default function Page() {
  return (
    <ConverterTemplate
      title="PNG to WebP Converter"
      description="Convert PNG images to WebP format for smaller file sizes with better compression."
      fromFormat="png"
      toFormat="webp"
      acceptFormats=".png"
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
