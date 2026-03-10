'use client';

import ConverterTemplate from '@/app/components/ConverterTemplate';

export default function ImageToText() {
  return (
    <ConverterTemplate
      title="Image to Text"
      description="Extract text from images using OCR"
      fromFormat="image"
      toFormat="txt"
      acceptFormats=".jpg,.jpeg,.png,.webp,.tiff,.tif"
      defaultOptions={{ language: 'eng', deskew: false, output_format: 'txt' }}
      optionInputs={[
        {
          key: 'language',
          label: 'Language',
          type: 'select',
          options: [
            { label: 'English', value: 'eng' },
            { label: 'Spanish', value: 'spa' },
            { label: 'French', value: 'fra' },
            { label: 'German', value: 'deu' },
            { label: 'Chinese', value: 'chi_sim' },
          ],
          defaultValue: 'eng',
        },
        {
          key: 'output_format',
          label: 'Output Format',
          type: 'select',
          options: [
            { label: 'Plain Text', value: 'txt' },
            { label: 'PDF', value: 'pdf' }
          ],
          defaultValue: 'txt',
        }
      ]}
    />
  );
}
