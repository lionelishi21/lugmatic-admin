import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import artistService, { Artist } from '../../services/artistService';
import songService, { Song } from '../../services/songService';
import uploadService from '../../services/uploadService';
import { getFullImageUrl } from '../../services/api';
import { 
  Film, Plus, Search, Edit, Trash2, Play, 
  CheckCircle2, Music, Eye, Video as VideoIcon, 
  XCircle, Upload, Check, Radio, Signal, Clock, 
  MoreVertical, ChevronRight, Share2, Zap, 
  Settings, Monitor, BarChart3, HardDrive, RefreshCw,
  Globe, Target, Cpu, ArrowUpRight, Layers, Database,
  Save, Info, Waves, Wifi, LayoutGrid, List, ChevronDown,
  Lock, Unlock, Shield, Camera, Mic, Volume2, User
} from 'lucide-react';
import Preloader from '../../components/ui/Preloader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import videoService, { Video as VideoType, VideoFormData } from '../../services/videoService';
import { adminGetAllStreams, type LiveStream } from '../../services/liveStreamService';

const VideoManagement: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'uploaded' | 'recorded'>('uploaded');
    const [videos, setVideos] = useState<VideoType[]>([]);
    const [recordedStreams, setRecordedStreams] = useState<LiveStream[]>([]);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);

    // File upload state
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [videoProgress, setVideoProgress] = useState<number>(0);
    const [thumbnailProgress, setThumbnailProgress] = useState<number>(0);
    const [uploading, setUploading] = useState<boolean>(false);

    const videoInputRef = React.useRef<HTMLInputElement>(null);
    const thumbInputRef = React.useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<VideoFormData>({
        title: '',
        description: '',
        videoUrl: '',
        thumbnailUrl: '',
        artistId: '',
        songId: '',
        pushedToFeed: false
    });

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [vData, aData, sData, rData] = await Promise.all([
                videoService.getAllVideos(),
                artistService.getAllArtists(),
                songService.getAllSongs(),
                adminGetAllStreams({ status: 'recorded', limit: 50 })
            ]);
            setVideos(vData);
            setArtists(aData);
            setSongs(sData);
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

    const filteredSongs = songs.filter(s => {
        const artistId = typeof s.artist === 'string' ? s.artist : s.artist?._id;
        return artistId === formData.artistId;
    });

    const handleOpenForm = (video?: VideoType | LiveStream, isRecorded = false) => {
        setVideoFile(null);
        setThumbnailFile(null);
        setVideoProgress(0);
        setThumbnailProgress(0);

        if (isRecorded) {
            const stream = video as LiveStream;
            setSelectedVideo(null);
            setFormData({
                title: stream.title,
                description: stream.description || '',
                videoUrl: stream.recordingUrl || '',
                thumbnailUrl: getFullImageUrl(stream.coverImage) || '',
                artistId: stream.hostUser?._id || '',
                songId: '',
                pushedToFeed: true
            });
        } else if (video) {
            const v = video as VideoType;
            setSelectedVideo(v);
            setFormData({
                title: v.title,
                description: v.description || '',
                videoUrl: v.videoUrl,
                thumbnailUrl: v.thumbnailUrl || '',
                artistId: v.artist?._id || '',
                songId: v.song?._id || '',
                pushedToFeed: v.pushedToFeed
            });
        } else {
            setSelectedVideo(null);
            setFormData({
                title: '',
                description: '',
                videoUrl: '',
                thumbnailUrl: '',
                artistId: '',
                songId: '',
                pushedToFeed: false
            });
        }
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        const loadingId = toast.loading('Uploading video details...');

        try {
            let finalVideoUrl = formData.videoUrl;
            let finalThumbnailUrl = formData.thumbnailUrl;

            if (videoFile) {
                const presign = await uploadService.getPresignedVideoUrl(videoFile.name, videoFile.type);
                await uploadService.uploadToS3(presign.uploadUrl, videoFile, (progress) => {
                    setVideoProgress(progress);
                });
                finalVideoUrl = presign.publicUrl;
            } else if (!selectedVideo && !videoFile && !formData.videoUrl) {
                toast.error('Video file is required', { id: loadingId });
                setUploading(false);
                return;
            }

            if (thumbnailFile) {
                const presign = await uploadService.getPresignedThumbnailUrl(thumbnailFile.name, thumbnailFile.type);
                await uploadService.uploadToS3(presign.uploadUrl, thumbnailFile, (progress) => {
                    setThumbnailProgress(progress);
                });
                finalThumbnailUrl = presign.publicUrl;
            }

            const videoPayload = {
                ...formData,
                videoUrl: finalVideoUrl,
                thumbnailUrl: finalThumbnailUrl
            };

            if (selectedVideo) {
                await videoService.updateVideo(selectedVideo._id, videoPayload);
                toast.success('Video updated successfully', { id: loadingId });
            } else {
                await videoService.createVideo(videoPayload);
                toast.success('Video uploaded successfully', { id: loadingId });
            }
            setIsFormOpen(false);
            fetchInitialData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || 'Upload failed', { id: loadingId });
        } finally {
            setUploading(false);
        }
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
                    onClick={() => handleOpenForm()}
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
                                                <button onClick={() => handleOpenForm(video)} className="w-12 h-12 rounded-2xl flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 text-zinc-600 hover:text-zinc-900 dark:text-white hover:bg-emerald-500/20 transition-all shadow-inner" title="Edit Video"><Edit size={20} /></button>
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
                                                onClick={() => handleOpenForm(stream, true)}
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

            {/* Video Upload Form Modal */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl" onClick={() => !uploading && setIsFormOpen(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="premium-card w-full max-w-2xl shadow-[0_30px_100px_rgba(0,0,0,1)] border-emerald-500/10 p-12 bg-white dark:bg-[#0a0a0a]"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-10 border-b border-black/5 dark:border-white/5 pb-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-950 rounded-2xl flex items-center justify-center border border-black/5 dark:border-white/5 shadow-inner">
                                       {selectedVideo ? <Edit className="text-emerald-500" size={28} /> : <Upload className="text-emerald-500" size={28} />}
                                    </div>
                                    <div>
                                       <h3 className="text-2xl font-bold text-zinc-900 dark:text-white uppercase tracking-tighter italic leading-none mb-1.5">{selectedVideo ? 'Edit Video details' : 'Upload Video'}</h3>
                                       <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Video Catalog Form</p>
                                    </div>
                                </div>
                                <button disabled={uploading} onClick={() => setIsFormOpen(false)} className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-black/5 dark:bg-white/5 text-zinc-500 transition-all border border-black/5 dark:border-white/5 shadow-inner disabled:opacity-50"><X size={24} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Video Title <span className="text-emerald-500">*</span></label>
                                        <input
                                            required className="w-full h-16 px-8 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-2xl text-zinc-900 dark:text-white text-[11px] font-bold tracking-wide uppercase focus:outline-none focus:border-emerald-500/30 transition-all shadow-inner placeholder:text-zinc-800"
                                            placeholder="Enter video title"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Artist</label>
                                        <div className="relative group/sel">
                                            <select
                                                required className="w-full h-16 px-8 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-2xl text-zinc-900 dark:text-white text-[11px] font-bold tracking-wide uppercase focus:outline-none focus:border-emerald-500/30 appearance-none shadow-inner transition-all cursor-pointer"
                                                value={formData.artistId}
                                                onChange={e => setFormData({ ...formData, artistId: e.target.value, songId: '' })}
                                            >
                                                <option value="">Select Artist</option>
                                                {artists.map(a => (
                                                    <option key={a._id} value={a._id}>{a.name.toUpperCase()}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-800 pointer-events-none group-focus-within/sel:rotate-180 duration-500 transition-all group-focus-within/sel:text-emerald-500" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Description</label>
                                    <textarea
                                        disabled={uploading} className="w-full p-8 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-3xl text-zinc-700 dark:text-zinc-300 text-[11px] font-bold tracking-wide focus:outline-none focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-inner resize-none h-32 leading-relaxed placeholder:text-zinc-800"
                                        placeholder="Provide description for this video..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                {/* Video Upload Area */}
                                {!formData.videoUrl && (
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Upload Video File</label>
                                        <div
                                            onClick={() => !uploading && videoInputRef.current?.click()}
                                            className={`border-2 border-dashed rounded-[2.5rem] p-12 flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden ${videoFile ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'border-white/5 hover:border-emerald-500/20 bg-zinc-950 shadow-inner'} ${uploading ? 'opacity-50 cursor-not-allowed' : ''} group/up`}
                                        >
                                            <input
                                                type="file" ref={videoInputRef} className="hidden"
                                                accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                            />
                                            {videoFile ? (
                                                <div className="flex items-center gap-6 relative z-10">
                                                    <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                                                       <VideoIcon className="text-emerald-500" size={32} />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight">{videoFile.name}</p>
                                                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to Upload</p>
                                                    </div>
                                                    {videoProgress === 100 && <CheckCircle2 className="text-emerald-500 ml-4" size={24} />}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center relative z-10">
                                                    <div className="w-20 h-20 bg-zinc-900 rounded-[2rem] flex items-center justify-center mb-6 border border-black/5 dark:border-white/5 shadow-2xl group-hover/up:scale-110 transition-transform duration-700">
                                                       <Upload className="text-zinc-700 group-hover/up:text-emerald-500 transition-colors" size={32} />
                                                    </div>
                                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Select Video File</p>
                                                    <p className="text-[9px] text-zinc-700 mt-3 font-bold uppercase tracking-widest opacity-60">MP4, WEBM, MOV • Max file size: 500MB</p>
                                                </div>
                                            )}
                                        </div>
                                        {videoProgress > 0 && videoProgress < 100 && (
                                            <div className="px-1">
                                               <div className="w-full bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-full h-2 overflow-hidden shadow-inner">
                                                  <motion.div initial={{ width: 0 }} animate={{ width: `${videoProgress}%` }} className="bg-emerald-500 h-full shadow-[0_0_15px_#10b981]" />
                                               </div>
                                               <p className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest mt-2 text-right">Uploading: {videoProgress}%</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Link to Song</label>
                                        <div className="relative group/sel">
                                            <select
                                                disabled={uploading} className="w-full h-16 px-8 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-2xl text-zinc-900 dark:text-white text-[11px] font-bold tracking-wide uppercase focus:outline-none focus:border-emerald-500/30 appearance-none shadow-inner transition-all cursor-pointer"
                                                value={formData.songId}
                                                onChange={e => setFormData({ ...formData, songId: e.target.value })}
                                            >
                                                <option value="">No Linked Song</option>
                                                {filteredSongs.map(s => (
                                                    <option key={s._id} value={s._id}>{s.name.toUpperCase()}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-800 pointer-events-none group-focus-within/sel:rotate-180 duration-500 transition-all group-focus-within/sel:text-emerald-500" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Thumbnail Image</label>
                                        <div
                                            onClick={() => !uploading && thumbInputRef.current?.click()}
                                            className={`h-16 px-8 border rounded-2xl flex items-center justify-between cursor-pointer transition-all ${thumbnailFile ? 'border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-white/5 bg-zinc-950 hover:border-emerald-500/20 shadow-inner'} ${uploading ? 'opacity-50' : ''} group/th`}
                                        >
                                            <input
                                                type="file" ref={thumbInputRef} className="hidden"
                                                accept="image/*" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                                            />
                                            <div className="flex items-center gap-4 truncate">
                                                {thumbnailFile ? (
                                                    <>
                                                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                                                           <Check className="text-emerald-500" size={18} />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-zinc-900 dark:text-white truncate uppercase tracking-widest">{thumbnailFile.name}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload size={18} className="text-zinc-700 group-hover/th:text-emerald-500 transition-colors" />
                                                        <span className="text-[10px] font-bold text-zinc-600 truncate uppercase tracking-widest">Select Image</span>
                                                    </>
                                                )}
                                            </div>
                                            <ImageIcon size={18} className="text-zinc-800 group-hover/th:text-zinc-600 transition-colors" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-10 border-t border-black/5 dark:border-white/5">
                                    <div className="flex items-center gap-6">
                                        <button 
                                            type="button"
                                            onClick={() => setFormData({ ...formData, pushedToFeed: !formData.pushedToFeed })}
                                            className={`relative w-14 h-7 rounded-full transition-all duration-500 ${formData.pushedToFeed ? 'bg-emerald-500' : 'bg-zinc-800 border border-white/5'}`}
                                        >
                                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-500 ${formData.pushedToFeed ? 'left-8 shadow-[0_0_15px_white]' : 'left-1'}`} />
                                        </button>
                                        <div>
                                           <span className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em] block">Promote to Reels</span>
                                           <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest block mt-1">Directly feature this video in the Reels feed</span>
                                        </div>
                                    </div>
                                    
                                    {uploading && (
                                        <div className="flex items-center gap-3 text-emerald-500">
                                            <RefreshCw className="h-5 w-5 animate-spin" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Uploading Video...</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-6 pt-6">
                                    <button
                                        type="button" disabled={uploading}
                                        onClick={() => setIsFormOpen(false)}
                                        className="flex-1 h-16 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-black/5 dark:border-white/5 hover:bg-black/5 dark:bg-white/5 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading || (!selectedVideo && !videoFile && !formData.videoUrl)}
                                        className="flex-1 h-16 bg-white text-black rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-2xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-4 group"
                                    >
                                        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} className="group-hover:translate-y-1 transition-transform" />}
                                        {selectedVideo ? 'Save Changes' : 'Upload Video'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
