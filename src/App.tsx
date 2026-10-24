import React, { useState, useEffect, useRef } from 'react';
import {
  Sliders,
  Sparkles,
  Copy,
  Check,
  Disc3,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  MapPin,
  BookOpen,
  ArrowRight,
  Layers,
  Camera,
} from 'lucide-react';
import {
  STYLE_FAMILIES,
  PROJECT_PRESETS,
  DEFAULT_EXCLUSIONS_BY_FAMILY,
  StyleFamily,
  PromptBuildInput,
  buildPrompt,
} from './engine/promptEngine.ts';
import { RapBeatWorld3D, GamePlayerState, CameraViewMode } from './game/threeScene.ts';
import { HistoricalLandmark } from './game/rapHistoryData.ts';
import { GameHUD } from './components/GameHUD.tsx';
import { LandmarkModal } from './components/LandmarkModal.tsx';
import { StoryModal } from './components/StoryModal.tsx';
import { StudioModal } from './components/StudioModal.tsx';
import { beatAudio } from './game/audioSynth.ts';

export default function App() {
  const [gameMode, setGameMode] = useState<'title' | 'playing' | 'paused' | 'studio_builder'>('title');
  const [selectedLandmark, setSelectedLandmark] = useState<HistoricalLandmark | null>(null);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  // 3D Canvas ref and Engine Instance ref
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const worldEngineRef = useRef<RapBeatWorld3D | null>(null);

  // Live game state
  const [playerState, setPlayerState] = useState<GamePlayerState>({
    x: 0,
    z: 16,
    rotation: 0,
    speed: 0,
    isBoosting: false,
    score: 0,
    stemsCollected: [],
    coinsCollected: 0,
    discoveredLandmarks: [],
    activeLandmark: null,
    currentBpm: 94,
    cameraMode: 'chase',
    inStudioZone: true,
  });

  // Prompt Engine Studio State
  const [selectedPresetId, setSelectedPresetId] = useState<string>('cold_case');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [builderState, setBuilderState] = useState<PromptBuildInput>({
    intent: 'Cold case detective noir story',
    preset_id: 'cold_case',
    style_family: 'boom_bap',
    style_name: 'dark East Coast boom bap',
    region: 'East Coast',
    era: '90s',
    tempo: 92,
    energy: 'dark',
    mood: 'cold case detective atmosphere',
    drums: 'punchy kick and snare',
    bass: 'walking bassline',
    instrumentation: 'dusty vinyl jazz sample',
    vocal_delivery: 'gritty male storytelling rap',
    song_section_focus: 'narrative verse focus',
    mix_texture: 'raw analog mix',
    exclude_styles: DEFAULT_EXCLUSIONS_BY_FAMILY.boom_bap,
    platform: 'suno',
    formula_mode: 'expanded',
    instrumental: false,
    duration: 30,
  });

  const builtOutput = buildPrompt(builderState);

  // Load uploaded JSON library on mount
  useEffect(() => {
    fetch('/assets/aistudio/rap_beat_prompt_engine_library__1__0358ba66.json')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.presets && data.presets.length > 0) {
          console.log(`Loaded ${data.presets.length} presets from library.`);
        }
      })
      .catch((err) => console.log('Using built-in presets:', err));
  }, []);

  // Initialize Three.js 3D World once mounted
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const world = new RapBeatWorld3D(canvasMountRef.current, {
      onStateChange: (state) => {
        setPlayerState(state);
        if (state.stemsCollected.length >= 8 && state.discoveredLandmarks.length >= 6) {
          setIsVictory(true);
        }
      },
      onLandmarkInteract: (landmark) => {
        setSelectedLandmark(landmark);
      },
      onStudioInteract: () => {
        setIsStudioOpen(true);
      },
      onStemCollect: (_stem) => {},
    });

    worldEngineRef.current = world;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        setGameMode((current) => (current === 'playing' ? 'paused' : current === 'paused' ? 'playing' : current));
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      world.dispose();
      worldEngineRef.current = null;
    };
  }, []);

  const handleStartGame = () => {
    beatAudio.init();
    beatAudio.playLandmarkDiscovered();
    setGameMode('playing');
    if (worldEngineRef.current) {
      worldEngineRef.current.setMode('playing');
    }
  };

  const handleResumeGame = () => {
    setGameMode('playing');
    if (worldEngineRef.current) {
      worldEngineRef.current.setMode('playing');
    }
  };

  const handleTeleport = (landmarkId: string) => {
    if (worldEngineRef.current) {
      worldEngineRef.current.teleportToLandmark(landmarkId);
    }
  };

  const handleSetCameraMode = (mode: CameraViewMode) => {
    if (worldEngineRef.current) {
      worldEngineRef.current.setCameraMode(mode);
    }
  };

  const handleInjectPrompt = (prompt: string, exclude: string) => {
    setBuilderState((prev) => ({
      ...prev,
      intent: prompt,
      exclude_styles: exclude,
    }));
  };

  const handleCopyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0F172A] text-slate-100 font-sans select-none">
      {/* 3D WebGL Canvas Viewport (100vw x 100vh full-bleed) */}
      <div
        ref={canvasMountRef}
        className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing"
      />

      {/* GAME SHELL STATE 1: ATMOSPHERIC TITLE SCREEN */}
      {gameMode === 'title' && (
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-8 lg:p-12 pointer-events-auto bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/60">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>MUSIC INFORMATION RETRIEVAL · 3D HIP-HOP EXPEDITION</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-display leading-none">
              MIR RAP HISTORY &amp; BEAT ODYSSEY
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Drive through 50 years of hip-hop origins in 3D. Explore historical landmarks with Google Maps &amp; Web Lore Search, record freestyle lyrics with AI transcription, play procedural 16-step beats, and synthesize production beat prompts.
            </p>
          </div>

          <div className="space-y-6 max-w-md">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleStartGame}
                className="px-8 py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-xl shadow-2xl transition-transform active:scale-95 flex items-center gap-2 whitespace-nowrap"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Odyssey (Press Space)
              </button>

              <button
                onClick={() => setGameMode('studio_builder')}
                className="px-5 py-4 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium text-sm rounded-xl transition-colors whitespace-nowrap"
              >
                Prompt Studio
              </button>
            </div>

            <p className="text-xs font-mono text-slate-400 tracking-wide">
              WASD Move · Space Boost · E Landmark · C Camera · B Beat Loop · Esc Pause
            </p>
          </div>
        </div>
      )}

      {/* GAME SHELL STATE 2: ACTIVE PLAYING HUD */}
      {gameMode === 'playing' && (
        <GameHUD
          playerState={playerState}
          onOpenStory={() => setIsStoryOpen(true)}
          onOpenStudio={() => setIsStudioOpen(true)}
          onOpenLandmark={(lm) => setSelectedLandmark(lm)}
          onTeleport={handleTeleport}
          onOpenFullPromptBuilder={() => setGameMode('studio_builder')}
          onApplyPromptText={(text) => {
            handleInjectPrompt(text, DEFAULT_EXCLUSIONS_BY_FAMILY.trap);
            setGameMode('studio_builder');
          }}
          onSearchLore={(_query) => {}}
          onSetCameraMode={handleSetCameraMode}
        />
      )}

      {/* GAME SHELL STATE 3: PAUSE MODAL */}
      {gameMode === 'paused' && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6 text-center">
            <h2 className="text-2xl font-bold text-white font-display">Journey Paused</h2>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleResumeGame}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-xl transition-colors"
              >
                Resume Driving
              </button>

              <button
                onClick={() => setIsStudioOpen(true)}
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm rounded-xl transition-colors"
              >
                Open Musaix Studio &amp; Sequencer
              </button>

              <button
                onClick={() => setIsStoryOpen(true)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm rounded-xl transition-colors"
              >
                Open Visualized Story
              </button>

              <button
                onClick={() => setGameMode('studio_builder')}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium text-sm rounded-xl transition-colors"
              >
                Open Prompt Synthesizer
              </button>

              <button
                onClick={() => {
                  setGameMode('title');
                  if (worldEngineRef.current) worldEngineRef.current.setMode('title');
                }}
                className="w-full py-3 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Exit to Title Screen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GAME SHELL STATE 4: VICTORY MODAL */}
      {isVictory && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-[#0F172A] border border-amber-500/40 rounded-2xl p-8 max-w-lg w-full shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-white font-display">
                MIR Hip-Hop Master!
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                You explored every historical landmark from 1520 Sedgwick Avenue to London Drill, collecting all 8 MIR stems across 50 years of rap evolution.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-amber-200 font-mono">
              Final Score: {playerState.score.toLocaleString()} PTS · 6/6 Landmarks · 8/8 Stems · {playerState.coinsCollected} Vinyl Coins
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsVictory(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-colors"
              >
                Keep Exploring
              </button>
              <button
                onClick={() => {
                  setIsVictory(false);
                  setIsStudioOpen(true);
                }}
                className="flex-1 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors"
              >
                Open Studio Console
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MUSAIX PRO STUDIO MODAL (16-Step Sequencer, AI Producer Chat, Art, Lyria) */}
      <StudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        onInjectPrompt={(prompt, excl) => {
          handleInjectPrompt(prompt, excl);
          setGameMode('studio_builder');
        }}
      />

      {/* HISTORICAL LANDMARK INSPECTOR MODAL */}
      <LandmarkModal
        landmark={selectedLandmark}
        onClose={() => setSelectedLandmark(null)}
        onInjectPrompt={(prompt, excl) => {
          handleInjectPrompt(prompt, excl);
          setGameMode('studio_builder');
        }}
      />

      {/* VISUALIZED STORY MODAL */}
      <StoryModal
        isOpen={isStoryOpen}
        onClose={() => setIsStoryOpen(false)}
        onTeleportToEra={handleTeleport}
        discoveredLandmarks={playerState.discoveredLandmarks}
      />

      {/* PROMPT ENGINE STUDIO BUILDER */}
      {gameMode === 'studio_builder' && (
        <div className="absolute inset-0 z-40 bg-[#0F172A] overflow-y-auto p-6 lg:p-10 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                <Sliders className="w-3.5 h-3.5" />
                <span>RAP BEAT PROMPT ENGINE STUDIO</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-white font-display mt-1">
                Deterministic Beat Prompt Synthesizer
              </h2>
            </div>

            <button
              onClick={() => setGameMode('playing')}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Return to 3D Game World
            </button>
          </div>

          {/* Quick Presets */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-300">
              Creative Lanes &amp; Project Presets (Loaded from Library JSON)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {PROJECT_PRESETS.map((preset) => (
                <button
                  key={preset.preset_id}
                  onClick={() => {
                    setSelectedPresetId(preset.preset_id);
                    setBuilderState((prev) => ({
                      ...prev,
                      intent: preset.tagline,
                      preset_id: preset.preset_id,
                      style_family: preset.default_family,
                      style_name: preset.style_name,
                      region: preset.region,
                      era: preset.era,
                      tempo: preset.tempo,
                      energy: preset.energy,
                      mood: preset.mood,
                      drums: preset.drums,
                      bass: preset.bass,
                      instrumentation: preset.instrumentation,
                      vocal_delivery: preset.vocal_delivery,
                      mix_texture: preset.mix_texture,
                      exclude_styles: preset.exclude_styles,
                    }));
                  }}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                    selectedPresetId === preset.preset_id
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="font-semibold block truncate">{preset.display_name}</span>
                  <span className="text-[11px] text-slate-400 font-mono">{preset.tempo} BPM</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Result Output */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-white">Active Prompt Matrix</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Production Family</label>
                  <select
                    value={builderState.style_family}
                    onChange={(e) => {
                      const fam = e.target.value as StyleFamily;
                      setBuilderState((prev) => ({
                        ...prev,
                        style_family: fam,
                        exclude_styles: DEFAULT_EXCLUSIONS_BY_FAMILY[fam],
                      }));
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  >
                    {STYLE_FAMILIES.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Subgenre</label>
                  <input
                    type="text"
                    value={builderState.style_name}
                    onChange={(e) =>
                      setBuilderState((prev) => ({ ...prev, style_name: e.target.value }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Drums</label>
                  <input
                    type="text"
                    value={builderState.drums}
                    onChange={(e) =>
                      setBuilderState((prev) => ({ ...prev, drums: e.target.value }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Bass Architecture</label>
                  <input
                    type="text"
                    value={builderState.bass}
                    onChange={(e) =>
                      setBuilderState((prev) => ({ ...prev, bass: e.target.value }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">Instrumentation</label>
                  <input
                    type="text"
                    value={builderState.instrumentation}
                    onChange={(e) =>
                      setBuilderState((prev) => ({ ...prev, instrumentation: e.target.value }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">Exclude Styles</label>
                  <input
                    type="text"
                    value={builderState.exclude_styles}
                    onChange={(e) =>
                      setBuilderState((prev) => ({ ...prev, exclude_styles: e.target.value }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Layer 6 Quality Score</span>
                <span className="font-mono text-lg font-bold text-emerald-400">
                  {builtOutput.score}/100
                </span>
              </div>

              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-amber-100 leading-relaxed select-all">
                {builtOutput.prompt}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleCopyText('studio_prompt', builtOutput.prompt)}
                  className="flex-1 py-2 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  {copiedKey === 'studio_prompt' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied Prompt
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Style Prompt
                    </>
                  )}
                </button>
              </div>

              <div className="pt-3 border-t border-slate-800 text-xs space-y-2">
                <span className="text-slate-400 font-semibold block">Platform Export:</span>
                <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 whitespace-pre-wrap">
                  {builtOutput.adapterOutput.sunoStylePrompt}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
