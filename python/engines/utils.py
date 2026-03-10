"""Shared utilities for converter engines"""
import os
import json
import zipfile
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)


def validate_file_exists(filepath: str) -> bool:
    """Check if input file exists"""
    if not os.path.exists(filepath):
        logger.error(f"File not found: {filepath}")
        return False
    return True


def safe_remove(filepath: str) -> None:
    """Safely remove file if exists"""
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
            logger.debug(f"Removed: {filepath}")
    except Exception as e:
        logger.warning(f"Could not remove {filepath}: {e}")


def create_zip(files: List[str], output_zip: str) -> bool:
    """Create zip file from list of files"""
    try:
        logger.info(f"Creating zip: {output_zip}")
        with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
            for filepath in files:
                if os.path.exists(filepath):
                    arcname = os.path.basename(filepath)
                    zf.write(filepath, arcname=arcname)
        logger.info(f"Zip created successfully: {output_zip}")
        return True
    except Exception as e:
        logger.error(f"Failed to create zip: {e}")
        return False


def save_json(data: Dict[str, Any], output_file: str) -> bool:
    """Save data as JSON"""
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        logger.info(f"JSON saved: {output_file}")
        return True
    except Exception as e:
        logger.error(f"Failed to save JSON: {e}")
        return False


def get_file_size_mb(filepath: str) -> float:
    """Get file size in MB"""
    if os.path.exists(filepath):
        return os.path.getsize(filepath) / (1024 * 1024)
    return 0


def get_file_mime_type(filepath: str) -> str:
    """Get MIME type from file extension"""
    ext = Path(filepath).suffix.lower()
    mime_types = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.bmp': 'image/bmp',
        '.tiff': 'image/tiff',
        '.pdf': 'application/pdf',
        '.mp4': 'video/mp4',
        '.txt': 'text/plain',
        '.json': 'application/json',
        '.zip': 'application/zip',
    }
    return mime_types.get(ext, 'application/octet-stream')


def log_execution(engine: str, from_fmt: str, to_fmt: str, input_file: str, output_file: str, success: bool):
    """Log conversion execution"""
    input_size = f"{get_file_size_mb(input_file):.2f}MB" if os.path.exists(input_file) else "N/A"
    output_size = f"{get_file_size_mb(output_file):.2f}MB" if os.path.exists(output_file) else "N/A"
    status = "✓" if success else "✗"
    logger.info(f"{status} {engine}: {from_fmt}→{to_fmt} | In: {input_size}, Out: {output_size}")
