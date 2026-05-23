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
  BadgeCheck, ShieldCheck, ShieldAlert, Target, Activity, Globe,
  Cpu, ArrowUpRight, Layers, Database, Save, HardDrive, Info,
  Zap, SlidersHorizontal, UserPlus, User, ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';

// Status badge with clean styling
const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  const normalizedStatus = (status || 'pending').toLowerCase();
  const styles: Record<string, { bg: string; text: string; border: string; shadow: string; label: string }> = {
    active: { bg: 'bg-emerald-500/5', text: 'text-emerald-500', border: 'border-emerald-500/10', shadow: 'shadow-[0_0_8px_#10b981]', label: 'Active' },
    pending: { bg: 'bg-amber-500/5', text: 'text-amber-500', border: 'border-amber-500/10', shadow: 'shadow-[0_0_8px_#f59e0b]', label: 'Pending' },
    inactive: { bg: 'bg-rose-500/5', text: 'text-rose-500', border: 'border-rose-500/10', shadow: 'shadow-[0_0_8px_#f43f5e]', label: 'Inactive' },
    suspended: { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20', shadow: 'shadow-[0_0_10px_rgba(244,63,94,0.3)]', label: 'Suspended' },
  };

  const style = styles[normalizedStatus] || { bg: 'bg-zinc-800/20', text: 'text-zinc-500', border: 'border-white/5', shadow: '', label: 'Unknown' };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border ${style.bg} ${style.text} ${style.border}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${style.text.replace('text-', 'bg-')} ${style.shadow}`} />
      <span className="text-[9px] font-black uppercase tracking-widest">{style.label}</span>
    </div>
  );
};

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
    <motion.tr 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="hover:bg-emerald-500/[0.01] transition-all group"
    >
      <td className="px-10 py-6">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-white/5 overflow-hidden flex items-center justify-center shadow-inner relative group-hover:scale-110 transition-all duration-500">
            {avatarSrc ? (
              <img className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" src={avatarSrc} alt={displayName} loading="lazy" />
            ) : (
              <span className="text-[10px] font-black text-zinc-700 italic">{initials}</span>
            )}
            <div className="absolute inset-0 bg-black/20" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-bold text-white uppercase tracking-tight italic group-hover:text-emerald-400 transition-colors leading-none">{displayName}</p>
              {artist.isVerified && (
                <BadgeCheck className="h-4 w-4 text-emerald-500 shadow-[0_0_8px_#10b981]" />
              )}
            </div>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest truncate italic">{displayEmail.toUpperCase()}</p>
          </div>
        </div>
      </td>
      <td className="px-10 py-6">
        <div className="flex flex-wrap gap-2">
          {displayGenres.length > 0 ? displayGenres.slice(0, 2).map((g, i) => (
            <div key={i} className="px-3 py-1 bg-zinc-950 border border-white/5 rounded-lg shadow-inner">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 italic">
                {g.toUpperCase()}
              </span>
            </div>
          )) : (
            <span className="text-[9px] font-black text-zinc-800 uppercase tracking-widest italic">No Genre</span>
          )}
        </div>
      </td>
      <td className="px-10 py-6">
        <StatusBadge status={displayStatus} />
      </td>
      <td className="px-10 py-6">
        <div className="flex items-center gap-2.5">
           <Clock size={12} className="text-zinc-700" />
           <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest italic tabular-nums">{displayDate.toUpperCase()}</span>
        </div>
      </td>
      <td className="px-10 py-6 text-right">
        {displayStatus === 'pending' && onApprove && onReject ? (
          <div className="flex justify-end gap-3">
            <button
              onClick={onApprove}
              className="h-10 px-5 bg-emerald-500 text-black rounded-xl text-[9px] font-black uppercase tracking-widest italic hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/10 flex items-center gap-2"
            >
              <CheckCircle size={14} /> APPROVE
            </button>
            <button
              onClick={onReject}
              className="h-10 px-5 bg-zinc-950 text-zinc-400 rounded-xl text-[9px] font-black uppercase tracking-widest italic hover:text-white hover:bg-rose-500/10 hover:border-rose-500/20 transition-all border border-white/5 shadow-inner flex items-center gap-2"
            >
              <XCircle size={14} /> REJECT
            </button>
          </div>
        ) : (
          <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
             <button 
                onClick={onView} 
                className="w-12 h-12 rounded-2xl flex items-center justify-center bg-zinc-950 border border-white/5 text-zinc-600 hover:text-white hover:bg-white/5 transition-all shadow-inner"
                title="View Profile"
             >
               <Eye size={20} />
             </button>
             <button 
                onClick={onEdit} 
                className="w-12 h-12 rounded-2xl flex items-center justify-center bg-zinc-950 border border-white/5 text-zinc-600 hover:text-white hover:bg-white/5 transition-all shadow-inner"
                title="Modify Profile"
             >
               <Pencil size={20} />
             </button>
             <div className="relative">
                <button 
                  onClick={() => setShowActions(!showActions)} 
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${showActions ? 'bg-white/10 text-white border border-white/10' : 'bg-zinc-950 text-zinc-600 hover:text-white border border-white/5 shadow-inner'}`}
                >
                  <MoreHorizontal size={20} />
                </button>
                <AnimatePresence>
                   {showActions && (
                     <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: 15 }} 
                          animate={{ opacity: 1, scale: 1, y: 0 }} 
                          exit={{ opacity: 0, scale: 0.95, y: 15 }}
                          className="absolute right-0 top-14 z-20 w-64 bg-zinc-900 rounded-[2rem] border border-white/10 p-3 shadow-[0_30px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
                        >
                           <div className="px-6 py-4 border-b border-white/5 mb-2">
                              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Artist Options</p>
                           </div>
                           {onVerify && (
                              <button
                                onClick={() => { onVerify(!artist.isVerified); setShowActions(false); }}
                                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all group/opt ${artist.isVerified ? 'text-amber-500 hover:bg-amber-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
                              >
                                {artist.isVerified ? (
                                  <><ShieldAlert size={18} className="group-hover/opt:scale-110 transition-transform" /> Revoke Verification</>
                                ) : (
                                  <><ShieldCheck size={18} className="group-hover/opt:scale-110 transition-transform" /> Verify Artist</>
                                )}
                              </button>
                           )}
                           <div className="h-px bg-white/5 my-2" />
                           <button 
                             onClick={() => { onDelete(); setShowActions(false); }} 
                             className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 transition-all group/opt"
                           >
                             <Trash2 size={18} className="group-hover/opt:scale-110 transition-transform" /> Delete Artist
                           </button>
                        </motion.div>
                     </>
                   )}
                </AnimatePresence>
             </div>
          </div>
        )}
      </td>
    </motion.tr>
  );
});

type ModalType = 'delete' | 'edit' | 'add' | null;

const ArtistManagement: React.FC = () => {
  const [modalOpen, setModalOpen] = useState<ModalType>(null);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [formData, setFormData] = useState<Partial<Artist>>({});
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterVerified, setFilterVerified] = useState<boolean | 'all'>('all');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const path = window.location.pathname;
    if (path.endsWith('/verified')) {
      setFilterVerified(true);
    }
  }, []);

  const { artists, loading } = useFetchArtists();
  const navigate = useNavigate();
  const { approveArtist, rejectArtist, verifyArtist } = useArtistContext();

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortHeader = (label: string, field: string) => {
    const isSorted = sortField === field;
    return (
      <button 
        onClick={() => handleSort(field)}
        className="flex items-center gap-1.5 hover:text-white transition-colors group/btn text-[10px] font-bold uppercase tracking-widest text-zinc-500"
      >
        <span>{label}</span>
        {isSorted ? (
          sortDirection === 'asc' ? <ArrowUp size={12} className="text-emerald-500" /> : <ArrowDown size={12} className="text-emerald-500" />
        ) : (
          <ArrowUpDown size={12} className="text-zinc-700 opacity-60 group-hover/btn:opacity-100 transition-opacity" />
        )}
      </button>
    );
  };

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

  const sortedArtists = useMemo(() => {
    const list = [...filteredArtists];
    list.sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      if (sortField === 'name') {
        valA = a.name || a.fullName || [a.firstName, a.lastName].filter(Boolean).join(' ') || '';
        valB = b.name || b.fullName || [b.firstName, b.lastName].filter(Boolean).join(' ') || '';
      } else if (sortField === 'genres') {
        valA = (a.genres && a.genres[0]) || '';
        valB = (b.genres && b.genres[0]) || '';
      } else if (sortField === 'status') {
        valA = a.status || (a.isApproved ? 'active' : 'pending');
        valB = b.status || (b.isApproved ? 'active' : 'pending');
      } else if (sortField === 'date') {
        valA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        valB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      }

      if (typeof valA === 'string') {
        return sortDirection === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      } else {
        return sortDirection === 'asc' 
          ? (valA > valB ? 1 : -1) 
          : (valB > valA ? 1 : -1);
      }
    });
    return list;
  }, [filteredArtists, sortField, sortDirection]);

  const stats = useMemo(() => {
    if (!artists) return { total: 0, active: 0, pending: 0, verified: 0 };
    return {
      total: artists.length,
      active: artists.filter(a => a.status === 'active' || a.isApproved).length,
      pending: artists.filter(a => !a.status && !a.isApproved || a.status === 'pending').length,
      verified: artists.filter(a => a.isVerified).length,
    };
  }, [artists]);

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

  const handleDeleteArtist = useCallback(() => {
    if (selectedArtist) {
      toast.success('Artist deleted successfully');
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
    const reason = prompt('Please enter rejection reason:') || 'Administrative decision';
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

  if (loading && (!artists || artists.length === 0)) return <Preloader isVisible={true} text="Loading artists..." />;

  return (
    <div className="space-y-12 pb-24">
      <Toaster position="top-right" toastOptions={{ className: 'text-[10px] font-black uppercase tracking-widest bg-zinc-900 text-white border border-white/10' }} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-none">Artists</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">System: Online</span>
            </div>
          </div>
          <p className="text-zinc-500 text-xs font-semibold ml-1">Manage and verify artists on the platform.</p>
        </div>
        <Link
          to="/admin/artist-add"
          className="h-16 px-10 bg-white text-black rounded-2xl text-[10px] font-bold hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-4 group border border-white/10"
        >
          <UserPlus size={18} />
          Add Artist
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total Artists', value: stats.total, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Active Artists', value: stats.active, icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Pending Approvals', value: stats.pending, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Verified Artists', value: stats.verified, icon: BadgeCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map((s, i) => (
          <motion.div 
            key={s.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="premium-card group border-white/5 hover:border-emerald-500/20 transition-all cursor-default relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-bl-full pointer-events-none" />
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${s.bg} border border-white/5 shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform duration-500`}>
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <s.icon size={24} className={s.color} />
            </div>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-3xl font-bold text-white tracking-tighter tabular-nums">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Toolbar controls */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="flex flex-col md:flex-row gap-6 w-full lg:max-w-4xl">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 h-5 w-5 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search artists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-12 h-14 bg-zinc-950/40 border border-white/5 rounded-2xl text-white text-[10px] font-bold focus:outline-none focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-inner placeholder:text-zinc-800"
            />
          </div>
          <div className="relative w-full md:w-80 group">
            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 h-5 w-5 group-focus-within:text-emerald-500 transition-colors" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full h-14 pl-14 pr-12 bg-zinc-950/40 border border-white/5 rounded-2xl text-white text-[10px] font-bold uppercase focus:outline-none focus:border-emerald-500/30 appearance-none shadow-inner transition-all cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-800 pointer-events-none group-focus-within:rotate-180 duration-500 transition-all group-focus-within:text-emerald-500" size={18} />
          </div>
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">
           {filteredArtists.length} Artists Indexed
        </span>
      </div>

      {/* Artists Table */}
      <div className="premium-card !p-0 overflow-hidden border-white/5 shadow-2xl bg-[#0a0a0a]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-zinc-950/50">
                <th className="px-10 py-8 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{renderSortHeader('Artist', 'name')}</th>
                <th className="px-10 py-8 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{renderSortHeader('Genres', 'genres')}</th>
                <th className="px-10 py-8 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{renderSortHeader('Status', 'status')}</th>
                <th className="px-10 py-8 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{renderSortHeader('Date Joined', 'date')}</th>
                <th className="px-10 py-8 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedArtists.length > 0 ? (
                sortedArtists.map((artist, i) => (
                  <ArtistRow
                    key={(artist._id as string) || (artist as any).id}
                    artist={artist}
                    onView={() => handleViewDetails(artist)}
                    onEdit={() => handleEditArtist(artist)}
                    onDelete={() => handleOpenModal('delete', artist)}
                    onApprove={(artist.status || (artist.isApproved ? 'active' : 'pending')) === 'pending' ? () => handleApproveArtist(artist) : undefined}
                    onReject={(artist.status || (artist.isApproved ? 'active' : 'pending')) === 'pending' ? () => handleRejectArtist(artist) : undefined}
                    onVerify={(isVerified) => handleVerifyArtist(artist, isVerified)}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-10 py-40 text-center">
                    <div className="w-24 h-24 bg-zinc-950 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-white/5 shadow-2xl group cursor-default">
                      <Users size={36} className="text-zinc-800 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.3em] mb-3">No Artists Found</h3>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.15em] max-w-sm mx-auto opacity-60">Adjust search filters or add a new artist.</p>
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl" onClick={handleCloseModal}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="premium-card w-full max-w-md text-center p-12 border-rose-500/10 shadow-[0_30px_100px_rgba(0,0,0,1)] bg-[#0a0a0a]" onClick={e => e.stopPropagation()}
            >
              <div className="mx-auto w-20 h-20 rounded-[2.5rem] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-rose-500/10 animate-pulse" />
                <Trash2 className="text-rose-500 relative z-10" size={36} />
              </div>
              <h3 className="text-2xl font-bold text-white uppercase tracking-tighter mb-4">Delete Artist?</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-12 leading-relaxed px-6">
                Are you sure you want to permanently delete <span className="text-white">"{selectedArtist.name}"</span>? This action cannot be undone.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <button
                  onClick={handleCloseModal}
                  className="h-16 bg-zinc-950 text-zinc-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-white/5 hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteArtist}
                  className="h-16 bg-rose-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-2xl shadow-rose-900/20 hover:bg-rose-500 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArtistManagement;
