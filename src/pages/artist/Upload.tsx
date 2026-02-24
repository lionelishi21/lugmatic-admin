import React, { useState, useRef, useEffect } from 'react';
import { Upload as UploadIcon, Music, ImageIcon, X, Loader2, CheckCircle2, FileAudio, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import genreService, { Genre } from '../../services/genreService';
import songService, { CreateSongData } from '../../services/songService';
import artistService, { Artist } from '../../services/artistService';
import { useAuth } from '../../hooks/useAuth';

interface UploadForm {
  title: string;
  description: string;
  genre: string;
  releaseDate: string;
  lyrics: string;
}

export default function Upload() {
  const { user } = useAuth();
  const [form, setForm] = useState<UploadForm>({
    title: '',
    description: '',
    genre: '',
    releaseDate: new Date().toISOString().split('T')[0],
    lyrics: ''
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [artistsList, setArtistsList] = useState<Artist[]>([]);
  const [selectedArtistId, setSelectedArtistId] = useState<string>('');
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [dragOverAudio, setDragOverAudio] = useState(false);
  const [dragOverCover, setDragOverCover] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

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
      artistId = user.artistId || (user.role === 'artist' ? user.id : null);
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

    setIsUploading(true);
    try {
      const songData: CreateSongData = {
        name: form.title,
        artist: String(artistId),
        duration: audioDuration || 180,
        genre: form.genre,
        releaseDate: form.releaseDate,
        lyrics: form.lyrics,
        coverArt: '',
        audioFile: '',
        album: ''
      };

      await songService.createSong(songData, audioFile, coverImage);
      toast.success('Track uploaded successfully!');

      setForm({
        title: '',
        description: '',
        genre: '',
        releaseDate: new Date().toISOString().split('T')[0],
        lyrics: ''
      });
      setAudioFile(null);
      setAudioDuration(0);
      setCoverImage(null);
      setCoverPreview('');
      if (audioInputRef.current) audioInputRef.current.value = '';
      if (imageInputRef.current) imageInputRef.current.value = '';
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
