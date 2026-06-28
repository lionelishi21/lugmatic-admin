import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, Sparkles, Play, Pause, CheckCircle2, Circle, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import songService from '../../services/songService';

interface LyricsLine {
  time: number;
  text: string;
}

interface KaraokeTimingModalProps {
  songId: string;
  lyrics: string;
  audioUrl: string;
  onClose: () => void;
}

/**
 * Admin-only karaoke timing tool — lets an admin (with the karaoke_timing
 * permission) auto-generate or manually stamp line timing for ANY song, not
 * just their own. Ported from lugmatic-music-webapp's KaraokeTimingModal.
 */
const KaraokeTimingModal: React.FC<KaraokeTimingModalProps> = ({ songId, lyrics, audioUrl, onClose }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const lines = useMemo(
    () => lyrics.split('\n').map((l) => l.trim()).filter((l) => l.length > 0),
    [lyrics]
  );

  const [stamped, setStamped] = useState<(LyricsLine | null)[]>(() => lines.map(() => null));
  const [recordTarget, setRecordTarget] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [source, setSource] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  const nextUnstampedIndex = (list: (LyricsLine | null)[]) => {
    const idx = list.findIndex((s) => s === null);
    return idx === -1 ? null : idx;
  };

  const nextIndex = recordTarget ?? nextUnstampedIndex(stamped);
  const isDone = nextIndex === null;
  const stampedCount = stamped.filter((s) => s !== null).length;

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play();
    else audio.pause();
  };

  const stampCurrentLine = () => {
    const audio = audioRef.current;
    if (!audio || nextIndex === null) return;
    const idx = nextIndex;
    const entry: LyricsLine = { time: audio.currentTime, text: lines[idx] };
    setStamped((prev) => {
      const next = [...prev];
      next[idx] = entry;
      if (nextUnstampedIndex(next) === null) audio.pause();
      return next;
    });
    setRecordTarget(null);
  };

  const startRerecord = (index: number) => {
    const audio = audioRef.current;
    setRecordTarget(index);
    if (!audio) return;
    const existing = stamped[index];
    const seekTo = Math.max((existing?.time ?? 0) - 2, 0);
    audio.currentTime = seekTo;
  };

  const sourceLabel = (s: string) => {
    if (s === 'gemini') return 'Aligned with Gemini';
    if (s === 'transcribe-bedrock') return 'Aligned via Transcribe + Bedrock fallback';
    return 'Aligned with AI';
  };

  const autoGenerate = async () => {
    setIsGenerating(true);
    setGenerateError(null);
    try {
      const { lyricsLines: generated, source: src } = await songService.autoGenerateLyricsTiming(songId);
      if (!generated.length) throw new Error('AI returned no timing data');

      setStamped((prev) => {
        const next = [...prev];
        for (let i = 0; i < next.length && i < generated.length; i++) {
          next[i] = { time: generated[i].time, text: lines[i] };
        }
        return next;
      });
      setSource(src);
      setRecordTarget(null);
      toast.success('Karaoke timing generated!');
    } catch (err: any) {
      const message = err?.message || 'AI generation failed';
      setGenerateError(message);
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const save = async () => {
    setIsSaving(true);
    try {
      const lyricsLines = stamped.filter((s): s is LyricsLine => s !== null);
      await songService.updateLyricsTiming(songId, lyricsLines);
      toast.success('Karaoke timing saved!');
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save timing');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-zinc-950 border border-white/10 rounded-[2rem] shadow-2xl p-8 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Karaoke Lyrics Timing</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg text-zinc-500 hover:text-white transition-colors flex items-center justify-center">
            <X size={18} />
          </button>
        </div>

        <audio ref={audioRef} src={audioUrl} preload="metadata" />

        {lines.length === 0 ? (
          <p className="text-sm text-zinc-500">No lyrics to time. Add lyrics first.</p>
        ) : (
          <>
            <button
              onClick={autoGenerate}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 w-full h-11 text-xs font-bold text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl transition-all disabled:opacity-50 mb-3"
            >
              {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {isGenerating ? 'Generating...' : 'Auto-Generate with AI'}
            </button>
            {source && <p className="text-xs text-zinc-500 text-center mb-2">{sourceLabel(source)}</p>}
            {generateError && <p className="text-xs text-red-400 text-center mb-2">{generateError}</p>}

            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider text-center mb-4">
              {stampedCount} / {lines.length} lines timed
            </p>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-4">
              {lines.map((line, index) => {
                const stamp = stamped[index];
                const isStamped = stamp !== null;
                const isActive = index === nextIndex;
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                      isActive ? 'bg-purple-500/15 border-purple-500/50' : 'bg-zinc-900/50 border-white/5'
                    }`}
                  >
                    {isStamped ? (
                      <CheckCircle2 size={16} className="text-purple-400 flex-shrink-0" />
                    ) : (
                      <Circle size={16} className="text-zinc-600 flex-shrink-0" />
                    )}
                    <span className={`flex-1 text-sm truncate ${isActive ? 'text-white font-semibold' : 'text-zinc-400'}`}>
                      {line}
                    </span>
                    {isStamped && (
                      <button
                        onClick={() => startRerecord(index)}
                        title="Re-record this line"
                        className="text-zinc-500 hover:text-white transition-colors flex-shrink-0"
                      >
                        <RotateCcw size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={togglePlayback}
                className="w-11 h-11 flex items-center justify-center rounded-xl border border-white/10 text-purple-400 hover:text-purple-300 transition-colors flex-shrink-0"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button
                onClick={stampCurrentLine}
                disabled={isDone}
                className="flex-1 h-11 rounded-xl bg-purple-500 hover:bg-purple-400 disabled:opacity-40 disabled:bg-zinc-700 text-black text-xs font-bold transition-all truncate px-4"
              >
                {isDone ? 'All lines timed' : `Tap on "${lines[nextIndex]}"`}
              </button>
            </div>

            <button
              onClick={save}
              disabled={stampedCount === 0 || isSaving}
              className="w-full h-11 rounded-xl border border-purple-500/30 text-purple-400 hover:text-purple-300 disabled:opacity-40 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : null}
              Save Timing
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default KaraokeTimingModal;
