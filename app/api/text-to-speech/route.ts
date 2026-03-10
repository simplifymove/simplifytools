import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { text, language, emotion, speed, pitch, voice } = await request.json();

    if (!text || !language) {
      return NextResponse.json(
        { error: 'Text and language are required' },
        { status: 400 }
      );
    }

    // Generate unique filename for audio
    const timestamp = Date.now();
    const audioFileName = `tts_${timestamp}_${Math.random().toString(36).substr(2, 9)}.mp3`;
    const audioPath = path.join(process.cwd(), 'tmp', audioFileName);

    // Ensure tmp directory exists
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    // Map language codes to Edge TTS voice codes with multiple voices
    const voiceMap: { [key: string]: { voices: string[]; default: string } } = {
      'hi-IN': {
        voices: ['hi-IN-MadhurNeural', 'hi-IN-SwaraNeural'],
        default: 'hi-IN-MadhurNeural',
      },
      'ta-IN': {
        voices: ['ta-IN-ValluvarNeural', 'ta-IN-PallaviNeural'],
        default: 'ta-IN-ValluvarNeural',
      },
      'te-IN': {
        voices: ['te-IN-MohanNeural', 'te-IN-ShrutiNeural'],
        default: 'te-IN-MohanNeural',
      },
      'kn-IN': {
        voices: ['kn-IN-HerangiNeural', 'kn-IN-GaranNeural'],
        default: 'kn-IN-GaranNeural',
      },
      'ml-IN': {
        voices: ['ml-IN-SobhanaNeural', 'ml-IN-JeremiahNeural'],
        default: 'ml-IN-SobhanaNeural',
      },
      'mr-IN': {
        voices: ['mr-IN-AarohNeural', 'mr-IN-MedhaNeural'],
        default: 'mr-IN-MedhaNeural',
      },
      'gu-IN': {
        voices: ['gu-IN-DhwaniNeural', 'gu-IN-NiranjanNeural'],
        default: 'gu-IN-DhwaniNeural',
      },
      'bn-IN': {
        voices: ['bn-IN-TanushreeNeural', 'bn-IN-BiswaNeural'],
        default: 'bn-IN-TanushreeNeural',
      },
      'pa-IN': {
        voices: ['pa-IN-OjasvatiNeural', 'pa-IN-JunaidNeural'],
        default: 'pa-IN-OjasvatiNeural',
      },
      'en-US': {
        voices: ['en-US-AriaNeural', 'en-US-GuyNeural', 'en-US-JennyNeural'],
        default: 'en-US-AriaNeural',
      },
      'en-GB': {
        voices: ['en-GB-LibbyNeural', 'en-GB-RyanNeural'],
        default: 'en-GB-LibbyNeural',
      },
      'es-ES': {
        voices: ['es-ES-AlvaroNeural', 'es-ES-ElviraNeural'],
        default: 'es-ES-ElviraNeural',
      },
      'fr-FR': {
        voices: ['fr-FR-DeniseNeural', 'fr-FR-HenriNeural'],
        default: 'fr-FR-DeniseNeural',
      },
      'de-DE': {
        voices: ['de-DE-AmalaNeural', 'de-DE-ConradNeural'],
        default: 'de-DE-AmalaNeural',
      },
      'it-IT': {
        voices: ['it-IT-ElsaNeural', 'it-IT-DiegoNeural'],
        default: 'it-IT-ElsaNeural',
      },
      'pt-BR': {
        voices: ['pt-BR-FranciscaNeural', 'pt-BR-AntonioNeural'],
        default: 'pt-BR-FranciscaNeural',
      },
      'ja-JP': {
        voices: ['ja-JP-MakoNeural', 'ja-JP-NanamiNeural'],
        default: 'ja-JP-NanamiNeural',
      },
      'zh-CN': {
        voices: ['zh-CN-XiaohanNeural', 'zh-CN-YunyangNeural'],
        default: 'zh-CN-XiaohanNeural',
      },
    };

    const voiceConfig = voiceMap[language] || voiceMap['en-US'];
    const selectedVoice = voice && voiceConfig.voices.includes(voice) ? voice : voiceConfig.default;

    // Emotion settings with rate adjustments
    const emotionSettings: { [key: string]: { rate: number } } = {
      neutral: { rate: 1 },
      happy: { rate: 1.25 },
      sad: { rate: 0.75 },
      angry: { rate: 1.35 },
      excited: { rate: 1.5 },
      calm: { rate: 0.65 },
      romantic: { rate: 0.85 },
      serious: { rate: 0.9 },
    };

    const emotionConfig = emotionSettings[emotion] || emotionSettings.neutral;
    const rateValue = emotionConfig.rate * (speed || 1);
    const pitchValue = (pitch || 1);

    // Convert paths to forward slashes for Python compatibility
    const audioPathEscaped = audioPath.replace(/\\/g, '/');
    const textFilePath = path.join(tmpDir, `tts_text_${timestamp}.txt`).replace(/\\/g, '/');
    const scriptPathEscaped = path.join(tmpDir, `tts_script_${timestamp}.py`).replace(/\\/g, '/');

    // Write input text to a temporary file
    fs.writeFileSync(path.join(tmpDir, `tts_text_${timestamp}.txt`), text, 'utf-8');

    // Create Python script to generate audio using Edge TTS
    const pythonScript = `
import asyncio
from edge_tts import communicate
import io

async def generate_speech():
    try:
        # Read text from file
        with open(r'${textFilePath}', 'r', encoding='utf-8') as f:
            text_content = f.read().strip()
        
        if not text_content:
            print('ERROR: Empty text')
            return False
        
        voice = '${selectedVoice}'
        
        # Use simple communicate call - text and voice only
        communicate_instance = communicate.Communicate(text_content, voice)
        
        # Collect all audio chunks 
        audio_buffer = io.BytesIO()
        chunk_count = 0
        
        async for chunk in communicate_instance.stream():
            if chunk["type"] == "audio":
                chunk_data = chunk["data"]
                # Skip very small chunks (< 50 bytes) which are often artifacts
                if len(chunk_data) > 50:
                    audio_buffer.write(chunk_data)
                    chunk_count += 1
        
        # Write collected audio to file
        audio_data = audio_buffer.getvalue()
        
        if len(audio_data) < 1000:  # If audio is too small, something went wrong
            print(f'ERROR: Audio too small ({len(audio_data)} bytes)')
            return False
        
        with open(r'${audioPathEscaped}', 'wb') as f:
            f.write(audio_data)
        
        print('SUCCESS')
        return True
        
    except Exception as e:
        print(f'ERROR: {str(e)}')
        return False

# Run async function
if asyncio.run(generate_speech()):
    exit(0)
else:
    exit(1)
`;

    // Write Python script to temporary file
    const scriptPath = path.join(tmpDir, `tts_script_${timestamp}.py`);
    fs.writeFileSync(scriptPath, pythonScript);

    // Execute Python script
    try {
      console.log(`[TTS Edge] Processing: ${language} - Voice: ${selectedVoice} - Emotion: ${emotion} - Text length: ${text.length}`);

      const { stdout, stderr } = await execAsync(
        `python "${scriptPath}"`,
        { timeout: 60000, maxBuffer: 1024 * 1024 * 10 }
      );

      if (stdout.includes('ERROR') || (stderr && !stderr.includes('WARNING'))) {
        throw new Error(stdout || stderr);
      }

      // Check if audio file was created
      if (!fs.existsSync(audioPath)) {
        throw new Error('Audio file was not generated');
      }

      // Read audio file
      const audioBuffer = fs.readFileSync(audioPath);

      // Clean up temporary files
      const textFileToDelete = path.join(tmpDir, `tts_text_${timestamp}.txt`);
      if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath);
      if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      if (fs.existsSync(textFileToDelete)) fs.unlinkSync(textFileToDelete);

      // Return audio as response
      return new NextResponse(audioBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Disposition': 'attachment; filename="speech.mp3"',
          'Cache-Control': 'no-cache',
        },
      });
    } catch (pythonError) {
      // Clean up on error
      const textFileToDelete = path.join(tmpDir, `tts_text_${timestamp}.txt`);
      if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath);
      if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      if (fs.existsSync(textFileToDelete)) fs.unlinkSync(textFileToDelete);

      console.error('Python execution error:', pythonError);
      throw pythonError;
    }
  } catch (error) {
    console.error('Text-to-speech error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate speech',
      },
      { status: 500 }
    );
  }
}
