#!/usr/bin/env python3
"""
Split Engine

Handles splitting large CSV and Excel files into multiple smaller parts.
Supports: split-csv, split-excel
Modes: split by row count, by part count, by column value, by sheet (for Excel)
"""

import pandas as pd
import csv
import zipfile
import os
import io
from pathlib import Path
from typing import Dict, List, Any, Tuple
from io import StringIO


def normalize_delimiter(value):
    """Convert delimiter string representation to actual character"""
    mapping = {
        "comma": ",",
        "tab": "\t",
        "semicolon": ";",
        "pipe": "|",
        ",": ",",
        "\t": "\t",
        ";": ";",
        "|": "|",
    }
    result = mapping.get(str(value).lower(), ",")
    print(f"[DEBUG] normalize_delimiter({repr(value)}) -> {repr(result)}")
    return result


class SplitEngine:
    """Engine for file splitting operations"""
    
    def convert(self, tool_id: str, input_file: str, output_file: str, options: Dict[str, Any]):
        """Route to correct splitting method"""
        
        if tool_id == 'split-csv':
            self._split_csv(input_file, output_file, options)
        elif tool_id == 'split-excel':
            self._split_excel(input_file, output_file, options)
        else:
            raise ValueError(f"Unknown splitting operation: {tool_id}")
    
    # ==================== CSV Splitting ====================
    
    def _split_csv(self, input_file: str, output_file: str, options: Dict[str, Any]):
        """Split CSV file based on specified mode"""
        
        mode = options.get('split_mode', 'by_rows')  # by_rows, by_parts, by_column_value
        
        try:
            # Normalize and convert delimiter
            delimiter = normalize_delimiter(options.get('delimiter', ','))
            print(f"[DEBUG] CSV split mode: {mode}, delimiter: {repr(delimiter)}")
            
            # Read CSV
            df = pd.read_csv(input_file, sep=delimiter, engine="python")
            print(f"[DEBUG] CSV loaded: {len(df)} rows, {len(df.columns)} columns")
            
            if mode == 'by_rows':
                self._split_by_row_count(df, output_file, options, delimiter, is_csv=True)
                
            elif mode == 'by_parts':
                self._split_by_part_count(df, output_file, options, delimiter, is_csv=True)
                
            elif mode == 'by_column_value':
                self._split_by_column_value(df, output_file, options, delimiter, is_csv=True)
                
            else:
                raise ValueError(f"Unknown split mode: {mode}")
            
        except Exception as e:
            raise ValueError(f"CSV splitting failed: {e}")
    
    def _split_excel(self, input_file: str, output_file: str, options: Dict[str, Any]):
        """Split Excel file based on specified mode"""
        
        mode = options.get('split_mode', 'by_rows')  # by_rows, by_parts, by_sheet
        
        try:
            # Read Excel - get all sheets or specific sheet
            if mode == 'by_sheet':
                self._split_by_sheet(input_file, output_file, options)
            else:
                # Read first sheet for row-based splitting
                df = pd.read_excel(input_file, sheet_name=0)
                
                if mode == 'by_rows':
                    self._split_by_row_count(df, output_file, options, delimiter=None, is_csv=False)
                    
                elif mode == 'by_parts':
                    self._split_by_part_count(df, output_file, options, delimiter=None, is_csv=False)
                    
                else:
                    raise ValueError(f"Unknown split mode: {mode}")
                    
        except Exception as e:
            raise ValueError(f"Excel splitting failed: {e}")
    
    # ==================== Splitting Methods ====================
    
    def _split_by_row_count(self, df: pd.DataFrame, output_file: str, options: Dict[str, Any],
                            delimiter: str = None, is_csv: bool = True):
        """Split by fixed row count per file"""
        
        rows_per_file = int(options.get('rows_per_file', 1000))
        if rows_per_file < 1:
            rows_per_file = 1000
        
        # Get total parts
        total_rows = len(df)
        num_parts = (total_rows + rows_per_file - 1) // rows_per_file
        
        # Always create zip for split operations
        temp_files = []
        output_dir = os.path.dirname(output_file)
        base_name = Path(output_file).stem
        file_ext = '.csv' if is_csv else '.xlsx'
        
        print(f"[DEBUG] Splitting into {num_parts} parts. base_name='{base_name}', file_ext='{file_ext}', output_dir='{output_dir}'")
        
        for i in range(num_parts):
            start_idx = i * rows_per_file
            end_idx = min((i + 1) * rows_per_file, total_rows)
            part_df = df.iloc[start_idx:end_idx]
            
            # Create part filename
            part_filename = f"{base_name}_part_{i+1}{file_ext}"
            part_path = os.path.join(output_dir, part_filename)
            
            print(f"[DEBUG] Part {i+1}: {part_filename} ({len(part_df)} rows)")
            
            # Save part
            if is_csv:
                part_df.to_csv(part_path, index=False, sep=delimiter, encoding="utf-8-sig")
            else:
                part_df.to_excel(part_path, sheet_name='Sheet1', index=False)
            
            temp_files.append((part_filename, part_path))
        
        # Create zip
        self._create_zip(output_file, temp_files)
    
    def _split_by_part_count(self, df: pd.DataFrame, output_file: str, options: Dict[str, Any],
                             delimiter: str = None, is_csv: bool = True):
        """Split into fixed number of parts"""
        
        num_parts = int(options.get('num_parts', 2))
        if num_parts < 2:
            num_parts = 2
        
        total_rows = len(df)
        rows_per_part = (total_rows + num_parts - 1) // num_parts
        
        temp_files = []
        output_dir = os.path.dirname(output_file)
        base_name = Path(output_file).stem
        file_ext = '.csv' if is_csv else '.xlsx'
        
        print(f"[DEBUG] Splitting into {num_parts} parts by part count. base_name='{base_name}', file_ext='{file_ext}'")
        
        for i in range(num_parts):
            start_idx = i * rows_per_part
            end_idx = min((i + 1) * rows_per_part, total_rows)
            
            if start_idx >= total_rows:
                break
            
            part_df = df.iloc[start_idx:end_idx]
            
            # Create part filename
            part_filename = f"{base_name}_part_{i+1}{file_ext}"
            part_path = os.path.join(output_dir, part_filename)
            
            print(f"[DEBUG] Part {i+1}: {part_filename} ({len(part_df)} rows)")
            
            # Save part
            if is_csv:
                part_df.to_csv(part_path, index=False, sep=delimiter, encoding="utf-8-sig")
            else:
                part_df.to_excel(part_path, sheet_name='Sheet1', index=False)
            
            temp_files.append((part_filename, part_path))
        
        # Create zip
        self._create_zip(output_file, temp_files)
    
    def _split_by_column_value(self, df: pd.DataFrame, output_file: str, options: Dict[str, Any],
                               delimiter: str = None, is_csv: bool = True):
        """Split by unique values in a column"""
        
        column_name = options.get('column_name')
        if not column_name or column_name not in df.columns:
            raise ValueError(f"Column '{column_name}' not found in data")
        
        # Get unique values
        unique_values = df[column_name].unique()
        num_groups = len(unique_values)
        
        # Always create zip for split operations
        temp_files = []
        output_dir = os.path.dirname(output_file)
        base_name = Path(output_file).stem
        file_ext = '.csv' if is_csv else '.xlsx'
        
        print(f"[DEBUG] Splitting by column '{column_name}' into {num_groups} groups. base_name='{base_name}', file_ext='{file_ext}'")
        
        for i, value in enumerate(unique_values):
            group_df = df[df[column_name] == value]
            
            # Create filename for this group
            part_filename = f"{base_name}_{str(value)[:20]}{file_ext}"
            part_path = os.path.join(output_dir, part_filename)
            
            print(f"[DEBUG] Group {i+1} (value={repr(value)}): {part_filename} ({len(group_df)} rows)")
            
            # Save group
            if is_csv:
                group_df.to_csv(part_path, index=False, sep=delimiter, encoding="utf-8-sig")
            else:
                group_df.to_excel(part_path, sheet_name='Sheet1', index=False)
            
            temp_files.append((part_filename, part_path))
        
        # Create zip
        self._create_zip(output_file, temp_files)
    
    def _split_by_sheet(self, input_file: str, output_file: str, options: Dict[str, Any]):
        """Split Excel by sheets (export all sheets as separate files and zip)"""
        
        # Read all sheet names
        excel_file = pd.ExcelFile(input_file)
        sheet_names = excel_file.sheet_names
        
        # Always create zip for split operations
        temp_files = []
        output_dir = os.path.dirname(output_file)
        base_name = Path(output_file).stem
        
        print(f"[DEBUG] Splitting by sheets into {len(sheet_names)} files. base_name='{base_name}'")
        
        for sheet_name in sheet_names:
            # Read sheet
            df = pd.read_excel(input_file, sheet_name=sheet_name)
            
            # Create filename for this sheet
            safe_sheet_name = self._sanitize_filename(sheet_name)
            sheet_filename = f"{base_name}_{safe_sheet_name}.xlsx"
            sheet_path = os.path.join(output_dir, sheet_filename)
            
            print(f"[DEBUG] Sheet '{sheet_name}': {sheet_filename} ({len(df)} rows)")
            
            # Save sheet
            df.to_excel(sheet_path, sheet_name='Sheet1', index=False)
            
            temp_files.append((sheet_filename, sheet_path))
        
        # Create zip
        self._create_zip(output_file, temp_files)
    
    # ==================== Utility Methods ====================
    
    def _create_zip(self, output_file: str, temp_files: List[Tuple[str, str]]):
        """Create zip file from list of temporary files"""
        
        try:
            # Create ZIP in memory first for reliability
            zip_buffer = io.BytesIO()
            print(f"[DEBUG] Creating ZIP with {len(temp_files)} files: {[f[0] for f in temp_files]}")
            
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_STORED) as zipf:
                for filename, filepath in temp_files:
                    try:
                        with open(filepath, 'rb') as f:
                            file_data = f.read()
                        print(f"[DEBUG] Adding to ZIP: '{filename}' (size: {len(file_data)} bytes)")
                        zipf.writestr(filename, file_data, compress_type=zipfile.ZIP_STORED)
                    except Exception as e:
                        print(f"[WARNING] Failed to add {filename} to ZIP: {str(e)}")
            
            # Write in-memory ZIP to disk
            zip_buffer.seek(0)
            with open(output_file, 'wb') as f:
                f.write(zip_buffer.getvalue())
            
            # Verify ZIP file is valid
            try:
                with zipfile.ZipFile(output_file, 'r') as verify_zf:
                    test_result = verify_zf.testzip()
                    if test_result is not None:
                        raise Exception(f"ZIP file corrupt at: {test_result}")
            except Exception as e:
                raise Exception(f"ZIP file validation failed: {str(e)}")
        
        except Exception as e:
            print(f"[ERROR] Failed to create ZIP file: {str(e)}")
            raise
        finally:
            # Clean up temporary files
            for _, filepath in temp_files:
                try:
                    os.remove(filepath)
                except:
                    pass
    
    def _sanitize_filename(self, filename: str) -> str:
        """Remove invalid filename characters"""
        
        import re
        # Replace invalid characters with underscore
        filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
        # Limit length
        return filename[:50]
