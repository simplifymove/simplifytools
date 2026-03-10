import ConverterTemplate from '@/app/components/ConverterTemplate';

export const metadata = {
  title: 'PNG to AVIF Converter',
  description: 'Convert PNG images to AVIF format',
};

export default function Page() {
  return (
    <ConverterTemplate
      title="PNG to AVIF Converter"
      description="Convert PNG images to AVIF format for superior compression with transparency support."
      fromFormat="png"
      toFormat="avif"
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
