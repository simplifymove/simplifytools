import ConverterTemplate from '@/app/components/ConverterTemplate';

export const metadata = {
  title: 'GIF to PNG Converter',
  description: 'Convert GIF images to PNG format',
};

export default function Page() {
  return (
    <ConverterTemplate
      title="GIF to PNG Converter"
      description="Convert GIF images to PNG format. First frame of animated GIFs will be used."
      fromFormat="gif"
      toFormat="png"
      acceptFormats=".gif"
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
