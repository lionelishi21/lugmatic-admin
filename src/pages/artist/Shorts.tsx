import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Play,
  Heart,
  Eye,
  Trash2,
  Plus,
  X,
  AlertCircle,
  Film,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import videoService, { ShortClip } from '../../services/videoService';
import uploadService from '../../services/uploadService';

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200 MB
const ACCEPTED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export default function Shorts() {
  const [shorts, setShorts] = useState<ShortClip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadPhase, setUploadPhase] = useState<'idle' | 'presigning' | 'uploading' | 'saving' | 'done'>('idle');
  const [uploadError, setUploadError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const fetchShorts = async () => {
    try {
      const data = await videoService.getShorts(1, 24);
      setShorts(data);
    } catch {
      // silently fail — empty state shown
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShorts(); }, []);

  const handleFileSelect = (f: File) => {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      toast.error('Only MP4, WebM, or MOV files are supported');
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      toast.error('File must be under 200 MB');
      return;
    }
    setFile(f);
    setUploadError('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      toast.error('Add a title and select a video file');
      return;
    }
    setUploadError('');
    try {
      setUploadPhase('presigning');
      const presigned = await uploadService.presignShortClip(file.name, file.type);

      setUploadPhase('uploading');
      await uploadService.uploadToS3(presigned.uploadUrl, file, setUploadProgress);

      setUploadPhase('saving');
      await videoService.createShortClip({
        title: title.trim(),
        description: description.trim() || undefined,
        s3Key: presigned.key,
      });

      setUploadPhase('done');
      toast.success('Short uploaded!');
      setTimeout(() => {
        setShowUpload(false);
        resetUpload();
        fetchShorts();
      }, 1200);
    } catch (err: any) {
      setUploadError(err.response?.data?.message || err.message || 'Upload failed');
      setUploadPhase('idle');
    }
  };

  const resetUpload = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setUploadProgress(0);
    setUploadPhase('idle');
    setUploadError('');
  };

  const phaseLabel: Record<string, string> = {
    presigning: 'Preparing upload…',
    uploading: `Uploading… ${uploadProgress}%`,
    saving: 'Saving…',
    done: 'Done!',
  };

  const isBusy = uploadPhase !== 'idle' && uploadPhase !== 'done';

  return (
    <div className="space-y-10 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white leading-none uppercase mb-2">My Shorts</h1>
          <p className="text-zinc-500 font-medium">Upload short-form videos for your fans. Max 200 MB per clip.</p>
        </div>
        <button
          onClick={() => { resetUpload(); setShowUpload(true); }}
          className="flex items-center gap-3 h-14 px-8 bg-white text-black rounded-2xl text-sm font-bold uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl self-start md:self-auto"
        >
          <Plus size={18} />
          Upload Short
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="aspect-[9/16] rounded-3xl bg-zinc-900/50 animate-pulse" />
          ))}
        </div>
      ) : shorts.length === 0 ? (
        <div className="py-32 text-center border border-dashed border-white/5 rounded-[3rem] bg-zinc-950/20">
          <div className="w-20 h-20 bg-zinc-900 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/5">
            <Film className="h-10 w-10 text-zinc-700" />
          </div>
          <h4 className="text-xl font-bold text-white uppercase tracking-tight">No shorts yet</h4>
          <p className="text-sm text-zinc-500 mt-3 font-medium">Upload your first TikTok-style clip to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {shorts.map((clip, idx) => (
            <motion.div
              key={clip._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="group relative aspect-[9/16] rounded-3xl overflow-hidden bg-zinc-900 border border-white/5 hover:border-white/20 transition-all shadow-2xl"
            >
              {/* Thumbnail / Video preview */}
              {clip.thumbnailUrl ? (
                <img src={clip.thumbnailUrl} alt={clip.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-950 flex items-center justify-center">
                  <Play className="text-zinc-700" size={40} />
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Bottom info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                <p className="text-xs font-bold text-white truncate">{clip.title}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                    <Eye size={12} /> {clip.views.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                    <Heart size={12} /> {clip.likesCount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Play badge (always visible) */}
              <div className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <Play size={14} className="text-white fill-white" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl"
            >
              <button
                onClick={() => { if (!isBusy) { setShowUpload(false); resetUpload(); } }}
                className="absolute top-6 right-6 w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex items-center justify-center transition-colors"
              >
                <X size={18} className="text-zinc-400" />
              </button>

              <h2 className="text-2xl font-bold text-white mb-1">Upload Short</h2>
              <p className="text-zinc-500 text-sm mb-8">MP4, WebM, or MOV · Max 200 MB</p>

              {/* Drop zone */}
              <div
                ref={dropRef}
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed transition-all cursor-pointer mb-8 py-12 ${
                  file ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 hover:border-white/20 bg-zinc-950/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_TYPES.join(',')}
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
                {file ? (
                  <>
                    <CheckCircle2 className="text-emerald-500" size={32} />
                    <div className="text-center">
                      <p className="text-sm font-bold text-white">{file.name}</p>
                      <p className="text-xs text-zinc-500 mt-1">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="text-zinc-500" size={32} />
                    <div className="text-center">
                      <p className="text-sm font-bold text-white">Drag & drop or click to choose</p>
                      <p className="text-xs text-zinc-500 mt-1">Short clips up to 200 MB</p>
                    </div>
                  </>
                )}
              </div>

              {/* Fields */}
              <div className="space-y-4 mb-8">
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Title *"
                  maxLength={100}
                  className="w-full h-14 px-5 bg-zinc-950 border border-white/10 rounded-2xl text-white font-medium focus:outline-none focus:border-emerald-500/30 transition-all"
                />
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Description (optional)"
                  rows={3}
                  maxLength={500}
                  className="w-full p-5 bg-zinc-950 border border-white/10 rounded-2xl text-white font-medium focus:outline-none focus:border-emerald-500/30 transition-all resize-none"
                />
              </div>

              {/* Upload progress */}
              {uploadPhase !== 'idle' && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-zinc-400">{phaseLabel[uploadPhase]}</span>
                    {uploadPhase === 'uploading' && (
                      <span className="text-xs font-bold text-emerald-500">{uploadProgress}%</span>
                    )}
                  </div>
                  {uploadPhase === 'uploading' && (
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Error */}
              {uploadError && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 mb-6">
                  <AlertCircle size={16} className="text-rose-500 flex-shrink-0" />
                  <p className="text-xs font-bold text-rose-400">{uploadError}</p>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={isBusy || uploadPhase === 'done'}
                className="w-full h-14 bg-white text-black rounded-2xl text-sm font-bold uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
              >
                {isBusy ? <Loader2 size={18} className="animate-spin" /> : uploadPhase === 'done' ? <CheckCircle2 size={18} /> : <Upload size={18} />}
                {uploadPhase === 'done' ? 'Uploaded!' : isBusy ? phaseLabel[uploadPhase] : 'Upload Short'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
