import { exec } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

export const maxDuration = 180;

export async function POST(request: Request): Promise<Response> {
  const formData = await request.formData();
  const imageFile = formData.get("image") as File;
  const blurStrength = parseInt((formData.get("blurStrength") as string) || "35");
  const featherRadius = parseInt((formData.get("featherRadius") as string) || "5");
  const portraitMode = (formData.get("portraitMode") as string) === "true";

  console.log(`[API] Blur strength: ${blurStrength}, Feather: ${featherRadius}, Portrait: ${portraitMode}`);

  if (!imageFile) {
    return new Response(JSON.stringify({ error: "No image provided" }), {
      status: 400,
    });
  }

  // Create temp files
  const tempDir = os.tmpdir();
  const inputFile = path.join(tempDir, `input_${Date.now()}.jpg`);
  const outputFile = path.join(tempDir, `output_${Date.now()}.jpg`);

  try {
    // Save uploaded image
    const buffer = await imageFile.arrayBuffer();
    fs.writeFileSync(inputFile, Buffer.from(buffer));

    // Build command
    const portraitFlag = portraitMode ? "--portrait" : "";
    const command = `python blur_background.py --input "${inputFile}" --output "${outputFile}" --blur ${blurStrength} --feather ${featherRadius} ${portraitFlag}`;
    
    console.log(`[API] Executing command: ${command}`);

    // Execute Python script
    return new Promise((resolve) => {
      exec(command, { timeout: 120000, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
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
    try {
      if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);
      if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
    } catch (e) {
      console.warn("Cleanup failed:", e);
    }
    return new Response(JSON.stringify({ error: "Request failed" }), {
      status: 500,
    });
  }
}
