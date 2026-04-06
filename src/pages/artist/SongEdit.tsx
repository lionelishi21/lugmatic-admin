import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, Music2, Disc, Tag, Clock, Calendar, 
  FileText, Save, Play, Pause, AlertCircle,
  CheckCircle, Loader2, Info, Layout
} from 'lucide-react';
import songService, { Song, CreateSongData } from '../../services/songService';
import albumService, { Album } from '../../services/albumService';
import genreService, { Genre } from '../../services/genreService';
import FileUpload from '../../components/ui/FileUpload';
import Preloader from '../../components/ui/Preloader';

const SongEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const [albums, setAlbums] = useState<Album[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);

  const [formData, setFormData] = useState<Partial<CreateSongData>>({});
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  useEffect(() => {
    if (id) fetchSongData(id);
    return () => { audioRef.current?.pause(); };
  }, [id]);

  const fetchSongData = async (songId: string) => {
    setLoading(true);
    try {
      // Note: Using standard getSongById which is available for artists
      const [songData, albumData, genreData] = await Promise.all([
        songService.getSongById(songId),
        albumService.getAllAlbums(), // Ideally this would be filter by artist, but keeping simple for now
        genreService.getAllGenres(),
      ]);

      if (songData.status !== 'rejected') {
        toast.error('This track is not in a restricted editing state. Only rejected tracks can have their audio replaced.');
        navigate('/artist/dashboard');
        return;
      }

      setSong(songData);
      setAlbums(albumData);
      setGenres(genreData);
      populateForm(songData, albumData, genreData);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load track details');
      navigate('/artist/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (s: Song, albumList: Album[], genreList: Genre[]) => {
    const albumId = typeof s.album === 'object' && s.album !== null ? s.album._id :
      albumList.find(a => a._id === s.album || a.name === s.album)?._id || (s.album as string) || '';
    
    // Genre handling: song model might have genre as object or ID string
    const genreId = typeof s.genre === 'object' && s.genre !== null ? s.genre._id :
      genreList.find(g => g._id === s.genre || g.name === s.genre)?._id || (s.genre as string) || '';

    let formattedDate = '';
    if (s.releaseDate) {
      try {
        const d = new Date(s.releaseDate);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toISOString().split('T')[0];
        }
      } catch (e) {
        console.error('Failed to parse release date:', e);
      }
    }

    setFormData({
      name: s.name,
      album: albumId,
      duration: s.duration,
      genre: genreId,
      releaseDate: formattedDate,
      lyrics: s.lyrics,
      coverArt: s.coverArt,
      audioFile: s.audioFile,
      videoUrl: s.videoUrl || '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'duration' ? parseFloat(value) || 0 : value 
    }));
  };

  const handleCoverArtSelect = async (file: File) => {
    setCoverArtFile(file);
    // Base64 preview logic from Admin SongDetail
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, coverArt: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } catch { 
      toast.error('Failed to process cover art preview'); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!song) return;
    
    setSubmitting(true);
    try {
      const cleanedData: Partial<CreateSongData> = {
        ...formData,
        album: formData.album && formData.album.trim() !== '' ? formData.album : undefined,
      };

      if (coverArtFile || audioFile) {
        toast.loading('Uploading media...', { id: 'edit-upload' });
        
        if (audioFile) {
          const audioPresign = await songService.getPresignedUrl('song-audio', audioFile.name, audioFile.type);
          await songService.uploadToS3(audioPresign.uploadUrl, audioFile, audioFile.type);
          cleanedData.audioFileKey = audioPresign.key;
          cleanedData.audioFile = audioPresign.publicUrl;
        }

        if (coverArtFile) {
          const coverPresign = await songService.getPresignedUrl('cover-art', coverArtFile.name, coverArtFile.type);
          await songService.uploadToS3(coverPresign.uploadUrl, coverArtFile, coverArtFile.type);
          cleanedData.coverArtKey = coverPresign.key;
          cleanedData.coverArt = coverPresign.publicUrl;
        }
      }

      toast.loading('Saving changes...', { id: 'edit-upload' });
      // Using standard updateSong which is available for artists
      await songService.updateSong(song._id, cleanedData as any);
      
      toast.success('Track updated and resubmitted for approval!', { id: 'edit-upload' });
      navigate('/artist/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update track', { id: 'edit-upload' });
    } finally {
      setSubmitting(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <Preloader isVisible text="Loading track details..." />;
  if (!song) return null;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <button
            type="button"
            onClick={() => navigate('/artist/dashboard')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layout className="w-6 h-6 text-purple-600" />
            Edit Track: {song.name}
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/artist/dashboard')}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            form="song-edit-form"
            type="submit"
            disabled={submitting}
            className="px-6 py-2 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-200 disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save & Resubmit
          </button>
        </div>
      </div>

      {/* Rejection Alert */}
      {song.status === 'rejected' && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-4"
        >
          <div className="bg-red-100 p-2 rounded-xl h-fit">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-red-900">Track Requires Action</h3>
            <p className="text-red-700 text-sm mt-1">
              This track was rejected by an administrator. Please fix the issues mentioned below and resubmit.
            </p>
            <div className="mt-3 p-3 bg-white/50 rounded-lg border border-red-200">
              <p className="text-sm font-semibold text-red-800">Reason for rejection:</p>
              <p className="text-sm text-red-700 italic mt-1">"{song.rejectionReason || 'No specific reason provided.'}"</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Media Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <Disc className="w-4 h-4 text-purple-600" />
              Media Preview
            </h3>
            
            <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4 relative">
              <img
                src={formData.coverArt || '/default-track-cover.jpg'}
                alt="Cover Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>

            {song.audioFile && (
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-xs font-bold text-purple-600 uppercase mb-2">Original Audio</p>
                <div className="flex items-center gap-3">
                  <button 
                    type="button" 
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{song.name}</p>
                    <p className="text-xs text-gray-500">{formatDuration(song.duration)}</p>
                  </div>
                </div>
                <audio ref={audioRef} src={song.audioFileUrl || song.audioFile} onEnded={() => setIsPlaying(false)} />
              </div>
            )}

            <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl flex gap-2">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p className="text-[11px] text-amber-700">
                Resubmitting a track will put it back in the approval queue. Changes may take time to reflect.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-2">
          <form id="song-edit-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info Container */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 uppercase tracking-wider">
                <Music2 className="w-4 h-4 text-purple-600" />
                Track Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Track Title</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Genre</label>
                  <select
                    name="genre"
                    value={formData.genre || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer"
                  >
                    <option value="">Select Genre</option>
                    {genres.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Album (Optional)</label>
                  <select
                    name="album"
                    value={formData.album || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer"
                  >
                    <option value="">Single (No Album)</option>
                    {albums.map(al => <option key={al._id} value={al._id}>{al.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Release Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="releaseDate"
                      value={formData.releaseDate || ''}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Duration (Seconds)</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration || 0}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                    <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Lyrics</label>
                <div className="relative">
                  <textarea
                    name="lyrics"
                    value={formData.lyrics || ''}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Enter your song lyrics here..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                  />
                  <FileText className="absolute right-4 top-4 w-4 h-4 text-gray-300" />
                </div>
              </div>
            </div>

            {/* Media Upload Container */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 uppercase tracking-wider">
                <Tag className="w-4 h-4 text-purple-600" />
                Media Assets
              </h3>

              <div className="space-y-6">
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-3">Update Cover Art</p>
                  <FileUpload 
                    label="Cover Art" 
                    currentFile={song.coverArtUrl || undefined} 
                    onFileSelect={handleCoverArtSelect} 
                    onFileRemove={() => { 
                      setCoverArtFile(null); 
                      setFormData(prev => ({ ...prev, coverArt: '' })); 
                    }} 
                  />
                </div>

                <div className={`${song.status !== 'rejected' ? 'opacity-50 pointer-events-none' : ''}`}>
                  <p className="text-sm font-bold text-gray-700 mb-1">Replace Audio File</p>
                  {song.status !== 'rejected' ? (
                    <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                      <p className="text-xs text-gray-500 font-medium">Audio is locked while track is pending or approved.</p>
                    </div>
                  ) : (
                    <div className="mb-3 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <p className="text-xs text-red-700 font-bold uppercase tracking-tight">Audio replacement enabled due to rejection</p>
                    </div>
                  )}
                  <FileUpload 
                    label="Song Audio" 
                    fileType="audio" 
                    maxSize={50} 
                    onFileSelect={file => setAudioFile(file)} 
                    onFileRemove={() => { 
                      setAudioFile(null); 
                      setFormData(prev => ({ ...prev, audioFile: '' })); 
                    }} 
                    currentFile={song.audioFileUrl || undefined} 
                  />
                </div>
              </div>
            </div>
            
            {/* Split Sheet (Read Only for now to keep it safe) */}
            {song.splitSheet && song.splitSheet.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  Split Sheet (Verified)
                </h3>
                <div className="space-y-2">
                  {song.splitSheet.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{item.contributor}</p>
                        <p className="text-xs text-gray-500">{item.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-purple-600">{item.share}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SongEdit;
