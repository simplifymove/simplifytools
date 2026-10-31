#!/usr/bin/env python3
"""
Spreadsheet Conversion Engine

Handles conversions between Excel, CSV, and XML formats using a common TableData intermediate format.
Supports: csv-to-excel, excel-to-csv, xml-to-excel, xml-to-csv, excel-to-xml, excel-to-pdf
"""

import pandas as pd
import csv
import xml.etree.ElementTree as ET
from xml.dom import minidom
import json
import re
import zipfile
from pathlib import Path
from typing import Dict, List, Any, Optional
import openpyxl
from openpyxl import load_workbook
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.units import inch
from .delimiter_utils import normalize_delimiter


class TableData:
    """Common intermediate format for tabular data"""
    
    def __init__(self):
        self.sheets: List[Dict[str, Any]] = []  # List of sheets, each with name and rows
    
    def add_sheet(self, name: str, rows: List[List[Any]]):
        """Add a sheet with given name and rows"""
        self.sheets.append({
            'name': name,
            'rows': rows
        })
    
    def get_single_sheet_rows(self) -> List[List[Any]]:
        """Get rows from first sheet (for single-sheet formats)"""
        if not self.sheets:
            return []
        return self.sheets[0].get('rows', [])


class SpreadsheetConvertEngine:
    """Engine for spreadsheet format conversions"""
    
    def convert(self, tool_id: str, input_file: str, output_file: str, options: Dict[str, Any]):
        """Route to correct conversion method"""
        
        if tool_id == 'csv-to-excel':
            self._csv_to_excel(input_file, output_file, options)
        elif tool_id == 'excel-to-csv':
            self._excel_to_csv(input_file, output_file, options)
        elif tool_id == 'xml-to-excel':
            self._xml_to_excel(input_file, output_file, options)
        elif tool_id == 'xml-to-csv':
            self._xml_to_csv(input_file, output_file, options)
        elif tool_id == 'excel-to-xml':
            self._excel_to_xml(input_file, output_file, options)
        elif tool_id == 'excel-to-pdf':
            self._excel_to_pdf(input_file, output_file, options)
        else:
            raise ValueError(f"Unknown conversion: {tool_id}")
    
    # ==================== CSV Conversions ====================
    
    def _csv_to_excel(self, input_file: str, output_file: str, options: Dict[str, Any]):
        """Convert CSV to Excel (XLSX) using the selected CSV and worksheet options."""
        try:
            delimiter = normalize_delimiter(options.get('delimiter', 'comma'))
            encoding = options.get('encoding') or 'utf-8'
            sheet_name = options.get('sheetName') or 'Data'
            auto_size = options.get('autoSize', True)

            allowed_encodings = {'utf-8', 'latin-1', 'iso-8859-1', 'cp1252'}
            if encoding not in allowed_encodings:
                raise ValueError('Unsupported CSV encoding')

            if not isinstance(sheet_name, str):
                raise ValueError('Worksheet name must be text')

            if (
                not sheet_name.strip()
                or len(sheet_name) > 31
                or any(char in sheet_name for char in '[]:*?/\\')
                or sheet_name.startswith("'")
                or sheet_name.endswith("'")
            ):
                raise ValueError('Invalid Excel worksheet name')

            if not isinstance(auto_size, bool):
                raise ValueError('Auto-size Columns must be true or false')

            df = pd.read_csv(
                input_file,
                sep=delimiter,
                encoding=encoding,
                engine="python",
            )

            with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name=sheet_name, index=False)

                if auto_size:
                    worksheet = writer.sheets[sheet_name]

                    for column in worksheet.columns:
                        letter = column[0].column_letter
                        max_length = max(
                            (len(str(cell.value)) for cell in column
                             if cell.value is not None),
                            default=0,
                        )
                        worksheet.column_dimensions[letter].width = min(
                            max(max_length + 2, 10),
                            60,
                        )

        except Exception as e:
            raise ValueError(f"CSV to Excel conversion failed: {e}")

    def _excel_to_csv(self, input_file: str, output_file: str, options: Dict[str, Any]):
        """Convert Excel to CSV"""
        try:
            print(f"[DEBUG] Excel to CSV conversion starting", flush=True)
            print(f"[DEBUG] Input file: {input_file}", flush=True)
            print(f"[DEBUG] Output file: {output_file}", flush=True)
            print(f"[DEBUG] Options: {options}", flush=True)
            
            # Check if input file exists
            import os
            if not os.path.exists(input_file):
                raise FileNotFoundError(f"Input file not found: {input_file}")
            print(f"[DEBUG] Input file exists, size: {os.path.getsize(input_file)} bytes", flush=True)
            
            # Determine which sheet to export
            sheet_mode = options.get('sheet_mode', 'first')  # first or zip
            print(f"[DEBUG] Sheet mode: {sheet_mode}", flush=True)
            
            delimiter = normalize_delimiter(options.get('delimiter', 'comma'))

            if sheet_mode in ('zip', 'all'):
                # A CSV can represent one table, so export every worksheet as its own
                # UTF-8 CSV and package the complete workbook inventory in a ZIP.
                print(f"[DEBUG] Reading all sheets from Excel...", flush=True)
                sheets = pd.read_excel(input_file, sheet_name=None, dtype=object)
                print(f"[DEBUG] Found {len(sheets)} sheet(s)", flush=True)
                used_names = set()

                with zipfile.ZipFile(output_file, 'w', zipfile.ZIP_DEFLATED) as archive:
                    for index, (sheet_name, frame) in enumerate(sheets.items(), start=1):
                        safe_base = re.sub(r'[^A-Za-z0-9._-]+', '_', str(sheet_name)).strip('._')
                        safe_base = safe_base or f'sheet_{index}'
                        candidate = safe_base[:100]
                        suffix = 2
                        while candidate.casefold() in used_names:
                            tail = f'_{suffix}'
                            candidate = f'{safe_base[:100-len(tail)]}{tail}'
                            suffix += 1
                        used_names.add(candidate.casefold())
                        csv_bytes = frame.to_csv(index=False, sep=delimiter, lineterminator='\n').encode('utf-8-sig')
                        archive.writestr(f'{candidate}.csv', csv_bytes)
                print(f"[DEBUG] ZIP written successfully to {output_file}", flush=True)
            else:
                # Export first sheet
                print(f"[DEBUG] Reading first sheet from Excel...", flush=True)
                df = pd.read_excel(input_file, sheet_name=0, dtype=object)
                print(f"[DEBUG] Read {len(df)} rows, {len(df.columns)} columns", flush=True)
            
                # Write the first worksheet as one CSV, preserving existing behavior.
                print(f"[DEBUG] Writing CSV with separator: {repr(delimiter)}", flush=True)
                df.to_csv(output_file, index=False, sep=delimiter, encoding="utf-8-sig")
                print(f"[DEBUG] CSV written successfully to {output_file}", flush=True)
            
            # Verify output file
            if not os.path.exists(output_file):
                raise FileNotFoundError(f"Output file was not created: {output_file}")
            print(f"[DEBUG] Output file size: {os.path.getsize(output_file)} bytes", flush=True)
            
        except Exception as e:
            import traceback
            print(f"[ERROR] Excel to CSV conversion failed: {str(e)}", flush=True)
            print(f"[ERROR] Traceback: {traceback.format_exc()}", flush=True)
            raise ValueError(f"Excel to CSV conversion failed: {e}")
    
    # ==================== XML Conversions ====================
    
    def _xml_to_table_data(self, xml_file: str) -> TableData:
        """Parse XML file into TableData format"""
        try:
            tree = ET.parse(xml_file)
            root = tree.getroot()
            
            table_data = TableData()
            rows = []
            
            # Assume first level of children are rows
            for child in root:
                row = self._xml_element_to_row(child)
                rows.append(row)
            
            table_data.add_sheet('Sheet1', rows)
            return table_data
            
        except Exception as e:
            raise ValueError(f"Failed to parse XML: {e}")
    
    def _xml_element_to_row(self, element: ET.Element, prefix: str = '') -> List[Any]:
        """Convert XML element to a table row with flattened fields"""
        row_dict = {}
        
        # Add attributes
        for key, value in element.attrib.items():
            field_name = f"{prefix}{key}" if prefix else key
            row_dict[field_name] = value
        
        # Add child elements
        for child in element:
            field_name = f"{prefix}{child.tag}" if prefix else child.tag
            
            # If child has children, recurse (flatten nested)
            if len(child) > 0:
                nested_row = self._xml_element_to_row(child, f"{field_name}.")
                row_dict.update(nested_row)
            else:
                # Get text content
                row_dict[field_name] = child.text or ''
        
        return [row_dict]
    
    def _xml_to_excel(self, input_file: str, output_file: str, options: Dict[str, Any]):
        """Convert XML to Excel"""
        try:
            # Parse XML to TableData
            table_data = self._xml_to_table_data(input_file)
            rows = table_data.get_single_sheet_rows()
            
            if not rows:
                raise ValueError("No data found in XML")
            
            # Convert each row dict to proper format
            if isinstance(rows[0], list) and isinstance(rows[0][0], dict):
                # Flatten the list of dicts
                all_rows = []
                headers = set()
                for row_list in rows:
                    for row_dict in row_list:
                        all_rows.append(row_dict)
                        headers.update(row_dict.keys())
                
                df = pd.DataFrame(all_rows)
            else:
                df = pd.DataFrame(rows)
            
            df.to_excel(output_file, sheet_name='Sheet1', index=False)
            
        except Exception as e:
            raise ValueError(f"XML to Excel conversion failed: {e}")
    
    def _xml_to_csv(self, input_file: str, output_file: str, options: Dict[str, Any]):
        """Convert XML to CSV"""
        try:
            table_data = self._xml_to_table_data(input_file)
            rows = table_data.get_single_sheet_rows()
            
            delimiter = normalize_delimiter(options.get('delimiter', 'comma'))
            
            if not rows:
                raise ValueError("No data found in XML")
            
            # Flatten rows and create DataFrame
            if isinstance(rows[0], list) and isinstance(rows[0][0], dict):
                all_rows = []
                for row_list in rows:
                    all_rows.extend(row_list)
                df = pd.DataFrame(all_rows)
            else:
                df = pd.DataFrame(rows)
            
            df.to_csv(output_file, index=False, sep=delimiter, encoding="utf-8-sig")
            
        except Exception as e:
            raise ValueError(f"XML to CSV conversion failed: {e}")
    
    def _excel_to_xml(self, input_file: str, output_file: str, options: Dict[str, Any]):
        """Convert the first Excel worksheet into XML."""
        try:
            root_tag = options.get('rootTag', options.get('root_tag')) or 'rows'
            item_tag = options.get('itemTag', options.get('item_tag')) or 'row'

            def valid_xml_name(name):
                return (
                    isinstance(name, str)
                    and re.fullmatch(r'[A-Za-z_][A-Za-z0-9._-]*', name) is not None
                    and not name.lower().startswith('xml')
                )

            if not valid_xml_name(root_tag):
                raise ValueError('Invalid XML root tag name')

            if not valid_xml_name(item_tag):
                raise ValueError('Invalid XML item tag name')

            def normalize_column_name(name):
                value = str(name).strip()
                value = re.sub(r'[^A-Za-z0-9._-]', '_', value)

                if not value or not re.match(r'[A-Za-z_]', value[0]):
                    value = 'field_' + value

                if value.lower().startswith('xml'):
                    value = 'field_' + value

                return value

            df = pd.read_excel(input_file, sheet_name=0)

            column_names = []
            used_names = set()

            for index, column in enumerate(df.columns, start=1):
                base = normalize_column_name(column)

                if not base:
                    base = f'field_{index}'

                name = base
                suffix = 2

                while name in used_names:
                    name = f'{base}_{suffix}'
                    suffix += 1

                used_names.add(name)
                column_names.append(name)

            root = ET.Element(root_tag)

            for _, row in df.iterrows():
                row_elem = ET.SubElement(root, item_tag)

                for column_name, value in zip(column_names, row.values):
                    if pd.isna(value):
                        value = ''

                    cell_elem = ET.SubElement(row_elem, column_name)
                    cell_elem.text = str(value)

            xml_bytes = ET.tostring(root, encoding='utf-8')
            xml_str = minidom.parseString(xml_bytes).toprettyxml(
                indent='  ',
                encoding='utf-8'
            )

            with open(output_file, 'wb') as output:
                output.write(xml_str)

        except Exception as e:
            raise ValueError(f"Excel to XML conversion failed: {e}")

    # ==================== PDF Conversion ====================
    
    def _excel_to_pdf(self, input_file: str, output_file: str, options: Dict[str, Any]):
        """Render Excel worksheet values as PDF tables."""
        from xml.sax.saxutils import escape
        from reportlab.lib.pagesizes import landscape
        from reportlab.platypus import PageBreak, LongTable
        from reportlab.lib.styles import ParagraphStyle

        try:
            sheet_mode = options.get('sheet_mode', options.get('sheetMode', 'first'))
            orientation = options.get('orientation', 'portrait')
            fit_to_width = options.get('fitToWidth', options.get('fit_to_width', True))

            if sheet_mode not in ('first', 'all'):
                raise ValueError('Sheets to Export must be first or all')
            if orientation not in ('portrait', 'landscape'):
                raise ValueError('Page Orientation must be portrait or landscape')
            if not isinstance(fit_to_width, bool):
                raise ValueError('Fit to Width must be true or false')

            page_size = landscape(letter) if orientation == 'landscape' else letter
            doc = SimpleDocTemplate(
                output_file,
                pagesize=page_size,
                leftMargin=36,
                rightMargin=36,
                topMargin=36,
                bottomMargin=36,
            )

            sheets = pd.read_excel(
                input_file,
                sheet_name=None if sheet_mode == 'all' else 0,
                dtype=object,
            )

            if isinstance(sheets, pd.DataFrame):
                sheets = {'Sheet 1': sheets}

            available_width = page_size[0] - doc.leftMargin - doc.rightMargin

            cell_style = ParagraphStyle(
                'ExcelPDFCell',
                fontName='Helvetica',
                fontSize=8,
                leading=10,
                wordWrap='CJK',
            )

            header_style = ParagraphStyle(
                'ExcelPDFHeader',
                parent=cell_style,
                fontName='Helvetica-Bold',
                textColor=colors.whitesmoke,
            )

            def cell_text(value):
                if pd.isna(value):
                    return ''
                return escape(str(value))

            elements = []

            for index, (sheet_name, df) in enumerate(sheets.items()):
                if index:
                    elements.append(PageBreak())

                if sheet_mode == 'all':
                    elements.append(Paragraph(
                        escape(str(sheet_name)),
                        ParagraphStyle(
                            'ExcelPDFSheetTitle',
                            fontName='Helvetica-Bold',
                            fontSize=12,
                            leading=15,
                            spaceAfter=10,
                        ),
                    ))

                column_count = max(len(df.columns), 1)

                rows = [[
                    Paragraph(cell_text(value), header_style)
                    for value in df.columns
                ]]

                for record in df.itertuples(index=False, name=None):
                    rows.append([
                        Paragraph(cell_text(value), cell_style)
                        for value in record
                    ])

                if fit_to_width:
                    widths = [available_width / column_count] * column_count
                else:
                    widths = [max(90, available_width / min(column_count, 5))] * column_count

                column_groups = []

                if fit_to_width:
                    column_groups.append(list(range(column_count)))
                else:
                    current_group = []
                    current_width = 0

                    for column_index, width in enumerate(widths):
                        if current_group and current_width + width > available_width:
                            column_groups.append(current_group)
                            current_group = []
                            current_width = 0

                        current_group.append(column_index)
                        current_width += width

                    if current_group:
                        column_groups.append(current_group)

                for group_index, group in enumerate(column_groups):
                    if group_index:
                        elements.append(PageBreak())

                    group_rows = [
                        [row[column_index] for column_index in group]
                        for row in rows
                    ]

                    group_widths = [widths[column_index] for column_index in group]

                    table = LongTable(
                        group_rows,
                        colWidths=group_widths,
                        repeatRows=1,
                        hAlign='LEFT',
                    )

                    table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
                        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                        ('LEFTPADDING', (0, 0), (-1, -1), 5),
                        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
                        ('TOPPADDING', (0, 0), (-1, -1), 5),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
                    ]))

                    elements.append(table)

            doc.build(elements)

        except Exception as e:
            raise ValueError(f"Excel to PDF conversion failed: {e}")
