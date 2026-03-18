import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Music2, User, Disc, Tag, Clock, Calendar, FileText, Save, Loader2 } from 'lucide-react';
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
    const [loading, setLoading] = useState(true);

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
        try {
            const cleanedData: Partial<CreateSongData> = {
                ...formData,
                album: formData.album && formData.album.trim() !== '' ? formData.album : undefined,
            };

            // 1. Get Presigned URLs & Upload to S3
            toast.loading('Uploading media to S3...', { id: 'upload' });
            
            // Audio Upload
            const audioPresign = await songService.getPresignedUrl('song-audio', audioFile.name, audioFile.type);
            await songService.uploadToS3(audioPresign.uploadUrl, audioFile, audioFile.type);
            cleanedData.audioFileKey = audioPresign.key;
            cleanedData.audioFile = audioPresign.publicUrl;

            // Cover Art Upload (if applicable)
            if (coverArtFile) {
                const coverPresign = await songService.getPresignedUrl('cover-art', coverArtFile.name, coverArtFile.type);
                await songService.uploadToS3(coverPresign.uploadUrl, coverArtFile, coverArtFile.type);
                cleanedData.coverArtKey = coverPresign.key;
                cleanedData.coverArt = coverPresign.publicUrl;
            }

            toast.loading('Saving song details...', { id: 'upload' });

            // 2. Create Song Record in DB
            await songService.createSong(cleanedData as CreateSongData);

            toast.success('Song created successfully', { id: 'upload' });
            navigate('/admin/song-management');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create song', { id: 'upload' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Preloader isVisible text="Preparing environment..." />;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <button
                type="button"
                onClick={() => navigate('/admin/song-management')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Song Management
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
            >
                <div className="mb-8 pb-6 border-b border-gray-100">
                    <h1 className="text-3xl font-bold text-gray-800">Add New Song</h1>
                    <p className="text-gray-500 mt-2">Fill in the details to publish a new song to the platform</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Left: Media Uploads */}
                        <div className="md:col-span-1 space-y-6">
                            <FileUpload
                                label="Cover Art"
                                onFileSelect={handleCoverArtSelect}
                                onFileRemove={() => {
                                    setCoverArtFile(null);
                                    setFormData((prev) => ({ ...prev, coverArt: '' }));
                                }}
                            />
                            <FileUpload
                                label="Audio File"
                                fileType="audio"
                                maxSize={50}
                                onFileSelect={setAudioFile}
                                onFileRemove={() => setAudioFile(null)}
                            />
                            {!audioFile && <p className="text-xs text-red-500">Audio file is mandatory</p>}
                        </div>

                        {/* Right: Metadata Fields */}
                        <div className="md:col-span-2 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <Music2 className="w-4 h-4 text-emerald-500" /> Song Title
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. Midnight City"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <User className="w-4 h-4 text-emerald-500" /> Artist
                                    </label>
                                    <select
                                        name="artist"
                                        value={formData.artist}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white transition-all"
                                    >
                                        <option value="">Select Artist...</option>
                                        {artists.map((a) => (
                                            <option key={a._id} value={a._id}>{a.name || `${a.firstName} ${a.lastName}`}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <Disc className="w-4 h-4 text-emerald-500" /> Album
                                    </label>
                                    <select
                                        name="album"
                                        value={formData.album}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white transition-all"
                                    >
                                        <option value="">Single (No Album)</option>
                                        {albums.map((al) => (
                                            <option key={al._id} value={al._id}>{al.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-emerald-500" /> Genre
                                    </label>
                                    <select
                                        name="genre"
                                        value={formData.genre}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white transition-all"
                                    >
                                        <option value="">Select Genre...</option>
                                        {genres.map((g) => (
                                            <option key={g._id} value={g._id}>{g.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-emerald-500" /> Duration (sec)
                                    </label>
                                    <input
                                        type="number"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-emerald-500" /> Release Date
                                </label>
                                <input
                                    type="date"
                                    name="releaseDate"
                                    value={formData.releaseDate}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-emerald-500" /> Lyrics
                                </label>
                                <textarea
                                    name="lyrics"
                                    value={formData.lyrics}
                                    onChange={handleInputChange}
                                    rows={5}
                                    placeholder="Paste lyrics here..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/song-management')}
                            className="px-8 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 transition-all shadow-sm"
                        >
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Create Song
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default SongCreate;
