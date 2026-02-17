import React, { useState, useRef, useEffect } from 'react';
import { Upload as UploadIcon, Music, Image, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import genreService, { Genre } from '../../services/genreService';

interface UploadForm {
  title: string;
  description: string;
  genre: string;
}

export default function Upload() {
  const [form, setForm] = useState<UploadForm>({
    title: '',
    description: '',
    genre: '',
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Fetch genres on component mount
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
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
    } else {
      toast.error('Please select a valid audio file');
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Please select a valid image file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile || !coverImage) {
      toast.error('Please select both audio and cover image files');
      return;
    }

    setIsUploading(true);
    try {
      // Simulate successful upload
      toast.success('Track uploaded successfully! Waiting for approval.');
      // Reset form
      setForm({ title: '', description: '', genre: '' });
      setAudioFile(null);
      setCoverImage(null);
      setCoverPreview('');
      if (audioInputRef.current) audioInputRef.current.value = '';
      if (imageInputRef.current) imageInputRef.current.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload track. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Upload Your Track</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Track Details */}
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Track Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={form.title}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleFormChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label htmlFor="genre" className="block text-sm font-medium text-gray-700">
                Genre
              </label>
              <select
                id="genre"
                name="genre"
                value={form.genre}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                required
                disabled={loadingGenres}
              >
                <option value="">
                  {loadingGenres ? 'Loading genres...' : 'Select a genre'}
                </option>
                {genres.map((genre) => (
                  <option key={genre._id} value={genre._id}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="space-y-4">
            {/* Audio Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audio File
              </label>
              <div className="flex items-center justify-center w-full">
                <label
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer
                      ${audioFile ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-500'}`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {audioFile ? (
                      <div className="flex items-center space-x-2">
                        <Music className="h-8 w-8 text-purple-500" />
                        <span className="text-sm text-gray-700">{audioFile.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setAudioFile(null);
                            if (audioInputRef.current) audioInputRef.current.value = '';
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <UploadIcon className="h-8 w-8 text-gray-500 mb-2" />
                        <p className="text-sm text-gray-500">Click to upload audio file</p>
                        <p className="text-xs text-gray-500">(MP3, WAV up to 50MB)</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={audioInputRef}
                    type="file"
                    className="hidden"
                    accept="audio/*"
                    onChange={handleAudioChange}
                    required
                  />
                </label>
              </div>
            </div>

            {/* Cover Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image
              </label>
              <div className="flex items-center justify-center w-full">
                <label
                  className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer
                      ${coverImage ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-500'}`}
                >
                  {coverPreview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCoverImage(null);
                          setCoverPreview('');
                          if (imageInputRef.current) imageInputRef.current.value = '';
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Image className="h-8 w-8 text-gray-500 mb-2" />
                      <p className="text-sm text-gray-500">Click to upload cover image</p>
                      <p className="text-xs text-gray-500">(JPG, PNG up to 5MB)</p>
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
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isUploading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadIcon className="h-5 w-5 mr-2" />
                  Upload Track
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}