import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Music2, Search, BarChart2, Edit2, Trash2, AlertCircle, ExternalLink, Plus, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { RootState } from '../../store';
import artistService from '../../services/artistService';
import songService, { Song } from '../../services/songService';
import { Skeleton } from '../../components/ui/skeleton';
import { toast } from 'react-hot-toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function MySongs() {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [songToDelete, setSongToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (user?.artistId) {
      fetchSongs();
    }
  }, [user?.artistId]);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      const data = await artistService.getArtistSongs(String(user?.artistId));
      setSongs(data);
    } catch (err) {
      console.error('Failed to fetch songs:', err);
      toast.error('Failed to load your tracks.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!songToDelete) return;
    try {
      await songService.deleteSong(songToDelete);
      toast.success('Song deleted successfully');
      setSongs(songs.filter(s => s._id !== songToDelete));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete song');
    } finally {
      setSongToDelete(null);
    }
  };

  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || song.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
      approved: 'bg-green-100 text-green-700',
      pending: 'bg-amber-100 text-amber-700',
      rejected: 'bg-red-100 text-red-700',
    };
    
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Library</h1>
          <p className="text-gray-500">Manage your tracks and view performance analytics</p>
        </div>
        <button
          onClick={() => navigate('/artist/upload')}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Upload New Track
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search tracks..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select 
            className="border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Tracks List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-100">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="p-4 flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-1/6" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredSongs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-semibold text-gray-600 text-sm">Track</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Upload Type</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Plays</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSongs.map(track => (
                  <tr key={track._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={track.coverArtUrl || track.coverArt || '/default-track-cover.jpg'}
                          alt={track.name}
                          className="w-12 h-12 rounded-lg object-cover shadow-sm"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">{track.name}</h3>
                          <p className="text-xs text-gray-500">Uploaded {format(new Date(track.createdAt || Date.now()), 'MMM d, yyyy')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={track.status} />
                    </td>
                    <td className="p-4">
                      {/* @ts-ignore */}
                      {track.uploadSource === 'admin' ? (
                        <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-md">Admin Upload</span>
                      ) : (
                        <span className="text-xs text-gray-600 font-medium bg-gray-50 px-2 py-1 rounded-md">Self Upload</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-emerald-600 font-bold">
                        <BarChart2 size={14} />
                        {track.playCount?.toLocaleString() || 0}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/artist/songs/${track._id}/analytics`)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="View Analytics"
                        >
                          <BarChart2 size={18} />
                        </button>
                        <button
                          onClick={() => navigate(`/artist/song-edit/${track._id}`)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit Track"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => setSongToDelete(track._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Track"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Music2 className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No tracks found</h3>
            <p className="text-gray-500">Start by uploading your first track to Lugmatic.</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!songToDelete}
        title="Delete Track"
        message="Are you sure you want to delete this track? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setSongToDelete(null)}
      />
    </div>
  );
}
