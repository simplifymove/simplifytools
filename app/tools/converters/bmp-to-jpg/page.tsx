import ConverterTemplate from '@/app/components/ConverterTemplate';

export const metadata = {
  title: 'BMP to JPG Converter',
  description: 'Convert BMP images to JPG format',
};

export default function Page() {
  return (
    <ConverterTemplate
      title="BMP to JPG Converter"
      description="Convert BMP images to JPG format for smaller file sizes."
      fromFormat="bmp"
      toFormat="jpg"
      acceptFormats=".bmp"
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
