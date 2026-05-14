import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload as UploadIcon, Music, ImageIcon, X, Loader2, 
  CheckCircle2, FileAudio, Sparkles, Film, Zap, Shield,
  Layers, ChevronRight, Plus, Search, Mail, UserPlus,
  PlayCircle, Activity, Target, ShieldCheck, Smartphone,
  ChevronDown, Calendar, ArrowUpRight, Cpu, Save, Globe, FileText
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
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);

  // Initialize contributor name once user data is available
  useEffect(() => {
    if (user && !userLoaded) {
      const name = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : (user.name || user.email || '');
      setContributors([{ name, role: 'ARTIST', share: 100 }]);
      setUserLoaded(true);
    }
  }, [user, userLoaded]);
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
        const genresArray = Array.isArray(fetchedGenres) ? fetchedGenres : ((fetchedGenres as any)?.data || []);
        setGenres(genresArray.filter((g: any) => g.isActive));
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
          const artistsArray = Array.isArray(artists) ? artists : ((artists as any)?.data || []);
          setArtistsList(artistsArray);
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
      toast.error('Invalid file type: Please select an audio file.');
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
      toast.error('Invalid file type: Please select an image.');
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
      toast.error('Please enter a valid email address.');
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

    if (!user) {
      toast.error('You must be logged in to upload music.');
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
      const rawArtistId = user.artistId;
      artistId = typeof rawArtistId === 'object' && rawArtistId !== null ? (rawArtistId as any)._id : (rawArtistId as string | null);
      if (!artistId) {
        toast.error('Artist profile required to upload.');
        return;
      }
    }

    if (!audioFile || !coverImage) {
      toast.error('Please upload both an audio file and cover art.');
      return;
    }

    if (!form.genre) {
      toast.error('Please select a genre.');
      return;
    }

    if (!termsAccepted) {
      toast.error('You must accept the terms and splits.');
      return;
    }

    const totalShare = contributors.reduce((sum, c) => sum + Number(c.share), 0);
    if (Math.abs(totalShare - 100) > 0.01) {
      toast.error(`Total shares must equal 100%. Current: ${totalShare}%`);
      return;
    }

    setIsUploading(true);
    try {
      toast.loading('Uploading track...', { id: 'upload' });
      
      const audioRes = await songService.getPresignedUrl('song-audio', audioFile.name, audioFile.type);
      await songService.uploadToS3(audioRes.uploadUrl, audioFile, audioFile.type);

      const coverRes = await songService.getPresignedUrl('cover-art', coverImage.name, coverImage.type);
      await songService.uploadToS3(coverRes.uploadUrl, coverImage, coverImage.type);

      let videoFileKey = '';
      if (videoFile) {
        const videoRes = await songService.getPresignedUrl('profile-image', videoFile.name, videoFile.type); 
        await songService.uploadToS3(videoRes.uploadUrl, videoFile, videoFile.type);
        videoFileKey = videoRes.key;
      }

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
      navigate('/artist/songs');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed.', { id: 'upload' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-none">Upload New Track</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
            </div>
          </div>
          <p className="text-zinc-500 font-medium">Add your latest music to the platform and set up revenue splits.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Media Uploads */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Cover Art */}
          <div className="premium-card p-8 border-white/5 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/5">
                    <ImageIcon className="h-5 w-5 text-emerald-500" />
                </div>
                <h3 className="text-sm font-bold text-white">Cover Art</h3>
            </div>
            <div
              className={`relative rounded-3xl border-2 border-dashed transition-all cursor-pointer overflow-hidden aspect-square flex flex-col items-center justify-center
                ${coverPreview ? 'border-emerald-500/30' : 'border-white/5 hover:border-emerald-500/20 bg-zinc-950/30'}`}
              onClick={() => !coverPreview && imageInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOverCover(true); }}
              onDragLeave={() => setDragOverCover(false)}
              onDrop={handleCoverDrop}
            >
              {coverPreview ? (
                <>
                  <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <button type="button" onClick={(e) => { e.stopPropagation(); setCoverImage(null); setCoverPreview(''); }} className="p-4 bg-rose-600 text-white rounded-2xl shadow-xl">
                       <X size={24} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center px-6">
                   <UploadIcon size={32} className="text-zinc-700 mx-auto mb-4" />
                   <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Select Image</p>
                </div>
              )}
              <input ref={imageInputRef} type="file" className="hidden" accept="image/*" onChange={handleCoverChange} />
            </div>
          </div>

          {/* Audio File */}
          <div className="premium-card p-8 border-white/5 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/5">
                    <Music className="h-5 w-5 text-emerald-500" />
                </div>
                <h3 className="text-sm font-bold text-white">Audio File</h3>
            </div>
            <div
              className={`relative rounded-2xl border-2 border-dashed p-8 transition-all cursor-pointer
                ${audioFile ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5 hover:border-emerald-500/20 bg-zinc-950/30'}`}
              onClick={() => !audioFile && audioInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOverAudio(true); }}
              onDragLeave={() => setDragOverAudio(false)}
              onDrop={handleAudioDrop}
            >
              {audioFile ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                     <Music size={20} className="text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{audioFile.name}</p>
                    <p className="text-[10px] text-zinc-500 font-medium mt-1">{(audioFile.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setAudioFile(null); }} className="text-zinc-600 hover:text-white">
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                   <UploadIcon size={24} className="text-zinc-700 mx-auto mb-3" />
                   <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Select Audio</p>
                </div>
              )}
              <input ref={audioInputRef} type="file" className="hidden" accept="audio/*" onChange={handleAudioChange} />
            </div>
          </div>
        </div>

        {/* Right Column: Details & Splits */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Information */}
          <div className="premium-card p-10 border-white/5 shadow-2xl space-y-10">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                 <FileText size={20} className="text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-white">Track Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {isAdmin && (
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Assign to Artist</label>
                  <div className="relative">
                    <select
                      value={selectedArtistId}
                      onChange={e => setSelectedArtistId(e.target.value)}
                      className="w-full h-14 px-6 bg-zinc-950 border border-white/5 rounded-2xl text-white text-sm font-medium focus:outline-none focus:border-emerald-500/30 transition-all appearance-none"
                      required={isAdmin}
                    >
                      <option value="">Select an artist profile</option>
                      {artistsList.map(a => (
                        <option key={a._id} value={a._id}>{a.name || a.fullName || 'Unnamed Artist'}</option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Track Title</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  placeholder="Enter track title"
                  className="w-full h-14 px-6 bg-zinc-950 border border-white/5 rounded-2xl text-white text-sm font-medium focus:outline-none focus:border-emerald-500/30 transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Genre</label>
                <div className="relative">
                  <select
                    name="genre"
                    value={form.genre}
                    onChange={handleFormChange}
                    className="w-full h-14 px-6 bg-zinc-950 border border-white/5 rounded-2xl text-white text-sm font-medium focus:outline-none focus:border-emerald-500/30 transition-all appearance-none"
                    required
                  >
                    <option value="">Select a genre</option>
                    {genres.map(g => (
                      <option key={g._id} value={g._id}>{g.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Release Date</label>
                <input
                  type="date"
                  name="releaseDate"
                  value={form.releaseDate}
                  onChange={handleFormChange}
                  className="w-full h-14 px-6 bg-zinc-950 border border-white/5 rounded-2xl text-white text-sm font-medium focus:outline-none focus:border-emerald-500/30 transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">YouTube URL (Optional)</label>
                <input
                  type="text"
                  name="videoUrl"
                  value={form.videoUrl}
                  onChange={handleFormChange}
                  placeholder="https://youtube.com/..."
                  className="w-full h-14 px-6 bg-zinc-950 border border-white/5 rounded-2xl text-white text-sm font-medium focus:outline-none focus:border-emerald-500/30 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Lyrics</label>
              <textarea
                name="lyrics"
                value={form.lyrics}
                onChange={handleFormChange}
                rows={6}
                placeholder="Paste your lyrics here..."
                className="w-full p-6 bg-zinc-950 border border-white/5 rounded-2xl text-white text-sm font-medium focus:outline-none focus:border-emerald-500/30 transition-all resize-none"
              />
            </div>
          </div>

          {/* Revenue Splits */}
          <div className="premium-card p-10 border-white/5 shadow-2xl space-y-10">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                   <Layers size={20} className="text-purple-500" />
                </div>
                <h2 className="text-xl font-bold text-white">Revenue Splits</h2>
              </div>
              <button
                type="button"
                onClick={addContributor}
                className="h-12 px-6 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl border border-white/10 transition-all flex items-center gap-2"
              >
                <Plus size={16} /> Add Collaborator
              </button>
            </div>

            <div className="space-y-4">
              {contributors.map((c, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 bg-zinc-950/30 rounded-2xl border border-white/5 items-center">
                   <div className="md:col-span-5">
                      <input
                        type="text"
                        value={c.name}
                        onChange={(e) => handleContributorSearch(i, e.target.value)}
                        placeholder="Collaborator Name or Email"
                        className="w-full h-12 px-5 bg-black border border-white/5 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-emerald-500/30"
                      />
                   </div>
                   <div className="md:col-span-3">
                      <select
                        value={c.role}
                        onChange={(e) => updateContributor(i, 'role', e.target.value)}
                        className="w-full h-12 px-4 bg-black border border-white/5 rounded-xl text-xs font-medium text-white focus:outline-none"
                      >
                         <option value="ARTIST">Artist</option>
                         <option value="PRODUCER">Producer</option>
                         <option value="SONGWRITER">Songwriter</option>
                      </select>
                   </div>
                   <div className="md:col-span-3 flex items-center gap-3">
                      <input
                        type="number"
                        value={c.share}
                        onChange={(e) => updateContributor(i, 'share', Number(e.target.value))}
                        className="w-full h-12 px-4 bg-black border border-white/5 rounded-xl text-xs font-bold text-white text-center focus:outline-none"
                      />
                      <span className="text-xs font-bold text-zinc-500">%</span>
                   </div>
                   <div className="md:col-span-1 flex justify-end">
                      {i > 0 && (
                        <button type="button" onClick={() => removeContributor(i)} className="text-rose-500 hover:text-rose-400">
                          <X size={20} />
                        </button>
                      )}
                   </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-white/5">
              <label className="flex items-center gap-4 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={termsAccepted} onChange={() => setTermsAccepted(!termsAccepted)} />
                  <div className={`w-6 h-6 rounded-lg border transition-all flex items-center justify-center ${termsAccepted ? 'bg-emerald-500 border-emerald-500' : 'bg-zinc-950 border-white/10 group-hover:border-emerald-500/30'}`}>
                    {termsAccepted && <CheckCircle2 size={16} className="text-black" />}
                  </div>
                </div>
                <span className="text-sm text-zinc-500 font-medium">I confirm that the revenue splits provided above are accurate and agreed upon by all parties.</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full h-16 bg-white text-black rounded-2xl text-sm font-bold uppercase tracking-widest hover:scale-[1.02] transition-all shadow-2xl flex items-center justify-center gap-4 disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
              Complete Upload
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
