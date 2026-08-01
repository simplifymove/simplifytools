import Link from 'next/link';
import { EditorialGuide } from '@/app/components/EditorialGuide';
import { blogGuides, guideMetadata } from '@/app/blog/guides';

const guide = blogGuides[3];
export const metadata = guideMetadata(guide.slug);

export default function DataFormatsGuide() {
  return (
    <EditorialGuide {...guide}>
      <p className="text-xl leading-9 text-gray-800">
        CSV, Excel workbooks, and JSON can all represent rows of data, but they preserve different kinds of meaning. CSV is a simple exchange format, Excel is an interactive spreadsheet document, and JSON is a structured data format. A safe conversion begins by identifying which features must survive.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">Compare the capabilities before choosing</h2>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-[760px] w-full border-collapse text-left text-sm">
          <thead className="bg-gray-100 text-gray-950"><tr><th scope="col" className="p-4">Capability</th><th scope="col" className="p-4">CSV</th><th scope="col" className="p-4">Excel workbook</th><th scope="col" className="p-4">JSON</th></tr></thead>
          <tbody className="divide-y divide-gray-200">
            <tr><th scope="row" className="p-4">Basic model</th><td className="p-4">One flat text table</td><td className="p-4">Workbook with worksheets and cell features</td><td className="p-4">Objects, arrays, and scalar values</td></tr>
            <tr><th scope="row" className="p-4">Headers</th><td className="p-4">Conventionally first row</td><td className="p-4">Normal cells, interpreted by the user/tool</td><td className="p-4">Object property names</td></tr>
            <tr><th scope="row" className="p-4">Data types</th><td className="p-4">Text representation; parser infers meaning</td><td className="p-4">Typed cell values and formatting</td><td className="p-4">String, number, boolean, null, object, array</td></tr>
            <tr><th scope="row" className="p-4">Nested structures</th><td className="p-4">No native nesting</td><td className="p-4">No direct object model; can spread across sheets</td><td className="p-4">Native objects and arrays</td></tr>
            <tr><th scope="row" className="p-4">Formulas and presentation</th><td className="p-4">No</td><td className="p-4">Yes</td><td className="p-4">No spreadsheet formulas or cell styling</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-3xl font-bold text-gray-950">CSV: portable, inspectable, and intentionally limited</h2>
      <p>
        A CSV file stores records as lines and fields separated by a delimiter. The name says comma-separated, but real exports may use semicolons, tabs, or pipes. Fields containing delimiters, quotes, or line breaks need correct quoting. CSV has no universal way to declare that <code className="rounded bg-gray-100 px-1">00124</code> is an identifier rather than the number 124, or that an empty field differs from a null value.
      </p>
      <p>
        Encoding is another part of the contract. UTF-8 is common, but older systems may export regional encodings. A file can open correctly on its originating computer and show corrupted names elsewhere if the reader guesses a different encoding. Delimiters also interact with regional conventions: software may choose a semicolon when a comma is used as a decimal separator.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">Excel: a document, not merely a table</h2>
      <p>
        An Excel workbook can contain multiple worksheets, formulas, formatted dates, styled cells, charts, filters, hidden rows, validation rules, named ranges, and macros. Exporting one sheet to CSV flattens it to displayed or calculated values and discards workbook-level features. Conversely, converting CSV to Excel can place rows into a worksheet, but it cannot recreate formulas, formatting, charts, or relationships that never existed in the CSV.
      </p>
      <aside className="rounded-xl border-l-4 border-teal-600 bg-teal-50 p-6">
        <h3 className="text-xl font-bold text-gray-950">Financial spreadsheet example</h3>
        <p className="mt-2">Keep the workbook when formulas, assumptions, currency formats, and separate monthly sheets matter. Export a reviewed values-only table to CSV only when another system needs rows. Before export, decide whether formulas should become current calculated values and whether leading-zero account codes must be forced to text.</p>
      </aside>

      <h2 className="text-3xl font-bold text-gray-950">JSON: explicit structure for software exchange</h2>
      <p>
        JSON represents strings, numbers, booleans, null, arrays, and objects. It can naturally express a product with a nested supplier object and an array of tags. That structure is useful for APIs and application configuration, but it does not include spreadsheet formulas, cell formats, or comments. JSON syntax also distinguishes the string <code className="rounded bg-gray-100 px-1">"00124"</code> from the number <code className="rounded bg-gray-100 px-1">124</code>—if a converter infers the latter too early, the leading zeroes are gone.
      </p>
      <p>
        Use <Link href="/all-tools/code-tools/json-formatter" className="font-semibold text-blue-700 underline">JSON Formatter</Link> to parse and indent valid JSON for inspection. Formatting confirms syntax, not whether the object follows an API’s required schema or contains correct business data.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">Four selection scenarios</h2>
      <h3 className="text-2xl font-bold text-gray-950">1. Product inventory exchange</h3>
      <p>
        CSV is practical when every product has the same columns: SKU, name, price, and stock. Preserve SKU as text if values have leading zeroes. If products have variable options, nested dimensions, or multiple images, JSON represents those relationships more directly; a flat CSV would need repeated rows or encoded text conventions.
      </p>
      <h3 className="text-2xl font-bold text-gray-950">2. API export</h3>
      <p>
        Keep JSON when consumers need nested customers, addresses, and orders with clear primitive types. Convert to CSV only after choosing which repeated or nested values to flatten. One-to-many relationships cannot become a single rectangular table without duplication, aggregation, or information loss.
      </p>
      <h3 className="text-2xl font-bold text-gray-950">3. Financial analysis</h3>
      <p>
        Use an Excel workbook while analysts need formulas, multiple worksheets, charts, and review-friendly formatting. Produce CSV for a controlled system import, with a documented sheet, delimiter, encoding, date representation, and decimal convention.
      </p>
      <h3 className="text-2xl font-bold text-gray-950">4. Transfer between systems</h3>
      <p>
        Prefer the receiving system’s documented import contract. “Supports CSV” is incomplete unless it also specifies headers, delimiter, quoting, encoding, decimal separators, date format, and null handling. A sample export from the destination system is often a safer template than a manually invented file.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">Where conversion becomes ambiguous</h2>
      <ul className="list-disc space-y-3 pl-6">
        <li><strong>Leading-zero identifiers:</strong> type inference may turn <code>00124</code> into <code>124</code>.</li>
        <li><strong>Dates:</strong> <code>03/04/2026</code> is ambiguous across regional conventions and may include hidden time zones in another system.</li>
        <li><strong>Empty values:</strong> an empty CSV field might mean missing, blank, zero, or not applicable.</li>
        <li><strong>Large numbers:</strong> spreadsheet display or numeric precision can alter long identifiers.</li>
        <li><strong>Nested JSON:</strong> arrays and objects require a documented flattening rule before becoming columns.</li>
        <li><strong>Excel formulas:</strong> CSV can preserve a resulting value, not the workbook calculation model.</li>
      </ul>

      <h2 className="text-3xl font-bold text-gray-950">Using the available converters carefully</h2>
      <p>
        <Link href="/all-tools/data/csv-to-json" className="font-semibold text-blue-700 underline">CSV to JSON</Link> treats the first row as headers and creates a flat array of row objects. Its parser can infer types, so review identifiers, dates, and missing values. <Link href="/all-tools/data/csv-to-excel" className="font-semibold text-blue-700 underline">CSV to Excel</Link> is appropriate for putting a flat export into a workbook container, while <Link href="/all-tools/data/excel-to-csv" className="font-semibold text-blue-700 underline">Excel to CSV</Link> should be treated as a flattening step with potential worksheet and feature loss. For suitable arrays of flat objects, <Link href="/all-tools/code-tools/json-to-csv" className="font-semibold text-blue-700 underline">JSON to CSV</Link> can create tabular output.
      </p>
      <ol className="list-decimal space-y-3 pl-6">
        <li>Keep the original and record its encoding, delimiter, worksheet, and data assumptions.</li>
        <li>Convert a small representative sample containing empty cells, quotes, non-ASCII names, dates, and leading zeroes.</li>
        <li>Compare row counts, headers, identifiers, totals, and nested fields.</li>
        <li>Document any flattening or type rules before converting the full dataset.</li>
      </ol>

      <h2 className="text-3xl font-bold text-gray-950">Decision summary</h2>
      <p>
        Choose CSV for a simple, documented table exchange; Excel for human analysis and workbook features; and JSON for typed, nested software data. Conversion is safe only when the destination can represent the source features you care about. Treat delimiters, encoding, dates, nulls, identifiers, formulas, and nesting as explicit decisions rather than cleanup details.
      </p>
    </EditorialGuide>
  );
}
