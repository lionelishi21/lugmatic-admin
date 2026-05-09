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

// Status badge with tactical styling
const card = 'bg-zinc-900 border border-white/[0.06] rounded-lg';
const labelClass = "text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 italic";
const headingClass = "text-xl font-black text-white tracking-tighter uppercase italic";

const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  const normalizedStatus = (status || 'pending').toLowerCase();
  const styles: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    inactive: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest italic ${styles[normalizedStatus] || 'bg-zinc-800 text-zinc-500 border border-white/10'}`}>
      {status || 'pending'}
    </span>
  );
};

const ModalContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
    {...fadeIn}
  >
    <motion.div
      className={`${card} w-full max-w-md shadow-2xl overflow-hidden border-white/10`}
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
    <tr className="hover:bg-white/[0.02] transition-colors group">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 h-10 w-10 rounded overflow-hidden bg-zinc-800 flex items-center justify-center border border-white/10 group-hover:border-emerald-500/30 transition-all">
            {avatarSrc ? (
              <img className="h-full w-full object-cover" src={avatarSrc} alt={displayName} loading="lazy" />
            ) : (
              <span className="text-[10px] font-black text-zinc-600">{initials}</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-black text-white italic uppercase tracking-tight truncate">{displayName}</p>
              {artist.isVerified && (
                <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />
              )}
            </div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest truncate">{displayEmail}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-wrap gap-1.5">
          {displayGenres.length > 0 ? displayGenres.slice(0, 1).map((g, i) => (
            <span key={i} className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/5 text-emerald-500/70 px-2 py-0.5 rounded border border-emerald-500/10 italic">
              {g}
            </span>
          )) : (
            <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">NO DATA</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={displayStatus} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
        {displayDate}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        {displayStatus === 'pending' && onApprove && onReject ? (
          <div className="flex justify-end gap-2">
            <button
              onClick={onApprove}
              className="px-3 py-1.5 bg-emerald-500 text-black rounded text-[10px] font-black uppercase tracking-widest italic hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10"
            >
              APPROVE
            </button>
            <button
              onClick={onReject}
              className="px-3 py-1.5 bg-zinc-800 text-zinc-400 rounded text-[10px] font-black uppercase tracking-widest italic hover:bg-zinc-700 transition-colors border border-white/5"
            >
              REJECT
            </button>
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 rounded hover:bg-white/5 text-zinc-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {showActions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                <div className="absolute right-0 top-10 z-20 w-48 bg-zinc-900 rounded border border-white/10 py-1 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-1">
                  <button onClick={() => { onView(); setShowActions(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest italic text-zinc-400 hover:bg-white/5 hover:text-emerald-400 transition-all">
                    <Eye className="h-4 w-4" /> View Registry
                  </button>
                  <button onClick={() => { onEdit(); setShowActions(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest italic text-zinc-400 hover:bg-white/5 hover:text-emerald-400 transition-all">
                    <Pencil className="h-4 w-4" /> Modify Profile
                  </button>
                  {onVerify && (
                    <button
                      onClick={() => { onVerify(!artist.isVerified); setShowActions(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest italic transition-all ${artist.isVerified ? 'text-amber-500 hover:bg-amber-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
                    >
                      {artist.isVerified ? (
                        <><ShieldAlert className="h-4 w-4" /> Revoke Verification</>
                      ) : (
                        <><ShieldCheck className="h-4 w-4" /> Authorize Verified</>
                      )}
                    </button>
                  )}
                  <div className="h-px bg-white/5 my-1" />
                  <button onClick={() => { onDelete(); setShowActions(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest italic text-rose-500 hover:bg-rose-500/10 transition-all">
                    <Trash2 className="h-4 w-4" /> Terminate Artist
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
    <div className={`${card} p-6 group hover:border-emerald-500/20 transition-all shadow-xl`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded flex items-center justify-center ${bgColor}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-emerald-500 transition-colors" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1.5 italic">{label}</p>
      <p className="text-2xl font-black text-white tracking-tighter uppercase italic">{value.toLocaleString()}</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto pb-24 space-y-8">
      <Toaster position="top-right" toastOptions={{ className: 'text-xs font-black uppercase italic tracking-widest bg-zinc-900 text-white border border-white/10' }} />

      {loading && <Preloader isVisible={loading} text="COLLECTING ARTIST INTEL..." />}

      {/* Page Header */}
      <div className={`${card} p-8 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-emerald-500 rounded flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Users className="h-7 w-7 text-black" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-1.5 italic">GLOBAL ACCESS</p>
              <h1 className={headingClass}>
                Artist Management
              </h1>
              <p className="text-sm text-zinc-500 mt-1 uppercase font-bold tracking-wider">
                ORCHESTRATING PLATFORM-WIDE TALENT PERFORMANCE
              </p>
            </div>
          </div>
          <Link
            to="/admin/artist-add"
            className="px-8 py-3.5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded hover:bg-emerald-400 transition-all shadow-xl shadow-white/5 flex items-center gap-3 italic"
          >
            <Plus className="h-4 w-4" />
            INITIALIZE ARTIST
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard_ label="Total Artists" value={stats.total} icon={Users} color="text-blue-400" bgColor="bg-blue-500/10" />
        <StatCard_ label="Active Intel" value={stats.active} icon={UserCheck} color="text-emerald-400" bgColor="bg-emerald-500/10" />
        <StatCard_ label="Pending Sync" value={stats.pending} icon={Clock} color="text-amber-400" bgColor="bg-amber-500/10" />
        <StatCard_ label="Verified Status" value={stats.verified} icon={BadgeCheck} color="text-emerald-400" bgColor="bg-emerald-500/10" />
      </div>

      {/* Table Card */}
      <div className={`${card} overflow-hidden shadow-2xl`}>
        <div className="px-8 py-6 border-b border-white/[0.06] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-zinc-800/30">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
              <input
                type="text"
                placeholder="SEARCH ARTIST REGISTRY..."
                className="w-full pl-12 pr-4 py-3 rounded bg-zinc-950 border border-white/10 text-[11px] font-black uppercase italic tracking-widest text-white placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 pointer-events-none" />
              <select
                className="pl-12 pr-10 py-3 rounded bg-zinc-950 border border-white/10 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic appearance-none cursor-pointer focus:outline-none focus:border-emerald-500 transition-all"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">ALL STATUS</option>
                <option value="active">ACTIVE</option>
                <option value="pending">PENDING</option>
                <option value="suspended">SUSPENDED</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600 pointer-events-none" />
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic">
            {filteredArtists.length} RECORDS FOUND
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.04] bg-zinc-950/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic">Artist Identity</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic">Sonic Profile</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic">Registry Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic">Connection Date</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
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
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-zinc-950 border border-white/5 rounded-full flex items-center justify-center mb-6 relative">
                        <div className="absolute inset-0 bg-emerald-500/5 blur-xl rounded-full" />
                        <Music2 className="h-8 w-8 text-zinc-800" />
                      </div>
                      <h3 className="text-sm font-black text-white uppercase italic tracking-widest">Registry Empty</h3>
                      <p className="text-[11px] text-zinc-600 mt-2 uppercase font-bold tracking-wider">NO DATA MATCHES THE CURRENT PROTOCOLS</p>
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
            <div className="px-10 py-12 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-rose-500" />
              <div className="mx-auto w-20 h-20 rounded bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-8">
                <Trash2 className="h-10 w-10 text-rose-500" />
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-3">Terminate Registry?</h2>
              <p className="text-zinc-500 text-[11px] uppercase font-bold tracking-widest mb-10 leading-relaxed">
                Confirming the permanent deletion of <span className="text-white">"{selectedArtist.name}"</span>. This action is irreversible.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-4 bg-zinc-800 text-zinc-400 rounded text-[10px] font-black uppercase tracking-widest italic hover:bg-zinc-700 transition-all border border-white/5"
                >
                  Abort
                </button>
                <button
                  onClick={handleDeleteArtist}
                  className="px-6 py-4 bg-rose-500 text-black rounded text-[10px] font-black uppercase tracking-widest italic hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                >
                  EXECUTE
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
