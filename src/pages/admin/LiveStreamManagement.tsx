import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Video, Users, Clock, Eye, Heart, MessageCircle, DollarSign,
  Play, Pause, Square, Settings, Pencil, Trash2, Plus,
  Search, Calendar, X, MoreVertical, Radio, Signal, AlertCircle, 
  ChevronRight, Activity, ShieldCheck, Share2, Zap, 
  Monitor, BarChart3, HardDrive, RefreshCw
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
import Preloader from '../../components/ui/Preloader';

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
        toast.error('Failed to join signal');
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchToken();
  }, [stream._id, onClose]);

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center z-[70]" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#050505] border border-white/10 rounded-[2.5rem] shadow-2xl max-w-5xl w-full mx-4 aspect-video relative overflow-hidden" 
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 p-8 flex items-center justify-between z-10 bg-gradient-to-b from-black/90 to-transparent">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold tracking-widest border border-rose-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]" />
              LIVE MONITOR
            </div>
            <h2 className="text-white font-bold truncate max-w-[300px] tracking-tight">{stream.title}</h2>
            <span className="text-zinc-500 text-xs font-medium border-l border-white/10 pl-4">{stream.host.name}</span>
          </div>
          <button onClick={onClose} className="p-3 rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500">
            <Activity size={48} className="text-emerald-500 animate-pulse mb-4" />
            <p className="text-sm font-bold uppercase tracking-widest">Decrypting Signal...</p>
          </div>
        ) : tokenData ? (
          <LiveKitRoom serverUrl={tokenData.url} token={tokenData.token} connect={true} className="h-full w-full">
            <StreamVideoRenderer />
          </LiveKitRoom>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12">
            <AlertCircle size={48} className="text-rose-500 mb-4" />
            <p className="text-white font-bold text-xl">Signal Lost</p>
            <p className="text-sm text-zinc-500 mt-2 max-w-sm">Unable to establish a secure connection to the broadcast node.</p>
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
      <div className="h-full flex flex-col items-center justify-center bg-[#050505]">
        <Monitor size={64} className="text-zinc-900 mb-6" />
        <p className="text-zinc-600 text-xs font-bold uppercase tracking-[0.2em] animate-pulse">Awaiting Video Frame...</p>
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
      // Handle res being an array or object
      const data = Array.isArray(res) ? res : (res as any).data || [];
      const pag = (res as any).pagination || {};
      
      setStreams(data);
      setPagination(prev => ({ 
        ...prev, 
        total: pag.total || 0, 
        pages: pag.pages || 1 
      }));
    } catch (err) {
      toast.error('Failed to synchronize stream registry');
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
      const loadingId = toast.loading('Purging archive...');
      try {
        await deleteRecording(streamId);
        toast.success('Archive purged', { id: loadingId });
        fetchStreams();
      } catch (err) {
        toast.error('Purge failed', { id: loadingId });
      }
    }
    setOpenMenuId(null);
  };

  if (loading && streams.length === 0) return <Preloader isVisible text="Scanning transmission frequencies..." />;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <Radio className="text-rose-500" size={32} />
            Live Streams
          </h1>
          <p className="text-zinc-500">Monitor active broadcasts and manage recording persistence.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchStreams} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={18} />
            Refresh Feed
          </button>
          <button className="btn-primary flex items-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
            <Plus size={18} />
            New Broadcast
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Live Now', value: stats.live, icon: Activity, color: 'text-rose-500', bg: 'bg-rose-500/5' },
          { label: 'Signal Reach', value: stats.viewers.toLocaleString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/5' },
          { label: 'Gift Velocity', value: `$${stats.revenue.toFixed(0)}`, icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
          { label: 'Upcoming', value: stats.scheduled, icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-500/5' },
        ].map(s => (
          <div key={s.label} className="premium-card">
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
        <div className="flex bg-[#0a0a0a] border border-white/5 rounded-3xl p-1 gap-1 overflow-x-auto no-scrollbar">
          {['all', 'live', 'recorded', 'scheduled'].map(filter => (
            <button
              key={filter}
              onClick={() => { setStatusFilter(filter); setPagination(prev => ({ ...prev, page: 1 })); }}
              className={`px-6 py-2 rounded-2xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                statusFilter === filter ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search stream registry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-11"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {streams.length === 0 ? (
          <div className="col-span-full py-24 text-center premium-card">
            <Video className="h-12 w-12 text-zinc-800 mx-auto mb-4" />
            <p className="text-zinc-500 font-medium italic">No active transmissions detected in this frequency.</p>
          </div>
        ) : (
          streams.map((stream) => (
            <motion.div
              key={stream._id}
              layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="premium-card group !p-0 overflow-hidden border-white/5 hover:border-emerald-500/20 transition-all"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-zinc-950 overflow-hidden">
                {stream.coverImage ? (
                  <img src={getFullImageUrl(stream.coverImage)} alt={stream.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-900"><Radio size={48} /></div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  {stream.status === 'live' ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 text-white text-[10px] font-bold tracking-widest shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      LIVE
                    </div>
                  ) : (
                    <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/60 text-[10px] font-bold uppercase tracking-widest border border-white/10">
                      {stream.status}
                    </div>
                  )}
                </div>

                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  {stream.status === 'live' && (
                    <button onClick={() => setMonitoringStream(stream)} className="btn-primary !py-2 !px-4 scale-90 group-hover:scale-100 transition-all">
                      Monitor Signal
                    </button>
                  )}
                  {stream.isRecorded && stream.recordingUrl && (
                    <button onClick={() => setViewingRecording(stream)} className="btn-secondary !py-2 !px-4 scale-90 group-hover:scale-100 transition-all bg-white text-black hover:bg-zinc-200">
                      Watch Archive
                    </button>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 overflow-hidden flex-shrink-0">
                      <img 
                        src={stream.host.image ? getFullImageUrl(stream.host.image) : `https://ui-avatars.com/api/?name=${encodeURIComponent(stream.host.name)}&background=10b981&color=fff`} 
                        className="w-full h-full object-cover opacity-80" 
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white font-bold truncate tracking-tight group-hover:text-emerald-400 transition-colors">{stream.title}</h3>
                      <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">{stream.host.name}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <button onClick={() => setOpenMenuId(openMenuId === stream._id ? null : stream._id)} className="p-2 rounded-lg text-zinc-600 hover:text-white hover:bg-white/5 transition-all">
                      <MoreVertical size={18} />
                    </button>
                    <AnimatePresence>
                      {openMenuId === stream._id && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-full right-0 mb-2 w-48 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl z-20 p-2 overflow-hidden"
                        >
                          <button onClick={() => { setSelectedStream(stream); setOpenMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-all">
                            <BarChart3 size={16} /> Analytics
                          </button>
                          {stream.isRecorded && (
                            <button onClick={() => handleStreamAction(stream._id, 'delete-recording')} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/5 transition-all">
                              <Trash2 size={16} /> Purge Archive
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-5 border-t border-white/5">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-bold tracking-tight">
                      <Users size={14} className="text-blue-500" />
                      {(stream.currentViewers || 0).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-bold tracking-tight">
                      <Zap size={14} className="text-emerald-500" />
                      ${stream.totalGiftValue || 0}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
                    <Clock size={14} />
                    {stream.status === 'live' ? 'Synchronized' : 'Terminated'}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Analytics Modal */}
      <AnimatePresence>
        {selectedStream && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setSelectedStream(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="premium-card w-full max-w-xl shadow-2xl" onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-xl font-bold">Transmission Analytics</h3>
                  <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">Protocol Trace: {selectedStream._id.slice(-8)}</p>
                </div>
                <button onClick={() => setSelectedStream(null)} className="p-2 rounded-full hover:bg-white/5 text-zinc-500 transition-all"><X size={20} /></button>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-10">
                {[
                  { label: 'Peak Reach', value: selectedStream.peakViewers, icon: Signal, color: 'text-blue-500' },
                  { label: 'Gift Volume', value: `$${selectedStream.totalGiftValue || 0}`, icon: DollarSign, color: 'text-emerald-500' },
                  { label: 'Total Signal', value: selectedStream.totalViewers, icon: Users, color: 'text-rose-500' },
                  { label: 'Interaction', value: selectedStream.totalGiftsReceived, icon: Heart, color: 'text-purple-500' },
                ].map(metric => (
                  <div key={metric.label} className="bg-white/5 border border-white/5 p-6 rounded-3xl text-center hover:border-white/10 transition-colors">
                    <metric.icon size={20} className={`${metric.color} mx-auto mb-3`} />
                    <p className="text-2xl font-bold text-white tracking-tight">{metric.value || 0}</p>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">{metric.label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-8 border-t border-white/5">
                {[
                  { label: 'Deployment Category', value: selectedStream.category },
                  { label: 'Primary Host', value: selectedStream.host.name },
                  { label: 'Initialization', value: selectedStream.actualStartTime ? new Date(selectedStream.actualStartTime).toLocaleString() : 'N/A' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="text-xs text-zinc-600 font-bold uppercase tracking-widest">{item.label}</span>
                    <span className="text-sm text-white font-bold">{item.value}</span>
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
          <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl flex items-center justify-center z-[110]" onClick={() => setViewingRecording(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="max-w-6xl w-full mx-4 aspect-video relative" onClick={e => e.stopPropagation()}
            >
              <video src={viewingRecording.recordingUrl} controls autoPlay className="w-full h-full rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10" />
              <button onClick={() => setViewingRecording(null)} className="absolute -top-20 right-0 p-4 rounded-full bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all">
                <X size={28} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Monitoring Modal */}
      {monitoringStream && (
        <MonitoringModal stream={monitoringStream} onClose={() => setMonitoringStream(null)} />
      )}
    </div>
  );
};

export default LiveStreamManagement;
