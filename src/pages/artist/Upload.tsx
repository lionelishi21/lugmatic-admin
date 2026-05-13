import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload as UploadIcon, Music, ImageIcon, X, Loader2, 
  CheckCircle2, FileAudio, Sparkles, Film, Zap, Shield,
  Layers, ChevronRight, Plus, Search, Mail, UserPlus,
  PlayCircle, Activity, Target, ShieldCheck, Smartphone,
  ChevronDown, Calendar, ArrowUpRight, Cpu, Save, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import genreService, { Genre } from '../../services/genreService';
import songService, { CreateSongData } from '../../services/songService';
import artistService, { Artist } from '../../services/artistService';
import { useAuth } from '../../hooks/useAuth';

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
        toast.error('Failed to load genres.');
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
          toast.error('Failed to load artists.');
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
      toast.error('Invalid file: audio required.');
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
      toast.error('Invalid file: image required.');
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
      const response = await userService.searchUsers(query);
      setSearchResults(response.data.data);
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
      toast.error('Provide a valid email address.');
      return;
    }

    try {
      setIsSearching(true);
      const { userService } = await import('../../services/userService');
      await userService.sendContributorInvitation(email);
      toast.success(`Invitation sent to ${email}`);
      setSearchResults([]);
      setActiveSearchIndex(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invitation failed.');
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

    if (!user || (!user.id && !user._id && !user.artistId)) {
      toast.error('Authentication required. Please log in again.');
      return;
    }

    let artistId: string | null = null;
    
    if (isAdmin) {
      artistId = selectedArtistId || null;
      if (!artistId) {
        toast.error('Please select an artist.');
        return;
      }
    } else {
      artistId = (user.artistId as string | null);
      
      if (!artistId) {
        toast.error(
          <div className="bg-zinc-950 p-6 border border-rose-500/20 rounded-2xl shadow-2xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 italic mb-2">Action Required</p>
            <p className="text-sm font-bold text-white mb-4 italic leading-relaxed">Artist profile required for upload.</p>
            <button 
              onClick={() => navigate('/artist/profile')}
              className="w-full h-12 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 italic"
            >
              Complete Profile
            </button>
          </div>,
          { duration: 6000, icon: null }
        );
        return;
      }
    }

    if (audioDuration <= 0) {
      toast.error('Could not verify audio length.');
      return;
    }

    if (!audioFile || !coverImage) {
      toast.error('Missing audio or cover image.');
      return;
    }

    if (!form.genre) {
      toast.error('Genre selection required.');
      return;
    }

    if (!termsAccepted) {
      toast.error('Split agreement required.');
      return;
    }

    const totalShare = contributors.reduce((sum, c) => sum + Number(c.share), 0);
    if (Math.abs(totalShare - 100) > 0.01) {
      toast.error(`Total shares must equal 100%. Current: ${totalShare}%`);
      return;
    }

    setIsUploading(true);
    try {
      toast.loading('Starting upload...', { id: 'upload' });
      
      const audioRes = await songService.getPresignedUrl('song-audio', audioFile.name, audioFile.type);
      toast.loading('Uploading audio...', { id: 'upload' });
      await songService.uploadToS3(audioRes.uploadUrl, audioFile, audioFile.type);

      const coverRes = await songService.getPresignedUrl('cover-art', coverImage.name, coverImage.type);
      toast.loading('Uploading cover image...', { id: 'upload' });
      await songService.uploadToS3(coverRes.uploadUrl, coverImage, coverImage.type);

      let videoFileKey = '';
      if (videoFile) {
        const videoRes = await songService.getPresignedUrl('profile-image', videoFile.name, videoFile.type); 
        toast.loading('Uploading Video...', { id: 'upload' });
        await songService.uploadToS3(videoRes.uploadUrl, videoFile, videoFile.type);
        videoFileKey = videoRes.key;
      }

      toast.loading('Finalizing track...', { id: 'upload' });
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
      toast.success('Track uploaded successfully!', { id: 'upload' });

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
      toast.error(error.message || 'Upload failed.', { id: 'upload' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Cinematic Asset Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-none">Asset Ingestion</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Protocol Initialized</span>
            </div>
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em] ml-1">Submit high-fidelity musical assets to the global neural network.</p>
        </div>
        <div className="flex items-center gap-4 bg-zinc-950 p-6 rounded-2xl border border-white/5 shadow-inner max-w-sm">
           <ShieldCheck className="text-emerald-500 flex-shrink-0" size={24} />
           <div>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest italic mb-1">Network Integrity</p>
              <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">Submissions undergo AI-driven compliance scan for spectral purity and metadata accuracy.</p>
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Spectral Assets */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Visual Identity Bay */}
          <div className="premium-card group hover:border-emerald-500/20 transition-all">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/5 shadow-inner">
                    <ImageIcon className="h-5 w-5 text-emerald-500" />
                </div>
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] italic">Visual Identity (Cover)</h3>
            </div>
            <div
              className={`relative rounded-3xl border-2 border-dashed transition-all duration-700 cursor-pointer overflow-hidden group shadow-inner aspect-square
                ${coverImage
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : dragOverCover
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.1)]'
                    : 'border-white/5 hover:border-emerald-500/30 bg-[#0a0a0a]'
                }`}
              onDragOver={e => { e.preventDefault(); setDragOverCover(true); }}
              onDragLeave={() => setDragOverCover(false)}
              onDrop={handleCoverDrop}
              onClick={() => !coverImage && imageInputRef.current?.click()}
            >
              {coverPreview ? (
                <>
                  <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-[2px]">
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setCoverImage(null);
                        setCoverPreview('');
                        if (imageInputRef.current) imageInputRef.current.value = '';
                      }}
                      className="h-16 w-16 bg-rose-500 text-white rounded-2xl shadow-2xl hover:bg-rose-600 transition-all scale-90 group-hover:scale-100 flex items-center justify-center"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center">
                  <div className="w-24 h-24 bg-zinc-900 rounded-[2rem] flex items-center justify-center mb-8 border border-white/5 group-hover:scale-110 transition-all duration-700 shadow-2xl">
                    <ImageIcon size={32} className="text-zinc-800 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em] italic group-hover:text-white transition-colors">Select Visual Asset</p>
                  <p className="text-[9px] text-zinc-800 mt-4 font-bold uppercase tracking-widest opacity-60 italic">1:1 HIGH-DENSITY JPG/PNG</p>
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

          {/* Spectral Frequency Bay */}
          <div className="premium-card group hover:border-emerald-500/20 transition-all">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/5 shadow-inner">
                    <FileAudio className="h-5 w-5 text-emerald-500" />
                </div>
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] italic">Spectral Frequency (Audio)</h3>
            </div>
            <div
              className={`relative rounded-3xl border-2 border-dashed transition-all duration-700 cursor-pointer p-8 shadow-inner
                ${audioFile
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : dragOverAudio
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.1)]'
                    : 'border-white/5 hover:border-emerald-500/30 bg-[#0a0a0a]'
                }`}
              onDragOver={e => { e.preventDefault(); setDragOverAudio(true); }}
              onDragLeave={() => dragOverAudio && setDragOverAudio(false)}
              onDrop={handleAudioDrop}
              onClick={() => !audioFile && audioInputRef.current?.click()}
            >
              {audioFile ? (
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-zinc-950 border border-emerald-500/20 rounded-[1.25rem] flex items-center justify-center flex-shrink-0 shadow-2xl relative overflow-hidden group/audio">
                    <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
                    <Music size={28} className="text-emerald-500 relative z-10" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white uppercase tracking-tight truncate italic mb-2 leading-none">{audioFile.name}</p>
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 shadow-inner">
                          <Zap size={10} className="text-emerald-500" />
                          <span className="text-[10px] font-bold text-emerald-500 tabular-nums italic">
                            {audioDuration > 0
                              ? `${Math.floor(audioDuration / 60)}:${String(audioDuration % 60).padStart(2, '0')}`
                              : 'SYNCING...'
                            }
                          </span>
                       </div>
                       <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest italic tabular-nums">
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
                    className="w-12 h-12 flex items-center justify-center text-zinc-700 hover:text-rose-500 transition-all hover:bg-rose-500/5 rounded-xl border border-transparent hover:border-rose-500/10"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center py-8">
                  <div className="w-20 h-20 bg-zinc-900 rounded-[2rem] flex items-center justify-center mb-8 border border-white/5 group-hover:rotate-12 transition-all duration-700 shadow-2xl">
                    <Music size={28} className="text-zinc-800 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em] italic group-hover:text-white transition-colors">Ingest Spectral Source</p>
                  <p className="text-[9px] text-zinc-800 mt-4 font-bold uppercase tracking-widest opacity-60 italic">LOSSLESS WAV/FLAC PREFERRED</p>
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

          {/* Video Matrix Bay (Optional) */}
          <div className="premium-card group hover:border-emerald-500/20 transition-all">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/5 shadow-inner">
                    <Film className="h-5 w-5 text-emerald-500" />
                </div>
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] italic">Video Matrix (Optional)</h3>
            </div>
            <div className="space-y-6">
              <div 
                onClick={() => videoInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-700 shadow-inner group/vid ${
                  videoFile ? 'border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'border-white/5 hover:border-emerald-500/30 bg-[#0a0a0a]'
                }`}
              >
                <input 
                  type="file" 
                  ref={videoInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 100 * 1024 * 1024) {
                        toast.error('Video exceeds 100MB limit.');
                        return;
                      }
                      setVideoFile(file);
                    }
                  }}
                  accept="video/*"
                  className="hidden"
                />
                {videoFile ? (
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center shadow-2xl border border-emerald-500/20">
                       <CheckCircle2 size={32} className="text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-bold text-white truncate max-w-[250px] uppercase italic tracking-[0.2em]">{videoFile.name}</span>
                    <button 
                       type="button"
                      onClick={(e) => { e.stopPropagation(); setVideoFile(null); if(videoInputRef.current) videoInputRef.current.value=''; }}
                      className="text-[9px] text-rose-500 font-bold uppercase tracking-widest hover:text-rose-400 mt-2 italic flex items-center gap-2 bg-rose-500/5 px-4 py-2 rounded-lg border border-rose-500/10 transition-all"
                    >
                      <X size={12} /> PURGE SOURCE
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5 shadow-2xl group-hover/vid:scale-110 transition-all">
                       <UploadIcon size={24} className="text-zinc-800 group-hover/vid:text-emerald-500 transition-colors" />
                    </div>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em] italic group-hover/vid:text-white transition-colors">Ingest Motion Stream</p>
                  </div>
                )}
              </div>
              
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                   <Globe size={18} className="text-zinc-800 transition-colors group-focus-within:text-emerald-500" />
                </div>
                <input
                  type="text"
                  name="videoUrl"
                  value={form.videoUrl}
                  onChange={handleFormChange}
                  placeholder="EXTERNAL STREAM URL (YOUTUBE/VIMEO)..."
                  className="w-full pl-14 pr-6 h-14 bg-[#0a0a0a] border border-white/5 rounded-2xl text-white text-[10px] font-bold uppercase tracking-[0.2em] focus:outline-none focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-inner placeholder:text-zinc-800 italic"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Metadata & Financials */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Metadata Console */}
          <div className="premium-card !p-12 relative overflow-hidden group border-white/5 shadow-2xl">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/[0.02] blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="flex items-center gap-6 mb-12 border-b border-white/5 pb-10">
              <div className="w-16 h-16 bg-zinc-950 rounded-[1.5rem] flex items-center justify-center border border-white/5 shadow-inner relative overflow-hidden group-hover:border-emerald-500/30 transition-all">
                 <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <Cpu size={28} className="text-emerald-500 relative z-10" />
              </div>
              <div>
                 <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-500 mb-2 italic">Neural Metadata Console</p>
                 <h2 className="text-2xl font-bold text-white uppercase tracking-tighter italic">Semantic Parameters</h2>
              </div>
            </div>

            <div className="space-y-12">
              {isAdmin && (
                <div className="bg-rose-500/[0.02] border border-rose-500/10 p-10 rounded-3xl relative overflow-hidden shadow-inner">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/[0.03] blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="text-rose-500" size={18} />
                    <label className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.3em] italic">Proxy Asset Assignment (Admin)</label>
                  </div>
                  <div className="relative group">
                    <select
                      value={selectedArtistId}
                      onChange={(e) => setSelectedArtistId(e.target.value)}
                      className="w-full px-6 h-16 bg-[#0a0a0a] border border-rose-500/20 rounded-2xl text-white text-[11px] font-bold tracking-[0.2em] uppercase focus:outline-none focus:border-rose-500 transition-all shadow-inner appearance-none italic"
                      required
                      disabled={loadingArtists}
                    >
                      <option value="">{loadingArtists ? 'SYNCING ARTIST REGISTRY...' : 'SELECT TARGET PROFILE'}</option>
                      {artistsList.map(artist => (
                        <option key={artist._id} value={artist._id}>
                          {(artist.name || artist.fullName || artist.email).toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500 pointer-events-none transition-transform group-focus-within:rotate-180 duration-500" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] italic">Track Identifier <span className="text-emerald-500">*</span></label>
                  </div>
                  <div className="relative group">
                     <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleFormChange}
                        className="w-full px-6 h-16 bg-[#0a0a0a] border border-white/5 rounded-2xl text-white text-[11px] font-bold tracking-[0.2em] uppercase focus:outline-none focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-inner placeholder:text-zinc-800 italic"
                        placeholder="ENTER ASSET NAME..."
                        required
                      />
                      <Target size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-800 transition-all group-focus-within:text-emerald-500" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] italic">Transmission Date <span className="text-emerald-500">*</span></label>
                  <div className="relative group">
                    <input
                        type="date"
                        name="releaseDate"
                        value={form.releaseDate}
                        onChange={handleFormChange}
                        className="w-full px-6 h-16 bg-[#0a0a0a] border border-white/5 rounded-2xl text-white text-[11px] font-bold tracking-[0.2em] uppercase focus:outline-none focus:border-emerald-500/30 transition-all shadow-inner italic"
                        required
                      />
                      <Calendar size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-800 transition-all group-focus-within:text-emerald-500" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] italic">Sonic Sector (Genre) <span className="text-emerald-500">*</span></label>
                <div className="relative group">
                    <select
                        name="genre"
                        value={form.genre}
                        onChange={handleFormChange}
                        className="w-full px-6 h-16 bg-[#0a0a0a] border border-white/5 rounded-2xl text-white text-[11px] font-bold tracking-[0.2em] uppercase focus:outline-none focus:border-emerald-500/30 appearance-none shadow-inner transition-all italic"
                        required
                        disabled={loadingGenres}
                    >
                        <option value="">{loadingGenres ? 'SCANNING SECTORS...' : 'SELECT SECTOR'}</option>
                        {genres.map(genre => (
                        <option key={genre._id} value={genre._id}>{genre.name.toUpperCase()}</option>
                        ))}
                    </select>
                    <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-800 pointer-events-none group-focus-within:text-emerald-500 transition-all group-focus-within:rotate-180 duration-500" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] italic">Neural Lyrics <span className="text-zinc-800 italic">(OPTIONAL)</span></label>
                  <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest italic">Inter-textual mapping</span>
                </div>
                <textarea
                  name="lyrics"
                  value={form.lyrics}
                  onChange={handleFormChange}
                  rows={10}
                  className="w-full px-8 py-8 bg-[#0a0a0a] border border-white/5 rounded-3xl text-zinc-300 text-[11px] font-bold tracking-[0.1em] focus:outline-none focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-inner resize-none leading-relaxed placeholder:text-zinc-800"
                  placeholder="Paste lyrical sequence for semantic analysis..."
                />
              </div>
            </div>
          </div>

          {/* Fiscal Intelligence Console */}
          <div className="premium-card !p-12 relative overflow-hidden group border-white/5 shadow-2xl">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/[0.02] blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-10 mb-12 border-b border-white/5 pb-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-zinc-950 rounded-[1.5rem] flex items-center justify-center border border-white/5 shadow-inner relative overflow-hidden group-hover:border-purple-500/30 transition-all">
                    <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Layers size={28} className="text-purple-500 relative z-10" />
                </div>
                <div>
                   <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-purple-500 mb-2 italic">Fiscal Split Protocol</p>
                   <h2 className="text-2xl font-bold text-white uppercase tracking-tighter italic">Yield Distribution</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={addContributor}
                className="h-16 px-10 bg-white text-black text-[10px] font-bold uppercase tracking-[0.3em] rounded-2xl hover:scale-105 transition-all shadow-2xl italic flex items-center gap-4 group/add border border-white/10"
              >
                <Plus size={18} className="group-hover/add:rotate-90 transition-transform duration-500" />
                Add Node
              </button>
            </div>
            
            <div className="space-y-6">
              {contributors.map((contributor, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="grid grid-cols-1 xl:grid-cols-12 gap-8 p-10 bg-[#0a0a0a] rounded-[2.5rem] border border-white/5 relative group/row hover:border-emerald-500/20 transition-all shadow-inner"
                >
                  <div className="xl:col-span-6 relative space-y-3">
                    <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em] mb-1 block italic">Node Identification / Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                         <Search size={16} className="text-zinc-800" />
                      </div>
                      <input
                        type="text"
                        value={contributor.name}
                        onChange={(e) => handleContributorSearch(index, e.target.value)}
                        placeholder="SCAN NETWORK FOR USERS..."
                        className={`w-full pl-14 pr-12 h-14 bg-zinc-950 border rounded-2xl text-[10px] font-bold tracking-[0.2em] uppercase focus:outline-none transition-all shadow-inner italic ${contributor.userId ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/5' : 'border-white/5 text-white'}`}
                        required
                      />
                      {contributor.userId && <CheckCircle2 size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500 animate-in zoom-in" />}
                    </div>

                    <AnimatePresence>
                      {activeSearchIndex === index && (searchResults.length > 0 || (!isSearching && contributor.name.length >= 2)) && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.98, y: 15 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98, y: 15 }}
                          className="absolute z-50 w-full mt-6 shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden border border-emerald-500/20 bg-zinc-900 rounded-3xl"
                        >
                          <div className="px-8 py-5 border-b border-white/5 bg-zinc-950/80 flex items-center justify-between">
                             <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] italic leading-none">Neural Search Results</p>
                             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          </div>
                          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            {searchResults.map((result) => (
                              <button
                                key={result._id}
                                type="button"
                                onClick={() => selectContributor(index, result)}
                                className="w-full flex items-center gap-6 px-8 py-6 hover:bg-emerald-500/10 transition-all text-left border-b border-white/[0.02] last:border-0 group/item"
                              >
                                <div className="w-12 h-12 bg-zinc-950 rounded-xl border border-white/5 flex items-center justify-center flex-shrink-0 group-hover/item:border-emerald-500/30 shadow-inner">
                                   <UserPlus size={20} className="text-zinc-700 group-hover/item:text-emerald-500 transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                   <p className="text-xs font-bold text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors">{result.firstName} {result.lastName}</p>
                                   <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1.5">{result.email.toUpperCase()}</p>
                                </div>
                                <ArrowUpRight size={18} className="text-zinc-800 group-hover/item:text-emerald-500 transition-all group-hover/item:translate-x-1" />
                              </button>
                            ))}
                            {!isSearching && searchResults.length === 0 && contributor.name.includes('@') && (
                               <button
                                type="button"
                                onClick={() => inviteContributor(index)}
                                className="w-full flex items-center gap-6 px-8 py-8 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all text-left group/invite"
                              >
                                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl shadow-emerald-500/20 group-hover/invite:scale-110 transition-transform">
                                   <Mail size={24} className="text-black" />
                                </div>
                                <div className="flex-1">
                                   <p className="text-xs font-bold text-white uppercase tracking-widest group-hover/invite:text-emerald-400 transition-colors italic">EXTERNAL NODE DETECTED</p>
                                   <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2">INITIALIZE NETWORK INVITATION PROTOCOL</p>
                                </div>
                                <ChevronRight size={20} className="text-emerald-500 animate-pulse" />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="xl:col-span-3 space-y-3">
                    <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em] mb-1 block italic">Operational Role</label>
                    <div className="relative group">
                      <select
                        value={contributor.role}
                        onChange={(e) => updateContributor(index, 'role', e.target.value)}
                        className="w-full px-6 h-14 bg-zinc-950 border border-white/5 rounded-2xl text-[10px] font-bold tracking-[0.2em] uppercase focus:outline-none focus:border-purple-500/30 shadow-inner appearance-none transition-all italic"
                      >
                        <option value="ARTIST">ARTIST</option>
                        <option value="PRODUCER">PRODUCER</option>
                        <option value="SONGWRITER">SONGWRITER</option>
                        <option value="COMPOSER">COMPOSER</option>
                        <option value="MANAGER">MANAGER</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-800 pointer-events-none group-focus-within:rotate-180 duration-500" />
                    </div>
                  </div>

                  <div className="xl:col-span-2 space-y-3">
                    <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em] mb-1 block italic">Net Share %</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={contributor.share}
                        onChange={(e) => updateContributor(index, 'share', Number(e.target.value))}
                        className="w-full px-6 h-14 bg-zinc-950 border border-white/5 rounded-2xl text-white text-[11px] font-bold tracking-[0.2em] focus:outline-none focus:border-emerald-500/30 shadow-inner italic tabular-nums"
                        min="0"
                        max="100"
                        required
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-800">%</span>
                    </div>
                  </div>

                  <div className="xl:col-span-1 flex items-end justify-center pb-2">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeContributor(index)}
                        className="w-12 h-12 flex items-center justify-center bg-zinc-950 text-zinc-800 hover:text-rose-500 rounded-xl border border-white/5 hover:border-rose-500/20 transition-all shadow-inner"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 p-10 bg-zinc-950 border border-white/5 rounded-3xl relative overflow-hidden group/terms">
               <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover/terms:opacity-100 transition-opacity" />
               <label className="flex items-center gap-6 cursor-pointer relative z-10">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-8 h-8 rounded-xl bg-zinc-900 border-2 border-white/10 text-emerald-500 focus:ring-0 focus:ring-offset-0 transition-all checked:bg-emerald-500 checked:border-emerald-500"
                  required
                />
                <div className="flex-1">
                   <p className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-1 italic">Protocol Acknowledgement</p>
                   <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">I confirm the spectral accuracy of the assets and the legitimacy of the fiscal yield distribution mapping.</p>
                </div>
              </label>
            </div>
          </div>

          {/* Action Trigger Bay */}
          <div className="flex items-center gap-6">
             <button
                type="submit"
                disabled={isUploading}
                className="flex-1 h-20 bg-emerald-500 text-black rounded-3xl text-sm font-bold uppercase tracking-[0.4em] hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-6 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    Executing Ingestion Sequence...
                  </>
                ) : (
                  <>
                    <Save size={24} className="group-hover:translate-y-1 transition-transform" />
                    Deploy Asset to Network
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/artist/songs')}
                className="h-20 px-10 bg-zinc-950 text-white rounded-3xl text-[10px] font-bold uppercase tracking-[0.3em] border border-white/5 hover:bg-white/5 transition-all italic"
              >
                Abort Protocol
              </button>
          </div>
        </div>
      </form>
    </div>
  );
}
