import { useMemo, useState } from "react";
import { searchText, selectCollection } from "../utils/report-selectors";

export function useReportCollection<T>(
  items: readonly T[],
  matches: (item: T) => boolean,
  compare: (a: T, b: T) => number,
) {
  const [query, setQueryState] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(10);
  const indexed = useMemo(
    () => items.map((item) => ({ item, text: searchText(item) })),
    [items],
  );
  const filtered = useMemo(
    () =>
      selectCollection(
        indexed,
        query,
        (entry) => matches(entry.item),
        (a, b) => compare(a.item, b.item),
        (entry) => entry.text,
      ).map((entry) => entry.item),
    [indexed, query, matches, compare],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  return {
    query,
    setQuery: (value: string) => {
      setQueryState(value);
      setPage(1);
    },
    page: currentPage,
    setPage,
    pageSize,
    setPageSize: (value: number) => {
      setPageSizeState(value);
      setPage(1);
    },
    resetPage: () => setPage(1),
    pageCount,
    total: filtered.length,
    start,
    rows: filtered.slice(start, start + pageSize),
  };
}
