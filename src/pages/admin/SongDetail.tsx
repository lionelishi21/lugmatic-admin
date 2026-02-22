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
  FileText, Edit2, Trash2, Save, X, Play, Pause,
  CheckCircle, XCircle, Loader2, ExternalLink
} from 'lucide-react';

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

  useEffect(() => {
    if (id) fetchAll(id);
    return () => { audioRef.current?.pause(); };
  }, [id]);

  const fetchAll = async (songId: string) => {
    setLoading(true);
    try {
      const [songData, artistData, albumData, genreData] = await Promise.all([
        songService.adminGetSongById(songId),
        artistService.getAllArtists(),
        albumService.getAllAlbums(),
        genreService.getAllGenres(),
      ]);
      setSong(songData);
      setArtists(artistData);
      setAlbums(albumData);
      setGenres(genreData);
      populateForm(songData, artistData, albumData, genreData);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load song');
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (s: Song, artistList: Artist[], albumList: Album[], genreList: Genre[]) => {
    const artistId = typeof s.artist === 'object' ? s.artist?._id :
      artistList.find(a => a._id === s.artist || a.name === s.artist)?._id || s.artist;
    const albumId = typeof s.album === 'object' ? s.album?._id :
      albumList.find(a => a._id === s.album || a.name === s.album)?._id || s.album || '';
    const genreId = genreList.find(g => g._id === s.genre || g.name === s.genre)?._id || s.genre || '';

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
      const cleanedData = { ...formData, album: formData.album?.trim() || undefined };

      let updated;
      if (coverArtFile || audioFile) {
        // Use multipart for file uploads
        updated = await songService.updateSong(song._id, cleanedData, audioFile || undefined, coverArtFile || undefined);
      } else {
        // Use admin patch for JSON-only updates
        updated = await songService.adminUpdateSong(song._id, cleanedData as any);
      }

      setSong(updated);
      populateForm(updated, artists, albums, genres);
      setIsEditing(false);
      setCoverArtFile(null);
      setAudioFile(null);
      toast.success('Song updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update song');
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
      <button onClick={() => navigate('/admin/song-management')} className="text-green-600 hover:underline">← Back to songs</button>
    </div>
  );

  const artistName = typeof song.artist === 'object' ? song.artist.name : artists.find(a => a._id === song.artist)?.name || song.artist || '—';
  const albumName = song.album ? (typeof song.album === 'object' ? song.album.name : albums.find(a => a._id === song.album)?.name || song.album) : 'Single';
  const genreName = genres.find(g => g._id === song.genre)?.name || song.genre || '—';
  const coverUrl = song.coverArtUrl || song.coverArt || null;
  const audioUrl = song.audioFileUrl || song.audioFile || null;
  const sDate = song.releaseDate ? new Date(song.releaseDate) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/20 to-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
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
                onClick={() => setDeleteOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-red-200 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-sm"
              >
                <Edit2 className="w-4 h-4" />
                Edit Song
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setIsEditing(false); populateForm(song, artists, albums, genres); setCoverArtFile(null); setAudioFile(null); }}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                form="edit-form"
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-sm disabled:opacity-60"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Cover + Player */}
        <div className="lg:col-span-1 space-y-4">
          {/* Cover Art */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative">
              {coverUrl ? (
                <img src={coverUrl} alt={song.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music2 className="w-24 h-24 text-gray-300" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-semibold text-lg leading-tight truncate">{song.name}</p>
                <p className="text-white/80 text-sm truncate">{artistName}</p>
              </div>
            </div>

            {/* Audio Player */}
            {audioUrl && (
              <div className="p-4 border-t border-gray-50">
                <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-sm hover:shadow-md transition-all flex-shrink-0"
                  >
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

          {/* Quick Info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4"
          >
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Details</h3>
            {[
              { icon: <User className="w-4 h-4 text-blue-500" />, label: 'Artist', value: artistName },
              { icon: <Disc className="w-4 h-4 text-purple-500" />, label: 'Album', value: albumName },
              { icon: <Tag className="w-4 h-4 text-amber-500" />, label: 'Genre', value: genreName },
              { icon: <Clock className="w-4 h-4 text-green-500" />, label: 'Duration', value: formatDuration(song.duration) },
              { icon: <Calendar className="w-4 h-4 text-rose-500" />, label: 'Released', value: sDate && !isNaN(sDate.getTime()) ? sDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
              { icon: song.isActive !== false ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />, label: 'Status', value: song.isActive !== false ? 'Active' : 'Inactive' },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">{icon}</div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: Edit Form or Info Panels */}
        <div className="lg:col-span-2 space-y-4">
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
            >
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
                <FileUpload
                  label="Cover Art"
                  currentFile={formData.coverArt || undefined}
                  onFileSelect={handleCoverArtSelect}
                  onFileRemove={() => { setCoverArtFile(null); setFormData(p => ({ ...p, coverArt: '' })); }}
                />

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Music2 className="w-3.5 h-3.5 text-gray-400" /> Song Title
                  </label>
                  <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} required placeholder="Enter song title"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-colors" />
                </div>

                {/* Artist */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-400" /> Artist
                  </label>
                  <select name="artist" value={formData.artist || ''} onChange={handleInputChange} required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white transition-colors">
                    <option value="">Select an artist…</option>
                    {artists.map(a => (
                      <option key={a._id} value={a._id}>
                        {a.name || a.fullName || [a.firstName, a.lastName].filter(Boolean).join(' ') || 'Unknown'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Album */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Disc className="w-3.5 h-3.5 text-gray-400" /> Album
                  </label>
                  <select name="album" value={formData.album || ''} onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white transition-colors">
                    <option value="">No Album (Single)</option>
                    {albums.map(al => {
                      const aName = typeof al.artist === 'object' && al.artist?.name
                        ? al.artist.name
                        : artists.find(a => a._id === al.artist)?.name || '';
                      return <option key={al._id} value={al._id}>{al.name}{aName ? ` (${aName})` : ''}</option>;
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Genre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-gray-400" /> Genre
                    </label>
                    <select name="genre" value={formData.genre || ''} onChange={handleInputChange} required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white transition-colors">
                      <option value="">Select genre…</option>
                      {genres.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                    </select>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" /> Duration (sec)
                    </label>
                    <input type="number" name="duration" value={formData.duration || 0} onChange={handleInputChange} required min="0"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors" />
                  </div>
                </div>

                {/* Release Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" /> Release Date
                  </label>
                  <input type="date" name="releaseDate" value={formData.releaseDate || ''} onChange={handleInputChange} required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors" />
                </div>

                {/* Lyrics */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-gray-400" /> Lyrics
                  </label>
                  <textarea name="lyrics" value={formData.lyrics || ''} onChange={handleInputChange} rows={5} placeholder="Enter lyrics (optional)"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors resize-none" />
                </div>

                {/* Audio File */}
                <FileUpload
                  label="Audio File"
                  fileType="audio"
                  maxSize={50}
                  onFileSelect={file => setAudioFile(file)}
                  onFileRemove={() => { setAudioFile(null); setFormData(p => ({ ...p, audioFile: '' })); }}
                  currentFile={song.audioFile || undefined}
                />
              </form>
            </motion.div>
          ) : (
            <>
              {/* Song Info Card */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">{song.name}</h2>
                <p className="text-sm text-gray-500 mb-4">by {artistName} · {albumName} · {genreName}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Duration', value: formatDuration(song.duration), bg: 'bg-green-50', text: 'text-green-700' },
                    { label: 'Genre', value: genreName, bg: 'bg-amber-50', text: 'text-amber-700' },
                    { label: 'Album', value: albumName, bg: 'bg-purple-50', text: 'text-purple-700' },
                    { label: 'Status', value: song.isActive !== false ? 'Active' : 'Inactive', bg: song.isActive !== false ? 'bg-emerald-50' : 'bg-red-50', text: song.isActive !== false ? 'text-emerald-700' : 'text-red-600' },
                  ].map(({ label, value, bg, text }) => (
                    <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                      <p className={`text-base font-semibold ${text} truncate`}>{value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Lyrics */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-indigo-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-700">Lyrics</h3>
                </div>
                {song.lyrics ? (
                  <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans leading-relaxed max-h-80 overflow-y-auto">
                    {song.lyrics}
                  </pre>
                ) : (
                  <p className="text-sm text-gray-400 italic">No lyrics available.</p>
                )}
              </motion.div>

              {/* Metadata */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Metadata</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {[
                    { label: 'Song ID', value: song._id },
                    { label: 'Release Date', value: song.releaseDate ? new Date(song.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
                    { label: 'Created', value: song.createdAt ? new Date(song.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—' },
                    { label: 'Updated', value: song.updatedAt ? new Date(song.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                      <p className="text-gray-700 font-mono text-xs break-all">{value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteOpen}
        title="Delete Song"
        message={`Are you sure you want to delete "${song.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
};

export default SongDetail;
