import ConverterTemplate from '@/app/components/ConverterTemplate';

export const metadata = {
  title: 'PNG to JPG Converter',
  description: 'Convert PNG images to JPG format with quality control',
};

export default function Page() {
  return (
    <ConverterTemplate
      title="PNG to JPG Converter"
      description="Convert your PNG images to JPG format with customizable quality. JPG is ideal for photographs."
      fromFormat="png"
      toFormat="jpg"
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
