import ConverterTemplate from '@/app/components/ConverterTemplate';

export const metadata = {
  title: 'BMP to PNG Converter',
  description: 'Convert BMP images to PNG format',
};

export default function Page() {
  return (
    <ConverterTemplate
      title="BMP to PNG Converter"
      description="Convert BMP images to PNG format with lossless compression."
      fromFormat="bmp"
      toFormat="png"
      acceptFormats=".bmp"
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
