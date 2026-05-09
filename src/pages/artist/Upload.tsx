import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, Music, ImageIcon, X, Loader2, CheckCircle2, FileAudio, Sparkles, Film } from 'lucide-react';
import { motion } from 'framer-motion';
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

const card = 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg';
const inputClass = 'w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/[0.06] rounded text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-xs font-bold uppercase tracking-widest';
const labelClass = 'block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5';

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
    { name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : (user?.name || user?.email || ''), role: 'Artist', share: 100 }
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
        toast.error('Failed to load genres. Please refresh the page.');
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
          toast.error('Failed to load artists list.');
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
      toast.error('Please select a valid audio file');
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
      toast.error('Please select a valid image file');
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
    setContributors([...contributors, { name: '', role: 'Songwriter', share: 0 }]);
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
      role: newContributors[index].role || 'Songwriter',
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
      toast.error('Please enter a valid email to invite.');
      return;
    }

    try {
      setIsSearching(true);
      const { userService } = await import('../../services/userService');
      await (userService as any).sendContributorInvitation(email);
      toast.success(`Invitation sent to ${email}`);
      setSearchResults([]);
      setActiveSearchIndex(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send invitation.');
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
      toast.error('You must be logged in to upload songs');
      return;
    }

    let artistId: string | null = null;
    
    if (isAdmin) {
      artistId = selectedArtistId || null;
      if (!artistId) {
        toast.error('Please select an artist to upload the song for.');
        return;
      }
    } else {
      artistId = (user.artistId as string | null);
      
      if (!artistId) {
        toast.error(
          <div className="flex flex-col gap-1 text-zinc-900 dark:text-white">
            <span className="font-bold uppercase tracking-tight">Profile Setup Required</span>
            <span className="text-xs opacity-70">You need to set up your artist profile before uploading music.</span>
            <button 
              onClick={() => navigate('/artist/profile')}
              className="mt-2 text-[10px] bg-emerald-500 text-white px-3 py-1.5 rounded font-bold uppercase tracking-widest self-start shadow-lg shadow-emerald-500/20"
            >
              Setup Profile Now
            </button>
          </div>,
          { duration: 5000 }
        );
        return;
      }
    }

    if (audioDuration <= 0) {
      toast.error('Could not determine audio duration. Please try re-selecting the audio file.');
      return;
    }

    if (!audioFile || !coverImage) {
      toast.error('Please select both audio and cover image files');
      return;
    }

    if (!form.genre) {
      toast.error('Please select a genre');
      return;
    }

    if (!termsAccepted) {
      toast.error('You must agree to the Split Sheet Terms & Conditions');
      return;
    }

    const totalShare = contributors.reduce((sum, c) => sum + Number(c.share), 0);
    if (totalShare !== 100) {
      toast.error(`Total shares must equal 100%. Current total: ${totalShare}%`);
      return;
    }

    setIsUploading(true);
    try {
      toast.loading('Fetching upload permissions...', { id: 'upload' });
      
      const audioRes = await songService.getPresignedUrl('song-audio', audioFile.name, audioFile.type);
      toast.loading('Uploading audio to S3...', { id: 'upload' });
      await songService.uploadToS3(audioRes.uploadUrl, audioFile, audioFile.type);

      const coverRes = await songService.getPresignedUrl('cover-art', coverImage.name, coverImage.type);
      toast.loading('Uploading cover art to S3...', { id: 'upload' });
      await songService.uploadToS3(coverRes.uploadUrl, coverImage, coverImage.type);

      let videoFileKey = '';
      if (videoFile) {
        const videoRes = await songService.getPresignedUrl('profile-image' as any, videoFile.name, videoFile.type); 
        toast.loading('Uploading video to S3...', { id: 'upload' });
        await songService.uploadToS3(videoRes.uploadUrl, videoFile, videoFile.type);
        videoFileKey = videoRes.key;
      }

      toast.loading('Finalizing track details...', { id: 'upload' });
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
      toast.error(error.message || 'Failed to upload track. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className={`${card} p-8 flex flex-col md:flex-row md:items-center justify-between gap-6`}>
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
            <UploadIcon className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight uppercase italic">Upload Track</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Share your sonic masterpiece with the Lugmatic community.</p>
          </div>
        </div>
        
        <div className="flex items-start gap-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl max-w-md">
          <Sparkles className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest">Verification Required</p>
            <p className="text-[10px] text-zinc-500 mt-1 font-bold leading-relaxed">
              All tracks undergo admin review before going live. High-quality cover art and accurate metadata speed up the process.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — Assets */}
        <div className="lg:col-span-1 space-y-6">
          {/* Cover Image */}
          <div className={`${card} p-6`}>
            <p className={labelClass + ' flex items-center gap-2 mb-4'}>
              <ImageIcon className="h-3.5 w-3.5 text-emerald-500" />
              Cover Art Art
            </p>
            <div
              className={`relative rounded border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden group
                ${coverImage
                  ? 'border-emerald-500 bg-emerald-500/5'
                  : dragOverCover
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-zinc-200 dark:border-white/10 hover:border-emerald-500/50 bg-zinc-50 dark:bg-zinc-800/20'
                }`}
              style={{ aspectRatio: '1 / 1' }}
              onDragOver={e => { e.preventDefault(); setDragOverCover(true); }}
              onDragLeave={() => setDragOverCover(false)}
              onDrop={handleCoverDrop}
              onClick={() => !coverImage && imageInputRef.current?.click()}
            >
              {coverPreview ? (
                <>
                  <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setCoverImage(null);
                        setCoverPreview('');
                        if (imageInputRef.current) imageInputRef.current.value = '';
                      }}
                      className="p-3 bg-rose-600 text-white rounded-full shadow-2xl hover:bg-rose-700 transition-all scale-90 group-hover:scale-100"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 border border-zinc-200 dark:border-white/5">
                    <ImageIcon className="h-8 w-8 text-zinc-400" />
                  </div>
                  <p className="text-[10px] font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest">Drop Image Here</p>
                  <p className="text-[9px] text-zinc-500 mt-2 font-bold uppercase tracking-tighter">Square 1:1 · JPG/PNG · MAX 5MB</p>
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

          {/* Audio File */}
          <div className={`${card} p-6`}>
            <p className={labelClass + ' flex items-center gap-2 mb-4'}>
              <FileAudio className="h-3.5 w-3.5 text-emerald-500" />
              Master Audio
            </p>
            <div
              className={`relative rounded border-2 border-dashed transition-all duration-300 cursor-pointer p-6
                ${audioFile
                  ? 'border-emerald-500 bg-emerald-500/5'
                  : dragOverAudio
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-zinc-200 dark:border-white/10 hover:border-emerald-500/50 bg-zinc-50 dark:bg-zinc-800/20'
                }`}
              onDragOver={e => { e.preventDefault(); setDragOverAudio(true); }}
              onDragLeave={() => setDragOverAudio(false)}
              onDrop={handleAudioDrop}
              onClick={() => !audioFile && audioInputRef.current?.click()}
            >
              {audioFile ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                    <Music className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">{audioFile.name}</p>
                    <p className="text-[9px] font-bold text-zinc-500 mt-1 tracking-widest">
                      {audioDuration > 0
                        ? `${Math.floor(audioDuration / 60)}:${String(audioDuration % 60).padStart(2, '0')}`
                        : 'CALCULATING...'
                      } · {(audioFile.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
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
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center py-2">
                  <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 border border-zinc-200 dark:border-white/5">
                    <Music className="h-7 w-7 text-zinc-400" />
                  </div>
                  <p className="text-[10px] font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest">Select Audio File</p>
                  <p className="text-[9px] text-zinc-500 mt-2 font-bold uppercase tracking-tighter">MP3/WAV/FLAC · MAX 50MB</p>
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

          {/* Optional Video */}
          <div className={`${card} p-6`}>
            <p className={labelClass + ' flex items-center gap-2 mb-4'}>
              <Film className="h-3.5 w-3.5 text-emerald-500" />
              Music Video (Optional)
            </p>
            <div className="space-y-4">
              <div 
                onClick={() => videoInputRef.current?.click()}
                className={`border-2 border-dashed rounded p-4 text-center cursor-pointer transition-all ${
                  videoFile ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-200 dark:border-white/10 hover:border-emerald-500/50 bg-zinc-50 dark:bg-zinc-800/20'
                }`}
              >
                <input 
                  type="file" 
                  ref={videoInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 100 * 1024 * 1024) {
                        toast.error('Video file is too large (max 100MB)');
                        return;
                      }
                      setVideoFile(file);
                    }
                  }}
                  accept="video/*"
                  className="hidden"
                />
                {videoFile ? (
                  <div className="flex flex-col items-center gap-1">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    <span className="text-[9px] font-bold text-zinc-700 dark:text-zinc-300 truncate max-w-[150px] uppercase">{videoFile.name}</span>
                    <button 
                       type="button"
                      onClick={(e) => { e.stopPropagation(); setVideoFile(null); if(videoInputRef.current) videoInputRef.current.value=''; }}
                      className="text-[9px] text-rose-500 font-bold uppercase tracking-widest hover:underline mt-1"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <UploadIcon className="w-6 h-6 text-zinc-400" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Upload MP4/MOV</span>
                  </div>
                )}
              </div>
              <div className="pt-2">
                <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Or YouTube/Vimeo Link</label>
                <input
                  type="text"
                  name="videoUrl"
                  value={form.videoUrl}
                  onChange={handleFormChange}
                  placeholder="HTTPS://..."
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right column — Metadata */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`${card} p-8`}>
            <div className="flex items-center gap-3 mb-8 border-b border-zinc-100 dark:border-white/[0.04] pb-6">
              <Sparkles className="h-5 w-5 text-emerald-500" />
              <h2 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest italic">Track Metadata</h2>
            </div>

            <div className="space-y-6">
              {isAdmin && (
                <div>
                  <label className={labelClass}>Target Artist Profile <span className="text-rose-500">*</span></label>
                  <select
                    value={selectedArtistId}
                    onChange={(e) => setSelectedArtistId(e.target.value)}
                    className={inputClass}
                    required
                    disabled={loadingArtists}
                  >
                    <option value="">{loadingArtists ? 'FETCHING ARTISTS...' : 'SELECT RECIPIENT ARTIST'}</option>
                    {artistsList.map(artist => (
                      <option key={artist._id} value={artist._id}>
                        {(artist.name || artist.fullName || artist.email).toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className={labelClass}>Track Title <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  className={inputClass}
                  placeholder="E.G. MIDNIGHT VIBES"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Primary Genre <span className="text-rose-500">*</span></label>
                  <select
                    name="genre"
                    value={form.genre}
                    onChange={handleFormChange}
                    className={inputClass}
                    required
                    disabled={loadingGenres}
                  >
                    <option value="">{loadingGenres ? 'FETCHING GENRES...' : 'SELECT GENRE'}</option>
                    {genres.map(genre => (
                      <option key={genre._id} value={genre._id}>{genre.name.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Official Release Date <span className="text-rose-500">*</span></label>
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

              <div>
                <label className={labelClass}>Lyric Sheet <span className="text-zinc-500 font-bold">(OPTIONAL)</span></label>
                <textarea
                  name="lyrics"
                  value={form.lyrics}
                  onChange={handleFormChange}
                  rows={10}
                  className={inputClass + ' resize-none normal-case tracking-normal font-medium'}
                  placeholder="Paste lyrics here..."
                />
              </div>
            </div>
          </div>

          {/* Split Sheet */}
          <div className={`${card} p-8`}>
            <div className="flex items-center justify-between mb-8 border-b border-zinc-100 dark:border-white/[0.04] pb-6">
              <div className="flex items-center gap-3">
                <Music className="h-5 w-5 text-emerald-500" />
                <h2 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest italic">Revenue Split</h2>
              </div>
              <button
                type="button"
                onClick={addContributor}
                className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-black uppercase tracking-widest rounded hover:opacity-90 transition-opacity"
              >
                Add Split
              </button>
            </div>
            
            <div className="space-y-4">
              {contributors.map((contributor, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-5 bg-zinc-50 dark:bg-zinc-800/30 rounded border border-zinc-100 dark:border-white/5 relative group/row">
                  <div className="sm:col-span-6 relative">
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">Full Name / Email</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={contributor.name}
                        onChange={(e) => handleContributorSearch(index, e.target.value)}
                        placeholder="SEARCH..."
                        className={inputClass + ` ${contributor.userId ? 'border-emerald-500/50 bg-emerald-500/5' : ''}`}
                        required
                      />
                      {contributor.userId && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-500" />}
                    </div>

                    {/* Dropdown */}
                    <AnimatePresence>
                      {activeSearchIndex === index && (searchResults.length > 0 || (!isSearching && contributor.name.length >= 2)) && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute z-50 w-full mt-2 bg-white dark:bg-zinc-800 rounded shadow-2xl border border-zinc-100 dark:border-white/10 overflow-hidden"
                        >
                          {searchResults.map((result) => (
                            <button
                              key={result._id}
                              type="button"
                              onClick={() => selectContributor(index, result)}
                              className="w-full px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-white/5 flex items-center gap-3 transition-colors border-b border-zinc-50 dark:border-white/5 last:border-0"
                            >
                              <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center text-white text-xs font-black uppercase italic shadow-lg shadow-emerald-500/20">
                                {result.firstName[0]}{result.lastName[0]}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-tight">{result.firstName} {result.lastName}</span>
                                <span className="text-[9px] text-zinc-500 font-bold tracking-widest">{result.email.toUpperCase()}</span>
                              </div>
                            </button>
                          ))}
                          {searchResults.length === 0 && !isSearching && (
                            <div className="p-4 text-center">
                               <p className="text-[10px] text-zinc-500 font-bold mb-3 uppercase tracking-widest">User not found</p>
                               <button
                                 type="button"
                                 onClick={() => inviteContributor(index)}
                                 className="w-full bg-emerald-500 text-white py-2 rounded text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                               >
                                 Invite via Email
                               </button>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">Role</label>
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
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">Percentage</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={contributor.share}
                        onChange={(e) => updateContributor(index, 'share', e.target.value)}
                        className={inputClass + ' pr-8'}
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-400">%</span>
                    </div>
                  </div>
                  <div className="sm:col-span-1 flex items-end justify-center pb-1">
                    {contributors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeContributor(index)}
                        className="p-2 text-zinc-400 hover:text-rose-500 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-white/[0.04] space-y-6">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                  required
                />
                <span className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors leading-relaxed uppercase tracking-widest">
                  I AGREE TO THE SPLIT SHEET TERMS & CONDITIONS. I CONFIRM THAT I HAVE THE LEGAL RIGHT TO UPLOAD THIS CONTENT AND THAT ALL CONTRIBUTOR INFORMATION IS ACCURATE.
                </span>
              </label>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded text-xs font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-emerald-600/20 flex items-center justify-center gap-3"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    PROCESSING UPLOAD...
                  </>
                ) : (
                  <>
                    <UploadIcon className="h-5 w-5" />
                    SUBMIT TRACK FOR REVIEW
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

                        {/* Search Results Dropdown */}
                        {activeSearchIndex === index && searchResults.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1 max-h-48 overflow-y-auto">
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
