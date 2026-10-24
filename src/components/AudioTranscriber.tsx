import React, { useState, useRef } from 'react';
import { Mic, MicOff, Loader2, Sparkles, Copy, Check, Search, ArrowRight } from 'lucide-react';

interface AudioTranscriberProps {
  onApplyPrompt?: (text: string) => void;
  onSearchLore?: (query: string) => void;
}

export const AudioTranscriber: React.FC<AudioTranscriberProps> = ({
  onApplyPrompt,
  onSearchLore,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        await sendAudioForTranscription(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      setError('Microphone access error: ' + (err.message || 'Please grant permission'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioForTranscription = async (blob: Blob) => {
    setIsTranscribing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];

        const response = await fetch('/api/gemini/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64Data,
            mimeType: 'audio/webm',
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Transcription failed');
        }

        setTranscribedText(data.transcription || 'No speech detected.');
        setIsTranscribing(false);
      };
    } catch (err: any) {
      console.error('Transcription request failed:', err);
      setError('Transcription failed: ' + (err.message || 'Error communicating with AI service'));
      setIsTranscribing(false);
    }
  };

  const handleCopy = () => {
    if (!transcribedText) return;
    navigator.clipboard.writeText(transcribedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Mic className="w-4 h-4 text-amber-400" />
            Freestyle &amp; Voice Beat Transcriber
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Record freestyle lyrics or describe a beat via microphone. Transcribed by{' '}
            <span className="font-mono text-amber-300">gemini-3.5-transcribe</span>.
          </p>
        </div>

        <div>
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isTranscribing}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Mic className="w-3.5 h-3.5" />
              Record Voice
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <MicOff className="w-3.5 h-3.5" />
              Stop &amp; Transcribe
            </button>
          )}
        </div>
      </div>

      {isRecording && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg flex items-center gap-3 text-xs text-rose-200">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Listening... Spit your bars or describe your dream beat groove.</span>
        </div>
      )}

      {isTranscribing && (
        <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-lg flex items-center gap-3 text-xs text-amber-200">
          <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
          <span>Processing audio with gemini-3.5-transcribe model...</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-lg text-xs text-rose-300">
          {error}
        </div>
      )}

      {transcribedText && (
        <div className="space-y-3 bg-slate-950/80 border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Transcribed Speech</span>
            <button
              onClick={handleCopy}
              className="hover:text-white transition-colors flex items-center gap-1 text-[11px]"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="font-mono text-xs text-amber-100 whitespace-pre-wrap leading-relaxed select-all">
            {transcribedText}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
            {onApplyPrompt && (
              <button
                onClick={() => onApplyPrompt(transcribedText)}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Use in Beat Prompt
              </button>
            )}

            {onSearchLore && (
              <button
                onClick={() => onSearchLore(transcribedText)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                Search Rap Lore
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
