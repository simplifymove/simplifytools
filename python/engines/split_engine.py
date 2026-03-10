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
from pathlib import Path
from typing import Dict, List, Any, Tuple
from io import StringIO


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
            delimiter = options.get('delimiter', ',')
            if delimiter == 'tab':
                delimiter = '\t'
            
            # Read CSV
            df = pd.read_csv(input_file, delimiter=delimiter)
            
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
        
        if num_parts == 1:
            # Single file - just save as the output file
            if is_csv:
                df.to_csv(output_file, index=False, delimiter=delimiter)
            else:
                df.to_excel(output_file, sheet_name='Sheet1', index=False)
        else:
            # Multiple files - create zip
            temp_files = []
            output_dir = os.path.dirname(output_file)
            base_name = Path(output_file).stem
            file_ext = '.csv' if is_csv else '.xlsx'
            
            for i in range(num_parts):
                start_idx = i * rows_per_file
                end_idx = min((i + 1) * rows_per_file, total_rows)
                part_df = df.iloc[start_idx:end_idx]
                
                # Create part filename
                part_filename = f"{base_name}_part_{i+1}{file_ext}"
                part_path = os.path.join(output_dir, part_filename)
                
                # Save part
                if is_csv:
                    part_df.to_csv(part_path, index=False, delimiter=delimiter)
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
        
        for i in range(num_parts):
            start_idx = i * rows_per_part
            end_idx = min((i + 1) * rows_per_part, total_rows)
            
            if start_idx >= total_rows:
                break
            
            part_df = df.iloc[start_idx:end_idx]
            
            # Create part filename
            part_filename = f"{base_name}_part_{i+1}{file_ext}"
            part_path = os.path.join(output_dir, part_filename)
            
            # Save part
            if is_csv:
                part_df.to_csv(part_path, index=False, delimiter=delimiter)
            else:
                part_df.to_excel(part_path, sheet_name='Sheet1', index=False)
            
            temp_files.append((part_filename, part_path))
        
        if len(temp_files) == 1:
            # Single file - just save as output
            os.rename(temp_files[0][1], output_file)
        else:
            # Multiple files - create zip
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
        
        if num_groups == 1:
            # Only one unique value - save as single file
            if is_csv:
                df.to_csv(output_file, index=False, delimiter=delimiter)
            else:
                df.to_excel(output_file, sheet_name='Sheet1', index=False)
        else:
            # Multiple groups - create zip
            temp_files = []
            output_dir = os.path.dirname(output_file)
            base_name = Path(output_file).stem
            file_ext = '.csv' if is_csv else '.xlsx'
            
            for i, value in enumerate(unique_values):
                group_df = df[df[column_name] == value]
                
                # Create filename for this group
                part_filename = f"{base_name}_{str(value)[:20]}{file_ext}"
                part_path = os.path.join(output_dir, part_filename)
                
                # Save group
                if is_csv:
                    group_df.to_csv(part_path, index=False, delimiter=delimiter)
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
        
        if len(sheet_names) == 1:
            # Only one sheet - just save as xlsx
            df = pd.read_excel(input_file, sheet_name=0)
            df.to_excel(output_file, sheet_name='Sheet1', index=False)
        else:
            # Multiple sheets - create separate files and zip
            temp_files = []
            output_dir = os.path.dirname(output_file)
            base_name = Path(output_file).stem
            
            for sheet_name in sheet_names:
                # Read sheet
                df = pd.read_excel(input_file, sheet_name=sheet_name)
                
                # Create filename for this sheet
                safe_sheet_name = self._sanitize_filename(sheet_name)
                sheet_filename = f"{base_name}_{safe_sheet_name}.xlsx"
                sheet_path = os.path.join(output_dir, sheet_filename)
                
                # Save sheet
                df.to_excel(sheet_path, sheet_name='Sheet1', index=False)
                
                temp_files.append((sheet_filename, sheet_path))
            
            # Create zip
            self._create_zip(output_file, temp_files)
    
    # ==================== Utility Methods ====================
    
    def _create_zip(self, output_file: str, temp_files: List[Tuple[str, str]]):
        """Create zip file from list of temporary files"""
        
        with zipfile.ZipFile(output_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for filename, filepath in temp_files:
                zipf.write(filepath, arcname=filename)
        
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
