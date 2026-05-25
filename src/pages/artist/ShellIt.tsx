import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  RotateCcw, Music2, X, Check, Upload, RefreshCw, Trash2,
  Loader2, Search, ChevronLeft, Mic, MicOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import uploadService from '../../services/uploadService';
import videoService from '../../services/videoService';
import apiService from '../../services/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_SECONDS = 60;

const FILTERS = [
  { id: 'natural', label: 'Natural', css: 'none',                                          dot: '#111827' },
  { id: 'vivid',   label: 'Vivid',   css: 'saturate(160%) contrast(115%)',                 dot: '#f43f5e' },
  { id: 'warm',    label: 'Warm',    css: 'sepia(40%) saturate(140%) brightness(108%)',    dot: '#f97316' },
  { id: 'cool',    label: 'Cool',    css: 'hue-rotate(20deg) saturate(140%)',              dot: '#06b6d4' },
  { id: 'dark',    label: 'Dark',    css: 'brightness(70%) contrast(130%)',                dot: '#3f3f46' },
  { id: 'glam',    label: 'Glam',    css: 'saturate(220%) contrast(110%)',                 dot: '#a855f7' },
  { id: 'bw',      label: 'B&W',     css: 'grayscale(100%) contrast(110%)',               dot: '#a1a1aa' },
  { id: 'retro',   label: 'Retro',   css: 'sepia(70%) contrast(115%) brightness(92%)',    dot: '#92400e' },
];

function getSupportedMimeType(): string {
  const types = [
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4',
  ];
  return types.find(t => MediaRecorder.isTypeSupported(t)) ?? '';
}

interface Song {
  _id: string;
  name: string;
  artist: { name: string; image?: string };
  coverArt?: string;
  audioUrl?: string;
}

// ─── Circular progress around record button ────────────────────────────────

function RecordRing({ progress }: { progress: number }) {
  const r = 46;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (progress / 100) * circumference;
  return (
    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="white" strokeWidth="3"
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round" className="transition-all duration-100" />
    </svg>
  );
}

// ─── Song picker sheet ────────────────────────────────────────────────────────

function SongPicker({
  selected,
  onSelect,
  onClose,
}: {
  selected: Song | null;
  onSelect: (s: Song | null) => void;
  onClose: () => void;
}) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const previewRef = useRef<HTMLAudioElement | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiService.get<Song[]>('/songs/list?limit=40');
        setSongs((res.data as any)?.data || []);
      } catch { toast.error('Could not load songs'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const filtered = q
    ? songs.filter(s => s.name.toLowerCase().includes(q.toLowerCase()) || s.artist?.name?.toLowerCase().includes(q.toLowerCase()))
    : songs;

  const togglePreview = (song: Song) => {
    if (previewId === song._id) {
      previewRef.current?.pause();
      setPreviewId(null);
    } else {
      if (previewRef.current) { previewRef.current.pause(); previewRef.current.src = ''; }
      if (song.audioUrl) {
        const audio = new Audio(song.audioUrl);
        audio.play().catch(() => {});
        previewRef.current = audio;
        setPreviewId(song._id);
        audio.onended = () => setPreviewId(null);
      }
    }
  };

  useEffect(() => () => previewRef.current?.pause(), []);

  return (
    <motion.div
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-x-0 bottom-0 z-50 bg-zinc-950 border-t border-white/10 rounded-t-3xl overflow-hidden"
      style={{ maxHeight: '80vh' }}
    >
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <h3 className="text-base font-bold text-white">Select Rhythm</h3>
        <button onClick={onClose} className="w-9 h-9 bg-zinc-800 rounded-xl flex items-center justify-center">
          <X size={16} className="text-zinc-400" />
        </button>
      </div>

      <div className="px-6 pb-3">
        <div className="flex items-center gap-3 bg-zinc-900 rounded-2xl px-4 h-11 border border-white/10">
          <Search size={14} className="text-zinc-500 flex-shrink-0" />
          <input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search songs…"
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 140px)' }}>
        {/* No music option */}
        <button
          onClick={() => { onSelect(null); onClose(); }}
          className={`w-full flex items-center gap-4 px-6 py-3 hover:bg-white/5 transition-colors ${!selected ? 'bg-white/5' : ''}`}
        >
          <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
            <MicOff size={16} className="text-zinc-500" />
          </div>
          <span className="text-sm font-medium text-zinc-400">No music</span>
          {!selected && <Check size={16} className="text-emerald-500 ml-auto" />}
        </button>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-zinc-500" size={24} />
          </div>
        ) : filtered.map(song => (
          <button
            key={song._id}
            onClick={() => { onSelect(song); onClose(); }}
            className={`w-full flex items-center gap-4 px-6 py-3 hover:bg-white/5 transition-colors ${selected?._id === song._id ? 'bg-white/5' : ''}`}
          >
            {song.coverArt ? (
              <img src={song.coverArt} alt={song.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                <Music2 size={16} className="text-zinc-500" />
              </div>
            )}
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-bold text-white truncate">{song.name}</p>
              <p className="text-xs text-zinc-500 truncate">{song.artist?.name}</p>
            </div>
            {selected?._id === song._id
              ? <Check size={16} className="text-emerald-500 flex-shrink-0" />
              : song.audioUrl && (
                <button
                  onClick={e => { e.stopPropagation(); togglePreview(song); }}
                  className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0"
                >
                  {previewId === song._id
                    ? <div className="w-2 h-2 bg-white rounded-sm" />
                    : <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-white ml-0.5" />
                  }
                </button>
              )
            }
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Phase = 'idle' | 'recording' | 'preview' | 'uploading' | 'done';

export default function ShellIt() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [selectedFilter, setSelectedFilter] = useState('natural');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showSongPicker, setShowSongPicker] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [title, setTitle] = useState('');
  const [showTitleInput, setShowTitleInput] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animFrameRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentFilterCss = FILTERS.find(f => f.id === selectedFilter)?.css ?? 'none';

  // ── Camera init ───────────────────────────────────────────────────────────

  const initCamera = useCallback(async (facing: 'user' | 'environment') => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 720 }, height: { ideal: 1280 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      setCameraError(err.name === 'NotAllowedError'
        ? 'Camera permission denied. Enable it in your browser settings.'
        : 'Could not access camera or microphone.');
    }
  }, []);

  useEffect(() => {
    initCamera(facingMode);
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      audioRef.current?.pause();
    };
  }, []);

  const flipCamera = async () => {
    const next = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);
    await initCamera(next);
  };

  // ── Recording ─────────────────────────────────────────────────────────────

  const startRecording = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !streamRef.current || phase !== 'idle') return;

    // Size canvas to video
    const track = streamRef.current.getVideoTracks()[0];
    const s = track.getSettings();
    canvas.width  = s.width  || video.videoWidth  || 720;
    canvas.height = s.height || video.videoHeight || 1280;

    const ctx = canvas.getContext('2d')!;
    const drawFrame = () => {
      ctx.filter = currentFilterCss;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      animFrameRef.current = requestAnimationFrame(drawFrame);
    };
    drawFrame();

    // Capture canvas + audio
    const canvasStream = canvas.captureStream(30);
    streamRef.current.getAudioTracks().forEach(t => canvasStream.addTrack(t));

    const mimeType = getSupportedMimeType();
    const recorder = new MediaRecorder(canvasStream, mimeType ? { mimeType } : {});
    chunksRef.current = [];
    recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      cancelAnimationFrame(animFrameRef.current);
      const type = mimeType || 'video/webm';
      const blob = new Blob(chunksRef.current, { type });
      setRecordedBlob(blob);
      setRecordedUrl(URL.createObjectURL(blob));
      if (timerRef.current) clearInterval(timerRef.current);
      setPhase('preview');
    };

    recorder.start(250);
    mediaRecorderRef.current = recorder;

    // Play background music
    if (selectedSong?.audioUrl) {
      const audio = new Audio(selectedSong.audioUrl);
      audio.loop = true;
      audio.volume = 0.5;
      audio.play().catch(() => {});
      audioRef.current = audio;
    }

    // Timer
    setRecordSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordSeconds(s => {
        if (s + 1 >= MAX_SECONDS) {
          stopRecordingImmediate();
          return MAX_SECONDS;
        }
        return s + 1;
      });
    }, 1000);

    setPhase('recording');
  }, [phase, currentFilterCss, selectedSong]);

  const stopRecordingImmediate = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    mediaRecorderRef.current?.stop();
  };

  const stopRecording = useCallback(() => {
    if (phase !== 'recording') return;
    stopRecordingImmediate();
  }, [phase]);

  // Auto-play preview when entering preview phase
  useEffect(() => {
    if (phase === 'preview' && recordedUrl && previewVideoRef.current) {
      previewVideoRef.current.src = recordedUrl;
      previewVideoRef.current.loop = true;
      previewVideoRef.current.play().catch(() => {});
    }
  }, [phase, recordedUrl]);

  // ── Upload ────────────────────────────────────────────────────────────────

  const handleShellIt = async () => {
    if (!recordedBlob) return;
    const clipTitle = title.trim() || (selectedSong ? `Shell It — ${selectedSong.name}` : 'Shell It');
    setPhase('uploading');
    setUploadProgress(0);
    try {
      const mimeType = recordedBlob.type || 'video/webm';
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const file = new File([recordedBlob], `shell-it-${Date.now()}.${ext}`, { type: mimeType });

      const presigned = await uploadService.presignShortClip(file.name, mimeType);
      await uploadService.uploadToS3(presigned.uploadUrl, file, setUploadProgress);

      await videoService.createShortClip({
        title: clipTitle,
        videoUrl: presigned.key,
        duration: recordSeconds,
        songId: selectedSong?._id,
      });

      toast.success('Shelled! 🎵');
      setPhase('done');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
      setPhase('preview');
    }
  };

  const handleAgain = () => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setRecordSeconds(0);
    setUploadProgress(0);
    setTitle('');
    setShowTitleInput(false);
    setPhase('idle');
  };

  const handleDelete = () => {
    handleAgain();
    toast('Clip deleted');
  };

  // ── Idle & recording screen ───────────────────────────────────────────────

  if (phase === 'done') {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-8 px-8">
        <div className="w-24 h-24 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center">
          <Check className="text-emerald-400" size={40} />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Shelled! 🎵</h2>
          <p className="text-zinc-400 text-sm">Your clip is live in Pull Up for fans to discover.</p>
        </div>
        <button
          onClick={handleAgain}
          className="h-14 px-10 bg-white text-black rounded-2xl text-sm font-bold uppercase tracking-widest hover:scale-[1.02] transition-all"
        >
          Shell Another
        </button>
      </div>
    );
  }

  if (phase === 'preview' || phase === 'uploading') {
    const isUploading = phase === 'uploading';
    return (
      <div className="fixed inset-0 bg-black flex flex-col">
        {/* Preview video */}
        <div className="flex-1 relative overflow-hidden">
          <video
            ref={previewVideoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          {/* Filter badge */}
          {selectedFilter !== 'natural' && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur rounded-full text-xs font-bold text-white">
              {FILTERS.find(f => f.id === selectedFilter)?.label}
            </div>
          )}
          {/* Song badge */}
          {selectedSong && (
            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur rounded-full">
              <Music2 size={12} className="text-emerald-400" />
              <span className="text-xs font-bold text-white truncate max-w-[120px]">{selectedSong.name}</span>
            </div>
          )}
          {/* Duration */}
          <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 backdrop-blur rounded-full text-xs font-bold text-white">
            {recordSeconds}s
          </div>
        </div>

        {/* Caption input */}
        <AnimatePresence>
          {showTitleInput && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="bg-zinc-950 border-t border-white/10 px-6 py-4"
            >
              <input
                autoFocus
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Add a caption…"
                maxLength={100}
                className="w-full bg-transparent text-white text-sm font-medium focus:outline-none placeholder-zinc-600"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload progress */}
        {isUploading && (
          <div className="bg-zinc-950 border-t border-white/10 px-6 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-400">Uploading…</span>
              <span className="text-xs font-bold text-emerald-400">{uploadProgress}%</span>
            </div>
            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}

        {/* Action bar */}
        <div className="bg-zinc-950 border-t border-white/10 px-6 py-5 flex items-center gap-4">
          <button
            onClick={handleDelete}
            disabled={isUploading}
            className="w-14 h-14 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center disabled:opacity-40"
          >
            <Trash2 size={20} className="text-rose-400" />
          </button>
          <button
            onClick={handleAgain}
            disabled={isUploading}
            className="w-14 h-14 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center disabled:opacity-40"
          >
            <RefreshCw size={20} className="text-zinc-300" />
          </button>
          <button
            onClick={() => setShowTitleInput(s => !s)}
            disabled={isUploading}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all disabled:opacity-40 ${showTitleInput ? 'bg-white text-black border-white' : 'bg-zinc-900 border-white/10 text-zinc-300'}`}
          >
            <span className="text-xs font-bold">Aa</span>
          </button>
          <button
            onClick={handleShellIt}
            disabled={isUploading}
            className="flex-1 h-14 bg-white text-black rounded-2xl text-sm font-bold uppercase tracking-widest hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isUploading
              ? <><Loader2 size={18} className="animate-spin" /> Uploading…</>
              : <><Upload size={18} /> Shell It</>
            }
          </button>
        </div>
      </div>
    );
  }

  // Idle + recording
  const recordProgress = (recordSeconds / MAX_SECONDS) * 100;

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Camera view */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          autoPlay
          style={{ filter: currentFilterCss, transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Camera error overlay */}
        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 px-8 text-center">
            <p className="text-white font-medium text-sm">{cameraError}</p>
          </div>
        )}

        {/* Recording duration badge */}
        {phase === 'recording' && (
          <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 bg-black/60 backdrop-blur rounded-full">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-white text-xs font-bold tabular-nums">{recordSeconds}s / {MAX_SECONDS}s</span>
          </div>
        )}

        {/* Top controls */}
        <div className="absolute top-5 right-4 flex flex-col gap-3">
          <button
            onClick={flipCamera}
            disabled={phase === 'recording'}
            className="w-11 h-11 bg-black/50 backdrop-blur rounded-2xl flex items-center justify-center border border-white/20 disabled:opacity-40"
          >
            <RotateCcw size={18} className="text-white" />
          </button>
          <button
            onClick={() => setShowSongPicker(true)}
            disabled={phase === 'recording'}
            className={`w-11 h-11 backdrop-blur rounded-2xl flex items-center justify-center border transition-all disabled:opacity-40 ${selectedSong ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-black/50 border-white/20'}`}
          >
            <Music2 size={18} className={selectedSong ? 'text-emerald-400' : 'text-white'} />
          </button>
        </div>

        {/* Song playing indicator */}
        {selectedSong && (
          <div className="absolute top-5 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur rounded-full max-w-[180px]">
            <Music2 size={12} className="text-emerald-400 flex-shrink-0" />
            <span className="text-xs font-bold text-white truncate">{selectedSong.name}</span>
          </div>
        )}
      </div>

      {/* Filter strip */}
      <div className="bg-black/60 backdrop-blur-sm border-t border-white/5 py-3">
        <div className="flex gap-3 overflow-x-auto px-4 scrollbar-none">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className="flex-none flex flex-col items-center gap-1.5"
            >
              <div
                className={`w-11 h-11 rounded-2xl border-2 transition-all ${selectedFilter === f.id ? 'border-white scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: f.dot }}
              />
              <span className={`text-[9px] font-bold uppercase tracking-widest ${selectedFilter === f.id ? 'text-white' : 'text-zinc-600'}`}>
                {f.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Record button */}
      <div className="bg-black py-8 flex items-center justify-center">
        <button
          onPointerDown={startRecording}
          onPointerUp={stopRecording}
          onPointerLeave={stopRecording}
          className="relative w-24 h-24 flex items-center justify-center"
        >
          {phase === 'recording' && <RecordRing progress={recordProgress} />}
          <div className={`rounded-full transition-all duration-150 ${
            phase === 'recording'
              ? 'w-14 h-14 bg-rose-500 rounded-[14px]'
              : 'w-16 h-16 bg-white border-4 border-zinc-700'
          }`} />
        </button>
      </div>

      {/* Song picker */}
      <AnimatePresence>
        {showSongPicker && (
          <>
            <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setShowSongPicker(false)} />
            <SongPicker
              selected={selectedSong}
              onSelect={setSelectedSong}
              onClose={() => setShowSongPicker(false)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
