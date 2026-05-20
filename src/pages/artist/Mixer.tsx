import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wand2, Play, Pause, SkipForward, Disc3, Radio,
  Save, Loader2, Music2, ChevronRight, Volume2, Sliders,
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../../services/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface MixTrack {
  songId: string;
  name: string;
  artist: string;
  audioFile?: string;
  coverArt?: string;
  duration?: number;
  transition?: { text: string; audioUrl?: string | null };
}

interface GeneratedMix {
  mixName: string;
  mood: string;
  songs: MixTrack[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const MOODS = [
  { id: 'hype',    label: 'Hype',     emoji: '🔥' },
  { id: 'party',   label: 'Party',    emoji: '🎉' },
  { id: 'vibes',   label: 'Vibes',    emoji: '✨' },
  { id: 'chill',   label: 'Chill',    emoji: '😌' },
  { id: 'workout', label: 'Workout',  emoji: '💪' },
  { id: 'romance', label: 'Romance',  emoji: '💕' },
];

const GENRES = ['Any', 'Reggae', 'Dancehall', 'Soca', 'Afrobeats', 'R&B', 'Hip Hop', 'Calypso'];

const TEMPO_MAP: Record<string, number> = { slow: 0.85, medium: 1.0, fast: 1.1, turbo: 1.2 };

const card = 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg';

// ── Waveform visualizer ───────────────────────────────────────────────────────

function Waveform({ analyser }: { analyser: AnalyserNode | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) return;
    const ctx   = canvas.getContext('2d')!;
    const buf   = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(buf);
      canvas.width  = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bw = (canvas.width / buf.length) * 3;
      let x = 0;
      for (let i = 0; i < buf.length; i++) {
        const h = (buf[i] / 255) * canvas.height;
        const hue = 140 + (buf[i] / 255) * 60;
        ctx.fillStyle = `hsl(${hue},80%,50%)`;
        ctx.fillRect(x, canvas.height - h, bw - 1, h);
        x += bw;
      }
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [analyser]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Mixer() {
  // Config
  const [mood,     setMood]     = useState('hype');
  const [genre,    setGenre]    = useState('Any');
  const [tempo,    setTempo]    = useState('medium');
  const [bass,     setBass]     = useState(50);
  const [echo,     setEcho]     = useState(20);
  const [cfSpeed,  setCfSpeed]  = useState(3);
  const [count,    setCount]    = useState(8);

  // Mix state
  const [generating, setGenerating] = useState(false);
  const [mix,        setMix]        = useState<GeneratedMix | null>(null);
  const [curIdx,     setCurIdx]     = useState(0);
  const [isPlaying,  setIsPlaying]  = useState(false);
  const [transition, setTransition] = useState<string | null>(null);
  const [analyserData, setAnalyserData] = useState(0);
  const [saving,     setSaving]     = useState(false);

  // Web Audio refs
  const ctxRef       = useRef<AudioContext | null>(null);
  const analyserRef  = useRef<AnalyserNode | null>(null);
  const sourceRef    = useRef<AudioBufferSourceNode | null>(null);
  const gainRef      = useRef<GainNode | null>(null);
  const filterRef    = useRef<BiquadFilterNode | null>(null);
  const reverbRef    = useRef<GainNode | null>(null);
  const rafRef       = useRef<number>(0);
  const skipFnRef    = useRef<() => void>(() => {});

  // Analyser poll
  useEffect(() => {
    const poll = () => {
      if (analyserRef.current) {
        const d = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(d);
        setAnalyserData(d.reduce((a, b) => a + b, 0) / d.length);
      }
      rafRef.current = requestAnimationFrame(poll);
    };
    rafRef.current = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Bass/echo updates
  useEffect(() => { if (filterRef.current) filterRef.current.gain.value = (bass / 100) * 20; }, [bass]);
  useEffect(() => { if (reverbRef.current) reverbRef.current.gain.value = echo / 100; }, [echo]);

  const buildGraph = useCallback(() => {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    const ctx = ctxRef.current;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowshelf';
    filter.frequency.value = 80;
    filter.gain.value = (bass / 100) * 20;
    filterRef.current = filter;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    const dry = ctx.createGain();
    dry.gain.value = 0.8;

    const rvbGain = ctx.createGain();
    rvbGain.gain.value = echo / 100;
    reverbRef.current = rvbGain;

    const reverb = ctx.createConvolver();
    const ir = ctx.createBuffer(2, ctx.sampleRate * 2, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
    }
    reverb.buffer = ir;

    filter.connect(analyser);
    analyser.connect(dry);
    dry.connect(ctx.destination);
    analyser.connect(reverb);
    reverb.connect(rvbGain);
    rvbGain.connect(ctx.destination);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playTrack = useCallback(async (track: MixTrack, idx: number, fadeIn = true) => {
    const url = track.audioFile;
    if (!url) { toast.error('No audio for this track'); return; }

    if (!ctxRef.current) buildGraph();
    const ctx = ctxRef.current!;
    if (ctx.state === 'suspended') await ctx.resume();

    let buffer: AudioBuffer;
    try {
      const resp = await fetch(url);
      const ab   = await resp.arrayBuffer();
      buffer     = await ctx.decodeAudioData(ab);
    } catch {
      toast.error('Could not load audio');
      return;
    }

    // Fade out old
    if (sourceRef.current && gainRef.current) {
      const now = ctx.currentTime;
      gainRef.current.gain.setValueAtTime(gainRef.current.gain.value, now);
      gainRef.current.gain.linearRampToValueAtTime(0, now + cfSpeed);
      const old = sourceRef.current;
      setTimeout(() => { try { old.stop(); } catch { /* already stopped */ } }, cfSpeed * 1000 + 100);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = TEMPO_MAP[tempo] ?? 1.0;

    const g = ctx.createGain();
    g.gain.value = fadeIn ? 0 : 1;
    gainRef.current  = g;
    sourceRef.current = source;

    source.connect(g);
    g.connect(filterRef.current ?? ctx.destination);
    source.start();

    if (fadeIn) {
      const now = ctx.currentTime;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(1, now + cfSpeed);
    }

    source.onended = () => skipFnRef.current();
    setCurIdx(idx);
    setIsPlaying(true);
  }, [buildGraph, cfSpeed, tempo]);

  const skipNext = useCallback(() => {
    if (!mix) return;
    const next = curIdx + 1;
    if (next < mix.songs.length) {
      const t = mix.songs[next].transition;
      if (t) {
        setTransition(t.text);
        if (t.audioUrl) {
          const a = new Audio(t.audioUrl);
          a.play().catch(() => {});
          a.onended = () => { playTrack(mix.songs[next], next); setTransition(null); };
        } else {
          setTimeout(() => { playTrack(mix.songs[next], next); setTransition(null); }, 3000);
        }
      } else {
        playTrack(mix.songs[next], next);
      }
    } else {
      setIsPlaying(false);
      setCurIdx(0);
    }
  }, [mix, curIdx, playTrack]);

  useEffect(() => { skipFnRef.current = skipNext; }, [skipNext]);

  const togglePlay = () => {
    if (!mix?.songs.length) return;
    if (isPlaying) {
      ctxRef.current?.suspend();
      setIsPlaying(false);
    } else if (ctxRef.current?.state === 'suspended') {
      ctxRef.current.resume();
      setIsPlaying(true);
    } else {
      playTrack(mix.songs[curIdx], curIdx, false);
    }
  };

  const generate = async () => {
    setGenerating(true);
    setMix(null);
    try {
      const res = await apiService.post<any>('/mixer/generate', {
        mood,
        genre: genre === 'Any' ? undefined : genre,
        songCount: count,
      });
      const data = (res.data as any).data;
      setMix(data);
      setCurIdx(0);
      setIsPlaying(false);
      toast.success(`Mix ready: ${data.mixName}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not generate mix');
    } finally {
      setGenerating(false);
    }
  };

  const saveMix = async () => {
    if (!mix) return;
    setSaving(true);
    try {
      await apiService.post('/mixer/save', { name: mix.mixName, mood, songs: mix.songs.map(s => s.songId) });
      toast.success('Mix saved');
    } catch {
      toast.error('Failed to save mix');
    } finally {
      setSaving(false);
    }
  };

  const currentTrack = mix?.songs[curIdx];
  const intensity = Math.min(analyserData / 128, 1);

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">AI Mixer</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Generate a Jamaican selector-style mix from Lugmatic tracks</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Config panel ──────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Mood */}
          <div className={`${card} p-5`}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Mood</p>
            <div className="grid grid-cols-3 gap-2">
              {MOODS.map(m => (
                <button key={m.id} onClick={() => setMood(m.id)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded text-xs font-semibold border transition-colors ${
                    mood === m.id
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                      : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-white/[0.08] text-zinc-500 hover:border-zinc-300 dark:hover:border-white/20'
                  }`}>
                  <span className="text-lg">{m.emoji}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Genre + Count */}
          <div className={`${card} p-5 space-y-4`}>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Genre</p>
              <div className="flex flex-wrap gap-1.5">
                {GENRES.map(g => (
                  <button key={g} onClick={() => setGenre(g)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors ${
                      genre === g
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                        : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-white/[0.08] text-zinc-500'
                    }`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                Track count: <span className="text-zinc-900 dark:text-white">{count}</span>
              </p>
              <input type="range" min={4} max={12} value={count} onChange={e => setCount(+e.target.value)}
                className="w-full accent-emerald-500" />
            </div>
          </div>

          {/* Audio controls */}
          <div className={`${card} p-5 space-y-4`}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5" /> Audio Controls
            </p>

            {[
              { label: 'Bass Boost', value: bass, set: setBass },
              { label: 'Echo / Reverb', value: echo, set: setEcho },
              { label: `Crossfade ${cfSpeed}s`, value: cfSpeed * 10, set: (v: number) => setCfSpeed(v / 10), max: 80 },
            ].map(c => (
              <div key={c.label}>
                <div className="flex justify-between text-xs text-zinc-500 mb-1">
                  <span>{c.label}</span><span>{c.value}{c.max ? '' : '%'}</span>
                </div>
                <input type="range" min={0} max={c.max ?? 100} value={c.value}
                  onChange={e => c.set(+e.target.value)} className="w-full accent-emerald-500" />
              </div>
            ))}

            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Tempo</p>
              <div className="grid grid-cols-4 gap-1">
                {['slow', 'medium', 'fast', 'turbo'].map(t => (
                  <button key={t} onClick={() => setTempo(t)}
                    className={`py-1.5 rounded text-[10px] font-bold uppercase transition-colors ${
                      tempo === t
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate */}
          <button onClick={generate} disabled={generating}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {generating ? 'Generating mix…' : 'Generate Mix'}
          </button>
        </div>

        {/* ── Player + Queue ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Now playing */}
          <div className={`${card} p-5`}>
            {!mix ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <motion.div
                  animate={{ rotate: isPlaying ? 360 : 0 }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                  className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4"
                >
                  <Disc3 className="h-9 w-9 text-zinc-400" />
                </motion.div>
                <p className="font-semibold text-zinc-500">Choose a mood and generate a mix</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mix name */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Now Playing</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">{mix.mixName}</p>
                  </div>
                  <button onClick={saveMix} disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    Save
                  </button>
                </div>

                {/* Current track */}
                <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded">
                  {currentTrack?.coverArt
                    ? <img src={currentTrack.coverArt} alt="" className="w-14 h-14 rounded object-cover flex-shrink-0" />
                    : <div className="w-14 h-14 rounded bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0">
                        <Music2 className="h-6 w-6 text-zinc-400" />
                      </div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-900 dark:text-white truncate">{currentTrack?.name ?? '—'}</p>
                    <p className="text-sm text-zinc-500 truncate">{currentTrack?.artist ?? '—'}</p>
                  </div>
                  {isPlaying && (
                    <motion.div
                      animate={{ scale: 1 + intensity * 0.15 }}
                      transition={{ duration: 0.1 }}
                      className="w-2 h-2 rounded-full bg-emerald-500"
                    />
                  )}
                </div>

                {/* Waveform */}
                <div className="h-12 bg-zinc-50 dark:bg-zinc-800 rounded overflow-hidden">
                  {isPlaying
                    ? <Waveform analyser={analyserRef.current} />
                    : <div className="h-full flex items-center justify-center">
                        <Volume2 className="h-4 w-4 text-zinc-400" />
                      </div>
                  }
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <button onClick={togglePlay}
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                  </button>
                  <button onClick={skipNext}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                    <SkipForward className="h-4 w-4" />
                  </button>
                </div>

                {/* AI transition drop */}
                <AnimatePresence>
                  {transition && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded"
                    >
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium italic">
                        🎙️ {transition}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Queue */}
          {mix && (
            <div className={`${card} overflow-hidden`}>
              <div className="px-5 py-4 border-b border-zinc-100 dark:border-white/[0.06]">
                <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Queue · {mix.songs.length} tracks
                </span>
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-white/[0.04] max-h-80 overflow-y-auto">
                {mix.songs.map((track, i) => (
                  <button key={track.songId + i} onClick={() => playTrack(track, i)}
                    className={`w-full flex items-center gap-3 px-5 py-3 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors text-left ${
                      i === curIdx ? 'bg-emerald-500/5' : ''
                    }`}>
                    <span className={`text-[11px] font-bold w-5 text-right flex-shrink-0 ${i === curIdx ? 'text-emerald-500' : 'text-zinc-400'}`}>
                      {i === curIdx && isPlaying ? '▶' : i + 1}
                    </span>
                    {track.coverArt
                      ? <img src={track.coverArt} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                      : <div className="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                          <Music2 className="h-3.5 w-3.5 text-zinc-400" />
                        </div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${i === curIdx ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-zinc-800 dark:text-zinc-200'}`}>
                        {track.name}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
                    </div>
                    {track.transition && (
                      <span className="text-[10px] text-emerald-500 flex-shrink-0" title={track.transition.text}>🎙️</span>
                    )}
                    <ChevronRight className="h-3.5 w-3.5 text-zinc-300 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
