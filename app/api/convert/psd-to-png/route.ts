import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";

// Max execution time: 10 minutes
export const maxDuration = 600;

interface ConversionResponse {
  ok: boolean;
  error?: string;
  stderr?: string;
  stdout?: string;
  output_format?: string;
  file_size?: number;
  duration_ms?: number;
}

export async function POST(request: Request): Promise<Response> {
  const startTime = Date.now();
  const uuid = randomUUID();
  const tempDir = os.tmpdir();
  const inputFile = path.join(tempDir, `convert-input-${uuid}.tmp`);
  const outputFile = path.join(tempDir, `convert-output-${uuid}.tmp`);

  try {
    // Parse FormData
    const formData = await request.formData();
    const psdFile = formData.get("file") as File;

    console.log(`[PSD-TO-PNG API] Processing conversion request`);
    console.log(`[PSD-TO-PNG API] UUID: ${uuid}`);

    // Validate request
    if (!psdFile) {
      return Response.json(
        { ok: false, error: "No PSD file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!psdFile.name.toLowerCase().endsWith('.psd')) {
      return Response.json(
        { ok: false, error: "Invalid file type. Please upload a PSD file." },
        { status: 400 }
      );
    }

    // Check file size (200MB limit for documents)
    const fileSize = psdFile.size;
    const maxSize = 200 * 1024 * 1024; // 200MB
    
    if (fileSize > maxSize) {
      const maxMB = (maxSize / 1024 / 1024).toFixed(0);
      const fileMB = (fileSize / 1024 / 1024).toFixed(2);
      console.warn(`[PSD-TO-PNG API] File size exceeds limit: ${fileMB}MB > ${maxMB}MB`);
      return Response.json(
        { 
          ok: false, 
          error: `File size exceeds ${maxMB}MB limit. Your file: ${fileMB}MB` 
        },
        { status: 413 }
      );
    }

    console.log(`[PSD-TO-PNG API] Saving uploaded file: ${psdFile.name} (${(fileSize / 1024 / 1024).toFixed(2)}MB)`);
    
    // Save uploaded file
    const buffer = await psdFile.arrayBuffer();
    fs.writeFileSync(inputFile, Buffer.from(buffer));
    console.log(`[PSD-TO-PNG API] Input file saved: ${inputFile} (${buffer.byteLength} bytes)`);

    // Build Python script path
    const scriptPath = path.join(process.cwd(), "python", "convert.py");
    
    if (!fs.existsSync(scriptPath)) {
      console.error(`[PSD-TO-PNG API] Script not found: ${scriptPath}`);
      return Response.json(
        { ok: false, error: "Conversion service not available" },
        { status: 500 }
      );
    }

    console.log(`[PSD-TO-PNG API] Using converter: ${scriptPath}`);

    // Build arguments array (safe from command injection)
    const args = [
      scriptPath,
      "--input", inputFile,
      "--output", outputFile,
      "--from", "psd",
      "--to", "png",
      "--options", JSON.stringify({}),
    ];

    console.log(`[PSD-TO-PNG API] Executing: python convert.py (psd → png)`);

    // Execute Python script safely with execFile
    const pythonExe = process.platform === 'win32' ? 'python' : '/var/www/simplifyconvertapp/venv/bin/python';
    
    // CRITICAL: Clean environment to prevent Python path conflicts
    const cleanEnv = { ...process.env };
    delete cleanEnv.PYTHONHOME;
    delete cleanEnv.PYTHONPATH;
    
    return new Promise((resolve) => {
      execFile(
        pythonExe,
        args,
        {
          timeout: 600000, // 10 min timeout
          maxBuffer: 100 * 1024 * 1024, // 100MB buffer
          cwd: process.cwd(),
          env: cleanEnv,
        },
        (error, stdout, stderr) => {
          try {
            const duration = Date.now() - startTime;

            // Log output
            if (stdout) console.log(`[PSD-TO-PNG stdout] ${stdout}`);
            if (stderr) console.log(`[PSD-TO-PNG stderr] ${stderr}`);

            // Handle execution errors
            if (error) {
              console.error(`[PSD-TO-PNG ERROR] Code ${error.code}: ${error.message}`);
              
              const response: ConversionResponse = {
                ok: false,
                error: `Conversion failed: ${error.message}`,
                stderr: stderr || error.message,
                stdout: stdout,
              };

              return resolve(
                Response.json(response, { status: 500 })
              );
            }

            // Check if output was created
            if (!fs.existsSync(outputFile)) {
              console.error(`[PSD-TO-PNG ERROR] Output file not created`);
              
              const response: ConversionResponse = {
                ok: false,
                error: "Output file not created. The PSD file may be corrupted or unsupported.",
                stderr: stderr,
                stdout: stdout,
              };

              return resolve(
                Response.json(response, { status: 500 })
              );
            }

            // Stream output file
            const outputBuffer = fs.readFileSync(outputFile);
            const outputSize = outputBuffer.length;
            
            console.log(`[PSD-TO-PNG API] ✓ Conversion successful`);
            console.log(`[PSD-TO-PNG API] Output size: ${(outputSize / 1024 / 1024).toFixed(2)} MB, Duration: ${duration}ms`);

            // Return file as download
            const filename = `converted.png`;

            resolve(
              new Response(outputBuffer, {
                headers: {
                  "Content-Type": "image/png",
                  "Content-Disposition": `attachment; filename="${filename}"`,
                  "Content-Length": outputSize.toString(),
                },
              })
            );
          } catch (e) {
            console.error(`[PSD-TO-PNG RESPONSE ERROR] ${e}`);
            resolve(
              Response.json(
                { ok: false, error: "Server error processing conversion" },
                { status: 500 }
              )
            );
          } finally {
            // Guaranteed cleanup
            try {
              if (fs.existsSync(inputFile)) {
                fs.unlinkSync(inputFile);
                console.log(`[PSD-TO-PNG CLEANUP] Removed input file`);
              }
              if (fs.existsSync(outputFile)) {
                fs.unlinkSync(outputFile);
                console.log(`[PSD-TO-PNG CLEANUP] Removed output file`);
              }
            } catch (cleanupError) {
              console.error(`[PSD-TO-PNG CLEANUP ERROR]`, cleanupError);
            }
          }
        }
      );
    });
  } catch (error) {
    console.error(`[PSD-TO-PNG API ERROR] ${error}`);
    
    return Response.json(
      { 
        ok: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      },
      { status: 500 }
    );
  }
}
