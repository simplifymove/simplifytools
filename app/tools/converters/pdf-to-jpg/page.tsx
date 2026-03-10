import ConverterTemplate from '@/app/components/ConverterTemplate';

export const metadata = {
  title: 'PDF to JPG Converter',
  description: 'Convert PDF pages to JPG images with quality and DPI control',
};

export default function PdfToJpgPage() {
  return (
    <ConverterTemplate
      title="PDF to JPG Converter"
      description="Convert PDF pages to JPG images. Control DPI for print or web quality. Multi-page PDFs will be converted with each page as a separate image."
      fromFormat="pdf"
      toFormat="jpg"
      acceptFormats=".pdf"
      defaultOptions={{
        dpi: 300,
        quality: 85,
      }}
      optionInputs={[
        {
          key: 'dpi',
          label: 'DPI Resolution',
          type: 'select',
          options: [
            { label: 'Web (150 DPI)', value: 150 },
            { label: 'Standard (300 DPI)', value: 300 },
            { label: 'High Quality (600 DPI)', value: 600 },
          ],
          defaultValue: 300,
        },
        {
          key: 'quality',
          label: 'JPG Quality',
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
