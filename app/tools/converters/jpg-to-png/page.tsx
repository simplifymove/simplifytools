import ConverterTemplate from '@/app/components/ConverterTemplate';

export const metadata = {
  title: 'JPG to PNG Converter',
  description: 'Convert JPG images to PNG format with quality control',
};

export default function JpgToPngPage() {
  return (
    <ConverterTemplate
      title="JPG to PNG Converter"
      description="Convert your JPG images to PNG format with customizable quality and optional resizing. PNG supports transparency and lossless compression."
      fromFormat="jpg"
      toFormat="png"
      acceptFormats=".jpg,.jpeg"
      defaultOptions={{
        quality: 90,
      }}
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
