import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Pause, Volume2, VolumeX, Music2, Loader2 } from 'lucide-react';
import api from '@/services/api';

interface SongData {
  _id: string;
  name: string;
  coverArtUrl?: string;
  audioFileUrl: string;
  artist?: { name: string; image?: string };
  genre?: { name: string };
  duration?: number;
}

export default function SongShare() {
  const { songId } = useParams<{ songId: string }>();
  const [song, setSong] = useState<SongData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Player state
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!songId) return;
    api.get(`/song/details/${songId}`)
      .then(res => {
        const data = (res.data as any).data ?? (res.data as any);
        setSong(data);
      })
      .catch(() => setError('This track is not available.'))
      .finally(() => setLoading(false));
  }, [songId]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  };

  const onTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
    setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
      {/* Lugmatic branding */}
      <div className="mb-8 text-center">
        <span className="text-emerald-400 font-bold text-lg tracking-tight">Lugmatic</span>
        <p className="text-zinc-600 text-xs mt-1">Caribbean Music Platform</p>
      </div>

      <div className="w-full max-w-sm bg-zinc-900 border border-white/[0.06] rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-6 w-6 text-emerald-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            <Music2 className="h-10 w-10 text-zinc-700 mb-3" />
            <p className="text-zinc-400 text-sm">{error}</p>
          </div>
        ) : song ? (
          <>
            {/* Cover art */}
            <div className="relative aspect-square bg-zinc-800">
              {song.coverArtUrl ? (
                <img src={song.coverArtUrl} alt={song.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music2 className="h-16 w-16 text-zinc-700" />
                </div>
              )}
              {/* Play overlay */}
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity"
              >
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  {playing
                    ? <Pause className="h-7 w-7 text-white" />
                    : <Play className="h-7 w-7 text-white ml-1" />}
                </div>
              </button>
            </div>

            {/* Info + controls */}
            <div className="p-5 space-y-4">
              <div>
                <h1 className="font-bold text-white text-base truncate">{song.name}</h1>
                <p className="text-zinc-400 text-sm truncate">
                  {song.artist?.name ?? 'Unknown Artist'}
                  {song.genre?.name ? ` · ${song.genre.name}` : ''}
                </p>
              </div>

              {/* Progress bar */}
              <div
                className="h-1.5 bg-zinc-700 rounded-full cursor-pointer relative overflow-hidden"
                onClick={seek}
              >
                <div
                  className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>{fmt(currentTime)}</span>
                <span>{fmt(duration)}</span>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded text-sm font-semibold hover:bg-emerald-700 transition-colors"
                >
                  {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {playing ? 'Pause' : 'Play'}
                </button>
                <button
                  onClick={() => { setMuted(m => !m); if (audioRef.current) audioRef.current.muted = !muted; }}
                  className="p-2.5 bg-zinc-800 text-zinc-400 rounded hover:text-white transition-colors"
                >
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <audio
              ref={audioRef}
              src={song.audioFileUrl}
              onTimeUpdate={onTimeUpdate}
              onLoadedMetadata={onLoadedMetadata}
              onEnded={() => setPlaying(false)}
            />
          </>
        ) : null}
      </div>

      <p className="mt-6 text-zinc-600 text-xs text-center">
        Powered by <a href="https://lugmaticmusic.com" className="text-emerald-500 hover:underline">Lugmatic</a>
      </p>
    </div>
  );
}
