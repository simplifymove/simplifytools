import ConverterTemplate from '@/app/components/ConverterTemplate';

export const metadata = {
  title: 'PNG to TIFF Converter',
  description: 'Convert PNG images to TIFF format',
};

export default function Page() {
  return (
    <ConverterTemplate
      title="PNG to TIFF Converter"
      description="Convert PNG images to TIFF format - ideal for professional photography and archival."
      fromFormat="png"
      toFormat="tiff"
      acceptFormats=".png"
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
