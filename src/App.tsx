import React, { useState, useMemo } from 'react';
import {
  Sliders,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Download,
  Database,
  Code2,
  Layers,
  Disc3,
  FileSpreadsheet,
  Terminal,
  RefreshCw,
  ArrowRight,
  Search,
  Volume2,
} from 'lucide-react';
import {
  STYLE_FAMILIES,
  PROJECT_PRESETS,
  INITIAL_STYLE_VOCABULARY,
  DEFAULT_EXCLUSIONS_BY_FAMILY,
  StyleFamily,
  TargetPlatform,
  PromptBuildInput,
  StyleVocabularyEntry,
  buildPrompt,
  scorePrompt,
  classifyAndCleanRawStyles,
} from './engine/promptEngine';

type ActiveWorkspaceTab =
  | 'builder'
  | 'presets'
  | 'vocabulary'
  | 'scorer'
  | 'cleaner'
  | 'api';

const REGIONS = [
  'Memphis',
  'Atlanta',
  'East Coast',
  'West Coast',
  'UK',
  'Chicago',
  'Detroit',
  'Houston',
  'Brooklyn',
  'Bay Area',
  'Toronto',
];

const ERAS = ['90s', '2000s', '2010s', 'modern', 'golden age', 'futuristic'];

const ENERGIES = ['dark', 'aggressive', 'chill', 'luxury', 'emotional', 'underground'];

const DRUM_OPTIONS = [
  'punchy kick and snare',
  'crisp triplet hi-hats',
  'syncopated UK drill hi-hats and snappy snare',
  'heavy trap drums',
  'warm boom bap drums',
  'lo-fi 808 cowbell percussion',
  'laid-back West Coast clap and kick',
  'fast snappy Detroit rimshot bounce',
  'crisp 808 drums',
];

const BASS_OPTIONS = [
  'heavy 808 sub bass',
  'walking bassline',
  'sliding 808 glides',
  'distorted 808 bass',
  'deep Moog synth bassline',
  'warm upright bass',
  'booming 808 sub bass',
  'deep sub bass',
];

const INSTRUMENTATION_OPTIONS = [
  'haunting piano loop',
  'dusty vinyl jazz sample',
  'dramatic strings, dark piano chords',
  'eerie choir pads',
  'icy synth bells',
  'soulful gospel chords',
  'digital synth arpeggios',
  'high-pitched portamento synth lead',
  'chorus-drenched clean electric guitar arpeggio',
  '808 cowbell melody, eerie synth lead',
];

const VOCAL_OPTIONS = [
  'aggressive male rap vocals, triplet flow',
  'gritty male storytelling rap',
  'confident male melodic rap',
  'raspy male rap vocals',
  'melodic autotune hook',
  'emotional male rap vocals',
  'confident melodic rap vocals',
  'aggressive baritone drill flow',
  'smooth West Coast cadence',
];

const MIX_OPTIONS = [
  'cinematic mix',
  'raw analog mix',
  'cinematic street anthem mix',
  'dark cinematic mix',
  'polished club mix',
  'intimate analog mix',
  'polished neon mix',
  'gritty underground cassette',
  'punchy low-end master',
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveWorkspaceTab>('builder');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Builder State (initialized with Cold Case Noir preset)
  const [selectedPresetId, setSelectedPresetId] = useState<string>('cold_case');
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

  // Vocabulary State
  const [vocabulary, setVocabulary] = useState<StyleVocabularyEntry[]>(INITIAL_STYLE_VOCABULARY);
  const [vocabSearch, setVocabSearch] = useState('');
  const [vocabFamilyFilter, setVocabFamilyFilter] = useState<string>('all');

  // Standalone Scorer & Rewriter State
  const [customScorePrompt, setCustomScorePrompt] = useState<string>(
    'dark Memphis trap rap, haunting piano loop, crisp triplet hi-hats, heavy 808 sub bass, aggressive male rap vocals, gritty street atmosphere, cinematic mix',
  );
  const [customExcludePrompt, setCustomExcludePrompt] = useState<string>(
    "happy pop, acoustic folk, tropical house, children's music",
  );

  // Data Cleaner State
  const [rawStylesInput, setRawStylesInput] = useState<string>(
    [
      'memphis phonk',
      'brooklyn sample drill',
      '90s east coast boom bap',
      'atlanta luxury trap',
      'detroit street rap',
      'spiritual conscious rap',
      'west coast g-funk',
      'horrorcore gothic rap',
      'emo trap ballad',
    ].join('\n'),
  );
  const [lastCleanedBatch, setLastCleanedBatch] = useState<StyleVocabularyEntry[]>([]);

  // Live API Tester State
  const [apiResponseJson, setApiResponseJson] = useState<string>('');
  const [apiLoading, setApiLoading] = useState<boolean>(false);

  const builtOutput = useMemo(() => buildPrompt(builderState), [builderState]);
  const standaloneScoreResult = useMemo(
    () => scorePrompt(customScorePrompt, customExcludePrompt),
    [customScorePrompt, customExcludePrompt],
  );

  const filteredVocabulary = useMemo(() => {
    return vocabulary.filter((item) => {
      const matchesFamily =
        vocabFamilyFilter === 'all' || item.style_family === vocabFamilyFilter;
      const matchesSearch =
        !vocabSearch.trim() ||
        item.style_name.toLowerCase().includes(vocabSearch.toLowerCase()) ||
        item.region.toLowerCase().includes(vocabSearch.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(vocabSearch.toLowerCase()));
      return matchesFamily && matchesSearch;
    });
  }, [vocabulary, vocabFamilyFilter, vocabSearch]);

  const handleSelectPreset = (presetId: string) => {
    const preset = PROJECT_PRESETS.find((p) => p.preset_id === presetId);
    if (!preset) return;
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
      song_section_focus: preset.song_section_focus,
      mix_texture: preset.mix_texture,
      exclude_styles: preset.exclude_styles,
    }));
    setActiveTab('builder');
  };

  const handleLoadVocabularyStyle = (entry: StyleVocabularyEntry) => {
    setSelectedPresetId('');
    setBuilderState((prev) => ({
      ...prev,
      style_family: entry.style_family,
      style_name: entry.style_name,
      region: entry.region,
      era: entry.era,
      tempo: Math.round((entry.tempo_min + entry.tempo_max) / 2),
      energy: entry.energy,
      mood: entry.mood[0] || 'gritty street atmosphere',
      drums: entry.drums[0] || 'punchy kick and snare',
      bass: entry.bass[0] || 'heavy 808 sub bass',
      instrumentation: entry.instrumentation[0] || 'dark piano loop',
      vocal_delivery: entry.vocal_delivery[0] || 'confident male rap vocals',
      mix_texture: entry.mix_texture,
      exclude_styles: entry.exclude_styles.join(', '),
    }));
    setActiveTab('builder');
  };

  const handleCopyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleRunDataCleaner = async () => {
    const lines = rawStylesInput
      .split(/\r?\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);
    const cleaned = classifyAndCleanRawStyles(lines);
    setLastCleanedBatch(cleaned);
    setVocabulary((prev) => {
      const existingIds = new Set(prev.map((i) => i.style_id));
      const newEntries = cleaned.filter((c) => !existingIds.has(c.style_id));
      return [...newEntries, ...prev];
    });
  };

  const handleExportCSV = () => {
    const headers = [
      'style_id',
      'style_name',
      'style_family',
      'region',
      'era',
      'tempo_min',
      'tempo_max',
      'energy',
      'mood',
      'vocal_delivery',
      'drums',
      'bass',
      'instrumentation',
      'mix_texture',
      'platform_hint',
      'exclude_styles',
      'quality_score',
      'tags',
      'notes',
    ];
    const rows = vocabulary.map((v) =>
      [
        v.style_id,
        v.style_name,
        v.style_family,
        v.region,
        v.era,
        v.tempo_min,
        v.tempo_max,
        v.energy,
        v.mood.join('; '),
        v.vocal_delivery.join('; '),
        v.drums.join('; '),
        v.bass.join('; '),
        v.instrumentation.join('; '),
        v.mix_texture,
        v.platform_hint,
        v.exclude_styles.join('; '),
        v.quality_score,
        v.tags.join('; '),
        v.notes,
      ]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(','),
    );
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rap_styles_clean.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const payload = {
      version: '0.2.0',
      exported_at: new Date().toISOString(),
      presets: PROJECT_PRESETS,
      styles: vocabulary,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rap_beat_prompt_engine_library.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTestBackendEndpoint = async (endpoint: 'generate' | 'score') => {
    setApiLoading(true);
    try {
      const res = await fetch(`/api/prompt-engine/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:
          endpoint === 'generate'
            ? JSON.stringify(builderState)
            : JSON.stringify({
                prompt: customScorePrompt,
                exclude_styles: customExcludePrompt,
              }),
      });
      const data = await res.json();
      setApiResponseJson(JSON.stringify(data, null, 2));
    } catch (err) {
      setApiResponseJson(JSON.stringify({ error: String(err) }, null, 2));
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800 bg-[#0F172A]/95 sticky top-0 z-30">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('builder');
          }}
          className="text-lg font-bold tracking-tight text-white font-display whitespace-nowrap shrink-0"
        >
          Rap Beat Prompt Engine
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('builder')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'builder' ? 'text-white underline underline-offset-8 decoration-amber-500' : ''
            }`}
          >
            Prompt Builder
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'presets' ? 'text-white underline underline-offset-8 decoration-amber-500' : ''
            }`}
          >
            Project Presets
          </button>
          <button
            onClick={() => setActiveTab('vocabulary')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'vocabulary' ? 'text-white underline underline-offset-8 decoration-amber-500' : ''
            }`}
          >
            Style Vocabulary
          </button>
          <button
            onClick={() => setActiveTab('scorer')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'scorer' ? 'text-white underline underline-offset-8 decoration-amber-500' : ''
            }`}
          >
            Quality Scorer
          </button>
          <button
            onClick={() => setActiveTab('cleaner')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'cleaner' ? 'text-white underline underline-offset-8 decoration-amber-500' : ''
            }`}
          >
            Data Pipeline
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export Library CSV
          </button>
        </div>
      </header>

      {/* Workspace Body */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1440px] w-full mx-auto">
        {/* Left Sidebar Navigation & Architecture Pipeline */}
        <aside className="w-full lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-800 p-5 flex flex-col justify-between gap-6 bg-slate-900/40">
          <div className="space-y-6">
            <div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Stack-agnostic prompt specification &amp; synthesis engine for Suno, Udio, MusicGen, and DAW studio briefs.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 font-mono tabular-nums">
                <span>v0.2.0</span>
                <span aria-hidden="true">·</span>
                <span>{vocabulary.length} Styles</span>
                <span aria-hidden="true">·</span>
                <span>{PROJECT_PRESETS.length} Presets</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-400 px-2.5 pb-1.5">
                Engine Layers
              </div>
              {[
                { id: 'builder', label: '01. Prompt Assembly', icon: Sliders },
                { id: 'presets', label: '02. Project Presets', icon: Disc3 },
                { id: 'vocabulary', label: '03. Style Vocabulary', icon: Database },
                { id: 'scorer', label: '04. Quality Scoring', icon: CheckCircle2 },
                { id: 'cleaner', label: '05. Cleaning Workflow', icon: FileSpreadsheet },
                { id: 'api', label: '06. REST API Contract', icon: Terminal },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as ActiveWorkspaceTab)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2.5">
              <div className="text-xs font-medium text-slate-400 px-1">
                Quick Load Project Lane
              </div>
              <div className="space-y-1">
                {PROJECT_PRESETS.map((preset) => (
                  <button
                    key={preset.preset_id}
                    onClick={() => handleSelectPreset(preset.preset_id)}
                    className={`w-full text-left px-2.5 py-2 rounded-md text-xs transition-colors flex items-center justify-between ${
                      selectedPresetId === preset.preset_id
                        ? 'bg-slate-800 text-white font-medium'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                  >
                    <span className="truncate">{preset.display_name}</span>
                    <span className="font-mono text-[11px] text-slate-500 tabular-nums shrink-0">
                      {preset.tempo} BPM
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={handleExportJSON}
              className="w-full py-2 px-3 rounded-lg border border-slate-700 hover:border-slate-600 text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Code2 className="w-3.5 h-3.5" />
              Download JSON Spec
            </button>
          </div>
        </aside>

        {/* Main Viewport */}
        <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto">
          {/* TAB 1: PROMPT BUILDER (Layer 4, 5, 6) */}
          {activeTab === 'builder' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white font-display tracking-tight">
                    Structured Beat Prompt Synthesizer
                  </h1>
                  <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                    Assemble deterministic, high-scoring prompts across Era, Region, Subgenre, Rhythm Section, Harmonic Palette, Vocal Delivery, and Mix Texture.
                  </p>
                </div>

                {/* Segmented Formula Mode Selector */}
                <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg self-start">
                  {(
                    [
                      { id: 'base', label: 'Base Formula' },
                      { id: 'expanded', label: 'Expanded Formula' },
                      { id: 'full', label: 'Full Formula (+BPM)' },
                    ] as const
                  ).map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() =>
                        setBuilderState((prev) => ({ ...prev, formula_mode: mode.id }))
                      }
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        builderState.formula_mode === mode.id
                          ? 'bg-slate-800 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2-Column Split: Controls Left, Live Output & Quality Score Right */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                {/* Left 7 Columns: Attribute Matrix */}
                <div className="xl:col-span-7 space-y-6 bg-slate-900/60 border border-slate-800 rounded-xl p-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <h2 className="text-base font-semibold text-white">
                      Sonic Attribute Parameters
                    </h2>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={builderState.instrumental}
                        onChange={(e) =>
                          setBuilderState((prev) => ({
                            ...prev,
                            instrumental: e.target.checked,
                          }))
                        }
                        className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
                      />
                      <span>Instrumental Beat Mode (No Vocals)</span>
                    </label>
                  </div>

                  {/* Row 1: Style Family, Subgenre Name, Tempo */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Production Family
                      </label>
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
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        {STYLE_FAMILIES.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Specific Style / Subgenre
                      </label>
                      <input
                        type="text"
                        value={builderState.style_name}
                        onChange={(e) =>
                          setBuilderState((prev) => ({ ...prev, style_name: e.target.value }))
                        }
                        placeholder="e.g. dark Memphis trap"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Tempo (<span className="font-mono tabular-nums">{builderState.tempo} BPM</span>)
                      </label>
                      <input
                        type="range"
                        min={70}
                        max={200}
                        value={builderState.tempo || 94}
                        onChange={(e) =>
                          setBuilderState((prev) => ({
                            ...prev,
                            tempo: Number(e.target.value),
                          }))
                        }
                        className="w-full accent-amber-400 mt-2"
                      />
                    </div>
                  </div>

                  {/* Row 2: Region, Era, Energy */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Region / Scene
                      </label>
                      <select
                        value={builderState.region}
                        onChange={(e) =>
                          setBuilderState((prev) => ({ ...prev, region: e.target.value }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        {REGIONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Production Era
                      </label>
                      <select
                        value={builderState.era}
                        onChange={(e) =>
                          setBuilderState((prev) => ({ ...prev, era: e.target.value }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        {ERAS.map((era) => (
                          <option key={era} value={era}>
                            {era}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Energy Profile
                      </label>
                      <select
                        value={builderState.energy}
                        onChange={(e) =>
                          setBuilderState((prev) => ({ ...prev, energy: e.target.value }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        {ENERGIES.map((en) => (
                          <option key={en} value={en}>
                            {en}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Drums & Bass */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Drums &amp; Percussion
                      </label>
                      <input
                        type="text"
                        list="drum-options"
                        value={builderState.drums}
                        onChange={(e) =>
                          setBuilderState((prev) => ({ ...prev, drums: e.target.value }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                      <datalist id="drum-options">
                        {DRUM_OPTIONS.map((d) => (
                          <option key={d} value={d} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Bass Architecture
                      </label>
                      <input
                        type="text"
                        list="bass-options"
                        value={builderState.bass}
                        onChange={(e) =>
                          setBuilderState((prev) => ({ ...prev, bass: e.target.value }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                      <datalist id="bass-options">
                        {BASS_OPTIONS.map((b) => (
                          <option key={b} value={b} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  {/* Row 4: Instrumentation & Vocal Delivery */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Melodic Instrumentation / Sample
                      </label>
                      <input
                        type="text"
                        list="inst-options"
                        value={builderState.instrumentation}
                        onChange={(e) =>
                          setBuilderState((prev) => ({
                            ...prev,
                            instrumentation: e.target.value,
                          }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                      <datalist id="inst-options">
                        {INSTRUMENTATION_OPTIONS.map((inst) => (
                          <option key={inst} value={inst} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Vocal Delivery &amp; Cadence
                      </label>
                      <input
                        type="text"
                        list="vocal-options"
                        disabled={builderState.instrumental}
                        value={
                          builderState.instrumental
                            ? 'instrumental beat, no vocals'
                            : builderState.vocal_delivery
                        }
                        onChange={(e) =>
                          setBuilderState((prev) => ({
                            ...prev,
                            vocal_delivery: e.target.value,
                          }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white disabled:opacity-50 focus:outline-none focus:border-amber-500"
                      />
                      <datalist id="vocal-options">
                        {VOCAL_OPTIONS.map((v) => (
                          <option key={v} value={v} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  {/* Row 5: Mood & Mix Texture */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Emotional World / Mood
                      </label>
                      <input
                        type="text"
                        value={builderState.mood}
                        onChange={(e) =>
                          setBuilderState((prev) => ({ ...prev, mood: e.target.value }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Mix Texture / Sonic Finish
                      </label>
                      <input
                        type="text"
                        list="mix-options"
                        value={builderState.mix_texture}
                        onChange={(e) =>
                          setBuilderState((prev) => ({
                            ...prev,
                            mix_texture: e.target.value,
                          }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                      <datalist id="mix-options">
                        {MIX_OPTIONS.map((m) => (
                          <option key={m} value={m} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  {/* Row 6: Exclude Styles (Drift Prevention) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-medium text-slate-300">
                        Exclude Styles (Negative Prompt / Drift Prevention)
                      </label>
                      <button
                        onClick={() =>
                          setBuilderState((prev) => ({
                            ...prev,
                            exclude_styles:
                              DEFAULT_EXCLUSIONS_BY_FAMILY[prev.style_family],
                          }))
                        }
                        className="text-[11px] text-amber-400 hover:text-amber-300"
                      >
                        Reset to Family Default
                      </button>
                    </div>
                    <input
                      type="text"
                      value={builderState.exclude_styles}
                      onChange={(e) =>
                        setBuilderState((prev) => ({
                          ...prev,
                          exclude_styles: e.target.value,
                        }))
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Right 5 Columns: Live Assembled Prompt, Platform Adapters & Quality Audit */}
                <div className="xl:col-span-5 space-y-6">
                  {/* Assembled Prompt Output Box */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="text-xs text-slate-400">Assembled Production Prompt</span>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                          <span>Family: {builderState.style_family}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{builderState.tempo} BPM</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Spec Quality Score</span>
                        <span
                          className={`text-xl font-bold font-mono tabular-nums ${
                            builtOutput.score >= 85
                              ? 'text-emerald-400'
                              : builtOutput.score >= 60
                                ? 'text-amber-400'
                                : 'text-rose-400'
                          }`}
                        >
                          {builtOutput.score}/100
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-sm text-amber-100 leading-relaxed select-all">
                      {builtOutput.prompt}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleCopyText('main_prompt', builtOutput.prompt)}
                        className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                      >
                        {copiedKey === 'main_prompt' ? (
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

                      <button
                        onClick={() =>
                          handleCopyText('exclude_prompt', builtOutput.exclude_styles)
                        }
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                      >
                        {copiedKey === 'exclude_prompt' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            Copied Exclusions
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy Exclude Styles
                          </>
                        )}
                      </button>
                    </div>

                    {/* Platform Adapter Target Selector */}
                    <div className="pt-4 border-t border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-300">
                          Platform Adapter Output
                        </span>
                        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                          {(
                            [
                              { id: 'suno', label: 'Suno' },
                              { id: 'udio', label: 'Udio' },
                              { id: 'musicgen', label: 'MusicGen' },
                              { id: 'producer_brief', label: 'DAW Brief' },
                              { id: 'local_pipeline', label: 'JSON' },
                            ] as const
                          ).map((plat) => (
                            <button
                              key={plat.id}
                              onClick={() =>
                                setBuilderState((prev) => ({ ...prev, platform: plat.id }))
                              }
                              className={`px-2 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                                builderState.platform === plat.id
                                  ? 'bg-slate-800 text-amber-300'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {plat.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        {builderState.platform === 'suno' &&
                          builtOutput.adapterOutput.sunoStylePrompt}
                        {builderState.platform === 'udio' &&
                          builtOutput.adapterOutput.udioPrompt}
                        {builderState.platform === 'musicgen' &&
                          builtOutput.adapterOutput.musicgenDescription}
                        {builderState.platform === 'producer_brief' &&
                          builtOutput.adapterOutput.producerSessionBrief}
                        {builderState.platform === 'local_pipeline' &&
                          JSON.stringify(
                            builtOutput.adapterOutput.localPipelinePayload,
                            null,
                            2,
                          )}
                      </pre>
                    </div>
                  </div>

                  {/* Layer 6: 9-Point Quality Scoring Table */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">
                        Layer 6 Rubric Breakdown
                      </h3>
                      <span className="text-xs text-slate-400 font-mono tabular-nums">
                        {builtOutput.scoreDetails.breakdown.filter((b) => b.passed).length}/9 Criteria Met
                      </span>
                    </div>

                    <div className="divide-y divide-slate-800/80 text-xs">
                      {builtOutput.scoreDetails.breakdown.map((item) => (
                        <div
                          key={item.category}
                          className="py-2 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {item.passed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            )}
                            <span
                              className={
                                item.passed ? 'text-slate-200' : 'text-amber-300 font-medium'
                              }
                            >
                              {item.category}
                            </span>
                          </div>
                          <span className="font-mono tabular-nums text-slate-400 shrink-0">
                            {item.points}/{item.maxPoints} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROJECT PRESETS (Layer 4) */}
          {activeTab === 'presets' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-5">
                <h1 className="text-2xl lg:text-3xl font-bold text-white font-display tracking-tight">
                  Project Presets &amp; Creative Lanes
                </h1>
                <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                  Repeatable sonic identities defined in the specification (`Cold Case`, `Blue King`, `Rabbit Skin`, `Gas Fee`, `Sacred Sin`, `Ethereum Chain Talk`). Load any preset into the synthesizer to customize.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PROJECT_PRESETS.map((preset) => {
                  const scoreInfo = scorePrompt(
                    preset.canonical_prompt,
                    preset.exclude_styles,
                  );
                  return (
                    <div
                      key={preset.preset_id}
                      className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-xl p-6 flex flex-col justify-between gap-5 transition-colors"
                    >
                      <div className="space-y-3">
                        <div className="flex items-baseline justify-between gap-2">
                          <h2 className="text-lg font-bold text-white font-display">
                            {preset.display_name}
                          </h2>
                          <span className="text-xs font-mono text-emerald-400 tabular-nums">
                            {scoreInfo.score}/100
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>{preset.region}</span>
                          <span aria-hidden="true">·</span>
                          <span>{preset.era}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{preset.tempo} BPM</span>
                        </div>

                        <p className="text-xs text-slate-300">{preset.tagline}</p>

                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/90 font-mono text-xs text-amber-100/90 leading-relaxed">
                          {preset.canonical_prompt}
                        </div>

                        <div className="text-[11px] text-slate-400 font-mono">
                          Exclude: {preset.exclude_styles}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                        <button
                          onClick={() => handleSelectPreset(preset.preset_id)}
                          className="flex-1 py-2 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                        >
                          Load in Builder
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            handleCopyText(preset.preset_id, preset.canonical_prompt)
                          }
                          className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
                        >
                          {copiedKey === preset.preset_id ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: STYLE VOCABULARY & CLASSIFICATION (Layer 1, 2, 3) */}
          {activeTab === 'vocabulary' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white font-display tracking-tight">
                    Enriched Style Vocabulary Matrix
                  </h1>
                  <p className="text-sm text-slate-400 mt-1">
                    Classified production families with default BPM ranges, drum/bass pairings, harmonic palettes, and negative drift exclusions.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={vocabSearch}
                      onChange={(e) => setVocabSearch(e.target.value)}
                      placeholder="Filter style, region, tag..."
                      className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <select
                    value={vocabFamilyFilter}
                    onChange={(e) => setVocabFamilyFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">All Families ({vocabulary.length})</option>
                    {STYLE_FAMILIES.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                        <th className="py-3 px-4 font-medium">Style Name</th>
                        <th className="py-3 px-4 font-medium">Family · Region · Era</th>
                        <th className="py-3 px-4 font-medium text-right">Tempo Range</th>
                        <th className="py-3 px-4 font-medium">Drums &amp; Bass Identity</th>
                        <th className="py-3 px-4 font-medium">Instrumentation &amp; Mix</th>
                        <th className="py-3 px-4 font-medium text-right">Score</th>
                        <th className="py-3 px-4 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {filteredVocabulary.map((entry) => (
                        <tr
                          key={entry.style_id}
                          className="hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                            {entry.style_name}
                          </td>
                          <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                            <span>{entry.style_family}</span>
                            <span className="mx-1.5 text-slate-600">·</span>
                            <span>{entry.region}</span>
                            <span className="mx-1.5 text-slate-600">·</span>
                            <span>{entry.era}</span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300 whitespace-nowrap">
                            {entry.tempo_min}–{entry.tempo_max} BPM
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {entry.drums[0]} · {entry.bass[0]}
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {entry.instrumentation[0]} · {entry.mix_texture}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-400 font-semibold">
                            {entry.quality_score}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleLoadVocabularyStyle(entry)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-200 rounded font-medium transition-colors"
                            >
                              Use Style
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STANDALONE QUALITY SCORER & VALIDATOR (Layer 6) */}
          {activeTab === 'scorer' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-5">
                <h1 className="text-2xl lg:text-3xl font-bold text-white font-display tracking-tight">
                  Prompt Quality Scorer &amp; Drift Auditor
                </h1>
                <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                  Paste any raw prompt to evaluate it against the 100-point rubric, flag weak standalone terms (`cool rap beat`), detect conflicting sonic descriptors, and generate a high-scoring rewrite.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-5 bg-slate-900/60 border border-slate-800 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white">
                      Prompt Under Audit
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCustomScorePrompt('cool rap beat')}
                        className="text-xs text-amber-400 hover:underline"
                      >
                        Test Weak Prompt ("cool rap beat")
                      </button>
                      <span className="text-slate-600">·</span>
                      <button
                        onClick={() =>
                          setCustomScorePrompt(
                            'dark Memphis trap rap, haunting piano loop, crisp triplet hi-hats, heavy 808 sub bass, aggressive male rap vocals, gritty street atmosphere, cinematic mix',
                          )
                        }
                        className="text-xs text-emerald-400 hover:underline"
                      >
                        Test Strong Prompt (95/100)
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={4}
                    value={customScorePrompt}
                    onChange={(e) => setCustomScorePrompt(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                    placeholder="Enter a rap beat prompt to audit..."
                  />

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Exclude Styles (Optional)
                    </label>
                    <input
                      type="text"
                      value={customExcludePrompt}
                      onChange={(e) => setCustomExcludePrompt(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {standaloneScoreResult.issues.length > 0 && (
                    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-2">
                      <div className="text-xs font-semibold text-amber-300">
                        Detected Prompt Weaknesses ({standaloneScoreResult.issues.length})
                      </div>
                      <ul className="text-xs text-amber-200/90 space-y-1 list-disc list-inside">
                        {standaloneScoreResult.issues.map((issue) => (
                          <li key={issue}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {standaloneScoreResult.score < 85 && (
                    <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-emerald-400">
                          Suggested High-Scoring Upgrade
                        </span>
                        <button
                          onClick={() =>
                            setCustomScorePrompt(standaloneScoreResult.suggested_prompt)
                          }
                          className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                        >
                          Apply Upgrade
                        </button>
                      </div>
                      <p className="text-xs font-mono text-slate-200 leading-relaxed">
                        {standaloneScoreResult.suggested_prompt}
                      </p>
                    </div>
                  )}
                </div>

                {/* Pre-Export Validation Checklist */}
                <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <h2 className="text-base font-semibold text-white">
                        Validation Checklist
                      </h2>
                      <p className="text-xs text-slate-400">
                        10-point pre-export verification
                      </p>
                    </div>
                    <div className="text-2xl font-bold font-mono tabular-nums text-amber-400">
                      {standaloneScoreResult.score}/100
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {standaloneScoreResult.validationChecklist.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60 last:border-b-0"
                      >
                        <span
                          className={
                            item.checked ? 'text-slate-200' : 'text-slate-400'
                          }
                        >
                          {item.label}
                        </span>
                        <span
                          className={`font-mono text-[11px] ${
                            item.checked ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {item.checked ? 'PASS' : 'MISSING'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DATA CLEANING WORKFLOW (11-Step Spec Pipeline) */}
          {activeTab === 'cleaner' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-5">
                <h1 className="text-2xl lg:text-3xl font-bold text-white font-display tracking-tight">
                  Raw Style Data Cleaning &amp; Enrichment Pipeline
                </h1>
                <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                  Paste messy scraped genre lists or raw CSV lines. The engine normalizes casing, removes duplicates, classifies each style into a production family, enriches drums/bass/instrumentation, and scores the baseline prompt.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
                  <label className="block text-xs font-semibold text-white">
                    Raw Style List Input (One per line or comma-separated)
                  </label>
                  <textarea
                    rows={10}
                    value={rawStylesInput}
                    onChange={(e) => setRawStylesInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={handleRunDataCleaner}
                    className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Run 11-Step Cleaning &amp; Enrichment Pipeline
                  </button>
                </div>

                <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-white">
                      Cleaned &amp; Enriched Output ({lastCleanedBatch.length || vocabulary.length} Entries)
                    </h2>
                    <button
                      onClick={handleExportCSV}
                      className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download CSV
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {(lastCleanedBatch.length > 0 ? lastCleanedBatch : vocabulary.slice(0, 6)).map(
                      (item) => (
                        <div
                          key={item.style_id}
                          className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-white">
                              {item.style_name}
                            </span>
                            <span className="text-xs font-mono text-emerald-400 tabular-nums">
                              Score: {item.quality_score}/100
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Family: {item.style_family} · Region: {item.region} · Era: {item.era} · Tempo: {item.tempo_min}–{item.tempo_max} BPM
                          </div>
                          <div className="text-xs font-mono text-amber-200/90">
                            {item.era} {item.region} {item.style_name}, {item.drums[0]}, {item.bass[0]}, {item.instrumentation[0]}, {item.vocal_delivery[0]}, {item.mood[0]}, {item.mix_texture}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: REST API CONTRACT & LIVE TESTER */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-5">
                <h1 className="text-2xl lg:text-3xl font-bold text-white font-display tracking-tight">
                  Stack-Agnostic REST API Service
                </h1>
                <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                  The Express server exposes the exact endpoints specified in `STACK_AGNOSTIC_RAP_BEAT_PROMPT_ENGINE_README.md` (`POST /api/prompt-engine/generate` and `POST /api/prompt-engine/score`). Test them live against the running backend below.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <code className="text-xs font-mono text-amber-300">
                      POST /api/prompt-engine/generate
                    </code>
                    <button
                      onClick={() => handleTestBackendEndpoint('generate')}
                      disabled={apiLoading}
                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors"
                    >
                      Send Live Request
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto">
                    {JSON.stringify(
                      {
                        preset: builderState.preset_id || 'cold_case',
                        style_family: builderState.style_family,
                        platform: builderState.platform,
                        instrumental: builderState.instrumental,
                      },
                      null,
                      2,
                    )}
                  </pre>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <code className="text-xs font-mono text-amber-300">
                      POST /api/prompt-engine/score
                    </code>
                    <button
                      onClick={() => handleTestBackendEndpoint('score')}
                      disabled={apiLoading}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg transition-colors"
                    >
                      Test Score Endpoint
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-3">
                  <div className="text-xs font-semibold text-white">
                    Live Backend JSON Response
                  </div>
                  <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto min-h-[260px]">
                    {apiResponseJson ||
                      '// Click "Send Live Request" or "Test Score Endpoint" to inspect the real Express API response.'}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
