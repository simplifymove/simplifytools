import { exec } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

// Set max payload size
export const maxDuration = 180;

// File size limit: 500MB for local processing
const MAX_FILE_SIZE = 500 * 1024 * 1024;

export async function POST(request: Request): Promise<Response> {
  const formData = await request.formData();
  const imageFile = formData.get("image") as File;
  const mode = (formData.get("mode") as string) || "motion"; // motion or defocus
  const strength = parseFloat((formData.get("strength") as string) || "1.0");
  const iterations = parseInt((formData.get("iterations") as string) || "1");

  console.log(
    `[API] Restormer deblurring: mode=${mode}, strength=${strength}, iterations=${iterations}`
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
  const inputFile = path.join(tempDir, `unblur_input_${Date.now()}.jpg`);
  const outputFile = path.join(tempDir, `unblur_output_${Date.now()}.jpg`);

  try {
    // Save uploaded image
    const buffer = await imageFile.arrayBuffer();
    fs.writeFileSync(inputFile, Buffer.from(buffer));

    // Build command with full path to the script
    const scriptPath = path.join(process.cwd(), "unblur_img.py");
    const pythonExe = process.platform === 'win32' ? 'python' : '/var/www/simplifyconvertapp/venv/bin/python';
    
    // Restormer-based deblurring command
    const command = `${pythonExe} "${scriptPath}" --input "${inputFile}" --output "${outputFile}" --mode ${mode} --strength ${strength} --iterations ${iterations}`;

    console.log(`[API] Executing: Restormer deblurring engine (SOTA CVPR2022)`);
    console.log(`[API] Script path exists: ${fs.existsSync(scriptPath)}`);

    // Execute Python script
    return new Promise((resolve) => {
      exec(command, { timeout: 180000, maxBuffer: 10 * 1024 * 1024, cwd: process.cwd() }, (error, stdout, stderr) => {
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

          // Cleanup
          try {
            fs.unlinkSync(inputFile);
            fs.unlinkSync(outputFile);
          } catch (e) {
            console.warn("Cleanup failed:", e);
          }

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
        }
      });
    });
  } catch (error) {
    console.error("Request error:", error);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

