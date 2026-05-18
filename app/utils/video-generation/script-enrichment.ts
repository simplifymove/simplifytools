/**
 * Integration Wrapper for Video Script Generation
 * Adds cinematic asset enrichment to the script generation pipeline
 * 
 * This wraps the existing script generation with asset fetching
 */

import { VideoScript } from '@/app/utils/types/video-generation';
import { enrichScenesForRendering } from '@/app/utils/remotion/AssetFetcher';

/**
 * Enriches a generated script with assets before rendering
 * This is called after Groq generates the script but before Remotion renders it
 */
export async function enrichGeneratedScript(script: VideoScript): Promise<VideoScript> {
  console.log('\n' + '█'.repeat(80));
  console.log('🎬 SCRIPT ENRICHMENT - Starting asset attachment');
  console.log('█'.repeat(80));

  try {
    // Log script details
    console.log(`📝 Script: "${script.title}"`);
    console.log(`⏱️  Duration: ${script.duration}s`);
    console.log(`📐 Aspect Ratio: ${script.aspectRatio}`);
    console.log(`🎨 Style: ${script.style}`);
    console.log(`📍 Scenes: ${script.scenes.length}`);

    // Enrich scenes with assets
    const enrichedScenes = await enrichScenesForRendering(script.scenes);

    // Return enriched script
    const enrichedScript: VideoScript = {
      ...script,
      scenes: enrichedScenes,
    };

    console.log('\n✅ Script enrichment complete');
    console.log('█'.repeat(80) + '\n');

    return enrichedScript;
  } catch (error) {
    console.error('❌ Script enrichment failed:', error);
    // Return original script if enrichment fails - system still works
    return script;
  }
}

/**
 * Middleware to inject enrichment into script generation response
 * This should wrap the route.ts POST handler
 */
export function createEnrichedScriptMiddleware(
  originalHandler: (request: any) => Promise<any>,
) {
  return async (request: any) => {
    // Call original handler
    const response = await originalHandler(request);

    // If response is JSON with a script, enrich it
    if (response instanceof Response) {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        try {
          const body = await response.json();

          // If this is a successful script generation response
          if (body.ok && body.script) {
            console.log('📥 Enriching script from response...');
            const enrichedScript = await enrichGeneratedScript(body.script);

            // Return response with enriched script
            return new Response(
              JSON.stringify({
                ...body,
                script: enrichedScript,
              }),
              {
                status: response.status,
                headers: response.headers,
              },
            );
          }
        } catch (error) {
          console.warn('Failed to enrich script response:', error);
          // Return original response if enrichment fails
          return response;
        }
      }
    }

    return response;
  };
}
