import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Preloader from '../../components/ui/Preloader';
import { toast } from 'react-hot-toast';
import songService, { Song, CreateSongData } from '../../services/songService';
import albumService, { Album } from '../../services/albumService';
import artistService, { Artist } from '../../services/artistService';
import genreService, { Genre } from '../../services/genreService';
import FileUpload from '../../components/ui/FileUpload';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Plus, Edit, Trash2, Music2, Search, User, Disc, Tag, Clock, Calendar, FileText } from 'lucide-react';

const SongManagement: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [songToDelete, setSongToDelete] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [formData, setFormData] = useState<Partial<CreateSongData>>({
    name: '',
    artist: '',
    album: '',
    duration: 0,
    genre: '',
    releaseDate: new Date().toISOString().split('T')[0],
    lyrics: '',
    coverArt: '',
    audioFile: '',
  });
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [artistsLoading, setArtistsLoading] = useState<boolean>(false);
  const [albumsLoading, setAlbumsLoading] = useState<boolean>(false);
  const [genresLoading, setGenresLoading] = useState<boolean>(false);

  // Fetch songs, artists, albums, and genres
  useEffect(() => {
    fetchSongs();
    fetchArtists();
    fetchAlbums();
    fetchGenres();
  }, []);

  const fetchArtists = async () => {
    setArtistsLoading(true);
    try {
      const data = await artistService.getAllArtists();
      setArtists(data);
    } catch (err: any) {
      console.error('Failed to fetch artists:', err);
      toast.error('Failed to load artists');
    } finally {
      setArtistsLoading(false);
    }
  };

  const fetchAlbums = async () => {
    setAlbumsLoading(true);
    try {
      const data = await albumService.getAllAlbums();
      setAlbums(data);
    } catch (err: any) {
      console.error('Failed to fetch albums:', err);
      toast.error('Failed to load albums');
    } finally {
      setAlbumsLoading(false);
    }
  };

  const fetchGenres = async () => {
    setGenresLoading(true);
    try {
      const data = await genreService.getAllGenres();
      setGenres(data);
    } catch (err: any) {
      console.error('Failed to fetch genres:', err);
      toast.error('Failed to load genres');
    } finally {
      setGenresLoading(false);
    }
  };

  const fetchSongs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await songService.getAllSongs();
      setSongs(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch songs';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (song?: Song) => {
    if (song) {
      setSelectedSong(song);
      // Handle artist - could be ID or name string
      const artistId = typeof song.artist === 'object' ? song.artist._id :
        artists.find(a => a._id === song.artist || a.name === song.artist)?._id || song.artist;

      // Handle album - could be ID or name string
      const albumId = typeof song.album === 'object' ? song.album._id :
        albums.find(a => a._id === song.album || a.name === song.album)?._id || song.album || '';

      // Handle genre - could be ID or name string
      const genreId = genres.find(g => g._id === song.genre || g.name === song.genre)?._id || song.genre || '';

      setFormData({
        name: song.name,
        artist: artistId,
        album: albumId,
        duration: song.duration,
        genre: genreId,
        releaseDate: song.releaseDate ? new Date(song.releaseDate).toISOString().split('T')[0] : '',
        lyrics: song.lyrics,
        coverArt: song.coverArt,
        audioFile: song.audioFile,
      });
      setCoverArtFile(null);
    } else {
      setSelectedSong(null);
      setFormData({
        name: '',
        artist: '',
        album: '',
        duration: 0,
        genre: '',
        releaseDate: new Date().toISOString().split('T')[0],
        lyrics: '',
        coverArt: '',
        audioFile: '',
      });
      setCoverArtFile(null);
      setAudioFile(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedSong(null);
    setFormData({
      name: '',
      artist: '',
      album: '',
      duration: 0,
      genre: '',
      releaseDate: new Date().toISOString().split('T')[0],
      lyrics: '',
      coverArt: '',
      audioFile: '',
    });
    setCoverArtFile(null);
    setAudioFile(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'duration' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleCoverArtSelect = async (file: File) => {
    setCoverArtFile(file);
    try {
      const base64 = await songService.uploadCoverArt(file);
      setFormData((prev) => ({ ...prev, coverArt: base64 }));
    } catch (err) {
      toast.error('Failed to process cover art image');
    }
  };

  const handleAudioFileSelect = (file: File) => {
    setAudioFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate audio file for new songs
    if (!selectedSong && !audioFile) {
      toast.error('Please upload an audio file');
      return;
    }

    try {
      // Clean up form data - convert empty album string to undefined
      const cleanedFormData = {
        ...formData,
        album: formData.album && formData.album.trim() !== '' ? formData.album : undefined,
      };

      if (selectedSong) {
        // Update song (if backend supports it)
        await songService.updateSong(selectedSong._id, cleanedFormData as Partial<CreateSongData>);
        toast.success('Song updated successfully');
      } else {
        // Create song with file uploads
        await songService.createSong(
          cleanedFormData as CreateSongData,
          audioFile || undefined,
          coverArtFile || undefined
        );
        toast.success('Song created successfully');
      }
      handleCloseDialog();
      fetchSongs();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save song';
      toast.error(errorMessage);
    }
  };

  const confirmDelete = async () => {
    if (!songToDelete) return;
    try {
      await songService.deleteSong(songToDelete);
      toast.success('Song deleted successfully');
      fetchSongs();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete song';
      toast.error(errorMessage);
    } finally {
      setSongToDelete(null);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredSongs = songs.filter((song) => {
    const nameMatch = song.name.toLowerCase().includes(searchTerm.toLowerCase());
    const artistMatch = typeof song.artist === 'string'
      ? song.artist.toLowerCase().includes(searchTerm.toLowerCase())
      : (song.artist?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const albumMatch = song.album
      ? (typeof song.album === 'string'
        ? song.album.toLowerCase().includes(searchTerm.toLowerCase())
        : (song.album?.name || '').toLowerCase().includes(searchTerm.toLowerCase()))
      : false;
    return nameMatch || artistMatch || albumMatch;
  });

  if (loading && songs.length === 0) {
    return <Preloader isVisible={true} text="Loading songs..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Song Management</h1>
          <p className="text-gray-600 mt-2">Manage all songs in your system</p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Song
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search songs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Songs Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredSongs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Music2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No songs found. {searchTerm ? 'Try adjusting your search.' : 'Create your first song!'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cover
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Artist
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Album
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Genre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSongs.map((song) => (
                  <tr key={song._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {song.coverArt ? (
                        <img
                          src={song.coverArt}
                          alt={song.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <Music2 className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{song.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {typeof song.artist === 'string' ? song.artist : song.artist?.name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {song.album
                          ? (typeof song.album === 'string' ? song.album : song.album.name || 'N/A')
                          : 'No Album'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{song.genre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDuration(song.duration)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenDialog(song)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setSongToDelete(song._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedSong ? 'Edit Song' : 'Add New Song'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {selectedSong ? 'Update song information and files' : 'Fill in the details to create a new song'}
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <FileUpload
                label="Cover Art"
                currentFile={formData.coverArt || undefined}
                onFileSelect={handleCoverArtSelect}
                onFileRemove={() => {
                  setCoverArtFile(null);
                  setFormData((prev) => ({ ...prev, coverArt: '' }));
                }}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Music2 className="w-4 h-4" />
                  Song Title
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter song title"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Artist
                </label>
                <select
                  name="artist"
                  value={formData.artist}
                  onChange={handleInputChange}
                  required
                  disabled={artistsLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select an artist...</option>
                  {artists.map((artist) => {
                    const displayName = artist.name || artist.fullName ||
                      [artist.firstName, artist.lastName].filter(Boolean).join(' ') ||
                      'Unknown Artist';
                    return (
                      <option key={artist._id} value={artist._id}>
                        {displayName}
                      </option>
                    );
                  })}
                </select>
                {artistsLoading && (
                  <p className="text-xs text-gray-500 mt-1">Loading artists...</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Disc className="w-4 h-4" />
                  Album
                </label>
                <select
                  name="album"
                  value={formData.album}
                  onChange={handleInputChange}
                  disabled={albumsLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">No Album</option>
                  {albums.map((album) => {
                    let artistName = '';
                    if (typeof album.artist === 'object' && album.artist.name) {
                      artistName = album.artist.name;
                    } else if (typeof album.artist === 'string') {
                      const artist = artists.find(a => a._id === album.artist);
                      artistName = artist ? (artist.name || artist.fullName || 'Unknown') : '';
                    }
                    return (
                      <option key={album._id} value={album._id}>
                        {album.name}{artistName ? ` (${artistName})` : ''}
                      </option>
                    );
                  })}
                </select>
                {albumsLoading && (
                  <p className="text-xs text-gray-500 mt-1">Loading albums...</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Genre
                  </label>
                  <select
                    name="genre"
                    value={formData.genre}
                    onChange={handleInputChange}
                    required
                    disabled={genresLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select a genre...</option>
                    {genres.map((genre) => (
                      <option key={genre._id} value={genre._id}>
                        {genre.name}
                      </option>
                    ))}
                  </select>
                  {genresLoading && (
                    <p className="text-xs text-gray-500 mt-1">Loading genres...</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="1"
                    placeholder="0"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Release Date
                </label>
                <input
                  type="date"
                  name="releaseDate"
                  value={formData.releaseDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Lyrics
                </label>
                <textarea
                  name="lyrics"
                  value={formData.lyrics}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Enter song lyrics (optional)"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
                />
              </div>
              <FileUpload
                label="Audio File"
                fileType="audio"
                maxSize={50}
                onFileSelect={handleAudioFileSelect}
                onFileRemove={() => {
                  setAudioFile(null);
                  setFormData((prev) => ({ ...prev, audioFile: '' }));
                }}
                currentFile={selectedSong?.audioFile || undefined}
              />
              {!selectedSong && !audioFile && (
                <p className="text-sm text-red-600">Audio file is required</p>
              )}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {selectedSong ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!songToDelete}
        title="Delete Song"
        message="Are you sure you want to delete this song? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setSongToDelete(null)}
      />
    </div>
  );
};

export default SongManagement; 
