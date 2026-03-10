# Data Conversion Tools - Technical Reference

## API Specification

### POST /api/data-convert

Convert a file using the specified tool.

#### Request

**Method:** POST  
**Content-Type:** multipart/form-data

**Form Fields:**
- `tool` (string, required): Tool ID (e.g., `csv-to-excel`)
- `file` (File, required): File to convert
- `options` (string, required): JSON string with conversion options

**Example:**
```javascript
const formData = new FormData();
formData.append('tool', 'csv-to-excel');
formData.append('file', csvFile);
formData.append('options', JSON.stringify({'delimiter': 'comma'}));

const response = await fetch('/api/data-convert', {
  method: 'POST',
  body: formData,
});
```

#### Response - Success (200)

**Headers:**
- `Content-Type`: Appropriate MIME type for output format
- `Content-Disposition`: `attachment; filename="converted.[ext]"`
- `Content-Length`: File size in bytes

**Body:** Binary file data

**Example for CSV→Excel:**
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="converted.xlsx"
[binary XLSX data]
```

#### Response - Validation Error (400)

**Body (JSON):**
```json
{
  "message": "Validation failed",
  "errors": [
    "Invalid file type. Accepted: csv, xlsx",
    "File size exceeds 100MB limit"
  ]
}
```

#### Response - Tool Not Found (404)

**Body (JSON):**
```json
{
  "message": "Tool 'invalid-tool' not found"
}
```

#### Response - Conversion Error (500)

**Body (JSON):**
```json
{
  "message": "Conversion failed: [error details]"
}
```

---

### GET /api/data-convert

Get list of available tools.

#### Request

**Method:** GET  
**Query Parameters:** None

#### Response (200)

**Body (JSON):**
```json
{
  "tools": [
    {
      "id": "csv-to-excel",
      "title": "CSV to Excel",
      "description": "Convert CSV files to Excel format",
      "category": "conversion",
      "engine": "spreadsheet",
      "accepts": ["csv"],
      "output": "xlsx"
    },
    // ... 11 more tools
  ]
}
```

---

## Tool Registry

Location: `/app/lib/data-tools.ts`

### Tool Object Structure

```typescript
interface DataTool {
  id: string;                    // Unique identifier (used in API)
  title: string;                // Display name
  description: string;          // What it does
  category: 'conversion' | 'split';
  engine: DataEngine;            // Which Python engine handles it
  accepts: string[];            // Input file extensions
  output: string;               // Output file extension
  options?: ToolOption[];       // User configurable options
}

interface ToolOption {
  name: string;                 // Form field name
  label: string;               // Display label
  type: 'select' | 'text' | 'number' | 'checkbox';
  options?: string[];          // For select type
  default?: any;               // Default value
  required?: boolean;          // Must be filled
  description?: string;        // Help text
  placeholder?: string;        // Input placeholder
  min?: number;                // For number type
  max?: number;                // For number type
}

type DataEngine = 'spreadsheet' | 'structured' | 'split';
```

### Current Tools

```typescript
const dataTools: DataTool[] = [
  {
    id: 'csv-to-excel',
    title: 'CSV to Excel',
    description: 'Convert CSV files to Excel (.xlsx) format',
    category: 'conversion',
    engine: 'spreadsheet',
    accepts: ['csv'],
    output: 'xlsx',
    options: [
      {
        name: 'delimiter',
        label: 'CSV Delimiter',
        type: 'select',
        options: ['comma', 'tab', 'semicolon'],
        default: 'comma'
      }
    ]
  },
  // ... 11 more tools
];
```

### Helper Functions

#### getDataToolById(id: string): DataTool | undefined

Get tool configuration by ID.

```typescript
const tool = getDataToolById('csv-to-excel');
if (tool) {
  console.log(tool.title); // "CSV to Excel"
}
```

#### getToolsByEngine(engine: DataEngine): DataTool[]

Get all tools handled by specific engine.

```typescript
const spreadsheetTools = getToolsByEngine('spreadsheet');
// Returns 6 tools
```

#### getToolsByCategory(category: ToolCategory): DataTool[]

Get all tools in a category.

```typescript
const conversionTools = getToolsByCategory('conversion');
// Returns 10 conversion tools (not split)
```

---

## Validation API

Location: `/app/lib/data-validation.ts`

### ValidationResult

```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
}
```

### Functions

#### validateFileType(filename: string, acceptedTypes: string[]): ValidationResult

Check if file extension is in accepted list.

```typescript
const result = validateFileType('data.csv', ['csv', 'xlsx']);
// { valid: true, errors: [] }

const result2 = validateFileType('data.json', ['csv', 'xlsx']);
// { valid: false, errors: ["File type 'json' not accepted"] }
```

#### validateFileSize(sizeInBytes: number, maxMB: number): ValidationResult

Check if file size is within limit.

```typescript
const result = validateFileSize(50 * 1024 * 1024, 100);
// { valid: true, errors: [] }

const result2 = validateFileSize(150 * 1024 * 1024, 100);
// { valid: false, errors: ["File exceeds 100MB limit"] }
```

#### validateToolAndFile(toolId: string, filename: string): ValidationResult

Combined validation: tool exists and accepts file type.

```typescript
const result = validateToolAndFile('csv-to-excel', 'data.csv');
// { valid: true, errors: [] }
```

#### validateToolOptions(toolId: string, options: Record<string, any>): ValidationResult

Check options match tool requirements and types.

```typescript
const result = validateToolOptions('csv-to-excel', {
  delimiter: 'comma'
});
// { valid: true, errors: [] }

const result2 = validateToolOptions('csv-to-excel', {
  rows_per_file: 'invalid'  // Should be number
});
// { valid: false, errors: ["rows_per_file must be number"] }
```

#### sanitizeFilename(filename: string): string

Remove unsafe characters from filename.

```typescript
const safe = sanitizeFilename('my-file (1).csv');
// "my-file-(1).csv"

const safe2 = sanitizeFilename('file<>?.csv');
// "file.csv"
```

#### generateOutputFilename(toolId: string, inputFilename: string): string

Create output filename based on tool and input.

```typescript
const output = generateOutputFilename('csv-to-excel', 'data.csv');
// "data_converted.xlsx"

const output2 = generateOutputFilename('split-csv', 'data.csv');
// "data"  // Will be zipped
```

---

## Python Backend

### data_convert.py

**Purpose:** Main entry point called by Node.js

**Arguments:**
```bash
python data_convert.py <tool_id> <input_file> <output_file> [options_json]
```

**Example:**
```bash
python data_convert.py csv-to-excel input.csv output.xlsx '{"delimiter":"comma"}'
```

**Exit Codes:**
- `0`: Success
- `1`: Error (details in stderr)

**Error Output (stderr):**
```
Error during conversion: [error message]
Traceback:
  ...full Python traceback...
```

---

### Python Engine Classes

#### SpreadsheetConvertEngine

**Methods:**
- `convert(tool_id, input_file, output_file, options)`
- `_csv_to_excel(input_file, output_file, options)`
- `_excel_to_csv(input_file, output_file, options)`
- `_xml_to_excel(input_file, output_file, options)`
- `_xml_to_csv(input_file, output_file, options)`
- `_excel_to_xml(input_file, output_file, options)`
- `_excel_to_pdf(input_file, output_file, options)`

**Helper Methods:**
- `_xml_to_table_data(xml_file) → TableData`
- `_xml_element_to_row(element, prefix='') → List`

**Options Schema:**
```python
{
  'delimiter': 'comma' | 'tab' | 'semicolon',  # For CSV operations
  'sheet_mode': 'first' | 'all'                # For Excel to CSV
}
```

#### StructuredDataEngine

**Methods:**
- `convert(tool_id, input_file, output_file, options)`
- `_csv_to_json(input_file, output_file, options)`
- `_json_to_xml(input_file, output_file, options)`
- `_xml_to_json(input_file, output_file, options)`
- `_csv_to_xml(input_file, output_file, options)`

**Helper Methods:**
- `_dict_to_xml_element(data, parent)` (recursive)
- `_sanitize_tag_name(name) → str`
- `_xml_element_to_dict(element) → dict` (recursive)

**Special Handling:**
- Single child element with text → string value
- Multiple child elements with same tag → array
- Attributes → prefixed with `@` in JSON
- Text content → `#text` key in JSON

#### SplitEngine

**Methods:**
- `convert(tool_id, input_file, output_file, options)`
- `_split_csv(input_file, output_file, options)`
- `_split_excel(input_file, output_file, options)`

**Splitting Methods:**
- `_split_by_row_count(df, output_file, options, ...)`
- `_split_by_part_count(df, output_file, options, ...)`
- `_split_by_column_value(df, output_file, options, ...)`
- `_split_by_sheet(input_file, output_file, options)`

**Helper Methods:**
- `_create_zip(output_file, temp_files)` - Creates zip if multiple files
- `_sanitize_filename(filename) → str`

**Options Schema:**
```python
{
  'split_mode': 'by_rows' | 'by_parts' | 'by_column_value' | 'by_sheet',
  'rows_per_file': 1000,        # For by_rows
  'num_parts': 5,               # For by_parts
  'column_name': 'category'     # For by_column_value
}
```

**Auto-zip Logic:**
- Single file output → return directly (not zipped)
- Multiple files → automatically create zip

---

## MIME Type Mapping

| Extension | MIME Type |
|-----------|-----------|
| xlsx | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet |
| csv | text/csv |
| json | application/json |
| xml | application/xml |
| pdf | application/pdf |
| zip | application/zip |

---

## Frontend Components

### Page: `/app/tools/data/page.tsx`

Lists all 12 tools with:
- Tool cards showing input/output formats
- Grouped by category
- Click to open tool

**Exports:**
- Default component (functional)
- Uses client-side routing

### Page: `/app/tools/data/[slug]/page.tsx`

Dynamic tool page for each conversion.

**Parameters:**
- `slug` (string): Tool ID (e.g., `csv-to-excel`)

**Features:**
- File upload input
- Dynamic form from tool.options
- Upload status indicators
- Error display
- Auto-download on success

**State:**
```typescript
- selectedFile: File | null
- formData: Record<string, any>
- loading: boolean
- error: string | null
- success: boolean
- downloadUrl: string | null
```

**API Call:**
```typescript
POST /api/data-convert
Content-Type: multipart/form-data
- tool: string
- file: File
- options: JSON string
```

---

## Database Schema (if needed)

For future conversion history tracking:

```sql
CREATE TABLE conversions (
  id UUID PRIMARY KEY,
  user_id UUID,
  tool_id VARCHAR(50),
  input_filename VARCHAR(255),
  output_filename VARCHAR(255),
  status ENUM('pending', 'processing', 'success', 'failed'),
  error_message TEXT,
  file_size_bytes INT,
  processing_time_ms INT,
  created_at TIMESTAMP,
  completed_at TIMESTAMP
);
```

---

## Rate Limiting (Future Enhancement)

```typescript
// Add to /api/data-convert
const rateLimit = {
  windowMs: 60 * 1000,      // 1 minute
  max: 30,                   // 30 requests per minute per IP
  message: 'Too many conversions, please try again later'
};
```

---

## Logging (Future Enhancement)

```python
import logging

logging.basicConfig(
  filename='conversions.log',
  level=logging.INFO,
  format='%(asctime)s - %(tool_id)s - %(status)s - %(duration)s'
)
```

---

## Testing Examples

### Unit Test: CSV to Excel

```python
import os
from engines.spreadsheet_engine import SpreadsheetConvertEngine

engine = SpreadsheetConvertEngine()
engine.convert(
  'csv-to-excel',
  'test.csv',
  'output.xlsx',
  {'delimiter': 'comma'}
)

assert os.path.exists('output.xlsx')
print("✓ CSV to Excel test passed")
```

### Integration Test: Full Flow

```javascript
const formData = new FormData();
formData.append('tool', 'csv-to-excel');
formData.append('file', csvFile);
formData.append('options', '{"delimiter":"comma"}');

const response = await fetch('/api/data-convert', {
  method: 'POST',
  body: formData,
});

assert(response.status === 200);
assert(response.headers.get('Content-Type').includes('spreadsheet'));
const blob = await response.blob();
assert(blob.size > 0);
console.log("✓ Integration test passed");
```

---

## Performance Tuning

### For Large Files

```python
# Enable chunked processing
CHUNK_SIZE = 1024 * 100  # 100KB chunks

for chunk in read_file_chunks(input_file, CHUNK_SIZE):
    process_chunk(chunk)
```

### For Memory Optimization

```python
# Stream large Excel files
df = pd.read_excel(input_file, chunksize=1000)
for chunk in df:
    process_chunk(chunk)
```

---

## Security Considerations

✅ **File Uploads:**
- Type validation (extension check)
- Size validation (100MB limit)
- Temp directory isolation
- Auto-cleanup after 60 seconds

✅ **Code Injection:**
- Args passed as array (not shell string)
- JSON parsing isolated with try-catch
- No eval() or exec()

✅ **Resource Limits:**
- 60-second execution timeout
- 100MB file size limit
- No infinite loops or recursion

---

## Error Recovery

### Retry Strategy

```javascript
async function convertWithRetry(formData, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetch('/api/data-convert', {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

---

## Monitoring Queries

### Track Conversion Times

```sql
SELECT 
  tool_id,
  COUNT(*) as conversions,
  AVG(processing_time_ms) as avg_time,
  MAX(processing_time_ms) as max_time
FROM conversions
WHERE created_at > NOW() - INTERVAL 24 HOUR
GROUP BY tool_id
ORDER BY conversions DESC;
```

### Find Slow Conversions

```sql
SELECT 
  tool_id,
  file_size_bytes,
  processing_time_ms
FROM conversions
WHERE processing_time_ms > 10000
ORDER BY processing_time_ms DESC;
```

