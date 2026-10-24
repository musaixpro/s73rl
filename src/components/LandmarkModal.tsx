import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  ExternalLink,
  Search,
  Sparkles,
  Music,
  Sliders,
  Copy,
  Check,
  Loader2,
  Globe,
} from 'lucide-react';
import { HistoricalLandmark } from '../game/rapHistoryData.ts';

interface LandmarkModalProps {
  landmark: HistoricalLandmark | null;
  onClose: () => void;
  onInjectPrompt: (prompt: string, exclude: string) => void;
}

export const LandmarkModal: React.FC<LandmarkModalProps> = ({
  landmark,
  onClose,
  onInjectPrompt,
}) => {
  if (!landmark) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'maps' | 'search' | 'mir'>('overview');
  const [mapsData, setMapsData] = useState<{ text: string; groundingChunks: any[] } | null>(null);
  const [mapsLoading, setMapsLoading] = useState(false);
  const [searchData, setSearchData] = useState<{ text: string; groundingChunks: any[] } | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Fetch Google Maps Grounding data for this landmark
  const fetchMapsGrounding = async () => {
    if (mapsData || mapsLoading) return;
    setMapsLoading(true);
    try {
      const res = await fetch('/api/gemini/maps-landmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landmark: `${landmark.name}, ${landmark.address}`,
          era: landmark.era,
        }),
      });
      const data = await res.json();
      setMapsData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setMapsLoading(false);
    }
  };

  // Fetch Google Search Grounding data for this landmark's musical breakthrough
  const fetchSearchGrounding = async () => {
    if (searchData || searchLoading) return;
    setSearchLoading(true);
    try {
      const res = await fetch('/api/gemini/search-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `${landmark.name} ${landmark.region} hip hop history ${landmark.musicalBreakthrough}`,
        }),
      });
      const data = await res.json();
      setSearchData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'maps') {
      fetchMapsGrounding();
    } else if (activeTab === 'search') {
      fetchSearchGrounding();
    }
  }, [activeTab, landmark]);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(landmark.recommendedPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-900/60">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-mono">
              <MapPin className="w-3.5 h-3.5" />
              <span>{landmark.era}</span>
              <span aria-hidden="true">·</span>
              <span>{landmark.region}</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-white font-display mt-1">
              {landmark.name}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{landmark.address}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800 bg-slate-950/40 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Historical Overview
          </button>
          <button
            onClick={() => setActiveTab('maps')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'maps'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Google Maps Grounding
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'search'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Google Search Grounding
          </button>
          <button
            onClick={() => setActiveTab('mir')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'mir'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            MIR Audio Specs
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">
                  {landmark.storyTitle}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {landmark.storyDescription}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[11px] font-medium text-slate-400 block mb-1">
                    Musical &amp; Technological Breakthrough
                  </span>
                  <p className="text-xs text-amber-200 font-medium">
                    {landmark.musicalBreakthrough}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[11px] font-medium text-slate-400 block mb-1">
                    Pioneering Figures
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {landmark.iconicFigures.map((fig) => (
                      <span
                        key={fig}
                        className="text-xs text-slate-300"
                      >
                        {fig} ·
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommended Production Prompt */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Authentic Era Prompt Formula
                  </span>
                  <button
                    onClick={handleCopyPrompt}
                    className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                  >
                    {copiedPrompt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedPrompt ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-amber-100/90 leading-relaxed select-all">
                  {landmark.recommendedPrompt}
                </div>

                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-slate-400">
                    Exclude: <code className="text-slate-300">{landmark.excludeStyles}</code>
                  </span>
                  <button
                    onClick={() => {
                      onInjectPrompt(landmark.recommendedPrompt, landmark.excludeStyles);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded-md transition-colors whitespace-nowrap"
                  >
                    Load in Synthesizer
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'maps' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    Google Maps Grounded Geography
                  </h3>
                  <p className="text-xs text-slate-400">
                    Real-world location coordinates:{' '}
                    <span className="font-mono tabular-nums text-slate-300">
                      {landmark.latitude.toFixed(4)}, {landmark.longitude.toFixed(4)}
                    </span>
                  </p>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    landmark.name + ' ' + landmark.address,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in Google Maps
                </a>
              </div>

              {mapsLoading && (
                <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                  <Loader2 className="w-5 h-5 text-amber-400 animate-spin mx-auto" />
                  <p>Querying Google Maps grounding tool (gemini-3.8-flash)...</p>
                </div>
              )}

              {mapsData && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {mapsData.text}
                  </div>

                  {/* List of Maps Grounding Chunks with real links as mandated */}
                  {mapsData.groundingChunks?.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-slate-300">
                        Google Maps Verified Sources &amp; Place Links:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {mapsData.groundingChunks.map((chunk, idx) => {
                          const uri = chunk.maps?.uri || chunk.web?.uri;
                          const title = chunk.maps?.title || chunk.web?.title || 'Map Place Details';
                          if (!uri) return null;
                          return (
                            <a
                              key={idx}
                              href={uri}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-amber-300 flex items-center justify-between transition-colors"
                            >
                              <span className="truncate">{title}</span>
                              <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-1 text-slate-400" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'search' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-sky-400" />
                  Google Search Grounded History &amp; Lore
                </h3>
                <p className="text-xs text-slate-400">
                  Grounded with real-time web search via gemini-3.8-flash googleSearch tool.
                </p>
              </div>

              {searchLoading && (
                <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                  <Loader2 className="w-5 h-5 text-amber-400 animate-spin mx-auto" />
                  <p>Searching historical rap archives &amp; discographies...</p>
                </div>
              )}

              {searchData && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {searchData.text}
                  </div>

                  {searchData.groundingChunks?.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-slate-300">
                        Web Citations &amp; Reference Links:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {searchData.groundingChunks.map((chunk, idx) => {
                          const uri = chunk.web?.uri;
                          const title = chunk.web?.title || uri;
                          if (!uri) return null;
                          return (
                            <a
                              key={idx}
                              href={uri}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-sky-300 flex items-center justify-between transition-colors"
                            >
                              <span className="truncate">{title}</span>
                              <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-1 text-slate-400" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'mir' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Music className="w-4 h-4 text-purple-400" />
                  Music Information Retrieval (MIR) Acoustic Profile
                </h3>
                <p className="text-xs text-slate-400">
                  Quantitative audio signal parameters derived from historical production records.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Primary Tempo (BPM)</span>
                  <span className="font-mono text-base font-bold text-amber-400 tabular-nums">
                    {landmark.mirFeatures.tempoBpm} BPM
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Sub-Bass Tuning</span>
                  <span className="font-mono text-base font-bold text-rose-400 tabular-nums">
                    {landmark.mirFeatures.subBassTuningHz} Hz
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Meter &amp; Quantization</span>
                  <span className="font-medium text-slate-200">
                    {landmark.mirFeatures.meter}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Swing Ratio</span>
                  <span className="font-medium text-slate-200">
                    {landmark.mirFeatures.swingRatio}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 sm:col-span-2">
                  <span className="text-slate-400 block text-[11px]">Spectral Brightness / Cutoff</span>
                  <span className="font-medium text-slate-200">
                    {landmark.mirFeatures.spectralBrightness}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 sm:col-span-2">
                  <span className="text-slate-400 block text-[11px]">Harmonic / Sample Provenance</span>
                  <span className="font-medium text-slate-200">
                    {landmark.mirFeatures.harmonicSource}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
