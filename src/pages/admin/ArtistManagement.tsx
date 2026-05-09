import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Preloader from '../../components/ui/Preloader';
import { toast, Toaster } from 'react-hot-toast';
import useFetchArtists, { Artist } from '../../hooks/artist/useFetchArtists';
import { Link, useNavigate } from 'react-router-dom';
import { useArtistContext } from '../../context/ArtistContext';
import {
  CheckCircle, XCircle, Search, Filter, Plus, Eye, Pencil, Trash2,
  Users, UserCheck, UserX, Clock, MoreHorizontal, Music2, ChevronDown,
  BadgeCheck, ShieldCheck, ShieldAlert
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
const card = 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg';

const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  const normalizedStatus = (status || 'pending').toLowerCase();
  const styles: Record<string, string> = {
    active: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20',
    pending: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20',
    inactive: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${styles[normalizedStatus] || 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-white/10'}`}>
      {status || 'pending'}
    </span>
  );
};

const ModalContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
    {...fadeIn}
  >
    <motion.div
      className={`${card} w-full max-w-md shadow-2xl overflow-hidden`}
      variants={modalVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  </motion.div>
);

const ArtistRow = React.memo(({
  artist,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onVerify
}: {
  artist: Artist;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onVerify?: (isVerified: boolean) => void;
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
    <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors group">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 h-10 w-10 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-white/10">
            {avatarSrc ? (
              <img className="h-full w-full object-cover" src={avatarSrc} alt={displayName} loading="lazy" />
            ) : (
              <span className="text-xs font-bold text-zinc-400">{initials}</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{displayName}</p>
              {artist.isVerified && (
                <BadgeCheck className="h-4 w-4 text-emerald-500" />
              )}
            </div>
            <p className="text-[11px] font-medium text-zinc-500 truncate">{displayEmail}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-wrap gap-1.5">
          {displayGenres.length > 0 ? displayGenres.slice(0, 1).map((g, i) => (
            <span key={i} className="text-[10px] font-bold uppercase tracking-wide bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded">
              {g}
            </span>
          )) : (
            <span className="text-xs text-zinc-400">--</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={displayStatus} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-[11px] font-medium text-zinc-400">
        {displayDate}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        {displayStatus === 'pending' && onApprove && onReject ? (
          <div className="flex justify-end gap-2">
            <button
              onClick={onApprove}
              className="px-3 py-1.5 bg-emerald-500 text-white rounded text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-600 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={onReject}
              className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Reject
            </button>
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {showActions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                <div className="absolute right-0 top-10 z-20 w-40 bg-white dark:bg-zinc-800 rounded-lg shadow-2xl border border-zinc-200 dark:border-white/10 py-1 overflow-hidden animate-in fade-in slide-in-from-top-1">
                  <button onClick={() => { onView(); setShowActions(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                    <Eye className="h-4 w-4" /> View Details
                  </button>
                  <button onClick={() => { onEdit(); setShowActions(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                    <Pencil className="h-4 w-4" /> Edit Profile
                  </button>
                  {onVerify && (
                    <button
                      onClick={() => { onVerify(!artist.isVerified); setShowActions(false); }}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-xs font-bold transition-colors ${artist.isVerified ? 'text-amber-500 hover:bg-amber-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
                    >
                      {artist.isVerified ? (
                        <><ShieldAlert className="h-4 w-4" /> Unverify</>
                      ) : (
                        <><ShieldCheck className="h-4 w-4" /> Verify Artist</>
                      )}
                    </button>
                  )}
                  <div className="h-px bg-zinc-100 dark:bg-white/5 my-1" />
                  <button onClick={() => { onDelete(); setShowActions(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors">
                    <Trash2 className="h-4 w-4" /> Delete Artist
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

const ArtistManagement: React.FC = () => {

  // State management
  const [modalOpen, setModalOpen] = useState<ModalType>(null);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [formData, setFormData] = useState<Partial<Artist>>({});
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterVerified, setFilterVerified] = useState<boolean | 'all'>('all');

  // Check for route-based filtering (e.g., /verified)
  useEffect(() => {
    const path = window.location.pathname;
    if (path.endsWith('/verified')) {
      setFilterVerified(true);
    }
  }, []);

  // Get artists data with filters
  const { artists, loading } = useFetchArtists();
  const navigate = useNavigate();
  const { approveArtist, rejectArtist, verifyArtist } = useArtistContext();

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
      const matchesVerified = filterVerified === 'all' || artist.isVerified === filterVerified;
      return matchesSearch && matchesStatus && matchesVerified;
    });
  }, [artists, searchTerm, filterStatus, filterVerified]);

  // Stats
  const stats = useMemo(() => {
    if (!artists) return { total: 0, active: 0, pending: 0, verified: 0 };
    return {
      total: artists.length,
      active: artists.filter(a => a.status === 'active' || a.isApproved).length,
      pending: artists.filter(a => !a.status && !a.isApproved || a.status === 'pending').length,
      verified: artists.filter(a => a.isVerified).length,
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
    }
    handleCloseModal();
  }, [modalOpen, handleCloseModal]);

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

  const handleEditArtist = useCallback((artist: Artist) => {
    const artistId = (artist._id as string) || (artist as any).id;
    if (!artistId) {
      toast.error('Unable to edit artist (missing id).');
      return;
    }
    navigate(`/admin/artists/${artistId}/edit`);
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

  const handleVerifyArtist = useCallback(async (artist: Artist, isVerified: boolean) => {
    const artistId = (artist._id as string) || (artist as any).id;
    if (!artistId) {
      toast.error('Unable to verify artist (missing id).');
      return;
    }
    await verifyArtist(artistId, isVerified);
  }, [verifyArtist]);

  const StatCard_ = ({
    label, value, icon: Icon, color, bgColor
  }: {
    label: string, value: number, icon: any, color: string, bgColor: string
  }) => (
    <div className={`${card} p-5`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded ${bgColor}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400" />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">{label}</p>
      <p className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">{value.toLocaleString()}</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-6">
      <Toaster position="top-right" toastOptions={{ className: 'text-sm' }} />

      {loading && <Preloader isVisible={loading} text="Loading artists..." />}

      {/* Page Header */}
      <div className={`${card} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Artist Management
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Platform-wide artist performance and status
            </p>
          </div>
        </div>
        <Link
          to="/admin/artist-add"
          className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold rounded hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Artist
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard_ label="Total Artists" value={stats.total} icon={Users} color="text-blue-600 dark:text-blue-400" bgColor="bg-blue-50 dark:bg-blue-500/10" />
        <StatCard_ label="Active" value={stats.active} icon={UserCheck} color="text-emerald-600 dark:text-emerald-400" bgColor="bg-emerald-50 dark:bg-emerald-500/10" />
        <StatCard_ label="Pending" value={stats.pending} icon={Clock} color="text-amber-600 dark:text-amber-400" bgColor="bg-amber-50 dark:bg-amber-500/10" />
        <StatCard_ label="Verified" value={stats.verified} icon={BadgeCheck} color="text-emerald-600 dark:text-emerald-400" bgColor="bg-emerald-50 dark:bg-emerald-500/10" />
      </div>

      {/* Table Card */}
      <div className={card}>
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-white/[0.06] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search artists..."
                className="w-full pl-9 pr-4 py-2 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
              <select
                className="pl-9 pr-8 py-2 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide appearance-none cursor-pointer focus:outline-none focus:border-emerald-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            {filteredArtists.length} Total Results
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-white/[0.04] bg-zinc-50/50 dark:bg-zinc-800/20">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Artist</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Genre</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Joined</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-widest text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
              {filteredArtists.length > 0 ? (
                filteredArtists.map((artist) => {
                  const displayStatus = artist.status || (artist.isApproved ? 'active' : 'pending');
                  const isPending = displayStatus === 'pending';
                  return (
                    <ArtistRow
                      key={(artist._id as string) || (artist as any).id}
                      artist={artist}
                      onView={() => handleViewDetails(artist)}
                      onEdit={() => handleEditArtist(artist)}
                      onDelete={() => handleOpenModal('delete', artist)}
                      onApprove={isPending ? () => handleApproveArtist(artist) : undefined}
                      onReject={isPending ? () => handleRejectArtist(artist) : undefined}
                      onVerify={(isVerified) => handleVerifyArtist(artist, isVerified)}
                    />
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
                        <Music2 className="h-6 w-6 text-zinc-400" />
                      </div>
                      <h3 className="font-semibold text-zinc-700 dark:text-zinc-300">No artists found</h3>
                      <p className="text-sm text-zinc-400 mt-1">Try adjusting your filters or search criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {modalOpen === 'delete' && selectedArtist && (
          <ModalContainer>
            <div className="px-8 py-10 text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6">
                <Trash2 className="h-8 w-8 text-rose-500" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Delete Artist</h2>
              <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-zinc-900 dark:text-white">"{selectedArtist.name}"</span>? This will permanently remove their data from the platform.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteArtist}
                  className="flex-1 px-6 py-3 bg-rose-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20"
                >
                  Delete Now
                </button>
              </div>
            </div>
          </ModalContainer>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArtistManagement;


export default ArtistManagement;
