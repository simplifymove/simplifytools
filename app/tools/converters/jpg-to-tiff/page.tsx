import ConverterTemplate from '@/app/components/ConverterTemplate';

export const metadata = {
  title: 'JPG to TIFF Converter',
  description: 'Convert JPG images to TIFF format',
};

export default function Page() {
  return (
    <ConverterTemplate
      title="JPG to TIFF Converter"
      description="Convert JPG images to TIFF format for professional use and archival."
      fromFormat="jpg"
      toFormat="tiff"
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
