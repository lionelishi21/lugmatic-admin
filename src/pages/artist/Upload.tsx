import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload as UploadIcon, 
  Music, 
  ImageIcon, 
  X, 
  Loader2, 
  CheckCircle2, 
  FileAudio, 
  Sparkles, 
  Film,
  Zap,
  Shield,
  Layers,
  ChevronRight,
  Plus,
  Search,
  Mail,
  UserPlus,
  PlayCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import genreService, { Genre } from '../../services/genreService';
import songService, { CreateSongData } from '../../services/songService';
import artistService, { Artist } from '../../services/artistService';
import { useAuth } from '../../hooks/useAuth';

// ─── Constants ───────────────────────────────────────────────────────────────
const card = 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg';
const inputClass = 'w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.06] rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-xs font-black uppercase tracking-widest italic';
const labelClass = 'block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2.5 ml-1 italic';

interface Contributor {
  name: string;
  role: string;
  share: number;
  userId?: string;
  email?: string;
}

interface UploadForm {
  title: string;
  description: string;
  genre: string;
  releaseDate: string;
  lyrics: string;
  videoUrl: string;
}

export default function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<UploadForm>({
    title: '',
    description: '',
    genre: '',
    releaseDate: new Date().toISOString().split('T')[0],
    lyrics: '',
    videoUrl: ''
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [contributors, setContributors] = useState<Contributor[]>([
    { name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : (user?.name || user?.email || ''), role: 'ARTIST', share: 100 }
  ]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [artistsList, setArtistsList] = useState<Artist[]>([]);
  const [selectedArtistId, setSelectedArtistId] = useState<string>('');
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [dragOverAudio, setDragOverAudio] = useState(false);
  const [dragOverCover, setDragOverCover] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoadingGenres(true);
        const fetchedGenres = await genreService.getAllGenres();
        setGenres(fetchedGenres.filter(g => g.isActive));
      } catch (error) {
        console.error('Failed to fetch genres:', error);
        toast.error('Uplink failed: could not load genres.');
      } finally {
        setLoadingGenres(false);
      }
    };
    fetchGenres();

    if (isAdmin) {
      const fetchArtists = async () => {
        try {
          setLoadingArtists(true);
          const artists = await artistService.getAllArtists();
          setArtistsList(artists);
        } catch (error) {
          console.error('Failed to fetch artists:', error);
          toast.error('Registry sync failed: could not load artists.');
        } finally {
          setLoadingArtists(false);
        }
      };
      fetchArtists();
    }
  }, [isAdmin]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const processAudioFile = (file: File) => {
    if (!file.type.startsWith('audio/')) {
      toast.error('Invalid signal: audio file required.');
      return;
    }
    setAudioFile(file);
    const audio = new Audio(URL.createObjectURL(file));
    audio.onloadedmetadata = () => {
      setAudioDuration(Math.round(audio.duration));
      URL.revokeObjectURL(audio.src);
    };
  };

  const processCoverFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid signal: image file required.');
      return;
    }
    setCoverImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processAudioFile(file);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processCoverFile(file);
  };

  const handleAudioDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverAudio(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processAudioFile(file);
  };

  const handleCoverDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverCover(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processCoverFile(file);
  };

  const addContributor = () => {
    setContributors([...contributors, { name: '', role: 'SONGWRITER', share: 0 }]);
  };

  const handleContributorSearch = async (index: number, query: string) => {
    const newContributors = [...contributors];
    newContributors[index].name = query;
    setContributors(newContributors);

    if (query.length < 2) {
      setSearchResults([]);
      setActiveSearchIndex(null);
      return;
    }

    try {
      setIsSearching(true);
      setActiveSearchIndex(index);
      const { userService } = await import('../../services/userService');
      const response = await (userService as any).searchUsers(query);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectContributor = (index: number, selectedUser: any) => {
    const newContributors = [...contributors];
    newContributors[index] = {
      name: `${selectedUser.firstName} ${selectedUser.lastName}`,
      role: newContributors[index].role || 'SONGWRITER',
      share: newContributors[index].share,
      userId: selectedUser._id,
      email: selectedUser.email
    };
    setContributors(newContributors);
    setSearchResults([]);
    setActiveSearchIndex(null);
  };

  const inviteContributor = async (index: number) => {
    const email = contributors[index].name;
    if (!email || !email.includes('@')) {
      toast.error('Provide valid tactical email address.');
      return;
    }

    try {
      setIsSearching(true);
      const { userService } = await import('../../services/userService');
      await (userService as any).sendContributorInvitation(email);
      toast.success(`Broadast invitation sent to ${email}`);
      setSearchResults([]);
      setActiveSearchIndex(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Signal invitation failed.');
    } finally {
      setIsSearching(false);
    }
  };

  const removeContributor = (index: number) => {
    setContributors(contributors.filter((_, i) => i !== index));
  };

  const updateContributor = (index: number, field: keyof Contributor, value: string | number) => {
    const newContributors = [...contributors];
    newContributors[index] = { ...newContributors[index], [field]: value };
    setContributors(newContributors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || (!user.id && !user.artistId)) {
      toast.error('Identity required for broadcast.');
      return;
    }

    let artistId: string | null = null;
    
    if (isAdmin) {
      artistId = selectedArtistId || null;
      if (!artistId) {
        toast.error('Target registry artist required.');
        return;
      }
    } else {
      artistId = (user.artistId as string | null);
      
      if (!artistId) {
        toast.error(
          <div className={`${card} p-5 border-rose-500/20 bg-zinc-900`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 italic mb-2">Protocol Error</p>
            <p className="text-sm font-bold text-white mb-4">Artist registry profile required for tactical deployment.</p>
            <button 
              onClick={() => navigate('/artist/profile')}
              className="w-full py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20"
            >
              Initialize Profile
            </button>
          </div>,
          { duration: 6000, icon: null }
        );
        return;
      }
    }

    if (audioDuration <= 0) {
      toast.error('Could not verify audio sequence length.');
      return;
    }

    if (!audioFile || !coverImage) {
      toast.error('Missing core assets (audio/visual).');
      return;
    }

    if (!form.genre) {
      toast.error('Sector (genre) selection required.');
      return;
    }

    if (!termsAccepted) {
      toast.error('Split protocol agreement required.');
      return;
    }

    const totalShare = contributors.reduce((sum, c) => sum + Number(c.share), 0);
    if (totalShare !== 100) {
      toast.error(`Share protocol mismatch. Current: ${totalShare}%, Required: 100%`);
      return;
    }

    setIsUploading(true);
    try {
      toast.loading('Initializing Asset Uplink...', { id: 'upload' });
      
      const audioRes = await songService.getPresignedUrl('song-audio', audioFile.name, audioFile.type);
      toast.loading('Syncing Audio Array...', { id: 'upload' });
      await songService.uploadToS3(audioRes.uploadUrl, audioFile, audioFile.type);

      const coverRes = await songService.getPresignedUrl('cover-art', coverImage.name, coverImage.type);
      toast.loading('Syncing Visual Array...', { id: 'upload' });
      await songService.uploadToS3(coverRes.uploadUrl, coverImage, coverImage.type);

      let videoFileKey = '';
      if (videoFile) {
        const videoRes = await songService.getPresignedUrl('profile-image' as any, videoFile.name, videoFile.type); 
        toast.loading('Syncing Video Component...', { id: 'upload' });
        await songService.uploadToS3(videoRes.uploadUrl, videoFile, videoFile.type);
        videoFileKey = videoRes.key;
      }

      toast.loading('Finalizing Deployment Registry...', { id: 'upload' });
       const songData: CreateSongData = {
        name: form.title,
        artist: String(artistId),
        duration: Number(audioDuration) || 0,
        genre: form.genre,
        releaseDate: form.releaseDate,
        lyrics: form.lyrics,
        audioFileKey: audioRes.key,
        coverArtKey: coverRes.key,
        videoFileKey: videoFileKey || undefined,
        videoUrl: form.videoUrl || undefined,
        splitSheet: contributors.map(c => ({
          contributor: c.name,
          userId: c.userId,
          role: c.role,
          share: Number(c.share)
        })),
        termsAccepted: true
      };

      await songService.createSong(songData);
      toast.success('Tactical Track Deployment Successful!', { id: 'upload' });

      setForm({
        title: '',
        description: '',
        genre: '',
        releaseDate: new Date().toISOString().split('T')[0],
        lyrics: '',
        videoUrl: ''
      });
      setAudioFile(null);
      setAudioDuration(0);
      setCoverImage(null);
      setCoverPreview('');
      setVideoFile(null);
      if (audioInputRef.current) audioInputRef.current.value = '';
      if (imageInputRef.current) imageInputRef.current.value = '';
      if (videoInputRef.current) videoInputRef.current.value = '';
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Uplink failed during deployment.', { id: 'upload' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* ── Branded HUD Header ── */}
      <div className={`${card} p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 overflow-hidden relative`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.02] rounded-bl-full pointer-events-none" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl shadow-emerald-500/20">
            <UploadIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1 italic">Asset Ingestion</p>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase italic">Deploy Track</h1>
            <p className="text-sm text-zinc-500 mt-0.5 font-medium">Broadcast your sonic masterpiece to the global network.</p>
          </div>
        </div>
        
        <div className="flex items-start gap-5 p-5 bg-zinc-950 border border-emerald-500/20 rounded-2xl max-w-md relative z-10">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
             <Shield className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic mb-1">Registry Audit</p>
            <p className="text-[10px] text-zinc-500 font-bold leading-relaxed">
              All transmissions undergo tactical review. Ensure high-fidelity visuals and accurate metadata for priority deployment.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Asset Matrix */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Visual Array Zone */}
          <div className={`${card} p-8`}>
            <p className={labelClass + ' flex items-center gap-3'}>
              <ImageIcon className="h-4 w-4 text-emerald-500" />
              Visual Array (Cover)
            </p>
            <div
              className={`relative rounded-2xl border-2 border-dashed transition-all duration-500 cursor-pointer overflow-hidden group shadow-inner
                ${coverImage
                  ? 'border-emerald-500 bg-emerald-500/5'
                  : dragOverCover
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-zinc-200 dark:border-white/[0.06] hover:border-emerald-500/50 bg-zinc-50 dark:bg-zinc-950/50'
                }`}
              style={{ aspectRatio: '1 / 1' }}
              onDragOver={e => { e.preventDefault(); setDragOverCover(true); }}
              onDragLeave={() => setDragOverCover(false)}
              onDrop={handleCoverDrop}
              onClick={() => !coverImage && imageInputRef.current?.click()}
            >
              {coverPreview ? (
                <>
                  <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setCoverImage(null);
                        setCoverPreview('');
                        if (imageInputRef.current) imageInputRef.current.value = '';
                      }}
                      className="p-4 bg-rose-500 text-white rounded-2xl shadow-2xl hover:bg-rose-600 transition-all scale-90 group-hover:scale-100"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-3xl flex items-center justify-center mb-6 border border-zinc-200 dark:border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                    <ImageIcon className="h-9 w-9 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <p className="text-[10px] font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest italic">Sync Image Signal</p>
                  <p className="text-[9px] text-zinc-500 mt-3 font-black uppercase tracking-tighter opacity-60">1:1 JPG/PNG · 5MB LIMIT</p>
                </div>
              )}
              <input
                ref={imageInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleCoverChange}
                required
              />
            </div>
          </div>

          {/* Audio Sequence Zone */}
          <div className={`${card} p-8`}>
            <p className={labelClass + ' flex items-center gap-3'}>
              <FileAudio className="h-4 w-4 text-emerald-500" />
              Sonic Sequence (Master)
            </p>
            <div
              className={`relative rounded-2xl border-2 border-dashed transition-all duration-500 cursor-pointer p-6 shadow-inner
                ${audioFile
                  ? 'border-emerald-500 bg-emerald-500/5'
                  : dragOverAudio
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-zinc-200 dark:border-white/[0.06] hover:border-emerald-500/50 bg-zinc-50 dark:bg-zinc-950/50'
                }`}
              onDragOver={e => { e.preventDefault(); setDragOverAudio(true); }}
              onDragLeave={() => dragOverAudio && setDragOverAudio(false)}
              onDrop={handleAudioDrop}
              onClick={() => !audioFile && audioInputRef.current?.click()}
            >
              {audioFile ? (
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xl shadow-emerald-500/20">
                    <Music className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate italic">{audioFile.name}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                       <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md uppercase tracking-widest">
                          {audioDuration > 0
                            ? `${Math.floor(audioDuration / 60)}:${String(audioDuration % 60).padStart(2, '0')}`
                            : 'SYNCING...'
                          }
                       </span>
                       <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                          {(audioFile.size / (1024 * 1024)).toFixed(1)} MB
                       </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      setAudioFile(null);
                      setAudioDuration(0);
                      if (audioInputRef.current) audioInputRef.current.value = '';
                    }}
                    className="p-2 text-zinc-400 hover:text-rose-500 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center py-4">
                  <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-3xl flex items-center justify-center mb-5 border border-zinc-200 dark:border-white/10 group-hover:rotate-12 transition-transform duration-500 shadow-xl">
                    <Music className="h-8 w-8 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <p className="text-[10px] font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest italic">Sync Audio Signal</p>
                  <p className="text-[9px] text-zinc-500 mt-3 font-black uppercase tracking-tighter opacity-60">MP3/WAV/FLAC · 50MB LIMIT</p>
                </div>
              )}
              <input
                ref={audioInputRef}
                type="file"
                className="hidden"
                accept="audio/*"
                onChange={handleAudioChange}
                required
              />
            </div>
          </div>

          {/* Video Array (Optional) */}
          <div className={`${card} p-8`}>
            <p className={labelClass + ' flex items-center gap-3'}>
              <Film className="h-4 w-4 text-emerald-500" />
              Visual Feed (Video)
            </p>
            <div className="space-y-6">
              <div 
                onClick={() => videoInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-500 shadow-inner ${
                  videoFile ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-200 dark:border-white/[0.06] hover:border-emerald-500/50 bg-zinc-50 dark:bg-zinc-950/50'
                }`}
              >
                <input 
                  type="file" 
                  ref={videoInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 100 * 1024 * 1024) {
                        toast.error('Tactical breach: video exceeds 100MB limit.');
                        return;
                      }
                      setVideoFile(file);
                    }
                  }}
                  accept="video/*"
                  className="hidden"
                />
                {videoFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-1">
                       <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-black text-white truncate max-w-[200px] uppercase italic tracking-widest">{videoFile.name}</span>
                    <button 
                       type="button"
                      onClick={(e) => { e.stopPropagation(); setVideoFile(null); if(videoInputRef.current) videoInputRef.current.value=''; }}
                      className="text-[9px] text-rose-500 font-black uppercase tracking-widest hover:underline mt-2 italic"
                    >
                      Delete Source
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-white/5">
                       <UploadIcon className="w-6 h-6 text-zinc-400" />
                    </div>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Sync MP4/MOV Source</span>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                   <PlayCircle className="h-4 w-4 text-zinc-500" />
                </div>
                <input
                  type="text"
                  name="videoUrl"
                  value={form.videoUrl}
                  onChange={handleFormChange}
                  placeholder="EXTERNAL SIGNAL URL (YOUTUBE/VIMEO)..."
                  className={inputClass + ' pl-12'}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Metadata Console */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Track Parameters */}
          <div className={`${card} p-8 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-500/[0.02] rounded-bl-full pointer-events-none" />
            <div className="flex items-center gap-4 mb-10 border-b border-zinc-100 dark:border-white/[0.04] pb-6">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                 <Sparkles className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-0.5 italic">Protocol Detail</p>
                 <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-widest italic">Track Parameters</h2>
              </div>
            </div>

            <div className="space-y-8">
              {isAdmin && (
                <div className="bg-rose-500/[0.02] border border-rose-500/10 p-6 rounded-2xl">
                  <label className={labelClass + ' text-rose-500'}>Target Artist Profile <span className="text-rose-500">*</span></label>
                  <select
                    value={selectedArtistId}
                    onChange={(e) => setSelectedArtistId(e.target.value)}
                    className={inputClass + ' border-rose-500/20 focus:ring-rose-500/20 focus:border-rose-500'}
                    required
                    disabled={loadingArtists}
                  >
                    <option value="">{loadingArtists ? 'SYNCING ARTIST REGISTRY...' : 'SELECT TARGET RECIPIENT ARTIST'}</option>
                    {artistsList.map(artist => (
                      <option key={artist._id} value={artist._id}>
                        {(artist.name || artist.fullName || artist.email).toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className={labelClass}>Operational Title <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleFormChange}
                    className={inputClass}
                    placeholder="E.G. SONIC PROTOCOL 01"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className={labelClass}>Deployment Date <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    name="releaseDate"
                    value={form.releaseDate}
                    onChange={handleFormChange}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Primary Sector (Genre) <span className="text-rose-500">*</span></label>
                <select
                  name="genre"
                  value={form.genre}
                  onChange={handleFormChange}
                  className={inputClass}
                  required
                  disabled={loadingGenres}
                >
                  <option value="">{loadingGenres ? 'SYNCING SECTOR DATA...' : 'SELECT SECTOR (GENRE)'}</option>
                  {genres.map(genre => (
                    <option key={genre._id} value={genre._id}>{genre.name.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Lyric Matrix <span className="text-zinc-500 font-black">(OPTIONAL)</span></label>
                <textarea
                  name="lyrics"
                  value={form.lyrics}
                  onChange={handleFormChange}
                  rows={8}
                  className={inputClass + ' resize-none normal-case tracking-normal font-medium h-64'}
                  placeholder="Paste lyrical sequence here..."
                />
              </div>
            </div>
          </div>

          {/* Revenue Split Console */}
          <div className={`${card} p-8 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/[0.02] rounded-bl-full pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 border-b border-zinc-100 dark:border-white/[0.04] pb-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                   <Layers className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-0.5 italic">Financial Protocol</p>
                   <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-widest italic">Revenue Split</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={addContributor}
                className="h-10 px-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-xl shadow-zinc-950/20 flex items-center gap-2"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Entity
              </button>
            </div>
            
            <div className="space-y-6">
              {contributors.map((contributor, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-6 p-6 bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl border border-zinc-100 dark:border-white/[0.04] relative group/row"
                >
                  <div className="sm:col-span-6 relative">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2 block italic">Signal Identity / Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                         <Search className="h-3.5 w-3.5 text-zinc-500" />
                      </div>
                      <input
                        type="text"
                        value={contributor.name}
                        onChange={(e) => handleContributorSearch(index, e.target.value)}
                        placeholder="SEARCH NETWORK..."
                        className={inputClass + ` pl-11 ${contributor.userId ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-500' : ''}`}
                        required
                      />
                      {contributor.userId && <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />}
                    </div>

                    {/* Network Search HUD Dropdown */}
                    <AnimatePresence>
                      {activeSearchIndex === index && (searchResults.length > 0 || (!isSearching && contributor.name.length >= 2)) && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.98, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98, y: 10 }}
                          className={`${card} absolute z-50 w-full mt-3 shadow-2xl overflow-hidden border-emerald-500/20`}
                        >
                          <div className="px-5 py-3 border-b border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/50">
                             <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">Signal Detection</p>
                          </div>
                          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            {searchResults.map((result) => (
                              <button
                                key={result._id}
                                type="button"
                                onClick={() => selectContributor(index, result)}
                                className="w-full px-5 py-4 text-left hover:bg-emerald-500/10 flex items-center gap-4 transition-all border-b border-zinc-50 dark:border-white/5 group/item"
                              >
                                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-xs font-black uppercase italic shadow-lg shadow-emerald-500/20 group-hover/item:scale-110 transition-transform">
                                  {result.firstName[0]}{result.lastName[0]}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-widest italic">{result.firstName} {result.lastName}</span>
                                  <span className="text-[9px] text-zinc-500 font-bold tracking-widest mt-0.5">{result.email.toUpperCase()}</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-zinc-600 ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity" />
                              </button>
                            ))}
                          </div>
                          {searchResults.length === 0 && !isSearching && (
                            <div className="p-6 text-center">
                               <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center mx-auto mb-4 border border-zinc-200 dark:border-white/5">
                                  <Mail className="h-5 w-5 text-zinc-500" />
                               </div>
                               <p className="text-[10px] text-zinc-500 font-black mb-4 uppercase tracking-widest italic">Identity Unknown</p>
                               <button
                                 type="button"
                                 onClick={() => inviteContributor(index)}
                                 className="w-full bg-emerald-600 text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2"
                               >
                                 <UserPlus className="h-3.5 w-3.5" />
                                 Broadcast Invite
                               </button>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2 block italic">Sector Role</label>
                    <select
                      value={contributor.role}
                      onChange={(e) => updateContributor(index, 'role', e.target.value)}
                      className={inputClass}
                    >
                      {['ARTIST', 'PRODUCER', 'SONGWRITER', 'VOCALIST', 'COMPOSER'].map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2 block italic">Allocation</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={contributor.share}
                        onChange={(e) => updateContributor(index, 'share', e.target.value)}
                        className={inputClass + ' pr-10'}
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black text-zinc-500">%</span>
                    </div>
                  </div>
                  
                  <div className="sm:col-span-1 flex items-end justify-center pb-2">
                    {contributors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeContributor(index)}
                        className="h-10 w-10 flex items-center justify-center text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 pt-10 border-t border-zinc-100 dark:border-white/[0.04] space-y-8">
              <label className="flex items-start gap-4 cursor-pointer group bg-zinc-50 dark:bg-zinc-950/50 p-6 rounded-2xl border border-zinc-100 dark:border-white/5 transition-all hover:border-emerald-500/20">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-5 h-5 rounded-md border-zinc-300 dark:border-white/10 bg-white dark:bg-zinc-900 text-emerald-600 focus:ring-emerald-500 transition-all cursor-pointer"
                    required
                  />
                </div>
                <span className="text-[10px] font-black text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors leading-relaxed uppercase tracking-widest italic">
                  I AGREE TO THE SPLIT SHEET PROTOCOL. I CONFIRM THE LEGAL AUTHORITY TO BROADCAST THIS CONTENT AND ATTEST TO THE ACCURACY OF ALL CONTRIBUTOR ALLOCATIONS.
                </span>
              </label>

              <button
                type="submit"
                disabled={isUploading}
                            {searchResults.map((result) => (
                              <button
                                key={result._id}
                                type="button"
                                onClick={() => selectContributor(index, result)}
                                className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                              >
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold uppercase">
                                  {result.firstName[0]}{result.lastName[0]}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-gray-800">{result.firstName} {result.lastName}</span>
                                  <span className="text-[10px] text-gray-500">{result.email}</span>
                                </div>
                                <span className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 capitalize">{result.role}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        {activeSearchIndex === index && !isSearching && contributor.name.length >= 2 && searchResults.length === 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden p-4 text-center">
                             <p className="text-xs text-gray-500 mb-3">No user found with this name or email.</p>
                             <button
                               type="button"
                               onClick={() => inviteContributor(index)}
                               className="w-full bg-green-500 text-white py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-green-600 transition-all"
                             >
                               Invite "{contributor.name}" via Email
                             </button>
                          </div>
                        )}
                        {isSearching && activeSearchIndex === index && (
                          <div className="absolute right-10 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-3.5 w-3.5 text-green-500 animate-spin" />
                          </div>
                        )}
                        </div>
                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-gray-400 font-medium mb-1 block">Role</label>
                        <select
                          value={contributor.role}
                          onChange={(e) => updateContributor(index, 'role', e.target.value)}
                          className={inputClass}
                        >
                          <option value="Artist">Artist</option>
                          <option value="Songwriter">Songwriter</option>
                          <option value="Producer">Producer</option>
                          <option value="Vocalist">Vocalist</option>
                          <option value="Composer">Composer</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-gray-400 font-medium mb-1 block">Share %</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={contributor.share}
                          onChange={(e) => updateContributor(index, 'share', e.target.value)}
                          className={inputClass}
                          required
                        />
                      </div>
                      <div className="sm:col-span-1 flex justify-end">
                        {contributors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeContributor(index)}
                            className="p-2.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl mb-[1px] transition-colors"
                          >
                            <X className="h-4.5 w-4.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                type="button"
                onClick={addContributor}
                className="text-xs font-medium text-green-600 hover:text-green-700 flex items-center gap-1.5 px-2 py-1 hover:bg-green-50 rounded-lg transition-colors"
                disabled={contributors.reduce((sum, c) => sum + Number(c.share), 0) >= 100}
              >
                + Add Contributor
              </button>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center pt-0.5">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:bg-green-500 peer-checked:border-green-500 transition-all duration-200" />
                    <CheckCircle2 className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 left-0.5" />
                  </div>
                  <span className="text-xs text-gray-500 leading-relaxed group-hover:text-gray-700 transition-colors">
                    I have read and agree to the <strong>Split Sheet Agreement</strong> and <strong>Terms of Service</strong>. 
                    I confirm that all revenue shares listed above are accurate and agreed upon by all parties.
                  </span>
                </label>
              </div>
            </div>

            {/* Upload progress / submit */}
            <motion.button
              type="submit"
              disabled={isUploading}
              className="w-full relative bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white py-3.5 px-6 rounded-xl font-semibold shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
              whileHover={{ scale: isUploading ? 1 : 1.01, y: isUploading ? 0 : -1 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-center gap-2.5">
                {isUploading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>Uploading your track...</span>
                  </>
                ) : (
                  <>
                    <UploadIcon className="h-5 w-5" />
                    <span>Upload Track</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </>
                )}
              </div>
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  );
}
