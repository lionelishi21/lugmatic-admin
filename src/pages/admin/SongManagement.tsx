import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Preloader from '../../components/ui/Preloader';
import { toast } from 'react-hot-toast';
import songService, { Song } from '../../services/songService';
import albumService, { Album } from '../../services/albumService';
import artistService, { Artist } from '../../services/artistService';
import genreService, { Genre } from '../../services/genreService';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Plus, Music2, Search, Trash2, Eye, CheckCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';

const SongManagement: React.FC = () => {
  const navigate = useNavigate();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [songToDelete, setSongToDelete] = useState<string | null>(null);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);

  // Fetch songs, artists, albums, and genres
  useEffect(() => {
    fetchSongs();
    fetchArtists();
    fetchAlbums();
    fetchGenres();
  }, []);

  const fetchArtists = async () => {
    try {
      const data = await artistService.getAllArtists();
      setArtists(data);
    } catch (err: any) {
      console.error('Failed to fetch artists:', err);
    }
  };

  const fetchAlbums = async () => {
    try {
      const data = await albumService.getAllAlbums();
      setAlbums(data);
    } catch (err: any) {
      console.error('Failed to fetch albums:', err);
    }
  };

  const fetchGenres = async () => {
    try {
      const data = await genreService.getAllGenres();
      setGenres(data);
    } catch (err: any) {
      console.error('Failed to fetch genres:', err);
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

  const handleApprove = async (songId: string) => {
    try {
      toast.loading('Approving song...', { id: 'approve-song' });
      await adminService.moderateContent('songs', songId, 'approve');
      toast.success('Song approved successfully', { id: 'approve-song' });
      // Update local state instead of re-fetching everything
      setSongs(prev => prev.map(s => s._id === songId ? { ...s, isApproved: true } : s));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to approve song';
      toast.error(errorMessage, { id: 'approve-song' });
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
          type="button"
          onClick={() => navigate('/admin/song-management/add')}
          className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 flex items-center gap-2 shadow-sm font-medium transition-all"
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
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-white"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Songs Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredSongs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Music2 className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <p className="text-lg font-medium">No songs found.</p>
            <p className="text-sm">{searchTerm ? 'Try adjusting your search filters.' : 'Start by adding your first song!'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cover</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Artist</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Album</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Genre</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Listens</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {filteredSongs.map((song) => (
                  <tr key={song._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 shadow-sm relative group">
                        <img
                          src={song.coverArtUrl || song.coverArt || '/assets/images/lugmaticIcon.png'}
                          alt={song.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/images/lugmaticIcon.png';
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-semibold text-gray-900">{song.name}</div>
                        {!song.isApproved && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                            <span className="text-[10px] font-medium text-amber-600 uppercase tracking-wider">Pending Approval</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {typeof song.artist === 'object' && song.artist !== null
                          ? (song.artist.name || 'Unknown')
                          : (artists.find(a => a._id === song.artist)?.name || (typeof song.artist === 'string' ? song.artist : 'Unknown'))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {song.album
                          ? (typeof song.album === 'object' && song.album !== null
                            ? (song.album.name || 'N/A')
                            : (albums.find(a => a._id === song.album)?.name || (typeof song.album === 'string' ? song.album : 'N/A')))
                          : 'Single'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        {typeof song.genre === 'object' && song.genre !== null
                          ? (song.genre.name || '—')
                          : (genres.find(g => g._id === (typeof song.genre === 'string' ? song.genre : ''))?.name || (typeof song.genre === 'string' ? song.genre : '—'))}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDuration(song.duration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-bold text-emerald-600">
                        {(song.playCount || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {!song.isApproved && (
                          <button
                            type="button"
                            onClick={() => handleApprove(song._id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Approve Song"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/song-management/${song._id}`)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="View & Edit"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSongToDelete(song._id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete"
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

