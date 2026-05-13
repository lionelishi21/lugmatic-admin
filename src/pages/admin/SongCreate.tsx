import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Music2, User, Disc, Tag, Clock, 
  Calendar, FileText, Save, Loader2, Upload, 
  Music, CheckCircle2, ChevronRight, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import songService, { CreateSongData } from '../../services/songService';
import albumService, { Album } from '../../services/albumService';
import artistService, { Artist } from '../../services/artistService';
import genreService, { Genre } from '../../services/genreService';
import FileUpload from '../../components/ui/FileUpload';
import Preloader from '../../components/ui/Preloader';

const SongCreate: React.FC = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<Partial<CreateSongData>>({
        name: '',
        artist: '',
        album: '',
        duration: 0,
        genre: '',
        releaseDate: new Date().toISOString().split('T')[0],
        lyrics: '',
        coverArt: '',
        audioFile: '',
    });

    const [coverArtFile, setCoverArtFile] = useState<File | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [artistData, albumData, genreData] = await Promise.all([
                    artistService.getAllArtists(),
                    albumService.getAllAlbums(),
                    genreService.getAllGenres(),
                ]);
                setArtists(artistData);
                setAlbums(albumData);
                setGenres(genreData);
            } catch (err) {
                toast.error('Failed to load dependencies');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'duration' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleCoverArtSelect = async (file: File) => {
        setCoverArtFile(file);
        try {
            const base64 = await songService.uploadCoverArt(file);
            setFormData((prev) => ({ ...prev, coverArt: base64 }));
        } catch {
            toast.error('Failed to process cover art');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!audioFile) {
            toast.error('Audio file is required');
            return;
        }

        setSubmitting(true);
        const loadingId = toast.loading('Synchronizing track data...');
        try {
            const cleanedData: Partial<CreateSongData> = {
                ...formData,
                album: formData.album && formData.album.trim() !== '' ? formData.album : undefined,
            };

            // Audio Upload
            const audioPresign = await songService.getPresignedUrl('song-audio', audioFile.name, audioFile.type);
            await songService.uploadToS3(audioPresign.uploadUrl, audioFile, audioFile.type);
            cleanedData.audioFileKey = audioPresign.key;
            cleanedData.audioFile = audioPresign.publicUrl;

            // Cover Art Upload
            if (coverArtFile) {
                const coverPresign = await songService.getPresignedUrl('cover-art', coverArtFile.name, coverArtFile.type);
                await songService.uploadToS3(coverPresign.uploadUrl, coverArtFile, coverArtFile.type);
                cleanedData.coverArtKey = coverPresign.key;
                cleanedData.coverArt = coverPresign.publicUrl;
            }

            await songService.createSong(cleanedData as CreateSongData);
            toast.success('Track deployed successfully', { id: loadingId });
            navigate('/admin/song-management');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create track', { id: loadingId });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Preloader isVisible text="Initializing creation environment..." />;

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <button
                        onClick={() => navigate('/admin/song-management')}
                        className="flex items-center gap-2 text-zinc-500 hover:text-white mb-6 transition-colors group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-bold uppercase tracking-widest">Back to Library</span>
                    </button>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                        <Music className="text-emerald-500" size={32} />
                        Register New Track
                    </h1>
                    <p className="text-zinc-500">Configure track metadata and deploy cinematic audio assets to the network.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: Media Hub */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="premium-card space-y-6">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <Upload size={14} /> Media Assets
                        </h3>
                        
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Artwork Index</label>
                            <FileUpload
                                onFileSelect={handleCoverArtSelect}
                                onFileRemove={() => {
                                    setCoverArtFile(null);
                                    setFormData((prev) => ({ ...prev, coverArt: '' }));
                                }}
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Master Audio Payload</label>
                            <FileUpload
                                fileType="audio"
                                maxSize={50}
                                onFileSelect={setAudioFile}
                                onFileRemove={() => setAudioFile(null)}
                            />
                            {!audioFile && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest italic animate-pulse">Required Asset Missing</p>}
                        </div>
                    </div>

                    <div className="premium-card p-6 border-emerald-500/10">
                        <div className="flex items-center gap-3 text-emerald-500 mb-4">
                            <CheckCircle2 size={18} />
                            <h4 className="text-xs font-bold uppercase tracking-widest">Pre-flight Status</h4>
                        </div>
                        <ul className="space-y-3">
                            {[
                                { label: 'Metadata Valid', ok: !!formData.name && !!formData.artist },
                                { label: 'Audio Payload', ok: !!audioFile },
                                { label: 'Genre Assignment', ok: !!formData.genre },
                            ].map((check, i) => (
                                <li key={i} className="flex items-center justify-between">
                                    <span className="text-[11px] text-zinc-400">{check.label}</span>
                                    <div className={`w-2 h-2 rounded-full ${check.ok ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-zinc-800'}`} />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Right: Metadata Matrix */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="premium-card space-y-8">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-4">
                            <FileText size={14} /> Metadata Matrix
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Track Title</label>
                                <div className="relative">
                                    <Music2 className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                                    <input
                                        type="text" name="name" required
                                        placeholder="e.g. Midnight City"
                                        className="input-field pl-12"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Primary Artist</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                                    <select
                                        name="artist" required
                                        className="input-field pl-12 appearance-none"
                                        value={formData.artist}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select Artist...</option>
                                        {artists.map((a) => (
                                            <option key={a._id} value={a._id}>{a.name || `${a.firstName} ${a.lastName}`}</option>
                                        ))}
                                    </select>
                                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 rotate-90 pointer-events-none" size={16} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Associated Album</label>
                                <div className="relative">
                                    <Disc className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                                    <select
                                        name="album"
                                        className="input-field pl-12 appearance-none"
                                        value={formData.album}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Single (No Album)</option>
                                        {albums.map((al) => (
                                            <option key={al._id} value={al._id}>{al.name}</option>
                                        ))}
                                    </select>
                                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 rotate-90 pointer-events-none" size={16} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Genre Classification</label>
                                <div className="relative">
                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                                    <select
                                        name="genre" required
                                        className="input-field pl-12 appearance-none"
                                        value={formData.genre}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select Genre...</option>
                                        {genres.map((g) => (
                                            <option key={g._id} value={g._id}>{g.name}</option>
                                        ))}
                                    </select>
                                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 rotate-90 pointer-events-none" size={16} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Duration (sec)</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                                    <input
                                        type="number" name="duration" required
                                        className="input-field pl-12"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Deployment Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                                    <input
                                        type="date" name="releaseDate"
                                        className="input-field pl-12"
                                        value={formData.releaseDate}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Lyric Transmission</label>
                                <textarea
                                    name="lyrics" rows={6}
                                    placeholder="Paste lyrical content here..."
                                    className="input-field h-auto resize-none"
                                    value={formData.lyrics}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-8 border-t border-white/5">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/song-management')}
                                className="btn-secondary !px-10"
                            >
                                Abort
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary !px-12 flex items-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Register Track
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default SongCreate;
