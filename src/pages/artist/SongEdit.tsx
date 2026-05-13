import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, Music2, Disc, Tag, Clock, Calendar, 
  FileText, Save, Play, Pause, AlertCircle,
  CheckCircle, Loader2, Info, Layout, Users, Trash2,
  Activity, Target, Award, ShieldAlert, Sparkles, Send, ShieldCheck,
  ChevronDown, Plus
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
      toast.error('Please provide email, role, and a share percentage.');
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
      setSong(songData);
      setAlbums(albumData);
      setGenres(genreData);
      populateForm(songData, albumData, genreData);
      reloadContributors();
    } catch (err: any) {
      toast.error('Failed to load track details');
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
        if (!isNaN(d.getTime())) formattedDate = d.toISOString().split('T')[0];
      } catch (e) { console.error('Date error:', e); }
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
    setFormData(prev => ({ ...prev, [name]: name === 'duration' ? parseFloat(value) || 0 : value }));
  };

  const handleCoverArtSelect = async (file: File) => {
    setCoverArtFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setFormData(prev => ({ ...prev, coverArt: reader.result as string }));
    reader.readAsDataURL(file);
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
        }
        if (coverArtFile) {
          const coverPresign = await songService.getPresignedUrl('cover-art', coverArtFile.name, coverArtFile.type);
          await songService.uploadToS3(coverPresign.uploadUrl, coverArtFile, coverArtFile.type);
          cleanedData.coverArtKey = coverPresign.key;
        }
      }
      toast.loading('Saving changes...', { id: 'edit-upload' });
      await songService.updateSong(song._id, cleanedData as any);
      toast.success('Track updated successfully!', { id: 'edit-upload' });
      navigate('/artist/songs');
    } catch (err: any) {
      toast.error('Failed to update track', { id: 'edit-upload' });
    } finally {
      setSubmitting(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play(); setIsPlaying(true); }
  };

  if (loading) return <Preloader isVisible text="Loading track details..." />;
  if (!song) return null;

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-10">
      
      {/* Header */}
      <div className="premium-card !p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 border-white/5 shadow-2xl">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/artist/songs')} className="w-12 h-12 flex items-center justify-center bg-zinc-950 hover:bg-white text-zinc-500 hover:text-black rounded-xl transition-all border border-white/5 shadow-xl">
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
               <h1 className="text-3xl font-bold text-white tracking-tight uppercase">Edit Track</h1>
               <div className="px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
               </div>
            </div>
            <p className="text-sm text-zinc-500 font-medium">Update metadata, assets, and collaborator splits.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/artist/songs')} className="h-14 px-8 text-xs font-bold text-zinc-500 bg-zinc-950 border border-white/5 rounded-2xl hover:text-white transition-all">
            Cancel
          </button>
          <button
            form="song-edit-form"
            type="submit"
            disabled={submitting}
            className="h-14 px-10 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-3"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Rejection Alert */}
      {song.status === 'rejected' && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="premium-card p-8 border-rose-500/20 bg-rose-500/5 flex flex-col md:flex-row gap-8 items-center">
          <div className="w-16 h-16 bg-rose-600 rounded-3xl flex items-center justify-center shadow-xl shadow-rose-900/20">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">Correction Required</h3>
            <p className="text-sm text-zinc-400 font-medium leading-relaxed italic">"{song.rejectionReason || 'No reason provided.'}"</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Media Preview */}
        <div className="space-y-8">
          <div className="premium-card p-8 border-white/5 shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center border border-white/5 shadow-inner">
                  <Disc className="h-5 w-5 text-emerald-500" />
               </div>
               <h3 className="text-sm font-bold text-white">Media Preview</h3>
            </div>
            
            <div className="aspect-square rounded-[2rem] overflow-hidden bg-zinc-950 mb-8 border border-white/5 shadow-2xl">
              <img
                src={formData.coverArt || '/default-track-cover.jpg'}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = '/default-track-cover.jpg'; }}
              />
            </div>

            {song.audioFile && (
              <div className="bg-zinc-950 p-6 rounded-2xl border border-white/5 shadow-inner">
                <div className="flex items-center gap-5">
                  <button type="button" onClick={togglePlay} className="w-14 h-14 rounded-2xl bg-emerald-500 text-black flex items-center justify-center hover:scale-105 transition-all shadow-xl">
                    {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1 fill-current" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{song.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <Clock size={12} className="text-zinc-600" />
                       <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Previewing audio</p>
                    </div>
                  </div>
                </div>
                <audio ref={audioRef} src={song.audioFile} onEnded={() => setIsPlaying(false)} />
              </div>
            )}
          </div>
        </div>

        {/* Details Form */}
        <div className="lg:col-span-2 space-y-10">
          <form id="song-edit-form" onSubmit={handleSubmit} className="space-y-10">
            <div className="premium-card p-10 space-y-8 border-white/5 shadow-2xl">
              <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                 <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/5 shadow-inner">
                    <FileText size={20} className="text-emerald-500" />
                 </div>
                 <h3 className="text-lg font-bold text-white">General Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Track Title</label>
                  <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} required className="w-full h-14 px-6 bg-zinc-950 border border-white/5 rounded-2xl text-white font-medium focus:border-emerald-500/30 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Genre</label>
                  <select name="genre" value={formData.genre || ''} onChange={handleInputChange} required className="w-full h-14 px-6 bg-zinc-950 border border-white/5 rounded-2xl text-white font-medium focus:border-emerald-500/30 transition-all appearance-none">
                    <option value="">Select Genre</option>
                    {genres.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Album (Optional)</label>
                  <select name="album" value={formData.album || ''} onChange={handleInputChange} className="w-full h-14 px-6 bg-zinc-950 border border-white/5 rounded-2xl text-white font-medium focus:border-emerald-500/30 transition-all appearance-none">
                    <option value="">Single / No Album</option>
                    {albums.map(al => <option key={al._id} value={al._id}>{al.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Release Date</label>
                  <input type="date" name="releaseDate" value={formData.releaseDate || ''} onChange={handleInputChange} required className="w-full h-14 px-6 bg-zinc-950 border border-white/5 rounded-2xl text-white font-medium focus:border-emerald-500/30 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">YouTube URL (Optional)</label>
                  <input type="text" name="videoUrl" value={formData.videoUrl || ''} onChange={handleInputChange} placeholder="https://youtube.com/..." className="w-full h-14 px-6 bg-zinc-950 border border-white/5 rounded-2xl text-white font-medium focus:border-emerald-500/30 transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Lyrics</label>
                <textarea name="lyrics" value={formData.lyrics || ''} onChange={handleInputChange} rows={6} placeholder="Track lyrics..." className="w-full p-6 bg-zinc-950 border border-white/5 rounded-2xl text-white font-medium focus:border-emerald-500/30 transition-all resize-none" />
              </div>
            </div>

            {/* Media Assets */}
            <div className="premium-card p-10 space-y-8 border-white/5 shadow-2xl">
              <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                 <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/5 shadow-inner">
                    <Tag size={20} className="text-emerald-500" />
                 </div>
                 <h3 className="text-lg font-bold text-white">Media Assets</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Update Cover Art</p>
                  <FileUpload label="Select Image" onFileSelect={handleCoverArtSelect} onFileRemove={() => { setCoverArtFile(null); setFormData(prev => ({ ...prev, coverArt: '' })); }} />
                </div>
                <div className={`space-y-4 ${song.status !== 'rejected' ? 'opacity-30 pointer-events-none' : ''}`}>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Replace Audio (Rejected Only)</p>
                  <FileUpload label="Select Audio" fileType="audio" maxSize={50} onFileSelect={file => setAudioFile(file)} onFileRemove={() => setAudioFile(null)} />
                </div>
              </div>
            </div>
            
            {/* Split Sheet */}
            <div className="premium-card p-10 space-y-8 border-white/5 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/5 shadow-inner">
                          <Users size={20} className="text-purple-500" />
                       </div>
                       <h3 className="text-lg font-bold text-white">Revenue Splits</h3>
                    </div>
                    <button type="button" onClick={() => navigate(`/artist/songs/${id}/splits`)} className="text-xs font-bold text-emerald-500 hover:text-emerald-400 transition-all flex items-center gap-2">
                       Manage Full Splits <Plus size={16} />
                    </button>
                </div>

                <div className="space-y-4">
                    {splitSheet.length === 0 ? (
                      <p className="text-sm text-zinc-500 italic text-center py-8">No collaborator splits found.</p>
                    ) : (
                      splitSheet.map((item, idx) => (
                          <div key={idx} className="p-4 bg-zinc-950 rounded-2xl border border-white/5 flex items-center justify-between gap-6 shadow-inner">
                              <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center font-bold text-emerald-500">
                                      {item.contributor.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                      <p className="text-sm font-bold text-white">{item.contributor}</p>
                                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">{item.role}</p>
                                  </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-white">{item.share}%</p>
                              </div>
                          </div>
                      ))
                    )}
                </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SongEdit;
