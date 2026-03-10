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
from pathlib import Path
from typing import Dict, List, Any, Optional
import openpyxl
from openpyxl import load_workbook
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.units import inch


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
        """Convert CSV to Excel (XLSX)"""
        try:
            delimiter = options.get('delimiter', ',')
            if delimiter == 'tab':
                delimiter = '\t'
            
            # Read CSV
            df = pd.read_csv(input_file, delimiter=delimiter)
            
            # Write to Excel
            df.to_excel(output_file, sheet_name='Sheet1', index=False)
            
        except Exception as e:
            raise ValueError(f"CSV to Excel conversion failed: {e}")
    
    def _excel_to_csv(self, input_file: str, output_file: str, options: Dict[str, Any]):
        """Convert Excel to CSV"""
        try:
            # Determine which sheet to export
            sheet_mode = options.get('sheet_mode', 'first')  # first or all
            
            if sheet_mode == 'all':
                # Export all sheets as single CSV with all rows (first sheet only for CSV format)
                df = pd.read_excel(input_file, sheet_name=0)
            else:
                # Export first sheet
                df = pd.read_excel(input_file, sheet_name=0)
            
            # Write to CSV
            delimiter = options.get('delimiter', ',')
            if delimiter == 'tab':
                delimiter = '\t'
            
            df.to_csv(output_file, index=False, delimiter=delimiter)
            
        except Exception as e:
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
            
            delimiter = options.get('delimiter', ',')
            if delimiter == 'tab':
                delimiter = '\t'
            
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
            
            df.to_csv(output_file, index=False, delimiter=delimiter)
            
        except Exception as e:
            raise ValueError(f"XML to CSV conversion failed: {e}")
    
    def _excel_to_xml(self, input_file: str, output_file: str, options: Dict[str, Any]):
        """Convert Excel to XML"""
        try:
            df = pd.read_excel(input_file, sheet_name=0)
            
            # Create root element
            root = ET.Element('data')
            
            # Add rows
            for _, row in df.iterrows():
                row_elem = ET.SubElement(root, 'row')
                for col_name, value in row.items():
                    # Handle NaN values
                    if pd.isna(value):
                        value = ''
                    
                    cell_elem = ET.SubElement(row_elem, col_name)
                    cell_elem.text = str(value)
            
            # Pretty print and write
            xml_str = minidom.parseString(ET.tostring(root)).toprettyxml(indent="  ")
            
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(xml_str)
            
        except Exception as e:
            raise ValueError(f"Excel to XML conversion failed: {e}")
    
    # ==================== PDF Conversion ====================
    
    def _excel_to_pdf(self, input_file: str, output_file: str, options: Dict[str, Any]):
        """Convert Excel to PDF using ReportLab"""
        try:
            # Read Excel
            df = pd.read_excel(input_file, sheet_name=0)
            
            # Prepare data for table
            data = [list(df.columns)]  # Header row
            for _, row in df.iterrows():
                data.append([str(v) if not pd.isna(v) else '' for v in row.values])
            
            # Create PDF
            doc = SimpleDocTemplate(output_file, pagesize=letter)
            elements = []
            
            # Create table
            table = Table(data)
            
            # Style table
            style = TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
            ])
            
            table.setStyle(style)
            elements.append(table)
            
            # Build PDF
            doc.build(elements)
            
        except Exception as e:
            raise ValueError(f"Excel to PDF conversion failed: {e}")
