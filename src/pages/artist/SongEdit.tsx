import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, Music2, Disc, Tag, Clock, Calendar, 
  FileText, Save, Play, Pause, AlertCircle,
  CheckCircle, Loader2, Info, Layout, Users, Trash2,
  Activity, Target, Award, ShieldAlert, Sparkles, Send, ShieldCheck
} from 'lucide-react';
import songService, { Song, CreateSongData } from '../../services/songService';
import albumService, { Album } from '../../services/albumService';
import genreService, { Genre } from '../../services/genreService';
import FileUpload from '../../components/ui/FileUpload';
import Preloader from '../../components/ui/Preloader';

// ── Shared primitives ─────────────────────────────────────────────
const card = 'bg-zinc-900 border border-white/[0.06] rounded-lg shadow-2xl relative overflow-hidden group';
const labelClass = 'block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 italic';
const inputClass = 'w-full px-5 py-4 bg-zinc-950 border border-white/[0.08] rounded-xl text-white text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-inner placeholder:text-zinc-700 italic tracking-widest';

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
      const [songData, albumData, genreData] = await Promise.all([
        songService.getSongById(songId),
        albumService.getAllAlbums(),
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

  if (loading) return <Preloader isVisible text="SYNCING TRANSMISSION DATA..." />;
  if (!song) return null;

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8 animate-in fade-in duration-700">
      
      {/* ── Branded Header ── */}
      <div className={`${card} p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden group`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.02] rounded-bl-full pointer-events-none" />
        <div className="flex items-center gap-6 relative z-10">
          <button 
            onClick={() => navigate('/artist/songs')}
            className="w-12 h-12 flex items-center justify-center bg-zinc-950 hover:bg-emerald-500 hover:text-white text-zinc-500 rounded-xl transition-all border border-white/[0.06] shadow-xl group/back"
          >
            <ArrowLeft size={24} className="group-hover/back:-translate-x-1 transition-transform" />
          </button>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2 italic">Edit Transmission v2.4</p>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase italic flex items-center gap-3">
              {song.name} <span className="text-zinc-600">/</span> Modification
            </h1>
            <p className="text-sm text-zinc-500 mt-1 font-medium">Reconfigure sonic metadata and resubmit for network validation.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={() => navigate('/artist/dashboard')}
            className="h-14 px-8 text-[11px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-950 border border-white/[0.04] rounded-xl hover:text-white hover:border-white/[0.1] transition-all italic"
          >
            Abort Changes
          </button>
          <button
            form="song-edit-form"
            type="submit"
            disabled={submitting}
            className="h-14 px-10 bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 hover:scale-[1.02] transition-all shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-3 italic"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save & Resubmit Cycle
          </button>
        </div>
      </div>

      {/* ── Rejection Signal Alert ── */}
      {song.status === 'rejected' && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${card} p-8 border-rose-500/20 bg-rose-500/[0.02] flex flex-col md:flex-row gap-8 relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/[0.05] rounded-bl-full pointer-events-none" />
          <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl shadow-rose-500/20 relative z-10">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 mb-2 italic">Validation Failure Detected</p>
            <h3 className="text-xl font-black text-white uppercase italic mb-4">Transmission Purged / Action Required</h3>
            <div className="bg-zinc-950/80 backdrop-blur-md p-6 rounded-2xl border border-white/[0.04] shadow-inner">
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2 italic">Network Analysis:</p>
              <p className="text-sm text-zinc-300 font-medium italic leading-relaxed">"{song.rejectionReason || 'No specific metadata failure provided. Perform full asset audit.'}"</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Media Preview HUD ── */}
        <div className="space-y-8">
          <div className={`${card} p-8 relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.01] rounded-bl-full pointer-events-none" />
            <div className="flex items-center gap-4 mb-8">
               <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/[0.04] shadow-inner">
                  <Disc className="h-5 w-5 text-emerald-500" />
               </div>
               <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic">Media Preview HUD</h3>
            </div>
            
            <div className="aspect-square rounded-2xl overflow-hidden bg-zinc-950 mb-8 relative border border-white/[0.06] shadow-2xl group-hover:scale-[1.02] transition-transform duration-500">
              <img
                src={formData.coverArtUrl || formData.coverArt || '/default-track-cover.jpg'}
                alt="Cover Preview"
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                onError={(e) => { (e.target as HTMLImageElement).src = '/default-track-cover.jpg'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
            </div>

            {song.audioFile && (
              <div className="bg-zinc-950 p-6 rounded-2xl border border-white/[0.04] shadow-inner">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4 italic">Spectral Feed</p>
                <div className="flex items-center gap-5">
                  <button 
                    type="button" 
                    onClick={togglePlay}
                    className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 hover:scale-110 transition-all shadow-xl shadow-emerald-500/20"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1 fill-current" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-white truncate italic uppercase tracking-tight">{song.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <Activity className="w-3 h-3 text-emerald-500/50" />
                       <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">{formatDuration(song.duration)} / Transmitting</p>
                    </div>
                  </div>
                </div>
                <audio ref={audioRef} src={song.audioFileUrl || song.audioFile} onEnded={() => setIsPlaying(false)} />
              </div>
            )}

            <div className="mt-8 p-5 bg-zinc-950/50 rounded-2xl border border-white/[0.02] flex gap-4">
              <Info className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.1em] italic leading-relaxed">
                Resubmitting a track will initiate a new network validation cycle. Distribution will remain locked during this state.
              </p>
            </div>
          </div>
        </div>

        {/* ── Edit Configuration Form ── */}
        <div className="lg:col-span-2 space-y-8">
          <form id="song-edit-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Track Metadata Sector */}
            <div className={`${card} p-8 space-y-8 relative overflow-hidden`}>
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/[0.04] shadow-inner">
                    <Music2 className="h-5 w-5 text-emerald-500" />
                 </div>
                 <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic">Sonic Metadata Sector</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label className={labelClass}>Transmission Identity (Track Title)</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Genre Spectrum</label>
                  <select
                    name="genre"
                    value={formData.genre || ''}
                    onChange={handleInputChange}
                    required
                    className={inputClass}
                  >
                    <option value="">SELECT SPECTRUM</option>
                    {genres.map(g => <option key={g._id} value={g._id}>{g.name.toUpperCase()}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Target Album (Optional)</label>
                  <select
                    name="album"
                    value={formData.album || ''}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    <option value="">SINGLE / STANDALONE</option>
                    {albums.map(al => <option key={al._id} value={al._id}>{al.name.toUpperCase()}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Deployment Date</label>
                  <div className="relative group">
                    <input
                      type="date"
                      name="releaseDate"
                      value={formData.releaseDate || ''}
                      onChange={handleInputChange}
                      required
                      className={inputClass}
                    />
                    <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-700 group-focus-within:text-emerald-500 pointer-events-none transition-colors" />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Transmission Pulse (Duration/Sec)</label>
                  <div className="relative group">
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration || 0}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className={inputClass}
                    />
                    <Clock className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-700 group-focus-within:text-emerald-500 pointer-events-none transition-colors" />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>Lyrical Intelligence (Transcript)</label>
                <div className="relative group">
                  <textarea
                    name="lyrics"
                    value={formData.lyrics || ''}
                    onChange={handleInputChange}
                    rows={8}
                    placeholder="ENTER SONIC INTELLIGENCE TRANSCRIPT..."
                    className={`${inputClass} resize-none`}
                  />
                  <FileText className="absolute right-5 top-5 w-5 h-5 text-zinc-800 group-focus-within:text-emerald-500 transition-colors" />
                </div>
              </div>
            </div>

            {/* Asset Configuration Sector */}
            <div className={`${card} p-8 space-y-8 relative overflow-hidden`}>
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/[0.04] shadow-inner">
                    <Tag className="h-5 w-5 text-emerald-500" />
                 </div>
                 <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic">Media Asset Matrix</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 bg-zinc-950/30 rounded-2xl border border-white/[0.04] shadow-inner">
                  <p className={labelClass}>Modify Cover Art Asset</p>
                  <FileUpload 
                    label="COVER ART HUD" 
                    currentFile={formData.coverArt || undefined} 
                    onFileSelect={handleCoverArtSelect} 
                    onFileRemove={() => { 
                      setCoverArtFile(null); 
                      setFormData(prev => ({ ...prev, coverArt: '' })); 
                    }} 
                  />
                </div>

                <div className={`${song.status !== 'rejected' ? 'opacity-30 pointer-events-none grayscale' : ''} p-6 bg-zinc-950/30 rounded-2xl border border-white/[0.04] shadow-inner`}>
                  <div className="flex items-center justify-between mb-4">
                     <p className={labelClass}>Spectral Replace (Audio)</p>
                     {song.status !== 'rejected' ? (
                        <div className="px-2 py-0.5 bg-zinc-900 border border-white/[0.04] rounded text-[8px] font-black text-zinc-600 uppercase italic">Locked Feed</div>
                     ) : (
                        <div className="px-2 py-0.5 bg-rose-500/20 border border-rose-500/20 rounded text-[8px] font-black text-rose-500 uppercase italic">Action Enable</div>
                     )}
                  </div>
                  <FileUpload 
                    label="AUDIO SPECTRAL FEED" 
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
            
            {/* Collaboration & Split Sheet Sector */}
            <div className={`${card} p-8 space-y-8 relative overflow-hidden`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/[0.04] shadow-inner">
                          <Users className="h-5 w-5 text-emerald-500" />
                       </div>
                       <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic">Collaborative Split Sheet</h3>
                    </div>
                    <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-zinc-950 rounded-xl border border-white/[0.02] text-emerald-500 shadow-inner">
                      <Target className="w-4 h-4 animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] italic">Network Sync Active</span>
                    </div>
                </div>

                {/* Tactical Invite Engine */}
                <div className="p-8 bg-zinc-950 border border-white/[0.08] rounded-2xl shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.02] rounded-bl-full pointer-events-none" />
                    <p className="text-[9px] font-black text-zinc-600 uppercase mb-6 tracking-[0.3em] italic px-1">Initialize New Contributor Invite</p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                        <div className="md:col-span-1">
                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1 block mb-2 italic">Identity</label>
                            <input
                                type="text"
                                value={newContributor.contributorName}
                                onChange={(e) => setNewContributor({...newContributor, contributorName: e.target.value})}
                                className="w-full h-12 px-4 bg-zinc-900 border border-white/[0.06] rounded-xl text-sm font-bold text-white outline-none focus:border-emerald-500 transition-all shadow-inner placeholder:text-zinc-800 italic"
                                placeholder="PUBLIC ID"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1 block mb-2 italic">Terminal Email</label>
                            <input
                                type="email"
                                value={newContributor.email}
                                onChange={(e) => setNewContributor({...newContributor, email: e.target.value})}
                                className="w-full h-12 px-4 bg-zinc-900 border border-white/[0.06] rounded-xl text-sm font-bold text-white outline-none focus:border-emerald-500 transition-all shadow-inner placeholder:text-zinc-800 italic"
                                placeholder="EMAIL@SECTOR.COM"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1 block mb-2 italic">Sector Role</label>
                            <select
                                value={newContributor.role}
                                onChange={(e) => setNewContributor({...newContributor, role: e.target.value})}
                                className="w-full h-12 px-4 bg-zinc-900 border border-white/[0.06] rounded-xl text-xs font-black text-white outline-none focus:border-emerald-500 transition-all shadow-inner italic uppercase tracking-widest"
                            >
                                <option value="songwriter">Songwriter</option>
                                <option value="producer">Producer</option>
                                <option value="vocalist">Vocalist</option>
                                <option value="featured-artist">Featured Artist</option>
                                <option value="engineer">Engineer</option>
                            </select>
                        </div>
                        <div className="md:col-span-1 flex items-end gap-3">
                            <div className="flex-1">
                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1 block mb-2 italic">Share %</label>
                                <input
                                    type="number"
                                    value={newContributor.share || ''}
                                    onChange={(e) => setNewContributor({...newContributor, share: parseFloat(e.target.value) || 0})}
                                    className="w-full h-12 px-4 bg-zinc-900 border border-white/[0.06] rounded-xl text-sm font-black text-white outline-none focus:border-emerald-500 transition-all shadow-inner italic"
                                    placeholder="VAL"
                                    max="100"
                                    min="1"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleInviteContributor}
                                disabled={isInviting}
                                className="h-12 px-6 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 disabled:opacity-50 transition-all italic flex items-center gap-2"
                            >
                                {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                INVITE
                            </button>
                        </div>
                    </div>
                </div>

                {/* Team Stream HUD */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                       <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] italic">Active Contributor Ledger</p>
                       <div className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-emerald-500" />
                          <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest italic">{splitSheet.length} Units Active</p>
                       </div>
                    </div>
                    {splitSheet.length === 0 ? (
                      <div className="p-12 text-center bg-zinc-950/20 rounded-2xl border border-dashed border-white/[0.04] shadow-inner">
                        <Users className="w-12 h-12 text-zinc-800 mx-auto mb-4 opacity-50" />
                        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest italic">Zero external signals detected.</p>
                      </div>
                    ) : (
                      splitSheet.map((item, idx) => (
                          <div key={item._id || idx} className="p-5 bg-zinc-950/40 rounded-2xl border border-white/[0.02] flex items-center justify-between gap-6 group hover:border-emerald-500/20 transition-all shadow-inner relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-bl-full pointer-events-none" />
                              <div className="flex items-center gap-5 flex-1 relative z-10">
                                  <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-white/[0.06] flex items-center justify-center overflow-hidden shadow-2xl relative">
                                      {item.user?.profilePicture ? (
                                        <img src={item.user.profilePicture} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-emerald-500 font-black text-lg italic">
                                          {(item.contributor || item.email).charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                      <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-3">
                                          <p className="text-sm font-black text-white italic truncate uppercase tracking-tight">{item.contributor || item.email}</p>
                                          {item.status === 'accepted' ? (
                                            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-[0.2em] border border-emerald-500/20 flex items-center gap-1.5 italic">
                                              <ShieldCheck className="w-2.5 h-2.5" /> SECURE
                                            </span>
                                          ) : (
                                            <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-[0.2em] border border-amber-500/20 flex items-center gap-1.5 italic animate-pulse">
                                              <Clock className="w-2.5 h-2.5" /> PENDING
                                            </span>
                                          )}
                                      </div>
                                      <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">{item.role}</span>
                                        <div className="w-1 h-1 rounded-full bg-zinc-800" />
                                        <p className="text-[10px] text-zinc-600 font-black truncate italic lowercase">{item.email}</p>
                                      </div>
                                  </div>
                              </div>

                              <div className="flex items-center gap-8 relative z-10">
                                  <div className="text-right">
                                    <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mb-1 italic">Split VAL</p>
                                    <p className="text-lg font-black text-white italic tracking-tighter">{item.share}%</p>
                                  </div>
                                  <button
                                      type="button"
                                      onClick={() => handleRemoveContributor(item._id)}
                                      className="w-10 h-10 flex items-center justify-center text-zinc-700 hover:text-rose-500 bg-zinc-950 rounded-xl border border-white/[0.04] hover:border-rose-500/20 transition-all opacity-0 group-hover:opacity-100"
                                  >
                                      <Trash2 className="w-4 h-4" />
                                  </button>
                              </div>
                          </div>
                      ))
                    )}
                </div>
                
                {splitSheet.reduce((acc, curr) => acc + curr.share, 0) !== 100 && splitSheet.length > 0 && (
                    <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-2xl flex items-center gap-4 animate-pulse">
                        <ShieldAlert className="w-6 h-6 text-rose-500 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest italic">Signal Imbalance Detected</p>
                          <p className="text-[10px] text-rose-400 mt-1 font-black tracking-tight uppercase italic opacity-60">
                            Current Matrix Total: {splitSheet.reduce((acc, curr) => acc + curr.share, 0)}% (Network Requires 100% Validation)
                          </p>
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
