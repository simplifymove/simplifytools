# Data Conversion Tools - Practical Examples

## CSV to Excel

### Input: `data.csv`
```csv
Name,Age,Department,Salary
Alice,28,Engineering,85000
Bob,32,Sales,65000
Carol,26,Marketing,60000
David,35,Engineering,92000
```

### Process
1. User uploads `data.csv`
2. Frontend validates: `.csv` extension ✓
3. POST to `/api/data-convert` with:
   - tool: `csv-to-excel`
   - file: data.csv
   - options: `{"delimiter":"comma"}`
4. Python processes via SpreadsheetConvertEngine
5. pandas reads CSV → openpyxl writes Excel

### Output: `converted.xlsx`
- Formatted Excel file with:
  - Header row (first row)
  - Data rows (4 people)
  - Preserved column types
  - Ready to open in Excel/Sheets

---

## XML to JSON

### Input: `users.xml`
```xml
<?xml version="1.0"?>
<users>
  <user>
    <id>1</id>
    <name>Alice</name>
    <email>alice@example.com</email>
    <roles>
      <role>admin</role>
      <role>user</role>
    </roles>
  </user>
  <user>
    <id>2</id>
    <name>Bob</name>
    <email>bob@example.com</email>
    <roles>
      <role>user</role>
    </roles>
  </user>
</users>
```

### Process
1. Parse XML structure
2. Detect repeated `<user>` elements → array
3. Detect repeated `<role>` elements within user → nested array
4. Recursively convert to dictionary
5. Serialize as JSON with proper formatting

### Output: `converted.json`
```json
{
  "user": [
    {
      "id": "1",
      "name": "Alice",
      "email": "alice@example.com",
      "roles": {
        "role": ["admin", "user"]
      }
    },
    {
      "id": "2",
      "name": "Bob",
      "email": "bob@example.com",
      "roles": {
        "role": "user"
      }
    }
  ]
}
```

**Note:** Single role becomes string, multiple roles become array (automatic by engine)

---

## Excel to PDF

### Input: `sales.xlsx`
```
| Quarter | North | South | East | West | Total |
|---------|-------|-------|------|------|-------|
| Q1      | 50K   | 45K   | 48K  | 42K  | 185K  |
| Q2      | 55K   | 48K   | 52K  | 45K  | 200K  |
| Q3      | 60K   | 52K   | 55K  | 50K  | 217K  |
| Q4      | 65K   | 58K   | 62K  | 58K  | 243K  |
```

### Process
1. pandas reads Excel
2. Prepare table data for ReportLab
3. Create styled PDF with:
   - Header row: gray background + white text
   - Data rows: alternating colors
   - Grid borders around all cells
   - Professional typography

### Output: `converted.pdf`
- Professional PDF with styled table
- Ready to print or email
- Preserves data structure and readability

---

## CSV to JSON

### Input: `products.csv`
```csv
ID,Name,Category,Price,InStock
1,Laptop,Electronics,999.99,true
2,Mouse,Electronics,29.99,true
3,Desk,Furniture,199.99,false
4,Chair,Furniture,149.99,true
```

### Process
1. Read CSV with delimiter detection
2. Convert each row to object
3. Create array of objects
4. Serialize as JSON

### Output: `converted.json`
```json
[
  {
    "ID": "1",
    "Name": "Laptop",
    "Category": "Electronics",
    "Price": "999.99",
    "InStock": "true"
  },
  {
    "ID": "2",
    "Name": "Mouse",
    "Category": "Electronics",
    "Price": "29.99",
    "InStock": "true"
  },
  {
    "ID": "3",
    "Name": "Desk",
    "Category": "Furniture",
    "Price": "199.99",
    "InStock": "false"
  },
  {
    "ID": "4",
    "Name": "Chair",
    "Category": "Furniture",
    "Price": "149.99",
    "InStock": "true"
  }
]
```

**Use Case:** Load into web app, mobile app, or database

---

## Split CSV by Row Count

### Input: `transactions.csv` (1,000 rows)
```csv
TransactionID,Amount,Date,Status
1,100.00,2024-01-01,Complete
2,150.50,2024-01-02,Complete
...
1000,200.25,2024-01-31,Complete
```

### Options Selected
- Split Mode: "By Rows"
- Rows per File: 250

### Process
1. Read CSV into DataFrame (1000 rows)
2. Calculate: 1000 ÷ 250 = 4 files needed
3. Create 4 separate CSV files:
   - `transactions_part_1.csv` (rows 1-250)
   - `transactions_part_2.csv` (rows 251-500)
   - `transactions_part_3.csv` (rows 501-750)
   - `transactions_part_4.csv` (rows 751-1000)
4. Create zip: `converted.zip`

### Output: `converted.zip`
Contains 4 CSV files, each with:
- Original header row
- 250 data rows
- Ready to process in parallel

**Use Case:** Process large datasets in batches, distribute to multiple systems

---

## Split Excel by Column Value

### Input: `orders.xlsx`
```
| OrderID | Customer    | Region    | Amount |
|---------|-------------|-----------|--------|
| 101     | Alice Inc   | North     | $5000  |
| 102     | Bob Corp    | South     | $3000  |
| 103     | Carol Ltd   | North     | $4500  |
| 104     | Dave & Co   | East      | $2000  |
| 105     | Eve Stores  | South     | $3500  |
```

### Options Selected
- Split Mode: "By Column Value"
- Column Name: "Region"

### Process
1. Read Excel file
2. Find unique values in "Region" column: ["North", "South", "East"]
3. Create 3 Excel files:
   - `orders_North.xlsx` (orders 101, 103)
   - `orders_South.xlsx` (orders 102, 105)
   - `orders_East.xlsx` (order 104)
4. Create zip: `converted.zip`

### Output: `converted.zip`
Contains 3 Excel files, one per region:
- `orders_North.xlsx` - 2 orders
- `orders_South.xlsx` - 2 orders
- `orders_East.xlsx` - 1 order

**Use Case:** Send regional sales data to regional managers, distribute workload by category

---

## JSON to XML

### Input: `config.json`
```json
{
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "myapp"
  },
  "features": [
    {
      "name": "auth",
      "enabled": true
    },
    {
      "name": "api",
      "enabled": true
    }
  ]
}
```

### Process
1. Parse JSON
2. Recursively convert to XML:
   - Objects → elements
   - Arrays → repeated elements
   - Values → text content

### Output: `converted.xml`
```xml
<?xml version="1.0" ?>
<root>
  <database>
    <host>localhost</host>
    <port>5432</port>
    <name>myapp</name>
  </database>
  <features>
    <item>
      <name>auth</name>
      <enabled>true</enabled>
    </item>
    <item>
      <name>api</name>
      <enabled>true</enabled>
    </item>
  </features>
</root>
```

**Use Case:** Convert config formats, API responses, legacy system integration

---

## XML to Excel

### Input: `catalog.xml`
```xml
<?xml version="1.0"?>
<products>
  <product category="Electronics">
    <name>Laptop</name>
    <price>999.99</price>
    <stock>15</stock>
  </product>
  <product category="Electronics">
    <name>Mouse</name>
    <price>29.99</price>
    <stock>50</stock>
  </product>
  <product category="Furniture">
    <name>Desk</name>
    <price>199.99</price>
    <stock>8</stock>
  </product>
</products>
```

### Process
1. Parse XML structure
2. Flatten nested elements:
   - Product attributes → columns
   - Product children → columns
   - Example: `product.category` and `product.name`
3. Convert to DataFrame
4. Export to Excel

### Output: `converted.xlsx`
```
| category     | name    | price  | stock |
|--------------|---------|--------|-------|
| Electronics  | Laptop  | 999.99 | 15    |
| Electronics  | Mouse   | 29.99  | 50    |
| Furniture    | Desk    | 199.99 | 8     |
```

**Use Case:** Import XML data into spreadsheets, data analysis, reporting

---

## CSV to XML

### Input: `employees.csv`
```csv
EmployeeID,Name,Department,Salary
1001,Alice Smith,Engineering,85000
1002,Bob Jones,Sales,65000
1003,Carol White,Marketing,60000
```

### Process
1. Read CSV
2. Convert each row to XML element
3. Each column → child element
4. Preserve data types and formatting

### Output: `converted.xml`
```xml
<?xml version="1.0" ?>
<data>
  <row>
    <EmployeeID>1001</EmployeeID>
    <Name>Alice Smith</Name>
    <Department>Engineering</Department>
    <Salary>85000</Salary>
  </row>
  <row>
    <EmployeeID>1002</EmployeeID>
    <Name>Bob Jones</Name>
    <Department>Sales</Department>
    <Salary>65000</Salary>
  </row>
  <row>
    <EmployeeID>1003</EmployeeID>
    <Name>Carol White</Name>
    <Department>Marketing</Department>
    <Salary>60000</Salary>
  </row>
</data>
```

---

## Excel to CSV

### Input: `report.xlsx`
```
Sheet1 contains:
| Quarter | Revenue | Expenses | Profit |
|---------|---------|----------|--------|
| Q1      | 100000  | 60000    | 40000  |
| Q2      | 120000  | 70000    | 50000  |
```

### Options Selected
- Delimiter: "Comma"

### Process
1. Read Excel (first sheet by default)
2. Convert to CSV format
3. Use selected delimiter
4. Preserve headers and data

### Output: `converted.csv`
```csv
Quarter,Revenue,Expenses,Profit
Q1,100000,60000,40000
Q2,120000,70000,50000
```

**Use Case:** Share data with systems that only accept CSV, data portability

---

## CSV to XML

### Input: `books.csv`
```csv
Title,Author,Year,Pages
The Hobbit,J.R.R. Tolkien,1937,310
Harry Potter,J.K. Rowling,1997,309
The Lord of the Rings,J.R.R. Tolkien,1954,1178
```

### Process
1. Read CSV with headers
2. Create XML structure:
   - Header row → element names
   - Data rows → child elements per row

### Output: `converted.xml`
```xml
<?xml version="1.0" ?>
<data>
  <row>
    <Title>The Hobbit</Title>
    <Author>J.R.R. Tolkien</Author>
    <Year>1937</Year>
    <Pages>310</Pages>
  </row>
  <row>
    <Title>Harry Potter</Title>
    <Author>J.K. Rowling</Author>
    <Year>1997</Year>
    <Pages>309</Pages>
  </row>
  <row>
    <Title>The Lord of the Rings</Title>
    <Author>J.R.R. Tolkien</Author>
    <Year>1954</Year>
    <Pages>1178</Pages>
  </row>
</data>
```

---

## Excel to XML

### Input: `contacts.xlsx`
```
| FirstName | LastName | Email           | Phone       |
|-----------|----------|-----------------|-------------|
| Alice     | Smith    | alice@email.com | 555-1234    |
| Bob       | Jones    | bob@email.com   | 555-5678    |
| Carol     | White    | carol@email.com | 555-9012    |
```

### Process
1. pandas reads Excel
2. Convert DataFrame to rows
3. Each row becomes XML `<row>` element
4. Each column becomes child element

### Output: `converted.xml`
```xml
<?xml version="1.0" ?>
<data>
  <row>
    <FirstName>Alice</FirstName>
    <LastName>Smith</LastName>
    <Email>alice@email.com</Email>
    <Phone>555-1234</Phone>
  </row>
  <row>
    <FirstName>Bob</FirstName>
    <LastName>Jones</LastName>
    <Email>bob@email.com</Email>
    <Phone>555-5678</Phone>
  </row>
  <row>
    <FirstName>Carol</FirstName>
    <LastName>White</LastName>
    <Email>carol@email.com</Email>
    <Phone>555-9012</Phone>
  </row>
</data>
```

---

## Error Examples

### Invalid File Type
```
Error: Invalid file type. Accepted formats: csv, xlsx
→ Only upload .csv or .xlsx files
```

### File Too Large
```
Error: File size exceeds 100MB limit
→ Use Split CSV/Excel first, then convert
```

### Corrupted File
```
Error: Failed to parse Excel file
→ Try opening in Excel first, save, then retry
```

### Invalid XML
```
Error: Failed to parse XML: [error details]
→ Check XML is well-formed, all tags closed
```

---

## Performance Examples

### Converting 50,000 row CSV to Excel
- Time: ~5 seconds
- Result: Formatted XLSX file
- File size: CSV 5MB → XLSX 2MB (compression)

### Splitting 10K row Excel by 1000 rows
- Time: ~3 seconds
- Result: 10 files automatically zipped
- Files: All same format, ready for parallel processing

### Converting nested XML to JSON
- 5000 elements: ~1 second
- Proper array detection maintained
- Structure fully normalized

---

## Tips & Tricks

### Tip 1: CSV Delimiters
- Default: Comma (,)
- Options: Tab, Semicolon, Space
- Select before conversion if needed

### Tip 2: Split for Performance
Before processing huge files in your app:
1. Use "Split CSV/Excel" first
2. Convert individual parts
3. Process in parallel

### Tip 3: XML Special Characters
- `<`, `>`, `&` automatically escaped
- Attribute values preserved
- No manual fixing needed

### Tip 4: Excel Multiple Sheets
- Single sheet: Converts to CSV/XML directly
- Multiple sheets: Use "Split Excel by Sheets" first
- Each sheet becomes separate file

---

## Common Use Cases

| Use Case | Tools to Use |
|----------|-------------|
| **Data Import** | Excel → JSON / CSV → JSON |
| **Data Export** | JSON → XML / CSV → Excel |
| **Format Migration** | CSV ↔ Excel ↔ JSON ↔ XML |
| **Large File Processing** | Split CSV → Process parts |
| **Report Generation** | Excel → PDF |
| **API Integration** | XML ↔ JSON (bi-directional) |
| **Database Export** | Excel → CSV (import to DB tools) |
| **Cross-System Data** | CSV ↔ XML (legacy integration) |

