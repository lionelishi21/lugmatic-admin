import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    Film, Plus, Search, Edit, Trash2,
    Play, CheckCircle2,
    Music, Eye, Video, XCircle
} from 'lucide-react';

import Preloader from '../../components/ui/Preloader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import videoService, { Video as VideoType, VideoFormData } from '../../services/videoService';
import artistService, { Artist } from '../../services/artistService';
import songService, { Song } from '../../services/songService';
import { getFullImageUrl } from '../../services/api';

const VideoManagement: React.FC = () => {
    const navigate = useNavigate();
    const [videos, setVideos] = useState<VideoType[]>([]);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);

    const [formData, setFormData] = useState<VideoFormData>({
        title: '',
        description: '',
        videoUrl: '',
        thumbnailUrl: '',
        artistId: '',
        songId: '',
        pushedToFeed: false
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [vData, aData, sData] = await Promise.all([
                videoService.getAllVideos(),
                artistService.getAllArtists(),
                songService.getAllSongs()
            ]);
            setVideos(vData);
            setArtists(aData);
            setSongs(sData);
        } catch (err: any) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const filteredVideos = videos.filter(v =>
        v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.artist.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredSongs = songs.filter(s => {
        const artistId = typeof s.artist === 'string' ? s.artist : s.artist?._id;
        return artistId === formData.artistId;
    });

    const handleOpenForm = (video?: VideoType) => {
        if (video) {
            setSelectedVideo(video);
            setFormData({
                title: video.title,
                description: video.description || '',
                videoUrl: video.videoUrl,
                thumbnailUrl: video.thumbnailUrl || '',
                artistId: video.artist?._id || '',
                songId: video.song?._id || '',
                pushedToFeed: video.pushedToFeed
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
        setLoading(true);
        try {
            if (selectedVideo) {
                await videoService.updateVideo(selectedVideo._id, formData);
                toast.success('Video updated successfully');
            } else {
                await videoService.createVideo(formData);
                toast.success('Video created successfully');
            }
            setIsFormOpen(false);
            fetchInitialData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Action failed');
        } finally {
            setLoading(false);
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

    return (
        <div className="space-y-6">
            <Preloader isVisible={loading} />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Video Management</h1>
                    <p className="text-gray-500 mt-1">Manage and upload music videos, link them to tracks</p>
                </div>
                <button
                    onClick={() => handleOpenForm()}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                >
                    <Plus size={20} />
                    Upload New Video
                </button>
            </div>

            {/* Stats (Mock for now) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Videos', value: videos.length, icon: Film, color: 'text-blue-600', bg: 'bg-blue-100' },
                    { label: 'Total Views', value: videos.reduce((acc, v) => acc + (v.views || 0), 0), icon: Eye, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                    { label: 'Active Videos', value: videos.filter(v => v.isActive).length, icon: CheckCircle2, color: 'text-amber-600', bg: 'bg-amber-100' },
                    { label: 'Linked Tracks', value: videos.filter(v => v.song).length, icon: Music, color: 'text-purple-600', bg: 'bg-purple-100' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Search */}
                <div className="p-6 border-b border-gray-100">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by title or artist..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Video Details</th>
                                <th className="px-6 py-4">Artist</th>
                                <th className="px-6 py-4">Linked Song</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Views</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredVideos.map((video) => (
                                <tr key={video._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-20 aspect-video rounded-lg overflow-hidden bg-gray-200 relative group-hover:scale-105 transition-transform shadow-sm">
                                                <img
                                                    src={video.thumbnailUrl || (video.song?.coverArt ? getFullImageUrl(video.song.coverArt) : '')}
                                                    alt={video.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Play className="text-white fill-white" size={16} />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 line-clamp-1">{video.title}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{video.pushedToFeed ? '🔥 Featured in Feed' : 'Standard'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-600">
                                                {video.artist?.name.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{video.artist?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {video.song ? (
                                            <div className="flex items-center gap-2 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold w-fit border border-blue-100">
                                                <Music size={12} />
                                                {video.song.name}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">No link</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {video.isActive ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                                                ACTIVE
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                                                INACTIVE
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-600">
                                            <Eye size={14} className="text-gray-400" />
                                            {video.views?.toLocaleString() || 0}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenForm(video)}
                                                className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setVideoToDelete(video._id);
                                                    setIsDialogOpen(true);
                                                }}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredVideos.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <Film size={48} className="mx-auto text-gray-200 mb-4" />
                                        <h3 className="text-lg font-bold text-gray-400">No videos found</h3>
                                        <p className="text-gray-400 text-sm">Upload your first music video to get started</p>
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
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsFormOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-2xl relative z-70 shadow-2xl overflow-hidden"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{selectedVideo ? 'Edit Video' : 'Add New Video'}</h2>
                                        <p className="text-sm text-gray-500">Configure video details and link it to a track</p>
                                    </div>
                                    <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                        <XCircle className="text-gray-400" size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Video Title</label>
                                            <input
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                                placeholder="e.g. Midnight City (Official Video)"
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Artist</label>
                                            <select
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium appearance-none"
                                                value={formData.artistId}
                                                onChange={e => setFormData({ ...formData, artistId: e.target.value, songId: '' })}
                                            >
                                                <option value="">Select Artist</option>
                                                {artists.map(a => (
                                                    <option key={a._id} value={a._id}>{a.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                                        <textarea
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                            placeholder="Enter video description..."
                                            rows={3}
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Video URL</label>
                                            <input
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                                placeholder="https://s3.lugmatic.com/videos/..."
                                                value={formData.videoUrl}
                                                onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Linked Song (Optional)</label>
                                            <select
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium appearance-none"
                                                value={formData.songId}
                                                disabled={!formData.artistId}
                                                onChange={e => setFormData({ ...formData, songId: e.target.value })}
                                            >
                                                <option value="">No Song Link</option>
                                                {filteredSongs.map(s => (
                                                    <option key={s._id} value={s._id}>{s.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Thumbnail URL (Optional)</label>
                                            <input
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                                placeholder="https://s3.lugmatic.com/images/..."
                                                value={formData.thumbnailUrl}
                                                onChange={e => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex items-center gap-4 pt-6">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={formData.pushedToFeed}
                                                    onChange={e => setFormData({ ...formData, pushedToFeed: e.target.checked })}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                                <span className="ml-3 text-sm font-bold text-gray-700">Push to Feed</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsFormOpen(false)}
                                            className="flex-1 py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20 transition-all"
                                        >
                                            {selectedVideo ? 'Update Video' : 'Save Video'}
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
                title="Delete Video"
                message="Are you sure you want to delete this video? This action cannot be undone."
                confirmLabel="Delete Video"
                cancelLabel="Cancel"
            />
        </div>
    );
};

export default VideoManagement;
