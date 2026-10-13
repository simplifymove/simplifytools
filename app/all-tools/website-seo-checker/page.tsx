'use client';

import { FormEvent, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Globe2,
  Search,
  ShieldCheck,
} from 'lucide-react';

import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';

import type {
  WebsiteSeoAuditResult,
} from '@/lib/website-seo/orchestrator';

const DEFAULT_MAX_PAGES = 25;

interface WebsiteSeoAuditSuccessResponse {
  success: true;
  result: WebsiteSeoAuditResult;
}

interface WebsiteSeoAuditErrorResponse {
  error?: string;
  errorCode?: string;
  retryAfterSeconds?: number;
}

type WebsiteSeoAuditApiResponse =
  | WebsiteSeoAuditSuccessResponse
  | WebsiteSeoAuditErrorResponse;

export default function WebsiteSeoCheckerPage() {
  const [url, setUrl] = useState('');
  const [maxPages, setMaxPages] = useState(DEFAULT_MAX_PAGES);
  const [formMessage, setFormMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [retryAfterSeconds, setRetryAfterSeconds] =
    useState<number | null>(null);
  const [auditResult, setAuditResult] =
    useState<WebsiteSeoAuditResult | null>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedUrl = url.trim();

    setFormMessage('');
    setApiError('');
    setRetryAfterSeconds(null);

    if (!normalizedUrl) {
      setFormMessage(
        'Enter a website URL to start the SEO audit.',
      );
      return;
    }

    setIsLoading(true);
    setAuditResult(null);

    try {
      const response =
        await fetch(
          '/api/website-seo/audit',
          {
            method: 'POST',
            headers: {
              'content-type':
                'application/json',
            },
            body: JSON.stringify({
              url: normalizedUrl,
              maxPages,
            }),
          },
        );

      const payload =
        (await response.json().catch(
          () => null,
        )) as
          | WebsiteSeoAuditApiResponse
          | null;

      if (!response.ok) {
        const errorPayload =
          payload as
            | WebsiteSeoAuditErrorResponse
            | null;

        if (
          response.status === 429 &&
          typeof errorPayload
            ?.retryAfterSeconds === 'number'
        ) {
          setRetryAfterSeconds(
            errorPayload.retryAfterSeconds,
          );
        }

        setApiError(
          errorPayload?.error ||
            'Unable to complete the website SEO audit.',
        );

        return;
      }

      if (
        !payload ||
        !('success' in payload) ||
        payload.success !== true ||
        !('result' in payload)
      ) {
        setApiError(
          'The website SEO audit returned an unexpected response.',
        );
        return;
      }

      setAuditResult(payload.result);
    } catch {
      setApiError(
        'Unable to connect to the Website SEO Checker. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <HomeHeader />

      <main>
        <section className="border-b border-slate-200 bg-gradient-to-b from-orange-50/70 to-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1.5 text-sm font-medium text-orange-700 shadow-sm">
                <Search className="h-4 w-4" />
                Website SEO audit
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Website SEO Checker
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Audit a website for technical and on-page SEO issues.
                Review crawl coverage, metadata, headings, canonicals,
                internal links, images, structured data, and other
                signals from one report.
              </p>
            </div>

            <div className="mt-10 max-w-4xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <form onSubmit={handleSubmit} noValidate>
                <label
                  htmlFor="website-seo-url"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Website URL
                </label>

                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Globe2
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="website-seo-url"
                      type="url"
                      inputMode="url"
                      autoComplete="url"
                      value={url}
                      disabled={isLoading}
                      onChange={(event) => {
                        setUrl(event.target.value);

                        if (formMessage) {
                          setFormMessage('');
                        }

                        if (apiError) {
                          setApiError('');
                        }

                        if (retryAfterSeconds !== null) {
                          setRetryAfterSeconds(null);
                        }
                      }}
                      placeholder="https://example.com"
                      className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 font-semibold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Search
                      className={
                        isLoading
                          ? 'h-5 w-5 animate-pulse'
                          : 'h-5 w-5'
                      }
                    />

                    {isLoading
                      ? 'Checking Website...'
                      : 'Check Website'}
                  </button>
                </div>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    Enter the public homepage or page URL you want to audit.
                  </p>

                  <label
                    htmlFor="website-seo-max-pages"
                    className="flex items-center gap-2 text-sm text-slate-600"
                  >
                    Pages to check

                    <select
                      id="website-seo-max-pages"
                      value={maxPages}
                      disabled={isLoading}
                      onChange={(event) =>
                        setMaxPages(Number(event.target.value))
                      }
                      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-medium text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </label>
                </div>

                {formMessage ? (
                  <div
                    role="status"
                    className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
                  >
                    <AlertTriangle
                      aria-hidden="true"
                      className="mt-0.5 h-4 w-4 shrink-0"
                    />
                    <span>{formMessage}</span>
                  </div>
                ) : null}

                {apiError ? (
                  <div
                    role="alert"
                    className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                  >
                    <AlertTriangle
                      aria-hidden="true"
                      className="mt-0.5 h-4 w-4 shrink-0"
                    />

                    <div>
                      <p>{apiError}</p>

                      {retryAfterSeconds !== null ? (
                        <p className="mt-1 text-red-700">
                          Try again in about{' '}
                          {retryAfterSeconds} seconds.
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </form>
            </div>

            <div className="mt-8 grid max-w-4xl gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <CheckCircle2 className="h-5 w-5 text-orange-500" />
                <p className="mt-3 font-semibold text-slate-900">
                  On-page checks
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Review titles, descriptions, headings, canonicals,
                  content, and images.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <Globe2 className="h-5 w-5 text-orange-500" />
                <p className="mt-3 font-semibold text-slate-900">
                  Crawl analysis
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Inspect crawl coverage, status codes, redirects,
                  internal links, and sitemap coverage.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <ShieldCheck className="h-5 w-5 text-orange-500" />
                <p className="mt-3 font-semibold text-slate-900">
                  Safe website checks
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Public website URLs are validated before the audit
                  fetches website content.
                </p>
              </div>
            </div>
          </div>
        </section>

        {auditResult ? (
          <section
            aria-labelledby="website-seo-audit-summary"
            className="border-b border-slate-200 bg-slate-50"
          >
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
              <div className="max-w-6xl">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <CheckCircle2
                        aria-hidden="true"
                        className="mt-0.5 h-6 w-6 shrink-0 text-green-600"
                      />

                      <div>
                        <h2
                          id="website-seo-audit-summary"
                          className="text-xl font-bold text-slate-950"
                        >
                          SEO audit completed
                        </h2>

                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          Review the crawl, indexability, issue severity,
                          content, image, and structured-data overview below.
                        </p>
                      </div>
                    </div>

                    {auditResult.crawl.truncated ? (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                        Crawl limit reached
                      </div>
                    ) : null}
                  </div>

                  <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 p-4">
                      <dt className="text-sm text-slate-500">
                        Pages crawled
                      </dt>
                      <dd className="mt-1 text-2xl font-bold text-slate-950">
                        {auditResult.crawl.crawledUrls}
                      </dd>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                      <dt className="text-sm text-slate-500">
                        Crawl failures
                      </dt>
                      <dd className="mt-1 text-2xl font-bold text-slate-950">
                        {auditResult.crawl.failedUrls}
                      </dd>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                      <dt className="text-sm text-slate-500">
                        SEO issues
                      </dt>
                      <dd className="mt-1 text-2xl font-bold text-slate-950">
                        {auditResult.analysis.issueSummary.total}
                      </dd>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                      <dt className="text-sm text-slate-500">
                        Sitemap URLs
                      </dt>
                      <dd className="mt-1 text-2xl font-bold text-slate-950">
                        {auditResult.sitemapComparison.sitemapUrlCount}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <h3 className="text-lg font-bold text-slate-950">
                      Issue severity
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                      Site-wide page-level findings grouped by severity.
                    </p>

                    <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-red-700">
                          Errors
                        </dt>
                        <dd className="mt-1 text-2xl font-bold text-red-800">
                          {auditResult.analysis.issueSummary.errors}
                        </dd>
                      </div>

                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                          Warnings
                        </dt>
                        <dd className="mt-1 text-2xl font-bold text-amber-800">
                          {auditResult.analysis.issueSummary.warnings}
                        </dd>
                      </div>

                      <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                          Opportunities
                        </dt>
                        <dd className="mt-1 text-2xl font-bold text-blue-800">
                          {auditResult.analysis.issueSummary.opportunities}
                        </dd>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Total
                        </dt>
                        <dd className="mt-1 text-2xl font-bold text-slate-900">
                          {auditResult.analysis.issueSummary.total}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <h3 className="text-lg font-bold text-slate-950">
                      Indexing directives
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                      Crawled pages grouped by detected noindex directives.
                    </p>

                    <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                        <dt className="text-sm font-medium text-green-700">
                          Pages without detected noindex
                        </dt>
                        <dd className="mt-1 text-2xl font-bold text-green-800">
                          {auditResult.analysis.indexableUrls.length}
                        </dd>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <dt className="text-sm font-medium text-slate-600">
                          Pages with detected noindex
                        </dt>
                        <dd className="mt-1 text-2xl font-bold text-slate-900">
                          {auditResult.analysis.nonIndexableUrls.length}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-4 rounded-xl border border-slate-200 px-4 py-3">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-slate-600">
                          Discovered URLs
                        </span>
                        <span className="font-semibold text-slate-900">
                          {auditResult.crawl.discoveredUrls}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-4">
                        <span className="text-sm text-slate-600">
                          Crawl maximum
                        </span>
                        <span className="font-semibold text-slate-900">
                          {auditResult.crawl.maxPages}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <h3 className="text-lg font-bold text-slate-950">
                    Content and page signals
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">
                    Aggregate content, image, and structured-data statistics
                    from the successfully analyzed pages.
                  </p>

                  <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 p-4">
                      <dt className="text-sm text-slate-500">
                        Average words
                      </dt>
                      <dd className="mt-1 text-xl font-bold text-slate-950">
                        {Math.round(
                          auditResult.analysis.averageWordCount,
                        )}
                      </dd>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                      <dt className="text-sm text-slate-500">
                        Total images
                      </dt>
                      <dd className="mt-1 text-xl font-bold text-slate-950">
                        {auditResult.analysis.totalImages}
                      </dd>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                      <dt className="text-sm text-slate-500">
                        Images missing alt
                      </dt>
                      <dd className="mt-1 text-xl font-bold text-slate-950">
                        {auditResult.analysis.imagesMissingAlt}
                      </dd>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                      <dt className="text-sm text-slate-500">
                        Structured data
                      </dt>
                      <dd className="mt-1 text-xl font-bold text-slate-950">
                        {auditResult.analysis.structuredDataBlocks}
                      </dd>
                    </div>
                  </dl>

                  {auditResult.analysis.invalidStructuredDataBlocks > 0 ? (
                    <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      <AlertTriangle
                        aria-hidden="true"
                        className="mt-0.5 h-4 w-4 shrink-0"
                      />

                      <span>
                        {
                          auditResult.analysis
                            .invalidStructuredDataBlocks
                        }{' '}
                        structured-data block
                        {auditResult.analysis
                          .invalidStructuredDataBlocks === 1
                          ? ''
                          : 's'}{' '}
                        could not be parsed successfully.
                      </span>
                    </div>
                  ) : null}

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-950">
                        Metadata and canonical diagnostics
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Review missing page metadata, duplicate SEO elements,
                        and canonical URL relationships across successfully crawled pages.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">
                        Missing titles
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-950">
                        {auditResult.analysis.missingTitleUrls.length}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">
                        Missing descriptions
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-950">
                        {
                          auditResult.analysis
                            .missingMetaDescriptionUrls.length
                        }
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">
                        Missing H1
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-950">
                        {auditResult.analysis.missingH1Urls.length}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">
                        Missing canonicals
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-950">
                        {auditResult.analysis.missingCanonicalUrls.length}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-5 lg:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 p-4">
                      <h4 className="font-semibold text-slate-900">
                        Duplicate titles
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        {
                          auditResult.analysis
                            .duplicateTitles.length
                        }{' '}
                        actionable group
                        {auditResult.analysis
                          .duplicateTitles.length === 1
                          ? ''
                          : 's'}
                      </p>

                      {auditResult.analysis.duplicateTitles.length > 0 ? (
                        <div className="mt-4 space-y-3">
                          {auditResult.analysis.duplicateTitles.map(
                            (group) => (
                              <div
                                key={`${group.value}-${group.urls.join('|')}`}
                                className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                              >
                                <p className="break-words text-sm font-medium text-slate-800">
                                  {group.value}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {group.count} pages
                                </p>

                                <ul className="mt-2 space-y-1">
                                  {group.urls.map((itemUrl) => (
                                    <li
                                      key={itemUrl}
                                      className="break-all text-xs text-slate-600"
                                    >
                                      {itemUrl}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <p className="mt-4 text-sm text-green-700">
                          No actionable duplicate titles detected.
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                      <h4 className="font-semibold text-slate-900">
                        Duplicate descriptions
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        {
                          auditResult.analysis
                            .duplicateMetaDescriptions.length
                        }{' '}
                        actionable group
                        {auditResult.analysis
                          .duplicateMetaDescriptions.length === 1
                          ? ''
                          : 's'}
                      </p>

                      {auditResult.analysis
                        .duplicateMetaDescriptions.length > 0 ? (
                        <div className="mt-4 space-y-3">
                          {auditResult.analysis
                            .duplicateMetaDescriptions.map(
                              (group) => (
                                <div
                                  key={`${group.value}-${group.urls.join('|')}`}
                                  className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                                >
                                  <p className="break-words text-sm font-medium text-slate-800">
                                    {group.value}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">
                                    {group.count} pages
                                  </p>

                                  <ul className="mt-2 space-y-1">
                                    {group.urls.map((itemUrl) => (
                                      <li
                                        key={itemUrl}
                                        className="break-all text-xs text-slate-600"
                                      >
                                        {itemUrl}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ),
                            )}
                        </div>
                      ) : (
                        <p className="mt-4 text-sm text-green-700">
                          No actionable duplicate descriptions detected.
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                      <h4 className="font-semibold text-slate-900">
                        Duplicate H1 headings
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        {
                          auditResult.analysis
                            .duplicateH1.length
                        }{' '}
                        actionable group
                        {auditResult.analysis
                          .duplicateH1.length === 1
                          ? ''
                          : 's'}
                      </p>

                      {auditResult.analysis.duplicateH1.length > 0 ? (
                        <div className="mt-4 space-y-3">
                          {auditResult.analysis.duplicateH1.map(
                            (group) => (
                              <div
                                key={`${group.value}-${group.urls.join('|')}`}
                                className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                              >
                                <p className="break-words text-sm font-medium text-slate-800">
                                  {group.value}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {group.count} pages
                                </p>

                                <ul className="mt-2 space-y-1">
                                  {group.urls.map((itemUrl) => (
                                    <li
                                      key={itemUrl}
                                      className="break-all text-xs text-slate-600"
                                    >
                                      {itemUrl}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <p className="mt-4 text-sm text-green-700">
                          No actionable duplicate H1 headings detected.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-5 lg:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 p-4">
                      <h4 className="font-semibold text-slate-900">
                        Missing metadata URLs
                      </h4>

                      {[
                        {
                          label: 'Missing title',
                          urls:
                            auditResult.analysis
                              .missingTitleUrls,
                        },
                        {
                          label: 'Missing meta description',
                          urls:
                            auditResult.analysis
                              .missingMetaDescriptionUrls,
                        },
                        {
                          label: 'Missing H1',
                          urls:
                            auditResult.analysis
                              .missingH1Urls,
                        },
                        {
                          label: 'Missing canonical',
                          urls:
                            auditResult.analysis
                              .missingCanonicalUrls,
                        },
                      ].map((group) => (
                        <div
                          key={group.label}
                          className="mt-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-slate-700">
                              {group.label}
                            </p>

                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                              {group.urls.length}
                            </span>
                          </div>

                          {group.urls.length > 0 ? (
                            <ul className="mt-2 max-h-36 space-y-1 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
                              {group.urls.map((itemUrl) => (
                                <li
                                  key={itemUrl}
                                  className="break-all text-xs text-slate-600"
                                >
                                  {itemUrl}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-2 text-xs text-green-700">
                              No affected URLs.
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                      <h4 className="font-semibold text-slate-900">
                        Canonical relationships
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        {
                          auditResult.analysis
                            .canonicalRelationships.length
                        }{' '}
                        canonical relationship
                        {auditResult.analysis
                          .canonicalRelationships.length === 1
                          ? ''
                          : 's'}{' '}
                        detected.
                      </p>

                      {auditResult.analysis
                        .canonicalRelationships.length > 0 ? (
                        <div className="mt-4 max-h-80 space-y-3 overflow-auto">
                          {auditResult.analysis
                            .canonicalRelationships.map(
                              (relationship) => (
                                <div
                                  key={`${relationship.url}-${relationship.canonical}`}
                                  className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                                >
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Page
                                  </p>

                                  <p className="mt-1 break-all text-xs text-slate-700">
                                    {relationship.url}
                                  </p>

                                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Canonical
                                  </p>

                                  <p className="mt-1 break-all text-xs text-slate-700">
                                    {relationship.canonical}
                                  </p>
                                </div>
                              ),
                            )}
                        </div>
                      ) : (
                        <p className="mt-4 text-sm text-slate-600">
                          No canonical relationships were available in this audit.
                        </p>
                      )}
                    </div>
                  </div>
                </div>                </div>
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-950">
                          Broken link diagnostics
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          Review internal URLs that failed during the crawl
                          and the crawled pages that referenced them.
                        </p>
                      </div>

                      <span className="inline-flex w-fit rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                        {
                          auditResult.analysis
                            .brokenInternalLinks.length
                        }{' '}
                        broken
                      </span>
                    </div>

                    {auditResult.analysis
                      .brokenInternalLinks.length > 0 ? (
                      <div className="mt-5 max-h-[32rem] space-y-3 overflow-auto pr-1">
                        {auditResult.analysis
                          .brokenInternalLinks.map(
                            (brokenLink) => (
                              <div
                                key={brokenLink.url}
                                className="rounded-xl border border-red-100 bg-red-50/40 p-4"
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-full border border-red-100 bg-white px-2.5 py-1 text-xs font-semibold text-red-700">
                                    {brokenLink.status === null
                                      ? 'No HTTP status'
                                      : `HTTP ${brokenLink.status}`}
                                  </span>

                                  {brokenLink.code ? (
                                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                                      {brokenLink.code}
                                    </span>
                                  ) : null}

                                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                                    {brokenLink.linkedFrom.length}{' '}
                                    referring page
                                    {brokenLink.linkedFrom.length === 1
                                      ? ''
                                      : 's'}
                                  </span>
                                </div>

                                <p className="mt-3 break-all text-sm font-semibold text-slate-900">
                                  {brokenLink.url}
                                </p>

                                {brokenLink.linkedFrom.length > 0 ? (
                                  <div className="mt-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                      Linked from
                                    </p>

                                    <ul className="mt-2 space-y-1">
                                      {brokenLink.linkedFrom.map(
                                        (sourceUrl) => (
                                          <li
                                            key={sourceUrl}
                                            className="break-all text-xs text-slate-600"
                                          >
                                            {sourceUrl}
                                          </li>
                                        ),
                                      )}
                                    </ul>
                                  </div>
                                ) : null}
                              </div>
                            ),
                          )}
                      </div>
                    ) : (
                      <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                        <p className="text-sm font-medium text-green-800">
                          No broken internal links were detected in the
                          crawled pages.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-950">
                          Redirect diagnostics
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          Review successful redirecting URLs, their final
                          destinations, and the redirect paths seen by the
                          crawler.
                        </p>
                      </div>

                      <span className="inline-flex w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                        {auditResult.analysis.redirects.length}{' '}
                        redirect
                        {auditResult.analysis.redirects.length === 1
                          ? ''
                          : 's'}
                      </span>
                    </div>

                    {auditResult.analysis.redirects.length > 0 ? (
                      <div className="mt-5 max-h-[32rem] space-y-3 overflow-auto pr-1">
                        {auditResult.analysis.redirects.map(
                          (redirect) => (
                            <div
                              key={`${redirect.requestedUrl}-${redirect.finalUrl}`}
                              className="rounded-xl border border-amber-100 bg-amber-50/40 p-4"
                            >
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Requested URL
                              </p>

                              <p className="mt-1 break-all text-sm font-semibold text-slate-900">
                                {redirect.requestedUrl}
                              </p>

                              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Final URL
                              </p>

                              <p className="mt-1 break-all text-sm text-slate-700">
                                {redirect.finalUrl}
                              </p>

                              <div className="mt-4 flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-amber-100 bg-white px-2.5 py-1 text-xs font-semibold text-amber-800">
                                  {redirect.redirectCount}{' '}
                                  redirect
                                  {redirect.redirectCount === 1
                                    ? ''
                                    : 's'}
                                </span>

                                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                                  {redirect.linkedFrom.length}{' '}
                                  referring page
                                  {redirect.linkedFrom.length === 1
                                    ? ''
                                    : 's'}
                                </span>
                              </div>

                              {redirect.redirectChain.length > 0 ? (
                                <div className="mt-4">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Redirect chain
                                  </p>

                                  <ol className="mt-2 space-y-2">
                                    {redirect.redirectChain.map(
                                      (
                                        redirectUrl,
                                        index,
                                      ) => (
                                        <li
                                          key={`${redirectUrl}-${index}`}
                                          className="flex gap-2 rounded-lg border border-slate-200 bg-white p-3"
                                        >
                                          <span className="shrink-0 text-xs font-semibold text-slate-500">
                                            {index + 1}.
                                          </span>

                                          <span className="break-all text-xs text-slate-700">
                                            {redirectUrl}
                                          </span>
                                        </li>
                                      ),
                                    )}
                                  </ol>
                                </div>
                              ) : null}

                              {redirect.linkedFrom.length > 0 ? (
                                <div className="mt-4">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Linked from
                                  </p>

                                  <ul className="mt-2 space-y-1">
                                    {redirect.linkedFrom.map(
                                      (sourceUrl) => (
                                        <li
                                          key={sourceUrl}
                                          className="break-all text-xs text-slate-600"
                                        >
                                          {sourceUrl}
                                        </li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                              ) : null}
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                        <p className="text-sm font-medium text-green-800">
                          No redirects were detected in the crawled pages.
                        </p>
                      </div>
                    )}

                    <div className="mt-8 grid gap-6 xl:grid-cols-2">
                      <section
                        aria-labelledby="website-seo-sitemap-coverage"
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
                          Sitemap coverage diagnostics
                        </p>

                        <h3
                          id="website-seo-sitemap-coverage"
                          className="mt-2 text-xl font-bold text-slate-900"
                        >
                          Sitemap and crawl coverage
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          Compare sitemap-discovered URLs with the pages that
                          were successfully crawled during this bounded audit.
                        </p>

                        {(auditResult.sitemapComparison.crawlTruncated ||
                          auditResult.sitemapComparison.discoveryTruncated) ? (
                          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                            <p className="text-sm font-semibold text-amber-900">
                              Coverage may be incomplete
                            </p>

                            <p className="mt-1 text-sm leading-6 text-amber-800">
                              Crawl or sitemap discovery limits were reached.
                              Treat missing coverage as diagnostic information,
                              not a final SEO error by itself.
                            </p>
                          </div>
                        ) : null}

                        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-xl bg-slate-50 p-4">
                            <dt className="text-sm font-medium text-slate-600">
                              Sitemap URLs
                            </dt>
                            <dd className="mt-1 text-2xl font-bold text-slate-900">
                              {auditResult.sitemapComparison.sitemapUrlCount}
                            </dd>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-4">
                            <dt className="text-sm font-medium text-slate-600">
                              Sitemap URLs crawled
                            </dt>
                            <dd className="mt-1 text-2xl font-bold text-slate-900">
                              {
                                auditResult.sitemapComparison
                                  .sitemapUrlsCrawled.length
                              }
                            </dd>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-4">
                            <dt className="text-sm font-medium text-slate-600">
                              Sitemap URLs not crawled
                            </dt>
                            <dd className="mt-1 text-2xl font-bold text-slate-900">
                              {
                                auditResult.sitemapComparison
                                  .sitemapUrlsNotCrawled.length
                              }
                            </dd>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-4">
                            <dt className="text-sm font-medium text-slate-600">
                              Crawled URLs outside sitemap
                            </dt>
                            <dd className="mt-1 text-2xl font-bold text-slate-900">
                              {
                                auditResult.sitemapComparison
                                  .crawledUrlsNotInSitemap.length
                              }
                            </dd>
                          </div>
                        </dl>

                        <div className="mt-6">
                          <h4 className="text-sm font-semibold text-slate-900">
                            Sitemap URLs not crawled
                          </h4>

                          {auditResult.sitemapComparison.sitemapUrlsNotCrawled
                            .length > 0 ? (
                            <ul className="mt-3 max-h-64 space-y-2 overflow-auto pr-1">
                              {auditResult.sitemapComparison
                                .sitemapUrlsNotCrawled.map((url) => (
                                  <li
                                    key={url}
                                    className="break-all rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700"
                                  >
                                    {url}
                                  </li>
                                ))}
                            </ul>
                          ) : (
                            <p className="mt-3 text-sm font-medium text-green-700">
                              Every discovered sitemap URL was represented by
                              a successful crawl.
                            </p>
                          )}
                        </div>

                        <div className="mt-6">
                          <h4 className="text-sm font-semibold text-slate-900">
                            Crawled URLs outside sitemap
                          </h4>

                          {auditResult.sitemapComparison
                            .crawledUrlsNotInSitemap.length > 0 ? (
                            <ul className="mt-3 max-h-64 space-y-2 overflow-auto pr-1">
                              {auditResult.sitemapComparison
                                .crawledUrlsNotInSitemap.map((url) => (
                                  <li
                                    key={url}
                                    className="break-all rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700"
                                  >
                                    {url}
                                  </li>
                                ))}
                            </ul>
                          ) : (
                            <p className="mt-3 text-sm font-medium text-green-700">
                              No successfully crawled URLs were found outside
                              the discovered sitemap set.
                            </p>
                          )}
                        </div>
                      </section>

                      <section
                        aria-labelledby="website-seo-orphan-candidates"
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
                          Orphan candidate diagnostics
                        </p>

                        <h3
                          id="website-seo-orphan-candidates"
                          className="mt-2 text-xl font-bold text-slate-900"
                        >
                          Sitemap orphan candidates
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          These stronger candidates are present in the sitemap,
                          were successfully crawled, and had no discovered
                          inbound internal links from the other successfully
                          crawled pages.
                        </p>

                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          Candidate terminology is intentional because bounded
                          crawling cannot prove the absence of every possible
                          internal link.
                        </p>

                        {auditResult.sitemapComparison
                          .sitemapOrphanCandidateUrls.length > 0 ? (
                          <ul className="mt-5 max-h-64 space-y-2 overflow-auto pr-1">
                            {auditResult.sitemapComparison
                              .sitemapOrphanCandidateUrls.map((url) => (
                                <li
                                  key={url}
                                  className="break-all rounded-lg border border-amber-100 bg-amber-50/40 px-3 py-2 text-sm text-slate-700"
                                >
                                  {url}
                                </li>
                              ))}
                          </ul>
                        ) : (
                          <p className="mt-5 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-800">
                            No sitemap-backed orphan candidates were detected.
                          </p>
                        )}

                        <div className="mt-6 border-t border-slate-200 pt-5">
                          <h4 className="text-sm font-semibold text-slate-900">
                            Crawl orphan candidates
                          </h4>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            This broader crawl-derived list contains
                            successfully crawled pages with zero inbound
                            internal links, excluding the entered start URL.
                          </p>

                          {auditResult.analysis.orphanCandidateUrls.length >
                          0 ? (
                            <ul className="mt-4 max-h-64 space-y-2 overflow-auto pr-1">
                              {auditResult.analysis.orphanCandidateUrls.map(
                                (url) => (
                                  <li
                                    key={url}
                                    className="break-all rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700"
                                  >
                                    {url}
                                  </li>
                                ),
                              )}
                            </ul>
                          ) : (
                            <p className="mt-4 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-800">
                              No crawl-derived orphan candidates were detected.
                            </p>
                          )}
                        </div>
                      </section>
                    </div>
                  </div>
              <section
                aria-labelledby="website-seo-near-duplicate-candidates"
                className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3
                      id="website-seo-near-duplicate-candidates"
                      className="text-lg font-semibold text-slate-900"
                    >
                      Near-duplicate content candidates
                    </h3>

                    <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                      Review pages with highly similar visible content.
                      These are diagnostic candidates, not automatic SEO
                      errors. Similar pages can be intentional when they
                      serve different search intent or page purposes.
                    </p>
                  </div>

                  <span className="inline-flex w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    85%+ similarity
                  </span>
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h4 className="text-base font-semibold text-slate-900">
                          Candidate groups
                        </h4>

                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          Connected groups of indexable pages that contain
                          one or more qualifying near-duplicate relationships.
                        </p>
                      </div>

                      <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        {
                          auditResult.analysis
                            .nearDuplicateCandidateGroups.length
                        }{' '}
                        groups
                      </span>
                    </div>

                    {auditResult.analysis
                      .nearDuplicateCandidateGroups.length > 0 ? (
                      <div className="mt-5 max-h-[36rem] space-y-4 overflow-auto pr-1">
                        {auditResult.analysis
                          .nearDuplicateCandidateGroups.map(
                            (group, groupIndex) => (
                              <article
                                key={`${group.urls.join('|')}-${groupIndex}`}
                                className="rounded-xl border border-amber-100 bg-amber-50/40 p-4"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <p className="text-sm font-semibold text-slate-900">
                                    {group.urls.length}{' '}
                                    {group.urls.length === 1
                                      ? 'page'
                                      : 'pages'}
                                  </p>

                                  <span className="rounded-full border border-amber-100 bg-white px-2.5 py-1 text-xs font-semibold text-amber-700">
                                    Minimum similarity:{' '}
                                    {(
                                      group.minimumSimilarity *
                                      100
                                    ).toFixed(1)}
                                    %
                                  </span>
                                </div>

                                <ul className="mt-3 space-y-2">
                                  {group.urls.map((url) => (
                                    <li
                                      key={url}
                                      className="break-all rounded-lg bg-white px-3 py-2 text-sm text-slate-700"
                                    >
                                      {url}
                                    </li>
                                  ))}
                                </ul>
                              </article>
                            ),
                          )}
                      </div>
                    ) : (
                      <p className="mt-5 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-800">
                        No near-duplicate candidate groups were detected
                        among eligible indexable pages.
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h4 className="text-base font-semibold text-slate-900">
                          Similar page pairs
                        </h4>

                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          Individual page pairs that met the near-duplicate
                          similarity threshold.
                        </p>
                      </div>

                      <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                        {
                          auditResult.analysis
                            .nearDuplicatePairs.length
                        }{' '}
                        pairs
                      </span>
                    </div>

                    {auditResult.analysis
                      .nearDuplicatePairs.length > 0 ? (
                      <div className="mt-5 max-h-[36rem] space-y-4 overflow-auto pr-1">
                        {auditResult.analysis
                          .nearDuplicatePairs.map(
                            (pair) => (
                              <article
                                key={`${pair.urlA}|${pair.urlB}`}
                                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <p className="text-sm font-semibold text-slate-900">
                                    Similarity
                                  </p>

                                  <span className="rounded-full border border-orange-100 bg-white px-2.5 py-1 text-xs font-semibold text-orange-700">
                                    {(
                                      pair.similarity *
                                      100
                                    ).toFixed(1)}
                                    %
                                  </span>
                                </div>

                                <dl className="mt-4 space-y-3">
                                  <div>
                                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                      Page A
                                    </dt>

                                    <dd className="mt-1 break-all text-sm text-slate-700">
                                      {pair.urlA}
                                    </dd>
                                  </div>

                                  <div>
                                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                      Page B
                                    </dt>

                                    <dd className="mt-1 break-all text-sm text-slate-700">
                                      {pair.urlB}
                                    </dd>
                                  </div>
                                </dl>
                              </article>
                            ),
                          )}
                      </div>
                    ) : (
                      <p className="mt-5 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-800">
                        No near-duplicate page pairs were detected among
                        eligible indexable pages.
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm leading-6 text-slate-600">
                    Similarity is calculated from normalized visible page
                    content. Candidate results should be reviewed alongside
                    page purpose, search intent, canonical strategy, and
                    whether each page provides meaningful unique value.
                  </p>
                </div>
              </section>                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              What the Website SEO Checker reviews
            </h2>

            <p className="mt-3 max-w-3xl leading-7 text-slate-600">
              The audit combines page-level SEO checks with site-level
              crawl analysis so you can identify common technical,
              content, indexing, and internal-linking problems.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                'Page titles and meta descriptions',
                'H1 headings and duplicate metadata',
                'Canonical URLs and indexing directives',
                'HTTP status codes and redirects',
                'Broken internal links',
                'Crawl depth and inbound internal links',
                'Sitemap and crawl coverage',
                'Image alternative text',
                'JSON-LD syntax checks',
                'Thin and near-duplicate content signals',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4"
                >
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 h-5 w-5 shrink-0 text-orange-500"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <section className="mt-12" aria-labelledby="seo-audit-guidance">
              <h2 id="seo-audit-guidance" className="text-2xl font-bold tracking-tight text-slate-950">
                How to understand and fix your SEO audit results
              </h2>
              <p className="mt-3 leading-7 text-slate-600">
                Start with problems that prevent visitors and search engines from accessing important pages. Then review metadata, indexing directives, content quality, and sitemap coverage. Prioritize findings based on their impact on your website.
              </p>
              <div className="mt-6 space-y-6">
                {[
                  {
                    title: 'Fix broken internal links',
                    description: 'Review failed URLs and the pages linking to them. Correct incorrect links, restore missing pages where appropriate, or redirect outdated URLs to relevant working pages. Temporary network failures should be verified before making changes.',
                  },
                  {
                    title: 'Improve missing or duplicate metadata',
                    description: 'Give important pages descriptive, relevant titles and meta descriptions. Review duplicate metadata to determine whether pages serve different purposes. Avoid rewriting useful content simply to satisfy an automated warning.',
                  },
                  {
                    title: 'Review indexing directives',
                    description: 'Check pages with detected noindex directives and confirm whether exclusion from search results is intentional. Removing noindex does not guarantee Google indexing, and this checker cannot confirm actual indexing status.',
                  },
                  {
                    title: 'Evaluate thin and near-duplicate content',
                    description: 'Review flagged pages for originality, usefulness, and search intent. Improve pages that lack meaningful information, but do not automatically delete, merge, or rewrite pages based only on word counts or similarity scores.',
                  },
                  {
                    title: 'Investigate sitemap and crawl coverage',
                    description: 'Compare discovered pages with sitemap URLs and investigate unexpected gaps. Crawl limits, robots directives, redirects, and temporary website errors can affect the results. A missing page in this report is not necessarily missing from Google.',
                  },
                ].map((item) => (
                  <article key={item.title} className="rounded-xl border border-slate-200 bg-white p-5">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
              <p className="mt-6 text-sm leading-7 text-slate-600">
                This automated audit provides diagnostic signals from a limited crawl. Confirm important findings manually and use Google Search Console to investigate Google indexing and search performance. Fixing reported issues does not guarantee rankings or indexing.
              </p>
            </section>
            <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Audit scope
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Website SEO Checker reviews publicly accessible pages
                discovered during the audit. Crawl limits, robots
                directives, website availability, redirects, and other
                technical conditions can affect how many pages are
                included in a report.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
