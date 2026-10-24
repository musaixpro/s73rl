import React, { useState } from 'react';
import { X, BookOpen, Volume2, ArrowRight, CheckCircle2, Sparkles, MapPin } from 'lucide-react';
import { STORY_CHAPTERS, StoryChapter } from '../game/rapHistoryData.ts';
import { beatAudio } from '../game/audioSynth.ts';

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeleportToEra: (landmarkId: string) => void;
  discoveredLandmarks: string[];
}

export const StoryModal: React.FC<StoryModalProps> = ({
  isOpen,
  onClose,
  onTeleportToEra,
  discoveredLandmarks,
}) => {
  if (!isOpen) return null;

  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const currentChapter = STORY_CHAPTERS[activeChapterIndex];

  const handlePlayEraSound = () => {
    beatAudio.init();
    if (activeChapterIndex === 0) {
      beatAudio.playSnare();
      beatAudio.playHiHat(true);
    } else if (activeChapterIndex === 1) {
      beatAudio.playSnare();
      beatAudio.play808(50, 0.4);
    } else if (activeChapterIndex === 2) {
      beatAudio.play808(45, 0.9);
      beatAudio.playHiHat(false);
    } else if (activeChapterIndex === 3) {
      beatAudio.play808(36, 1.2);
      beatAudio.playHiHat(false);
    } else {
      beatAudio.play808(32, 1.4);
      beatAudio.playSnare();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-white font-display">
                MIR Rap History: A Visualized Story
              </h2>
              <p className="text-xs text-slate-400">
                Chapter {currentChapter.chapterNumber} of {STORY_CHAPTERS.length}
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

        {/* Chapter Carousel Pills */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-800 bg-slate-950/40 overflow-x-auto text-xs">
          {STORY_CHAPTERS.map((chap, idx) => {
            const isUnlocked = discoveredLandmarks.includes(chap.requiredLandmarkId);
            return (
              <button
                key={chap.id}
                onClick={() => setActiveChapterIndex(idx)}
                className={`py-1.5 px-3 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeChapterIndex === idx
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>Ch. {chap.chapterNumber}</span>
                {isUnlocked && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              </button>
            );
          })}
        </div>

        {/* Story Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white font-display">
              {currentChapter.title}
            </h3>
            <p className="text-xs text-amber-300 font-medium mt-1">
              {currentChapter.subtitle}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs text-slate-200 leading-relaxed space-y-4">
            <p className="whitespace-pre-wrap">{currentChapter.narrativeText}</p>

            <blockquote className="border-l-2 border-amber-400 pl-3.5 italic text-amber-200/90 text-xs">
              {currentChapter.historicalQuote}
              <span className="block not-italic text-slate-400 text-[11px] mt-1 font-mono">
                — {currentChapter.speaker}
              </span>
            </blockquote>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePlayEraSound}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                Play Era Audio Signature
              </button>

              <button
                onClick={() => {
                  onTeleportToEra(currentChapter.requiredLandmarkId);
                  onClose();
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                Drive to Landmark in 3D
              </button>
            </div>

            <div className="flex items-center gap-2">
              {activeChapterIndex > 0 && (
                <button
                  onClick={() => setActiveChapterIndex((i) => i - 1)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-medium transition-colors"
                >
                  Previous
                </button>
              )}
              {activeChapterIndex < STORY_CHAPTERS.length - 1 && (
                <button
                  onClick={() => setActiveChapterIndex((i) => i + 1)}
                  className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded-lg text-xs flex items-center gap-1 transition-colors"
                >
                  Next Chapter
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
