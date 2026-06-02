import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useArtistContext } from '../../context/ArtistContext';
import Preloader from '../../components/ui/Preloader';
import artistService from '../../services/artistService';
import ContributionList from '../../components/artist/ContributionList';
import { Users, ChevronRight, ArrowLeft, Music, Music2 } from 'lucide-react';

const ArtistDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    fetchArtistById,
    fetchArtistAlbums,
    fetchArtistSongs,
    selectedArtist,
    albums,
    songs,
    loading,
    error,
    albumsLoading,
    songsLoading,
    albumsError,
    songsError,
    approveArtist,
    rejectArtist,
    clearSelectedArtist,
    clearDiscography
  } = useArtistContext();
  
  const [contributions, setContributions] = React.useState<any[]>([]);
  const [loadingContributions, setLoadingContributions] = React.useState(true);

  // Fetch artist details when component mounts
  useEffect(() => {
    if (id) {
      fetchArtistById(id);
      fetchArtistAlbums(id);
      fetchArtistSongs(id);
      fetchContributions(id);
    }

    return () => {
      clearSelectedArtist();
      clearDiscography();
    };
  }, [id, fetchArtistById, fetchArtistAlbums, fetchArtistSongs, clearSelectedArtist, clearDiscography]);

  const fetchContributions = async (artistId: string) => {
    try {
      setLoadingContributions(true);
      const data = await artistService.getArtistContributions(artistId);
      setContributions(data);
    } catch (err) {
      console.error('Failed to fetch artist contributions:', err);
    } finally {
      setLoadingContributions(false);
    }
  };

  // Handle artist approval
  const handleApprove = async () => {
    if (id && selectedArtist) {
      const success = await approveArtist(id);
      if (success) {
        // Optionally navigate back to the artist list
        // navigate('/admin/artists');
      }
    }
  };

  // Handle artist rejection
  const handleReject = async () => {
    if (id && selectedArtist) {
      // In a real app, you'd have a modal to collect the reason
      const reason = "Administrative decision";
      const success = await rejectArtist(id, reason);
      if (success) {
        // Optionally navigate back to the artist list
        // navigate('/admin/artists');
      }
    }
  };

  // Navigate to edit page
  const handleEdit = () => {
    navigate(`/admin/artists/${id}/edit`);
  };

  // Navigate to analytics page
  const handleViewAnalytics = () => {
    navigate(`/admin/artists/${id}/analytics`);
  };

  // Go back to artists list
  const handleBack = () => {
    navigate('/admin/artist-management');
  };

  if (loading && !selectedArtist) {
    return <Preloader isVisible={true} text="Collecting intelligence..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded text-xs font-black uppercase tracking-widest italic mb-4">
          SYSTEM ERROR: {error}
        </div>
        <button
          onClick={handleBack}
          className="px-6 py-3 bg-zinc-800 text-zinc-900 dark:text-white rounded text-[10px] font-black uppercase tracking-widest italic border border-black/5 dark:border-white/5 hover:bg-zinc-700 transition-all"
        >
          Abort Protocol
        </button>
      </div>
    );
  }

  const isLoadingAll = loading || albumsLoading || songsLoading;

  if (!isLoadingAll && !selectedArtist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-4 rounded text-xs font-black uppercase tracking-widest italic mb-4">
          RECORD NOT FOUND IN REGISTRY
        </div>
        <button
          onClick={handleBack}
          className="px-6 py-3 bg-zinc-800 text-zinc-900 dark:text-white rounded text-[10px] font-black uppercase tracking-widest italic border border-black/5 dark:border-white/5 hover:bg-zinc-700 transition-all"
        >
          Return to Registry
        </button>
      </div>
    );
  }

  if (!selectedArtist) return null;

  const displayName =
    selectedArtist.name ||
    selectedArtist.fullName ||
    [selectedArtist.firstName, selectedArtist.lastName].filter(Boolean).join(' ') ||
    'Unknown Artist';
  const displayEmail = selectedArtist.email || (selectedArtist as any).contactEmail || '—';
  const avatarSrc =
    (selectedArtist as any).imageUrl ||
    selectedArtist.profilePicture ||
    (selectedArtist.image as string) ||
    '';
  const statusValue =
    selectedArtist?.status ||
    (selectedArtist?.isApproved ? 'active' : selectedArtist?.isVerified ? 'verified' : 'pending');
  const normalizedStatus = (statusValue || '').toLowerCase();
  
  const statusStyles: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    approved: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    verified: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  };

  const statusClass = statusStyles[normalizedStatus] || 'bg-zinc-800 text-zinc-500 border border-white/10';

  const joinDate = (() => {
    if (!selectedArtist.createdAt) return '—';
    try {
      const d = new Date(selectedArtist.createdAt);
      return !isNaN(d.getTime()) ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
    } catch { return '—'; }
  })();
  
  const genres =
    Array.isArray(selectedArtist.genres) && selectedArtist.genres.length > 0
      ? selectedArtist.genres
      : Array.isArray((selectedArtist as any).favoriteGenres)
        ? ((selectedArtist as any).favoriteGenres as string[])
        : [];
  
  const canReviewArtist =
    (selectedArtist.status && selectedArtist.status.toLowerCase() === 'pending') ||
    selectedArtist.isApproved === false;

  const cardClass = "bg-zinc-900 border border-white/[0.06] rounded-lg p-6 shadow-2xl relative overflow-hidden group";
  const labelClass = "text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1 italic";
  const valueClass = "text-sm font-black text-white italic uppercase tracking-tight";

  return (
    <div className="max-w-6xl mx-auto pb-24 space-y-8">
      {/* ── Page Header ── */}
      <motion.div
        className={`${cardClass} p-8`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
             <button
               onClick={handleBack}
               className="w-12 h-12 bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 hover:border-emerald-500/30 transition-all group/back"
             >
               <ArrowLeft className="h-5 w-5 group-hover/back:-translate-x-1 transition-transform" />
             </button>
             <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-1.5 italic">Artist Profile Registry</p>
                <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase italic">
                  {displayName}
                </h1>
                <p className="text-xs font-bold text-zinc-500 mt-1 uppercase tracking-widest">
                  {displayEmail}
                </p>
             </div>
          </div>
          <div className="flex gap-3">
             <button
               onClick={handleEdit}
               className="px-6 py-3 bg-zinc-800 text-zinc-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded border border-black/5 dark:border-white/5 hover:bg-zinc-700 transition-all italic"
             >
               Modify Profile
             </button>
             <button
               onClick={handleViewAnalytics}
               className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded hover:bg-emerald-400 transition-all shadow-xl italic"
             >
               Intelligence Link
             </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Visual & Core Intel */}
        <div className="lg:col-span-4 space-y-8">
          <motion.div
            className={cardClass}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex flex-col items-center py-4">
              <div className="relative group mb-6">
                <div className="absolute -inset-1 bg-gradient-to-tr from-emerald-500 to-blue-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity" />
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={displayName}
                    className="relative w-48 h-48 rounded-full object-cover border-2 border-black/10 dark:border-white/10 p-1 bg-zinc-50 dark:bg-zinc-950"
                  />
                ) : (
                  <div className="relative w-48 h-48 rounded-full bg-zinc-50 dark:bg-zinc-950 border-2 border-black/10 dark:border-white/10 flex items-center justify-center">
                    <Users className="w-16 h-16 text-zinc-800" />
                  </div>
                )}
              </div>
              
              <div className="w-full space-y-6 pt-4 border-t border-black/5 dark:border-white/5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Registry Status</label>
                    <div className="mt-1">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest italic ${statusClass}`}>
                        {statusValue}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Joined Date</label>
                    <p className={valueClass}>{joinDate}</p>
                  </div>
                </div>
                
                <div>
                  <label className={labelClass}>Sonic Frequencies</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {genres.length > 0 ? genres.map((g, i) => (
                      <span key={i} className="px-2 py-0.5 bg-emerald-500/5 border border-emerald-500/20 rounded text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">
                        {g}
                      </span>
                    )) : <p className="text-zinc-600 text-[10px] font-bold">NO GENRE DATA</p>}
                  </div>
                </div>

                {canReviewArtist && (
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-black/5 dark:border-white/5">
                    <button
                      onClick={handleApprove}
                      className="w-full py-3 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded hover:bg-emerald-400 transition-all italic"
                    >
                      Authorize
                    </button>
                    <button
                      onClick={handleReject}
                      className="w-full py-3 bg-zinc-800 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded hover:bg-rose-500/10 transition-all italic border border-black/5 dark:border-white/5"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Discography & Contributions */}
        <div className="lg:col-span-8 space-y-8">
          {/* Albums Section */}
          <motion.div
            className={cardClass}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-blue-500/10 rounded flex items-center justify-center">
                    <Music className="h-4 w-4 text-blue-500" />
                 </div>
                 <h2 className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-widest italic">Album Repositories</h2>
              </div>
              {albumsLoading && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />}
            </div>

            {albumsError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-bold uppercase tracking-widest p-4 rounded mb-6 italic">
                PROTOCOL ERROR: {albumsError}
              </div>
            )}
            
            {!albumsLoading && !albumsError && albums.length === 0 && (
              <div className="py-12 text-center border border-dashed border-black/5 dark:border-white/5 rounded">
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">No album archives detected.</p>
              </div>
            )}
            
            {!albumsLoading && !albumsError && albums.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {albums.map((album) => (
                  <div key={album._id} className="bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-lg p-4 hover:border-emerald-500/30 transition-all group/album">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-zinc-900 border border-black/10 dark:border-white/10">
                        {(album.cover || (album as any).coverArt) ? (
                          <img
                            src={album.cover || (album as any).coverArt}
                            alt={album.title}
                            className="w-full h-full object-cover group-hover/album:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-800">
                             <Music2 className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate italic">{album.title}</h3>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                          RELEASE: {album.releaseDate ? new Date(album.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : '—'}
                        </p>
                        <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mt-0.5 italic">
                          SYNC: {Array.isArray(album.tracks) ? album.tracks.length : (album as any).trackCount ?? 0} UNITS
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Songs Section */}
          <motion.div
            className={cardClass}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
             <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-emerald-500/10 rounded flex items-center justify-center">
                    <Music2 className="h-4 w-4 text-emerald-500" />
                 </div>
                 <h2 className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-widest italic">Signal Transmission (Songs)</h2>
              </div>
              {songsLoading && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />}
            </div>

            {songsError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-bold uppercase tracking-widest p-4 rounded mb-6 italic">
                SIGNAL ERROR: {songsError}
              </div>
            )}

            {!songsLoading && !songsError && songs.length === 0 && (
              <div className="py-12 text-center border border-dashed border-black/5 dark:border-white/5 rounded">
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">No active signals detected.</p>
              </div>
            )}

            {!songsLoading && !songsError && songs.length > 0 && (
              <div className="space-y-3">
                {songs.map((song) => (
                  <div key={song._id} className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded p-4 hover:bg-white/[0.02] transition-all group/song">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-zinc-900 border border-black/10 dark:border-white/10">
                        {(song.coverArt || (song as any).cover) ? (
                          <img
                            src={song.coverArt || (song as any).cover}
                            alt={song.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-800">
                             <Music className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase italic tracking-tight truncate">{song.title}</h3>
                        <div className="flex items-center gap-3 mt-1.5">
                          <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">
                            {song.duration
                              ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}`
                              : (song as any).formattedDuration || '—'}
                          </p>
                          {song.splitSheet && song.splitSheet.length > 0 && (
                            <span className="flex items-center gap-1.5 text-[9px] font-black text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10 italic">
                              <Users className="w-2.5 h-2.5" />
                              {song.splitSheet.length} NODES
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic hidden sm:block">
                        {song.album ? `DEP: ${song.album}` : 'PROTOCOL: SINGLE'}
                      </span>
                      <button 
                        onClick={() => navigate(`/admin/song-management/${song._id}`)}
                        className="w-10 h-10 bg-zinc-900 border border-black/10 dark:border-white/10 rounded flex items-center justify-center text-zinc-600 hover:text-emerald-500 hover:border-emerald-500/30 transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
          
          {/* Contributions Section */}
          <motion.div
            className={cardClass}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-purple-500/10 rounded flex items-center justify-center">
                    <Users className="h-4 w-4 text-purple-500" />
                 </div>
                 <h2 className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-widest italic">Contribution Graph</h2>
              </div>
              {loadingContributions && <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping" />}
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-950/50 border border-black/5 dark:border-white/5 rounded p-1">
              <ContributionList contributions={contributions} loading={loadingContributions} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ArtistDetails;