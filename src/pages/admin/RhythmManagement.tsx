import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Trash2, Music2, Search, Play, Square, Loader2,
  X, Upload, Clock, Activity, CheckCircle2,
} from 'lucide-react';
import rhythmService, { Rhythm } from '../../services/rhythmService';
import uploadService from '../../services/uploadService';
import apiService from '../../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getAudioDuration(file: File): Promise<number> {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(Math.round(audio.duration)); };
    audio.onerror = () => { URL.revokeObjectURL(url); resolve(0); };
  });
}

// ─── Add/Edit Modal ───────────────────────────────────────────────────────────

interface AddModalProps {
  onClose: () => void;
  onCreated: () => void;
}

function AddRhythmModal({ onClose, onCreated }: AddModalProps) {
  const [title, setTitle]             = useState('');
  const [genre, setGenre]             = useState('');
  const [bpm, setBpm]                 = useState('');
  const [duration, setDuration]       = useState(0);
  const [audioFile, setAudioFile]     = useState<File | null>(null);
  const [coverFile, setCoverFile]     = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [uploading, setUploading]     = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioInputRef  = useRef<HTMLInputElement>(null);
  const coverInputRef  = useRef<HTMLInputElement>(null);

  const handleAudioPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAudioFile(f);
    const d = await getAudioDuration(f);
    setDuration(d);
  };

  const handleCoverPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (!audioFile)    { toast.error('Audio file is required'); return; }

    setUploading(true);
    try {
      // 1. Upload audio
      const audioPresign = await apiService.post<any>('/upload/presign/rhythm-audio', {
        filename: audioFile.name,
        contentType: audioFile.type || 'audio/mpeg',
      });
      const audioData = audioPresign.data?.data;
      await uploadService.uploadToS3(audioData.uploadUrl, audioFile, setAudioProgress);

      // 2. Upload cover art (optional)
      let coverKey = '';
      if (coverFile) {
        const coverPresign = await apiService.post<any>('/upload/presign/cover-art', {
          filename: coverFile.name,
          contentType: coverFile.type || 'image/jpeg',
        });
        const coverData = coverPresign.data?.data;
        await uploadService.uploadToS3(coverData.uploadUrl, coverFile);
        coverKey = coverData.key;
      }

      // 3. Create rhythm record
      await rhythmService.createRhythm({
        title:     title.trim(),
        genre:     genre.trim(),
        bpm:       bpm ? Number(bpm) : undefined,
        audioFile: audioData.key,
        coverArt:  coverKey,
        duration,
      });

      toast.success('Rhythm created!');
      onCreated();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create rhythm');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="w-full max-w-lg bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-black/5 dark:border-white/5">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Add Rhythm</h2>
          <button onClick={onClose} disabled={uploading}
            className="w-9 h-9 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white transition-colors disabled:opacity-40">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2">Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required
              className="w-full h-12 bg-zinc-900 border border-black/10 dark:border-white/10 rounded-2xl px-4 text-zinc-900 dark:text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500/40 transition-colors"
              placeholder="e.g. Roots & Culture Riddim" />
          </div>

          {/* Genre + BPM */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2">Genre</label>
              <input value={genre} onChange={e => setGenre(e.target.value)}
                className="w-full h-12 bg-zinc-900 border border-black/10 dark:border-white/10 rounded-2xl px-4 text-zinc-900 dark:text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500/40 transition-colors"
                placeholder="e.g. Dancehall" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2">BPM</label>
              <input value={bpm} onChange={e => setBpm(e.target.value)} type="number" min="1" max="300"
                className="w-full h-12 bg-zinc-900 border border-black/10 dark:border-white/10 rounded-2xl px-4 text-zinc-900 dark:text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500/40 transition-colors"
                placeholder="e.g. 90" />
            </div>
          </div>

          {/* Audio file */}
          <div>
            <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2">Audio File * (MP3 / WAV / M4A)</label>
            <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={handleAudioPick} />
            <button type="button" onClick={() => audioInputRef.current?.click()}
              className={`w-full h-14 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 text-sm font-medium transition-all ${
                audioFile ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400' : 'border-white/10 text-zinc-500 hover:border-white/20 hover:text-zinc-300'
              }`}>
              {audioFile ? (
                <><CheckCircle2 size={16} /> {audioFile.name} {duration > 0 && `(${formatDuration(duration)})`}</>
              ) : (
                <><Upload size={16} /> Choose audio file</>
              )}
            </button>
          </div>

          {/* Cover art */}
          <div>
            <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2">Cover Art (optional)</label>
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverPick} />
            <div className="flex items-center gap-4">
              {coverPreview
                ? <img src={coverPreview} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-black/10 dark:border-white/10" />
                : <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-black/10 dark:border-white/10 flex items-center justify-center flex-shrink-0">
                    <Music2 size={20} className="text-zinc-600" />
                  </div>
              }
              <button type="button" onClick={() => coverInputRef.current?.click()}
                className="flex-1 h-12 rounded-2xl border border-black/10 dark:border-white/10 bg-zinc-900 text-zinc-600 dark:text-zinc-400 text-sm font-medium hover:text-zinc-900 dark:text-white transition-colors flex items-center justify-center gap-2">
                <Upload size={14} /> {coverFile ? 'Change image' : 'Upload cover art'}
              </button>
            </div>
          </div>

          {/* Upload progress */}
          {uploading && audioProgress > 0 && audioProgress < 100 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-zinc-600 dark:text-zinc-400">Uploading audio…</span>
                <span className="text-xs font-bold text-emerald-400">{audioProgress}%</span>
              </div>
              <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${audioProgress}%` }} />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={uploading}
              className="flex-1 h-12 bg-zinc-900 border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white rounded-2xl text-sm font-bold hover:bg-zinc-800 transition-all disabled:opacity-40">
              Cancel
            </button>
            <button type="submit" disabled={uploading || !audioFile || !title.trim()}
              className="flex-1 h-12 bg-white text-black rounded-2xl text-sm font-bold hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {uploading ? <><Loader2 size={16} className="animate-spin" /> Uploading…</> : 'Add Rhythm'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const RhythmManagement: React.FC = () => {
  const [rhythms, setRhythms]           = useState<Rhythm[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [playingId, setPlayingId]       = useState<string | null>(null);
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await rhythmService.getRhythms();
      setRhythms(data);
    } catch {
      toast.error('Failed to load rhythms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => () => { audioRef.current?.pause(); }, []);

  const filtered = search.trim()
    ? rhythms.filter(r =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        (r.genre || '').toLowerCase().includes(search.toLowerCase()))
    : rhythms;

  const togglePlay = (rhythm: Rhythm) => {
    if (playingId === rhythm._id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      audioRef.current?.pause();
      const audio = new Audio(rhythm.audioUrl);
      audio.play().catch(() => {});
      audio.onended = () => setPlayingId(null);
      audioRef.current = audio;
      setPlayingId(rhythm._id);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deactivate this rhythm? It will no longer be shown to artists.')) return;
    setDeletingId(id);
    try {
      await rhythmService.deleteRhythm(id);
      setRhythms(prev => prev.filter(r => r._id !== id));
      toast.success('Rhythm deactivated');
    } catch {
      toast.error('Failed to deactivate rhythm');
    } finally {
      setDeletingId(null);
    }
  };

  const stats = {
    total:    rhythms.length,
    genres:   new Set(rhythms.map(r => r.genre).filter(Boolean)).size,
    withBpm:  rhythms.filter(r => r.bpm).length,
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white leading-none">Rhythm Library</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 tracking-wider">{stats.total} Track{stats.total !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <p className="text-zinc-500 text-xs font-semibold ml-1">Upload backing tracks that artists pick when recording Shell It clips.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="h-16 px-10 bg-white text-black rounded-2xl text-[10px] font-bold hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-4 border border-black/10 dark:border-white/10"
        >
          <Plus size={18} />
          Add Rhythm
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Tracks',   value: stats.total,   icon: <Music2 size={18} /> },
          { label: 'Genres',         value: stats.genres,  icon: <Activity size={18} /> },
          { label: 'With BPM',       value: stats.withBpm, icon: <Clock size={18} /> },
        ].map(s => (
          <div key={s.label} className="bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-3xl p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{s.value}</p>
              <p className="text-[11px] text-zinc-500 font-semibold">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-2xl px-4 h-12 max-w-sm">
        <Search size={16} className="text-zinc-500 flex-shrink-0" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search rhythms…"
          className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-white placeholder-zinc-600 focus:outline-none" />
        {search && <button onClick={() => setSearch('')}><X size={14} className="text-zinc-500 hover:text-zinc-900 dark:text-white" /></button>}
      </div>

      {/* Table */}
      <div className="bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-zinc-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 bg-zinc-900 rounded-3xl flex items-center justify-center">
              <Music2 size={28} className="text-zinc-600" />
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 font-semibold">
              {search ? 'No rhythms match your search' : 'No rhythms yet — add one above'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {/* Header row */}
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center px-6 py-3">
              <span /> {/* cover */}
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Track</span>
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider w-20 text-center">BPM</span>
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider w-20 text-center">Duration</span>
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider w-16 text-center">Preview</span>
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider w-10 text-center">Del</span>
            </div>
            {filtered.map(rhythm => (
              <motion.div
                key={rhythm._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center px-6 py-4 hover:bg-white/[0.02] transition-colors"
              >
                {/* Cover art */}
                {rhythm.coverArtUrl
                  ? <img src={rhythm.coverArtUrl} alt={rhythm.title}
                      className="w-11 h-11 rounded-xl object-cover flex-shrink-0 border border-black/10 dark:border-white/10" />
                  : <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-black/5 dark:border-white/5 flex items-center justify-center flex-shrink-0">
                      <Music2 size={16} className="text-zinc-600" />
                    </div>
                }
                {/* Title + genre */}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{rhythm.title}</p>
                  {rhythm.genre && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-black/5 dark:border-white/5 mt-1">
                      {rhythm.genre}
                    </span>
                  )}
                </div>
                {/* BPM */}
                <span className="w-20 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                  {rhythm.bpm ? `${rhythm.bpm}` : '—'}
                </span>
                {/* Duration */}
                <span className="w-20 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                  {formatDuration(rhythm.duration)}
                </span>
                {/* Preview */}
                <div className="w-16 flex justify-center">
                  <button
                    onClick={() => togglePlay(rhythm)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                      playingId === rhythm._id
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                        : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {playingId === rhythm._id
                      ? <Square size={12} className="fill-current" />
                      : <Play  size={12} className="fill-current ml-0.5" />
                    }
                  </button>
                </div>
                {/* Delete */}
                <div className="w-10 flex justify-center">
                  <button
                    onClick={() => handleDelete(rhythm._id)}
                    disabled={deletingId === rhythm._id}
                    className="w-9 h-9 rounded-full bg-zinc-900 border border-black/10 dark:border-white/10 flex items-center justify-center text-zinc-500 hover:text-rose-400 hover:border-rose-500/20 transition-all disabled:opacity-40"
                  >
                    {deletingId === rhythm._id
                      ? <Loader2 size={12} className="animate-spin" />
                      : <Trash2 size={12} />
                    }
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddRhythmModal
            onClose={() => setShowAddModal(false)}
            onCreated={() => { setShowAddModal(false); load(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default RhythmManagement;
