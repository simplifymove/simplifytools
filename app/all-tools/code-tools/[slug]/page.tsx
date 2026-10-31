'use client';
import { FAQAnswer, FAQDisclosure, FAQHeading, FAQList, FAQPanel, FAQQuestion } from '@/app/components/FAQDesign';

import { use, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';
import Link from 'next/link';
import { getToolBySlug } from '@/app/lib/code-tools';
import {
  Binary,
  Braces,
  CheckCircle,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  Database,
  Dice1,
  Download,
  FileText,
  GitCompare,
  Hash,
  Link2,
  Loader2,
  Lock,
  Palette,
  Play,
  QrCode,
  RotateCcw,
  RotateCw,
  SearchCheck,
  Shield,
  Shuffle,
  Slash,
  Sparkles,
  Table,
  Thermometer,
  Type,
  Unlock,
  Watch,
  Zap,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';
import { RelatedToolsSection } from '@/app/components/RelatedToolsSection';
import { PriorityToolGuide } from '@/app/components/PriorityToolGuide';

interface ToolOption {
  name: string;
  value: string | number | boolean;
}

interface ToolSEOContent {
  whatItDoes: string;
  whenToUse: string[];
  example?: {
    inputLabel: string;
    input: string;
    outputLabel: string;
    output: string;
  };
  tips: string[];
  privacyNote: string;
}

const base64FaqItems = [
  { question: 'Is Base64 encryption?', answer: 'No. Base64 is a reversible representation of bytes. It does not hide information from someone who can decode it, so do not use it to protect secrets.' },
  { question: 'Does this encoder support Unicode?', answer: 'Yes. Text is converted to UTF-8 bytes before encoding. Accented characters and symbols can use more than one byte; the originalLength field counts JavaScript UTF-16 code units, not UTF-8 bytes.' },
  { question: 'Why does the output sometimes end with =?', answer: 'Standard Base64 uses one or two = padding characters when the final group needs padding. Some inputs need no padding. Keep it unless the receiving format explicitly requires otherwise.' },
  { question: 'Is the result URL-safe Base64?', answer: 'No. This tool produces standard Base64, which can contain + and /. Base64url uses - and _ instead; its padding requirements depend on the receiving format. There is no Base64url option here.' },
  { question: 'Which part of the output should I use?', answer: 'The output panel shows a JSON object. Its result field contains the Base64 value; meta contains length information. Copy and Download currently include the displayed JSON, so extract the result value when a system expects only Base64.' },
  { question: 'Where is my text processed?', answer: 'Your text is sent to the server for encoding. Preparing a download sends the displayed output to the download-result service for temporary storage and retrieval. Avoid submitting passwords, private keys, tokens, or sensitive personal information.' },
];

function Base64EncodeGuide() {
  return (
    <section aria-labelledby="base64-guide-title" className="max-w-6xl mx-auto mt-12 mb-12 bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-8">
      <div>
        <h2 id="base64-guide-title" className="text-2xl font-bold text-gray-900 mb-4">Encode UTF-8 text as standard Base64</h2>
        <p className="text-gray-700">This tool converts pasted text to UTF-8 bytes, then represents those bytes as standard Base64. It produces no inserted line wrapping. The output panel shows a JSON object containing the encoded value in its result field.</p>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">How to use the encoded result</h2>
        <ol className="list-decimal pl-6 space-y-2 text-gray-700">
          <li>Paste non-sensitive text exactly as you want it encoded, including any spaces or line breaks.</li>
          <li>Choose Encode to Base64 and inspect the output object.</li>
          <li>Use the value of result when your receiving system expects a Base64 string. Copy and Download include the displayed JSON object, not just that value.</li>
        </ol>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Reproducible examples</h2>
        <p className="text-gray-700 mb-4">These inputs contain no trailing newline. The table shows the encoded value inside result.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-700">
            <caption className="sr-only">UTF-8 text and its standard Base64 encoding</caption>
            <thead><tr><th scope="col" className="p-3 border-b">Input text</th><th scope="col" className="p-3 border-b">UTF-8 bytes</th><th scope="col" className="p-3 border-b">Encoded value</th></tr></thead>
            <tbody>
              <tr><th scope="row" className="p-3 border-b font-normal"><code>Hello</code></th><td className="p-3 border-b">5</td><td className="p-3 border-b"><code>SGVsbG8=</code></td></tr>
              <tr><th scope="row" className="p-3 border-b font-normal"><code>café</code></th><td className="p-3 border-b">5</td><td className="p-3 border-b"><code>Y2Fmw6k=</code></td></tr>
              <tr><th scope="row" className="p-3 border-b font-normal"><code>✓</code> (checkmark)</th><td className="p-3 border-b">3</td><td className="p-3 border-b"><code>4pyT</code></td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-gray-700 my-4">For Hello, the current output panel shows:</p>
        <pre className="p-4 rounded-lg bg-gray-50 overflow-x-auto text-sm text-gray-800"><code>{'{\n  "result": "SGVsbG8=",\n  "meta": {\n    "originalLength": 5,\n    "encodedLength": 8\n  }\n}'}</code></pre>
        <p className="text-gray-700 mt-4">Adding a newline after Hello changes its encoded value to <code>SGVsbG8K</code>. Spaces, line endings, and different Unicode representations can change the bytes even when text looks similar.</p>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Padding, Unicode, and output size</h2>
        <p className="text-gray-700">Base64 represents each three-byte group with four characters. A final partial group uses = padding. Output length is four times the number of three-byte groups rounded up, so encoding usually increases size. Unicode characters may occupy several UTF-8 bytes. The metadata field originalLength counts UTF-16 code units; it is not a byte count.</p>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Encoding is not encryption</h2>
        <p className="text-gray-700">Base64 needs no secret key and provides no confidentiality. Use it for non-sensitive test values or text fields in systems that explicitly require UTF-8 Base64. It can help compare expected encodings and diagnose whitespace differences.</p>
        <p className="text-gray-700 mt-3">Standard Base64 can contain + and /. Base64url substitutes - and _; some receiving formats also omit padding. This page has no URL-safe mode. Check the required variant before using a value in a URL, token format, or integration.</p>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Limits and troubleshooting</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Empty input is rejected. Whitespace-only input is encoded as whitespace.</li>
          <li>This page accepts pasted text, with no binary-file upload, alternate character encoding, data-URI prefix, or line-wrapping control.</li>
          <li>No fixed character limit is specified by this tool. Large requests can still fail because of server, request-size, or memory constraints.</li>
          <li>If a result differs from an expected value, check whitespace, line endings, source character encoding, and whether standard Base64 or Base64url is required.</li>
        </ul>
      </div>
      <FAQPanel>
        <FAQHeading>Base64 Encode questions</FAQHeading>
        <FAQList>
          {base64FaqItems.map((item) => (
            <FAQDisclosure key={item.question}>
              <FAQQuestion>{item.question}</FAQQuestion>
              <FAQAnswer>{item.answer}</FAQAnswer>
            </FAQDisclosure>
          ))}
        </FAQList>
      </FAQPanel>
    </section>
  );
}

const csvFaqItems = [
  { question: 'Will numbers and leading zeros stay unchanged?', answer: 'Yes. Every field value remains a string, including numeric-looking identifiers such as 0012. The converter does not infer numbers, booleans, dates, or null values.' },
  { question: 'Which headers are required?', answer: 'The first non-empty record supplies the headers. Each header must contain a non-whitespace character and must be unique. Header spelling and whitespace are preserved; no headerless mode is available.' },
  { question: 'Can fields contain commas, quotes, or newlines?', answer: 'Yes. Enclose a field in double quotes to include commas or newlines, and write a literal double quote as two double quotes. LF and CRLF record endings are supported. Quotes must start at the beginning of a field, with only a delimiter or record ending after the closing quote.' },
  { question: 'What happens to blank lines and empty fields?', answer: 'Completely empty physical lines outside quoted fields are skipped. Explicit quoted empty records, empty fields within records, whitespace-only values, and newlines inside quoted fields are preserved. Empty field values become empty strings.' },
  { question: 'Can I select another delimiter?', answer: 'No. This pasted-text tool accepts comma-separated CSV only. Use the Data CSV-to-JSON upload workflow for comma, semicolon, tab, or pipe delimiters; that workflow also infers value types.' },
  { question: 'What does the output panel contain?', answer: 'The panel shows a JSON object whose result field contains the converted JSON array as text; meta reports record and column counts. Copy and Download include the displayed wrapper. Extract and parse result when you need the row array itself.' },
  { question: 'Where is my CSV processed?', answer: 'Pasted CSV is sent to the server for conversion. Preparing a download sends the displayed output to the download-result service for temporary storage and retrieval. Avoid submitting secrets or sensitive personal information.' },
];

function CsvToJsonGuide() {
  const example = 'sku,stock,note\n0012,7,"a,b"\n0013,0,';
  const rows = [{ sku: '0012', stock: '7', note: 'a,b' }, { sku: '0013', stock: '0', note: '' }];
  return (
    <section aria-labelledby="csv-guide-title" className="max-w-6xl mx-auto mt-12 mb-12 bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-8">
      <div>
        <h2 id="csv-guide-title" className="text-2xl font-bold text-gray-900 mb-4">Convert pasted CSV while preserving string values</h2>
        <p className="text-gray-700">Paste comma-separated text with a header record to create a JSON array of row objects. Values remain strings, so identifiers such as 0012 keep their leading zeros. Choose this workflow when preserving text matters more than inferring numeric types.</p>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Example: identifiers, quoted commas, and empty fields</h2>
        <h3 className="font-semibold text-gray-900 mb-2">CSV input</h3>
        <pre className="p-4 rounded-lg bg-gray-50 overflow-x-auto text-sm text-gray-800"><code>{example}</code></pre>
        <h3 className="font-semibold text-gray-900 mt-4 mb-2">Converted array inside result</h3>
        <pre className="p-4 rounded-lg bg-gray-50 overflow-x-auto text-sm text-gray-800"><code>{JSON.stringify(rows, null, 2)}</code></pre>
        <p className="text-gray-700 mt-4">The quoted comma stays inside a,b. Stock values remain strings and the last empty field becomes an empty string.</p>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Read the current output wrapper</h2>
        <p className="text-gray-700 mb-4">The panel contains a wrapper, not the row array alone. Its result field is JSON text with two-space indentation; meta reports two data records and three columns for this example. Copy and Download include this displayed object:</p>
        <pre className="p-4 rounded-lg bg-gray-50 overflow-x-auto whitespace-pre-wrap break-words text-sm text-gray-800"><code>{JSON.stringify({ result: JSON.stringify(rows, null, 2), meta: { rows: 2, columns: 3 } }, null, 2)}</code></pre>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Prepare headers and quoted fields</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Use unique, nonblank headers in the first record. Each following record must contain the same number of fields.</li>
          <li>Double quotes can enclose commas and multiline values. Inside a quoted field, two consecutive double quotes represent one literal quote.</li>
          <li>LF and CRLF delimit records; line endings inside quoted fields stay in the value.</li>
          <li>Completely empty lines outside quotes are skipped. Empty fields, explicit quoted empty records, and whitespace-only values are retained. Fields are not trimmed.</li>
        </ul>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Troubleshoot rejected CSV</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Duplicate or blank header: provide a distinct, nonblank name for every column.</li>
          <li>Wrong field count: check delimiters and quote any comma that belongs inside a value. Error record numbers count parsed records, not physical lines.</li>
          <li>Unexpected or unclosed quote: close quoted fields, double embedded quotes, and remove characters outside the closing quote before the next delimiter.</li>
          <li>No records: provide a header and any data rows. A header-only CSV returns an empty array; completely empty input is rejected.</li>
        </ul>
        <p className="text-gray-700 mt-4">There is no fixed character limit specified by this tool, but request-size and memory constraints can still cause failures. It accepts pasted comma-separated text, not file uploads.</p>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose the file-upload workflow when appropriate</h2>
        <p className="text-gray-700">Use <Link href="/all-tools/data/csv-to-json" className="font-semibold text-green-700 underline">Data CSV to JSON</Link> to upload a file or select another delimiter. Its pandas parser infers types: the same example produces numeric sku values 12 and 13, and null for the missing note. Quoting a numeric identifier does not guarantee its leading zeros survive that workflow.</p>
      </div>
      <FAQPanel>
        <FAQHeading>Pasted CSV questions</FAQHeading>
        <FAQList>{csvFaqItems.map((item) => <FAQDisclosure key={item.question}><FAQQuestion>{item.question}</FAQQuestion><FAQAnswer>{item.answer}</FAQAnswer></FAQDisclosure>)}</FAQList>
      </FAQPanel>
    </section>
  );
}

const base64DecodeFaqItems = [
  {
    question: 'What happens if my Base64 input is invalid?',
    answer: 'The decoder reports an error for malformed Base64, incorrect padding, or decoded bytes that are not valid UTF-8.',
  },
  {
    question: 'Can I decode Base64 without padding?',
    answer: 'Yes. Missing equals-sign padding and whitespace between encoded characters are accepted, provided the remaining Base64 data is valid.',
  },
  {
    question: 'Can this tool decode Base64URL?',
    answer: 'No. This decoder accepts standard Base64, not the Base64URL alphabet that uses hyphens and underscores.',
  },
  {
    question: 'Can I decode Base64 images or PDF files?',
    answer: 'This tool is designed to return UTF-8 text. It does not reconstruct Base64-encoded images, PDFs, or other binary files for download.',
  },
];
const faqItems = [
  {
    question: 'Is my data secure and private?',
    answer: 'Tool inputs are sent to our server for processing. Avoid entering passwords, private keys, access tokens, personal data, or other sensitive information.',
  },
  {
    question: 'Can I use this tool offline?',
    answer: 'No. An internet connection is required because tool inputs are sent to our server for processing.',
  },
  {
    question: 'What browsers are supported?',
    answer: 'Use a modern browser with JavaScript enabled. Behavior can vary by browser, device resources, input size, and the selected tool.',
  },
  {
    question: 'Is there a limit on input size?',
    answer: 'Input limits depend on the selected tool and server processing constraints.',
  },
  {
    question: 'Can I use this for commercial purposes?',
    answer: 'Yes. Feel free to use this tool for any purpose, including commercial projects. No attribution is required.',
  },
];

const codeToolIcons: Record<string, LucideIcon> = {
  Binary,
  Braces,
  CheckCircle,
  CheckCircle2,
  Clock,
  Code2,
  Database,
  Dice1,
  FileText,
  GitCompare,
  Hash,
  Link: Link2,
  Link2,
  Lock,
  Palette,
  QrCode,
  RotateCw,
  SearchCheck,
  Shuffle,
  Slash,
  Sparkles,
  Table,
  Thermometer,
  Type,
  Unlock,
  Watch,
  Zap,
};

function getCleanToolTitle(title: string) {
  return title.replace(/^[^A-Za-z0-9]+/, '').trim();
}

const toolSeoContent: Record<string, ToolSEOContent> = {
  'csv-json-converter': {
    whatItDoes: 'The CSV to JSON and JSON to CSV Converter provides both conversion directions in one tool. Choose CSV to JSON to turn a CSV table into a JSON array of objects, or choose JSON to CSV to turn an array of flat JSON objects into CSV rows. You can switch between the two directions using the Input Format dropdown.',
    whenToUse: [
      'When moving tabular data between spreadsheets and JSON-based applications.',
      'When converting CSV exports into JSON records for development or testing.',
      'When preparing flat JSON arrays for import into spreadsheet applications.',
      'When comparing CSV and JSON representations without opening separate converter pages.',
      'When checking whether a CSV or JSON dataset can be represented as a simple table.',
    ],
    example: {
      inputLabel: 'CSV input example',
      input: 'name,age\nAlice,30\nBob,25',
      outputLabel: 'JSON output example',
      output: '[{"name":"Alice","age":"30"},{"name":"Bob","age":"25"}]',
    },
    tips: [
      'Select CSV to JSON when your input contains comma-separated rows with a header row.',
      'Select JSON to CSV when your input is a JSON array of flat objects.',
      'For CSV to JSON, the first CSV row supplies the JSON property names.',
      'CSV values are returned as strings. For example, the CSV value 30 becomes the JSON string "30", not the number 30.',
      'Quoted CSV fields can contain commas, quotation marks, and line breaks when formatted correctly.',
      'For JSON to CSV, values containing commas, quotation marks, or line breaks are quoted and escaped for CSV output.',
      'JSON to CSV supports flat records. Nested objects and arrays are not automatically expanded into columns.',
      'CSV cannot preserve every JSON data type. Check converted values before importing them into another system.',
      'Invalid JSON, malformed quoted CSV fields, and unsupported conversion options produce errors instead of a successful conversion.',
      'Use the Input Format selector to switch directions, and replace the input with data in the newly selected format before converting again.',
    ],
    privacyNote: 'CSV and JSON input is sent to the SimplifyConvert server for processing. Avoid submitting confidential records, passwords, personal information, or other sensitive data.',
  },
  'qr-code-generator': {
    whatItDoes: 'The QR Code Generator creates a scannable QR code image from text or a website URL. Enter the content, choose an image size, and generate a PNG preview. You can download the QR code as a PNG file for use in documents, presentations, printed materials, or digital content.',
    whenToUse: [
      'When sharing a website URL that people can open by scanning a QR code.',
      'When placing a QR code on a poster, flyer, brochure, or presentation.',
      'When sharing short text through a QR code instead of asking someone to type it.',
      'When creating a QR code image for a document or digital design.',
      'When testing whether a URL or text can be encoded and recovered through QR scanning.',
    ],
    example: {
      inputLabel: 'Example URL',
      input: 'https://www.simplifyconvert.com',
      outputLabel: 'Generated result',
      output: 'A downloadable PNG QR code that encodes https://www.simplifyconvert.com',
    },
    tips: [
      'Enter the exact URL or text you want people to receive when they scan the QR code.',
      'Select 150, 200, 300, or 400 pixels for the PNG image. The default size is 200 pixels.',
      'Click Generate QR Code to create the image preview, then select Download PNG to save it.',
      'Scan the generated QR code with a phone camera before sharing or printing it.',
      'Use a larger image size when the QR code will be displayed prominently. Actual scanning reliability also depends on print quality, contrast, distance, and the amount of encoded data.',
      'Leave some clear space around the QR code. Cropping the white border can make scanning less reliable.',
      'This tool accepts up to 2,000 UTF-8 bytes of input. Non-ASCII characters can use multiple bytes.',
      'Longer URLs and text produce denser QR patterns that may be harder to scan at small image sizes.',
      'A QR code stores the supplied text or URL. It does not automatically create a shortened URL or a redirect service.',
      'A QR code containing a website address does not guarantee that the website will remain available.',
      'If the input changes, generate the QR code again before downloading the updated image.',
    ],
    privacyNote: 'The entered text or URL is sent to the SimplifyConvert server to generate the QR code. QR images are generated by the application rather than by sending the input to a third-party QR image service. Anyone who scans the QR code can read its encoded content, so avoid placing passwords, private keys, or other confidential information in it.',
  },
  'unix-timestamp-converter': {
    whatItDoes: 'The Unix Timestamp Converter converts integer Unix timestamps in seconds into UTC ISO 8601 dates and converts timezone-aware ISO 8601 date/time values back into Unix seconds. Unix time counts seconds relative to January 1, 1970 at 00:00:00 UTC.',
    whenToUse: [
      'When reading Unix timestamps from application logs or API responses.',
      'When converting a UTC date and time into Unix seconds for software development.',
      'When checking timestamps before or after January 1, 1970.',
      'When comparing dates supplied with different numeric timezone offsets.',
      'When debugging date and time values stored in databases or exchanged between systems.',
    ],
    example: {
      inputLabel: 'Unix timestamp in seconds',
      input: '1704067200',
      outputLabel: 'UTC ISO 8601 date',
      output: '2024-01-01T00:00:00.000Z',
    },
    tips: [
      'Choose Timestamp to Date/Time to convert an integer Unix timestamp into a UTC ISO 8601 date.',
      'Choose Date/Time to Timestamp to convert a date and time into integer Unix seconds.',
      'Timestamp input uses seconds, not milliseconds. For example, 1704067200 represents January 1, 2024 at 00:00:00 UTC.',
      'A 13-digit millisecond timestamp is not automatically detected or converted into seconds. Divide milliseconds by 1000 first when appropriate.',
      'Date/time input must include the full date, hours, minutes, seconds, and an explicit timezone, such as 2024-01-01T00:00:00Z.',
      'Timezone offsets are supported. For example, 2024-01-01T05:30:00+05:30 represents the same instant as 2024-01-01T00:00:00Z.',
      'The letter Z in an ISO 8601 result means UTC, not your local timezone.',
      'Dates before the Unix epoch produce negative timestamps.',
      'Fractional seconds in date/time input are accepted up to three decimal places. Output Unix seconds are rounded down to the previous whole second.',
      'Invalid calendar dates, malformed timestamps, and unsupported date formats are rejected.',
      'Unix timestamps represent instants in time. They do not contain a timezone or a calendar format.',
    ],
    privacyNote: 'Entered timestamps and dates are sent to the SimplifyConvert server for conversion. Avoid submitting confidential information in the input field.',
  },
  'temperature-converter': {
    whatItDoes: 'The Temperature Converter converts numeric temperatures between Celsius, Fahrenheit, and Kelvin. Choose the starting unit and destination unit, enter a temperature, and calculate the equivalent value. Results are displayed to two decimal places.',
    whenToUse: [
      'When converting Celsius weather readings into Fahrenheit or the reverse.',
      'When working with Kelvin temperatures in science and technical calculations.',
      'When comparing temperature measurements recorded in different units.',
      'When checking common reference temperatures such as freezing and boiling points of water.',
      'When converting positive or negative temperatures without manually applying formulas.',
    ],
    example: {
      inputLabel: 'Example input (Celsius)',
      input: '100',
      outputLabel: 'Fahrenheit result',
      output: '212.00',
    },
    tips: [
      'Select From Unit and To Unit before converting. Celsius, Fahrenheit, and Kelvin are supported.',
      'To convert Celsius to Fahrenheit, multiply by 9/5 and add 32.',
      'To convert Fahrenheit to Celsius, subtract 32 and multiply by 5/9.',
      'To convert Celsius to Kelvin, add 273.15.',
      'Water freezes at 0 degrees Celsius, equivalent to 32 degrees Fahrenheit or 273.15 Kelvin, at standard atmospheric pressure.',
      'Water boils at approximately 100 degrees Celsius, equivalent to 212 degrees Fahrenheit, at standard atmospheric pressure.',
      'The converter accepts signed decimal numbers and scientific notation, such as -40, 36.5, and 1e3.',
      'Temperatures below absolute zero are rejected: -273.15 degrees Celsius, -459.67 degrees Fahrenheit, or 0 Kelvin.',
      'Results are rounded to two decimal places for display. Use the underlying formula if additional precision is required.',
      'Enter numbers without unit symbols or suffixes. For example, enter 25 rather than 25C.',
      'This tool converts temperature values, not temperature differences or intervals.',
    ],
    privacyNote: 'Entered temperatures are sent to the SimplifyConvert server for conversion. Avoid submitting confidential information in the input field.',
  },
  'number-base-converter': {
    whatItDoes: 'The Number Base Converter converts whole numbers between binary (base 2), octal (base 8), decimal (base 10), and hexadecimal (base 16). Select the input base and output base, enter an integer, and convert it without losing precision for large integer values.',
    whenToUse: [
      'When converting decimal numbers into binary or hexadecimal for programming and debugging.',
      'When interpreting binary, octal, or hexadecimal values found in technical documentation.',
      'When checking equivalent integer representations across different number systems.',
      'When converting large integer identifiers without JavaScript floating-point rounding.',
      'When learning how the same integer is represented in different bases.',
    ],
    example: {
      inputLabel: 'Example input (decimal)',
      input: '255',
      outputLabel: 'Hexadecimal result',
      output: '0xff',
    },
    tips: [
      'Binary uses digits 0 and 1. Octal uses digits 0 through 7. Decimal uses digits 0 through 9. Hexadecimal uses digits 0 through 9 and letters A through F.',
      'Select the correct From Base and To Base options before converting.',
      'The converter accepts whole numbers only. Decimal fractions and scientific notation are not supported.',
      'Negative integers are supported. For example, decimal -10 converts to hexadecimal -0xa.',
      'Binary, octal, and hexadecimal inputs may include optional 0b, 0o, and 0x prefixes respectively.',
      'Binary results include the 0b prefix, octal results include 0o, and hexadecimal results include 0x.',
      'The converter uses arbitrary-precision integer arithmetic to avoid rounding large integers.',
      'Invalid digits are rejected instead of being silently ignored. For example, 102 is not a valid binary integer.',
      'Leading zeros do not change the numeric value. For example, decimal 00042 converts to hexadecimal 0x2a.',
      'This is an integer base converter, not a floating-point, signed fixed-width, or two-complement bit-pattern converter.',
      'Results are returned within a JSON response. The displayed output may include the result and metadata fields.',
    ],
    privacyNote: 'Entered numbers are sent to the SimplifyConvert server for conversion. Preparing a download may also send the displayed output to the download-result service. Avoid submitting confidential identifiers.',
  },
  'escape-unescape': {
    whatItDoes: 'Escape/Unescape converts special characters between readable text and escaped representations. Choose JavaScript, JSON Strings, URL, or HTML, then select Escape or Unescape. Each format follows different rules, so choose the format required by the application receiving your text.',
    whenToUse: [
      'When preparing text containing quotation marks, backslashes, or line breaks for JavaScript string content.',
      'When converting text to or from JSON string literals.',
      'When encoding a URL component such as a query parameter value.',
      'When displaying HTML special characters as text instead of markup.',
      'When decoding previously escaped text for inspection or editing.',
    ],
    example: {
      inputLabel: 'Example input (URL escape)',
      input: 'hello world',
      outputLabel: 'Escaped result',
      output: 'hello%20world',
    },
    tips: [
      'Choose an Escape Type before selecting Escape or Unescape. The default type is JavaScript.',
      'JavaScript Escape handles backslashes, quotation marks, newlines, carriage returns, tabs, backspaces, and form feeds.',
      'JavaScript Unescape recognizes common backslash sequences, including four-digit Unicode escapes such as \\u0041 and two-digit hexadecimal escapes such as \\x41.',
      'JavaScript Unescape preserves some unknown or incomplete escape sequences rather than interpreting every possible JavaScript string literal. This tool is not a JavaScript parser.',
      'JSON Escape uses JSON string serialization and includes surrounding double quotation marks in the result.',
      'JSON Unescape accepts a complete quoted JSON string or unquoted escaped string contents. Malformed JSON escapes are rejected.',
      'URL Escape uses component encoding. It encodes spaces as %20 and also encodes URL separators; it is not intended to preserve an entire URL structure.',
      'URL Unescape decodes percent-encoded components. A literal plus sign remains a plus sign rather than automatically becoming a space.',
      'HTML Escape converts ampersands, less-than and greater-than signs, and quotation marks into HTML entities.',
      'HTML Unescape decodes supported HTML5 character references, including common named and numeric entities.',
      'HTML escaping is not a complete HTML sanitizer and does not replace context-aware security handling when inserting text into scripts, styles, URLs, or HTML attributes.',
      'The converted text is returned inside the result field of a JSON response. Copying or downloading the displayed output may include the JSON wrapper.',
    ],
    privacyNote: 'Input text is sent to the SimplifyConvert server for processing. Preparing a download may also send the displayed output to the download-result service. Do not submit passwords, access tokens, API keys, or confidential text.',
  },
  'markdown-to-html': {
    whatItDoes: 'Markdown to HTML Converter turns Markdown text into HTML markup. It supports headings, paragraphs, emphasis, links, ordered and unordered lists, blockquotes, fenced code blocks, and common GitHub Flavored Markdown features such as tables. Generated HTML is sanitized to restrict potentially unsafe elements and attributes.',
    whenToUse: [
      'When converting Markdown documentation into HTML for a website.',
      'When preparing HTML markup from README files or technical notes.',
      'When checking how Markdown headings, lists, and links translate into HTML.',
      'When preparing formatted HTML content for an application that accepts HTML source.',
    ],
    example: {
      inputLabel: 'Example Markdown input',
      input: '# Welcome',
      outputLabel: 'HTML result',
      output: '<h1>Welcome</h1>',
    },
    tips: [
      'Enter Markdown in the input area and click Convert to HTML.',
      'Use # through ###### for headings, **text** for bold, and *text* for italic formatting.',
      'Use - Item for unordered lists and 1. Item for numbered lists.',
      'Use [label](https://example.com) to create a link.',
      'Wrap inline code in backticks. Use three backticks on separate lines for fenced code blocks.',
      'Common Markdown structures such as paragraphs, blockquotes, lists, and tables produce corresponding HTML elements.',
      'Generated HTML is sanitized. Script elements, event-handler attributes, and unsafe URL schemes are removed or restricted.',
      'Some raw HTML elements, custom attributes, embedded content, and advanced Markdown extensions may not be preserved.',
      'The converter produces HTML source code. It does not publish a webpage or guarantee that pasted HTML is safe in every downstream application.',
      'The generated HTML appears inside the result field of the displayed JSON response. Copying or downloading the displayed output may include that JSON wrapper rather than only the HTML markup.',
    ],
    privacyNote: 'Markdown input is sent to the SimplifyConvert server for conversion. Preparing a download may also send the displayed output to the download-result service. Avoid submitting passwords, API keys, access tokens, or confidential documents.',
  },
  'json-to-xml': {
    whatItDoes: 'JSON to XML Converter transforms valid JSON into an XML document with a root element. JSON object properties become XML elements, and array entries become repeated item elements. Text values are escaped so characters such as ampersands and less-than signs do not break XML syntax.',
    whenToUse: [
      'When preparing JSON data for an application that accepts XML documents.',
      'When inspecting how nested JSON objects and arrays can be represented as XML.',
      'When testing XML output from simple JSON records.',
      'When comparing JSON and XML structures during development.',
    ],
    example: {
      inputLabel: 'Example JSON input',
      input: '{"name":"Alice","city":"Hyderabad","active":true}',
      outputLabel: 'XML result value',
      output: '<root>\\n  <name>Alice</name>\\n  <city>Hyderabad</city>\\n  <active>true</active>\\n</root>',
    },
    tips: [
      'Paste valid JSON and choose Convert to XML. The generated XML is returned in the result field of the output JSON object.',
      'JSON object keys become XML element names. This converter supports common ASCII names beginning with a letter or underscore, followed by letters, digits, underscores, hyphens, or periods. Names beginning with xml in any capitalization are rejected.',
      'Property names containing spaces, numeric-only names, namespace prefixes, and non-ASCII element names are not supported. The converter reports an error instead of silently renaming them.',
      'Arrays are wrapped in their parent element and each entry uses an item element. Empty arrays, empty objects, and null values produce empty XML elements.',
      'Text containing ampersands, less-than signs, or greater-than signs is escaped. Characters prohibited by XML 1.0 are rejected.',
      'This is not a lossless JSON serialization format. XML text does not preserve JSON number, boolean, string, and null types automatically; empty arrays, empty objects, and null can also look identical.',
      'JSON numbers are parsed by JavaScript, so integers beyond its safe precision range may lose precision before XML conversion.',
      'Copy and Download use the displayed output JSON object, not just the XML string in its result field. Extract result when another application expects raw XML.',
    ],
    privacyNote: 'Your JSON input is sent to the SimplifyConvert server for conversion. Preparing a download also sends the displayed output to the download-result service. Avoid submitting passwords, API keys, access tokens, or confidential records.',
  },
  'json-to-csv': {
    whatItDoes: 'JSON to CSV Converter turns a JSON array of flat objects into comma-separated values. It creates CSV column headers from the object property names and writes one CSV data row for each object. Fields are quoted, and quotation marks inside headers or values are escaped by doubling them.',
    whenToUse: [
      'When exporting flat JSON records to a CSV file for spreadsheet applications.',
      'When converting API response data into a tabular format.',
      'When preparing structured records for CSV-based import workflows.',
      'When reviewing JSON data as rows and columns.',
    ],
    example: {
      inputLabel: 'Example JSON input',
      input: '[{"name":"Alice","city":"Hyderabad"},{"name":"Bob","city":"Mumbai"}]',
      outputLabel: 'CSV result',
      output: '"name","city"\n"Alice","Hyderabad"\n"Bob","Mumbai"',
    },
    tips: [
      'Enter a valid JSON array containing objects, such as [{"name":"Alice","age":30}]. A single top-level JSON object is not supported.',
      'Each object must contain flat values: strings, numbers, booleans, or null. Nested objects and arrays are rejected rather than silently flattened.',
      'CSV column names are collected from all objects, so a property present only in a later record still receives a column.',
      'Missing properties and null values produce empty CSV fields. CSV cannot distinguish those values from an original empty string.',
      'Commas, quotation marks, and line breaks inside field values are preserved using quoted CSV fields and doubled quotation marks.',
      'The output contains a header row followed by one row per JSON object. An empty array or records with no properties produce empty CSV text.',
      'JSON numbers are parsed using JavaScript number handling. Very large integers or high-precision decimal values may lose precision; use JSON strings when exact digits must be preserved.',
      'The output panel contains a JSON response object. Use its result value when you need only the CSV text.',
      'When opening CSV in spreadsheet software, review cells beginning with formula characters such as =, +, -, or @ before trusting the file.',
    ],
    privacyNote: 'Your JSON input is sent to the SimplifyConvert server for conversion. Do not submit confidential customer records, credentials, or other sensitive information.',
  },
  'case-converter': {
    whatItDoes: 'Case Converter changes text between seven capitalization and word-separator formats: UPPERCASE, lowercase, Title Case, camelCase, PascalCase, snake_case, and kebab-case. It recognizes spaces, underscores, hyphens, existing camelCase boundaries, and common acronym-to-word transitions. The tool is useful for editing text and preparing names for programming projects.',
    whenToUse: [
      'When changing sentences to uppercase, lowercase, or Title Case.',
      'When preparing camelCase or PascalCase names for variables and application code.',
      'When converting words into snake_case or kebab-case identifiers.',
      'When standardizing text copied from documents, spreadsheets, or code.',
    ],
    example: {
      inputLabel: 'Example input',
      input: 'hello_world-test',
      outputLabel: 'camelCase output',
      output: 'helloWorldTest',
    },
    tips: [
      'Enter or paste your text, choose a format from Convert To, and run the conversion.',
      'UPPERCASE and lowercase change letter casing while retaining the original spacing and punctuation.',
      'Title Case capitalizes words separated by whitespace, underscores, or hyphens. It is a simple capitalization rule, not an editorial title-style checker.',
      'camelCase starts with a lowercase word and capitalizes subsequent words, as in helloWorld.',
      'PascalCase capitalizes each word and joins them without separators, as in HelloWorld.',
      'snake_case joins detected words with underscores; kebab-case joins them with hyphens.',
      'The identifier formats recognize common camelCase boundaries and acronym transitions, such as XMLParser becoming xml_parser in snake_case.',
      'For identifier formats, repeated spaces, underscores, and hyphens are treated as word separators. Other punctuation may remain in the result, so review output before using it as a programming identifier.',
      'Word detection is based on general text patterns and may not handle every language, acronym, or naming convention.',
      'The output panel contains a JSON object. Use its result value when you need only the converted text.',
    ],
    privacyNote: 'Your text is sent to the SimplifyConvert server for case conversion. Avoid submitting passwords, access tokens, or other confidential information.',
  },
  'url-decode': {
    whatItDoes: 'URL Decoder converts percent-encoded text back into readable text using JavaScript decodeURIComponent. It decodes sequences such as %20 into a space, %26 into an ampersand, and %3D into an equals sign. The tool is intended for encoded URL components, including query parameter values. It does not parse a complete URL into separate parts.',
    whenToUse: [
      'When reading percent-encoded query parameter values.',
      'When inspecting encoded text received from an API or application.',
      'When checking whether a URL component was encoded correctly.',
      'When debugging percent-encoded spaces, symbols, or Unicode characters.',
    ],
    example: {
      inputLabel: 'Percent-encoded input',
      input: 'a%26b%3Dc',
      outputLabel: 'Decoded text',
      output: 'a&b=c',
    },
    tips: [
      'Paste the percent-encoded text and select Decode URL.',
      'The decoder uses decodeURIComponent and processes the entire input as one string.',
      'The sequence %20 becomes a space, while %2B becomes a plus sign.',
      'A literal plus sign remains a plus sign. This tool does not interpret plus signs as spaces in form-encoded query strings.',
      'Percent-encoded characters such as %26, %3D, %3F, and %2F become &, =, ?, and /.',
      'A fully encoded URL can be decoded, but the tool does not validate the resulting URL or its destination.',
      'Malformed percent escapes, incomplete sequences, and invalid UTF-8 encoding produce decoding errors.',
      'The output panel contains a JSON object. Use its result value when you need only the decoded text.',
      'Decoding is not decryption and does not make untrusted input safe to use.',
    ],
    privacyNote: 'Your input is sent to the SimplifyConvert server for decoding. Encoded strings may contain sensitive values, so avoid submitting passwords, API keys, access tokens, or confidential information.',
  },
  'url-encode': {
    whatItDoes: 'URL Encoder converts text into a percent-encoded URL component using JavaScript encodeURIComponent. It is useful for query parameter values and other individual URL components. Spaces become %20, ampersands become %26, and equals signs become %3D. This tool encodes the entire supplied input as one component; it does not preserve the structure of a complete URL.',
    whenToUse: [
      'When preparing a query parameter value that contains spaces or special characters.',
      'When encoding individual text values for use in a URL.',
      'When checking percent-encoded output during API development.',
      'When comparing URL component encoding between applications.',
    ],
    example: {
      inputLabel: 'Text to encode',
      input: 'a&b=c',
      outputLabel: 'Encoded URL component',
      output: 'a%26b%3Dc',
    },
    tips: [
      'Enter the text to encode and select Encode URL.',
      'The tool uses encodeURIComponent, which is intended for URL components rather than complete URLs.',
      'A space becomes %20 rather than a plus sign.',
      'Characters such as &, =, ?, /, and : are encoded because they can have structural meaning in URLs.',
      'Characters including letters, digits, hyphens, underscores, periods, and tildes remain unchanged.',
      'Encoding an entire URL also encodes its separators, so the result is not a directly usable URL with the same structure.',
      'The output panel contains a JSON object. Use its result value when you need only the encoded text.',
      'Malformed Unicode input, including an unpaired surrogate, can cause an encoding error.',
      'This is percent-encoding, not encryption or a security mechanism.',
    ],
    privacyNote: 'The text you enter is sent to the SimplifyConvert server for encoding. Avoid submitting passwords, API keys, access tokens, or other confidential information.',
  },
  'base32-decode': {
    whatItDoes: 'Base32 Decoder converts standard RFC 4648 Base32-encoded data back into UTF-8 text. Paste an encoded string and select Decode Base32 to view the decoded text. The decoder accepts correctly padded or unpadded uppercase Base32 and checks for invalid characters, padding, trailing bits, and malformed UTF-8. Base32 decoding is not decryption.',
    whenToUse: [
      'When reading Base32-encoded text from a compatible application or API.',
      'When checking whether an encoded string contains readable UTF-8 text.',
      'When testing RFC 4648 Base32 examples during software development.',
      'When verifying text previously produced by a standard Base32 encoder.',
    ],
    example: {
      inputLabel: 'Example Base32 input',
      input: 'JBSWY3DP',
      outputLabel: 'Decoded UTF-8 text',
      output: 'Hello',
    },
    tips: [
      'Paste an uppercase Base32 string and select Decode Base32 to display the text.',
      'Standard Base32 uses letters A-Z and digits 2-7, with equals-sign padding when required.',
      'Both correctly padded and unpadded standard Base32 inputs are accepted.',
      'Lowercase letters and embedded whitespace are not accepted by this decoder.',
      'Invalid characters, incorrect padding, invalid lengths, and nonzero trailing bits produce errors.',
      'Decoded bytes must represent valid UTF-8 text. This tool does not provide binary file downloads.',
      'Other Base32 variants, including Base32hex and Crockford Base32, are not supported.',
      'Base32 is reversible encoding, not encryption or a security mechanism.',
    ],
    privacyNote: 'Your Base32 input is sent to our server for decoding. Encoded text can contain sensitive information, so do not submit passwords, API keys, access tokens, or confidential data.',
  },
  'base32-encode': {
    whatItDoes: 'Base32 Encoder converts UTF-8 text into standard RFC 4648 Base32 using the uppercase A-Z and 2-7 alphabet. Enter text and select Encode Base32 to generate an encoded string. The output uses equals-sign padding when needed to complete eight-character blocks. Base32 is a reversible text encoding, not encryption.',
    whenToUse: [
      'When converting readable text into a Base32 representation for a compatible application.',
      'When testing RFC 4648 Base32 examples during software development.',
      'When encoding UTF-8 text for systems that expect the standard Base32 alphabet.',
      'When comparing Base32 output with another implementation.',
    ],
    example: {
      inputLabel: 'Example text input',
      input: 'Hello',
      outputLabel: 'Example Base32 output',
      output: 'JBSWY3DP',
    },
    tips: [
      'Enter text and select Encode Base32 to generate the encoded output.',
      'The encoder processes UTF-8 bytes, so characters outside ASCII can also be encoded.',
      'Standard Base32 uses uppercase letters A-Z and digits 2-7, unlike Base64.',
      'The output includes RFC 4648 equals-sign padding where required. For example, the letter f becomes MY======.',
      'Base32 output is generally longer than the original UTF-8 data and is not a compression format.',
      'Base32 encoding is not encryption, hashing, or a way to secure confidential information.',
      'Some applications use different Base32 variants or omit padding. Confirm the format expected by the receiving application.',
    ],
    privacyNote: 'Your input text is sent to our server for Base32 encoding. Do not submit passwords, API keys, private tokens, or confidential information.',
  },
  'base64-decode': {
    whatItDoes: 'Base64 Decoder converts standard Base64-encoded data back into UTF-8 text. Paste an encoded string and select Decode Base64 to view the decoded text. The decoder accepts standard Base64 with or without padding and ignores whitespace between encoded characters. It rejects malformed encodings and byte sequences that are not valid UTF-8. Base64 decoding is not decryption.',
    whenToUse: [
      'When reading Base64-encoded text from an API response or application log.',
      'When decoding UTF-8 text that was previously converted to Base64.',
      'When checking whether a Base64 string contains readable text.',
      'When inspecting encoded text examples during development or debugging.',
    ],
    example: {
      inputLabel: 'Example Base64 input',
      input: 'SGVsbG8gV29ybGQh',
      outputLabel: 'Decoded UTF-8 text',
      output: 'Hello World!',
    },
    tips: [
      'Paste a standard Base64 string and select Decode Base64 to display its text.',
      'Standard Base64 uses letters, digits, plus (+), and slash (/), with optional equals-sign padding at the end.',
      'Missing padding and whitespace between encoded characters are accepted.',
      'Malformed characters, incorrect padding, and non-canonical encodings produce errors instead of silently returning incomplete text.',
      'The output must be valid UTF-8. Base64-encoded images, PDFs, or arbitrary binary files are not supported as downloadable files by this text decoder.',
      'Base64URL uses a different alphabet with hyphens and underscores and is not accepted by this standard Base64 decoder.',
      'Base64 is an encoding format, not encryption. It does not protect sensitive information.',
    ],
    privacyNote: 'Your encoded input is sent to our server for decoding. Base64 can contain readable secrets or personal data after decoding, so do not submit passwords, API keys, tokens, or confidential information.',
  },
  'html-minifier': {
    whatItDoes: 'HTML Minifier uses html-minifier-terser to make HTML markup more compact. Paste your HTML and select Minify HTML to remove regular comments, collapse unnecessary whitespace, remove certain redundant attributes, and minify supported inline JavaScript and CSS. The amount saved depends on the source. Minification does not guarantee faster page loading or valid HTML.',
    whenToUse: [
      'When preparing HTML markup for a production website after testing.',
      'When removing unnecessary whitespace and comments from an HTML document.',
      'When comparing the size of original and minified HTML.',
      'When reducing the size of an HTML snippet before including it in a project.',
    ],
    example: {
      inputLabel: 'Example HTML input',
      input: '<div>   Hello   </div>',
      outputLabel: 'Example minified HTML',
      output: '<div>Hello</div>',
    },
    tips: [
      'Paste HTML into the input field and select Minify HTML to generate compact markup.',
      'The tool removes regular HTML comments and may simplify redundant HTML attributes.',
      'Inline JavaScript and CSS are also minified when supported by the underlying engines.',
      'Whitespace inside elements such as pre and textarea is generally preserved, but whitespace elsewhere may change.',
      'HTML templates, conditional comments, whitespace-sensitive layouts, and embedded scripts may require special handling. Test the result in its intended environment.',
      'Compression percentages depend on input size and content. Some HTML may not become smaller.',
      'Minification is not HTML validation, security analysis, or a replacement for browser testing.',
    ],
    privacyNote: 'Your HTML is sent to our server for minification. Do not submit passwords, access tokens, private configuration values, or confidential source code.',
  },
  'json-schema-validator': {
    whatItDoes: 'JSON Schema Validator checks whether JSON data satisfies the rules defined in a JSON Schema. Paste the schema into the JSON Schema field and the document to check into JSON Data, then select Validate Schema. The validator uses AJV with JSON Schema Draft-07 behavior and supports common constraints such as required properties, types, nested objects, array items, enums, numeric limits, string patterns, formats, and local references. It reports validation errors rather than changing the submitted data.',
    whenToUse: [
      'When checking whether an API response follows an expected JSON structure.',
      'When testing required fields, nested properties, or array item types.',
      'When validating sample configuration files against a documented schema.',
      'When debugging a JSON document that fails application-level validation.',
    ],
    example: {
      inputLabel: 'Example JSON Schema (paste into JSON Schema)',
      input: '{\n  "type": "object",\n  "required": ["name", "age"],\n  "properties": {\n    "name": { "type": "string", "minLength": 1 },\n    "age": { "type": "integer", "minimum": 18 }\n  }\n}',
      outputLabel: 'Example JSON Data and expected result',
      output: 'JSON Data:\n{ "name": "Alex", "age": 16 }\n\nExpected result: Invalid. The age value is below the minimum of 18.',
    },
    tips: [
      'The first input is the schema defining the rules; JSON Data is the document being checked.',
      'Both inputs must contain valid JSON. A malformed schema or data document produces an error.',
      'AJV checks constraints including required, properties, additionalProperties, items, enum, minimum, minLength, pattern, allOf, and oneOf.',
      'The validator uses Draft-07 behavior. Other JSON Schema drafts, including Draft 2019-09 and Draft 2020-12, are not supported by this configuration.',
      'Validation checks structure and declared constraints. It does not guarantee that the data is safe, accurate, or suitable for a particular application.',
      'Review reported errors and update either the JSON data or the schema as appropriate.',
    ],
    privacyNote: 'Your JSON Schema and JSON Data are sent to our server for validation. Do not submit API keys, passwords, access tokens, personal records, or confidential application data.',
  },
  'code-beautifier': {
    whatItDoes: 'Code Beautifier reformats pasted JavaScript, JSON, HTML, CSS, XML, or SQL to make it easier to read. Select the language and indentation width before running the tool. JavaScript, HTML, and CSS use syntax-aware Prettier formatting. JSON is parsed and serialized, while XML and SQL use separate formatting routines. This is a readability tool, not a code validator or optimizer.',
    whenToUse: [
      'When reviewing compact or difficult-to-read source code.',
      'When making a JavaScript or HTML snippet easier to inspect.',
      'When adjusting indentation before comparing code changes.',
      'When preparing readable examples for documentation or debugging.',
    ],
    example: {
      inputLabel: 'Example JavaScript input (select JavaScript)',
      input: 'function greet(name){return "Hello, "+name;}',
      outputLabel: 'Example formatted JavaScript',
      output: 'function greet(name) {\n  return "Hello, " + name;\n}',
    },
    tips: [
      'Choose the language that matches your input before formatting.',
      'JavaScript formatting checks syntax and may return an error for invalid code.',
      'HTML formatting may normalize markup, including adding missing closing tags; it does not validate HTML against all standards.',
      'XML uses conservative formatting that may leave whitespace-sensitive documents unchanged. SQL uses a simpler formatting routine. Review both outputs carefully.',
      'Formatting does not guarantee that code is correct, secure, faster, or smaller. Review and test the result before using it.',
    ],
    privacyNote: 'Your pasted source code is sent to our server for formatting. Do not submit passwords, access tokens, private keys, or confidential source code.',
  },
  'css-minifier': {
    whatItDoes: 'CSS Minifier uses clean-css to reduce stylesheet size by removing unnecessary whitespace and regular comments, shortening supported values, and simplifying CSS declarations. Results depend on the input, and a smaller output is not guaranteed. The tool does not validate CSS against browser standards or test visual rendering.',
    whenToUse: [
      'When preparing valid CSS for use on a website.',
      'When reducing unnecessary whitespace and comments in a stylesheet.',
      'When comparing original and minified CSS sizes.',
      'When preparing compact CSS for a production build after testing.',
    ],
    example: {
      inputLabel: 'Example CSS input',
      input: 'body { color: red; margin: 0; }',
      outputLabel: 'Example minified CSS',
      output: 'body{color:red;margin:0}',
    },
    tips: [
      'Paste CSS and run the minifier to generate a more compact version.',
      'The minifier can remove regular comments and shorten values, such as changing blue to #00f.',
      'Quoted strings and data URLs are handled by the CSS minification engine.',
      'Some incomplete CSS may be automatically repaired instead of rejected.',
      'Invalid or incomplete declarations may be changed or silently removed. A successful result does not mean the original CSS was valid.',
      'Compare the output with your original stylesheet and test it in a browser before deployment.',
    ],
    privacyNote: 'Your CSS is sent to our server for minification. Remove private URLs, credentials, access tokens, and confidential information before submitting stylesheets.',
  },
  'css-formatter': {
    whatItDoes: 'CSS Formatter uses Prettier to organize CSS stylesheets with consistent indentation, line breaks, and spacing. It makes compact or inconsistently formatted CSS easier to read while handling quoted values, comments, and data URLs. Formatting does not optimize CSS for file size or verify how styles appear in a browser.',
    whenToUse: [
      'When making compressed or difficult-to-read CSS easier to inspect.',
      'When reviewing selectors, declarations, and nested CSS rules.',
      'When preparing readable stylesheets for maintenance or code review.',
      'When formatting CSS examples for documentation or tutorials.',
    ],
    example: {
      inputLabel: 'Example CSS input',
      input: 'body{color:red;margin:0;}',
      outputLabel: 'Example formatted CSS',
      output: 'body {\n  color: red;\n  margin: 0;\n}\n',
    },
    tips: [
      'Paste CSS, select the indentation size, and run the formatter.',
      'The formatter adds consistent spacing and line breaks around CSS declarations and rules.',
      'Quoted strings, comments, and data URLs are handled without blindly splitting at commas or semicolons.',
      'Malformed CSS may return an error instead of formatted output.',
      'Formatting is not CSS minification, browser compatibility testing, or a guarantee of identical rendering in every environment.',
      'Review the output when working with experimental syntax, preprocessors, or framework-specific CSS.',
    ],
    privacyNote: 'Your CSS is sent to our server for formatting. Avoid submitting private URLs, embedded credentials, access tokens, or confidential stylesheet content.',
  },
  'sql-formatter': {
    whatItDoes: 'SQL Formatter organizes SQL queries with consistent indentation, line breaks, and uppercase keywords to make them easier to read. It uses a general SQL formatting mode and aims to preserve quoted strings, comments, and quoted identifiers. It does not execute queries, connect to databases, or validate SQL against a database schema.',
    whenToUse: [
      'When reviewing long SELECT queries with multiple columns and conditions.',
      'When making SQL snippets easier to read during debugging or code review.',
      'When preparing readable SQL examples for documentation.',
      'When cleaning up query formatting before sharing it with teammates.',
    ],
    example: {
      inputLabel: 'Example SQL input',
      input: 'select id,name from users where active=1;',
      outputLabel: 'Example formatted SQL',
      output: 'SELECT\n  id,\n  name\nFROM\n  users\nWHERE\n  active = 1;',
    },
    tips: [
      'Paste your SQL query, choose an indentation size, and run the formatter.',
      'The formatter can arrange common SQL clauses and normalize keyword capitalization.',
      'Quoted strings, comments, and quoted identifiers are handled separately from SQL keywords.',
      'The tool uses a general SQL dialect. Database-specific syntax may format differently or may not be supported.',
      'Formatting is not syntax validation and does not verify table names, columns, permissions, or query results.',
      'Review the formatted query before executing it, especially when using vendor-specific SQL features.',
    ],
    privacyNote: 'Your SQL is sent to our server for formatting. Remove passwords, access tokens, personal data, and confidential database information before submitting queries.',
  },
  'xml-formatter': {
    whatItDoes: 'XML Formatter checks XML syntax and adds indentation to simple element-only XML structures. To avoid changing text content, it leaves documents containing text, CDATA, comments, declarations, or processing instructions unchanged. Formatting may introduce whitespace between elements, so review the result if your application treats such whitespace as significant.',
    whenToUse: [
      'When making compact XML with nested elements easier to inspect.',
      'When reviewing the structure of configuration or sample XML documents.',
      'When preparing readable examples of simple element-only XML.',
      'When checking whether XML is well-formed before attempting indentation.',
    ],
    example: {
      inputLabel: 'Example XML input',
      input: '<root><item/><item/></root>',
      outputLabel: 'Example formatted XML',
      output: '<root>\n  <item/>\n  <item/>\n</root>',
    },
    tips: [
      'Paste XML and select an indentation width before formatting.',
      'Documents containing text, including whitespace-only text, are preserved unchanged to avoid altering their content.',
      'CDATA, comments, XML declarations, processing instructions, and DOCTYPE declarations are preserved by leaving the document unchanged.',
      'Indentation can introduce whitespace between elements. Check the result before using it with whitespace-sensitive XML consumers.',
      'Malformed XML returns an error. Custom DTD entity references are not supported by the current parser.',
    ],
    privacyNote: 'Your XML is sent to our server for processing. Avoid submitting credentials, private configuration values, or confidential documents.',
  },
  'xml-minifier': {
    whatItDoes: 'XML Minifier validates XML and conservatively reduces whitespace inside opening and closing tags. It preserves text nodes, CDATA content, comments, and quoted attribute values. It does not remove indentation between elements or perform aggressive XML compression, so some documents may become only slightly smaller or remain the same size.',
    whenToUse: [
      'When removing unnecessary spacing inside XML tags.',
      'When cleaning up XML with extra spaces between attributes.',
      'When reducing some tag whitespace without intentionally changing text nodes.',
      'When preparing compact examples while retaining meaningful XML content.',
    ],
    example: {
      inputLabel: 'Example XML input',
      input: '<root   id="1"   name="Test"   />',
      outputLabel: 'Example minified XML',
      output: '<root id="1" name="Test"/>',
    },
    tips: [
      'The tool normalizes whitespace inside tags but keeps spaces within quoted attribute values.',
      'Text between tags, including whitespace-only text, is retained rather than aggressively removed.',
      'CDATA, comments, processing instructions, and declarations are preserved.',
      'Compression depends on how much unnecessary tag spacing the input contains; a smaller result is not guaranteed.',
      'Malformed XML returns an error. Custom DTD entity references are not supported by the current parser.',
    ],
    privacyNote: 'Your XML is sent to our server for processing. Do not submit secrets, private keys, or confidential XML documents.',
  },
  'html-formatter': {
    whatItDoes: 'HTML Formatter uses Prettier to arrange HTML markup with consistent indentation and line breaks. Paste HTML, select an indentation width, and format it for easier reading. Prettier may normalize markup or insert missing closing tags; this tool is not an HTML standards validator.',
    whenToUse: [
      'When making a compact HTML snippet easier to read.',
      'When inspecting nested containers, headings, and paragraphs.',
      'When reviewing markup before editing a page or template.',
      'When preparing formatted HTML examples for documentation.',
    ],
    example: {
      inputLabel: 'Example HTML input',
      input: '<div><br><p>Hello</p></div>',
      outputLabel: 'Example formatted HTML',
      output: '<div>\n  <br />\n  <p>Hello</p>\n</div>',
    },
    tips: [
      'HTML void elements such as br and img do not need closing tags; the formatter may display them with a trailing slash.',
      'The formatter can automatically normalize certain incomplete HTML structures.',
      'Formatting does not check accessibility, semantic correctness, security, or complete HTML5 conformance.',
      'Review script, style, template, and framework-specific markup carefully after formatting.',
      'Use the separate HTML Validator for a basic structural check, and a standards validator for more comprehensive validation.',
    ],
    privacyNote: 'Your HTML is sent to our server for formatting. Avoid submitting private information, credentials, access tokens, or confidential application markup.',
  },
  'code-minifier': {
    whatItDoes: 'The Code Minifier reduces unnecessary characters in supported source formats. Select JavaScript, HTML, CSS, JSON, or XML, paste your code, and run the tool to generate a more compact result. Minification can reduce transfer size, but results vary by language and input.',
    whenToUse: [
      'When preparing supported JavaScript or CSS files for deployment.',
      'When compacting JSON data for storage or transfer.',
      'When reducing unnecessary formatting in HTML or XML.',
      'When comparing readable source code with a compact version.',
    ],
    example: {
      inputLabel: 'Example JSON input (select JSON)',
      input: '{\\n  "name": "Ada",\\n  "active": true\\n}',
      outputLabel: 'Example minified JSON',
      output: '{"name":"Ada","active":true}',
    },
    tips: [
      'Choose the correct language before processing your code.',
      'Test minified JavaScript in your application before deployment.',
      'Keep an original readable copy because minification may remove formatting and comments.',
      'Invalid source input may produce an error instead of a minified result.',
      'Minification does not guarantee that every file becomes smaller or that code is optimized for runtime performance.',
    ],
    privacyNote: 'Your source code is sent to our server for processing. Do not submit credentials, private keys, access tokens, or proprietary source code that you cannot share.',
  },
  'markdown-validator': {
    whatItDoes: 'Markdown Validator performs basic checks on pasted Markdown text to help identify possible formatting mistakes. It looks for unclosed fenced code blocks and empty link text or URLs in simple inline links. It supports backtick and tilde code fences and reports possible issues as warnings. Markdown is a permissive format, so the tool does not reject documents merely because a formatting warning is present. This is not a complete CommonMark or GitHub Flavored Markdown compliance validator.',
    whenToUse: [
      'When reviewing Markdown documentation before publishing it.',
      'When checking whether a fenced code example might be missing its closing marker.',
      'When looking for empty link text or URLs in simple Markdown links.',
      'When reviewing README files, notes, or articles written in Markdown.',
    ],
    example: {
      inputLabel: 'Example Markdown',
      input: '```js\nconsole.log("Hello");',
      outputLabel: 'Expected diagnostic result',
      output: 'Basic Markdown check completed with 1 warning(s)',
    },
    tips: [
      'Close fenced code blocks using the same marker character and at least as many backticks or tildes as the opening fence.',
      'Use a meaningful description for link text instead of leaving it empty.',
      'Check that links point to the intended destination; this tool does not test whether URLs are reachable.',
      'Warnings indicate possible issues, not necessarily invalid Markdown.',
      'The checker does not fully parse Markdown links, nested formatting, tables, HTML, or extensions.',
      'A result with no warnings does not guarantee that the document renders as intended in every Markdown application.',
    ],
    privacyNote: 'Your Markdown text is sent to our server for these checks. Remove confidential documentation, credentials, tokens, and private information before submitting it.',
  },
  'yaml-validator': {
    whatItDoes: 'YAML Validator checks whether pasted YAML can be parsed as a single YAML document. It checks mappings, sequences, indentation, quoted values, flow collections, anchors, aliases, and duplicate mapping keys. Valid input receives a success result; malformed input receives a parsing error, with line and column information when the parser provides it. The tool checks syntax, not whether configuration settings are correct for a particular application.',
    whenToUse: [
      'When checking YAML configuration files before using them in an application.',
      'When troubleshooting indentation or punctuation errors in YAML.',
      'When reviewing nested mappings, lists, anchors, and aliases.',
      'When investigating duplicate keys or malformed quoted values.',
    ],
    example: {
      inputLabel: 'Example invalid YAML',
      input: 'name: First\nname: Second',
      outputLabel: 'Expected validation result',
      output: 'Invalid YAML: duplicated mapping key',
    },
    tips: [
      'Use spaces for indentation rather than tabs. YAML does not require indentation to be in multiples of two spaces.',
      'Keep indentation consistent with the intended nesting of mappings and sequences.',
      'Quote values when needed, especially when special characters could change how a value is interpreted.',
      'Avoid duplicate keys in the same mapping; this validator reports them as errors.',
      'The tool accepts one YAML document per submission. Multiple documents separated by --- are rejected.',
      'A valid result does not verify Kubernetes, Docker Compose, CI/CD, or other application-specific configuration rules.',
      'Custom YAML tags are not supported by the current parser configuration.',
    ],
    privacyNote: 'Your YAML input is sent to our server for validation. Remove passwords, API keys, tokens, private configuration values, and confidential information before submitting it.',
  },
  'xml-validator': {
    whatItDoes: 'XML Validator checks whether pasted XML is well-formed using a strict XML parser. It checks element nesting, quoted and unique attributes, entity references, namespace prefixes, comments, and whether the document contains exactly one root element. It reports whether the syntax check passed and provides an error message when parsing fails. It does not validate XML against an XSD or DTD schema.',
    whenToUse: [
      'When checking an XML configuration file for syntax mistakes.',
      'When investigating malformed XML in an API response or integration.',
      'When checking element nesting, attributes, and namespace prefixes.',
      'When reviewing sample XML before using it in another system.',
    ],
    example: {
      inputLabel: 'Example invalid XML',
      input: '<root><item></root>',
      outputLabel: 'Expected validation result',
      output: 'Invalid XML: mismatched closing element',
    },
    tips: [
      'Every XML document must contain exactly one root element.',
      'Close nested elements in the reverse order in which they were opened.',
      'Quote attribute values and avoid duplicate attribute names on the same element.',
      'Escape literal ampersands in text as &amp; and use valid entity references.',
      'Declare namespace prefixes before using them in element or attribute names.',
      'A successful syntax check does not prove that the XML follows an XSD, DTD, or application-specific data contract.',
      'The current parser does not resolve custom DTD entity references; XML relying on those entities may be rejected.',
    ],
    privacyNote: 'Your pasted XML is sent to our server for validation. Do not submit passwords, access tokens, private configuration values, or confidential documents.',
  },
  'html-validator': {
    whatItDoes: 'The HTML Validator performs a basic structural check of pasted HTML markup. It tracks opening and closing tags and reports certain unmatched or unclosed elements. This is a lightweight troubleshooting tool, not a full HTML5 conformance, accessibility, or security validator.',
    whenToUse: [
      'When checking a short HTML snippet for an unclosed container.',
      'When investigating unexpected nesting or extra closing tags.',
      'When reviewing markup before inserting it into a page or template.',
      'When performing an initial check before more comprehensive browser or standards testing.',
    ],
    example: {
      inputLabel: 'Example HTML input',
      input: '<div><p>Hello</p>',
      outputLabel: 'Example validation result',
      output: 'Invalid HTML: Unclosed tag(s): <div>',
    },
    tips: [
      'A passing result only means this basic checker did not detect a structural problem.',
      'The checker does not verify full HTML5 parsing rules, attribute correctness, accessibility, or semantic markup.',
      'HTML void elements such as <br> and <img> do not need closing tags.',
      'Use browser developer tools or a dedicated standards validator for comprehensive HTML validation.',
    ],
    privacyNote: 'Your HTML markup is sent to our server for processing. Remove passwords, private data, access tokens, and confidential embedded content before submitting it.',
  },
  'regex-tester': {
    whatItDoes: 'The Regex Tester evaluates a JavaScript regular expression against the Sample Text you provide. Enter the pattern in the main input, supply example text, and optionally adjust regex flags. The result reports match values, positions, and captured groups, or an error when the expression is invalid.',
    whenToUse: [
      'When testing patterns that find numbers, words, or other text fragments.',
      'When debugging character classes, anchors, and capturing groups.',
      'When comparing matching behavior with different JavaScript regex flags.',
      'When checking a pattern against representative sample input before using it in code.',
    ],
    example: {
      inputLabel: 'Example pattern and sample text',
      input: 'Pattern: \\d+\\nSample Text: Order 123 and 456\\nFlags: g',
      outputLabel: 'Example result',
      output: 'Found 2 match(es)\\n123 at index 6\\n456 at index 14',
    },
    tips: [
      'Enter only the pattern in the main input; enter the text to search in Sample Text.',
      'The g flag finds multiple matches rather than stopping after the first.',
      'Invalid patterns or unsupported flags produce a validation error.',
      'An empty match is possible for patterns such as a*; review results carefully.',
      'Regex matching does not guarantee that an email address, URL, or other real-world value is valid.',
    ],
    privacyNote: 'Patterns and sample text are sent to our server for processing. Use synthetic examples instead of sensitive records, credentials, or personal information.',
  },
  'json-validator': {
    whatItDoes: 'The JSON Validator checks whether pasted JSON is valid, highlights syntax problems, and helps you confirm that objects, arrays, strings, numbers, booleans, and null values are structured correctly before you use the data in an API, configuration file, or application.',
    whenToUse: [
      'Before sending JSON payloads to an API endpoint.',
      'When debugging malformed responses from a backend service.',
      'Before saving JSON in application configuration or environment files.',
      'When you need to confirm commas, quotes, brackets, and nesting are correct.',
    ],
    example: {
      inputLabel: 'Example JSON input',
      input: '{\n  "name": "SimplifyConvert",\n  "active": true,\n  "tools": ["validator", "formatter"]\n}',
      outputLabel: 'Example validation result',
      output: 'Valid JSON. The object contains a string, a boolean, and an array with two string values.',
    },
    tips: [
      'Use double quotes around JSON object keys and string values.',
      'Remove trailing commas after the final item in an object or array.',
      'Check that every opening brace or bracket has a matching closing character.',
      'Validate copied API responses before pasting them into production code.',
    ],
    privacyNote: 'Your JSON input is sent to our server for processing. Avoid submitting secrets, tokens, or sensitive customer data.',
  },
  'json-to-yaml': {
    whatItDoes: 'The JSON to YAML Converter parses valid JSON and serializes it as YAML using the js-yaml library. It supports nested objects, arrays, strings, numbers, booleans, null values, Unicode text, and empty collections. The resulting YAML is intended for configuration files, development workflows, and data inspection.',
    whenToUse: [
      'When converting JSON configuration into a more readable YAML format.',
      'When preparing application settings or deployment configuration.',
      'When inspecting nested JSON objects and arrays as YAML.',
      'When migrating JSON data into systems that accept YAML documents.',
    ],
    example: {
      inputLabel: 'Example JSON input',
      input: '{\\n  "name": "Alice",\\n  "city": "Hyderabad",\\n  "active": true\\n}',
      outputLabel: 'Example YAML result',
      output: 'name: Alice\\ncity: Hyderabad\\nactive: true',
    },
    tips: [
      'Enter valid JSON with quoted property names. JSON comments, trailing commas, and unquoted keys are not accepted.',
      'Nested JSON objects and arrays are converted into corresponding YAML mappings and sequences.',
      'Strings containing special characters, YAML keywords, or line breaks are quoted or formatted as needed to preserve their values.',
      'Empty objects and arrays are preserved as {} and [] rather than being converted to null.',
      'JSON numbers are parsed using JavaScript numeric precision. Very large integers may lose precision before YAML is generated.',
      'JSON cannot represent comments, so this tool cannot transfer comments from an original configuration file.',
      'The conversion does not validate application-specific YAML configuration rules or schemas.',
      'The output panel displays a JSON response containing the generated YAML in its result field. Copy and Download use the displayed response rather than only the YAML text.',
    ],
    privacyNote: 'Your JSON input is sent to the SimplifyConvert server for conversion. Avoid submitting API keys, passwords, access tokens, or confidential configuration values.',
  },
  'color-converter': {
    whatItDoes: 'Color Converter changes six-digit hexadecimal color codes into RGB values and converts RGB channel values back into six-digit HEX codes. Select the input format, enter a color, and convert it to the other format.',
    whenToUse: [
      'When translating HEX colors from a design file into RGB values for CSS or development.',
      'When converting RGB values into HEX codes for design systems and style guides.',
      'When checking exact red, green, and blue channel values in a color.',
      'When preparing consistent color references for websites, apps, and prototypes.',
    ],
    example: {
      inputLabel: 'Example HEX input',
      input: '#FF8800',
      outputLabel: 'RGB output',
      output: 'rgb(255, 136, 0)',
    },
    tips: [
      'Select Hexadecimal (HEX) to convert a six-digit HEX code such as #FF8800 into RGB.',
      'HEX input accepts six hexadecimal digits, with or without one leading # symbol.',
      'Select RGB to convert values such as rgb(255, 136, 0) into #FF8800.',
      'RGB input also accepts three comma-separated numbers or three space-separated numbers.',
      'Each RGB channel must be a whole number between 0 and 255.',
      'The converter rejects malformed input rather than silently extracting numbers from unrelated text.',
      'Three-digit shorthand HEX, eight-digit HEX, transparency, and alpha channels are not supported.',
      'HEX output uses uppercase letters. Both formats describe the same red, green, and blue color channels.',
      'The converted value is returned in a JSON response and displayed in the result area.',
    ],
    privacyNote: 'Color values are submitted to the SimplifyConvert server for conversion. No image or design file upload is required.',
  },
  'random-string-generator': {
    whatItDoes: 'Random String Generator creates strings using a selected character set. Choose alphanumeric characters, letters only, numbers only, or hexadecimal characters, then set the length and number of strings to generate.',
    whenToUse: [
      'When creating sample identifiers for development and testing.',
      'When filling mockups and prototypes with example codes or reference values.',
      'When checking how forms, tables, and layouts display strings of different lengths.',
      'When generating temporary non-sensitive test data.',
    ],
    example: {
      inputLabel: 'Example settings',
      input: 'Length: 8; Generate Strings: 3; Character Set: Numeric',
      outputLabel: 'Example output (randomized)',
      output: '58210473\\n09376125\\n74628019',
    },
    tips: [
      'Choose Alphanumeric for uppercase letters, lowercase letters, and digits.',
      'Choose Letters only for A-Z and a-z without numbers.',
      'Choose Numbers only for digits 0-9.',
      'Choose Hexadecimal for digits 0-9 and lowercase letters a-f.',
      'Set String Length to a whole number from 1 to 256. The default is 10.',
      'Set Generate Strings to a whole number from 1 to 100. The default is 1.',
      'When generating multiple strings, each result appears on a separate line.',
      'Results use cryptographically secure random bytes with unbiased character selection, but uniqueness is not guaranteed.',
      'Do not assume a random string is suitable as a password, authentication token, or API secret without evaluating the character set, length, and security requirements.',
      'The generated output is returned in a JSON response and displayed in the result area.',
    ],
    privacyNote: 'Random strings are generated on the SimplifyConvert server. This tool does not require you to upload files or submit personal text.',
  },
  'lorem-ipsum-generator': {
    whatItDoes: 'Lorem Ipsum Generator creates randomized placeholder text for layouts, prototypes, and design testing. Choose to generate individual words, complete sentences, or paragraphs, then specify how many you need.',
    whenToUse: [
      'When testing typography, line spacing, and text wrapping in a website or app layout.',
      'When filling mockups, wireframes, and design prototypes before final copy is available.',
      'When checking how cards, columns, and responsive layouts handle different amounts of text.',
      'When preparing sample content for non-production demonstrations.',
    ],
    example: {
      inputLabel: 'Example settings',
      input: 'Generate: Words; Quantity: 5',
      outputLabel: 'Example output (randomized)',
      output: 'lorem ipsum dolor sit amet',
    },
    tips: [
      'Choose Words for a specific number of space-separated placeholder words.',
      'Choose Sentences for randomized sentences ending in periods. Each sentence contains approximately 4 to 11 words.',
      'Choose Paragraphs for blocks of text separated by blank lines. Each paragraph contains approximately 3 to 6 sentences.',
      'Set Quantity to a whole number from 1 to 100. The default is 5 sentences.',
      'Results are randomized from a fixed Lorem Ipsum vocabulary, so generating again can produce different text.',
      'Placeholder text is useful for testing layout, but it does not replace meaningful final website content.',
      'Check designs again with realistic headings, labels, translations, and accessibility content before publishing.',
      'The generated text is returned in a JSON response and can be copied from the result area.',
    ],
    privacyNote: 'Lorem Ipsum text is generated on the SimplifyConvert server. This tool does not require you to submit personal text or upload a file.',
  },
  'hash-generator': {
    whatItDoes: 'Hash Generator calculates a hexadecimal digest from text using MD5, SHA-1, SHA-256, or SHA-512. The same text and algorithm produce the same digest, while changing even one character usually changes the result.',
    whenToUse: [
      'When comparing text digests to check whether content has changed.',
      'When creating reproducible hash values for development or testing.',
      'When checking a text value against a known digest generated using the same algorithm and encoding.',
      'When learning how different hashing algorithms produce different digest lengths.',
    ],
    example: {
      inputLabel: 'Example input (SHA-256)',
      input: 'hello',
      outputLabel: 'SHA-256 hexadecimal digest',
      output: '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
    },
    tips: [
      'Enter text, select an algorithm, and choose Generate Hash. SHA-256 is selected by default.',
      'MD5 produces 32 hexadecimal characters, SHA-1 produces 40, SHA-256 produces 64, and SHA-512 produces 128.',
      'The hash depends on the exact input, including spaces, punctuation, capitalization, and line breaks.',
      'MD5 and SHA-1 have known collision weaknesses and should not be used for security-sensitive integrity or signature applications.',
      'For general cryptographic hashing, prefer SHA-256 or SHA-512 when supported by your application.',
      'Hashing is not encryption: a digest cannot simply be decrypted to recover the original text.',
      'Do not use these fast, unsalted digests directly to store user passwords. Use a dedicated password-hashing scheme such as Argon2id, scrypt, or bcrypt.',
      'This tool hashes text, not uploaded files, and returns the digest inside a JSON response.',
    ],
    privacyNote: 'Text submitted to Hash Generator is processed by the SimplifyConvert server. Avoid entering passwords, secret tokens, or other sensitive information.',
  },
  'uuid-generator': {
    whatItDoes: 'UUID Generator creates random version 4 UUIDs in the standard 8-4-4-4-12 hexadecimal format. Generate one or multiple identifiers, with an option to display hexadecimal letters in uppercase.',
    whenToUse: [
      'When assigning identifiers to application records or test data.',
      'When creating IDs for development fixtures and sample datasets.',
      'When generating multiple UUIDs for imports or testing.',
      'When an application requires a UUID v4 identifier.',
    ],
    example: {
      inputLabel: 'Example settings',
      input: 'Count: 2; Uppercase: off',
      outputLabel: 'Example UUID format',
      output: '550e8400-e29b-41d4-a716-446655440000',
    },
    tips: [
      'Choose How many UUIDs to generate between 1 and 1000 identifiers in a single request.',
      'Select Uppercase to display hexadecimal letters as A-F rather than a-f. Letter case does not change the underlying UUID value.',
      'Select Generate UUID to create a fresh random set. Each generated UUID follows version 4 formatting.',
      'UUID v4 values are randomly generated, making collisions extremely unlikely, but uniqueness is not mathematically guaranteed.',
      'UUIDs are identifiers, not passwords, authentication tokens, or a substitute for access controls.',
      'Generated UUIDs are returned as newline-separated text inside the result field of the JSON response.',
      'The tool does not register IDs in your database or check whether an identifier is already in use.',
    ],
    privacyNote: 'UUIDs are generated by the SimplifyConvert server. No personal text input is required for this tool.',
  },
  'slug-generator': {
    whatItDoes: 'Slug Generator converts text into lowercase, hyphen-separated ASCII slugs suitable for common URL path naming conventions. It removes punctuation, combines repeated separators, and converts many accented Latin letters into their unaccented equivalents.',
    whenToUse: [
      'When creating readable URL paths for articles, pages, or products.',
      'When turning headings into consistent lowercase slugs.',
      'When replacing spaces and underscores with hyphens.',
      'When preparing common accented Latin text for ASCII-only URLs.',
    ],
    example: {
      inputLabel: 'Example text',
      input: 'Café Menu & Specials!',
      outputLabel: 'Generated slug',
      output: 'cafe-menu-specials',
    },
    tips: [
      'Enter a page title or phrase and select Generate Slug. The tool requires non-empty input.',
      'Uppercase letters become lowercase, while spaces, underscores, and repeated hyphens become single hyphens.',
      'Punctuation such as commas, exclamation marks, and ampersands is removed rather than converted into words.',
      'Common accented Latin characters are normalized: Café Menu becomes cafe-menu and Résumé Builder becomes resume-builder.',
      'The output uses ASCII letters, digits, and hyphens. Non-Latin scripts such as Hindi and Telugu are not transliterated and may produce an empty slug.',
      'Input containing only punctuation may also produce an empty slug. Review the generated result before using it in a URL.',
      'Generating a slug does not check whether a URL already exists, create a redirect, or guarantee SEO rankings.',
      'The output panel displays a JSON response containing the slug in its result field. Copy and Download use the displayed response rather than only the slug.',
    ],
    privacyNote: 'Your text is sent to the SimplifyConvert server to generate the slug. Avoid submitting passwords, access tokens, or confidential content.',
  },
  'html-decode': {
    whatItDoes: 'HTML Decoder converts HTML character references into readable text. It supports common named entities such as &amp;, &lt;, &gt;, &quot;, &nbsp;, and &copy;, along with decimal and hexadecimal numeric character references.',
    whenToUse: [
      'When copied text contains HTML entities instead of readable characters.',
      'When decoding HTML-escaped text from a website or document.',
      'When converting numeric character references into Unicode characters.',
      'When inspecting encoded text without manually replacing each entity.',
    ],
    example: {
      inputLabel: 'Encoded HTML text',
      input: '&lt;p&gt;Tom &amp; Jerry&lt;/p&gt;',
      outputLabel: 'Decoded text',
      output: '<p>Tom & Jerry</p>',
    },
    tips: [
      'Paste text containing HTML entities and select Decode HTML. Input is required.',
      'Named references such as &amp;, &copy;, &euro;, and &nbsp; are supported.',
      'Decimal references such as &#39; and &#8364;, and hexadecimal references such as &#x27; and &#x1F600;, are decoded into characters.',
      'HTML5 decoding also recognizes certain named references without a semicolon. Unknown references generally remain unchanged.',
      'The decoder processes entity references once. For example, &amp;lt; becomes &lt;, not a less-than character.',
      'Decoded text may contain real HTML markup characters. Do not insert untrusted decoded text into an HTML document as markup without appropriate sanitization.',
      'This tool decodes character references; it does not remove tags, clean HTML, or decrypt protected information.',
      'The output panel displays a JSON response containing the decoded text in its result field. Copy and Download use the displayed response rather than only the decoded string.',
    ],
    privacyNote: 'Your submitted text is sent to the SimplifyConvert server for decoding. Avoid submitting passwords, access tokens, or confidential content.',
  },
  'html-encode': {
    whatItDoes: 'HTML Encoder converts five special characters in text into HTML character references: ampersand, less-than, greater-than, double quotation mark, and apostrophe. This helps display text containing HTML markup characters as text instead of interpreting them as HTML tags.',
    whenToUse: [
      'When displaying HTML markup examples as readable text.',
      'When preparing ordinary text for inclusion in HTML text content.',
      'When inspecting how special characters become HTML entities.',
      'When converting copied snippets into escaped HTML text.',
    ],
    example: {
      inputLabel: 'Example text input',
      input: '<p>Tom & Jerry</p>',
      outputLabel: 'Encoded HTML text',
      output: '&lt;p&gt;Tom &amp; Jerry&lt;/p&gt;',
    },
    tips: [
      'Paste text containing HTML special characters and select Encode to HTML. Input is required; empty submissions are rejected.',
      'The converter replaces & with &amp;, < with &lt;, > with &gt;, double quotes with &quot;, and apostrophes with &#x27;.',
      'Ordinary letters, numbers, spaces, line breaks, and Unicode characters are left unchanged.',
      'Existing HTML entities are not detected or preserved. For example, &amp; becomes &amp;amp; because its ampersand is encoded again.',
      'The converter escapes characters rather than removing HTML tags. Encoded markup appears as text when inserted into an appropriate HTML text context.',
      'This is not an HTML sanitizer or a universal defense against cross-site scripting. HTML attributes, JavaScript, CSS, and URLs require context-specific handling.',
      'The output panel displays a JSON response containing the encoded text in its result field. Copy and Download use the displayed response rather than only the encoded string.',
    ],
    privacyNote: 'Your text is sent to the SimplifyConvert server for encoding. Avoid submitting passwords, API keys, access tokens, or confidential content.',
  },
  'yaml-to-json': {
    whatItDoes: 'YAML to JSON Converter parses YAML documents and converts their data into formatted JSON using the js-yaml library. It supports nested mappings, sequences, strings, numbers, booleans, null values, Unicode, multiline text, and common YAML anchors and aliases. The tool reports errors for malformed YAML rather than attempting to guess the intended structure.',
    whenToUse: [
      'When converting YAML configuration into JSON for an application or API.',
      'When inspecting nested YAML mappings and sequences as JSON objects and arrays.',
      'When migrating configuration data between YAML-based and JSON-based systems.',
      'When checking how YAML values are represented after JSON serialization.',
    ],
    example: {
      inputLabel: 'Example YAML input',
      input: 'name: Alice\\ncity: Hyderabad\\nactive: true',
      outputLabel: 'Example JSON result',
      output: '{\\n  "name": "Alice",\\n  "city": "Hyderabad",\\n  "active": true\\n}',
    },
    tips: [
      'Paste a YAML document and select Convert to JSON. YAML mappings become JSON objects, while YAML sequences become JSON arrays.',
      'Nested mappings and arrays are preserved. The converter also supports root-level arrays and scalar values such as numbers or strings.',
      'Quoted YAML values such as "00123" remain strings. Unquoted values are interpreted according to the YAML parser rules.',
      'Literal and folded multiline YAML strings are converted to JSON strings with their resulting line breaks or spaces.',
      'Common YAML anchors, aliases, and merge keys are supported. Their resolved data is represented in the JSON output rather than retaining the YAML anchor syntax.',
      'Empty mappings and sequences become {} and []. Empty or whitespace-only input is rejected.',
      'Malformed indentation, invalid flow collections, duplicate mapping keys, unknown aliases, and multiple YAML documents produce errors.',
      'YAML comments, formatting, anchors, and original quoting styles are not preserved because JSON does not represent those features.',
      'Some YAML-specific values and numeric formats may not have an exact JSON equivalent. Review converted numbers and values before using the result in production.',
      'This converter does not validate application-specific configuration rules or JSON schemas.',
      'The output panel displays a JSON response containing the converted JSON text in its result field. Copy and Download use the displayed response rather than only the converted JSON text.',
    ],
    privacyNote: 'Your YAML input is sent to the SimplifyConvert server for conversion. Avoid submitting API keys, passwords, access tokens, or confidential configuration values.',
  },
  'xml-to-json': {
    whatItDoes: 'XML to JSON Converter parses well-formed XML and returns a JSON representation of its elements. Nested elements become nested objects, repeated sibling elements become arrays, and XML entities and CDATA are decoded into text. Attributes are represented using a $ object, while element text is represented using _ when attributes or child elements are also present.',
    whenToUse: [
      'When integrating XML feeds with JavaScript or JSON-based applications.',
      'When inspecting nested XML elements, attributes, and repeated records.',
      'When preparing XML exports or configuration data for further processing.',
      'When comparing XML structures with JSON during debugging.',
    ],
    example: {
      inputLabel: 'Example XML input',
      input: '<user>\\n  <name>Ada</name>\\n  <role>developer</role>\\n</user>',
      outputLabel: 'Example JSON result',
      output: '{\\n  "user": {\\n    "name": "Ada",\\n    "role": "developer"\\n  }\\n}',
    },
    tips: [
      'Paste a complete, well-formed XML document and choose Convert to JSON. Malformed XML, multiple root elements, and characters prohibited by XML 1.0 are rejected.',
      'A simple element such as <name>Ada</name> becomes a string property. Nested elements become nested JSON objects.',
      'Repeated sibling elements with the same name become arrays. A single occurrence remains a single value.',
      'XML attributes are stored under $. For example, <user id="42">Ada</user> becomes a user object containing $ with id and _ with Ada.',
      'Escaped XML entities such as &amp; and &lt; are decoded. CDATA content becomes text rather than retaining CDATA markup.',
      'Empty elements become empty strings. XML values are strings unless you explicitly convert them to numbers, booleans, or other types afterward.',
      'Whitespace around element text is trimmed. Mixed text and child elements are represented separately, so their original ordering cannot be reconstructed reliably.',
      'Namespace prefixes and declarations are retained as names and attributes, but namespace meanings are not resolved into a separate data model.',
      'Certain element names can conflict with the reserved $ and _ representation. Ambiguous combinations are rejected rather than silently overwriting data.',
      'This conversion is not lossless. XML comments, processing instructions, formatting, and some document-specific semantics are not preserved.',
      'The output panel contains a JSON response object. Copy and Download use the displayed response, not only the converted JSON string inside its result field.',
    ],
    privacyNote: 'Your XML input is sent to the SimplifyConvert server for conversion. Preparing a download also sends the displayed output to the download-result service. Avoid submitting passwords, API keys, access tokens, or confidential records.',
  },
  'cron-expression-generator': {
    whatItDoes: 'The Cron Expression Generator creates common five-field cron schedules from presets and checks manually entered expressions. Choose a schedule to fill the editable input, or enter your own minute, hour, day-of-month, month, and day-of-week fields. Validation checks expression syntax and supported date combinations; it does not create a cron job, run commands, or confirm that a scheduler will execute the job.',
    whenToUse: [
      'When creating a recurring schedule for a cron-compatible task runner.',
      'When checking a five-field expression before adding it to a crontab.',
      'When preparing weekday, hourly, daily, or interval-based schedules.',
      'When investigating an invalid field, range, list, or step value.',
    ],
    example: {
      inputLabel: 'Example generated cron expression',
      input: '*/15 * * * *',
      outputLabel: 'Meaning and validation result',
      output: 'Every 15 minutes. Valid five-field cron expression.',
    },
    tips: [
      'Field order is minute (0-59), hour (0-23), day-of-month (1-31), month (1-12), and day-of-week (0-7, where 0 and 7 represent Sunday).',
      'Use * for all allowed values, */15 for a step of 15, 1-5 for a range, and 0,15,30,45 for a list.',
      'Month and weekday names such as JAN and MON-FRI are supported.',
      'The builder provides five common presets. For other schedules, edit the expression directly before clicking Validate Cron.',
      'Only five-field expressions are accepted. Seconds fields, year fields, and Quartz-specific syntax are not supported.',
      'Cron schedules use the timezone and cron implementation configured on the system that runs the job. This tool does not set that timezone.',
      'Validation does not execute a job or guarantee that another cron implementation accepts the same expression.',
      'The output panel contains a JSON validation result. Copy and Download use that JSON, not just the cron expression; copy the expression from the input when configuring a scheduler.',
    ],
    privacyNote: 'Your cron expression is sent to our server for validation. Selecting a preset fills the input in your browser. The tool does not access your crontab, install jobs, or execute commands. Avoid including confidential information in submitted text.',
  },
  'jwt-decoder': {
    whatItDoes: 'The JWT Decoder splits a JSON Web Token into its header and payload so you can inspect claims such as issuer, subject, audience, expiration time, and custom application fields. Decoding makes the token readable, but it does not prove the signature is valid.',
    whenToUse: [
      'When debugging authentication or authorization flows.',
      'When checking token claims such as exp, iss, aud, sub, or roles.',
      'When inspecting the unverified exp claim and other decoded token fields during debugging.',
      'When comparing tokens returned by staging, local, and production identity providers.',
    ],
    example: {
      inputLabel: 'Example JWT input',
      input: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJyb2xlIjoiYWRtaW4ifQ.signature',
      outputLabel: 'Example decoded payload (signature not verified)',
      output: '{\n  "sub": "123",\n  "role": "admin"\n}',
    },
    tips: [
      'Decoding a JWT is not the same as verifying its signature.',
      'Check exp and nbf claims when troubleshooting login or session issues.',
      'Do not trust decoded claims until your backend verifies the token signature.',
      'Use sample or redacted tokens when documenting authentication bugs.',
    ],
    privacyNote: 'JWT decoding is processed through the tool service. Real tokens can grant access to accounts or APIs, so avoid submitting live production tokens.',
  },
  'password-generator': {
    whatItDoes: 'The Password Generator creates random passwords using the selected length and character options. It is designed for quickly producing stronger credentials than human-chosen passwords, especially when combined with a password manager.',
    whenToUse: [
      'When creating a new account password.',
      'When rotating credentials after a security review.',
      'When generating temporary passwords for development or testing.',
      'When you need multiple random passwords with consistent character rules.',
    ],
    example: {
      inputLabel: 'Example options',
      input: 'Length: 16\nUppercase: yes\nLowercase: yes\nNumbers: yes\nSymbols: yes',
      outputLabel: 'Example generated password',
      output: 'N7q!vR2#sL9@pX4z',
    },
    tips: [
      'Use longer passwords when a service allows them.',
      'Include multiple character types unless a site has specific restrictions.',
      'Store generated passwords in a trusted password manager.',
      'Do not reuse generated passwords across different accounts.',
    ],
    privacyNote: 'Password generation is processed through the tool service. Do not use the tool for secrets you are unwilling to transmit for processing.',
  },
};

// Map tool IDs to action-specific CTA text
const getActionText = (toolId: string): string => {
  const actionMap: Record<string, string> = {
    // Formatters
    'code-minifier': 'Minify Code',
    'code-beautifier': 'Beautify Code',
    'json-formatter': 'Format JSON',
    'html-formatter': 'Format HTML',
    'html-minifier': 'Minify HTML',
    'css-formatter': 'Format CSS',
    'css-minifier': 'Minify CSS',
    'xml-formatter': 'Format XML',
    'xml-minifier': 'Minify XML',
    'sql-formatter': 'Format SQL',
    // Converters
    'base64-encode': 'Encode to Base64',
    'base64-decode': 'Decode Base64',
    'url-encode': 'Encode URL',
    'url-decode': 'Decode URL',
    'case-converter': 'Convert Case',
    'json-to-csv': 'Convert to CSV',
    'csv-to-json': 'Convert to JSON',
    'json-to-xml': 'Convert to XML',
    'xml-to-json': 'Convert to JSON',
    'json-to-yaml': 'Convert to YAML',
    'yaml-to-json': 'Convert to JSON',
    'html-encode': 'Encode to HTML',
    'html-decode': 'Decode HTML',
    'slug-generator': 'Generate Slug',
    'base32-encode': 'Encode to Base32',
    'base32-decode': 'Decode Base32',
    'markdown-to-html': 'Convert to HTML',
    'escape-unescape': 'Escape/Unescape',
    'number-base-converter': 'Convert Base',
    'temperature-converter': 'Convert Temperature',
    'csv-json-converter': 'Convert Format',
    // Validators
    'json-validator': 'Validate JSON',
    'html-validator': 'Validate HTML',
    'xml-validator': 'Validate XML',
    'yaml-validator': 'Validate YAML',
    'markdown-validator': 'Validate Markdown',
    'jwt-decoder': 'Decode JWT',
    'regex-tester': 'Test Regex',
    'text-diff': 'Compare Text',
    'cron-expression-generator': 'Validate Cron',
    'json-schema-validator': 'Validate Schema',
    // Generators
    'uuid-generator': 'Generate UUID',
    'hash-generator': 'Generate Hash',
    'password-generator': 'Generate Password',
    'lorem-ipsum-generator': 'Generate Text',
    'random-string-generator': 'Generate String',
    'color-converter': 'Convert Color',
    'unix-timestamp-converter': 'Convert Timestamp',
    'qr-code-generator': 'Generate QR Code',
  };
  return actionMap[toolId] || 'Process';
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CodeToolPage({ params }: PageProps) {
  const router = useRouter();
  const { slug } = use(params);
  const tool = getToolBySlug(slug);

  const [input, setInput] = useState('');
  const [cronPreset, setCronPreset] = useState('');
  const [output, setOutput] = useState('');
  const [qrImage, setQrImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [options, setOptions] = useState<Record<string, any>>(() => {
    const initialOptions: Record<string, any> = {};
    tool?.options.forEach((opt) => {
      initialOptions[opt.name] = opt.default ?? '';
    });
    return initialOptions;
  });

  // Cron schedule presets populate the existing editable input.
  const cronPresets = [
    { label: 'Every minute', expression: '* * * * *' },
    { label: 'Every 15 minutes', expression: '*/15 * * * *' },
    { label: 'Every hour', expression: '0 * * * *' },
    { label: 'Every day at 9:00 AM', expression: '0 9 * * *' },
    { label: 'Weekdays at 9:00 AM', expression: '0 9 * * 1-5' },
  ];

  const handleCronPreset = (expression: string) => {
    setCronPreset(expression);
    setInput(expression);
    setOutput('');
    setError('');
    setSuccess('');
  };

  // Handle option change
  const handleOptionChange = (name: string, value: any) => {
    setOptions((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Execute tool
  const handleExecute = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setQrImage('');

    try {
      const response = await fetch('/api/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: slug,
          input: tool?.inputMode === 'none' ? undefined : input,
          options,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Tool execution failed');
        setOutput('');
        return;
      }

      // Handle different output types
      if (slug === 'qr-code-generator') {
        const image = data.result?.result;

        if (
          typeof image !== 'string' ||
          !image.startsWith('data:image/png;base64,')
        ) {
          throw new Error('QR code image was not returned');
        }

        setQrImage(image);
        setOutput('');
        setSuccess('QR code generated successfully');
      } else if (tool?.outputMode === 'validation') {
        // Validation result
        const result = data.result;
        if (result.valid) {
          setSuccess('✓ ' + result.message);
        } else {
          setError('✗ ' + result.message);
        }
        setOutput(JSON.stringify(result, null, 2));
      } else if (typeof data.result === 'string') {
        setOutput(data.result);
        setSuccess('✓ Done');
      } else {
        setOutput(JSON.stringify(data.result, null, 2));
        setSuccess('✓ Done');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred'
      );
      setOutput('');
    } finally {
      setLoading(false);
    }
  };

  // Clear all
  const handleClear = () => {
    setCronPreset('');
    setInput('');
    setOutput('');
    setQrImage('');
    setError('');
    setSuccess('');
  };

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setSuccess('✓ Copied to clipboard');
      setTimeout(() => setSuccess(''), 2000);
    } catch {
      setError('Failed to copy');
    }
  };

  // Download QR code PNG directly in the browser
  const handleQrDownload = () => {
    if (!qrImage.startsWith('data:image/png;base64,')) {
      setError('Generate a QR code before downloading');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = qrImage;
      link.download = 'simplifyconvert-qr-code.png';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSuccess('QR code PNG download started');
    } catch {
      setError('Failed to download QR code');
    }
  };

  // Download result
  const handleDownload = async () => {
    try {
      if (!slug) {
        setError('Unable to prepare download');
        return;
      }

      const outputName = `${slug}-result.txt`;
      const blob = new Blob([output], { type: 'text/plain' });

      const downloadResult = await uploadBrowserDownloadResult({
        blob,
        toolSlug: slug,
        originalName: outputName,
        outputName,
      });

      router.push(downloadResult.downloadPageUrl);
      setSuccess('✓ Ready to download');
      setTimeout(() => setSuccess(''), 2000);
    } catch {
      setError('Failed to prepare download');
    }
  };

  if (!tool) {
    notFound();
  }

  const actionText = slug ? getActionText(slug) : 'Process';
  const ToolIcon = codeToolIcons[tool.icon] || Code2;
  const displayTitle = getCleanToolTitle(tool.title);
  const seoContent = slug ? toolSeoContent[slug] : undefined;
  const baseUrl = 'https://simplifyconvert.com';
  const toolUrl = `${baseUrl}/all-tools/code-tools/${slug}`;
  const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.title,
    description: tool.description,
    url: toolUrl,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
  const faqPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (slug === 'base64-decode' ? base64DecodeFaqItems : slug === 'base64-encode' ? base64FaqItems : slug === 'csv-to-json' ? csvFaqItems : faqItems).map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
  const breadcrumbListSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'All Tools',
        item: `${baseUrl}/all-tools`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Code Tools',
        item: `${baseUrl}/all-tools/code-tools`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: tool.title,
        item: toolUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      {!['json-formatter', 'json-validator'].includes(slug) && <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
        />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListSchema) }}
      />
      <HomeHeader />
      <main className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1">
          <div className="relative bg-gradient-to-r from-green-600 to-emerald-700 overflow-hidden min-h-[280px] py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
              {/* Breadcrumb */}
              <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-wrap items-center gap-2 text-white text-sm mb-6"
              >
                <Link href="/" className="hover:opacity-80">Home</Link>
                <ChevronRight size={16} />
                <Link href="/all-tools/code-tools" className="hover:opacity-80">Code Tools</Link>
                <ChevronRight size={16} />
                <span className="opacity-90">{displayTitle}</span>
              </motion.div>

              {/* Header Content */}
              <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ToolIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                      {displayTitle}
                    </h1>
                    <p className="text-white text-lg opacity-95 max-w-2xl">{tool.description}</p>
                    <div className="mt-4 flex items-center gap-3">
                      <span className="inline-block text-white text-xs font-semibold px-4 py-1.5 rounded-full" style={{ backgroundColor: '#16A34A' }}>
                        Code Tool
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8"
            >
              {/* Left Column - Input & Options (Sticky) */}
              <motion.div
                initial={false}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="md:col-span-1"
              >
                <div className="sticky top-4 space-y-6">
                  {/* Input Card */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">Configure</h2>
                    </div>

                    <div className="p-6 space-y-6">
                      {slug === 'cron-expression-generator' && (
                        <div className="space-y-3">
                          <label
                            htmlFor="cron-schedule-preset"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Generate a cron expression
                          </label>
                          <select
                            id="cron-schedule-preset"
                            value={cronPreset}
                            onChange={(e) => handleCronPreset(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-green-500"
                          >
                            <option value="">Choose a schedule...</option>
                            {cronPresets.map((preset) => (
                              <option key={preset.expression} value={preset.expression}>
                                {preset.label}
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-gray-600">
                            The selected expression appears in the editable input below.
                            Cron execution uses the timezone configured on the system
                            running the scheduled job.
                          </p>
                        </div>
                      )}

                      {/* Input */}
                      {tool.inputMode !== 'none' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {slug === 'json-schema-validator' ? 'JSON Schema' : 'Input'}
                          </label>
                          <textarea
                            className="w-full h-40 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                            placeholder={`Enter ${tool.title.toLowerCase()} input...`}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                          />
                        </div>
                      )}

                      {/* Options */}
                      {tool.options.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-semibold text-gray-900">Options</h3>
                      {tool.options.map((option) => (
                        <div key={option.name}>
                          <label
                            htmlFor={`code-option-${option.name}`}
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            {option.label}
                          </label>

                          {option.type === 'textarea' ? (
                            <textarea
                              id={`code-option-${option.name}`}
                              rows={8}
                              spellCheck={false}
                              className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y"
                              value={options[option.name] ?? option.default ?? ''}
                              onChange={(e) =>
                                handleOptionChange(option.name, e.target.value)
                              }
                            />
                          ) : option.type === 'select' && option.choices ? (
                            <select
                              id={`code-option-${option.name}`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white"
                              value={options[option.name] || option.default || ''}
                              onChange={(e) =>
                                handleOptionChange(option.name, e.target.value)
                              }
                            >
                              {option.choices.map((choice) => (
                                <option key={choice.value} value={choice.value}>
                                  {choice.label}
                                </option>
                              ))}
                            </select>
                          ) : option.type === 'number' ? (
                            <input
                              id={`code-option-${option.name}`}
                              type="number"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                              value={options[option.name] || option.default || 0}
                              onChange={(e) =>
                                handleOptionChange(
                                  option.name,
                                  parseInt(e.target.value)
                                )
                              }
                            />
                          ) : option.type === 'checkbox' ? (
                            <input
                              id={`code-option-${option.name}`}
                              type="checkbox"
                              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                              checked={options[option.name] || false}
                              onChange={(e) =>
                                handleOptionChange(option.name, e.target.checked)
                              }
                            />
                          ) : (
                            <input
                              id={`code-option-${option.name}`}
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                              value={options[option.name] || ''}
                              onChange={(e) =>
                                handleOptionChange(option.name, e.target.value)
                              }
                            />
                          )}
                        </div>
                      ))}
                        </div>
                      )}

                      {/* Error Message */}
                      {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-700 text-sm">{error}</p>
                        </div>
                      )}

                      {/* Execute Button */}
                      <button
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 duration-0"
                        onClick={handleExecute}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Play size={18} />
                            {actionText}
                          </>
                        )}
                      </button>

                      <button
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg flex items-center justify-center gap-2 duration-0"
                        onClick={handleClear}
                      >
                        <RotateCcw size={16} />
                        Clear All
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Column - Output & Results */}
              <motion.div
                initial={false}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="md:col-span-2 space-y-6"
              >
                {/* Info Box */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About this tool</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {tool.description}
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <CheckCircle size={16} className="text-indigo-600 flex-shrink-0" />
                      <span>Engine: {tool.engine}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <CheckCircle size={16} className="text-indigo-600 flex-shrink-0" />
                      <span>Real-time Processing</span>
                    </div>
                  </div>
                </motion.div>

                {/* QR Code Image Preview */}
                {slug === 'qr-code-generator' && qrImage && (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Your QR Code
                    </h2>
                    <div className="flex justify-center">
                      <img
                        src={qrImage}
                        alt="Generated QR code"
                        className="max-w-full h-auto"
                      />
                    </div>
                    <p className="mt-4 text-center text-sm text-gray-600">
                      Your QR code is ready. Scan it to verify the content.
                    </p>
                    <button
                      type="button"
                      onClick={handleQrDownload}
                      className="mt-4 w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
                    >
                      <Download size={18} />
                      Download PNG
                    </button>
                  </div>
                )}

                {/* Output Box */}
                {output && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">Output</h2>
                    </div>

                    <div className="p-6">
                      <textarea
                        readOnly
                        className="w-full h-48 p-3 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50 resize-none"
                        value={output}
                      />
                      <div className="mt-4 flex gap-3">
                        <button
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium duration-0 flex items-center justify-center gap-2"
                          onClick={handleCopy}
                        >
                          <Copy size={16} />
                          Copy
                        </button>

                        <button
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium duration-0 flex items-center justify-center gap-2"
                          onClick={handleDownload}
                        >
                          <Download size={16} />
                          Download
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Status Messages */}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <p className="text-green-800 font-semibold text-sm">{success}</p>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>

            {slug === 'json-formatter' && <PriorityToolGuide toolId="json-formatter" />}
            {slug === 'json-validator' && <PriorityToolGuide toolId="json-validator" />}
            {!['json-formatter', 'json-validator'].includes(slug) && (<>
            {/* Related Tools Section */}
            {slug && (
              <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="max-w-6xl mx-auto mt-20"
              >
                <RelatedToolsSection
                  family="code"
                  toolId={slug}
                  limit={8}
                  title="Related Tools"
                  description="Explore related developer tools that can help with the same workflow."
                />
              </motion.div>
            )}

            {slug === 'base64-encode' ? <Base64EncodeGuide /> : slug === 'csv-to-json' ? <CsvToJsonGuide /> : (<>
            {/* Content Sections */}
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="max-w-6xl mx-auto mt-12 bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-8"
            >
              {/* How To Use Section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">How to {actionText}</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold text-sm">1</span>
                    <p className="text-gray-700">Enter or paste your content in the input field above</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold text-sm">2</span>
                    <p className="text-gray-700">Adjust any available options to customize the output</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold text-sm">3</span>
                    <p className="text-gray-700">Click the <strong>"{actionText}"</strong> button to process</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold text-sm">4</span>
                    <p className="text-gray-700">View the result in the output section</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold text-sm">5</span>
                    <p className="text-gray-700">Copy the result or download it as a file</p>
                  </div>
                </div>
              </div>

              {seoContent && (
                <div className="space-y-8">
                  <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">What this tool does</h2>
                    <p className="text-gray-700 leading-relaxed">{seoContent.whatItDoes}</p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">When to use it</h2>
                    <ul className="space-y-3 text-gray-700">
                      {seoContent.whenToUse.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span className="text-green-600 font-bold">-</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {seoContent.example && (
                    <section>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Example input and output</h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <h3 className="bg-gray-50 border-b border-gray-200 px-4 py-3 font-semibold text-gray-900">
                            {seoContent.example.inputLabel}
                          </h3>
                          <pre className="p-4 text-sm text-gray-800 overflow-auto whitespace-pre-wrap font-mono">
                            {seoContent.example.input}
                          </pre>
                        </div>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <h3 className="bg-gray-50 border-b border-gray-200 px-4 py-3 font-semibold text-gray-900">
                            {seoContent.example.outputLabel}
                          </h3>
                          <pre className="p-4 text-sm text-gray-800 overflow-auto whitespace-pre-wrap font-mono">
                            {seoContent.example.output}
                          </pre>
                        </div>
                      </div>
                    </section>
                  )}

                  <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Common errors or tips</h2>
                    <ul className="space-y-3 text-gray-700">
                      {seoContent.tips.map((tip) => (
                        <li key={tip} className="flex gap-3">
                          <span className="text-green-600 font-bold">-</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy and security note</h2>
                    <p className="text-gray-700 leading-relaxed">{seoContent.privacyNote}</p>
                  </section>
                </div>
              )}

              {/* Benefits Section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Use This Tool</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <CheckCircle size={18} className="text-green-600" />
                      No Installation Required
                    </h3>
                    <p className="text-gray-600 text-sm">Use directly in your browser - no downloads or setup needed</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <CheckCircle size={18} className="text-green-600" />
                      No Account Required
                    </h3>
                    <p className="text-gray-600 text-sm">Use the available developer utilities without creating an account.</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <CheckCircle size={18} className="text-green-600" />
                      How Your Input Is Processed
                    </h3>
                    <p className="text-gray-600 text-sm">Inputs are sent to our server for processing. Avoid entering secrets or other sensitive data.</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <CheckCircle size={18} className="text-green-600" />
                      Processing Time Varies
                    </h3>
                    <p className="text-gray-600 text-sm">Processing time and output depend on the selected tool, input size, options, and server workload.</p>
                  </div>
                </div>
              </div>

              {/* FAQs Section */}
              <FAQPanel>
                <FAQHeading>Frequently Asked Questions</FAQHeading>
                <FAQList>
                  {slug === 'base64-decode' ? (
                    base64DecodeFaqItems.map((item) => (
                      <FAQDisclosure key={item.question}>
                        <FAQQuestion>
                          {item.question}

                        </FAQQuestion>
                        <FAQAnswer>{item.answer}</FAQAnswer>
                      </FAQDisclosure>
                    ))
                  ) : (
                    <>
                  <FAQDisclosure>
                    <FAQQuestion>
                      Is my data secure and private?

                    </FAQQuestion>
                    <FAQAnswer>Tool inputs are sent to our server for processing. Avoid entering passwords, private keys, access tokens, personal data, or other sensitive information.</FAQAnswer>
                  </FAQDisclosure>
                  <FAQDisclosure>
                    <FAQQuestion>
                      Can I use this tool offline?

                    </FAQQuestion>
                    <FAQAnswer>No. An internet connection is required because tool inputs are sent to our server for processing.</FAQAnswer>
                  </FAQDisclosure>
                  <FAQDisclosure>
                    <FAQQuestion>
                      What browsers are supported?

                    </FAQQuestion>
                    <FAQAnswer>Use a modern browser with JavaScript enabled. Behavior can vary by browser, device resources, input size, and the selected tool.</FAQAnswer>
                  </FAQDisclosure>
                  <FAQDisclosure>
                    <FAQQuestion>
                      Is there a limit on input size?

                    </FAQQuestion>
                    <FAQAnswer>Input limits depend on the selected tool and server processing constraints.</FAQAnswer>
                  </FAQDisclosure>
                  <FAQDisclosure>
                    <FAQQuestion>
                      Can I use this for commercial purposes?

                    </FAQQuestion>
                    <FAQAnswer>Yes. Feel free to use this tool for any purpose, including commercial projects. No attribution is required.</FAQAnswer>
                  </FAQDisclosure>
                    </>
                  )}
                </FAQList>
              </FAQPanel>

              {/* Best Practices Section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Practices</h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Always verify the output before using it in production or important work</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Test with small samples first before processing large files</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Keep backups of original files in case you need to revert changes</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Understand the options available to customize the output to your needs</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Footer Feature Cards */}
            <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }} className="max-w-6xl mx-auto mt-20 mb-12">
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Zap,
                    title: 'Server-Side Processing',
                    description: 'Tool inputs are sent to the processing service. Completion time depends on the selected operation, input, and current server workload.',
                  },
                  {
                    icon: Shield,
                    title: 'Processing and Downloads',
                    description: 'Inputs are sent to our server for processing. Generated results used for download may be retained temporarily for retrieval.',
                  },
                  {
                    icon: CheckCircle,
                    title: 'Multiple Tool Types',
                    description: 'The collection includes formatting, conversion, validation, encoding, decoding, and generation utilities for supported inputs.',
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center hover:shadow-xl transition"
                  >
                    <div className="mb-4 flex justify-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                        <feature.icon size={24} className="text-green-600" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            </>)}
            </>)}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
