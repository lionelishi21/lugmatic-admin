import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Video, Users, Clock, Eye, Heart, MessageCircle, DollarSign,
  Play, Pause, Square, Settings, Pencil, Trash2, Plus,
  Search, Calendar, X, MoreVertical, Radio, Signal, AlertCircle, 
  ChevronRight, Activity, ShieldCheck, Share2, Zap, 
  Monitor, BarChart3, HardDrive, RefreshCw, Globe, Target,
  Cpu, ArrowUpRight, Layers, Database, Save, Info,
  Waves, Wifi, LayoutGrid, List, ChevronDown, Lock, Unlock,
  Shield, Camera, Mic, Volume2
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

// ─── Monitoring Console ───
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
    <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl flex items-center justify-center z-[100]" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-zinc-950/40 border border-emerald-500/10 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,1)] max-w-6xl w-full mx-6 aspect-video relative overflow-hidden backdrop-blur-2xl" 
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 p-10 flex items-center justify-between z-30 bg-gradient-to-b from-black/90 via-black/40 to-transparent">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-rose-500/10 text-rose-500 text-[10px] font-black tracking-[0.3em] border border-rose-500/20 shadow-lg italic">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_12px_#f43f5e]" />
              SIGNAL_INTERCEPT
            </div>
            <div className="h-10 w-px bg-white/5 mx-2" />
            <div>
               <h2 className="text-white text-2xl font-bold tracking-tighter italic uppercase leading-none mb-1.5">{stream.title}</h2>
               <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest italic leading-none">{stream.host.name} • BROADCAST_NODE_{stream._id.slice(-6).toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-14 h-14 rounded-2xl bg-zinc-950 border border-white/5 text-zinc-500 hover:text-white hover:bg-white/5 transition-all shadow-inner flex items-center justify-center">
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 via-transparent to-transparent opacity-20" />
            <div className="relative mb-8">
               <div className="w-24 h-24 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
               <Activity className="absolute inset-0 m-auto text-emerald-500 animate-pulse" size={32} />
            </div>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] italic">Decrypting Frequency Spectrum...</p>
          </div>
        ) : tokenData ? (
          <div className="h-full w-full relative">
            <LiveKitRoom serverUrl={tokenData.url} token={tokenData.token} connect={true} className="h-full w-full">
              <StreamVideoRenderer />
            </LiveKitRoom>
            
            {/* Tactical Overlay */}
            <div className="absolute bottom-10 left-10 right-10 flex items-end justify-between z-30">
               <div className="flex gap-4">
                  <div className="premium-card !bg-black/60 !backdrop-blur-xl border-white/5 p-4 flex items-center gap-4">
                     <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                        <Users size={18} className="text-blue-500" />
                     </div>
                     <div>
                        <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest italic mb-1">Signal Reach</p>
                        <p className="text-lg font-bold text-white tabular-nums italic leading-none">{(stream.currentViewers || 0).toLocaleString()}</p>
                     </div>
                  </div>
                  <div className="premium-card !bg-black/60 !backdrop-blur-xl border-white/5 p-4 flex items-center gap-4">
                     <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                        <Zap size={18} className="text-emerald-500" />
                     </div>
                     <div>
                        <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest italic mb-1">Gift Volume</p>
                        <p className="text-lg font-bold text-white tabular-nums italic leading-none">${stream.totalGiftValue || 0}</p>
                     </div>
                  </div>
               </div>
               
               <div className="premium-card !bg-black/60 !backdrop-blur-xl border-white/5 p-4 flex items-center gap-6">
                  <div className="flex items-center gap-4 border-r border-white/5 pr-6">
                     <button className="text-zinc-500 hover:text-emerald-500 transition-colors"><Volume2 size={20} /></button>
                     <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="w-2/3 h-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <button className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/5 text-zinc-500 hover:text-white transition-all"><Camera size={18} /></button>
                     <button className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/5 text-zinc-500 hover:text-white transition-all"><Mic size={18} /></button>
                     <button className="px-6 h-10 bg-rose-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest italic shadow-xl shadow-rose-900/20">Disconnect</button>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-24">
            <div className="w-24 h-24 bg-zinc-950 rounded-[2.5rem] flex items-center justify-center mb-10 border border-white/5 shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-rose-500/5 animate-pulse" />
               <AlertCircle size={40} className="text-rose-500 relative z-10" />
            </div>
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-4 italic">Signal Integrity Compromised</h3>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.15em] max-w-sm mx-auto opacity-60 leading-relaxed italic">Unable to establish a high-fidelity sync with the broadcast node. Protocol failure: NULL_HANDSHAKE.</p>
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
      <div className="h-full flex flex-col items-center justify-center bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-transparent to-transparent" />
        <Monitor size={80} className="text-zinc-900 mb-8 relative z-10" />
        <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse relative z-10 italic">Awaiting Visual Uplink...</p>
        {audioTracks.map((t, i) => <AudioTrack key={i} trackRef={t} />)}
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-black relative">
      <VideoTrack trackRef={videoTrack} className="h-full w-full object-contain" />
      {audioTracks.map((t, i) => <AudioTrack key={i} trackRef={t} />)}
      <div className="absolute inset-0 pointer-events-none border-t border-white/5" />
    </div>
  );
}

// ─── Main Hub ───
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
      const loadingId = toast.loading('Purging transmission archive...');
      try {
        await deleteRecording(streamId);
        toast.success('Archive purged from storage', { id: loadingId });
        fetchStreams();
      } catch (err) {
        toast.error('Purge failure', { id: loadingId });
      }
    }
    setOpenMenuId(null);
  };

  if (loading && streams.length === 0) return <Preloader isVisible text="Scanning transmission frequencies..." />;

  return (
    <div className="space-y-12 pb-24">
      {/* Cinematic Identity Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-none italic uppercase">Signal Command</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest italic">Matrix: Active</span>
            </div>
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em] ml-1 italic">Monitoring active transmissions, decrypting signals, and managing artifact persistence.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchStreams} 
            className="h-16 px-8 bg-zinc-950 border border-white/5 text-zinc-500 hover:text-white hover:bg-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-inner flex items-center justify-center gap-3 italic"
          >
            <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-700" />
            Refresh Signals
          </button>
          <button className="h-16 px-10 bg-white text-black rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-4 group border border-white/10 italic">
            <Plus size={18} />
            Induct Stream
          </button>
        </div>
      </div>

      {/* Intelligence Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Active Signals', value: stats.live, icon: Wifi, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'Global Reach', value: stats.viewers.toLocaleString(), icon: Globe, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Fiscal Velocity', value: `$${stats.revenue.toFixed(0)}`, icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Scheduled Syncs', value: stats.scheduled, icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((s, i) => (
          <motion.div 
            key={s.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="premium-card group border-white/5 hover:border-emerald-500/20 transition-all cursor-default relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-bl-full pointer-events-none" />
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${s.bg} border border-white/5 shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform duration-500`}>
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <s.icon size={24} className={s.color} />
            </div>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em] mb-2 italic">{s.label}</p>
            <p className="text-3xl font-bold text-white tracking-tighter italic tabular-nums">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Operation matrix HUD */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="flex bg-zinc-950/40 border border-white/5 rounded-2xl p-1.5 gap-1.5 shadow-inner">
          {['all', 'live', 'recorded', 'scheduled'].map(filter => (
            <button
              key={filter}
              onClick={() => { setStatusFilter(filter); setPagination(prev => ({ ...prev, page: 1 })); }}
              className={`px-8 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all duration-300 ${
                statusFilter === filter ? 'bg-white/10 text-white shadow-xl border border-white/5' : 'text-zinc-600 hover:text-zinc-300'
              }`}
            >
              {filter.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:max-w-md group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 h-5 w-5 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="SCAN SIGNAL REGISTRY..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-12 h-14 bg-zinc-950/40 border border-white/5 rounded-2xl text-white text-[10px] font-bold tracking-[0.2em] uppercase focus:outline-none focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-inner placeholder:text-zinc-800 italic"
          />
        </div>
      </div>

      {/* Signal Grid */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={statusFilter}
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {streams.length === 0 ? (
            <div className="col-span-full py-40 text-center premium-card border-white/5 shadow-2xl group">
              <div className="w-24 h-24 bg-zinc-950 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-white/5 shadow-2xl group-hover:border-rose-500/20 transition-all">
                <Video size={36} className="text-zinc-800 group-hover:text-rose-500 transition-colors" />
              </div>
              <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.3em] mb-3 italic">Scan Result: NULL_TRANSMISSIONS</h3>
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.15em] max-w-sm mx-auto opacity-60 italic">No active or archived transmissions detected in this frequency spectrum.</p>
            </div>
          ) : (
            streams.map((stream, i) => (
              <motion.div
                key={stream._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02 }}
                className="premium-card group !p-0 overflow-hidden hover:border-emerald-500/30 transition-all duration-700 bg-zinc-950/40 border-white/5 shadow-2xl relative"
              >
                {/* Thumbnail Layer */}
                <div className="relative aspect-video bg-zinc-950 overflow-hidden">
                  {stream.coverImage ? (
                    <img 
                       src={getFullImageUrl(stream.coverImage)} 
                       alt={stream.title} 
                       className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-900 bg-black/40"><Radio size={48} /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80 z-10" />
                  
                  {/* Status Overlay */}
                  <div className="absolute top-6 left-6 z-20">
                    {stream.status === 'live' ? (
                      <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-rose-500 text-white text-[9px] font-black tracking-[0.2em] shadow-[0_0_20px_rgba(244,63,94,0.4)] italic border border-white/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        ACTIVE_SIGNAL
                      </div>
                    ) : (
                      <div className="px-4 py-2 rounded-2xl bg-black/80 backdrop-blur-xl text-zinc-500 text-[9px] font-black uppercase tracking-[0.2em] border border-white/5 italic">
                        {stream.status.toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Operational Controls Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all z-20 flex flex-col items-center justify-center gap-6 backdrop-blur-sm">
                    <div className="flex gap-4">
                       {stream.status === 'live' && (
                         <button onClick={() => setMonitoringStream(stream)} className="h-14 px-8 bg-white text-black rounded-2xl text-[9px] font-black uppercase tracking-widest italic flex items-center gap-3 shadow-2xl hover:bg-emerald-400 transition-all">
                           <Activity size={18} /> Monitor Decrypt
                         </button>
                       )}
                       {stream.isRecorded && stream.recordingUrl && (
                         <button onClick={() => setViewingRecording(stream)} className="h-14 px-8 bg-zinc-950 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest italic flex items-center gap-3 shadow-2xl border border-white/10 hover:bg-white/5 transition-all">
                           <HardDrive size={18} /> Watch Archive
                         </button>
                       )}
                    </div>
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.4em] italic opacity-60">Protocol_{stream._id.slice(-8).toUpperCase()}</p>
                  </div>
                </div>

                {/* Information Layer */}
                <div className="p-8 relative">
                  <div className="flex items-start justify-between gap-6 mb-10">
                    <div className="flex items-center gap-5 min-w-0">
                      <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-white/5 overflow-hidden flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500 relative">
                        <img 
                          src={stream.host.image ? getFullImageUrl(stream.host.image) : `https://ui-avatars.com/api/?name=${encodeURIComponent(stream.host.name)}&background=10b981&color=fff`} 
                          className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all" 
                        />
                        <div className="absolute inset-0 bg-black/20" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xl font-bold text-white truncate tracking-tight group-hover:text-emerald-400 transition-colors uppercase italic leading-none mb-2">{stream.title}</h3>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest italic leading-none">{stream.host.name}</p>
                      </div>
                    </div>
                    <div className="relative">
                      <button onClick={() => setOpenMenuId(openMenuId === stream._id ? null : stream._id)} className="w-12 h-12 rounded-2xl bg-zinc-950 border border-white/5 text-zinc-600 hover:text-white hover:bg-white/5 transition-all shadow-inner flex items-center justify-center">
                        <MoreVertical size={20} />
                      </button>
                      <AnimatePresence>
                        {openMenuId === stream._id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute bottom-full right-0 mb-4 w-64 bg-zinc-900 border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-30 p-3 overflow-hidden backdrop-blur-2xl"
                          >
                            <div className="px-5 py-3 border-b border-white/5 mb-2">
                               <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest italic">Signal Protocol</p>
                            </div>
                            <button onClick={() => { setSelectedStream(stream); setOpenMenuId(null); }} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest italic text-zinc-400 hover:text-white hover:bg-white/5 transition-all group/opt">
                              <BarChart3 size={18} className="group-hover/opt:scale-110 transition-transform" /> Telemetry Log
                            </button>
                            {stream.isRecorded && (
                              <button onClick={() => handleStreamAction(stream._id, 'delete-recording')} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest italic text-rose-500 hover:bg-rose-500/10 transition-all group/opt">
                                <Trash2 size={18} className="group-hover/opt:scale-110 transition-transform" /> Purge Artifact
                              </button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-8 border-t border-white/5">
                    <div className="flex items-center gap-10">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-blue-500/5 rounded-xl flex items-center justify-center border border-blue-500/10">
                            <Users size={14} className="text-blue-500" />
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-white tabular-nums italic leading-none">{(stream.currentViewers || 0).toLocaleString()}</span>
                            <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest italic mt-1">Reach</span>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-emerald-500/5 rounded-xl flex items-center justify-center border border-emerald-500/10">
                            <Zap size={14} className="text-emerald-500" />
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-white tabular-nums italic leading-none">${stream.totalGiftValue || 0}</span>
                            <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest italic mt-1">Fiscal</span>
                         </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-1.5 bg-zinc-950 border border-white/5 rounded-xl shadow-inner">
                      <HardDrive size={12} className={stream.isRecorded ? "text-emerald-500" : "text-zinc-800"} />
                      <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic">
                        {stream.isRecorded ? 'RECORD_LOCKED' : 'NO_ARTIFACT'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </AnimatePresence>

      {/* Telemetry Console */}
      <AnimatePresence>
        {selectedStream && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl" onClick={() => setSelectedStream(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="premium-card w-full max-w-xl shadow-[0_30px_100px_rgba(0,0,0,1)] border-emerald-500/10 p-12 bg-[#0a0a0a]" onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-10">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 bg-zinc-950 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                      <BarChart3 className="text-emerald-500" size={28} />
                   </div>
                   <div>
                      <h3 className="text-2xl font-bold text-white uppercase tracking-tighter italic leading-none mb-1.5">Transmission Telemetry</h3>
                      <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em] italic">Protocol Trace: {selectedStream._id.slice(-12).toUpperCase()}</p>
                   </div>
                </div>
                <button onClick={() => setSelectedStream(null)} className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-white/5 text-zinc-500 transition-all border border-white/5 shadow-inner"><X size={24} /></button>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-12">
                {[
                  { label: 'Peak Reach', value: selectedStream.peakViewers, icon: Signal, color: 'text-blue-500', bg: 'bg-blue-500/5' },
                  { label: 'Fiscal Volume', value: `$${selectedStream.totalGiftValue || 0}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
                  { label: 'Total Syncs', value: selectedStream.totalViewers, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/5' },
                  { label: 'Artifact Density', value: selectedStream.totalGiftsReceived, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/5' },
                ].map(metric => (
                  <div key={metric.label} className="bg-zinc-950 border border-white/5 p-8 rounded-[2rem] text-center shadow-inner hover:border-emerald-500/20 transition-all group/met">
                    <div className={`w-12 h-12 ${metric.bg} rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/5 group-hover/met:scale-110 transition-transform duration-500`}>
                       <metric.icon size={20} className={metric.color} />
                    </div>
                    <p className="text-3xl font-bold text-white tracking-tighter italic tabular-nums leading-none mb-2">{metric.value || 0}</p>
                    <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest italic">{metric.label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-6 pt-10 border-t border-white/5">
                {[
                  { label: 'Induction Category', value: selectedStream.category.toUpperCase() },
                  { label: 'Primary Host', value: selectedStream.host.name.toUpperCase() },
                  { label: 'Protocol Init', value: selectedStream.actualStartTime ? new Date(selectedStream.actualStartTime).toLocaleString().toUpperCase() : 'N/A' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center px-4 py-3 bg-zinc-950 border border-white/5 rounded-2xl shadow-inner">
                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em] italic">{item.label}</span>
                    <span className="text-[11px] text-white font-bold tracking-widest italic">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Recording Player Console */}
      <AnimatePresence>
        {viewingRecording && (
          <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl flex items-center justify-center z-[130]" onClick={() => setViewingRecording(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="max-w-7xl w-full mx-6 aspect-video relative rounded-[4rem] overflow-hidden border border-white/10 shadow-[0_50px_150px_rgba(0,0,0,1)]" onClick={e => e.stopPropagation()}
            >
              <video src={viewingRecording.recordingUrl} controls autoPlay className="w-full h-full object-cover" />
              <div className="absolute top-8 left-8 right-8 flex items-center justify-between pointer-events-none z-30">
                 <div className="px-6 py-3 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10">
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic">ARCHIVE_PLAYBACK: {viewingRecording.title.toUpperCase()}</p>
                 </div>
                 <button onClick={() => setViewingRecording(null)} className="w-16 h-16 rounded-[2rem] bg-black/80 backdrop-blur-xl text-white pointer-events-auto border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all">
                    <X size={28} />
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Monitoring Modal Overlay */}
      <AnimatePresence>
        {monitoringStream && (
          <MonitoringModal stream={monitoringStream} onClose={() => setMonitoringStream(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveStreamManagement;
