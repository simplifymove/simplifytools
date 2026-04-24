#!/usr/bin/env python3
"""
Image Translation Engine
Performs OCR and translates text with position information
"""
import argparse
import json
import sys
from PIL import Image
import easyocr
import os

def detect_language_name_to_code(lang_name: str) -> str:
    """Convert language name to easyocr code"""
    lang_map = {
        'en': 'en',
        'es': 'es',
        'fr': 'fr',
        'de': 'de',
        'it': 'it',
        'pt': 'pt',
        'ja': 'ja',
        'ko': 'ko',
        'zh': 'zh',
        'ru': 'ru',
        'ar': 'ar',
        'hi': 'hi',
    }
    return lang_map.get(lang_name.lower(), 'en')

def translate_text_deepl_api(text: str, source_lang: str, target_lang: str) -> str:
    """Translate using free MyMemory translation API"""
    if source_lang == target_lang:
        return text
    
    try:
        import requests
        
        # Map language codes to MyMemory format (en, es, fr, etc.)
        lang_map = {
            'en': 'en',
            'es': 'es',
            'fr': 'fr',
            'de': 'de',
            'it': 'it',
            'pt': 'pt',
            'ja': 'ja',
            'ko': 'ko',
            'zh': 'zh',
            'ru': 'ru',
            'ar': 'ar',
            'hi': 'hi',
        }
        
        src_code = lang_map.get(source_lang.lower(), 'en')
        tgt_code = lang_map.get(target_lang.lower(), 'en')
        
        # Use MyMemory API (free, no authentication required)
        api_url = f"https://api.mymemory.translated.net/get?q={text}&langpair={src_code}|{tgt_code}"
        
        try:
            response = requests.get(api_url, timeout=10)
            if response.status_code == 200:
                result = response.json()
                if result.get('responseStatus') == 200:
                    translated = result.get('responseData', {}).get('translatedText', '')
                    if translated:
                        return translated
        except Exception as api_err:
            print(f"MyMemory API error: {api_err}", file=sys.stderr)
        
        # Fallback: return original text if translation fails
        return text
        
    except Exception as e:
        print(f"Translation error: {e}", file=sys.stderr)
        return text

def extract_and_translate(input_path: str, output_path: str, source_lang: str, target_lang: str) -> None:
    """Extract text from image and translate it"""
    
    # Initialize OCR reader
    print(f"Initializing OCR for language: {source_lang}...", file=sys.stderr)
    reader = easyocr.Reader([detect_language_name_to_code(source_lang)])
    
    # Perform OCR
    print(f"Performing OCR on {input_path}...", file=sys.stderr)
    results = reader.readtext(input_path)
    
    translations = []
    
    # Process OCR results
    for (bbox, text, confidence) in results:
        if confidence < 0.1:  # Skip low confidence text
            continue
        
        # Calculate position (use top-left of bounding box)
        x = int(bbox[0][0])
        y = int(bbox[0][1])
        
        # Translate text
        print(f"Translating '{text}' from {source_lang} to {target_lang}...", file=sys.stderr)
        translated = translate_text_deepl_api(text, source_lang, target_lang)
        
        translations.append({
            'original': text,
            'translated': translated,
            'x': x,
            'y': y,
            'confidence': float(confidence)
        })
    
    # Save results
    print(f"Saving results to {output_path}...", file=sys.stderr)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(translations, f, ensure_ascii=False, indent=2)
    
    print(f"✓ Translation complete: {len(translations)} text items found and translated", file=sys.stderr)

def main():
    parser = argparse.ArgumentParser(description='Translate text in images')
    parser.add_argument('--input', required=True, help='Input image path')
    parser.add_argument('--output', required=True, help='Output JSON path')
    parser.add_argument('--source', default='en', help='Source language code')
    parser.add_argument('--target', default='es', help='Target language code')
    
    args = parser.parse_args()
    
    try:
        extract_and_translate(args.input, args.output, args.source, args.target)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
