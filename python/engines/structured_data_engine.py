#!/usr/bin/env python3
"""
Structured Data Conversion Engine

Handles conversions between JSON and XML formats with proper normalization.
Supports: csv-to-json, json-to-xml, xml-to-json, csv-to-xml
"""

import json
import csv
import xml.etree.ElementTree as ET
from xml.dom import minidom
import pandas as pd
from typing import Dict, List, Any, Union


class StructuredDataEngine:
    """Engine for structured data format conversions"""
    
    def convert(self, tool_id: str, input_file: str, output_file: str, options: Dict[str, Any]):
        """Route to correct conversion method"""
        
        if tool_id == 'csv-to-json':
            self._csv_to_json(input_file, output_file, options)
        elif tool_id == 'json-to-xml':
            self._json_to_xml(input_file, output_file, options)
        elif tool_id == 'xml-to-json':
            self._xml_to_json(input_file, output_file, options)
        elif tool_id == 'csv-to-xml':
            self._csv_to_xml(input_file, output_file, options)
        else:
            raise ValueError(f"Unknown conversion: {tool_id}")
    
    # ==================== CSV to JSON ====================
    
    def _csv_to_json(self, input_file: str, output_file: str, options: Dict[str, Any]):
        """Convert CSV to JSON"""
        try:
            delimiter = options.get('delimiter', ',')
            if delimiter == 'tab':
                delimiter = '\t'
            
            # Read CSV
            df = pd.read_csv(input_file, delimiter=delimiter)
            
            # Convert to JSON
            data = df.to_dict('records')
            
            # Write JSON
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
        except Exception as e:
            raise ValueError(f"CSV to JSON conversion failed: {e}")
    
    # ==================== JSON to XML ====================
    
    def _json_to_xml(self, input_file: str, output_file: str, options: Dict[str, Any]):
        """Convert JSON to XML"""
        try:
            # Read JSON
            with open(input_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Create root element
            root = ET.Element('root')
            
            # Handle different JSON structures
            if isinstance(data, list):
                # Array of objects
                for item in data:
                    if isinstance(item, dict):
                        item_elem = ET.SubElement(root, 'item')
                        self._dict_to_xml_element(item, item_elem)
                    else:
                        item_elem = ET.SubElement(root, 'item')
                        item_elem.text = str(item)
                        
            elif isinstance(data, dict):
                # Single object - add each key as child
                self._dict_to_xml_element(data, root)
            else:
                # Scalar value
                root.text = str(data)
            
            # Pretty print and write
            xml_str = minidom.parseString(ET.tostring(root)).toprettyxml(indent="  ")
            
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(xml_str)
            
        except Exception as e:
            raise ValueError(f"JSON to XML conversion failed: {e}")
    
    def _dict_to_xml_element(self, data: Dict[str, Any], parent: ET.Element):
        """Recursively convert dict to XML element"""
        for key, value in data.items():
            # Handle invalid XML tag names
            tag_name = self._sanitize_tag_name(key)
            
            if isinstance(value, dict):
                # Nested object
                child_elem = ET.SubElement(parent, tag_name)
                self._dict_to_xml_element(value, child_elem)
                
            elif isinstance(value, list):
                # Array of values
                for item in value:
                    item_elem = ET.SubElement(parent, tag_name)
                    if isinstance(item, dict):
                        self._dict_to_xml_element(item, item_elem)
                    else:
                        item_elem.text = str(item) if item is not None else ''
                        
            elif value is None:
                # Null value
                elem = ET.SubElement(parent, tag_name)
                elem.text = ''
                
            else:
                # Scalar value
                elem = ET.SubElement(parent, tag_name)
                elem.text = str(value)
    
    def _sanitize_tag_name(self, name: str) -> str:
        """Sanitize string to valid XML tag name"""
        # XML tag names can't start with numbers or certain characters
        name = str(name).strip()
        
        # Replace invalid characters with underscore
        import re
        name = re.sub(r'[^a-zA-Z0-9_\-]', '_', name)
        
        # Ensure doesn't start with number or hyphen
        if name and name[0].isdigit():
            name = '_' + name
        
        # Ensure not empty
        return name or 'item'
    
    # ==================== XML to JSON ====================
    
    def _xml_to_json(self, input_file: str, output_file: str, options: Dict[str, Any]):
        """Convert XML to JSON"""
        try:
            tree = ET.parse(input_file)
            root = tree.getroot()
            
            # Convert XML to dict
            data = self._xml_element_to_dict(root)
            
            # Handle wrapped root element
            if len(data) == 1:
                # Single key - unwrap if it's the root element name
                key = list(data.keys())[0]
                if key == root.tag:
                    data = data[key]
            
            # Write JSON
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
        except Exception as e:
            raise ValueError(f"XML to JSON conversion failed: {e}")
    
    def _xml_element_to_dict(self, element: ET.Element) -> Dict[str, Any]:
        """Recursively convert XML element to dict"""
        result = {}
        
        # Add attributes
        for key, value in element.attrib.items():
            result[f"@{key}"] = value
        
        # Group child elements by tag name
        children_by_tag = {}
        for child in element:
            if child.tag not in children_by_tag:
                children_by_tag[child.tag] = []
            children_by_tag[child.tag].append(child)
        
        # Process children
        for tag, children in children_by_tag.items():
            if len(children) == 1:
                # Single child
                child = children[0]
                child_dict = self._xml_element_to_dict(child)
                
                if not child_dict:
                    # No children, just text
                    result[tag] = child.text or ''
                else:
                    result[tag] = child_dict
            else:
                # Multiple children with same tag - create array
                items = []
                for child in children:
                    child_dict = self._xml_element_to_dict(child)
                    if not child_dict:
                        items.append(child.text or '')
                    else:
                        items.append(child_dict)
                result[tag] = items
        
        # Add text content if present and no children
        if element.text and element.text.strip() and not children_by_tag:
            result['#text'] = element.text.strip()
        
        return result
    
    # ==================== CSV to XML ====================
    
    def _csv_to_xml(self, input_file: str, output_file: str, options: Dict[str, Any]):
        """Convert CSV to XML"""
        try:
            delimiter = options.get('delimiter', ',')
            if delimiter == 'tab':
                delimiter = '\t'
            
            # Read CSV
            df = pd.read_csv(input_file, delimiter=delimiter)
            
            # Create root element
            root = ET.Element('data')
            
            # Add rows
            for _, row in df.iterrows():
                row_elem = ET.SubElement(root, 'row')
                for col_name, value in row.items():
                    # Handle NaN values
                    if pd.isna(value):
                        value = ''
                    
                    # Sanitize column name for tag
                    tag_name = self._sanitize_tag_name(col_name)
                    cell_elem = ET.SubElement(row_elem, tag_name)
                    cell_elem.text = str(value)
            
            # Pretty print and write
            xml_str = minidom.parseString(ET.tostring(root)).toprettyxml(indent="  ")
            
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(xml_str)
            
        except Exception as e:
            raise ValueError(f"CSV to XML conversion failed: {e}")
