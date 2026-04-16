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

# Ensure system site-packages are accessible (for VPS deployment)
def _ensure_site_packages():
    """Aggressively ensure site-packages are in sys.path"""
    added_paths = []
    
    # Try site.getsitepackages() first
    try:
        import site
        for site_dir in site.getsitepackages():
            if site_dir not in sys.path:
                sys.path.insert(0, site_dir)
                added_paths.append(site_dir)
    except (AttributeError, TypeError):
        pass
    
    # Try sysconfig
    try:
        import sysconfig
        for scheme in ['posix_prefix', 'posix_venv', 'venv']:
            for path_name in ['purelib', 'platlib']:
                try:
                    sp = sysconfig.get_path(path_name, scheme)
                    if sp and os.path.exists(sp) and sp not in sys.path:
                        sys.path.insert(0, sp)
                        added_paths.append(sp)
                except:
                    pass
    except Exception:
        pass
    
    # Try common system locations on Linux/VPS
    common_paths = [
        # Python 3.12
        '/usr/local/lib/python3.12/site-packages',
        '/usr/lib/python3.12/site-packages',
        # Python 3.11
        '/usr/local/lib/python3.11/site-packages',
        '/usr/lib/python3.11/site-packages',
        # Python 3.10
        '/usr/local/lib/python3.10/site-packages',
        '/usr/lib/python3.10/site-packages',
        # Generic dist-packages (Debian/Ubuntu)
        '/usr/lib/python3/dist-packages',
        '/usr/local/lib/python3/dist-packages',
        # Site packages in common prefix locations
        '/opt/python/site-packages',
    ]
    
    for path in common_paths:
        if os.path.exists(path) and path not in sys.path:
            sys.path.insert(0, path)
            added_paths.append(path)
    
    return added_paths

# Run the site-packages discovery
_ensure_site_packages()

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
