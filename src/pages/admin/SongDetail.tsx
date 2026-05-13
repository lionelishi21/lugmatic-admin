import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  CheckCircle, XCircle, Loader2, ExternalLink, Video, 
  Activity, ShieldCheck, Share2, Zap, BarChart3, 
  ChevronRight, Music, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import videoService, { type Video as VideoType } from '../../services/videoService';
import { getFullImageUrl } from '../../services/api';

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
      toast.error('Failed to synchronize track registry');
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
        if (!isNaN(d.getTime())) formattedDate = d.toISOString().split('T')[0];
      } catch (e) { console.error(e); }
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
    } catch { toast.error('Artwork processing failed'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!song) return;
    setSubmitting(true);
    const loadingId = toast.loading('Synchronizing track updates...');
    try {
      const cleanedData: Partial<CreateSongData> = {
        ...formData,
        album: formData.album && formData.album.trim() !== '' ? formData.album : undefined,
      };

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

      const updated = await songService.adminUpdateSong(song._id, cleanedData as any);
      setSong(updated);
      populateForm(updated, artists, albums, genres);
      setIsEditing(false);
      setCoverArtFile(null);
      setAudioFile(null);
      toast.success('Track registry updated', { id: loadingId });
    } catch (err: any) {
      toast.error('Transmission failed', { id: loadingId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!song) return;
    try {
      await songService.deleteSong(song._id);
      toast.success('Track purged');
      navigate('/admin/song-management');
    } catch (err: any) {
      toast.error('Purge failed');
    }
  };
  
  const handleModerate = async (action: 'approve' | 'reject') => {
    if (!song) return;
    let reason = '';
    if (action === 'reject') {
      reason = window.prompt('Provide rejection justification:') || '';
      if (!reason) { toast.error('Justification required for rejection'); return; }
    }

    try {
      toast.loading(`Executing ${action} protocol...`, { id: 'moderate-action' });
      const response = await adminService.moderateContent('songs', song._id, action, reason);
      if (response.data.success) {
        toast.success(`Protocol ${action} finalized`, { id: 'moderate-action' });
        setSong({ 
          ...song, 
          isApproved: action === 'approve',
          status: action === 'approve' ? 'approved' : 'rejected',
          rejectionReason: reason
        });
      }
    } catch (err: any) {
      toast.error('Protocol failure', { id: 'moderate-action' });
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

  if (loading) return <Preloader isVisible text="Loading track parameters..." />;
  if (!song) return null;

  const artistName = typeof song.artist === 'object' && song.artist !== null
    ? song.artist.name : (artists.find(a => a._id === song.artist)?.name || 'Unknown');
  const albumName = typeof song.album === 'object' && song.album !== null
    ? song.album.name : (albums.find(a => a._id === song.album)?.name || 'Single');
  const genreName = typeof song.genre === 'object' && song.genre !== null
    ? song.genre.name : (genres.find(g => g._id === (song.genre as string))?.name || 'Unknown');
  
  const coverUrl = getFullImageUrl(song.coverArtUrl || song.coverArt || '');
  const audioUrl = getFullImageUrl(song.audioFileUrl || song.audioFile || '');

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
            {isEditing ? 'Edit Track Registry' : song.name}
          </h1>
          <p className="text-zinc-500">Manage cinematic metadata and track moderation status.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {!isEditing ? (
            <>
              <button onClick={() => setIsEditing(true)} className="btn-secondary flex items-center gap-2 !px-6">
                <Edit2 size={16} /> Edit
              </button>
              <button onClick={() => setDeleteOpen(true)} className="btn-secondary !text-rose-500 hover:!bg-rose-500/5 !border-rose-500/20 flex items-center gap-2 !px-6">
                <Trash2 size={16} /> Purge
              </button>
              {song.status === 'pending' && (
                <div className="flex items-center gap-2 pl-3 border-l border-white/10 ml-3">
                  <button onClick={() => handleModerate('approve')} className="btn-primary !bg-emerald-500 !text-black flex items-center gap-2 !px-6">
                    <CheckCircle2 size={16} /> Approve
                  </button>
                  <button onClick={() => handleModerate('reject')} className="btn-secondary !text-rose-500 hover:!bg-rose-500/5 !border-rose-500/20 flex items-center gap-2 !px-6">
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button onClick={() => { setIsEditing(false); populateForm(song, artists, albums, genres); }} className="btn-secondary !px-8">
                Cancel
              </button>
              <button form="edit-form" type="submit" disabled={submitting} className="btn-primary flex items-center gap-2 !px-8">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Protocol
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Cinematic Overview */}
        <div className="lg:col-span-1 space-y-8">
          <div className="premium-card !p-0 overflow-hidden group">
            <div className="aspect-square relative bg-zinc-950">
              <img src={coverUrl} alt={song.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white text-2xl font-bold tracking-tight mb-1">{song.name}</p>
                <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">{artistName}</p>
              </div>

              {/* Status Badge */}
              <div className="absolute top-6 left-6">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                  song.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                  song.status === 'rejected' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                  'bg-amber-500/10 text-amber-500 border-amber-500/20'
                }`}>
                  {song.status}
                </span>
              </div>
            </div>
            
            {audioUrl && (
              <div className="p-6 bg-white/[0.02]">
                <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
                <div className="flex items-center gap-4">
                  <button onClick={togglePlay} className="w-12 h-12 rounded-[1.2rem] bg-emerald-500 flex items-center justify-center text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all">
                    {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-1" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{song.name}</p>
                    <p className="text-[10px] text-zinc-500 font-mono tracking-widest mt-1">{formatDuration(song.duration)} / MASTER AUDIO</p>
                  </div>
                  <a href={audioUrl} target="_blank" rel="noreferrer" className="p-2 text-zinc-600 hover:text-white transition-colors">
                    <ExternalLink size={18} />
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="premium-card space-y-6">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Activity size={14} /> Performance Data
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total Plays', value: (song as any).playCount || 0, icon: Play, color: 'text-blue-500' },
                { label: 'Favorites', value: (song as any).favoriteCount || 0, icon: Heart, color: 'text-rose-500' },
              ].map(stat => (
                <div key={stat.label} className="bg-white/5 p-4 rounded-2xl text-center border border-white/5">
                  <stat.icon size={16} className={`${stat.color} mx-auto mb-2`} />
                  <p className="text-lg font-bold text-white">{stat.value.toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {song.status === 'rejected' && (
            <div className="premium-card border-rose-500/20 bg-rose-500/[0.02]">
              <div className="flex items-center gap-3 text-rose-500 mb-4">
                <ShieldAlert size={18} />
                <h4 className="text-xs font-bold uppercase tracking-widest">Rejection Protocol</h4>
              </div>
              <p className="text-sm text-zinc-400 italic">"{song.rejectionReason || 'No justification provided'}"</p>
            </div>
          )}
        </div>

        {/* Right: Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="premium-card space-y-10">
                <form id="edit-form" onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Artwork Workspace</label>
                      <FileUpload currentFile={formData.coverArt || undefined} onFileSelect={handleCoverArtSelect} onFileRemove={() => { setCoverArtFile(null); setFormData(p => ({ ...p, coverArt: '' })); }} />
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Audio Payload</label>
                      <FileUpload fileType="audio" maxSize={50} onFileSelect={file => setAudioFile(file)} onFileRemove={() => { setAudioFile(null); setFormData(p => ({ ...p, audioFile: '' })); }} currentFile={formData.audioFile || undefined} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Track Title</label>
                      <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} required className="input-field" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Artist Entity</label>
                      <div className="relative">
                        <select name="artist" value={formData.artist || ''} onChange={handleInputChange} required className="input-field appearance-none">
                          <option value="">Select Artist...</option>
                          {artists.map(a => <option key={a._id} value={a._id}>{a.name || a.fullName}</option>)}
                        </select>
                        <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-zinc-600 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Album Association</label>
                      <div className="relative">
                        <select name="album" value={formData.album || ''} onChange={handleInputChange} className="input-field appearance-none">
                          <option value="">Single (No Album)</option>
                          {albums.map(al => <option key={al._id} value={al._id}>{al.name}</option>)}
                        </select>
                        <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-zinc-600 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Genre Mapping</label>
                      <div className="relative">
                        <select name="genre" value={formData.genre || ''} onChange={handleInputChange} required className="input-field appearance-none">
                          <option value="">Select Genre...</option>
                          {genres.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                        </select>
                        <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-zinc-600 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Duration (Sec)</label>
                      <input type="number" name="duration" value={formData.duration || 0} onChange={handleInputChange} required className="input-field" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Release Protocol</label>
                      <input type="date" name="releaseDate" value={formData.releaseDate || ''} onChange={handleInputChange} required className="input-field" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Lyric Transmission</label>
                      <textarea name="lyrics" value={formData.lyrics || ''} onChange={handleInputChange} rows={8} className="input-field h-auto resize-none" placeholder="Enter lyrical data..." />
                    </div>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                <div className="premium-card">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-4 mb-8">
                    <FileText size={14} /> Protocol Intelligence
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    {[
                      { label: 'Associated Album', value: albumName, icon: Disc, color: 'text-purple-500' },
                      { label: 'Genre Classification', value: genreName, icon: Tag, color: 'text-amber-500' },
                      { label: 'Signal Duration', value: formatDuration(song.duration), icon: Clock, color: 'text-emerald-500' },
                      { label: 'Release Date', value: song.releaseDate ? new Date(song.releaseDate).toLocaleDateString() : 'Pending', icon: Calendar, color: 'text-rose-500' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                          <item.icon size={18} className={item.color} />
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{item.label}</p>
                          <p className="text-sm font-bold text-white">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 pt-8 border-t border-white/5">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText size={14} className="text-zinc-600" />
                      <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Lyric Data</h4>
                    </div>
                    <div className="bg-zinc-950/50 rounded-3xl p-8 border border-white/5">
                      {song.lyrics ? (
                        <pre className="text-sm text-zinc-400 whitespace-pre-wrap font-sans leading-relaxed max-h-[400px] overflow-y-auto no-scrollbar">{song.lyrics}</pre>
                      ) : (
                        <p className="text-xs text-zinc-700 italic text-center py-10 uppercase tracking-widest font-bold">No lyrical transmission detected</p>
                      )}
                    </div>
                  </div>
                </div>

                {song.splitSheet && song.splitSheet.length > 0 && (
                  <div className="premium-card">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-4 mb-6">
                      <ShieldCheck size={14} className="text-emerald-500" /> Ownership Split Agreement
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {song.splitSheet.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-5 bg-white/[0.02] rounded-[1.5rem] border border-white/5 hover:border-emerald-500/20 transition-all group">
                          <div>
                            <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{item.contributor}</p>
                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">{item.role}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-emerald-500">{item.share}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {linkedVideo && (
                  <div className="premium-card">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <Video size={14} className="text-blue-500" /> Music Video Integration
                      </h3>
                      <button onClick={() => navigate('/admin/video-management')} className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest hover:text-emerald-400 transition-colors">
                        Manage Assets
                      </button>
                    </div>
                    <div className="aspect-video rounded-[2rem] overflow-hidden bg-black border border-white/5 group relative shadow-2xl">
                      <video src={getFullImageUrl(linkedVideo.videoUrl)} controls className="w-full h-full object-contain" />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={deleteOpen} 
        title="Purge Track Registry?" 
        message={`This protocol will permanently delete "${song?.name}" from the network. Proceed?`} 
        confirmLabel="Purge Media" 
        onConfirm={handleDelete} 
        onCancel={() => setDeleteOpen(false)} 
      />
    </div>
  );
};

export default SongDetail;
