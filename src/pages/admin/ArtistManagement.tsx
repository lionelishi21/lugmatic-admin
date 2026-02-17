import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Preloader from '../../components/ui/Preloader';
import { toast, Toaster } from 'react-hot-toast';
import useFetchArtists, { Artist } from '../../hooks/artist/useFetchArtists';
import { Link, useNavigate } from 'react-router-dom';
import { useArtistContext } from '../../context/ArtistContext';
import { 
  CheckCircle, XCircle, Search, Filter, Plus, Eye, Pencil, Trash2, 
  Users, UserCheck, UserX, Clock, MoreHorizontal, Music2, ChevronDown 
} from 'lucide-react';

// Types
type ModalType = 'add' | 'edit' | 'delete' | null;

// Animation variants
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

const modalVariants = {
  initial: { scale: 0.95, y: 10, opacity: 0 },
  animate: { scale: 1, y: 0, opacity: 1, transition: { duration: 0.2 } },
  exit: { scale: 0.95, y: 10, opacity: 0, transition: { duration: 0.15 } }
};

// Status badge with improved styling
const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  const normalizedStatus = (status || 'pending').toLowerCase();
  const styles: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
    pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
    inactive: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
  };
  const icons: Record<string, React.ReactNode> = {
    active: <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />,
    pending: <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />,
    inactive: <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5" />,
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[normalizedStatus] || 'bg-gray-100 text-gray-700 ring-1 ring-gray-600/20'} capitalize`}>
      {icons[normalizedStatus] || null}
      {status || 'pending'}
    </span>
  );
};

const ModalContainer: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <motion.div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
    {...fadeIn}
  >
    <motion.div
      className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 border border-gray-100"
      variants={modalVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  </motion.div>
);

// Stat card for header
const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}> = ({ label, value, icon, color, bgColor }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
    <div className={`p-2.5 rounded-lg ${bgColor}`}>
      <span className={color}>{icon}</span>
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
    </div>
  </div>
);

// Artist row component
const ArtistRow = React.memo(({
  artist,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject
}: {
  artist: Artist;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}) => {
  const [showActions, setShowActions] = useState(false);

  const displayName =
    artist.name ||
    artist.fullName ||
    [artist.firstName, artist.lastName].filter(Boolean).join(' ') ||
    'Unknown Artist';
  const displayEmail = artist.email || (artist as any).contactEmail || '--';
  const displayGenres =
    Array.isArray(artist.genres) && artist.genres.length > 0
      ? artist.genres
      : Array.isArray((artist as any).favoriteGenres) && (artist as any).favoriteGenres.length > 0
        ? ((artist as any).favoriteGenres as string[])
        : artist.genre ? [artist.genre] : [];
  const displayStatus = artist.status || (artist.isApproved ? 'active' : 'pending');
  const displayDate = artist.createdAt
    ? new Date(artist.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : artist.joinDate || '--';
  const avatarSrc =
    artist.imageUrl ||
    (artist as any).profilePicture ||
    artist.image ||
    '';

  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <tr className="hover:bg-gray-50/80 transition-colors group">
      <td className="px-5 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center ring-2 ring-white shadow-sm">
            {avatarSrc ? (
              <img className="h-10 w-10 rounded-full object-cover" src={avatarSrc} alt={displayName} loading="lazy" />
            ) : (
              <span className="text-sm font-semibold text-white">{initials}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
            <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4 whitespace-nowrap">
        <div className="flex flex-wrap gap-1">
          {displayGenres.length > 0 ? displayGenres.slice(0, 2).map((g, i) => (
            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
              {g}
            </span>
          )) : (
            <span className="text-sm text-gray-400">--</span>
          )}
          {displayGenres.length > 2 && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-500">
              +{displayGenres.length - 2}
            </span>
          )}
        </div>
      </td>
      <td className="px-5 py-4 whitespace-nowrap">
        <StatusBadge status={displayStatus} />
      </td>
      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
        {displayDate}
      </td>
      <td className="px-5 py-4 whitespace-nowrap text-right">
        {displayStatus === 'pending' && onApprove && onReject ? (
          <div className="flex justify-end gap-2">
            <button
              onClick={onApprove}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-xs font-medium ring-1 ring-emerald-600/20"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Approve
            </button>
            <button
              onClick={onReject}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium ring-1 ring-red-600/20"
            >
              <XCircle className="h-3.5 w-3.5" />
              Reject
            </button>
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {showActions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                <div className="absolute right-0 top-8 z-20 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 animate-in fade-in slide-in-from-top-1">
                  <button onClick={() => { onView(); setShowActions(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Eye className="h-3.5 w-3.5 text-gray-400" /> View
                  </button>
                  <button onClick={() => { onEdit(); setShowActions(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Pencil className="h-3.5 w-3.5 text-gray-400" /> Edit
                  </button>
                  <hr className="my-1 border-gray-100" />
                  <button onClick={() => { onDelete(); setShowActions(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </td>
    </tr>
  );
});

const FormField: React.FC<{
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }> = ({ name, type = 'text', value, onChange }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1.5 capitalize">
      {name}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-gray-50/50 text-sm transition-all"
      required
    />
  </div>
);

const ArtistManagement: React.FC = () => {

  // State management
  const [modalOpen, setModalOpen] = useState<ModalType>(null);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [formData, setFormData] = useState<Partial<Artist>>({});
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Get artists data with filters
  const { artists, loading } = useFetchArtists();
  const navigate = useNavigate();
  const { approveArtist, rejectArtist } = useArtistContext();

  // Update filter params with debounce
  useEffect(() => {
    const timer = setTimeout(() => {}, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filterStatus]);

  // Filtered artists
  const filteredArtists = useMemo(() => {
    if (!artists) return [];
    return artists.filter((artist) => {
      const name = artist.name || artist.fullName || [artist.firstName, artist.lastName].filter(Boolean).join(' ') || '';
      const email = artist.email || '';
      const matchesSearch = searchTerm === '' || 
        name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        email.toLowerCase().includes(searchTerm.toLowerCase());
      const status = artist.status || (artist.isApproved ? 'active' : 'pending');
      const matchesStatus = filterStatus === 'all' || status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [artists, searchTerm, filterStatus]);

  // Stats
  const stats = useMemo(() => {
    if (!artists) return { total: 0, active: 0, pending: 0, inactive: 0 };
    return {
      total: artists.length,
      active: artists.filter(a => a.status === 'active' || a.isApproved).length,
      pending: artists.filter(a => !a.status && !a.isApproved || a.status === 'pending').length,
      inactive: artists.filter(a => a.status === 'inactive').length,
    };
  }, [artists]);

  // Modal handlers
  const handleOpenModal = useCallback((type: ModalType, artist: Artist | null = null) => {
    setModalOpen(type);
    setSelectedArtist(artist);
    if (type === 'add') {
      setFormData({});
    } else if (type === 'edit' && artist) {
      setFormData({ ...artist });
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(null);
    setSelectedArtist(null);
    setFormData({});
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (modalOpen === 'add') {
      toast.success('Artist added successfully!');
    } else if (modalOpen === 'edit' && selectedArtist) {
      toast.success('Artist updated successfully!');
    }
    handleCloseModal();
  }, [modalOpen, selectedArtist, handleCloseModal]);

  const handleDeleteArtist = useCallback(() => {
    if (selectedArtist) {
      toast.success('Artist deleted successfully!');
      handleCloseModal();
    }
  }, [selectedArtist, handleCloseModal]);

  const handleViewDetails = useCallback((artist: Artist) => {
    const artistId = (artist._id as string) || (artist as any).id;
    if (!artistId) {
      toast.error('Unable to open artist details (missing id).');
      return;
    }
    navigate(`/admin/artist-details/${artistId}`);
  }, [navigate]);

  const handleApproveArtist = useCallback(async (artist: Artist) => {
    const artistId = (artist._id as string) || (artist as any).id;
    if (!artistId) {
      toast.error('Unable to approve artist (missing id).');
      return;
    }
    const success = await approveArtist(artistId);
    if (success) {
      window.location.reload();
    }
  }, [approveArtist]);

  const handleRejectArtist = useCallback(async (artist: Artist) => {
    const artistId = (artist._id as string) || (artist as any).id;
    if (!artistId) {
      toast.error('Unable to reject artist (missing id).');
      return;
    }
    const reason = prompt('Please provide a reason for rejection:') || 'Administrative decision';
    const success = await rejectArtist(artistId, reason);
    if (success) {
      window.location.reload();
    }
  }, [rejectArtist]);

  const ArtistTable = useMemo(() => (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Artist</th>
            <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Genre</th>
            <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
            <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {filteredArtists.length > 0 ? (
            filteredArtists.map((artist) => {
              const displayStatus = artist.status || (artist.isApproved ? 'active' : 'pending');
              const isPending = displayStatus === 'pending';
              return (
                <ArtistRow 
                  key={(artist._id as string) || (artist as any).id} 
                  artist={artist} 
                  onView={() => handleViewDetails(artist)}
                  onEdit={() => handleOpenModal('edit', artist)}
                  onDelete={() => handleOpenModal('delete', artist)}
                  onApprove={isPending ? () => handleApproveArtist(artist) : undefined}
                  onReject={isPending ? () => handleRejectArtist(artist) : undefined}
                />
              );
            })
          ) : (
            <tr>
              <td colSpan={5} className="px-5 py-16 text-center">
                <div className="flex flex-col items-center">
                  <div className="p-3 rounded-full bg-gray-100 mb-3">
                    <Music2 className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">No artists found</p>
                  <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  ), [filteredArtists, handleOpenModal, handleViewDetails, handleApproveArtist, handleRejectArtist]);

  const ArtistForm = useMemo(() => (
    <form onSubmit={handleSubmit}>
      <FormField name="name" value={formData.name || ''} onChange={handleInputChange} />
      <FormField name="email" type="email" value={formData.email || ''} onChange={handleInputChange} />
      <FormField name="genre" value={formData.genre || ''} onChange={handleInputChange} />
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
        <select
          name="status"
          value={formData.status || 'pending'}
          onChange={handleInputChange}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-gray-50/50 text-sm transition-all"
          required
        >
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={handleCloseModal}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <Link
          to="/artist/add"
          className="px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
        >
          Add Artist
        </Link>
      </div>
    </form>
  ), [formData, handleInputChange, handleSubmit, handleCloseModal]);

  return (
    <div className="max-w-7xl mx-auto">
      <Toaster position="top-right" toastOptions={{ className: 'text-sm' }} />
      
      {loading && <Preloader isVisible={loading} text="Loading artists..." />}
      
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Artist Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and monitor all artists on the platform</p>
        </div>
        <Link
          to="/admin/artist-add"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors shadow-sm shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Artist
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Artists" value={stats.total} icon={<Users className="h-5 w-5" />} color="text-blue-600" bgColor="bg-blue-50" />
        <StatCard label="Active" value={stats.active} icon={<UserCheck className="h-5 w-5" />} color="text-emerald-600" bgColor="bg-emerald-50" />
        <StatCard label="Pending" value={stats.pending} icon={<Clock className="h-5 w-5" />} color="text-amber-600" bgColor="bg-amber-50" />
        <StatCard label="Inactive" value={stats.inactive} icon={<UserX className="h-5 w-5" />} color="text-red-600" bgColor="bg-red-50" />
      </div>
      
      {/* Table Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Action Bar */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search artists..."
                className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 text-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                className="w-full sm:w-40 pl-9 pr-8 py-2 rounded-lg border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 text-sm appearance-none transition-all"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <p className="text-xs text-gray-400 font-medium">
            {filteredArtists.length} {filteredArtists.length === 1 ? 'artist' : 'artists'}
          </p>
        </div>
        
        {/* Table */}
        {ArtistTable}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(modalOpen === 'add' || modalOpen === 'edit') && (
          <ModalContainer>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {modalOpen === 'add' ? 'Add New Artist' : 'Edit Artist'}
            </h2>
            {ArtistForm}
          </ModalContainer>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {modalOpen === 'delete' && selectedArtist && (
          <ModalContainer>
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <Trash2 className="h-5 w-5 text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Delete Artist</h2>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete <span className="font-medium text-gray-700">"{selectedArtist.name}"</span>? This action cannot be undone.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteArtist}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
              >
                Delete Artist
              </button>
            </div>
          </ModalContainer>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArtistManagement;
