#!/usr/bin/env python3
"""
Data Conversion Router

Main entry point that routes conversion requests to specific engines.
Called by Node.js API with: python data_convert.py <tool_id> <input_file> <output_file> <options_json>
"""

import sys
import json
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from engines.spreadsheet_engine import SpreadsheetConvertEngine
from engines.structured_data_engine import StructuredDataEngine
from engines.split_engine import SplitEngine


def main():
    """Main router function"""
    
    if len(sys.argv) < 4:
        print("Usage: data_convert.py <tool_id> <input_file> <output_file> [options_json]", file=sys.stderr)
        sys.exit(1)
    
    tool_id = sys.argv[1]
    input_file = sys.argv[2]
    output_file = sys.argv[3]
    options_json = sys.argv[4] if len(sys.argv) > 4 else '{}'
    
    try:
        # Parse options
        options = json.loads(options_json)
    except json.JSONDecodeError as e:
        print(f"Error parsing options JSON: {e}", file=sys.stderr)
        sys.exit(1)
    
    try:
        # Route to correct engine based on tool ID
        if tool_id in [
            'csv-to-excel',
            'excel-to-csv',
            'xml-to-excel',
            'xml-to-csv',
            'excel-to-xml',
            'excel-to-pdf',
        ]:
            engine = SpreadsheetConvertEngine()
            engine.convert(tool_id, input_file, output_file, options)
            
        elif tool_id in [
            'csv-to-json',
            'json-to-xml',
            'xml-to-json',
            'csv-to-xml',
        ]:
            engine = StructuredDataEngine()
            engine.convert(tool_id, input_file, output_file, options)
            
        elif tool_id in [
            'split-csv',
            'split-excel',
        ]:
            engine = SplitEngine()
            engine.convert(tool_id, input_file, output_file, options)
            
        else:
            print(f"Unknown tool: {tool_id}", file=sys.stderr)
            sys.exit(1)
            
        print(f"Conversion complete: {tool_id}")
        sys.exit(0)
        
    except Exception as e:
        print(f"Error during conversion: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
