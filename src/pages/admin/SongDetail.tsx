import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import songService, { Song, CreateSongData } from '../../services/songService';
import albumService, { Album } from '../../services/albumService';
import artistService, { Artist } from '../../services/artistService';
import genreService, { Genre } from '../../services/genreService';
import FileUpload from '../../components/ui/FileUpload';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Preloader from '../../components/ui/Preloader';
import {
  ArrowLeft, Music2, User, Disc, Tag, Clock, Calendar,
  FileText, Edit2, Trash2, Save, X, Play, Pause, AlertCircle,
  CheckCircle, XCircle, Loader2, ExternalLink, Video
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import videoService, { type Video as VideoType } from '../../services/videoService';

const SongDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);

  const [formData, setFormData] = useState<Partial<CreateSongData>>({});
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [linkedVideo, setLinkedVideo] = useState<VideoType | null>(null);

  useEffect(() => {
    if (id) fetchAll(id);
    return () => { audioRef.current?.pause(); };
  }, [id]);

  const fetchAll = async (songId: string) => {
    setLoading(true);
    try {
      const [songData, artistData, albumData, genreData, videoData] = await Promise.all([
        songService.adminGetSongById(songId),
        artistService.getAllArtists(),
        albumService.getAllAlbums(),
        genreService.getAllGenres(),
        videoService.getVideoBySongId(songId).catch(() => null),
      ]);
      setSong(songData);
      setArtists(artistData);
      setAlbums(albumData);
      setGenres(genreData);
      setLinkedVideo(videoData);
      populateForm(songData, artistData, albumData, genreData);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load song');
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (s: Song, artistList: Artist[], albumList: Album[], genreList: Genre[]) => {
    const artistId = typeof s.artist === 'object' && s.artist !== null ? s.artist._id :
      artistList.find(a => a._id === s.artist || a.name === s.artist)?._id || (s.artist as string);
    const albumId = typeof s.album === 'object' && s.album !== null ? s.album._id :
      albumList.find(a => a._id === s.album || a.name === s.album)?._id || (s.album as string) || '';
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
      artist: artistId,
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
    setFormData(prev => ({ ...prev, [name]: name === 'duration' ? parseFloat(value) || 0 : value }));
  };

  const handleCoverArtSelect = async (file: File) => {
    setCoverArtFile(file);
    try {
      const base64 = await songService.uploadCoverArt(file);
      setFormData(prev => ({ ...prev, coverArt: base64 }));
    } catch { toast.error('Failed to process cover art'); }
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
        toast.loading('Uploading media to S3...', { id: 'edit-upload' });
        
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
        
        toast.loading('Saving song details...', { id: 'edit-upload' });
      }

      const updated = await songService.adminUpdateSong(song._id, cleanedData as any);
      setSong(updated);
      populateForm(updated, artists, albums, genres);
      setIsEditing(false);
      setCoverArtFile(null);
      setAudioFile(null);
      toast.success('Song updated successfully', { id: 'edit-upload' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update song', { id: 'edit-upload' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!song) return;
    try {
      await songService.deleteSong(song._id);
      toast.success('Song deleted');
      navigate('/admin/song-management');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete song');
    }
  };
  
  const handleModerate = async (action: 'approve' | 'reject') => {
    if (!song) return;
    
    let reason = '';
    if (action === 'reject') {
      reason = window.prompt('Please provide a reason for rejection (e.g., "Bad audio quality"):') || '';
      if (!reason) {
        toast.error('A reason is required to reject a track');
        return;
      }
    }

    try {
      toast.loading(`${action === 'approve' ? 'Approve' : 'Reject'}ing track...`, { id: 'moderate-action' });
      const response = await adminService.moderateContent('songs', song._id, action, reason);
      
      if (response.data.success) {
        toast.success(`Track ${action === 'approve' ? 'approved' : 'rejected'} successfully`, { id: 'moderate-action' });
        setSong({ 
          ...song, 
          isApproved: action === 'approve',
          status: action === 'approve' ? 'approved' : 'rejected',
          rejectionReason: reason
        });
      } else {
        throw new Error(response.data.message || `Failed to ${action} track`);
      }
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action} track`, { id: 'moderate-action' });
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play(); setIsPlaying(true); }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <Preloader isVisible text="Loading song..." />;

  if (!song) return (
    <div className="p-8 text-center">
      <p className="text-gray-500 mb-4">Song not found.</p>
      <button type="button" onClick={() => navigate('/admin/song-management')} className="text-green-600 hover:underline">← Back to songs</button>
    </div>
  );

  const artistName = typeof song.artist === 'object' && song.artist !== null
    ? song.artist.name
    : (artists.find(a => a._id === song.artist)?.name || (typeof song.artist === 'string' ? song.artist : 'Unknown Artist'));

  const albumName = typeof song.album === 'object' && song.album !== null
    ? song.album.name
    : (albums.find(a => a._id === song.album)?.name || (typeof song.album === 'string' ? song.album : 'No Album'));

  const genreName = typeof song.genre === 'object' && song.genre !== null
    ? song.genre.name
    : (genres.find(g => g._id === (typeof song.genre === 'string' ? song.genre : ''))?.name || (typeof song.genre === 'string' ? song.genre : 'Unknown Genre'));
  
  const coverUrl = song.coverArtUrl || song.coverArt || null;
  const audioUrl = song.audioFileUrl || song.audioFile || null;
  const sDate = song.releaseDate ? new Date(song.releaseDate) : null;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => navigate('/admin/song-management')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Song Management
        </button>
        <div className="flex items-center gap-3">
          {!isEditing ? (
            <>
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-red-200 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl transition-all shadow-sm"
              >
                <Edit2 className="w-4 h-4" />
                Edit Song
              </button>
              {song.status === 'pending' && (
                <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
                  <button
                    type="button"
                    onClick={() => handleModerate('approve')}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-600 border border-blue-100 rounded-xl hover:bg-blue-100 transition-all font-medium"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModerate('reject')}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-amber-50 text-amber-600 border border-amber-100 rounded-xl hover:bg-amber-100 transition-all font-medium"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}
              {song.status === 'rejected' && (
                <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
                  <span className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-bold uppercase tracking-wider">
                    Rejected
                  </span>
                  <button
                    type="button"
                    onClick={() => handleModerate('approve')}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-600 border border-blue-100 rounded-xl hover:bg-blue-100 transition-all font-medium ml-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve Anyway
                  </button>
                </div>
              )}
              {song.status === 'approved' && (
                <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
                  <span className="px-3 py-1.5 bg-green-50 text-green-600 border border-green-100 rounded-xl text-xs font-bold uppercase tracking-wider">
                    Approved
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button
                key="save-button"
                form="edit-form"
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-sm disabled:opacity-60 order-1"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
              <button
                key="cancel-button"
                type="button"
                onClick={() => { setIsEditing(false); populateForm(song, artists, albums, genres); setCoverArtFile(null); setAudioFile(null); }}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors order-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative">
              <img
                src={coverUrl || '/assets/images/lugmaticIcon.png'}
                alt={song.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/images/lugmaticIcon.png';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-semibold text-lg leading-tight truncate">{song.name}</p>
                <p className="text-white/80 text-sm truncate">{artistName}</p>
              </div>
            </div>
            {audioUrl && (
              <div className="p-4 border-t border-gray-50">
                <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
                <div className="flex items-center gap-3">
                  <button type="button" onClick={togglePlay} className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-sm hover:shadow-md transition-all flex-shrink-0">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{song.name}</p>
                    <p className="text-xs text-gray-400">{formatDuration(song.duration)}</p>
                  </div>
                  <a href={audioUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-600">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Details</h3>
            {[
              { icon: <User className="w-4 h-4 text-blue-500" />, label: 'Artist', value: artistName },
              { icon: <Disc className="w-4 h-4 text-purple-500" />, label: 'Album', value: albumName },
              { icon: <Tag className="w-4 h-4 text-amber-500" />, label: 'Genre', value: genreName },
              { icon: <Clock className="w-4 h-4 text-green-500" />, label: 'Duration', value: formatDuration(song.duration) },
              { icon: <Calendar className="w-4 h-4 text-rose-500" />, label: 'Released', value: sDate && !isNaN(sDate.getTime()) ? sDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
              { 
                icon: song.status === 'approved' ? <CheckCircle className="w-4 h-4 text-green-500" /> : song.status === 'rejected' ? <XCircle className="w-4 h-4 text-red-500" /> : <Clock className="w-4 h-4 text-amber-500" />, 
                label: 'Moderation', 
                value: song.status.charAt(0).toUpperCase() + song.status.slice(1) 
              },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">{icon}</div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {song.splitSheet && song.splitSheet.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Music2 className="h-4 w-4 text-green-500" />
                Split Sheet Agreement
              </h2>
              <div className="space-y-3">
                {song.splitSheet.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.contributor}</p>
                      <p className="text-xs text-gray-500">{item.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">{item.share}%</p>
                    </div>
                  </div>
                ))}
              </div>
              {song.termsAccepted && (
                <div className="mt-4 flex items-center gap-2 text-[11px] text-green-600 bg-green-50 p-2 rounded-lg">
                  <CheckCircle className="h-3 w-3" />
                  Split Sheet Terms Accepted
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {isEditing ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <Edit2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-800">Edit Song</h2>
                  <p className="text-xs text-gray-500">Update song information and files</p>
                </div>
              </div>
              <form id="edit-form" onSubmit={handleSubmit} className="space-y-5">
                <FileUpload label="Cover Art" currentFile={formData.coverArt || undefined} onFileSelect={handleCoverArtSelect} onFileRemove={() => { setCoverArtFile(null); setFormData(p => ({ ...p, coverArt: '' })); }} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><Music2 className="w-3.5 h-3.5 text-gray-400" /> Song Title</label>
                  <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:ring-2 focus:ring-green-400 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-gray-400" /> Artist</label>
                  <select name="artist" value={formData.artist || ''} onChange={handleInputChange} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:ring-2 focus:ring-green-400 transition-colors">
                    <option value="">Select an artist...</option>
                    {artists.map(a => <option key={a._id} value={a._id}>{a.name || a.fullName || 'Unknown'}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><Disc className="w-3.5 h-3.5 text-gray-400" /> Album</label>
                  <select name="album" value={formData.album || ''} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:ring-2 focus:ring-green-400 transition-colors">
                    <option value="">No Album (Single)</option>
                    {albums.map(al => <option key={al._id} value={al._id}>{al.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-gray-400" /> Genre</label>
                    <select name="genre" value={formData.genre || ''} onChange={handleInputChange} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:ring-2 focus:ring-green-400 transition-colors">
                      <option value="">Select genre...</option>
                      {genres.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" /> Duration (sec)</label>
                    <input type="number" name="duration" value={formData.duration || 0} onChange={handleInputChange} required min="0" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:ring-2 focus:ring-green-400 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400" /> Release Date</label>
                  <input type="date" name="releaseDate" value={formData.releaseDate || ''} onChange={handleInputChange} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:ring-2 focus:ring-green-400 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-gray-400" /> Lyrics</label>
                  <textarea name="lyrics" value={formData.lyrics || ''} onChange={handleInputChange} rows={5} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:ring-2 focus:ring-green-400 transition-colors resize-none" placeholder="Enter lyrics..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><ExternalLink className="w-3.5 h-3.5 text-gray-400" /> Music Video URL</label>
                  <input type="text" name="videoUrl" value={formData.videoUrl || ''} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:ring-2 focus:ring-green-400 transition-colors" placeholder="https://..." />
                </div>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="text-sm font-medium text-blue-800 flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Videos are managed separately
                  </p>
                  <p className="text-xs text-blue-600 mt-1">To link or change the music video, please use the <strong>Video Management</strong> section.</p>
                </div>
                <FileUpload label="Audio File" fileType="audio" maxSize={50} onFileSelect={file => setAudioFile(file)} onFileRemove={() => { setAudioFile(null); setFormData(p => ({ ...p, audioFile: '' })); }} currentFile={song.audioFile || undefined} />
              </form>
            </motion.div>
          ) : (
            <>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">{song.name}</h2>
                <p className="text-sm text-gray-500 mb-4">by {artistName} · {albumName} · {genreName}</p>
                
                {song.status === 'rejected' && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                    <p className="text-sm font-bold text-red-800 mb-1 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Rejection Reason
                    </p>
                    <p className="text-sm text-red-700 italic">"{song.rejectionReason}"</p>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Duration', value: formatDuration(song.duration), bg: 'bg-green-50', text: 'text-green-700' },
                    { label: 'Genre', value: genreName, bg: 'bg-amber-50', text: 'text-amber-700' },
                    { label: 'Album', value: albumName, bg: 'bg-purple-50', text: 'text-purple-700' },
                    { label: 'Status', value: song.isActive !== false ? 'Active' : 'Inactive', bg: song.isActive !== false ? 'bg-emerald-50' : 'bg-red-50', text: song.isActive !== false ? 'text-emerald-700' : 'text-red-600' },
                    { label: 'Video', value: song.videoUrl ? 'Available' : 'None', bg: 'bg-blue-50', text: 'text-blue-700' },
                  ].map(({ label, value, bg, text }) => (
                    <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                      <p className={`text-base font-semibold ${text} truncate`}>{value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center"><FileText className="w-4 h-4 text-indigo-500" /></div>
                  <h3 className="text-sm font-semibold text-gray-700">Lyrics</h3>
                </div>
                {song.lyrics ? <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans leading-relaxed max-h-80 overflow-y-auto">{song.lyrics}</pre> : <p className="text-sm text-gray-400 italic">No lyrics available.</p>}
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Metadata</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {[
                    { label: 'Song ID', value: song._id },
                    { label: 'Release Date', value: song.releaseDate ? new Date(song.releaseDate).toLocaleDateString() : '—' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                      <p className="text-gray-700 font-mono text-xs break-all">{value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
              {linkedVideo && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Video className="w-4 h-4 text-blue-500" /></div>
                      <h3 className="text-sm font-semibold text-gray-700">Music Video</h3>
                    </div>
                    <button 
                      onClick={() => navigate('/admin/video-management')}
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      Manage Video
                    </button>
                  </div>
                  <div className="aspect-video rounded-xl overflow-hidden bg-black border border-gray-100 relative group">
                    <video 
                      src={linkedVideo.videoUrl} 
                      controls 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
      <ConfirmDialog isOpen={deleteOpen} title="Delete Song" message={`Are you sure you want to delete "${song?.name}"?`} confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeleteOpen(false)} />
    </div>
  );
};

export default SongDetail;
