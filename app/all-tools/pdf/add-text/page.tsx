'use client';

import PdfToolPage from '../[slug]/page';

const addTextParams = Promise.resolve({ slug: 'add-text' });

export default function AddTextToPdfPage() {
  return <PdfToolPage params={addTextParams} />;
}
