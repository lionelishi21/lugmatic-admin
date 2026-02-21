import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Preloader from '../../components/ui/Preloader';
import { toast } from 'react-hot-toast';
import playlistService, { Playlist, CreatePlaylistData } from '../../services/playlistService';
import songService, { Song } from '../../services/songService';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Plus, Edit, Trash2, Search, ListMusic } from 'lucide-react';

const PlaylistManagement: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [playlistToDelete, setPlaylistToDelete] = useState<string | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [formData, setFormData] = useState<Partial<CreatePlaylistData>>({
    name: '',
    description: '',
    songs: [],
    isRecommended: true,
  });
  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);

  // Fetch playlists and songs
  useEffect(() => {
    fetchPlaylists();
    fetchSongs();
  }, []);

  const fetchPlaylists = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await playlistService.getAllPlaylists();
      setPlaylists(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch playlists';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchSongs = async () => {
    try {
      const data = await songService.getAllSongs();
      setSongs(data);
    } catch (err: any) {
      console.error('Failed to fetch songs:', err);
    }
  };

  const handleOpenDialog = (playlist?: Playlist) => {
    if (playlist) {
      setSelectedPlaylist(playlist);
      setFormData({
        name: playlist.name,
        description: playlist.description || '',
        songs: playlist.songs || [],
        isRecommended: true,
      });
      setSelectedSongs(playlist.songs || []);
    } else {
      setSelectedPlaylist(null);
      setFormData({
        name: '',
        description: '',
        songs: [],
        isRecommended: true,
      });
      setSelectedSongs([]);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPlaylist(null);
    setFormData({
      name: '',
      description: '',
      songs: [],
      isRecommended: true,
    });
    setSelectedSongs([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSongToggle = (songId: string) => {
    setSelectedSongs((prev) => {
      const newSelection = prev.includes(songId)
        ? prev.filter((id) => id !== songId)
        : [...prev, songId];
      setFormData((prevData) => ({
        ...prevData,
        songs: newSelection,
      }));
      return newSelection;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedPlaylist) {
        // Update playlist
        await playlistService.updatePlaylist(selectedPlaylist._id, {
          ...formData,
          songs: selectedSongs,
        });
        toast.success('Playlist updated successfully');
      } else {
        // Create recommended playlist
        await playlistService.createRecommendedPlaylist({
          ...formData,
          songs: selectedSongs,
        } as CreatePlaylistData);
        toast.success('Predefined playlist created successfully');
      }
      handleCloseDialog();
      fetchPlaylists();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save playlist';
      toast.error(errorMessage);
    }
  };

  const confirmDelete = async () => {
    if (!playlistToDelete) return;
    try {
      await playlistService.deletePlaylist(playlistToDelete);
      toast.success('Playlist deleted successfully');
      fetchPlaylists();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete playlist';
      toast.error(errorMessage);
    } finally {
      setPlaylistToDelete(null);
    }
  };

  const filteredPlaylists = playlists.filter((playlist) =>
    playlist.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && playlists.length === 0) {
    return <Preloader isVisible={true} text="Loading playlists..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Predefined Playlist Management</h1>
          <p className="text-gray-600 mt-2">Create and manage curated playlists for users</p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Playlist
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search playlists..."
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

      {/* Playlists Grid */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredPlaylists.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <ListMusic className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No predefined playlists found. {searchTerm ? 'Try adjusting your search.' : 'Create your first playlist!'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredPlaylists.map((playlist) => (
              <motion.div
                key={playlist._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <ListMusic className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{playlist.name}</h3>
                      {playlist.description && (
                        <p className="text-sm text-gray-600 mt-1">{playlist.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{playlist.songs?.length || 0} songs</span>
                    {playlist.isRecommended && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Predefined
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenDialog(playlist)}
                      className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => setPlaylistToDelete(playlist._id)}
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
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold mb-4">
              {selectedPlaylist ? 'Edit Playlist' : 'Create Predefined Playlist'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Playlist Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Songs</label>
                <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {songs.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No songs available</p>
                  ) : (
                    <div className="space-y-2">
                      {songs.map((song) => (
                        <label
                          key={song._id}
                          className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSongs.includes(song._id)}
                            onChange={() => handleSongToggle(song._id)}
                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{song.name}</p>
                            <p className="text-xs text-gray-500">{typeof song.artist === 'string' ? song.artist : song.artist?.name || 'Unknown'}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {selectedSongs.length} song{selectedSongs.length !== 1 ? 's' : ''} selected
                </p>
              </div>
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
                  {selectedPlaylist ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!playlistToDelete}
        title="Delete Playlist"
        message="Are you sure you want to delete this playlist? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPlaylistToDelete(null)}
      />
    </div>
  );
};

export default PlaylistManagement;

