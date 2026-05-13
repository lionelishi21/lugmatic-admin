import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Preloader from '../../components/ui/Preloader';
import { toast } from 'react-hot-toast';
import songService, { Song } from '../../services/songService';
import albumService, { Album } from '../../services/albumService';
import artistService, { Artist } from '../../services/artistService';
import genreService, { Genre } from '../../services/genreService';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { 
  Plus, Music2, Search, Trash2, Eye, CheckCircle2, 
  Disc, User, Clock, BarChart3, MoreVertical, ShieldCheck,
  AlertCircle, ChevronRight, Filter, Target, Activity, Globe,
  Cpu, ArrowUpRight, Layers, Database, Save, HardDrive, Info,
  Music, Zap, SlidersHorizontal, ChevronDown
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { motion, AnimatePresence } from 'framer-motion';

const SongManagement: React.FC = () => {
  const navigate = useNavigate();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [songToDelete, setSongToDelete] = useState<string | null>(null);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [songsData, artistsData, albumsData, genresData] = await Promise.all([
        songService.getAllSongs(),
        artistService.getAllArtists(),
        albumService.getAllAlbums(),
        genreService.getAllGenres()
      ]);
      setSongs(songsData);
      setArtists(artistsData);
      setAlbums(albumsData);
      setGenres(genresData);
    } catch (err: any) {
      toast.error('Failed to load catalog data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (songId: string) => {
    const loadingId = toast.loading('Executing approval protocol...');
    try {
      await adminService.moderateContent('songs', songId, 'approve');
      toast.success('Track induction approved', { id: loadingId });
      setSongs(prev => prev.map(s => s._id === songId ? { ...s, isApproved: true } : s));
    } catch (err: any) {
      toast.error('Approval failed', { id: loadingId });
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredSongs = songs.filter((song) => {
    const q = searchTerm.toLowerCase();
    const nameMatch = song.name.toLowerCase().includes(q);
    const artistName = typeof song.artist === 'string' ? '' : (song.artist as any)?.name || '';
    const albumName = typeof song.album === 'string' ? '' : (song.album as any)?.name || '';
    return nameMatch || artistName.toLowerCase().includes(q) || albumName.toLowerCase().includes(q);
  });

  if (loading && songs.length === 0) return <Preloader isVisible={true} text="Auditing audio tracks..." />;

  return (
    <div className="space-y-12 pb-24">
      {/* Cinematic Identity Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-none italic uppercase">Artifact Registry</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest italic">Matrix: Active</span>
            </div>
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em] ml-1 italic">Auditing global sonic artifacts, linguistic nodes, and spectral metadata.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/song-management/add')} 
          className="h-16 px-10 bg-white text-black rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-4 group border border-white/10"
        >
          <Plus size={18} />
          Register Artifact
        </button>
      </div>

      {/* Intelligence Telemetry HUD */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="relative w-full lg:max-w-xl group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 h-5 w-5 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="SCAN ARTIFACT REGISTRY..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-12 h-14 bg-zinc-950/40 border border-white/5 rounded-2xl text-white text-[10px] font-bold tracking-[0.2em] uppercase focus:outline-none focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-inner placeholder:text-zinc-800 italic"
          />
        </div>
        <div className="flex items-center gap-6">
           <div className="px-5 py-3 bg-zinc-950/40 border border-white/5 rounded-2xl shadow-inner flex items-center gap-4">
              <Activity size={14} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic leading-none">Scanning <span className="text-white">{filteredSongs.length}</span> Results</span>
           </div>
           <div className="flex bg-zinc-950/40 border border-white/5 rounded-2xl p-1.5 gap-1.5 shadow-inner">
              <button className="px-5 py-2.5 rounded-xl text-[9px] font-bold text-white bg-white/10 border border-white/5 shadow-xl uppercase tracking-widest">Global Archive</button>
              <button className="px-5 py-2.5 rounded-xl text-[9px] font-bold text-zinc-600 hover:text-zinc-300 transition-all uppercase tracking-widest">Priority Nodes</button>
           </div>
        </div>
      </div>

      {/* Registry Matrix */}
      <div className="premium-card !p-0 overflow-hidden border-white/5 shadow-2xl bg-[#0a0a0a]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-zinc-950/50">
                <th className="px-10 py-8 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] italic">Sonic Artifact</th>
                <th className="px-10 py-8 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] italic">Entity Association</th>
                <th className="px-10 py-8 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] italic">Linguistic Specs</th>
                <th className="px-10 py-8 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] italic">Engagement Telemetry</th>
                <th className="px-10 py-8 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] italic text-right">Action Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSongs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-40 text-center">
                    <div className="w-24 h-24 bg-zinc-950 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-white/5 shadow-2xl group cursor-default">
                      <Music2 size={36} className="text-zinc-800 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.3em] mb-3 italic">Scan Result: NULL_ARTIFACTS</h3>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.15em] max-w-sm mx-auto opacity-60">Adjust scan parameters or register a new sonic node to the registry.</p>
                  </td>
                </tr>
              ) : (
                filteredSongs.map((song, i) => (
                  <motion.tr 
                    key={song._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-emerald-500/[0.01] transition-all group"
                  >
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-white/5 overflow-hidden flex items-center justify-center shadow-inner relative group-hover:scale-110 transition-all duration-500">
                          <img
                            src={song.coverArtUrl || song.coverArt || '/assets/images/lugmaticIcon.png'}
                            alt={song.name}
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/assets/images/lugmaticIcon.png'; }}
                          />
                          <div className="absolute inset-0 bg-black/20" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white uppercase tracking-tight italic group-hover:text-emerald-400 transition-colors leading-none mb-2">{song.name}</p>
                          {!song.isApproved && (
                            <div className="flex items-center gap-2 bg-amber-500/5 px-2 py-1 rounded-lg border border-amber-500/10 w-fit">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-pulse" />
                              <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest italic">Pending Protocol</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                           <User size={12} className="text-zinc-700" />
                           <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic leading-none">{typeof song.artist === 'string' ? 'UNKNOWN_ENTITY' : (song.artist as any)?.name.toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Disc size={12} className="text-zinc-700" />
                           <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest italic leading-none">
                             {song.album ? (typeof song.album === 'string' ? 'STANDALONE_NODE' : (song.album as any)?.name.toUpperCase()) : 'STANDALONE_NODE'}
                           </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-zinc-500">
                           <Clock size={12} className="text-zinc-700" />
                           <span className="text-[10px] font-bold tabular-nums italic">{formatDuration(song.duration)} <span className="opacity-40 ml-1 tracking-widest">CYCLE</span></span>
                        </div>
                        <div className="px-2 py-1 bg-zinc-950 border border-white/5 rounded-lg w-fit">
                           <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic">
                             {typeof song.genre === 'string' ? 'GENRE_MIX' : (song.genre as any)?.name.toUpperCase() || 'GENRE_MIX'}
                           </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-emerald-500/5 rounded-xl flex items-center justify-center border border-emerald-500/10 shadow-inner">
                            <Zap size={16} className="text-emerald-500" />
                         </div>
                         <div className="flex flex-col">
                            <span className="text-lg font-bold text-white tracking-tighter italic tabular-nums leading-none">{(song.playCount || 0).toLocaleString()}</span>
                            <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest italic mt-1">Impact Units</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        {!song.isApproved && (
                          <button 
                            onClick={() => handleApprove(song._id)} 
                            className="w-12 h-12 rounded-2xl flex items-center justify-center bg-zinc-950 border border-white/5 text-emerald-500/60 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all shadow-inner" 
                            title="Execute Induction"
                          >
                            <ShieldCheck size={20} />
                          </button>
                        )}
                        <button 
                          onClick={() => navigate(`/admin/song-management/${song._id}`)} 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center bg-zinc-950 border border-white/5 text-zinc-600 hover:text-white hover:bg-white/5 transition-all shadow-inner" 
                          title="Review Node"
                        >
                          <Eye size={20} />
                        </button>
                        <button 
                          onClick={() => setSongToDelete(song._id)} 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center bg-zinc-950 border border-white/5 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all shadow-inner" 
                          title="Terminate Node"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Console */}
      <ConfirmDialog
        isOpen={!!songToDelete}
        title="Terminate Artifact Node?"
        message="This will permanently purge the sonic artifact from all registry nodes and matrices. Irreversible."
        confirmLabel="Execute Purge"
        onConfirm={async () => {
          if (!songToDelete) return;
          const loadingId = toast.loading('Executing purge protocol...');
          try {
            await songService.deleteSong(songToDelete);
            toast.success('Artifact purged from registry', { id: loadingId });
            fetchData();
          } catch { toast.error('Purge failure', { id: loadingId }); }
          finally { setSongToDelete(null); }
        }}
        onCancel={() => setSongToDelete(null)}
      />
    </div>
  );
};

export default SongManagement;
