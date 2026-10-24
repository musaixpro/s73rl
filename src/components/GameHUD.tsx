import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  MapPin,
  BookOpen,
  Sparkles,
  Mic,
  Search,
  ChevronDown,
  ChevronUp,
  Compass,
  Zap,
  Sliders,
  ExternalLink,
  Camera,
  Play,
  Square,
  Layers,
} from 'lucide-react';
import { GamePlayerState, CameraViewMode } from '../game/threeScene.ts';
import { HistoricalLandmark, RAP_HISTORY_LANDMARKS, INITIAL_STEMS } from '../game/rapHistoryData.ts';
import { beatAudio } from '../game/audioSynth.ts';
import { AudioTranscriber } from './AudioTranscriber.tsx';

interface GameHUDProps {
  playerState: GamePlayerState;
  onOpenStory: () => void;
  onOpenStudio: () => void;
  onOpenLandmark: (landmark: HistoricalLandmark) => void;
  onTeleport: (landmarkId: string) => void;
  onOpenFullPromptBuilder: () => void;
  onApplyPromptText: (text: string) => void;
  onSearchLore: (query: string) => void;
  onSetCameraMode: (mode: CameraViewMode) => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  playerState,
  onOpenStory,
  onOpenStudio,
  onOpenLandmark,
  onTeleport,
  onOpenFullPromptBuilder,
  onApplyPromptText,
  onSearchLore,
  onSetCameraMode,
}) => {
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [activeDockTab, setActiveDockTab] = useState<'landmarks' | 'voice' | 'search' | 'prompt'>('landmarks');
  const [isMuted, setIsMuted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ text: string; groundingChunks: any[] } | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isBeatPlaying, setIsBeatPlaying] = useState(beatAudio.isPlaying());

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    beatAudio.setMute(next);
  };

  const toggleBeatLoop = () => {
    const playing = beatAudio.toggleSequencer();
    setIsBeatPlaying(playing);
  };

  const handleRunSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const res = await fetch('/api/gemini/search-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Radar math: 100x100 map representing -100 to 100 arena
  const toRadar = (worldVal: number) => {
    const normalized = (worldVal + 100) / 200; // 0 to 1
    return Math.max(4, Math.min(96, normalized * 100));
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-4 lg:p-6 overflow-hidden">
      {/* Top Bar Perimeter Cluster */}
      <div className="flex items-start justify-between gap-4 pointer-events-auto">
        {/* Brand & Stats Cluster */}
        <div className="bg-[#0F172A]/90 border border-slate-800 rounded-xl px-4 py-3 shadow-lg flex items-center gap-5">
          <div>
            <span className="text-[11px] font-mono text-amber-400 block tracking-wider uppercase">
              MIR RAP HISTORY &amp; BEAT ODYSSEY 3D
            </span>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-300">
              <span className="font-semibold text-white">Score:</span>
              <span className="font-mono tabular-nums text-amber-300 font-bold text-sm">
                {playerState.score.toLocaleString()}
              </span>
              <span className="text-slate-600">·</span>
              <span>BPM:</span>
              <span className="font-mono tabular-nums text-emerald-400 font-bold">
                {playerState.currentBpm}
              </span>
            </div>
          </div>

          <div className="h-7 w-px bg-slate-800" />

          {/* Stems & Landmark Counters */}
          <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
            <div>
              <span className="text-[11px] text-slate-400 block">Stems</span>
              <span className="text-white font-bold">
                {playerState.stemsCollected.length}/8
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Landmarks</span>
              <span className="text-white font-bold">
                {playerState.discoveredLandmarks.length}/6
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Coins</span>
              <span className="text-amber-400 font-bold">
                {playerState.coinsCollected}
              </span>
            </div>
          </div>
        </div>

        {/* Top-Right: Quick Actions & Radar Mini-Map */}
        <div className="flex items-start gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenStory}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-semibold shadow-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Visualized Story
              </button>

              <button
                onClick={onOpenStudio}
                className="px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white rounded-xl text-xs font-semibold shadow-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                Musaix Studio
              </button>

              <button
                onClick={toggleBeatLoop}
                className={`px-3 py-2 rounded-xl text-xs font-semibold shadow-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  isBeatPlaying
                    ? 'bg-rose-500 hover:bg-rose-400 text-white'
                    : 'bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200'
                }`}
                title="Toggle Beat Sequencer Loop (B)"
              >
                {isBeatPlaying ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                <span>{isBeatPlaying ? 'Beat Loop' : 'Play Beat'}</span>
              </button>

              <button
                onClick={toggleMute}
                className="p-2 bg-[#0F172A]/90 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl shadow-lg transition-colors"
                title="Toggle Audio (M)"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>

            {/* Camera View Mode Selector Pills */}
            <div className="flex items-center gap-1 bg-[#0F172A]/90 p-1 border border-slate-800 rounded-lg self-end text-[11px]">
              {(
                [
                  { id: 'chase', label: 'Chase' },
                  { id: 'drone', label: 'Drone' },
                  { id: 'cockpit', label: 'Hood' },
                  { id: 'satellite', label: 'Map' },
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => onSetCameraMode(mode.id)}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    playerState.cameraMode === mode.id
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Circular Radar Mini-Map */}
          <div className="w-24 h-24 rounded-full bg-[#0F172A]/95 border-2 border-slate-700 relative overflow-hidden shadow-2xl shrink-0">
            {/* Center crosshair */}
            <div className="absolute inset-x-0 top-1/2 h-px bg-slate-800" />
            <div className="absolute inset-y-0 left-1/2 w-px bg-slate-800" />

            {/* Studio Center Blip */}
            <div
              className="absolute w-2 h-2 rounded-full bg-sky-400 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${toRadar(0)}%`, top: `${toRadar(0)}%` }}
              title="Musaix Studio Center"
            />

            {/* Landmarks Blips */}
            {RAP_HISTORY_LANDMARKS.map((lm) => {
              const left = toRadar(lm.position3D[0]);
              const top = toRadar(lm.position3D[2]);
              const isDiscovered = playerState.discoveredLandmarks.includes(lm.id);
              return (
                <div
                  key={lm.id}
                  className={`absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2 ${
                    isDiscovered ? 'bg-amber-400' : 'bg-slate-500'
                  }`}
                  style={{ left: `${left}%`, top: `${top}%` }}
                />
              );
            })}

            {/* Player Blip with Arrow Heading */}
            <div
              className="absolute w-2.5 h-2.5 bg-rose-500 rounded-full border border-white -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${toRadar(playerState.x)}%`,
                top: `${toRadar(playerState.z)}%`,
                transform: `translate(-50%, -50%) rotate(${playerState.rotation}rad)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Proximity Interaction Prompts */}
      <div className="self-center pointer-events-auto flex flex-col items-center gap-2 mb-3">
        {playerState.activeLandmark && (
          <button
            onClick={() => onOpenLandmark(playerState.activeLandmark!)}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-full shadow-2xl flex items-center gap-2 border-2 border-amber-200 transition-transform active:scale-95 animate-bounce"
          >
            <MapPin className="w-4 h-4" />
            <span>[E] Inspect {playerState.activeLandmark.name}</span>
          </button>
        )}

        {playerState.inStudioZone && (
          <button
            onClick={onOpenStudio}
            className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-full shadow-2xl flex items-center gap-2 border-2 border-sky-200 transition-transform active:scale-95"
          >
            <Sliders className="w-4 h-4" />
            <span>[E] Enter Musaix Studio &amp; Sequencer</span>
          </button>
        )}
      </div>

      {/* Unified Bottom Control Dock */}
      <div className="pointer-events-auto self-center max-w-4xl w-full flex flex-col items-center">
        <button
          onClick={() => setIsDockCollapsed((c) => !c)}
          className="mb-1 px-4 py-1 bg-[#0F172A]/90 hover:bg-slate-800 border border-slate-800 text-[11px] font-medium text-slate-300 rounded-full flex items-center gap-1 shadow-md transition-colors"
        >
          {isDockCollapsed ? (
            <>
              <ChevronUp className="w-3 h-3 text-amber-400" />
              <span>Show Exploration Dock</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3 text-slate-400" />
              <span>Hide Controls</span>
            </>
          )}
        </button>

        {!isDockCollapsed && (
          <div className="w-full bg-[#0F172A]/95 border border-slate-800 rounded-2xl shadow-2xl p-4 lg:p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 text-xs">
              <div className="flex items-center gap-1">
                {[
                  { id: 'landmarks', label: 'Landmarks & GPS', icon: MapPin },
                  { id: 'search', label: 'Web Lore Search', icon: Search },
                  { id: 'voice', label: 'Voice Transcribe', icon: Mic },
                  { id: 'prompt', label: 'Beat Prompt Engine', icon: Sparkles },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeDockTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveDockTab(tab.id as any)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                        isActive
                          ? 'bg-amber-400 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <span>WASD: Drive</span>
                <span aria-hidden="true">·</span>
                <span>Space: Nitro</span>
                <span aria-hidden="true">·</span>
                <span>C: Camera</span>
                <span aria-hidden="true">·</span>
                <span>B: Beat</span>
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto pr-1">
              {/* Tab 1: Historical Landmarks */}
              {activeDockTab === 'landmarks' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {RAP_HISTORY_LANDMARKS.map((lm) => {
                    const isDiscovered = playerState.discoveredLandmarks.includes(lm.id);
                    return (
                      <div
                        key={lm.id}
                        className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between gap-2 transition-colors ${
                          isDiscovered
                            ? 'bg-slate-900/90 border-slate-700'
                            : 'bg-slate-950/60 border-slate-800/80 opacity-80'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                            <span>{lm.era}</span>
                            <span className="tabular-nums text-amber-400">{lm.mirFeatures.tempoBpm} BPM</span>
                          </div>
                          <h4 className="font-semibold text-white truncate mt-0.5">{lm.name}</h4>
                          <p className="text-[11px] text-slate-400 truncate">{lm.region}</p>
                        </div>

                        <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/60">
                          <button
                            onClick={() => onTeleport(lm.id)}
                            className="flex-1 py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition-colors"
                          >
                            Drive There
                          </button>
                          <button
                            onClick={() => onOpenLandmark(lm)}
                            className="py-1 px-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded text-[11px] font-semibold transition-colors"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tab 2: Web Lore Search */}
              {activeDockTab === 'search' && (
                <div className="space-y-3">
                  <form onSubmit={handleRunSearch} className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ask about hip-hop history, breakbeats, producers, or sample origins..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      disabled={searchLoading}
                      className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Search className="w-3.5 h-3.5" />
                      Search History
                    </button>
                  </form>

                  {searchResults && (
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2 text-xs">
                      <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{searchResults.text}</p>
                      {searchResults.groundingChunks?.length > 0 && (
                        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-2 text-[11px]">
                          <span className="text-slate-400">Sources:</span>
                          {searchResults.groundingChunks.slice(0, 4).map((c, i) => (
                            <a
                              key={i}
                              href={c.web?.uri}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sky-300 hover:underline flex items-center gap-0.5"
                            >
                              <span>{c.web?.title || 'Link'}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Freestyle Voice Transcriber */}
              {activeDockTab === 'voice' && (
                <AudioTranscriber
                  onApplyPrompt={(text) => onApplyPromptText(text)}
                  onSearchLore={(text) => {
                    setSearchQuery(text);
                    setActiveDockTab('search');
                    onSearchLore(text);
                  }}
                />
              )}

              {/* Tab 4: Prompt Synthesizer */}
              {activeDockTab === 'prompt' && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                  <div>
                    <h4 className="font-semibold text-white">Full Stack-Agnostic Prompt Engine</h4>
                    <p className="text-slate-400 mt-0.5">
                      Synthesize Suno, Udio, and local text-to-music prompts with 100-point quality audit &amp; CSV export.
                    </p>
                  </div>
                  <button
                    onClick={onOpenFullPromptBuilder}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    Open Studio Synthesizer
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
