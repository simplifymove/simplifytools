import { exec } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

// Set max payload size
export const maxDuration = 180;

export async function POST(request: Request): Promise<Response> {
  const formData = await request.formData();
  const imageFile = formData.get("image") as File;
  const mode = (formData.get("mode") as string) || "enhance";
  const strength = parseFloat((formData.get("strength") as string) || "1.8");
  const denoise = parseFloat((formData.get("denoise") as string) || "15");
  const clahe = parseFloat((formData.get("clahe") as string) || "3.5");
  const motionLength = parseInt((formData.get("motionLength") as string) || "15");
  const motionAngle = parseInt((formData.get("motionAngle") as string) || "45");
  const iterations = parseInt((formData.get("iterations") as string) || "50");
  const edgePreserve = (formData.get("edgePreserve") as string) === "true";

  console.log(
    `[API] Unblur mode: ${mode}, strength: ${strength}, denoise: ${denoise}, clahe: ${clahe}`
  );

  if (!imageFile) {
    return new Response(JSON.stringify({ error: "No image provided" }), {
      status: 400,
    });
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
    let command = `python "${scriptPath}" --input "${inputFile}" --output "${outputFile}" --mode ${mode}`;

    if (mode === "enhance") {
      command += ` --strength ${strength} --denoise ${denoise} --clahe ${clahe}`;
      if (edgePreserve) command += ` --edge-preserve`;
    } else if (mode === "motion") {
      command += ` --motion-length ${motionLength} --motion-angle ${motionAngle} --iterations ${iterations}`;
    }

    console.log(`[API] Executing command: ${command}`);
    console.log(`[API] Working directory: ${process.cwd()}`);
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
