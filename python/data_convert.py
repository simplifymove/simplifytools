#!/usr/bin/env python3
"""
Data Conversion Router

Main entry point that routes conversion requests to specific engines.
Called by Node.js API with: python data_convert.py <tool_id> <input_file> <output_file> <options_json>
"""

# Global error handler to catch any startup issues
print("[STARTUP] Python process started", flush=True)

import sys
print(f"[STARTUP] Python version: {sys.version}", flush=True)
print(f"[STARTUP] sys.path initial: {sys.path[:3]}", flush=True)

try:
    import json
    print("[STARTUP] json imported", flush=True)
except Exception as e:
    print(f"[FATAL] Failed to import json: {e}", flush=True)
    sys.exit(1)

try:
    import os
    print("[STARTUP] os imported", flush=True)
except Exception as e:
    print(f"[FATAL] Failed to import os: {e}", flush=True)
    sys.exit(1)

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

try:
    print("[DEBUG] Importing pandas...", flush=True)
    import pandas as pd
    print(f"[DEBUG] pandas version: {pd.__version__}", flush=True)
except Exception as e:
    print(f"[FATAL] Failed to import pandas: {e}", flush=True)
    import traceback
    traceback.print_exc()
    sys.exit(1)

try:
    print("[DEBUG] Importing openpyxl...", flush=True)
    import openpyxl
    print(f"[DEBUG] openpyxl imported successfully", flush=True)
except Exception as e:
    print(f"[FATAL] Failed to import openpyxl: {e}", flush=True)
    import traceback
    traceback.print_exc()
    sys.exit(1)

try:
    print("[DEBUG] Importing spreadsheet engine...", flush=True)
    from engines.spreadsheet_engine import SpreadsheetConvertEngine
    print("[DEBUG] SpreadsheetConvertEngine imported", flush=True)
except Exception as e:
    print(f"[FATAL] Failed to import SpreadsheetConvertEngine: {e}", flush=True)
    import traceback
    traceback.print_exc()
    sys.exit(1)

try:
    print("[DEBUG] Importing structured data engine...", flush=True)
    from engines.structured_data_engine import StructuredDataEngine
    print("[DEBUG] StructuredDataEngine imported", flush=True)
except Exception as e:
    print(f"[FATAL] Failed to import StructuredDataEngine: {e}", flush=True)
    import traceback
    traceback.print_exc()
    sys.exit(1)

try:
    print("[DEBUG] Importing split engine...", flush=True)
    from engines.split_engine import SplitEngine
    print("[DEBUG] SplitEngine imported", flush=True)
except Exception as e:
    print(f"[FATAL] Failed to import SplitEngine: {e}", flush=True)
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("[DEBUG] All imports successful!", flush=True)


def main():
    """Main router function"""
    
    print(f"[DEBUG] main() started", flush=True)
    print(f"[DEBUG] sys.argv: {sys.argv}", flush=True)
    
    if len(sys.argv) < 4:
        print("Usage: data_convert.py <tool_id> <input_file> <output_file> [options_json]", file=sys.stderr)
        sys.exit(1)
    
    tool_id = sys.argv[1]
    input_file = sys.argv[2]
    output_file = sys.argv[3]
    options_json = sys.argv[4] if len(sys.argv) > 4 else '{}'
    
    print(f"[DEBUG] tool_id: {tool_id}", flush=True)
    print(f"[DEBUG] input_file: {input_file}", flush=True)
    print(f"[DEBUG] output_file: {output_file}", flush=True)
    print(f"[DEBUG] options_json: {options_json}", flush=True)
    
    try:
        # Parse options
        options = json.loads(options_json)
        print(f"[DEBUG] options parsed: {options}", flush=True)
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
            print(f"[DEBUG] Using SpreadsheetConvertEngine for {tool_id}", flush=True)
            engine = SpreadsheetConvertEngine()
            print(f"[DEBUG] SpreadsheetConvertEngine instantiated", flush=True)
            engine.convert(tool_id, input_file, output_file, options)
            print(f"[DEBUG] SpreadsheetConvertEngine.convert() completed", flush=True)
            
        elif tool_id in [
            'csv-to-json',
            'json-to-xml',
            'xml-to-json',
            'csv-to-xml',
        ]:
            print(f"[DEBUG] Using StructuredDataEngine for {tool_id}", flush=True)
            engine = StructuredDataEngine()
            engine.convert(tool_id, input_file, output_file, options)
            print(f"[DEBUG] StructuredDataEngine.convert() completed", flush=True)
            
        elif tool_id in [
            'split-csv',
            'split-excel',
        ]:
            print(f"[DEBUG] Using SplitEngine for {tool_id}", flush=True)
            engine = SplitEngine()
            engine.convert(tool_id, input_file, output_file, options)
            print(f"[DEBUG] SplitEngine.convert() completed", flush=True)
            
        else:
            print(f"[ERROR] Unknown tool: {tool_id}", flush=True)
            sys.exit(1)
            
        print(f"[DEBUG] Conversion complete: {tool_id}", flush=True)
        print(f"[SUCCESS] Conversion completed successfully", flush=True)
        sys.exit(0)
        
    except Exception as e:
        print(f"[ERROR] Error during conversion: {e}", flush=True)
        import traceback
        print(f"[ERROR] Traceback:", flush=True)
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    try:
        print("[DEBUG] main() function executing", flush=True)
        main()
    except Exception as e:
        print(f"[FATAL_ERROR] Unhandled exception in main: {e}", flush=True)
        import traceback
        traceback.print_exc()
        sys.exit(1)
    except SystemExit as e:
        print(f"[DEBUG] SystemExit with code: {e.code}", flush=True)
        raise

