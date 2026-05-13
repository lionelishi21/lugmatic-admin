import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Video, Users, Clock, Eye, Heart, MessageCircle, DollarSign,
  Play, Pause, Square, Settings, Pencil, Trash2, Plus,
  Search, Calendar, X, MoreVertical, Radio, Signal, AlertCircle, ChevronRight
} from 'lucide-react';
import {
  LiveKitRoom, VideoTrack, AudioTrack, useTracks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import {
  adminGetAllStreams, getStreamToken, deleteRecording, type LiveStream
} from '../../services/liveStreamService';
import { getFullImageUrl } from '../../services/api';

// ─── Monitoring Modal ───
interface MonitoringModalProps {
  stream: LiveStream;
  onClose: () => void;
}

const MonitoringModal: React.FC<MonitoringModalProps> = ({ stream, onClose }) => {
  const [tokenData, setTokenData] = useState<{ token: string; url: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await getStreamToken(stream._id);
        setTokenData({ token: res.data.token, url: res.data.url });
      } catch (err) {
        toast.error('Failed to join stream');
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchToken();
  }, [stream._id, onClose]);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[70]" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl max-w-5xl w-full mx-4 aspect-video relative overflow-hidden" 
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              LIVE MONITOR
            </div>
            <h2 className="text-white font-bold truncate max-w-[300px]">{stream.title}</h2>
            <span className="text-zinc-500 text-xs font-medium">{stream.host.name}</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/5 text-white hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500">
            <Radio size={48} className="text-emerald-500 animate-pulse mb-4" />
            <p className="text-sm font-medium">Connecting to encrypted signal...</p>
          </div>
        ) : tokenData ? (
          <LiveKitRoom serverUrl={tokenData.url} token={tokenData.token} connect={true} className="h-full w-full">
            <StreamVideoRenderer />
          </LiveKitRoom>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12">
            <AlertCircle size={48} className="text-rose-500 mb-4" />
            <p className="text-white font-bold">Signal Lost</p>
            <p className="text-sm text-zinc-500 mt-2">Could not establish connection to the streaming server.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

function StreamVideoRenderer() {
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare, Track.Source.Microphone], { onlySubscribed: true });
  const videoTrack = tracks.find((t) => t.source === Track.Source.Camera || t.source === Track.Source.ScreenShare);
  const audioTracks = tracks.filter((t) => t.source === Track.Source.Microphone);

  if (!videoTrack) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-zinc-950">
        <Video size={64} className="text-white/5 mb-4" />
        <p className="text-zinc-600 text-sm font-medium tracking-wide">Waiting for video signal...</p>
        {audioTracks.map((t, i) => <AudioTrack key={i} trackRef={t} />)}
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-black relative">
      <VideoTrack trackRef={videoTrack} className="h-full w-full object-contain" />
      {audioTracks.map((t, i) => <AudioTrack key={i} trackRef={t} />)}
    </div>
  );
}

// ─── Main Component ───
const LiveStreamManagement: React.FC = () => {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [monitoringStream, setMonitoringStream] = useState<LiveStream | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });
  const [viewingRecording, setViewingRecording] = useState<LiveStream | null>(null);

  const fetchStreams = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGetAllStreams({
        status: statusFilter,
        search: searchTerm,
        page: pagination.page,
        limit: pagination.limit
      });
      if (res.success) {
        setStreams(res.data);
        if (res.pagination) {
          setPagination(prev => ({ ...prev, total: res.pagination?.total || 0, pages: res.pagination?.pages || 1 }));
        }
      }
    } catch (err) {
      toast.error('Failed to load streams');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchStreams();
  }, [fetchStreams]);

  const stats = useMemo(() => ({
    live: streams.filter(s => s.status === 'live').length,
    viewers: streams.reduce((sum, s) => sum + (s.currentViewers || 0), 0),
    revenue: streams.reduce((sum, s) => sum + (s.totalGiftValue || 0), 0),
    scheduled: streams.filter(s => s.status === 'scheduled').length,
  }), [streams]);

  const handleStreamAction = async (streamId: string, action: string) => {
    if (action === 'delete-recording') {
      if (window.confirm('Delete this recording?')) {
        try {
          await deleteRecording(streamId);
          toast.success('Recording deleted');
          fetchStreams();
        } catch (err) {
          toast.error('Failed to delete');
        }
      }
    }
    setOpenMenuId(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Live Streams</h1>
          <p className="text-zinc-500">Monitor active broadcasts and manage recording history.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Create Stream
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Live Now', value: stats.live, icon: Radio, color: 'text-rose-500', bg: 'bg-rose-500/5' },
          { label: 'Total Viewers', value: stats.viewers.toLocaleString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/5' },
          { label: 'Stream Revenue', value: `$${stats.revenue.toFixed(0)}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
          { label: 'Scheduled', value: stats.scheduled, icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-500/5' },
        ].map(s => (
          <div key={s.label} className="premium-card premium-card-hover">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 ${s.bg}`}>
              <s.icon size={20} className={s.color} />
            </div>
            <p className="text-zinc-500 text-xs font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-white tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-[#0a0a0a] border border-white/5 rounded-2xl p-1 gap-1">
          {['all', 'live', 'recorded', 'scheduled'].map(filter => (
            <button
              key={filter}
              onClick={() => { setStatusFilter(filter); setPagination(prev => ({ ...prev, page: 1 })); }}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                statusFilter === filter ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search streams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-11"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading && streams.length === 0 ? (
          <div className="col-span-full py-24 text-center">
            <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mx-auto mb-4" />
            <p className="text-zinc-500">Scanning frequency channels...</p>
          </div>
        ) : streams.length === 0 ? (
          <div className="col-span-full py-24 text-center premium-card">
            <Video className="h-12 w-12 text-zinc-800 mx-auto mb-4" />
            <p className="text-zinc-500">No active streams found in this sector.</p>
          </div>
        ) : (
          streams.map((stream) => (
            <motion.div
              key={stream._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="premium-card group !p-0 overflow-hidden border-white/5 hover:border-emerald-500/20"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-zinc-900 overflow-hidden">
                {stream.coverImage ? (
                  <img src={getFullImageUrl(stream.coverImage)} alt={stream.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-800"><Radio size={48} /></div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  {stream.status === 'live' ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-bold tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      LIVE
                    </div>
                  ) : (
                    <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/60 text-[10px] font-bold uppercase tracking-wider border border-white/10">
                      {stream.status}
                    </div>
                  )}
                </div>

                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  {stream.status === 'live' && (
                    <button onClick={() => setMonitoringStream(stream)} className="btn-primary scale-90 group-hover:scale-100 transition-transform">
                      Monitor Signal
                    </button>
                  )}
                  {stream.isRecorded && (
                    <button onClick={() => setViewingRecording(stream)} className="btn-secondary scale-90 group-hover:scale-100 transition-transform bg-white text-black hover:bg-zinc-200">
                      Watch Archive
                    </button>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={stream.host.image ? getFullImageUrl(stream.host.image) : `https://ui-avatars.com/api/?name=${encodeURIComponent(stream.host.name)}&background=10b981&color=fff`} 
                      className="w-10 h-10 rounded-xl object-cover border border-white/5" 
                    />
                    <div className="min-w-0">
                      <h3 className="text-white font-bold truncate tracking-tight">{stream.title}</h3>
                      <p className="text-xs text-zinc-500 truncate">{stream.host.name}</p>
                    </div>
                  </div>
                  <button onClick={() => setOpenMenuId(openMenuId === stream._id ? null : stream._id)} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5">
                    <MoreVertical size={18} />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                      <Users size={14} className="text-emerald-500" />
                      {(stream.currentViewers || 0).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                      <DollarSign size={14} className="text-emerald-500" />
                      {stream.totalGiftValue || 0}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-600 font-medium">
                    <Clock size={14} />
                    {stream.status === 'live' ? 'On Air' : 'Ended'}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {openMenuId === stream._id && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-20 right-6 w-48 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl z-20 p-2"
                  >
                    <button onClick={() => { setSelectedStream(stream); setOpenMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5">
                      <Eye size={16} /> Stream Analytics
                    </button>
                    {stream.isRecorded && (
                      <button onClick={() => handleStreamAction(stream._id, 'delete-recording')} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/5">
                        <Trash2 size={16} /> Delete Recording
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>

      {/* Analytics Modal */}
      <AnimatePresence>
        {selectedStream && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setSelectedStream(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="premium-card w-full max-w-xl shadow-2xl" onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold">Stream Analytics</h3>
                  <p className="text-xs text-zinc-500 mt-1">Deep analysis of transmission #{selectedStream._id.slice(-8)}</p>
                </div>
                <button onClick={() => setSelectedStream(null)} className="p-2 rounded-full hover:bg-white/5 text-zinc-500"><X size={20} /></button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { label: 'Total Viewers', value: selectedStream.totalViewers, icon: Users, color: 'text-blue-500' },
                  { label: 'Revenue', value: `$${selectedStream.totalGiftValue || 0}`, icon: DollarSign, color: 'text-emerald-500' },
                  { label: 'Peak Concurrency', value: selectedStream.peakViewers, icon: Signal, color: 'text-rose-500' },
                  { label: 'Engagement', value: selectedStream.totalGiftsReceived, icon: Heart, color: 'text-purple-500' },
                ].map(metric => (
                  <div key={metric.label} className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center">
                    <metric.icon size={18} className={`${metric.color} mx-auto mb-2`} />
                    <p className="text-lg font-bold text-white">{metric.value || 0}</p>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{metric.label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5">
                {[
                  { label: 'Category', value: selectedStream.category },
                  { label: 'Host Profile', value: selectedStream.host.name },
                  { label: 'Start Time', value: selectedStream.actualStartTime ? new Date(selectedStream.actualStartTime).toLocaleString() : 'Pending' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500 font-medium">{item.label}</span>
                    <span className="text-white font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Recording Player */}
      <AnimatePresence>
        {viewingRecording && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center z-[80]" onClick={() => setViewingRecording(null)}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="max-w-5xl w-full mx-4 aspect-video relative group" onClick={e => e.stopPropagation()}
            >
              <video src={viewingRecording.recordingUrl} controls autoPlay className="w-full h-full rounded-3xl shadow-2xl border border-white/10" />
              <button onClick={() => setViewingRecording(null)} className="absolute -top-16 right-0 p-3 rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all">
                <X size={24} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveStreamManagement;

const Loader2 = ({ className }: { className?: string }) => <Signal className={`${className} animate-pulse`} />;
