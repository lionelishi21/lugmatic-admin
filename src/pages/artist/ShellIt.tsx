import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  RotateCcw, Music2, X, Check, Upload, RefreshCw, Trash2,
  Loader2, Search, MicOff, Eye, Heart, Film, Play, Video,
  Camera, Disc,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import uploadService from '../../services/uploadService';
import videoService, { ShortClip } from '../../services/videoService';
import apiService from '../../services/api';
import rhythmService, { Rhythm } from '../../services/rhythmService';

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_SECONDS = 60;

const FILTERS = [
  { id: 'natural', label: 'Natural', css: 'none',                                          dot: '#27272a' },
  { id: 'vivid',   label: 'Vivid',   css: 'saturate(160%) contrast(115%)',                 dot: '#f43f5e' },
  { id: 'warm',    label: 'Warm',    css: 'sepia(40%) saturate(140%) brightness(108%)',    dot: '#f97316' },
  { id: 'cool',    label: 'Cool',    css: 'hue-rotate(20deg) saturate(140%)',              dot: '#06b6d4' },
  { id: 'dark',    label: 'Dark',    css: 'brightness(70%) contrast(130%)',                dot: '#3f3f46' },
  { id: 'glam',    label: 'Glam',    css: 'saturate(220%) contrast(110%)',                 dot: '#a855f7' },
  { id: 'bw',      label: 'B&W',     css: 'grayscale(100%) contrast(110%)',                dot: '#a1a1aa' },
  { id: 'retro',   label: 'Retro',   css: 'sepia(70%) contrast(115%) brightness(92%)',     dot: '#92400e' },
];

// Strip codec params so S3 presign validation accepts the type (backend allows video/webm not video/webm;codecs=…)
function baseType(mimeType: string) {
  return mimeType.split(';')[0].trim();
}

function getSupportedMimeType(): string {
  const candidates = ['video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
  return candidates.find(t => MediaRecorder.isTypeSupported(t)) ?? 'video/webm';
}

// Song interface kept for legacy reference only — ShellIt now uses Rhythm


// ─── Circular progress ring ───────────────────────────────────────────────────

function RecordRing({ progress }: { progress: number }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
      <circle cx="50" cy="50" r={r} fill="none" stroke="white" strokeWidth="3"
        strokeDasharray={c} strokeDashoffset={c - (progress / 100) * c}
        strokeLinecap="round" className="transition-all duration-100" />
    </svg>
  );
}

// ─── Rhythm picker sheet ──────────────────────────────────────────────────────

function RhythmPicker({ selected, onSelect, onClose }: {
  selected: Rhythm | null;
  onSelect: (r: Rhythm | null) => void;
  onClose: () => void;
}) {
  const [rhythms, setRhythms] = useState<Rhythm[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const previewRef = useRef<HTMLAudioElement | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await rhythmService.getRhythms();
        setRhythms(data);
      } catch { toast.error('Could not load rhythms'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const filtered = q
    ? rhythms.filter(r =>
        r.title.toLowerCase().includes(q.toLowerCase()) ||
        (r.genre || '').toLowerCase().includes(q.toLowerCase()))
    : rhythms;

  const togglePreview = (rhythm: Rhythm) => {
    if (previewId === rhythm._id) {
      previewRef.current?.pause();
      setPreviewId(null);
    } else {
      previewRef.current?.pause();
      if (rhythm.audioUrl) {
        const audio = new Audio(rhythm.audioUrl);
        audio.play().catch(() => {});
        previewRef.current = audio;
        setPreviewId(rhythm._id);
        audio.onended = () => setPreviewId(null);
      }
    }
  };

  useEffect(() => () => previewRef.current?.pause(), []);

  return (
    <motion.div
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="absolute inset-x-0 bottom-0 z-50 bg-zinc-950 border-t border-white/10 rounded-t-3xl overflow-hidden"
      style={{ maxHeight: '70%' }}
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
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search rhythms…"
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none" />
        </div>
      </div>
      <div className="overflow-y-auto pb-6" style={{ maxHeight: 'calc(70vh - 130px)' }}>
        <button onClick={() => { onSelect(null); onClose(); }}
          className={`w-full flex items-center gap-4 px-6 py-3 hover:bg-white/5 transition-colors ${!selected ? 'bg-white/5' : ''}`}
        >
          <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
            <MicOff size={16} className="text-zinc-500" />
          </div>
          <span className="text-sm font-medium text-zinc-400">No music</span>
          {!selected && <Check size={16} className="text-emerald-500 ml-auto" />}
        </button>
        {loading
          ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-zinc-500" size={24} /></div>
          : filtered.map(rhythm => (
            <button key={rhythm._id} onClick={() => { onSelect(rhythm); onClose(); }}
              className={`w-full flex items-center gap-4 px-6 py-3 hover:bg-white/5 transition-colors ${selected?._id === rhythm._id ? 'bg-white/5' : ''}`}
            >
              {rhythm.coverArtUrl
                ? <img src={rhythm.coverArtUrl} alt={rhythm.title} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                : <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0"><Music2 size={16} className="text-zinc-500" /></div>
              }
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-bold text-white truncate">{rhythm.title}</p>
                {rhythm.genre
                  ? <span className="text-xs text-zinc-500">{rhythm.genre}</span>
                  : null
                }
              </div>
              {selected?._id === rhythm._id
                ? <Check size={16} className="text-emerald-500 flex-shrink-0" />
                : rhythm.audioUrl && (
                  <button onClick={e => { e.stopPropagation(); togglePreview(rhythm); }}
                    className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0"
                  >
                    {previewId === rhythm._id
                      ? <div className="w-2 h-2 bg-white rounded-sm" />
                      : <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-l-[9px] border-transparent border-l-white ml-0.5" />
                    }
                  </button>
                )
              }
            </button>
          ))
        }
      </div>
    </motion.div>
  );
}

// ─── My Shell Its grid ────────────────────────────────────────────────────────

function MyShellIts({ artistId, onRecord }: { artistId: string; onRecord: () => void }) {
  const [clips, setClips] = useState<ShortClip[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!artistId) return;
    setLoading(true);
    try { setClips(await videoService.getMyShorts(artistId)); }
    catch { toast.error('Could not load your clips'); }
    finally { setLoading(false); }
  }, [artistId]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (clip: ShortClip) => {
    if (!window.confirm(`Delete "${clip.title}"?`)) return;
    setDeleting(clip._id);
    try {
      await videoService.deleteVideo(clip._id);
      setClips(prev => prev.filter(c => c._id !== clip._id));
      toast.success('Clip deleted');
    } catch { toast.error('Could not delete clip'); }
    finally { setDeleting(null); }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-500" size={28} /></div>;

  if (clips.length === 0) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
      <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-white/10 flex items-center justify-center">
        <Video size={32} className="text-zinc-600" />
      </div>
      <div>
        <p className="text-white font-bold text-base mb-1">No Shell Its yet</p>
        <p className="text-zinc-500 text-sm">Hold the record button to create your first clip</p>
      </div>
      <button onClick={onRecord} className="mt-2 h-12 px-8 bg-white text-black rounded-2xl text-sm font-bold uppercase tracking-widest">
        Record Now
      </button>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-zinc-400 text-sm font-medium">{clips.length} clip{clips.length !== 1 ? 's' : ''}</p>
        <button onClick={load} className="text-zinc-500 hover:text-white transition-colors"><RefreshCw size={16} /></button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {clips.map(clip => (
          <div key={clip._id} className="relative rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 aspect-[9/16] group">
            {clip.videoUrl
              ? <video src={clip.videoUrl} className="w-full h-full object-cover" muted preload="metadata" />
              : <div className="w-full h-full bg-gradient-to-b from-zinc-800 to-zinc-950 flex items-center justify-center"><Film size={28} className="text-zinc-600" /></div>
            }
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 bg-black/60 backdrop-blur rounded-full flex items-center justify-center">
                <Play size={20} className="text-white fill-white ml-0.5" />
              </div>
            </div>
            {clip.song && (
              <div className="absolute top-2 left-2 right-2 flex items-center gap-1.5 bg-black/60 backdrop-blur rounded-full px-2 py-1">
                <Music2 size={10} className="text-emerald-400 flex-shrink-0" />
                <span className="text-[9px] font-bold text-white truncate">{clip.song.name}</span>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-2.5">
              <p className="text-white text-xs font-bold truncate mb-1.5">{clip.title}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-400">
                  <span className="flex items-center gap-0.5 text-[10px]"><Eye size={10} />{clip.views.toLocaleString()}</span>
                  <span className="flex items-center gap-0.5 text-[10px]"><Heart size={10} />{clip.likesCount.toLocaleString()}</span>
                </div>
                <button onClick={() => handleDelete(clip)} disabled={deleting === clip._id}
                  className="w-7 h-7 bg-black/50 rounded-full flex items-center justify-center hover:bg-rose-500/30 transition-colors disabled:opacity-40">
                  {deleting === clip._id
                    ? <Loader2 size={12} className="animate-spin text-zinc-400" />
                    : <Trash2 size={12} className="text-zinc-400 hover:text-rose-400" />
                  }
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Phase = 'splash' | 'idle' | 'recording' | 'preview' | 'uploading' | 'done';
type View  = 'record' | 'my-clips';

export default function ShellIt() {
  const artistId = useSelector((state: RootState) => state.auth.user?.artistId ?? '');

  const [view,             setView]             = useState<View>('record');
  const [phase,            setPhase]            = useState<Phase>('splash');
  const [facingMode,       setFacingMode]       = useState<'user' | 'environment'>('user');
  const [selectedFilter,   setSelectedFilter]   = useState('natural');
  const [selectedRhythm,   setSelectedRhythm]   = useState<Rhythm | null>(null);
  const [showSongPicker,   setShowSongPicker]   = useState(false);
  const [cameraError,      setCameraError]      = useState('');
  const [recordedBlob,     setRecordedBlob]     = useState<Blob | null>(null);
  const [recordedUrl,      setRecordedUrl]      = useState<string | null>(null);
  const [recordSeconds,    setRecordSeconds]    = useState(0);
  const [uploadProgress,   setUploadProgress]   = useState(0);
  const [title,            setTitle]            = useState('');
  const [showTitleInput,   setShowTitleInput]   = useState(false);

  const videoRef         = useRef<HTMLVideoElement>(null);
  const previewVideoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef        = useRef<HTMLCanvasElement>(null);
  const streamRef        = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef        = useRef<Blob[]>([]);
  const animFrameRef     = useRef<number>(0);
  const timerRef         = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef         = useRef<HTMLAudioElement | null>(null);

  const currentFilter = FILTERS.find(f => f.id === selectedFilter) ?? FILTERS[0];

  // Stop all media on unmount
  useEffect(() => () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    audioRef.current?.pause();
  }, []);

  // ── Auto-play selected rhythm outside recording ────────────────────────────

  useEffect(() => {
    if (!selectedRhythm?.audioUrl || phase === 'recording') return;
    const audio = new Audio(selectedRhythm.audioUrl);
    audio.loop = true;
    audio.volume = 0.35;
    audio.play().catch(() => {});
    audioRef.current = audio;
    return () => { audio.pause(); if (audioRef.current === audio) audioRef.current = null; };
  }, [selectedRhythm]);

  // ── Camera init ────────────────────────────────────────────────────────────

  const initCamera = useCallback(async (facing: 'user' | 'environment') => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
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
        ? 'Camera permission denied. Enable it in browser settings.'
        : 'Could not access camera or microphone.');
      setPhase('splash');
    }
  }, []);

  const startSession = async () => {
    setPhase('idle');
    await initCamera(facingMode);
  };

  const flipCamera = async () => {
    if (phase === 'recording') return;
    const next = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);
    await initCamera(next);
  };

  // Stop camera when navigating to my-clips, restart on return
  useEffect(() => {
    if (view === 'my-clips') {
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setPhase('splash');
    }
  }, [view]);

  // ── Recording ──────────────────────────────────────────────────────────────

  const startRecording = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !streamRef.current || phase !== 'idle') return;

    const track = streamRef.current.getVideoTracks()[0];
    const s = track.getSettings();
    const w = s.width  || video.videoWidth  || 720;
    const h = s.height || video.videoHeight || 1280;
    canvas.width  = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d')!;
    const isFront = facingMode === 'user';
    const filterCss = currentFilter.css;

    const drawFrame = () => {
      ctx.save();
      if (filterCss !== 'none') ctx.filter = filterCss;
      if (isFront) {
        // Mirror front camera so recorded video matches preview
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, w, h);
      ctx.restore();
      animFrameRef.current = requestAnimationFrame(drawFrame);
    };
    drawFrame();

    const canvasStream = canvas.captureStream(30);
    streamRef.current.getAudioTracks().forEach(t => canvasStream.addTrack(t));

    const mimeType = getSupportedMimeType();
    const recorder = new MediaRecorder(canvasStream, mimeType ? { mimeType } : {});
    chunksRef.current = [];
    recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      cancelAnimationFrame(animFrameRef.current);
      const blob = new Blob(chunksRef.current, { type: baseType(mimeType) || 'video/webm' });
      setRecordedBlob(blob);
      setRecordedUrl(URL.createObjectURL(blob));
      if (timerRef.current) clearInterval(timerRef.current);
      setPhase('preview');
    };

    recorder.start(250);
    mediaRecorderRef.current = recorder;

    // Swap background audio from preview volume to full
    if (selectedRhythm?.audioUrl) {
      audioRef.current?.pause();
      const audio = new Audio(selectedRhythm.audioUrl);
      audio.loop = true;
      audio.volume = 0.5;
      audio.play().catch(() => {});
      audioRef.current = audio;
    }

    setRecordSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordSeconds(s => {
        const next = s + 1;
        if (next >= MAX_SECONDS) { stopRecordingImmediate(); return MAX_SECONDS; }
        return next;
      });
    }, 1000);

    setPhase('recording');
  }, [phase, currentFilter, facingMode, selectedRhythm]);

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

  // ── Upload ─────────────────────────────────────────────────────────────────

  const handleShellIt = async () => {
    if (!recordedBlob) return;
    const clipTitle = title.trim() || (selectedRhythm ? `Shell It — ${selectedRhythm.title}` : 'Shell It');
    setPhase('uploading');
    setUploadProgress(0);
    try {
      const rawMime = recordedBlob.type || 'video/webm';
      const mime    = baseType(rawMime);               // strip codecs for backend
      const ext     = mime.includes('mp4') ? 'mp4' : 'webm';
      const file    = new File([recordedBlob], `shell-it-${Date.now()}.${ext}`, { type: mime });

      const presigned = await uploadService.presignShortClip(file.name, mime);
      await uploadService.uploadToS3(presigned.uploadUrl, file, setUploadProgress);
      await videoService.createShortClip({ title: clipTitle, videoUrl: presigned.key, duration: recordSeconds, songId: selectedRhythm?._id });

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
    initCamera(facingMode);
  };

  // ── Layout wrapper (breaks out of Layout padding) ─────────────────────────
  // -mx-8 -mt-8 lg:-mx-12 lg:-mt-12 removes the Layout p-8/p-12 so we get full bleed

  const outerCls = 'flex flex-col -mx-8 -mt-8 lg:-mx-12 lg:-mt-12 bg-zinc-950 overflow-hidden';
  const outerStyle = { height: 'calc(100vh - 80px)' }; // 80px = header h-20

  // ── Tabs ──────────────────────────────────────────────────────────────────

  const Tabs = () => (
    <div className="flex-none flex gap-1 px-4 pt-4 pb-2 bg-zinc-950 border-b border-white/5">
      {(['record', 'my-clips'] as View[]).map(v => (
        <button key={v} onClick={() => setView(v)}
          className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
            view === v ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          {v === 'record' ? 'Record' : 'My Shell Its'}
        </button>
      ))}
    </div>
  );

  // ── Done screen ────────────────────────────────────────────────────────────

  if (phase === 'done') {
    return (
      <div className={`${outerCls} items-center justify-center gap-8 px-8`} style={outerStyle}>
        <div className="w-24 h-24 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center">
          <Check className="text-emerald-400" size={40} />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Shelled! 🎵</h2>
          <p className="text-zinc-400 text-sm">Your clip is live in Pull Up for fans to discover.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleAgain}
            className="h-14 px-8 bg-zinc-900 border border-white/10 text-white rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all">
            Shell Another
          </button>
          <button onClick={() => { handleAgain(); setView('my-clips'); }}
            className="h-14 px-8 bg-white text-black rounded-2xl text-sm font-bold uppercase tracking-widest hover:scale-[1.02] transition-all">
            View My Clips
          </button>
        </div>
      </div>
    );
  }

  // ── Preview / uploading ────────────────────────────────────────────────────

  if (phase === 'preview' || phase === 'uploading') {
    const isUploading = phase === 'uploading';
    return (
      <div className={`${outerCls}`} style={outerStyle}>
        {/* Preview video */}
        <div className="flex-1 relative overflow-hidden bg-black">
          <video ref={previewVideoRef} className="w-full h-full object-contain" playsInline muted />
          {selectedFilter !== 'natural' && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur rounded-full text-xs font-bold text-white">
              {currentFilter.label}
            </div>
          )}
          {selectedRhythm && (
            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur rounded-full">
              <Music2 size={12} className="text-emerald-400" />
              <span className="text-xs font-bold text-white truncate max-w-[120px]">{selectedRhythm.title}</span>
            </div>
          )}
          <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 backdrop-blur rounded-full text-xs font-bold text-white">
            {recordSeconds}s
          </div>
        </div>

        {/* Caption input */}
        <AnimatePresence>
          {showTitleInput && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="flex-none bg-zinc-950 border-t border-white/10 px-6 py-4">
              <input autoFocus value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Add a caption…" maxLength={100}
                className="w-full bg-transparent text-white text-sm font-medium focus:outline-none placeholder-zinc-600" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload progress */}
        {isUploading && (
          <div className="flex-none bg-zinc-950 border-t border-white/10 px-6 py-3">
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
        <div className="flex-none bg-zinc-950 border-t border-white/10 px-6 py-5 flex items-center gap-3">
          <button onClick={handleAgain} disabled={isUploading}
            className="w-14 h-14 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center disabled:opacity-40">
            <Trash2 size={20} className="text-rose-400" />
          </button>
          <button onClick={handleAgain} disabled={isUploading}
            className="w-14 h-14 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center disabled:opacity-40">
            <RefreshCw size={20} className="text-zinc-300" />
          </button>
          <button onClick={() => setShowTitleInput(s => !s)} disabled={isUploading}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all disabled:opacity-40 ${showTitleInput ? 'bg-white text-black border-white' : 'bg-zinc-900 border-white/10 text-zinc-300'}`}>
            <span className="text-xs font-bold">Aa</span>
          </button>
          <button onClick={handleShellIt} disabled={isUploading}
            className="flex-1 h-14 bg-white text-black rounded-2xl text-sm font-bold uppercase tracking-widest hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center gap-3">
            {isUploading
              ? <><Loader2 size={18} className="animate-spin" /> Uploading…</>
              : <><Upload size={18} /> Shell It</>
            }
          </button>
        </div>
      </div>
    );
  }

  // ── My clips view ──────────────────────────────────────────────────────────

  if (view === 'my-clips') {
    return (
      <div className={`${outerCls}`} style={outerStyle}>
        <Tabs />
        <MyShellIts artistId={artistId} onRecord={() => setView('record')} />
      </div>
    );
  }

  // ── Splash (no camera yet) ─────────────────────────────────────────────────

  if (phase === 'splash') {
    return (
      <div className={`${outerCls}`} style={outerStyle}>
        <Tabs />
        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-8 text-center">
          {/* Hero */}
          <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center">
            <Disc size={40} className="text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-3">Shell It</h2>
            <p className="text-zinc-400 text-sm max-w-xs">
              Record a short video with filters and a backing rhythm — drop it in Pull Up for your fans.
            </p>
          </div>

          {cameraError && (
            <div className="w-full max-w-sm bg-rose-500/10 border border-rose-500/20 rounded-2xl px-5 py-4">
              <p className="text-rose-400 text-sm text-center">{cameraError}</p>
            </div>
          )}

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button onClick={startSession}
              className="h-14 bg-white text-black rounded-2xl text-sm font-bold uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
              <Camera size={18} /> Start Recording
            </button>
            <button onClick={() => setView('my-clips')}
              className="h-14 bg-zinc-900 border border-white/10 text-white rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-3">
              <Video size={18} /> View My Clips
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Idle / recording (camera active) ──────────────────────────────────────

  const recordProgress = (recordSeconds / MAX_SECONDS) * 100;

  return (
    <div className={`${outerCls}`} style={outerStyle}>
      {/* Tabs (only in idle, hidden during recording) */}
      {phase === 'idle' && <Tabs />}

      {/* ── Camera area ── */}
      <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
        {/* Camera feed */}
        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay
          style={{
            filter:    currentFilter.css !== 'none' ? currentFilter.css : undefined,
            transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
          }}
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Camera error */}
        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 px-8 text-center">
            <p className="text-white font-medium text-sm">{cameraError}</p>
          </div>
        )}

        {/* Recording timer badge */}
        {phase === 'recording' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 bg-black/70 backdrop-blur rounded-full z-10">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-white text-xs font-bold tabular-nums">{recordSeconds}s / {MAX_SECONDS}s</span>
          </div>
        )}

        {/* Top-right: flip + rhythm */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <button onClick={flipCamera} disabled={phase === 'recording'}
            className="w-11 h-11 bg-black/60 backdrop-blur rounded-2xl flex items-center justify-center border border-white/10 disabled:opacity-40">
            <RotateCcw size={18} className="text-white" />
          </button>
          <button onClick={() => setShowSongPicker(true)} disabled={phase === 'recording'}
            className={`w-11 h-11 backdrop-blur rounded-2xl flex items-center justify-center border transition-all disabled:opacity-40 ${selectedRhythm ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-black/60 border-white/10'}`}>
            <Music2 size={18} className={selectedRhythm ? 'text-emerald-400' : 'text-white'} />
          </button>
        </div>

        {/* Selected rhythm pill — top left */}
        {selectedRhythm && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 max-w-[55%]">
            {selectedRhythm.coverArtUrl && (
              <img src={selectedRhythm.coverArtUrl} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
            )}
            <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur rounded-full px-3 py-1.5 min-w-0">
              <Music2 size={11} className="text-emerald-400 flex-shrink-0 animate-pulse" />
              <span className="text-xs font-bold text-white truncate">{selectedRhythm.title}</span>
              <button onClick={() => setSelectedRhythm(null)}
                className="ml-1 flex-shrink-0 w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
                <X size={10} className="text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Progress bar at top */}
        {phase === 'recording' && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-10">
            <div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${recordProgress}%` }} />
          </div>
        )}
      </div>

      {/* ── Filter strip ── */}
      <div className="flex-none bg-black border-t border-white/5 py-2">
        <div className="flex gap-2.5 overflow-x-auto px-4 scrollbar-none py-1">
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setSelectedFilter(f.id)}
              className="flex-none flex flex-col items-center gap-1.5 transition-all">
              <div
                className={`w-10 h-10 rounded-xl border-2 transition-all ${selectedFilter === f.id ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60'}`}
                style={{ backgroundColor: f.dot }}
              />
              <span className={`text-[9px] font-bold uppercase tracking-wider transition-all ${selectedFilter === f.id ? 'text-white' : 'text-zinc-600'}`}>
                {f.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Record button ── */}
      <div className="flex-none bg-black py-6 flex items-center justify-center border-t border-white/5">
        <button
          onPointerDown={startRecording}
          onPointerUp={stopRecording}
          onPointerLeave={stopRecording}
          className="relative w-20 h-20 flex items-center justify-center select-none touch-none"
        >
          {phase === 'recording' && <RecordRing progress={recordProgress} />}
          <div className={`rounded-full transition-all duration-150 ${
            phase === 'recording'
              ? 'w-12 h-12 bg-rose-500 rounded-[12px]'
              : 'w-14 h-14 bg-white border-[3px] border-zinc-600 hover:scale-105'
          }`} />
        </button>
      </div>

      {/* Song picker — rendered inside the camera area as an absolute overlay */}
      <AnimatePresence>
        {showSongPicker && (
          <>
            <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setShowSongPicker(false)} />
            <div className="fixed inset-x-0 bottom-0 z-50" style={{ maxHeight: '70vh' }}>
              <RhythmPicker selected={selectedRhythm} onSelect={setSelectedRhythm} onClose={() => setShowSongPicker(false)} />
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
