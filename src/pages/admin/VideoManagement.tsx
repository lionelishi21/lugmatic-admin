import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getFullImageUrl } from '../../services/api';
import {
  Film, Plus, Search, Edit, Trash2, Play,
  Music, Eye, Video as VideoIcon,
  XCircle, Upload, Radio, Signal, Clock,
  MoreVertical, ChevronRight, Share2, Zap,
  Settings, Monitor, BarChart3, HardDrive,
  Globe, Target, Cpu, ArrowUpRight, Layers, Database,
  Info, Waves, Wifi, LayoutGrid, List,
  Lock, Unlock, Shield, Camera, Mic, Volume2, User
} from 'lucide-react';
import Preloader from '../../components/ui/Preloader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import videoService, { Video as VideoType } from '../../services/videoService';
import { adminGetAllStreams, type LiveStream } from '../../services/liveStreamService';

const VideoManagement: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'uploaded' | 'recorded'>('uploaded');
    const [videos, setVideos] = useState<VideoType[]>([]);
    const [recordedStreams, setRecordedStreams] = useState<LiveStream[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [videoToDelete, setVideoToDelete] = useState<string | null>(null);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [vData, rData] = await Promise.all([
                videoService.getAllVideos(),
                adminGetAllStreams({ status: 'recorded', limit: 50 })
            ]);
            setVideos(vData);
            setRecordedStreams(Array.isArray(rData) ? rData : (rData as any).data || []);
        } catch (err: any) {
            toast.error('Failed to load media catalog');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const filteredVideos = (activeTab === 'uploaded' ? videos : []).filter(v =>
        v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.artist?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredRecorded = (activeTab === 'recorded' ? recordedStreams : []).filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.host?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePromoteStream = (stream: LiveStream) => {
        navigate('/admin/video-management/add', {
            state: {
                fromStream: {
                    title: stream.title,
                    description: stream.description || '',
                    videoUrl: stream.recordingUrl || '',
                    thumbnailUrl: getFullImageUrl(stream.coverImage) || '',
                    artistId: stream.hostUser?._id || '',
                    songId: '',
                    pushedToFeed: true,
                },
            },
        });
    };

    const handleDelete = async () => {
        if (!videoToDelete) return;
        setLoading(true);
        try {
            await videoService.deleteVideo(videoToDelete);
            toast.success('Video deleted successfully');
            setVideoToDelete(null);
            setIsDialogOpen(false);
            fetchInitialData();
        } catch (err: any) {
            toast.error('Failed to delete video');
        } finally {
            setLoading(false);
        }
    };

    if (loading && videos.length === 0) return <Preloader isVisible text="Loading media library..." />;

    return (
        <div className="space-y-12 pb-24">
            {/* Premium Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white leading-none">Video Management</h1>
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">System: Online</span>
                        </div>
                    </div>
                    <p className="text-zinc-500 text-xs font-semibold ml-1">Manage all music videos, promotional reels, and live stream archives.</p>
                </div>
                <button
                    onClick={() => navigate('/admin/video-management/add')}
                    className="h-16 px-10 bg-white text-black rounded-2xl text-[10px] font-bold hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-4 group border border-black/10 dark:border-white/10"
                >
                    <Plus size={18} />
                    Upload Video
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Total Videos', value: videos.length, icon: Film, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Total Views', value: videos.reduce((acc, v) => acc + (v.views || 0), 0).toLocaleString(), icon: Globe, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Active Videos', value: videos.filter(v => v.isActive).length, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { label: 'Linked Songs', value: videos.filter(v => v.song).length, icon: Music, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                ].map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="premium-card group border-black/5 dark:border-white/5 hover:border-emerald-500/20 transition-all cursor-default relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-bl-full pointer-events-none" />
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${s.bg} border border-black/5 dark:border-white/5 shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform duration-500`}>
                            <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <s.icon size={24} className={s.color} />
                        </div>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">{s.label}</p>
                        <p className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tighter tabular-nums">{s.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="flex bg-zinc-100 dark:bg-zinc-950/40 border border-black/5 dark:border-white/5 rounded-2xl p-1.5 gap-1.5 shadow-inner">
                    <button
                        onClick={() => setActiveTab('uploaded')}
                        className={`px-8 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'uploaded' ? 'bg-white/10 text-white shadow-xl border border-white/5' : 'text-zinc-600 hover:text-zinc-300'}`}
                    >
                        Uploaded Videos
                    </button>
                    <button
                        onClick={() => setActiveTab('recorded')}
                        className={`px-8 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'recorded' ? 'bg-white/10 text-white shadow-xl border border-white/5' : 'text-zinc-600 hover:text-zinc-300'}`}
                    >
                        Live Stream Archives
                    </button>
                </div>
                <div className="relative w-full lg:max-w-md group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 h-5 w-5 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search videos..."
                        className="w-full pl-14 pr-12 h-14 bg-zinc-100 dark:bg-zinc-950/40 border border-black/5 dark:border-white/5 rounded-2xl text-zinc-900 dark:text-white text-[10px] font-bold focus:outline-none focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-inner placeholder:text-zinc-800"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Videos Table */}
            <div className="premium-card !p-0 overflow-hidden border-black/5 dark:border-white/5 shadow-2xl bg-white dark:bg-[#0a0a0a]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-black/5 dark:border-white/5 bg-zinc-100 dark:bg-zinc-950/50">
                                <th className="px-10 py-8 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Video Details</th>
                                <th className="px-10 py-8 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Artist</th>
                                <th className="px-10 py-8 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Linked Song</th>
                                <th className="px-10 py-8 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                                <th className="px-10 py-8 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {activeTab === 'uploaded' ? (
                                filteredVideos.map((video, i) => (
                                    <motion.tr
                                        key={video._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.02 }}
                                        className="hover:bg-emerald-500/[0.01] transition-all group"
                                    >
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-6">
                                                <div className="w-24 aspect-video rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 relative group-hover:border-emerald-500/30 transition-all shadow-inner group-hover:scale-110 transition-all duration-500">
                                                    <img
                                                        src={video.thumbnailUrl || (video.song?.coverArt ? getFullImageUrl(video.song.coverArt) : '')}
                                                        alt={video.title}
                                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20">
                                                        <div className="w-10 h-10 bg-black/10 dark:bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-black/20 dark:border-white/20">
                                                            <Play className="text-zinc-900 dark:text-white fill-zinc-900 dark:fill-white" size={16} />
                                                        </div>
                                                    </div>
                                                    <div className="absolute inset-0 bg-black/20" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors leading-none mb-2 line-clamp-1">{video.title}</p>
                                                    <div className="flex items-center gap-2">
                                                       <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${video.pushedToFeed ? 'bg-amber-500/10 text-amber-500 border border-amber-500/10' : 'bg-zinc-950 text-zinc-600 border border-white/5'}`}>
                                                          {video.pushedToFeed ? 'Featured Reel' : 'Standard Video'}
                                                       </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-3">
                                               <User size={14} className="text-zinc-700" />
                                               <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">{video.artist?.name.toUpperCase()}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            {video.song ? (
                                                <div className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-blue-500/5 text-blue-500/70 border border-blue-500/10 flex items-center gap-2.5 w-fit shadow-inner">
                                                    <Music size={14} /> {video.song.name.toUpperCase()}
                                                </div>
                                            ) : (
                                                <span className="text-[9px] font-black text-zinc-800 uppercase tracking-widest opacity-40">No Linked Song</span>
                                            )}
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-3">
                                               <div className={`w-1.5 h-1.5 rounded-full ${video.isActive ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'}`} />
                                               <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{video.isActive ? 'Active' : 'Inactive'}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                <button onClick={() => navigate(`/admin/video-management/${video._id}/edit`)} className="w-12 h-12 rounded-2xl flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 text-zinc-600 hover:text-zinc-900 dark:text-white hover:bg-emerald-500/20 transition-all shadow-inner" title="Edit Video"><Edit size={20} /></button>
                                                <button onClick={() => { setVideoToDelete(video._id); setIsDialogOpen(true); }} className="w-12 h-12 rounded-2xl flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all shadow-inner" title="Delete Video"><Trash2 size={20} /></button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                filteredRecorded.map((stream, i) => (
                                    <motion.tr
                                        key={stream._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.02 }}
                                        className="hover:bg-emerald-500/[0.01] transition-all group"
                                    >
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-6">
                                                <div className="w-24 aspect-video rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 relative group-hover:border-emerald-500/30 transition-all shadow-inner group-hover:scale-110 transition-all duration-500">
                                                    <img
                                                        src={getFullImageUrl(stream.coverImage)}
                                                        alt={stream.title}
                                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20">
                                                        <div className="w-10 h-10 bg-black/10 dark:bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-black/20 dark:border-white/20">
                                                            <Play className="text-zinc-900 dark:text-white fill-zinc-900 dark:fill-white" size={16} />
                                                        </div>
                                                    </div>
                                                    <div className="absolute inset-0 bg-black/20" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors leading-none mb-2 line-clamp-1">{stream.title}</p>
                                                    <span className="text-[8px] font-black text-zinc-600 border border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-950 px-2 py-0.5 rounded uppercase tracking-widest">Live Stream Archive</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-3">
                                               <User size={14} className="text-zinc-700" />
                                               <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">{stream.host?.name.toUpperCase()}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-zinc-50 dark:bg-zinc-950 text-zinc-500 border border-black/5 dark:border-white/5 flex items-center gap-2.5 w-fit shadow-inner">
                                                <Radio size={14} /> Live Stream VOD
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            {stream.isRecorded && stream.recordingUrl ? (
                                                <div className="flex items-center gap-3">
                                                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                                                   <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Saved</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                   <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-pulse" />
                                                   <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Processing</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <button
                                                onClick={() => handlePromoteStream(stream)}
                                                disabled={!stream.recordingUrl}
                                                className="h-12 px-6 bg-white text-black text-[9px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/10 disabled:opacity-30 disabled:grayscale"
                                            >
                                                Promote to Reels
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                            {(activeTab === 'uploaded' ? filteredVideos : filteredRecorded).length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-10 py-40 text-center">
                                        <div className="w-24 h-24 bg-zinc-50 dark:bg-zinc-950 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-black/5 dark:border-white/5 shadow-2xl group cursor-default">
                                          <VideoIcon size={36} className="text-zinc-800 group-hover:text-emerald-500 transition-colors" />
                                        </div>
                                        <h3 className="text-[10px] font-bold text-zinc-900 dark:text-white uppercase tracking-[0.3em] mb-3">No Videos Found</h3>
                                        <p className="text-[10px] text-zinc-600 font-bold max-w-sm mx-auto opacity-60">No videos found matching your search parameters.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmDialog
                isOpen={isDialogOpen}
                onCancel={() => setIsDialogOpen(false)}
                onConfirm={handleDelete}
                title="Delete Video?"
                message="Are you sure you want to permanently delete this video? This action cannot be undone."
                confirmLabel="Delete"
                cancelLabel="Cancel"
            />
        </div>
    );
};

export default VideoManagement;
