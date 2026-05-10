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
  PlayCircle,
  Activity,
  Target,
  ShieldCheck,
  Smartphone,
  ChevronDown,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import genreService, { Genre } from '../../services/genreService';
import songService, { CreateSongData } from '../../services/songService';
import artistService, { Artist } from '../../services/artistService';
import { useAuth } from '../../hooks/useAuth';

// ── Shared primitives ─────────────────────────────────────────────
const card = 'bg-zinc-900 border border-white/[0.06] rounded-lg shadow-2xl relative overflow-hidden group';
const labelClass = 'block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 italic';
const inputClass = 'w-full px-5 py-4 bg-zinc-950 border border-white/[0.08] rounded-xl text-white text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-inner placeholder:text-zinc-700 italic tracking-widest';

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
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      
      {/* ── Branded Header ── */}
      <div className={`${card} p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden group`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.02] rounded-bl-full pointer-events-none" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-14 h-14 bg-zinc-950 border border-white/[0.06] rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden group-hover:border-emerald-500/50 transition-colors">
            <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <UploadIcon className="w-7 h-7 text-emerald-500 relative z-10" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2 italic">Music Upload</p>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase italic">Upload Track</h1>
            <p className="text-sm text-zinc-500 mt-1 font-medium italic">Share your music with the world.</p>
          </div>
        </div>

        <div className="flex items-start gap-5 p-6 bg-zinc-950 border border-white/[0.04] rounded-2xl max-w-md relative z-10 group-hover:border-emerald-500/20 transition-all shadow-inner">
          <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner border border-white/[0.02]">
             <ShieldCheck className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic mb-1.5">Track Review</p>
            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest leading-relaxed italic">
              Submissions undergo review. Ensure high-quality assets for faster approval.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Asset Matrix */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Visual Array Zone */}
          <div className={`${card} p-8 overflow-hidden group/card`}>
            <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center border border-white/[0.04]">
                    <ImageIcon className="h-4 w-4 text-emerald-500" />
                </div>
                <h3 className="text-[10px] font-black text-white uppercase tracking-widest italic">Cover Art</h3>
            </div>
            <div
              className={`relative rounded-2xl border-2 border-dashed transition-all duration-500 cursor-pointer overflow-hidden group shadow-inner
                ${coverImage
                  ? 'border-emerald-500 bg-emerald-500/5'
                  : dragOverCover
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
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
                      className="h-14 w-14 bg-rose-500 text-white rounded-2xl shadow-2xl hover:bg-rose-600 transition-all scale-90 group-hover:scale-100 flex items-center justify-center"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-20 h-20 bg-zinc-950 rounded-3xl flex items-center justify-center mb-6 border border-white/[0.04] group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                    <ImageIcon className="h-9 w-9 text-zinc-800 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <p className="text-[10px] font-black text-zinc-500 dark:text-zinc-500 uppercase tracking-[0.2em] italic group-hover:text-white transition-colors">Upload Cover Image</p>
                  <p className="text-[9px] text-zinc-700 mt-3 font-black uppercase tracking-widest opacity-60">1:1 JPG/PNG · 5MB LIMIT</p>
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
          <div className={`${card} p-8 overflow-hidden group/card`}>
            <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center border border-white/[0.04]">
                    <FileAudio className="h-4 w-4 text-emerald-500" />
                </div>
                <h3 className="text-[10px] font-black text-white uppercase tracking-widest italic">Audio File</h3>
            </div>
            <div
              className={`relative rounded-2xl border-2 border-dashed transition-all duration-500 cursor-pointer p-6 shadow-inner
                ${audioFile
                  ? 'border-emerald-500 bg-emerald-500/5'
                  : dragOverAudio
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                    : 'border-zinc-200 dark:border-white/[0.06] hover:border-emerald-500/50 bg-zinc-50 dark:bg-zinc-950/50'
                }`}
              onDragOver={e => { e.preventDefault(); setDragOverAudio(true); }}
              onDragLeave={() => dragOverAudio && setDragOverAudio(false)}
              onDrop={handleAudioDrop}
              onClick={() => !audioFile && audioInputRef.current?.click()}
            >
              {audioFile ? (
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-zinc-950 border border-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-2xl">
                    <Music className="h-7 w-7 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-white uppercase tracking-widest truncate italic mb-1.5">{audioFile.name}</p>
                    <div className="flex items-center gap-3">
                       <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-lg uppercase tracking-widest border border-emerald-500/20 italic">
                          {audioDuration > 0
                            ? `${Math.floor(audioDuration / 60)}:${String(audioDuration % 60).padStart(2, '0')}`
                            : 'LOADING...'
                          }
                       </span>
                       <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest italic">
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
                    className="w-10 h-10 flex items-center justify-center text-zinc-700 hover:text-rose-500 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center py-6">
                  <div className="w-16 h-16 bg-zinc-950 rounded-3xl flex items-center justify-center mb-6 border border-white/[0.04] group-hover:rotate-12 transition-transform duration-500 shadow-2xl">
                    <Music className="h-8 w-8 text-zinc-800 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <p className="text-[10px] font-black text-zinc-500 dark:text-zinc-500 uppercase tracking-[0.2em] italic group-hover:text-white transition-colors">Upload Audio File</p>
                  <p className="text-[9px] text-zinc-700 mt-3 font-black uppercase tracking-widest opacity-60">MP3/WAV/FLAC · 50MB LIMIT</p>
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
          <div className={`${card} p-8 overflow-hidden group/card`}>
            <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center border border-white/[0.04]">
                    <Film className="h-4 w-4 text-emerald-500" />
                </div>
                <h3 className="text-[10px] font-black text-white uppercase tracking-widest italic">Video File</h3>
            </div>
            <div className="space-y-6">
              <div 
                onClick={() => videoInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-500 shadow-inner ${
                  videoFile ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-zinc-200 dark:border-white/[0.06] hover:border-emerald-500/50 bg-zinc-50 dark:bg-zinc-950/50'
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
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center shadow-2xl">
                       <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-black text-white truncate max-w-[200px] uppercase italic tracking-widest">{videoFile.name}</span>
                    <button 
                       type="button"
                      onClick={(e) => { e.stopPropagation(); setVideoFile(null); if(videoInputRef.current) videoInputRef.current.value=''; }}
                      className="text-[9px] text-rose-500 font-black uppercase tracking-widest hover:text-rose-400 mt-2 italic flex items-center gap-2"
                    >
                      <X size={12} /> Delete Source
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 bg-zinc-950 rounded-2xl flex items-center justify-center border border-white/[0.04] shadow-2xl">
                       <UploadIcon className="w-6 h-6 text-zinc-800 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic group-hover:text-white transition-colors">Upload MP4/MOV Source</span>
                  </div>
                )}
              </div>
              
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                   <PlayCircle className="h-5 w-5 text-zinc-800 transition-colors group-focus-within:text-emerald-500" />
                </div>
                <input
                  type="text"
                  name="videoUrl"
                  value={form.videoUrl}
                  onChange={handleFormChange}
                  placeholder="EXTERNAL VIDEO URL (YOUTUBE/VIMEO)..."
                  className={inputClass + ' pl-14'}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Metadata Console */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Track Parameters */}
          <div className={`${card} p-10 relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.02] rounded-bl-full pointer-events-none" />
            <div className="flex items-center gap-5 mb-10 border-b border-white/[0.04] pb-8">
              <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center border border-white/[0.04] shadow-inner relative overflow-hidden">
                 <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <Sparkles className="h-6 w-6 text-emerald-500 relative z-10" />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-1.5 italic">Track Details</p>
                 <h2 className="text-xl font-black text-white uppercase tracking-widest italic">Metadata</h2>
              </div>
            </div>

            <div className="space-y-10">
              {isAdmin && (
                <div className="bg-rose-500/[0.02] border border-rose-500/10 p-8 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/[0.03] rounded-bl-full pointer-events-none" />
                  <label className={labelClass + ' text-rose-500'}>Target Artist Profile <span className="text-rose-500">*</span></label>
                  <div className="relative group">
                    <select
                      value={selectedArtistId}
                      onChange={(e) => setSelectedArtistId(e.target.value)}
                      className={inputClass + ' appearance-none border-rose-500/20 focus:border-rose-500'}
                      required
                      disabled={loadingArtists}
                    >
                      <option value="">{loadingArtists ? 'LOADING ARTISTS...' : 'SELECT ARTIST'}</option>
                      {artistsList.map(artist => (
                        <option key={artist._id} value={artist._id}>
                          {(artist.name || artist.fullName || artist.email).toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500 pointer-events-none" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className={labelClass}>Track Title <span className="text-emerald-500">*</span></label>
                  <div className="relative group">
                     <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleFormChange}
                        className={inputClass}
                        placeholder="ENTER TRACK TITLE..."
                        required
                      />
                      <Target className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-800 transition-colors group-focus-within:text-emerald-500" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className={labelClass}>Release Date <span className="text-emerald-500">*</span></label>
                  <div className="relative group">
                    <input
                        type="date"
                        name="releaseDate"
                        value={form.releaseDate}
                        onChange={handleFormChange}
                        className={inputClass}
                        required
                      />
                      <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-800 transition-colors group-focus-within:text-emerald-500" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className={labelClass}>Primary Sector (Genre) <span className="text-emerald-500">*</span></label>
                <div className="relative group">
                    <select
                        name="genre"
                        value={form.genre}
                        onChange={handleFormChange}
                        className={inputClass + ' appearance-none'}
                        required
                        disabled={loadingGenres}
                    >
                        <option value="">{loadingGenres ? 'LOADING GENRES...' : 'SELECT GENRE'}</option>
                        {genres.map(genre => (
                        <option key={genre._id} value={genre._id}>{genre.name.toUpperCase()}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-800 pointer-events-none group-focus-within:text-emerald-500 transition-colors" />
                </div>
              </div>

              <div className="space-y-3">
                <label className={labelClass}>Lyrics <span className="text-zinc-700 italic">(OPTIONAL)</span></label>
                <textarea
                  name="lyrics"
                  value={form.lyrics}
                  onChange={handleFormChange}
                  rows={10}
                  className={inputClass + ' resize-none normal-case tracking-normal font-medium h-72 py-6'}
                  placeholder="Paste lyrical sequence here..."
                />
              </div>
            </div>
          </div>

          {/* Revenue Split Console */}
          <div className={`${card} p-10 relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/[0.02] rounded-bl-full pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-10 border-b border-white/[0.04] pb-8">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center border border-white/[0.04] shadow-inner relative overflow-hidden">
                    <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Layers className="h-6 w-6 text-purple-500 relative z-10" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500 mb-1.5 italic">Financials</p>
                   <h2 className="text-xl font-black text-white uppercase tracking-widest italic">Revenue Split</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={addContributor}
                className="h-14 px-8 bg-white text-zinc-950 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:scale-105 transition-all shadow-2xl italic flex items-center gap-3"
              >
                <Plus className="h-4 w-4" />
                Add Contributor
              </button>
            </div>
            
            <div className="space-y-4">
              {contributors.map((contributor, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-6 p-8 bg-zinc-950/40 rounded-3xl border border-white/[0.02] relative group/row hover:border-emerald-500/20 transition-all shadow-inner"
                >
                  <div className="md:col-span-6 relative space-y-2">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 block italic">Contributor Name / Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                         <Search className="h-4 w-4 text-zinc-800" />
                      </div>
                      <input
                        type="text"
                        value={contributor.name}
                        onChange={(e) => handleContributorSearch(index, e.target.value)}
                        placeholder="SEARCH USERS..."
                        className={inputClass + ` pl-14 ${contributor.userId ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400' : ''}`}
                        required
                      />
                      {contributor.userId && <CheckCircle2 className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500 animate-in zoom-in" />}
                    </div>

                    {/* Network Search HUD Dropdown */}
                    <AnimatePresence>
                      {activeSearchIndex === index && (searchResults.length > 0 || (!isSearching && contributor.name.length >= 2)) && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.98, y: 15 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98, y: 15 }}
                          className={`${card} absolute z-50 w-full mt-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden border-emerald-500/20 bg-zinc-900/95 backdrop-blur-xl`}
                        >
                          <div className="px-6 py-4 border-b border-white/[0.04] bg-zinc-950/50">
                             <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic">Search Results</p>
                          </div>
                          <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                            {searchResults.map((result) => (
                              <button
                                key={result._id}
                                type="button"
                                onClick={() => selectContributor(index, result)}
                                className="w-full px-6 py-5 text-left hover:bg-emerald-500/10 flex items-center gap-5 transition-all border-b border-white/[0.02] group/item"
                              >
                                <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-white/[0.04] flex items-center justify-center text-emerald-500 text-[10px] font-black uppercase italic shadow-2xl group-hover/item:border-emerald-500/50 transition-all">
                                  {result.firstName[0]}{result.lastName[0]}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[11px] font-black text-white uppercase tracking-widest italic truncate">{result.firstName} {result.lastName}</span>
                                  <span className="text-[9px] text-zinc-600 font-black tracking-[0.2em] mt-1 uppercase italic truncate">{result.email}</span>
                                </div>
                                <ChevronRight className="h-5 w-5 text-zinc-800 ml-auto group-hover/item:text-emerald-500 transition-colors" />
                              </button>
                            ))}
                          </div>
                          {searchResults.length === 0 && !isSearching && (
                            <div className="p-10 text-center">
                               <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/[0.04] shadow-2xl">
                                  <Mail className="h-7 w-7 text-zinc-800" />
                               </div>
                               <p className="text-[10px] text-zinc-500 font-black mb-8 uppercase tracking-[0.2em] italic">Identity Unknown In Network</p>
                               <button
                                 type="button"
                                 onClick={() => inviteContributor(index)}
                                 className="w-full h-14 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 italic"
                               >
                                 <UserPlus className="h-5 w-5" />
                                 Broadcast Invite
                               </button>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 block italic">Sector Role</label>
                    <div className="relative group">
                        <select
                        value={contributor.role}
                        onChange={(e) => updateContributor(index, 'role', e.target.value)}
                        className={inputClass + ' appearance-none'}
                        >
                        {['ARTIST', 'PRODUCER', 'SONGWRITER', 'VOCALIST', 'COMPOSER'].map(r => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-800 pointer-events-none group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 block italic">Allocation</label>
                    <div className="relative group">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={contributor.share}
                        onChange={(e) => updateContributor(index, 'share', Number(e.target.value))}
                        className={inputClass + ' pr-12'}
                        required
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[11px] font-black text-zinc-800 group-focus-within:text-emerald-500 transition-colors">%</span>
                    </div>
                  </div>
                  
                  <div className="md:col-span-1 flex items-end justify-center pb-2.5">
                    {contributors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeContributor(index)}
                        className="h-14 w-14 flex items-center justify-center text-zinc-800 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 pt-10 border-t border-white/[0.04] space-y-10">
              <label className="flex items-start gap-6 cursor-pointer group bg-zinc-950/40 p-8 rounded-3xl border border-white/[0.02] transition-all hover:border-emerald-500/20 shadow-inner">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-6 h-6 rounded-lg border-white/[0.08] bg-zinc-950 text-emerald-500 focus:ring-emerald-500/20 transition-all cursor-pointer shadow-inner"
                    required
                  />
                </div>
                <span className="text-[10px] font-black text-zinc-600 group-hover:text-zinc-400 transition-colors leading-relaxed uppercase tracking-[0.2em] italic">
                  I AGREE TO THE SPLIT SHEET. I CONFIRM I HAVE THE LEGAL AUTHORITY TO UPLOAD THIS CONTENT AND ATTEST TO THE ACCURACY OF ALL CONTRIBUTOR ALLOCATIONS.
                </span>
              </label>

              <motion.button
                type="submit"
                disabled={isUploading}
                className="w-full h-16 relative bg-white text-zinc-950 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_60px_rgba(16,185,129,0.2)] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group/submit italic"
                whileHover={{ scale: isUploading ? 1 : 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-emerald-500 opacity-0 group-hover/submit:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center justify-center gap-4 z-10 group-hover/submit:text-white transition-colors duration-500">
                  {isUploading ? (
                    <>
                      <Loader2 className="animate-spin h-6 w-6" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <UploadIcon className="h-6 w-6" />
                      <span>Upload Track</span>
                      <ChevronRight className="h-5 w-5 group-hover/submit:translate-x-2 transition-transform duration-500" />
                    </>
                  )}
                </div>
              </motion.button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
