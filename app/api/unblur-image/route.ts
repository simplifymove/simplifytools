import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";

// Set max payload size
export const maxDuration = 180;

// File size limit: 500MB for local processing
const MAX_FILE_SIZE = 500 * 1024 * 1024;

export async function POST(request: Request): Promise<Response> {
  const formData = await request.formData();
  const imageFile = formData.get("image") as File;
  const modeValue = formData.get("mode");
  const strengthValue = formData.get("strength");
  const iterationsValue = formData.get("iterations");

  const mode = modeValue === null ? "motion" : modeValue;
  const strength =
    strengthValue === null ? 1.0 : Number(strengthValue);
  const iterations =
    iterationsValue === null ? 1 : Number(iterationsValue);

  if (
    (mode !== "motion" && mode !== "defocus") ||
    !Number.isFinite(strength) ||
    strength < 0.5 ||
    strength > 2.0 ||
    !Number.isSafeInteger(iterations) ||
    iterations < 1 ||
    iterations > 5
  ) {
    return new Response(
      JSON.stringify({ error: "Invalid deblurring parameters" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  console.log(
    `[API] Image deblurring: mode=${mode}, strength=${strength}, iterations=${iterations}`
  );

  if (!imageFile) {
    return new Response(JSON.stringify({ error: "No image provided" }), {
      status: 400,
    });
  }

  // Validate file size
  if (imageFile.size > MAX_FILE_SIZE) {
    const maxMB = (MAX_FILE_SIZE / 1024 / 1024).toFixed(0);
    const fileMB = (imageFile.size / 1024 / 1024).toFixed(2);
    console.warn(`[SIZE LIMIT EXCEEDED] File: ${fileMB}MB, Limit: ${maxMB}MB`);
    return new Response(
      JSON.stringify({ 
        error: `File size exceeds ${maxMB}MB limit. Your file: ${fileMB}MB` 
      }),
      { status: 413 }
    );
  }

  // Create temp files
  const tempDir = os.tmpdir();
  const requestId = randomUUID();
  const inputFile = path.join(tempDir, `unblur_input_${requestId}.jpg`);
  const outputFile = path.join(tempDir, `unblur_output_${requestId}.jpg`);

  const cleanup = () => {
    for (const filePath of [inputFile, outputFile]) {
      try {
        fs.rmSync(filePath, { force: true });
      } catch (error) {
        console.warn("[API] Unblur temporary file cleanup failed:", error);
      }
    }
  };

  try {
    // Save uploaded image
    const buffer = await imageFile.arrayBuffer();
    fs.writeFileSync(inputFile, Buffer.from(buffer));

    // Build command with full path to the script
    const scriptPath = path.join(process.cwd(), "unblur_img.py");
    const pythonExe = process.platform === 'win32' ? 'python' : '/var/www/simplifyconvertapp/venv/bin/python';
    
    // Execute the Python engine without invoking a shell.
    const args = [
      scriptPath,
      "--input", inputFile,
      "--output", outputFile,
      "--mode", mode,
      "--strength", String(strength),
      "--iterations", String(iterations),
    ];

    console.log(`[API] Executing image deblurring engine`);
    console.log(`[API] Script path exists: ${fs.existsSync(scriptPath)}`);

    return new Promise<Response>((resolve) => {
      execFile(
        pythonExe,
        args,
        {
          timeout: 180000,
          maxBuffer: 10 * 1024 * 1024,
          cwd: process.cwd(),
          windowsHide: true,
        },
        (error, stdout, stderr) => {
        try {
          // Log output
          if (stdout) console.log("[stdout]", stdout);
          if (stderr) console.log("[stderr]", stderr);

          if (error) {
            console.error("[ERROR]", error);
            return resolve(
              new Response(
                JSON.stringify({
                  error: "Processing failed",
                  details: stdout || stderr || error.message,
                }),
                { status: 500 }
              )
            );
          }

          // Read result
          if (!fs.existsSync(outputFile)) {
            return resolve(
              new Response(JSON.stringify({ error: "Output file not created" }), {
                status: 500,
              })
            );
          }

          const result = fs.readFileSync(outputFile);
          const base64 = result.toString("base64");

          resolve(
            new Response(JSON.stringify({ image: base64 }), {
              headers: { "Content-Type": "application/json" },
            })
          );
        } catch (e) {
          console.error("Response error:", e);
          resolve(
            new Response(JSON.stringify({ error: "Server error" }), { status: 500 })
          );
        } finally {
          cleanup();
        }
      });
    });
  } catch (error) {
    cleanup();
    console.error("Request error:", error);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

