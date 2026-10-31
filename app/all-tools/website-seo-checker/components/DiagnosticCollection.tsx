"use client";
import { useState } from "react";
import {
  Collection,
  Details,
  Evidence,
  Panel,
  Select,
} from "./ReportPrimitives";
import { label } from "../utils/report-selectors";

export default function DiagnosticCollection<T>({
  title,
  description,
  items,
  summary,
  sortFields = [],
}: {
  title: string;
  description?: string;
  items: T[];
  summary: (item: T, index: number) => string;
  sortFields?: Array<{ key: string; value: (item: T) => string | number }>;
}) {
  const [sort, setSort] = useState("original");
  const [direction, setDirection] = useState("ascending");
  return (
    <Panel title={title} description={description}>
      <Collection
        items={items}
        name={title.toLowerCase()}
        getKey={(item) => String(items.indexOf(item))}
        compare={(a, b) => {
          const field = sortFields.find((field) => field.key === sort);
          if (!field) return 0;
          const av = field.value(a),
            bv = field.value(b);
          const order =
            typeof av === "number" && typeof bv === "number"
              ? av - bv
              : String(av).localeCompare(String(bv));
          return direction === "ascending" ? order : -order;
        }}
        onClear={() => {
          setSort("original");
          setDirection("ascending");
        }}
        controls={
          sortFields.length > 0 && (
            <>
              <Select
                label="Sort diagnostics"
                value={sort}
                onChange={setSort}
                options={[
                  ["original", "Original report order"],
                  ...sortFields.map(
                    (field) =>
                      [field.key, label(field.key)] as [string, string],
                  ),
                ]}
              />
              <Select
                label="Sort direction"
                value={direction}
                onChange={setDirection}
                options={[
                  ["ascending", "Ascending"],
                  ["descending", "Descending"],
                ]}
              />
            </>
          )
        }
        render={(item) => (
          <Details title={summary(item, items.indexOf(item))}>
            <Evidence value={item} />
          </Details>
        )}
      />
    </Panel>
  );
}
