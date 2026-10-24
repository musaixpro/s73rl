import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  buildPrompt,
  classifyAndCleanRawStyles,
  INITIAL_STYLE_VOCABULARY,
  PROJECT_PRESETS,
  PromptBuildInput,
  scorePrompt,
  STYLE_FAMILIES,
} from './src/engine/promptEngine.ts';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Google Gen AI client with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-memory prompt engine stores
const styleStore = [...INITIAL_STYLE_VOCABULARY];
const presetStore = [...PROJECT_PRESETS];

// Health and metadata
app.get('/api/prompt-engine/info', (_req, res) => {
  res.json({
    name: 'MIR Rap History & Beat Odyssey 3D',
    version: '0.3.0',
    capabilities: ['search_grounding', 'maps_grounding', 'audio_transcription', 'prompt_engine', 'threejs_3d_game'],
    families: STYLE_FAMILIES,
    presetCount: presetStore.length,
    styleCount: styleStore.length,
  });
});

// Presets & styles
app.get('/api/prompt-engine/presets', (_req, res) => {
  res.json(presetStore);
});

app.get('/api/prompt-engine/styles', (req, res) => {
  const family = req.query.family as string | undefined;
  if (family && family !== 'all') {
    return res.json(styleStore.filter((s) => s.style_family === family));
  }
  res.json(styleStore);
});

// Generate prompt
app.post('/api/prompt-engine/generate', (req, res) => {
  const body = req.body || {};
  const matchedPreset = body.preset
    ? presetStore.find((p) => p.preset_id === body.preset)
    : undefined;

  const input: PromptBuildInput = {
    intent: body.intent || matchedPreset?.tagline || 'custom rap beat',
    preset_id: matchedPreset?.preset_id,
    style_family: body.style_family || matchedPreset?.default_family || 'trap',
    style_name: body.style_name || matchedPreset?.style_name || 'dark Memphis trap',
    region: body.region || matchedPreset?.region || 'Memphis',
    era: body.era || matchedPreset?.era || 'modern',
    tempo: Number(body.tempo || matchedPreset?.tempo || 140),
    energy: body.energy || matchedPreset?.energy || 'dark',
    mood: body.mood || matchedPreset?.mood || 'gritty street atmosphere',
    drums: body.drums || matchedPreset?.drums || 'crisp triplet hi-hats',
    bass: body.bass || matchedPreset?.bass || 'heavy 808 sub bass',
    instrumentation:
      body.instrumentation || matchedPreset?.instrumentation || 'haunting piano loop',
    vocal_delivery:
      body.vocal_delivery || matchedPreset?.vocal_delivery || 'aggressive male rap vocals',
    song_section_focus:
      body.song_section_focus || matchedPreset?.song_section_focus || 'verse and hook',
    mix_texture: body.mix_texture || matchedPreset?.mix_texture || 'cinematic mix',
    exclude_styles: body.exclude_styles || matchedPreset?.exclude_styles,
    platform: body.platform || 'suno',
    formula_mode: body.formula_mode || 'expanded',
    instrumental: Boolean(body.instrumental),
    duration: Number(body.duration || 30),
  };

  const result = buildPrompt(input);
  res.json({
    prompt: result.prompt,
    exclude_styles: result.exclude_styles,
    score: result.score,
    family: result.family,
    notes: result.notes,
    metadata: {
      style_family: input.style_family,
      region: input.region,
      era: input.era,
      mood: input.mood,
      tempo: input.tempo,
    },
    adapterOutput: result.adapterOutput,
    scoreDetails: result.scoreDetails,
  });
});

// Score prompt
app.post('/api/prompt-engine/score', (req, res) => {
  const { prompt = '', exclude_styles = '' } = req.body || {};
  const result = scorePrompt(String(prompt), String(exclude_styles));
  res.json(result);
});

// Clean & classify
app.post('/api/prompt-engine/clean', (req, res) => {
  const rawList: string[] = Array.isArray(req.body?.styles) ? req.body.styles : [];
  const cleaned = classifyAndCleanRawStyles(rawList);
  for (const item of cleaned) {
    if (!styleStore.some((existing) => existing.style_id === item.style_id)) {
      styleStore.unshift(item);
    }
  }
  res.json({
    cleanedCount: cleaned.length,
    totalVocabularyCount: styleStore.length,
    entries: cleaned,
  });
});

// 1. Google Search Grounding for MIR Rap History & Lore
app.post('/api/gemini/search-history', async (req, res) => {
  try {
    const { query = 'Origin of hip hop breakbeat Kool Herc 1520 Sedgwick Ave' } = req.body || {};
    const prompt = `You are an expert hip-hop musicologist and Music Information Retrieval (MIR) researcher.
Provide a rich, historically detailed, and musically precise summary answering this query:
"${query}"

Cover:
1. Historical context, key pioneers, scene & era.
2. Musical & MIR characteristics: typical tempo (BPM), rhythm patterns (breakbeat, swing, triplet hats, sliding 808s), harmonic sample sources (jazz, soul, funk, classical), and vocal delivery cadence.
3. The exact prompt formulas and sound attributes modern producers use to recreate this sonic signature in AI music engines (Suno, Udio, local text-to-music).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || '';
    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    res.json({
      text,
      groundingChunks,
    });
  } catch (error: any) {
    console.error('Search grounding error:', error);
    res.status(500).json({
      error: error.message || 'Failed to search rap history with Google Search',
      fallback: 'Historical hip-hop began in August 1973 at 1520 Sedgwick Ave in the Bronx when DJ Kool Herc pioneered the "Merry-Go-Round" break-spinning technique on dual turntables.',
    });
  }
});

// 2. Google Maps Grounding for Rap Landmark Geography & Origins
app.post('/api/gemini/maps-landmark', async (req, res) => {
  try {
    const { landmark = '1520 Sedgwick Avenue Bronx NY', era = '1973 Birth of Hip Hop' } = req.body || {};
    const prompt = `Identify the exact historical geography, address, and cultural significance of this landmark in rap & hip-hop history:
"${landmark}" (Era: ${era}).
Detail the address, neighborhood atmosphere, how music was recorded or performed there, iconic artists associated with it, and current preservation status.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    const text = response.text || '';
    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    res.json({
      text,
      groundingChunks,
    });
  } catch (error: any) {
    console.error('Maps grounding error:', error);
    res.status(500).json({
      error: error.message || 'Failed to retrieve rap landmark with Google Maps',
      fallback: '1520 Sedgwick Avenue in Morris Heights, Bronx, NY is recognized as the official birthplace of hip-hop where DJ Kool Herc hosted the back-to-school party in the recreation room on August 11, 1973.',
    });
  }
});

// 3. Audio Transcription for Freestyle and Voice Beat Direction (gemini-3.5-transcribe)
app.post('/api/gemini/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body || {};
    if (!audioBase64) {
      return res.status(400).json({ error: 'Missing audioBase64 payload' });
    }

    const audioPart = {
      inlineData: {
        mimeType: mimeType || 'audio/webm',
        data: audioBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          {
            text: 'Transcribe this spoken audio accurately. It may be freestyle rap lyrics, beatbox percussion, or spoken prompt ideas for a hip-hop track. Return the exact transcribed text.',
          },
        ],
      },
    });

    const transcription = response.text?.trim() || '';
    res.json({ transcription });
  } catch (error: any) {
    console.error('Transcription error:', error);
    res.status(500).json({
      error: error.message || 'Audio transcription failed',
    });
  }
});

// 4. Music Generation with Lyria (lyria-3-clip-preview)
app.post('/api/gemini/generate-music', async (req, res) => {
  try {
    const { prompt = '90s East Coast boom bap beat with dusty jazz sample and punchy drums' } = req.body || {};
    const responseStream = await ai.models.generateContentStream({
      model: 'lyria-3-clip-preview',
      contents: prompt,
    });

    let audioBase64 = '';
    let lyrics = '';
    let mimeType = 'audio/wav';

    for await (const chunk of responseStream) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;
      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
        if (part.text && !lyrics) {
          lyrics = part.text;
        }
      }
    }

    res.json({
      audioBase64,
      mimeType,
      lyrics,
    });
  } catch (error: any) {
    console.error('Music generation error:', error);
    res.status(500).json({
      error: error.message || 'Music generation failed',
    });
  }
});

// 5. Multi-Turn AI Hip-Hop Producer Chat (gemini-3.8-flash)
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages = [] } = req.body || {};
    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction:
          'You are DJ Gemini, an iconic veteran hip-hop record producer and audio engineer in the Musaix Pro Studio. You provide expert guidance on beatmaking, MPC swing, 808 tuning, mix bus compression, lyric cadence, and rap history.',
      },
    });

    res.json({
      reply: response.text || 'Keep grinding on that rhythm.',
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: error.message || 'Chat failed',
      reply: 'DJ Gemini says: Keep that groove steady and watch your 808 gain staging.',
    });
  }
});

// 6. Cover Art Generation (gemini-3.1-flash-lite-image)
app.post('/api/gemini/generate-cover-art', async (req, res) => {
  try {
    const { prompt = '1990s vintage vinyl record cover art for East Coast boom bap mixtape' } = req.body || {};
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: '1:1',
        },
      },
    });

    let imageUrl = '';
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        break;
      }
    }

    res.json({ imageUrl });
  } catch (error: any) {
    console.error('Image generation error:', error);
    res.status(500).json({
      error: error.message || 'Cover art generation failed',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MIR Rap History & Beat Odyssey 3D server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
