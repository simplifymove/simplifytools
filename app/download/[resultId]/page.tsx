import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, Clock3, Download, File, LockKeyhole } from 'lucide-react';
import { Footer } from '@/app/components/Footer';
import { HomeHeader } from '@/app/components/HomeHeader';
import { allTools } from '@/app/data/tools';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Your File Is Ready | SimplifyConvert',
  description: 'Securely download your temporary SimplifyConvert result.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

interface DownloadResultPageProps {
  params: Promise<{ resultId: string }>;
}

function formatFileSize(fileSize: bigint | null): string {
  if (fileSize === null) return 'Size unavailable';
  const bytes = Number(fileSize);
  if (!Number.isSafeInteger(bytes)) return `${fileSize.toString()} bytes`;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

function AdvertisementPlaceholder() {
  return (
    <div
      aria-label="Reserved advertisement space"
      className="mx-auto flex min-h-24 max-w-4xl items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 text-xs font-medium uppercase tracking-widest text-gray-400"
    >
      Advertisement
    </div>
  );
}

export default async function DownloadResultPage({ params }: DownloadResultPageProps) {
  const { resultId } = await params;
  const result = await prisma.toolDownloadResult.findUnique({
    where: { id: resultId },
    select: {
      id: true,
      toolSlug: true,
      originalName: true,
      outputName: true,
      mimeType: true,
      fileSize: true,
      status: true,
      createdAt: true,
      expiresAt: true,
      downloadCount: true,
    },
  });

  // This dynamic server page must compare expiry against the current request time.
  // eslint-disable-next-line react-hooks/purity
  const isAvailable = result?.status === 'READY' && result.expiresAt.getTime() > Date.now();
  const toolRoute = result
    ? allTools.find((tool) => tool.id === result.toolSlug && typeof tool.route === 'string')?.route
    : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <HomeHeader />

      <main className="px-4 py-12 md:px-8 md:py-16">
        <AdvertisementPlaceholder />

        <section className="mx-auto my-12 max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-xl shadow-slate-200/50 md:p-10">
          {isAvailable && result ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" aria-hidden="true" />
              <h1 className="mt-5 text-3xl font-bold text-gray-950">Your file is ready</h1>
              <p className="mt-2 text-gray-600">Your result is stored temporarily and ready to download.</p>

              <div className="mt-8 rounded-xl border border-gray-200 bg-slate-50 p-5 text-left">
                <div className="flex items-start gap-4">
                  <File className="mt-1 h-7 w-7 shrink-0 text-blue-600" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="break-words font-semibold text-gray-950">{result.outputName}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      {result.mimeType} · {formatFileSize(result.fileSize)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 border-t border-gray-200 pt-4 text-sm text-gray-600">
                  <Clock3 className="h-4 w-4" aria-hidden="true" />
                  Expires {result.expiresAt.toLocaleString()}
                </div>
              </div>

              <a
                href={`/api/download-result/${encodeURIComponent(result.id)}`}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
              >
                <Download className="h-5 w-5" aria-hidden="true" />
                Download File
              </a>

              <div className="mt-6 flex items-start gap-3 rounded-lg bg-blue-50 p-4 text-left text-sm text-blue-900">
                <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <p>Your file is private, is not indexed by search engines, and is removed after expiry.</p>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <Clock3 className="mx-auto h-14 w-14 text-amber-500" aria-hidden="true" />
              <h1 className="mt-5 text-3xl font-bold text-gray-950">File unavailable</h1>
              <p className="mx-auto mt-3 max-w-md text-gray-600">
                This download result was not found, has expired, or is no longer available. Process the file again to create a new result.
              </p>
            </div>
          )}
        </section>

        <AdvertisementPlaceholder />

        <nav aria-label="Download result actions" className="mx-auto mt-10 flex max-w-2xl justify-center">
          <Link
            href={toolRoute || '/all-tools'}
            className="font-semibold text-blue-700 hover:text-blue-800 hover:underline"
          >
            {toolRoute ? 'Process Another File' : 'Browse All Tools'}
          </Link>
        </nav>
      </main>

      <Footer />
    </div>
  );
}
