import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

export const maxDuration = 300;

interface TranslationResult {
  original: string;
  translated: string;
  x: number;
  y: number;
  confidence: number;
}

function spawnPythonProcess(
  pythonExe: string,
  pythonScript: string,
  inputImagePath: string,
  outputJsonPath: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    let stderr = '';

    // Clean environment to avoid Python subprocess conflicts
    const cleanEnv = { ...process.env };
    delete cleanEnv.PYTHONHOME;
    delete cleanEnv.PYTHONPATH;

    const pythonProcess = spawn(pythonExe, [
      pythonScript,
      '--input',
      inputImagePath,
      '--output',
      outputJsonPath,
      '--source',
      sourceLanguage,
      '--target',
      targetLanguage,
    ], {
      env: cleanEnv,
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error('[translate-image] stderr:', data.toString());
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed with code ${code}: ${stderr}`));
      } else {
        resolve(stderr);
      }
    });

    pythonProcess.on('error', (error) => {
      reject(error);
    });

    // Timeout handling
    setTimeout(() => {
      pythonProcess.kill();
      reject(new Error('Translation process timed out (exceeded 120s)'));
    }, 120000);
  });
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const sourceLanguage = (formData.get('sourceLanguage') as string) || 'en';
    const targetLanguage = (formData.get('targetLanguage') as string) || 'es';

    if (!imageFile) {
      return NextResponse.json(
        { error: 'Missing image file' },
        { status: 400 }
      );
    }

    // Save uploaded file
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const timestamp = Date.now();
    const inputImagePath = path.join(tmpDir, `translate_input_${timestamp}.jpg`);
    const outputJsonPath = path.join(tmpDir, `translate_output_${timestamp}.json`);

    const imageBuffer = await imageFile.arrayBuffer();
    fs.writeFileSync(inputImagePath, Buffer.from(imageBuffer));

    // Call Python script for OCR and translation
    const pythonScript = path.join(process.cwd(), 'python', 'translate_image_engine.py');
    const pythonExe = process.platform === 'win32' ? 'python' : '/var/www/simplifyconvertapp/venv/bin/python';

    try {
      await spawnPythonProcess(
        pythonExe,
        pythonScript,
        inputImagePath,
        outputJsonPath,
        sourceLanguage,
        targetLanguage
      );

      // Read translation results
      if (!fs.existsSync(outputJsonPath)) {
        throw new Error('Failed to generate translation output');
      }

      const resultData = fs.readFileSync(outputJsonPath, 'utf-8');
      const translations: TranslationResult[] = JSON.parse(resultData);

      // Cleanup
      try {
        fs.unlinkSync(inputImagePath);
        fs.unlinkSync(outputJsonPath);
      } catch (err) {
        console.error('Cleanup error:', err);
      }

      return NextResponse.json({ translations });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[translate-image] execution error:', errorMessage);

      // Cleanup on error
      try {
        if (fs.existsSync(inputImagePath)) fs.unlinkSync(inputImagePath);
        if (fs.existsSync(outputJsonPath)) fs.unlinkSync(outputJsonPath);
      } catch (err) {
        console.error('Cleanup error:', err);
      }

      return NextResponse.json(
        { error: `Translation failed: ${errorMessage}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[translate-image] catch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
