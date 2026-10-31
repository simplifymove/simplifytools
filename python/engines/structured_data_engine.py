#!/usr/bin/env python3
"""
Structured Data Conversion Engine

Handles conversions between JSON and XML formats with proper normalization.
Supports: csv-to-json, json-to-xml, xml-to-json, csv-to-xml
"""

import json
import math
import re
import csv
import xml.etree.ElementTree as ET
from xml.dom import minidom
import pandas as pd
from typing import Dict, List, Any, Union
from .delimiter_utils import normalize_delimiter


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
            delimiter = normalize_delimiter(options.get('delimiter', ','))
            print(f"[DEBUG] CSV to JSON: delimiter={repr(delimiter)}")
            
            # Read CSV
            df = pd.read_csv(input_file, sep=delimiter, engine="python")
            print(f"[DEBUG] CSV loaded: {len(df)} rows, {len(df.columns)} columns")
            
            # Convert to JSON
            data = df.to_dict('records')
            # CSV cells are scalar values. Preserve strings and inferred types;
            # missing and non-finite numbers have no JSON numeric representation.
            data = [
                {
                    key: None if pd.isna(value) or (
                        isinstance(value, float) and not math.isfinite(value)
                    ) else value
                    for key, value in record.items()
                }
                for record in data
            ]
            
            # Write JSON
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False, allow_nan=False)
            
        except Exception as e:
            raise ValueError(f"CSV to JSON conversion failed: {e}")
    
    # ==================== JSON to XML ====================
    
    def _json_to_xml(self, input_file: str, output_file: str, options: Dict[str, Any]):
        """Convert JSON to XML"""
        try:
            # Read JSON
            with open(input_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            root_tag = options.get('rootTag') or options.get('root_tag') or 'root'
            item_tag = options.get('itemTag') or options.get('item_tag') or 'item'
            self._validate_xml_tag_name(root_tag, 'rootTag')
            self._validate_xml_tag_name(item_tag, 'itemTag')

            # Create root element using the user-selected, validated name.
            root = ET.Element(root_tag)
            
            # Handle different JSON structures
            if isinstance(data, list):
                # Array of objects
                for item in data:
                    if isinstance(item, dict):
                        item_elem = ET.SubElement(root, item_tag)
                        self._dict_to_xml_element(item, item_elem)
                    else:
                        item_elem = ET.SubElement(root, item_tag)
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
        
        # Ensure the first character is valid for an XML element name.
        if name and not re.match(r'[A-Za-z_]', name[0]):
            name = '_' + name

        # Names beginning with any casing of "xml" are reserved by XML.
        if name.lower().startswith('xml'):
            name = '_' + name
        
        # Ensure not empty
        return name or 'item'

    def _validate_xml_tag_name(self, name: str, option_name: str):
        """Validate configurable XML element names before constructing output."""
        if not isinstance(name, str) or not re.fullmatch(r'[A-Za-z_][A-Za-z0-9._-]*', name):
            raise ValueError(f'{option_name} must be a valid XML element name')
        if name.lower().startswith('xml'):
            raise ValueError(f'{option_name} cannot start with the reserved XML prefix')
    
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
                key = list(data.keys())[0]
                if key == root.tag:
                    data = data[key]

            # Apply XML-to-JSON options.
            include_attributes = options.get('attributes', True)
            pretty = options.get('pretty', True)

            if not isinstance(include_attributes, bool):
                raise ValueError('attributes must be a boolean')
            if not isinstance(pretty, bool):
                raise ValueError('pretty must be a boolean')

            if not include_attributes:
                def remove_attributes(value):
                    if isinstance(value, dict):
                        return {
                            key: remove_attributes(item)
                            for key, item in value.items()
                            if not key.startswith('@')
                        }
                    if isinstance(value, list):
                        return [remove_attributes(item) for item in value]
                    return value

                data = remove_attributes(data)

            # Write JSON using the requested formatting.
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(
                    data,
                    f,
                    indent=2 if pretty else None,
                    separators=None if pretty else (',', ':'),
                    ensure_ascii=False
                )

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
            delimiter = normalize_delimiter(options.get('delimiter', ','))
            print(f"[DEBUG] CSV to XML: delimiter={repr(delimiter)}")
            
            # Read CSV
            df = pd.read_csv(input_file, sep=delimiter, engine="python")
            print(f"[DEBUG] CSV loaded: {len(df)} rows, {len(df.columns)} columns")
            
            # Use the configured XML element names.
            root_tag = options.get('rootTag') or options.get('root_tag') or 'rows'
            item_tag = options.get('itemTag') or options.get('item_tag') or 'row'

            self._validate_xml_tag_name(root_tag, 'rootTag')
            self._validate_xml_tag_name(item_tag, 'itemTag')

            root = ET.Element(root_tag)
            
            # Add rows
            for _, row in df.iterrows():
                row_elem = ET.SubElement(root, item_tag)
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
