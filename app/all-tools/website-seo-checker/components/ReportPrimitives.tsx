"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown, Copy, Search } from "lucide-react";
import { label } from "../utils/report-selectors";
import { useReportCollection } from "../hooks/useReportCollection";

export const controlClass =
  "min-h-11 max-w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600";
export const buttonClass = `${controlClass} font-semibold hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40`;

export function UrlValue({ value }: { value: string }) {
  const [message, setMessage] = useState("");
  return (
    <div className="flex min-w-0 items-start gap-2">
      <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{value}</span>
      <button
        type="button"
        className="shrink-0 rounded-md p-2 text-slate-500 hover:bg-orange-50 hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-orange-600"
        aria-label={`Copy ${value}`}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setMessage("Copied");
          } catch {
            setMessage("Copy unavailable. Select the URL to copy it.");
          }
        }}
      >
        <Copy aria-hidden="true" className="h-4 w-4" />
      </button>
      <span className="sr-only" role="status">
        {message}
      </span>
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: string;
}) {
  const colors: Record<string, string> = {
    error: "border-red-200 bg-red-50 text-red-800",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    opportunity: "border-blue-200 bg-blue-50 text-blue-800",
    success: "border-green-200 bg-green-50 text-green-800",
    neutral: "border-slate-200 bg-slate-50 text-slate-700",
  };
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${colors[tone] ?? colors.neutral}`}
    >
      {children}
    </span>
  );
}

export function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      {description && (
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      )}
      <div className="mt-5 min-w-0">{children}</div>
    </section>
  );
}

export function Details({
  title,
  children,
}: {
  title: ReactNode;
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <details
      onToggle={(event) => setExpanded(event.currentTarget.open)}
      className="group min-w-0 rounded-xl border border-slate-200 bg-white"
    >
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-xl p-4 text-sm font-semibold text-slate-800 focus-visible:outline-2 focus-visible:outline-orange-600 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 [overflow-wrap:anywhere]">{title}</span>
        <ChevronDown
          aria-hidden="true"
          className="h-4 w-4 shrink-0 group-open:rotate-180"
        />
      </summary>
      {expanded && (
        <div className="min-w-0 border-t border-slate-100 p-4 text-sm">
          {children}
        </div>
      )}
    </details>
  );
}

export function Select({
  label: name,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
}) {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-1 text-xs font-semibold text-slate-600">
      <label htmlFor={id}>{name}</label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={controlClass}
      >
        {options.map(([key, text]) => (
          <option key={key} value={key}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Collection<T>({
  items,
  name,
  render,
  getKey,
  compare,
  matches,
  controls,
  onClear,
}: {
  items: readonly T[];
  name: string;
  render: (item: T) => ReactNode;
  getKey: (item: T, index: number) => string;
  compare?: (a: T, b: T) => number;
  matches?: (item: T) => boolean;
  controls?: ReactNode;
  onClear?: () => void;
}) {
  const collection = useReportCollection(
    items,
    matches ?? (() => true),
    compare ?? (() => 0),
  );
  const id = useId();
  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label
          htmlFor={id}
          className="min-w-0 flex-1 basis-48 text-xs font-semibold text-slate-600"
        >
          Search {name}
          <div className="relative mt-1">
            <Search
              aria-hidden="true"
              className="absolute left-3 top-3 h-5 w-5 text-slate-400"
            />
            <input
              id={id}
              type="search"
              value={collection.query}
              onChange={(event) => collection.setQuery(event.target.value)}
              className={`${controlClass} w-full pl-10`}
              placeholder="Search URLs, values or evidence…"
            />
          </div>
        </label>
        <div className="contents" onChange={() => collection.resetPage()}>
          {controls}
        </div>
        <button
          type="button"
          className={buttonClass}
          onClick={() => {
            collection.setQuery("");
            onClear?.();
          }}
        >
          Clear filters
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <p role="status" aria-live="polite" className="text-sm text-slate-500">
          {collection.total
            ? `${collection.start + 1}–${Math.min(collection.start + collection.pageSize, collection.total)}`
            : "0"}{" "}
          of {collection.total} matching results
        </p>
        <Select
          label="Rows per page"
          value={String(collection.pageSize)}
          onChange={(value) => collection.setPageSize(Number(value))}
          options={["10", "25", "50"].map((value) => [value, value])}
        />
      </div>
      <div
        className="space-y-3"
        key={`${collection.page}:${collection.query}:${collection.pageSize}`}
      >
        {collection.rows.map((item, index) => (
          <div className="min-w-0" key={getKey(item, collection.start + index)}>
            {render(item)}
          </div>
        ))}
        {!collection.total && (
          <p className="rounded-xl bg-slate-50 p-6 text-sm text-slate-600">
            {items.length
              ? "No results match these filters. Clear filters to see all records."
              : "No records in this audit."}
          </p>
        )}
      </div>
      <nav
        aria-label={`${name} pagination`}
        className="flex flex-wrap items-center justify-between gap-3 pt-2"
      >
        <span className="text-sm text-slate-500">
          Page {collection.page} of {collection.pageCount}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            className={buttonClass}
            disabled={collection.page === 1}
            onClick={() => collection.setPage(collection.page - 1)}
          >
            Previous
          </button>
          <button
            type="button"
            className={buttonClass}
            disabled={collection.page === collection.pageCount}
            onClick={() => collection.setPage(collection.page + 1)}
          >
            Next
          </button>
        </div>
      </nav>
    </div>
  );
}

export function UrlList({
  urls,
  name = "URLs",
}: {
  urls: string[];
  name?: string;
}) {
  return (
    <Collection
      items={urls}
      name={name}
      getKey={(url, index) => `${index}:${url}`}
      render={(url) => (
        <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          <UrlValue value={url} />
        </div>
      )}
    />
  );
}

/** Complete escaped evidence, including fields with no bespoke summary. Arrays are paginated. */
export function Evidence({ value }: { value: unknown }) {
  if (value === null || value === undefined)
    return <span className="text-slate-500">Unavailable / not detected</span>;
  if (typeof value === "boolean") return <span>{value ? "Yes" : "No"}</span>;
  if (typeof value === "string")
    return /^https?:\/\//i.test(value) ? (
      <UrlValue value={value} />
    ) : (
      <span className="whitespace-pre-wrap [overflow-wrap:anywhere]">
        {value || "(empty)"}
      </span>
    );
  if (typeof value === "number") return <span>{value.toLocaleString()}</span>;
  if (Array.isArray(value)) {
    if (!value.length)
      return <span className="text-slate-500">No entries</span>;
    return (
      <Collection
        items={value as unknown[]}
        name="evidence"
        getKey={(_, index) => String(index)}
        render={(entry) => (
          <div className="rounded-lg bg-slate-50 p-3">
            <Evidence value={entry} />
          </div>
        )}
      />
    );
  }
  return (
    <dl className="space-y-4">
      {Object.entries(value as Record<string, unknown>).map(([key, entry]) => (
        <div key={key} className="min-w-0">
          <dt className="mb-1 text-xs font-semibold text-slate-500">
            {label(key)}
          </dt>
          <dd className="min-w-0 text-slate-800">
            <Evidence value={entry} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
