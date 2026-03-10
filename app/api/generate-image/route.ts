import { NextRequest, NextResponse } from 'next/server';

// Array of reliable fallback models
const MODELS = [
  "runwayml/stable-diffusion-v1-5",
  "prompthero/openjourney-v4",
  "Lykon/dreamshaper-8",
  "bguisard/camenduru-faceswap",
];

export async function POST(request: NextRequest) {
  try {
    const { prompt, size } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log(`[Image Gen] Generating image with prompt: "${prompt}"`);

    // Try each model until one works
    for (let i = 0; i < MODELS.length; i++) {
      const model = MODELS[i];
      console.log(`[Image Gen] Attempt ${i + 1}/${MODELS.length}: Using model ${model}`);

      try {
        const result = await tryGenerateWithModel(model, prompt);
        if (result) {
          console.log(`[Image Gen] Success with model: ${model}`);
          return NextResponse.json({ imageUrl: result });
        }
      } catch (modelError) {
        console.warn(`[Image Gen] Model ${model} failed:`, modelError);
        
        // Wait longer between attempts (exponential backoff)
        if (i < MODELS.length - 1) {
          const waitTime = Math.min(3000 * (i + 1), 10000); // 3s, 6s, 9s, then 10s
          console.log(`[Image Gen] Waiting ${waitTime}ms before next attempt...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    // All models failed
    throw new Error('All image generation models are temporarily unavailable');
  } catch (error) {
    console.error('[Image Gen] Final error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: 'Hugging Face inference API is currently busy. This happens during peak usage. Try again in 1-2 minutes.',
        suggestion: 'Please wait a moment and retry. Free tier can handle requests every few seconds.'
      },
      { status: 503 }
    );
  }
}

async function tryGenerateWithModel(model: string, prompt: string): Promise<string | null> {
  const HF_API_URL = `https://api-inference.huggingface.co/models/${model}`;

  try {
    console.log(`[Model] Sending request to ${model}...`);
    
    const response = await fetch(HF_API_URL, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ inputs: prompt }),
    });

    console.log(`[Model] Response status: ${response.status} for ${model}`);

    // If model is loading (503), wait and retry
    if (response.status === 503 || response.status === 510) {
      console.log(`[Model] Model loading, waiting 8 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 8000));
      
      const retryResponse = await fetch(HF_API_URL, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ inputs: prompt }),
      });

      console.log(`[Model] Retry response status: ${retryResponse.status}`);
      
      if (!retryResponse.ok) {
        return null;
      }

      const imageBlob = await retryResponse.blob();
      return await blobToDataUrl(imageBlob);
    }

    // Model endpoint dead or gone
    if (response.status === 410 || response.status === 404) {
      console.log(`[Model] Model endpoint ${response.status}, skipping ${model}`);
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[Model] Error from ${model}:`, errorText.substring(0, 100));
      return null;
    }

    const imageBlob = await response.blob();
    const dataUrl = await blobToDataUrl(imageBlob);
    
    console.log(`[Model] Successfully generated image from ${model}`);
    return dataUrl;
  } catch (error) {
    console.error(`[Model] Exception with ${model}:`, error);
    return null;
  }
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  const buffer = Buffer.from(await blob.arrayBuffer());
  const base64 = buffer.toString('base64');
  const imageType = blob.type || 'image/png';
  return `data:${imageType};base64,${base64}`;
}



