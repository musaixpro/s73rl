import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  buildPrompt,
  classifyAndCleanRawStyles,
  INITIAL_STYLE_VOCABULARY,
  PROJECT_PRESETS,
  PromptBuildInput,
  scorePrompt,
  STYLE_FAMILIES,
} from './src/engine/promptEngine.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  // In-memory store initialized with spec presets & vocabulary
  const styleStore = [...INITIAL_STYLE_VOCABULARY];
  const presetStore = [...PROJECT_PRESETS];

  // Health & engine metadata
  app.get('/api/prompt-engine/info', (_req, res) => {
    res.json({
      name: 'Rap Beat Prompt Engine',
      version: '0.2.0',
      stage: 'Architecture + Prompt System Specification + Full Runtime',
      families: STYLE_FAMILIES,
      presetCount: presetStore.length,
      styleCount: styleStore.length,
    });
  });

  // Get all presets
  app.get('/api/prompt-engine/presets', (_req, res) => {
    res.json(presetStore);
  });

  // Get all vocabulary styles
  app.get('/api/prompt-engine/styles', (req, res) => {
    const family = req.query.family as string | undefined;
    if (family && family !== 'all') {
      return res.json(styleStore.filter((s) => s.style_family === family));
    }
    res.json(styleStore);
  });

  // Generate prompt (matches README API spec: POST /api/prompt-engine/generate)
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

  // Score prompt (matches README API spec: POST /api/prompt-engine/score)
  app.post('/api/prompt-engine/score', (req, res) => {
    const { prompt = '', exclude_styles = '' } = req.body || {};
    const result = scorePrompt(String(prompt), String(exclude_styles));
    res.json(result);
  });

  // Clean & classify raw style list (Layer 1-3 workflow)
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
    console.log(`Rap Beat Prompt Engine running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
