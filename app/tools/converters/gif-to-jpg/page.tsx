import ConverterTemplate from '@/app/components/ConverterTemplate';

export const metadata = {
  title: 'GIF to JPG Converter',
  description: 'Convert GIF images to JPG format',
};

export default function Page() {
  return (
    <ConverterTemplate
      title="GIF to JPG Converter"
      description="Convert GIF images to JPG format. First frame of animated GIFs will be used."
      fromFormat="gif"
      toFormat="jpg"
      acceptFormats=".gif"
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
