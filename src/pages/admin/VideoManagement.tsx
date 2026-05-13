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
  Settings, Monitor, BarChart3, HardDrive, RefreshCw
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
            // Handle the case where rData.data might be the array
            setRecordedStreams(Array.isArray(rData) ? rData : (rData as any).data || []);
        } catch (err: any) {
            toast.error('Failed to synchronize media library');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const filteredVideos = (activeTab === 'uploaded' ? videos : []).filter(v =>
        v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.artist.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredRecorded = (activeTab === 'recorded' ? recordedStreams : []).filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.host.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        const loadingId = toast.loading('Processing transmission...');

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
                toast.error('Source media required', { id: loadingId });
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
                toast.success('Media updated', { id: loadingId });
            } else {
                await videoService.createVideo(videoPayload);
                toast.success('Media deployed to feed', { id: loadingId });
            }
            setIsFormOpen(false);
            fetchInitialData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || 'Transmission failed', { id: loadingId });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!videoToDelete) return;
        setLoading(true);
        try {
            await videoService.deleteVideo(videoToDelete);
            toast.success('Media purged');
            setVideoToDelete(null);
            setIsDialogOpen(false);
            fetchInitialData();
        } catch (err: any) {
            toast.error('Failed to purge media');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                        <Film className="text-emerald-500" size={32} />
                        Reels & Video
                    </h1>
                    <p className="text-zinc-500">Manage cinematic assets and promote recorded streams to the global feed.</p>
                </div>
                <button
                    onClick={() => handleOpenForm()}
                    className="btn-primary flex items-center gap-2 !px-8 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                >
                    <Plus size={18} />
                    Upload Video
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Cinematic Repository', value: videos.length, icon: Film, color: 'text-blue-500', bg: 'bg-blue-500/5' },
                    { label: 'Global Reach', value: videos.reduce((acc, v) => acc + (v.views || 0), 0).toLocaleString(), icon: Eye, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
                    { label: 'Active Signals', value: videos.filter(v => v.isActive).length, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/5' },
                    { label: 'Linked Assets', value: videos.filter(v => v.song).length, icon: Music, color: 'text-purple-500', bg: 'bg-purple-500/5' },
                ].map((s, i) => (
                    <div key={i} className="premium-card">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 ${s.bg}`}>
                            <s.icon size={20} className={s.color} />
                        </div>
                        <p className="text-zinc-500 text-xs font-medium mb-1">{s.label}</p>
                        <p className="text-2xl font-bold text-white tracking-tight">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-1 flex items-center gap-1">
                    <button
                        onClick={() => setActiveTab('uploaded')}
                        className={`px-6 py-2 rounded-2xl text-xs font-semibold transition-all ${activeTab === 'uploaded' ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Uploaded Videos
                    </button>
                    <button
                        onClick={() => setActiveTab('recorded')}
                        className={`px-6 py-2 rounded-2xl text-xs font-semibold transition-all ${activeTab === 'recorded' ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Stream Recordings (VOD)
                    </button>
                </div>
                <div className="relative w-full md:max-w-xs">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search media repository..."
                        className="input-field pl-11"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="premium-card !p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Asset</th>
                                <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Origin / Host</th>
                                <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Association</th>
                                <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Integrity</th>
                                <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {activeTab === 'uploaded' ? (
                                filteredVideos.map((video) => (
                                    <tr key={video._id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-20 aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-white/5 relative group-hover:border-emerald-500/20 transition-all">
                                                    <img
                                                        src={video.thumbnailUrl || (video.song?.coverArt ? getFullImageUrl(video.song.coverArt) : '')}
                                                        alt={video.title}
                                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Play className="text-white fill-white" size={16} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">{video.title}</p>
                                                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">{video.pushedToFeed ? '🔥 Featured' : 'Registry'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium text-zinc-400">{video.artist?.name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {video.song ? (
                                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center gap-2 w-fit">
                                                    <Music size={12} /> {video.song.name}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-zinc-700 uppercase italic">Unlinked</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${video.isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                                                {video.isActive ? 'Active' : 'Offline'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleOpenForm(video)} className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all"><Edit size={18} /></button>
                                                <button onClick={() => { setVideoToDelete(video._id); setIsDialogOpen(true); }} className="p-2 rounded-lg text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                filteredRecorded.map((stream) => (
                                    <tr key={stream._id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-20 aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-white/5 relative group-hover:border-emerald-500/20 transition-all">
                                                    <img
                                                        src={getFullImageUrl(stream.coverImage)}
                                                        alt={stream.title}
                                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Play className="text-white fill-white" size={16} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">{stream.title}</p>
                                                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">Stream Archive</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium text-zinc-400">{stream.host.name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-zinc-500/10 text-zinc-500 border border-white/5 flex items-center gap-2 w-fit">
                                                <Radio size={12} /> LiveKit VOD
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {stream.isRecorded && stream.recordingUrl ? (
                                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Persisted</span>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">Syncing...</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleOpenForm(stream, true)}
                                                disabled={!stream.recordingUrl}
                                                className="px-4 py-2 bg-emerald-500 text-black text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:grayscale"
                                            >
                                                Promote to Reels
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {(activeTab === 'uploaded' ? filteredVideos : filteredRecorded).length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-24 text-center">
                                        <VideoIcon className="h-12 w-12 text-zinc-800 mx-auto mb-4" />
                                        <p className="text-zinc-500 font-medium">No media assets detected in this frequency.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Video Modal Form */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => !uploading && setIsFormOpen(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="premium-card w-full max-w-2xl relative z-70 shadow-2xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{selectedVideo ? 'Edit Cinematic Asset' : 'Deploy New Asset'}</h2>
                                        <p className="text-xs text-zinc-500 mt-1">Configure media parameters for the global feed.</p>
                                    </div>
                                    <button
                                        disabled={uploading}
                                        onClick={() => setIsFormOpen(false)}
                                        className="p-2 hover:bg-white/5 rounded-full transition-colors disabled:opacity-50"
                                    >
                                        <XCircle className="text-zinc-500" size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Asset Title</label>
                                            <input
                                                required className="input-field"
                                                placeholder="e.g. Midnight City (VOD Archive)"
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Identity / Artist</label>
                                            <div className="relative">
                                                <select
                                                    required className="input-field appearance-none"
                                                    value={formData.artistId}
                                                    onChange={e => setFormData({ ...formData, artistId: e.target.value, songId: '' })}
                                                >
                                                    <option value="">Select Primary Identity</option>
                                                    {artists.map(a => (
                                                        <option key={a._id} value={a._id}>{a.name}</option>
                                                    ))}
                                                </select>
                                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 rotate-90 pointer-events-none" size={16} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Description</label>
                                        <textarea
                                            disabled={uploading} className="input-field h-24 resize-none"
                                            placeholder="Enter cinematic description..."
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>

                                    {/* Media Source Section */}
                                    {!formData.videoUrl && (
                                        <div className="space-y-4">
                                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Payload Source</label>
                                            <div
                                                onClick={() => !uploading && videoInputRef.current?.click()}
                                                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${videoFile ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/5 hover:border-emerald-500/20 bg-zinc-950'} ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <input
                                                    type="file" ref={videoInputRef} className="hidden"
                                                    accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                                />
                                                {videoFile ? (
                                                    <div className="flex items-center gap-4">
                                                        <VideoIcon className="text-emerald-500" size={32} />
                                                        <div className="text-left">
                                                            <p className="text-sm font-bold text-white">{videoFile.name}</p>
                                                            <p className="text-xs text-zinc-500 font-mono">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                                        </div>
                                                        {videoProgress === 100 && <CheckCircle2 className="text-emerald-500" size={20} />}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center">
                                                        <Upload className="text-zinc-700 mb-3" size={32} />
                                                        <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Select Video File</p>
                                                        <p className="text-[10px] text-zinc-600 mt-2 font-mono">MP4, WEBM, MOV up to 500MB</p>
                                                    </div>
                                                )}
                                            </div>
                                            {videoProgress > 0 && videoProgress < 100 && (
                                                <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${videoProgress}%` }} className="bg-emerald-500 h-full shadow-[0_0_10px_#10b981]" />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Asset Link (Optional)</label>
                                            <div className="relative">
                                                <select
                                                    disabled={uploading} className="input-field appearance-none"
                                                    value={formData.songId}
                                                    onChange={e => setFormData({ ...formData, songId: e.target.value })}
                                                >
                                                    <option value="">No Registry Link</option>
                                                    {filteredSongs.map(s => (
                                                        <option key={s._id} value={s._id}>{s.name}</option>
                                                    ))}
                                                </select>
                                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 rotate-90 pointer-events-none" size={16} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Visual Index</label>
                                            <div
                                                onClick={() => !uploading && thumbInputRef.current?.click()}
                                                className={`h-[50px] border rounded-2xl flex items-center px-4 cursor-pointer transition-all ${thumbnailFile ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/5 bg-zinc-950 hover:border-emerald-500/20'} ${uploading ? 'opacity-50' : ''}`}
                                            >
                                                <input
                                                    type="file" ref={thumbInputRef} className="hidden"
                                                    accept="image/*" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                                                />
                                                <div className="flex items-center gap-3 truncate">
                                                    {thumbnailFile ? (
                                                        <>
                                                            <Check className="text-emerald-500 shrink-0" size={14} />
                                                            <span className="text-[11px] font-bold text-white truncate uppercase tracking-widest">{thumbnailFile.name}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload size={14} className="text-zinc-600 shrink-0" />
                                                            <span className="text-[11px] font-bold text-zinc-500 truncate uppercase tracking-widest">Select Image</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                        <div className="flex items-center gap-4">
                                            <button 
                                                type="button"
                                                onClick={() => setFormData({ ...formData, pushedToFeed: !formData.pushedToFeed })}
                                                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${formData.pushedToFeed ? 'bg-emerald-500' : 'bg-zinc-800'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${formData.pushedToFeed ? 'left-7 shadow-[0_0_10px_white]' : 'left-1'}`} />
                                            </button>
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Promote to Home Feed</span>
                                        </div>
                                        
                                        {uploading && (
                                            <div className="flex items-center gap-2 text-emerald-500">
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Syncing Media...</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="button" disabled={uploading}
                                            onClick={() => setIsFormOpen(false)}
                                            className="flex-1 btn-secondary !py-4"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={uploading || (!selectedVideo && !videoFile && !formData.videoUrl)}
                                            className="flex-1 btn-primary !py-4"
                                        >
                                            {uploading ? 'Processing Media...' : (selectedVideo ? 'Update Metadata' : 'Deploy to Feed')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmDialog
                isOpen={isDialogOpen}
                onCancel={() => setIsDialogOpen(false)}
                onConfirm={handleDelete}
                title="Purge Cinematic Asset?"
                message="Are you sure you want to delete this video? This protocol cannot be undone."
                confirmLabel="Purge Media"
                cancelLabel="Abort"
            />
        </div>
    );
};

export default VideoManagement;
