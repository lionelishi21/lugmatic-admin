import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Preloader from '../../components/ui/Preloader';
import { toast } from 'react-hot-toast';
import albumService, { Album, CreateAlbumData } from '../../services/albumService';
import artistService, { Artist } from '../../services/artistService';
import genreService, { Genre } from '../../services/genreService';
import FileUpload from '../../components/ui/FileUpload';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Plus, Edit, Trash2, Disc, Search, Upload } from 'lucide-react';

const AlbumManagement: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [albumToDelete, setAlbumToDelete] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [formData, setFormData] = useState<Partial<CreateAlbumData>>({
    name: '',
    artist: '',
    releaseDate: new Date().toISOString().split('T')[0],
    genre: '',
    coverArt: '',
    songs: [],
  });
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null);

  // Fetch albums, artists, genres on mount
  useEffect(() => {
    fetchAlbums();
    fetchArtists();
    fetchGenres();
  }, []);

  const fetchAlbums = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await albumService.getAllAlbums();
      setAlbums(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch albums';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchArtists = async () => {
    try {
      const data = await artistService.getAllArtists();
      setArtists(data);
    } catch (err) {
      console.error('Failed to fetch artists:', err);
    }
  };

  const fetchGenres = async () => {
    try {
      const data = await genreService.getAllGenres();
      setGenres(data);
    } catch (err) {
      console.error('Failed to fetch genres:', err);
    }
  };

  const handleOpenDialog = (album?: Album) => {
    if (album) {
      setSelectedAlbum(album);
      setFormData({
        name: album.name,
        artist: typeof album.artist === 'string' ? album.artist : album.artist._id,
        releaseDate: album.releaseDate ? new Date(album.releaseDate).toISOString().split('T')[0] : '',
        genre: typeof album.genre === 'string' ? album.genre : album.genre?._id || '',
        coverArt: album.coverArt,
        songs: album.songs || [],
      });
      setCoverArtFile(null);
    } else {
      setSelectedAlbum(null);
      setFormData({
        name: '',
        artist: '',
        releaseDate: new Date().toISOString().split('T')[0],
        genre: '',
        coverArt: '',
        songs: [],
      });
      setCoverArtFile(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedAlbum(null);
    setFormData({
      name: '',
      artist: '',
      releaseDate: new Date().toISOString().split('T')[0],
      genre: '',
      coverArt: '',
      songs: [],
    });
    setCoverArtFile(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCoverArtSelect = (file: File) => {
    setCoverArtFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (selectedAlbum) {
        // Update: if a new cover art file was selected, upload it first
        let coverArtUrl = formData.coverArt || '';
        if (coverArtFile) {
          coverArtUrl = await albumService.uploadCoverArt(coverArtFile);
        }
        await albumService.updateAlbum(selectedAlbum._id, {
          ...formData,
          coverArt: coverArtUrl,
        });
        toast.success('Album updated successfully');
      } else {
        // Create: use the with-image endpoint if we have a file
        if (coverArtFile) {
          const { coverArt, ...rest } = formData as CreateAlbumData;
          await albumService.createAlbumWithImage(rest, coverArtFile);
        } else {
          await albumService.createAlbum(formData as CreateAlbumData);
        }
        toast.success('Album created successfully');
      }
      handleCloseDialog();
      fetchAlbums();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save album';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!albumToDelete) return;
    try {
      await albumService.deleteAlbum(albumToDelete);
      toast.success('Album deleted successfully');
      fetchAlbums();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete album';
      toast.error(errorMessage);
    } finally {
      setAlbumToDelete(null);
    }
  };

  const getArtistDisplayName = (artist: string | { _id: string; name: string; firstName?: string; lastName?: string }) => {
    if (typeof artist === 'string') {
      const found = artists.find((a) => a._id === artist);
      return found ? (found.name || `${found.firstName || ''} ${found.lastName || ''}`.trim()) : artist;
    }
    return artist.name || `${artist.firstName || ''} ${artist.lastName || ''}`.trim() || 'Unknown Artist';
  };

  const filteredAlbums = albums.filter((album) => {
    const albumName = album.name.toLowerCase();
    const artistName = typeof album.artist === 'string' ? '' : (album.artist as any)?.name || '';
    const searchLower = searchTerm.toLowerCase();
    return albumName.includes(searchLower) || artistName.toLowerCase().includes(searchLower);
  });

  if (loading && albums.length === 0) {
    return <Preloader isVisible={true} text="Loading albums..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Album Management</h1>
          <p className="text-gray-600 mt-2">Manage all albums in your system</p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Album
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search albums..."
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

      {/* Albums Grid */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredAlbums.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Disc className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No albums found. {searchTerm ? 'Try adjusting your search.' : 'Create your first album!'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredAlbums.map((album) => (
              <motion.div
                key={album._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  {album.coverArt ? (
                    <img
                      src={album.coverArt}
                      alt={album.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-48 bg-gray-200 flex items-center justify-center ${album.coverArt ? 'hidden' : ''}`}>
                    <Disc className="w-16 h-16 text-gray-400" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{album.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {getArtistDisplayName(album.artist)}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>
                      {album.releaseDate
                        ? new Date(album.releaseDate).toLocaleDateString()
                        : '--'}
                    </span>
                    <span>{album.songs?.length || 0} tracks</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenDialog(album)}
                      className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => setAlbumToDelete(album._id)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
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
            <h2 className="text-2xl font-bold mb-4">
              {selectedAlbum ? 'Edit Album' : 'Add New Album'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Cover Art Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Art</label>
                {(formData.coverArt || coverArtFile) && (
                  <div className="mb-3">
                    <img
                      src={coverArtFile ? URL.createObjectURL(coverArtFile) : formData.coverArt || ''}
                      alt="Cover preview"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
                <FileUpload
                  label="Upload Cover Art"
                  currentFile={coverArtFile ? URL.createObjectURL(coverArtFile) : formData.coverArt || undefined}
                  onFileSelect={handleCoverArtSelect}
                  onFileRemove={() => {
                    setCoverArtFile(null);
                    setFormData((prev) => ({ ...prev, coverArt: '' }));
                  }}
                />
              </div>

              {/* Album Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Album Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter album name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Artist Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Artist *</label>
                <select
                  name="artist"
                  value={formData.artist}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  <option value="">Select an artist</option>
                  {artists.map((artist) => (
                    <option key={artist._id} value={artist._id}>
                      {artist.name || `${artist.firstName || ''} ${artist.lastName || ''}`.trim() || artist._id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Genre Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                  <select
                    name="genre"
                    value={formData.genre}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  >
                    <option value="">Select a genre</option>
                    {genres.map((genre) => (
                      <option key={genre._id} value={genre._id}>
                        {genre.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Release Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Release Date</label>
                  <input
                    type="date"
                    name="releaseDate"
                    value={formData.releaseDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Upload className="w-4 h-4 animate-spin" />
                      {selectedAlbum ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    selectedAlbum ? 'Update' : 'Create'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!albumToDelete}
        title="Delete Album"
        message="Are you sure you want to delete this album? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setAlbumToDelete(null)}
      />
    </div>
  );
};

export default AlbumManagement;
