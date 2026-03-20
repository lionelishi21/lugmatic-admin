import React, { useState, useRef, useEffect } from 'react';
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

export default function Upload() {
  const { user } = useAuth();
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

    // Fetch artists list for admin users
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

    let artistId: string | null;
    if (isAdmin) {
      artistId = selectedArtistId || null;
      if (!artistId) {
        toast.error('Please select an artist to upload the song for.');
        return;
      }
    } else {
      artistId = (user.artistId as string | null) || (user.role === 'artist' ? user.id : null);
      if (!artistId) {
        toast.error('Artist profile not found. Please log out and log in again.');
        return;
      }
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
      // Step 1: Get presigned URLs & Step 2: Upload to S3
      toast.loading('Fetching upload permissions...', { id: 'upload' });
      
      const audioRes = await songService.getPresignedUrl('song-audio', audioFile.name, audioFile.type);
      toast.loading('Uploading audio to S3...', { id: 'upload' });
      await songService.uploadToS3(audioRes.uploadUrl, audioFile, audioFile.type);

      const coverRes = await songService.getPresignedUrl('cover-art', coverImage.name, coverImage.type);
      toast.loading('Uploading cover art to S3...', { id: 'upload' });
      await songService.uploadToS3(coverRes.uploadUrl, coverImage, coverImage.type);

      let videoFileKey = '';
      if (videoFile) {
        const videoRes = await songService.getPresignedUrl('profile-image' as any, videoFile.name, videoFile.type); // Using profile-image as proxy or assuming backend handles any
        toast.loading('Uploading video to S3...', { id: 'upload' });
        await songService.uploadToS3(videoRes.uploadUrl, videoFile, videoFile.type);
        videoFileKey = videoRes.key;
      }

      // Step 3: Create song with S3 keys
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

  const inputClass =
    'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all duration-200 text-sm';

  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/20">
            <UploadIcon className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Upload Your Track</h1>
        </div>
        <p className="text-gray-500 text-sm ml-14">Share your music with the world</p>
        
        {/* Admin Approval Notice */}
        <div className="mt-4 ml-14 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <div className="p-1 bg-amber-100 rounded-lg">
            <Sparkles className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-900">Track Approval Required</p>
            <p className="text-xs text-amber-700 mt-0.5">
              All uploaded tracks must be reviewed and approved by an administrator before they become public. 
              Once uploaded, you will not be able to edit the track details.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column — cover + audio */}
          <div className="lg:col-span-1 space-y-5">

            {/* Cover Image */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-green-500" />
                Cover Art
              </p>
              <div
                className={`relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden
                  ${coverImage
                    ? 'border-green-400 bg-green-50/30'
                    : dragOverCover
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-200 hover:border-green-300 bg-gray-50/50'
                  }`}
                style={{ aspectRatio: '1 / 1' }}
                onDragOver={e => { e.preventDefault(); setDragOverCover(true); }}
                onDragLeave={() => setDragOverCover(false)}
                onDrop={handleCoverDrop}
                onClick={() => !coverImage && imageInputRef.current?.click()}
              >
                {coverPreview ? (
                  <>
                    <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setCoverImage(null);
                          setCoverPreview('');
                          if (imageInputRef.current) imageInputRef.current.value = '';
                        }}
                        className="opacity-0 hover:opacity-100 p-2 bg-red-500 text-white rounded-full shadow-lg transition-all duration-200 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    {/* visible remove button overlay */}
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setCoverImage(null);
                        setCoverPreview('');
                        if (imageInputRef.current) imageInputRef.current.value = '';
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all duration-200"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-3">
                      <ImageIcon className="h-7 w-7 text-green-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">Drop image here</p>
                    <p className="text-xs text-gray-400 mt-1">or click to browse</p>
                    <p className="text-[11px] text-gray-400 mt-2">JPG, PNG up to 5MB</p>
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FileAudio className="h-4 w-4 text-green-500" />
                Audio File
              </p>
              <div
                className={`relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer p-5
                  ${audioFile
                    ? 'border-green-400 bg-green-50/40'
                    : dragOverAudio
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-200 hover:border-green-300 bg-gray-50/50'
                  }`}
                onDragOver={e => { e.preventDefault(); setDragOverAudio(true); }}
                onDragLeave={() => setDragOverAudio(false)}
                onDrop={handleAudioDrop}
                onClick={() => !audioFile && audioInputRef.current?.click()}
              >
                {audioFile ? (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Music className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{audioFile.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {audioDuration > 0
                          ? `${Math.floor(audioDuration / 60)}:${String(audioDuration % 60).padStart(2, '0')}`
                          : 'Loading duration...'
                        } · {(audioFile.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">Ready to upload</span>
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
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-3">
                      <UploadIcon className="h-6 w-6 text-green-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">Drop audio here</p>
                    <p className="text-xs text-gray-400 mt-1">or click to browse</p>
                    <p className="text-[11px] text-gray-400 mt-2">MP3, WAV up to 50MB</p>
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
          </div>

            {/* Music Video Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2">
                <Film className="h-4 w-4 text-green-500" />
                Music Video (Optional)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                  onClick={() => videoInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    videoFile ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-green-200'
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
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                      <span className="text-xs font-medium text-gray-700 truncate max-w-[150px]">{videoFile.name}</span>
                      <button 
                         type="button"
                        onClick={(e) => { e.stopPropagation(); setVideoFile(null); if(videoInputRef.current) videoInputRef.current.value=''; }}
                        className="text-[10px] text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <UploadIcon className="w-6 h-6 text-gray-400" />
                      <span className="text-xs text-gray-500">Upload video file</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Or Video URL</label>
                  <input
                    type="text"
                    name="videoUrl"
                    value={form.videoUrl}
                    onChange={handleFormChange}
                    placeholder="https://..."
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Right column — track details */}
            <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-green-500" />
                Track Details
              </h2>

              <div className="space-y-4">
                {/* Artist selector for admins */}
                {isAdmin && (
                  <div>
                    <label htmlFor="artistSelect" className={labelClass}>Artist <span className="text-red-400">*</span></label>
                    <select
                      id="artistSelect"
                      value={selectedArtistId}
                      onChange={(e) => setSelectedArtistId(e.target.value)}
                      className={inputClass}
                      required
                      disabled={loadingArtists}
                    >
                      <option value="">
                        {loadingArtists ? 'Loading artists...' : 'Select an artist'}
                      </option>
                      {artistsList.map(artist => (
                        <option key={artist._id} value={artist._id}>
                          {artist.name || artist.fullName || [artist.firstName, artist.lastName].filter(Boolean).join(' ') || artist.email}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label htmlFor="title" className={labelClass}>Track Title <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={handleFormChange}
                    className={inputClass}
                    placeholder="Enter your track title"
                    required
                  />
                </div>

                {/* Genre + Release Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="genre" className={labelClass}>Genre <span className="text-red-400">*</span></label>
                    <select
                      id="genre"
                      name="genre"
                      value={form.genre}
                      onChange={handleFormChange}
                      className={inputClass}
                      required
                      disabled={loadingGenres}
                    >
                      <option value="">
                        {loadingGenres ? 'Loading genres...' : 'Select a genre'}
                      </option>
                      {genres.map(genre => (
                        <option key={genre._id} value={genre._id}>{genre.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="releaseDate" className={labelClass}>Release Date <span className="text-red-400">*</span></label>
                    <input
                      type="date"
                      id="releaseDate"
                      name="releaseDate"
                      value={form.releaseDate}
                      onChange={handleFormChange}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                {/* Lyrics */}
                <div>
                  <label htmlFor="lyrics" className={labelClass}>Lyrics <span className="text-gray-400 font-normal">(optional)</span></label>
                  <textarea
                    id="lyrics"
                    name="lyrics"
                    value={form.lyrics}
                    onChange={handleFormChange}
                    rows={8}
                    className={inputClass + ' resize-none'}
                    placeholder="Paste or type your lyrics here..."
                  />
                </div>
              </div>
            </div>

            {/* Split Sheet Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2">
                <Music className="h-4 w-4 text-green-500" />
                Split Sheet (Revenue Share)
              </h2>
              
              <div className="space-y-3 mb-4">
                {contributors.map((contributor, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex gap-2 items-end">
                      <div className="flex-1 relative">
                        <label className="text-[10px] text-gray-400 font-medium mb-1 block">Contributor Name</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={contributor.name}
                            onChange={(e) => handleContributorSearch(index, e.target.value)}
                            placeholder="Search by name or email..."
                            className={`${inputClass} ${contributor.userId ? 'border-green-200 bg-green-50/30' : ''}`}
                            required
                          />
                          {contributor.userId && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                               <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                            </div>
                          )}
                        </div>

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
                        {isSearching && activeSearchIndex === index && (
                          <div className="absolute right-10 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-3.5 w-3.5 text-green-500 animate-spin" />
                          </div>
                        )}
                      </div>
                      <div className="w-32">
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
                      <div className="w-20">
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
                      {contributors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeContributor(index)}
                          className="p-3 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl mb-[2px]"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
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
