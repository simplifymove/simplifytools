"use client";

import { FormEvent, useState, useSyncExternalStore } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Globe2,
  Search,
  ShieldCheck,
} from "lucide-react";

import { HomeHeader } from "@/app/components/HomeHeader";
import { Footer } from "@/app/components/Footer";
import AuditDashboard from "./components/AuditDashboard";

import type { WebsiteSeoAuditResult } from "@/lib/website-seo/orchestrator";

const DEFAULT_MAX_PAGES = 25;
const subscribeToReadiness = () => () => {};

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
  // Prevent a native form navigation before React attaches the submit handler.
  const isReady = useSyncExternalStore(
    subscribeToReadiness,
    () => true,
    () => false,
  );
  const [url, setUrl] = useState("");
  const [maxPages, setMaxPages] = useState(DEFAULT_MAX_PAGES);
  const [formMessage, setFormMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [retryAfterSeconds, setRetryAfterSeconds] = useState<number | null>(
    null,
  );
  const [auditResult, setAuditResult] = useState<WebsiteSeoAuditResult | null>(
    null,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedUrl = url.trim();

    setFormMessage("");
    setApiError("");
    setRetryAfterSeconds(null);

    if (!normalizedUrl) {
      setFormMessage("Enter a website URL to start the SEO audit.");
      return;
    }

    setIsLoading(true);
    setAuditResult(null);

    try {
      const response = await fetch("/api/website-seo/audit", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          url: normalizedUrl,
          maxPages,
        }),
      });

      const payload = (await response
        .json()
        .catch(() => null)) as WebsiteSeoAuditApiResponse | null;

      if (!response.ok) {
        const errorPayload = payload as WebsiteSeoAuditErrorResponse | null;

        if (
          response.status === 429 &&
          typeof errorPayload?.retryAfterSeconds === "number"
        ) {
          setRetryAfterSeconds(errorPayload.retryAfterSeconds);
        }

        setApiError(
          errorPayload?.error || "Unable to complete the website SEO audit.",
        );

        return;
      }

      if (
        !payload ||
        !("success" in payload) ||
        payload.success !== true ||
        !("result" in payload)
      ) {
        setApiError("The website SEO audit returned an unexpected response.");
        return;
      }

      setAuditResult(payload.result);
    } catch {
      setApiError(
        "Unable to connect to the Website SEO Checker. Please try again.",
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
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1.5 text-sm font-medium text-orange-700 shadow-sm">
                <Search className="h-4 w-4" />
                Website SEO audit
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Website SEO Checker
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Audit a website for technical and on-page SEO issues. Review
                crawl coverage, metadata, headings, canonicals, internal links,
                images, structured data, and other signals from one report.
              </p>
            </div>

            <div className="mt-6 max-w-4xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
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
                      aria-describedby="website-seo-url-help"
                      aria-invalid={!!formMessage || !!apiError}
                      value={url}
                      disabled={!isReady || isLoading}
                      onChange={(event) => {
                        setUrl(event.target.value);

                        if (formMessage) {
                          setFormMessage("");
                        }

                        if (apiError) {
                          setApiError("");
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
                    disabled={!isReady || isLoading}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 font-semibold text-white transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Search
                      className={
                        isLoading ? "h-5 w-5 animate-pulse" : "h-5 w-5"
                      }
                    />

                    {isLoading ? "Checking Website..." : "Check Website"}
                  </button>
                </div>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p
                    id="website-seo-url-help"
                    className="text-sm text-slate-500"
                  >
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
                      disabled={!isReady || isLoading}
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
                          Try again in about {retryAfterSeconds} seconds.
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </form>
            </div>

            {!auditResult && !isLoading ? (
              <div className="mt-6 grid max-w-4xl gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <CheckCircle2 className="h-5 w-5 text-orange-500" />
                  <p className="mt-3 font-semibold text-slate-900">
                    On-page checks
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Review titles, descriptions, headings, canonicals, content,
                    and images.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <Globe2 className="h-5 w-5 text-orange-500" />
                  <p className="mt-3 font-semibold text-slate-900">
                    Crawl analysis
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Inspect crawl coverage, status codes, redirects, internal
                    links, and sitemap coverage.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <ShieldCheck className="h-5 w-5 text-orange-500" />
                  <p className="mt-3 font-semibold text-slate-900">
                    Safe website checks
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Public website URLs are validated before the audit fetches
                    website content.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {isLoading ? (
          <div
            role="status"
            aria-live="polite"
            className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-600"
          >
            Checking publicly accessible pages. This can take up to a minute.
          </div>
        ) : null}
        {auditResult ? <AuditDashboard result={auditResult} /> : null}

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <details
            open={auditResult ? undefined : true}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <summary className="cursor-pointer text-lg font-semibold text-slate-900 focus-visible:outline-2 focus-visible:outline-orange-600">
              About this checker, remediation guidance & audit scope
            </summary>
            <div className="mt-5 max-w-4xl">
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                What the Website SEO Checker reviews
              </h2>

              <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                The audit combines page-level SEO checks with site-level crawl
                analysis so you can identify common technical, content,
                indexing, and internal-linking problems.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  "Page titles and meta descriptions",
                  "H1 headings and duplicate metadata",
                  "Canonical URLs and indexing directives",
                  "HTTP status codes and redirects",
                  "Broken internal links",
                  "Crawl depth and inbound internal links",
                  "Sitemap and crawl coverage",
                  "Image alternative text",
                  "JSON-LD syntax checks",
                  "Thin and near-duplicate content signals",
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
                <h2
                  id="seo-audit-guidance"
                  className="text-2xl font-bold tracking-tight text-slate-950"
                >
                  How to understand and fix your SEO audit results
                </h2>
                <p className="mt-3 leading-7 text-slate-600">
                  Start with problems that prevent visitors and search engines
                  from accessing important pages. Then review metadata, indexing
                  directives, content quality, and sitemap coverage. Prioritize
                  findings based on their impact on your website.
                </p>
                <div className="mt-6 space-y-6">
                  {[
                    {
                      title: "Fix broken internal links",
                      description:
                        "Review failed URLs and the pages linking to them. Correct incorrect links, restore missing pages where appropriate, or redirect outdated URLs to relevant working pages. Temporary network failures should be verified before making changes.",
                    },
                    {
                      title: "Improve missing or duplicate metadata",
                      description:
                        "Give important pages descriptive, relevant titles and meta descriptions. Review duplicate metadata to determine whether pages serve different purposes. Avoid rewriting useful content simply to satisfy an automated warning.",
                    },
                    {
                      title: "Review indexing directives",
                      description:
                        "Check pages with detected noindex directives and confirm whether exclusion from search results is intentional. Removing noindex does not guarantee Google indexing, and this checker cannot confirm actual indexing status.",
                    },
                    {
                      title: "Evaluate thin and near-duplicate content",
                      description:
                        "Review flagged pages for originality, usefulness, and search intent. Improve pages that lack meaningful information, but do not automatically delete, merge, or rewrite pages based only on word counts or similarity scores.",
                    },
                    {
                      title: "Investigate sitemap and crawl coverage",
                      description:
                        "Compare discovered pages with sitemap URLs and investigate unexpected gaps. Crawl limits, robots directives, redirects, and temporary website errors can affect the results. A missing page in this report is not necessarily missing from Google.",
                    },
                  ].map((item) => (
                    <article
                      key={item.title}
                      className="rounded-xl border border-slate-200 bg-white p-5"
                    >
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
                  This automated audit provides diagnostic signals from a
                  limited crawl. Confirm important findings manually and use
                  Google Search Console to investigate Google indexing and
                  search performance. Fixing reported issues does not guarantee
                  rankings or indexing.
                </p>
              </section>
              <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Audit scope
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Website SEO Checker reviews publicly accessible pages
                  discovered during the audit. Crawl limits, robots directives,
                  website availability, redirects, and other technical
                  conditions can affect how many pages are included in a report.
                </p>
              </div>
            </div>
          </details>
        </section>
      </main>

      <Footer />
    </div>
  );
}
