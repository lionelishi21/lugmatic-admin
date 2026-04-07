import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, Music2, Disc, Tag, Clock, Calendar, 
  FileText, Save, Play, Pause, AlertCircle,
  CheckCircle, Loader2, Info, Layout, Users, Trash2
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
  const [splitSheet, setSplitSheet] = useState<any[]>([]);
  const [isInviting, setIsInviting] = useState(false);
  const [newContributor, setNewContributor] = useState({ contributorName: '', email: '', role: 'songwriter', share: 0 });

  useEffect(() => {
    if (id) fetchSongData(id);
    return () => { audioRef.current?.pause(); };
  }, [id]);

  const reloadContributors = async () => {
    if (!id) return;
    try {
      const data = await songService.getContributors(id);
      setSplitSheet(data);
    } catch (err) {
      console.error('Failed to reload contributors:', err);
    }
  };

  const handleInviteContributor = async () => {
    if (!id) return;
    if (!newContributor.email || !newContributor.role || newContributor.share <= 0) {
      toast.error('Please provide email, role, and a share percentage > 0');
      return;
    }

    setIsInviting(true);
    try {
      await songService.inviteContributor(id, newContributor);
      toast.success(`Invitation sent to ${newContributor.email}`);
      setNewContributor({ contributorName: '', email: '', role: 'songwriter', share: 0 });
      reloadContributors();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveContributor = async (contributorId: string) => {
    if (!id || !window.confirm('Are you sure you want to remove this contributor?')) return;
    
    try {
      await songService.removeContributor(id, contributorId);
      toast.success('Contributor removed');
      reloadContributors();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove contributor');
    }
  };

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
      reloadContributors();
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
    setSplitSheet(s.splitSheet || []);
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
      const cleanedData: Partial<CreateSongData> & { splitSheet: any } = {
        ...formData,
        album: formData.album && formData.album.trim() !== '' ? formData.album : undefined,
        splitSheet: splitSheet,
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
                src={formData.coverArtUrl || formData.coverArt || '/default-track-cover.jpg'}
                alt="Cover Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-track-cover.jpg';
                }}
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
                    currentFile={formData.coverArt || undefined} 
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
                    currentFile={formData.audioFile || undefined} 
                  />
                </div>
              </div>
            </div>
            
            {/* Collaboration & Split Sheet (Interactive) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 uppercase tracking-wider">
                        <Users className="w-4 h-4 text-purple-600" />
                        Collaboration & Split Sheet
                    </h3>
                    <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-bold">
                      <Save className="w-3 h-3" />
                      AUTO-SAVING COLLABORATIONS
                    </div>
                </div>

                {/* Invite Form */}
                <div className="p-5 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">Invite New Contributor</p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 block mb-1">Name</label>
                            <input
                                type="text"
                                value={newContributor.contributorName}
                                onChange={(e) => setNewContributor({...newContributor, contributorName: e.target.value})}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 shadow-sm"
                                placeholder="Public Name"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 block mb-1">Email</label>
                            <input
                                type="email"
                                value={newContributor.email}
                                onChange={(e) => setNewContributor({...newContributor, email: e.target.value})}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 shadow-sm"
                                placeholder="email@example.com"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 block mb-1">Role</label>
                            <select
                                value={newContributor.role}
                                onChange={(e) => setNewContributor({...newContributor, role: e.target.value})}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 shadow-sm"
                            >
                                <option value="songwriter">Songwriter</option>
                                <option value="producer">Producer</option>
                                <option value="vocalist">Vocalist</option>
                                <option value="featured-artist">Featured Artist</option>
                                <option value="engineer">Engineer</option>
                            </select>
                        </div>
                        <div className="md:col-span-1 flex items-end gap-2">
                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 block mb-1">Share %</label>
                                <input
                                    type="number"
                                    value={newContributor.share || ''}
                                    onChange={(e) => setNewContributor({...newContributor, share: parseFloat(e.target.value) || 0})}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 shadow-sm"
                                    placeholder="%"
                                    max="100"
                                    min="1"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleInviteContributor}
                                disabled={isInviting}
                                className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-md shadow-purple-200 hover:bg-purple-700 disabled:opacity-50 h-[38px] transition-all"
                            >
                                {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Invite'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 mt-6">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Active Team</p>
                    {splitSheet.length === 0 ? (
                      <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs text-gray-400">No contributors added yet.</p>
                      </div>
                    ) : (
                      splitSheet.map((item, idx) => (
                          <div key={item._id || idx} className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between gap-4 group hover:border-purple-100 transition-all shadow-sm">
                              <div className="flex items-center gap-4 flex-1">
                                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-50">
                                      {item.user?.profilePicture ? (
                                        <img src={item.user.profilePicture} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-50 text-purple-600 font-bold text-sm">
                                          {(item.contributor || item.email).charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                          <p className="text-sm font-bold text-gray-900 truncate">{item.contributor || item.email}</p>
                                          {item.status === 'accepted' ? (
                                            <span className="px-1.5 py-0.5 rounded-full bg-green-50 text-green-600 text-[9px] font-bold uppercase tracking-wider border border-green-100 flex items-center gap-1">
                                              <CheckCircle className="w-2.5 h-2.5" /> Accepted
                                            </span>
                                          ) : (
                                            <span className="px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[9px] font-bold uppercase tracking-wider border border-amber-100 flex items-center gap-1">
                                              <Clock className="w-2.5 h-2.5" /> Pending Invite
                                            </span>
                                          )}
                                      </div>
                                      <p className="text-xs text-gray-500 mt-0.5 truncate flex items-center gap-2">
                                        <span className="font-bold text-purple-600">{item.role}</span>
                                        <span className="text-gray-300">•</span>
                                        {item.email}
                                      </p>
                                  </div>
                              </div>

                              <div className="flex items-center gap-6">
                                  <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Share</p>
                                    <p className="text-sm font-black text-gray-900">{item.share}%</p>
                                  </div>
                                  <button
                                      type="button"
                                      onClick={() => handleRemoveContributor(item._id)}
                                      className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 rounded-xl hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                  >
                                      <Trash2 className="w-4 h-4" />
                                  </button>
                              </div>
                          </div>
                      ))
                    )}
                </div>
                
                {splitSheet.reduce((acc, curr) => acc + curr.share, 0) !== 100 && splitSheet.length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-red-700 font-bold">Total share must equal 100%.</p>
                          <p className="text-[10px] text-red-600 mt-0.5 font-medium tracking-tight uppercase">Current total: {splitSheet.reduce((acc, curr) => acc + curr.share, 0)}% (Artist needs {100 - splitSheet.reduce((acc, curr) => acc + curr.share, 0) + (splitSheet.find(s => s.role === 'artist')?.share || 0)}%)</p>
                        </div>
                    </div>
                )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SongEdit;
