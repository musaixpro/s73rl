import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Square,
  Volume2,
  Sliders,
  Sparkles,
  MessageSquare,
  Image as ImageIcon,
  Send,
  Loader2,
  Music,
  Disc3,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { beatAudio, BeatStep } from '../game/audioSynth.ts';

interface StudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInjectPrompt: (prompt: string, exclude: string) => void;
}

export const StudioModal: React.FC<StudioModalProps> = ({
  isOpen,
  onClose,
  onInjectPrompt,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'console' | 'sequencer' | 'ai_producer' | 'cover_art' | 'lyria'>('sequencer');

  // Sequencer state
  const [isPlaying, setIsPlaying] = useState(beatAudio.isPlaying());
  const [currentStep, setCurrentStep] = useState(0);
  const [bpm, setBpm] = useState(beatAudio.getBpm());
  const [pattern, setPattern] = useState<BeatStep[]>(beatAudio.getPattern());

  // Chat state
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: 'model',
      content:
        'Peace! I’m DJ Gemini in the Musaix Pro Studio control room. Ready to talk beat chemistry, SP-1200 12-bit swing, 808 tuning, or arrangement theory. What’re we cooking?',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Cover Art Generator State
  const [artPrompt, setArtPrompt] = useState('1990s vintage vinyl record cover art for East Coast boom bap noir mixtape');
  const [generatedArtUrl, setGeneratedArtUrl] = useState<string | null>(null);
  const [artLoading, setArtLoading] = useState(false);

  // Lyria Music Generation State
  const [lyriaPrompt, setLyriaPrompt] = useState('dark Memphis trap beat with heavy 808 and haunting piano');
  const [lyriaAudioUrl, setLyriaAudioUrl] = useState<string | null>(null);
  const [lyriaLoading, setLyriaLoading] = useState(false);

  useEffect(() => {
    beatAudio.setOnStepCallback((step) => {
      setCurrentStep(step);
    });
    return () => {
      beatAudio.setOnStepCallback(() => {});
    };
  }, []);

  const handleTogglePlay = () => {
    const next = beatAudio.toggleSequencer();
    setIsPlaying(next);
  };

  const handleToggleCell = (stepIdx: number, track: keyof BeatStep) => {
    const updated = [...pattern];
    updated[stepIdx][track] = !updated[stepIdx][track];
    setPattern(updated);
    beatAudio.setPatternStep(stepIdx, track, updated[stepIdx][track]);
  };

  const handleSetBpm = (newBpm: number) => {
    setBpm(newBpm);
    beatAudio.setBpm(newBpm);
  };

  const handleLoadGroovePreset = (genre: 'boombap' | 'trap' | 'drill' | 'phonk') => {
    if (genre === 'boombap') {
      handleSetBpm(92);
      pattern.forEach((_, idx) => {
        beatAudio.setPatternStep(idx, 'kick', idx === 0 || idx === 8 || idx === 11);
        beatAudio.setPatternStep(idx, 'snare', idx === 4 || idx === 12);
        beatAudio.setPatternStep(idx, 'hihat', true);
        beatAudio.setPatternStep(idx, 'sample', idx === 0 || idx === 6 || idx === 10);
      });
    } else if (genre === 'trap') {
      handleSetBpm(140);
      pattern.forEach((_, idx) => {
        beatAudio.setPatternStep(idx, 'kick', idx === 0 || idx === 6 || idx === 10 || idx === 14);
        beatAudio.setPatternStep(idx, 'snare', idx === 8);
        beatAudio.setPatternStep(idx, 'hihat', true);
        beatAudio.setPatternStep(idx, 'sample', idx === 0 || idx === 4 || idx === 8 || idx === 12);
      });
    } else if (genre === 'drill') {
      handleSetBpm(142);
      pattern.forEach((_, idx) => {
        beatAudio.setPatternStep(idx, 'kick', idx === 0 || idx === 10);
        beatAudio.setPatternStep(idx, 'snare', idx === 6 || idx === 14);
        beatAudio.setPatternStep(idx, 'hihat', idx % 3 === 0);
        beatAudio.setPatternStep(idx, 'sample', idx === 0 || idx === 8);
      });
    } else {
      handleSetBpm(132);
      pattern.forEach((_, idx) => {
        beatAudio.setPatternStep(idx, 'kick', idx === 0 || idx === 4 || idx === 8 || idx === 12);
        beatAudio.setPatternStep(idx, 'snare', idx === 4 || idx === 12);
        beatAudio.setPatternStep(idx, 'hihat', true);
        beatAudio.setPatternStep(idx, 'sample', idx % 2 === 0);
      });
    }
    setPattern([...beatAudio.getPattern()]);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = { role: 'user', content: chatInput };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'model', content: data.reply }]);
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleGenerateArt = async () => {
    if (!artPrompt.trim() || artLoading) return;
    setArtLoading(true);
    try {
      const res = await fetch('/api/gemini/generate-cover-art', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: artPrompt }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedArtUrl(data.imageUrl);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setArtLoading(false);
    }
  };

  const handleGenerateLyria = async () => {
    if (!lyriaPrompt.trim() || lyriaLoading) return;
    setLyriaLoading(true);
    try {
      const res = await fetch('/api/gemini/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: lyriaPrompt }),
      });
      const data = await res.json();
      if (data.audioBase64) {
        setLyriaAudioUrl(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLyriaLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Disc3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">
                Musaix Pro Recording Studio &amp; Mixing Stage
              </h2>
              <p className="text-xs text-slate-400">
                16-Step Procedural Beat Machine · DJ Gemini AI Producer · Cover Art Studio
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800 bg-slate-950/40 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('sequencer')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sequencer'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            16-Step Beat Sequencer
          </button>

          <button
            onClick={() => setActiveTab('ai_producer')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ai_producer'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            DJ Gemini Producer Chat
          </button>

          <button
            onClick={() => setActiveTab('cover_art')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'cover_art'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Vinyl Cover Art Studio
          </button>

          <button
            onClick={() => setActiveTab('lyria')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'lyria'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            Lyria AI Music Generator
          </button>

          <button
            onClick={() => setActiveTab('console')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'console'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Studio &amp; Pipeline Blueprints
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: 16-Step Beat Sequencer */}
          {activeTab === 'sequencer' && (
            <div className="space-y-6">
              {/* Sequencer Transport Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleTogglePlay}
                    className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                      isPlaying
                        ? 'bg-rose-500 hover:bg-rose-400 text-white'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    }`}
                  >
                    {isPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isPlaying ? 'Stop Beat' : 'Play Beat'}</span>
                  </button>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Tempo:</span>
                    <span className="font-mono tabular-nums font-bold text-amber-400">{bpm} BPM</span>
                    <input
                      type="range"
                      min={60}
                      max={180}
                      value={bpm}
                      onChange={(e) => handleSetBpm(Number(e.target.value))}
                      className="w-24 accent-amber-400"
                    />
                  </div>
                </div>

                {/* Genre Groove Quick Presets */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400 mr-1">Grooves:</span>
                  {(
                    [
                      { id: 'boombap', label: 'Boom Bap' },
                      { id: 'trap', label: 'Atlanta Trap' },
                      { id: 'drill', label: 'UK Drill' },
                      { id: 'phonk', label: 'Memphis Phonk' },
                    ] as const
                  ).map((g) => (
                    <button
                      key={g.id}
                      onClick={() => handleLoadGroovePreset(g.id)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition-colors"
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 16-Step Matrix */}
              <div className="space-y-2 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                {(
                  [
                    { track: 'kick', label: '808 Sub Kick', color: 'bg-rose-500' },
                    { track: 'snare', label: 'Snare / Rim', color: 'bg-amber-400' },
                    { track: 'hihat', label: 'Closed Hi-Hat', color: 'bg-sky-400' },
                    { track: 'sample', label: 'Sample Stab', color: 'bg-purple-500' },
                  ] as const
                ).map(({ track, label, color }) => (
                  <div key={track} className="flex items-center gap-3">
                    <span className="w-28 text-xs font-medium text-slate-300 truncate">
                      {label}
                    </span>

                    <div className="flex-1 grid grid-cols-16 gap-1">
                      {pattern.map((step, idx) => {
                        const isActive = step[track];
                        const isCurrent = isPlaying && currentStep === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleToggleCell(idx, track)}
                            className={`h-9 rounded flex items-center justify-center transition-all ${
                              isActive
                                ? `${color} text-slate-950 font-bold shadow-sm`
                                : 'bg-slate-900 hover:bg-slate-800 border border-slate-800'
                            } ${isCurrent ? 'ring-2 ring-white scale-105' : ''}`}
                          >
                            <span className="text-[10px] font-mono opacity-60">
                              {idx % 4 === 0 ? '·' : ''}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Step indicator footer */}
                <div className="flex items-center gap-3 pt-2">
                  <span className="w-28 text-[11px] text-slate-500 font-mono">STEP / BEAT</span>
                  <div className="flex-1 grid grid-cols-16 gap-1">
                    {Array.from({ length: 16 }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`text-center font-mono text-[10px] ${
                          isPlaying && currentStep === idx
                            ? 'text-amber-400 font-bold'
                            : 'text-slate-600'
                        }`}
                      >
                        {idx + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DJ Gemini AI Producer Chat */}
          {activeTab === 'ai_producer' && (
            <div className="space-y-4 flex flex-col h-[400px]">
              <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-slate-500 mb-0.5 font-mono">
                      {m.role === 'user' ? 'You' : 'DJ Gemini'}
                    </span>
                    <div
                      className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-amber-400 text-slate-950 font-medium'
                          : 'bg-slate-900 border border-slate-800 text-slate-200'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>DJ Gemini is dialing in the sound...</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendChat} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask DJ Gemini about 808 glides, SP-1200 tuning, or mixing tips..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={chatLoading}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5" />
                  Ask
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: Cover Art Studio */}
          {activeTab === 'cover_art' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-white">
                    Album / Mixtape Art Prompt
                  </label>
                  <textarea
                    rows={4}
                    value={artPrompt}
                    onChange={(e) => setArtPrompt(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <button
                    onClick={handleGenerateArt}
                    disabled={artLoading}
                    className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {artLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Generating Art with gemini-3.1-flash-lite-image...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Generate 1:1 Vinyl Cover
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center min-h-[220px]">
                  {generatedArtUrl ? (
                    <img
                      src={generatedArtUrl}
                      alt="Generated Cover"
                      className="w-48 h-48 rounded-lg object-cover shadow-2xl border border-slate-800"
                    />
                  ) : (
                    <div className="text-center text-xs text-slate-500 space-y-1">
                      <ImageIcon className="w-8 h-8 mx-auto text-slate-600" />
                      <p>Generate high-fidelity cover art for your beats.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Lyria Music Generation */}
          {activeTab === 'lyria' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <label className="block text-xs font-semibold text-white">
                  Lyria Music Generation Prompt (lyria-3-clip-preview)
                </label>
                <input
                  type="text"
                  value={lyriaPrompt}
                  onChange={(e) => setLyriaPrompt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
                <button
                  onClick={handleGenerateLyria}
                  disabled={lyriaLoading}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {lyriaLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Synthesizing with Lyria Clip...
                    </>
                  ) : (
                    <>
                      <Music className="w-3.5 h-3.5" />
                      Generate Audio Clip
                    </>
                  )}
                </button>

                {lyriaAudioUrl && (
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <span className="text-xs text-emerald-400 font-medium">Generated Clip Playback:</span>
                    <audio src={lyriaAudioUrl} controls className="w-full h-8" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Studio & Pipeline Blueprints (Displaying user uploaded reference assets) */}
          {activeTab === 'console' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  Musaix Pro Recording Studio Architecture
                </h3>
                <p className="text-xs text-slate-400">
                  Visual reference for the 3D studio control room, acoustic architecture, and tool execution pipeline.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                  <span className="text-xs font-semibold text-amber-300 block">
                    Recording Studio Control Room
                  </span>
                  <img
                    src="/assets/aistudio/Gemini_Generated_Image_wfs43wwfs43wwfs4__1__0dc7a468.png"
                    alt="Recording Studio Control Room"
                    className="w-full h-44 object-cover rounded-lg border border-slate-800"
                  />
                  <p className="text-[11px] text-slate-400">
                    Walnut console desk, nearfield monitors, live room glass partition.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                  <span className="text-xs font-semibold text-sky-300 block">
                    Tool Execution Pipeline Architecture
                  </span>
                  <img
                    src="/assets/aistudio/3d_isometric_enterprise_tech_1__4__6cb159cd.png"
                    alt="Tool Execution Pipeline"
                    className="w-full h-44 object-cover rounded-lg border border-slate-800"
                  />
                  <p className="text-[11px] text-slate-400">
                    Isometric execution nodes: Plan, Tools, Serial Chain, Aggregation, Synthesis.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
