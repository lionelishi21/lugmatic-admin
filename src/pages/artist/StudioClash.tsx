import React, { useState, useEffect, useCallback } from 'react';
import { Mic2, Trophy, Clock, Star, Upload, CheckCircle2, Loader2, Film } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import api from '../../services/api';
import uploadService from '../../services/uploadService';

const ROUND_LABELS: Record<string, string> = {
  open: 'Open Submissions',
  elimination: 'Elimination Round',
  bracket: 'Bracket Stage',
  final: 'Grand Final',
};

interface Entry {
  _id: string;
  artist: { _id: string; name: string; image?: string };
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
  votes: number;
  giftPoints: number;
}

interface ActiveClash {
  _id: string;
  season: number;
  round: string;
  status: 'accepting' | 'voting' | 'ended';
  theme?: string;
  submissionDeadline?: string;
  votingDeadline?: string;
}

const MAX_FILE_SIZE = 200 * 1024 * 1024;

export default function StudioClash() {
  const [clash, setClash] = useState<ActiveClash | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [myEntry, setMyEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [uploadPhase, setUploadPhase] = useState<'idle' | 'presigning' | 'uploading' | 'saving' | 'done'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadActive();
  }, []);

  async function loadActive() {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: ActiveClash }>('/studio-clash/active');
      const data = (res.data as any);
      if (data?.success && data?.data) {
        setClash(data.data);
        await loadEntries(data.data._id, 0, true);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  const loadEntries = useCallback(async (id: string, p: number, replace = false) => {
    if (p > 0) setLoadingMore(true);
    try {
      const res = await api.get<any>(`/studio-clash/${id}/entries?page=${p}`);
      const data = res.data as any;
      if (data?.success && data?.data) {
        const list: Entry[] = data.data;
        setEntries(prev => replace ? list : [...prev, ...list]);
        setHasMore(!!data.hasMore);
        setPage(p + 1);

        // Detect my entry
        const me = (await api.get<any>('/auth/me')).data as any;
        const artistId = me?.data?.artist?._id;
        if (artistId) {
          const mine = list.find(e => e.artist?._id === artistId);
          if (mine) setMyEntry(mine);
        }
      }
    } catch {
      // silent
    } finally {
      setLoadingMore(false);
    }
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_FILE_SIZE) { toast.error('File too large (max 200 MB)'); return; }
    setFile(f);
  }

  async function handleSubmit() {
    if (!file || !clash) return;
    try {
      setUploadPhase('presigning');
      const presigned = await uploadService.presignShortClip(file.name, file.type);
      setUploadPhase('uploading');
      await uploadService.uploadToS3(presigned.uploadUrl, file, setUploadProgress);
      setUploadPhase('saving');
      const res = await api.post<any>(`/studio-clash/${clash._id}/submit`, {
        videoUrl: presigned.publicUrl,
        title: title.trim() || undefined,
      });
      const data = (res.data as any);
      if (data?.success) {
        setUploadPhase('done');
        toast.success('Entry submitted! 🎤');
        loadEntries(clash._id, 0, true);
      } else {
        throw new Error(data?.message ?? 'Submit failed');
      }
    } catch (err: any) {
      toast.error(err?.message ?? 'Upload failed');
      setUploadPhase('idle');
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-black mb-6">Studio Clash</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-video rounded-2xl bg-zinc-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !clash) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-32 text-center">
        <Mic2 className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
        <p className="text-zinc-400 text-lg">No active Studio Clash season</p>
        <p className="text-zinc-500 text-sm mt-1">Check back soon — the next season is coming.</p>
      </div>
    );
  }

  const deadline = clash.status === 'accepting' ? clash.submissionDeadline : clash.votingDeadline;
  const deadlineLabel = clash.status === 'accepting' ? 'Submissions close' : 'Voting closes';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black">Studio Clash</h1>
        <p className="text-zinc-400 text-sm mt-0.5">
          Season {clash.season} · {ROUND_LABELS[clash.round] ?? clash.round}
        </p>
        {clash.theme && <p className="text-zinc-300 text-sm mt-1">{clash.theme}</p>}
        {deadline && (
          <p className="text-zinc-500 text-xs mt-1 flex items-center gap-1">
            <Clock size={12} /> {deadlineLabel} {formatDistanceToNow(new Date(deadline), { addSuffix: true })}
          </p>
        )}
      </div>

      {/* Submit form — only in accepting phase and if no entry yet */}
      {clash.status === 'accepting' && !myEntry && uploadPhase !== 'done' && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 space-y-4">
          <h2 className="font-bold text-white">Submit Your Entry</h2>
          <p className="text-zinc-400 text-sm">Upload a 60-second performance video for this round.</p>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-zinc-700 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-zinc-500 transition-colors"
          >
            <Film size={28} className="text-zinc-500" />
            <span className="text-zinc-400 text-sm">{file ? file.name : 'Choose video file'}</span>
          </button>

          {file && (
            <input
              type="text"
              placeholder="Entry title (optional)"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-500"
            />
          )}

          {uploadPhase !== 'idle' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>{uploadPhase === 'uploading' ? 'Uploading...' : uploadPhase === 'presigning' ? 'Preparing...' : 'Saving...'}</span>
                {uploadPhase === 'uploading' && <span>{uploadProgress}%</span>}
              </div>
              <div className="h-1.5 w-full bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: uploadPhase === 'uploading' ? `${uploadProgress}%` : uploadPhase === 'saving' ? '95%' : '10%' }}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!file || uploadPhase !== 'idle'}
            className="w-full bg-primary text-black font-bold py-2.5 rounded-xl disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {uploadPhase === 'idle' ? (
              <><Upload size={16} /> Submit Entry</>
            ) : (
              <><Loader2 size={16} className="animate-spin" /> Uploading…</>
            )}
          </button>
        </div>
      )}

      {/* My entry or done state */}
      {(myEntry || uploadPhase === 'done') && (
        <div className="bg-green-900/20 border border-green-500/30 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400 flex-none" />
          <div>
            <p className="text-green-400 font-bold text-sm">Entry submitted!</p>
            {myEntry && (
              <p className="text-zinc-400 text-xs">{myEntry.votes} votes · {myEntry.giftPoints} gift points</p>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div>
        <h2 className="font-bold text-white mb-3 flex items-center gap-2">
          <Trophy size={16} className="text-yellow-400" /> Leaderboard
        </h2>
        {entries.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center py-12">No entries yet.</p>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, i) => (
              <motion.div
                key={entry._id}
                whileHover={{ x: 2 }}
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3"
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-sm flex-none ${
                  i === 0 ? 'bg-yellow-500 text-black' :
                  i === 1 ? 'bg-zinc-400 text-black' :
                  i === 2 ? 'bg-orange-700 text-white' :
                  'bg-zinc-800 text-zinc-400'
                }`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold truncate">{entry.artist?.name}</p>
                  {entry.title && <p className="text-zinc-500 text-xs truncate">{entry.title}</p>}
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  <span className="flex items-center gap-1"><Star size={12} /> {entry.votes}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => loadEntries(clash._id, page)}
              disabled={loadingMore}
              className="px-5 py-2 rounded-xl bg-zinc-800 text-white text-sm font-bold hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              {loadingMore ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
