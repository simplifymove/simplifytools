import ConverterTemplate from '@/app/components/ConverterTemplate';

export const metadata = {
  title: 'JPG to AVIF Converter',
  description: 'Convert JPG images to modern AVIF format',
};

export default function Page() {
  return (
    <ConverterTemplate
      title="JPG to AVIF Converter"
      description="Convert JPG images to AVIF format for next-gen compression and superior quality."
      fromFormat="jpg"
      toFormat="avif"
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
