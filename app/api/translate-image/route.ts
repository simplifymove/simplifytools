import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { randomUUID } from 'crypto';

export const maxDuration = 300;
const MAX_IMAGE_SIZE = 20 * 1024 * 1024;

interface TranslationResult {
  original: string;
  translated: string;
  translationSuccess: boolean;
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
    let settled = false;

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

    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      pythonProcess.kill();
      reject(new Error('Translation process timed out (exceeded 120s)'));
    }, 120000);

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error('[translate-image] stderr:', data.toString());
    });

    pythonProcess.on('close', (code) => {
      clearTimeout(timeout);
      if (settled) return;
      settled = true;

      if (code !== 0) {
        reject(new Error(`Python script failed with code ${code}: ${stderr}`));
      } else {
        resolve(stderr);
      }
    });

    pythonProcess.on('error', (error) => {
      clearTimeout(timeout);
      if (settled) return;
      settled = true;
      reject(error);
    });
  });
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const sourceLanguage = (formData.get('sourceLanguage') as string) || 'en';
    const targetLanguage = (formData.get('targetLanguage') as string) || 'es';

    if (!imageFile || typeof imageFile === 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid image file' },
        { status: 400 }
      );
    }

    if (imageFile.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: 'Image exceeds the 20 MB upload limit' },
        { status: 413 }
      );
    }

    // Save uploaded file
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const requestId = randomUUID();
    const inputImagePath = path.join(tmpDir, `translate_input_${requestId}.jpg`);
    const outputJsonPath = path.join(tmpDir, `translate_output_${requestId}.json`);

    try {
      const imageBuffer = await imageFile.arrayBuffer();
      fs.writeFileSync(inputImagePath, Buffer.from(imageBuffer));

    // Call Python script for OCR and translation
    const pythonScript = path.join(process.cwd(), 'python', 'translate_image_engine.py');
    // Use venv Python on both Windows and Linux
    const venvPython = process.platform === 'win32'
      ? path.join(process.cwd(), '.venv', 'Scripts', 'python.exe')
      : '/var/www/simplifyconvertapp/venv/bin/python';
    
    const pythonExe = fs.existsSync(venvPython) ? venvPython : 'python';

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

      return NextResponse.json({ translations });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[translate-image] execution error:', errorMessage);

      return NextResponse.json(
        { error: `Translation failed: ${errorMessage}` },
        { status: 500 }
      );
    } finally {
      for (const filePath of [inputImagePath, outputJsonPath]) {
        try {
          fs.rmSync(filePath, { force: true });
        } catch (cleanupError) {
          console.error('[translate-image] cleanup error:', cleanupError);
        }
      }
    }
  } catch (error) {
    console.error('[translate-image] catch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
