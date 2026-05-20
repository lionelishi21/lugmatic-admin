import { useState, useEffect, useCallback } from 'react';
import { Play, Eye, Clock, Radio, X, ExternalLink, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';

interface RecordedStream {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  coverImage?: string;
  recordingUrl?: string;
  endTime?: string;
  duration?: number;
  totalViewers?: number;
  peakViewers?: number;
  totalGiftValue?: number;
  host?: { name: string; image?: string };
  hostUser?: { firstName: string; lastName: string };
}

const CATEGORIES = ['All', 'Music', 'Dancehall', 'Reggae', 'Soca', 'Afrobeats', 'Podcast', 'Other'];
const card = 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg';

function fmtDuration(secs?: number) {
  if (!secs) return '—';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
}

function VideoModal({ stream, onClose }: { stream: RecordedStream; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl bg-zinc-950 border border-white/[0.08] rounded-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <div>
            <p className="text-sm font-semibold text-white truncate">{stream.title}</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {stream.host?.name ?? [stream.hostUser?.firstName, stream.hostUser?.lastName].filter(Boolean).join(' ') ?? 'Artist'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {stream.recordingUrl && (
              <a href={stream.recordingUrl} target="_blank" rel="noreferrer"
                className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <button onClick={onClose} className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {stream.recordingUrl ? (
          <video
            src={stream.recordingUrl}
            controls
            autoPlay
            className="w-full aspect-video bg-black"
          />
        ) : (
          <div className="aspect-video bg-zinc-900 flex items-center justify-center">
            <div className="text-center">
              <Radio className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">Recording not available</p>
            </div>
          </div>
        )}

        <div className="p-4 flex items-center gap-6 text-xs text-zinc-400">
          {stream.totalViewers != null && (
            <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" />{stream.totalViewers.toLocaleString()} viewers</span>
          )}
          {stream.duration != null && (
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{fmtDuration(stream.duration)}</span>
          )}
          {stream.endTime && (
            <span>{format(new Date(stream.endTime), 'MMM d, yyyy')}</span>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function Streams() {
  const [streams, setStreams] = useState<RecordedStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [playing, setPlaying] = useState<RecordedStream | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetch = useCallback(async (cat: string, pg: number, replace = true) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pg), limit: '12' });
      if (cat !== 'All') params.set('category', cat.toLowerCase());
      const res = await api.get(`/live-stream/recorded?${params}`);
      const data = (res.data as any).data ?? [];
      const pagination = (res.data as any).pagination ?? {};
      setStreams(prev => replace ? data : [...prev, ...data]);
      setTotal(pagination.total ?? data.length);
    } catch { /* silently handled */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    setPage(1);
    fetch(category, 1, true);
  }, [category, fetch]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetch(category, next, false);
  };

  const hostName = (s: RecordedStream) =>
    s.host?.name ?? [s.hostUser?.firstName, s.hostUser?.lastName].filter(Boolean).join(' ') ?? 'Artist';

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Past Streams</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Your recorded live sessions — available to replay anytime</p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              category === cat
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading && streams.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
        </div>
      ) : streams.length === 0 ? (
        <div className={`${card} flex flex-col items-center justify-center py-24 text-center`}>
          <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
            <Radio className="h-6 w-6 text-zinc-400" />
          </div>
          <p className="font-semibold text-zinc-700 dark:text-zinc-300">No recorded streams yet</p>
          <p className="text-sm text-zinc-400 mt-1">Streams you go live will appear here after they end</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {streams.map(stream => (
              <button
                key={stream._id}
                onClick={() => setPlaying(stream)}
                className={`${card} overflow-hidden text-left group hover:border-emerald-500/40 transition-colors`}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  {stream.coverImage
                    ? <img src={stream.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full flex items-center justify-center"><Radio className="h-8 w-8 text-zinc-400" /></div>
                  }
                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Play className="h-5 w-5 text-white ml-0.5" />
                    </div>
                  </div>
                  {/* Duration badge */}
                  {stream.duration != null && (
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {fmtDuration(stream.duration)}
                    </span>
                  )}
                  {/* Category badge */}
                  {stream.category && (
                    <span className="absolute top-2 left-2 bg-emerald-600/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded capitalize">
                      {stream.category}
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white line-clamp-1">{stream.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5 truncate">{hostName(stream)}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-400">
                    {stream.totalViewers != null && (
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{stream.totalViewers.toLocaleString()}</span>
                    )}
                    {stream.endTime && (
                      <span>{format(new Date(stream.endTime), 'MMM d, yyyy')}</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {streams.length < total && (
            <div className="flex justify-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded text-sm font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Load more
              </button>
            </div>
          )}
        </>
      )}

      {/* Video modal */}
      <AnimatePresence>
        {playing && <VideoModal stream={playing} onClose={() => setPlaying(null)} />}
      </AnimatePresence>
    </div>
  );
}
