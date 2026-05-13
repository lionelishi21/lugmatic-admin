import React, { useEffect } from 'react';
import {
  Music2, Headphones, DollarSign, TrendingUp, Clock, Users,
  Edit2, AlertCircle, ChevronRight, BarChart2, Radio,
  ArrowUpRight, Zap, Play, Upload as UploadIcon, Shield,
  Layers, Activity, Star, Target, Cpu, CheckCircle2,
  Swords, Award, Podcast, Gift, Film, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchArtistById, fetchArtistStats, fetchArtistSongs } from '../../store/slices/artistSlice';
import { fetchArtistEarnings } from '../../store/slices/financeSlice';
import { userService } from '../../services/userService';
import ContributionList from '../../components/artist/ContributionList';
import { Skeleton } from '../../components/ui/skeleton';

export default function ArtistDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { stats, songs, loading: artistLoading } = useSelector((state: RootState) => state.artist);
  const { earnings, loading: financeLoading } = useSelector((state: RootState) => state.finance);

  const [contributions, setContributions] = React.useState<any[]>([]);
  const [loadingContributions, setLoadingContributions] = React.useState(true);

  useEffect(() => {
    if (user?.artistId) {
      const artistId = String(user.artistId);
      dispatch(fetchArtistById(artistId));
      dispatch(fetchArtistStats(artistId));
      dispatch(fetchArtistSongs(artistId));
      dispatch(fetchArtistEarnings());
      fetchContributions();
    }
  }, [dispatch, user?.artistId]);

  const fetchContributions = async () => {
    try {
      setLoadingContributions(true);
      const res = await userService.getContributorDashboard();
      const fetchedSongs = res.data?.data?.songs || res.data?.songs || [];
      setContributions(fetchedSongs);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        console.error('Failed to fetch contributions:', err);
      }
    } finally {
      setLoadingContributions(false);
    }
  };

  const isLoading = artistLoading || financeLoading;

  const statCards = [
    { label: 'Musical Assets', value: stats?.totalTracks ?? 0, icon: Music2, color: 'indigo', trend: 'Total' },
    { label: 'Signal Listeners', value: (stats?.monthlyListeners ?? 0).toLocaleString(), icon: Headphones, color: 'emerald', trend: '+12.5%' },
    { label: 'Net Liquidity', value: `$${(earnings?.totalEarnings ?? 0).toLocaleString()}`, icon: DollarSign, color: 'amber', trend: 'Revenue' },
    { label: 'Fan Network', value: (stats?.socialMediaFollowers ?? 0).toLocaleString(), icon: Users, color: 'rose', trend: 'Growth' },
  ];

  const colorMap: Record<string, any> = {
    emerald: { bg: 'bg-emerald-500/5', icon: 'text-emerald-500', border: 'border-emerald-500/10' },
    indigo:  { bg: 'bg-indigo-500/5',  icon: 'text-indigo-500',  border: 'border-indigo-500/10' },
    amber:   { bg: 'bg-amber-500/5',   icon: 'text-amber-500',   border: 'border-amber-500/10' },
    rose:    { bg: 'bg-rose-500/5',    icon: 'text-rose-500',    border: 'border-rose-500/10' },
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Branded Executive Welcome */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="premium-card !p-12 relative overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.5)] border-emerald-500/5"
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/[0.03] blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/[0.02] blur-[80px] rounded-full pointer-events-none" />
        
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-12 z-10">
          <div className="flex items-center gap-10">
             <div className="w-24 h-24 bg-zinc-950 rounded-[2.5rem] flex items-center justify-center flex-shrink-0 border border-white/5 shadow-2xl group-hover:scale-105 transition-all duration-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
                <Shield className="h-10 w-10 text-emerald-500 relative z-10" />
             </div>
             <div>
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.4em] italic">Intelligence Protocol Active</h1>
                  <div className="h-px w-12 bg-emerald-500/20" />
                </div>
                <h2 className="text-5xl font-bold text-white tracking-tighter leading-none mb-4 italic uppercase">
                  Systems Online, {user?.name ?? 'Artist'}
                </h2>
                <p className="text-sm text-zinc-500 font-bold uppercase tracking-[0.2em] max-w-md leading-relaxed opacity-60">
                   Executing high-fidelity musical asset management and global telemetry sync.
                </p>
             </div>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/artist/upload')}
              className="h-16 px-12 bg-white text-black rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-4 group/btn border border-white/10"
            >
              <UploadIcon size={18} className="group-hover:-translate-y-1 transition-transform" />
              Publish Asset
            </button>
            <button
              onClick={() => navigate('/artist/live')}
              className="h-16 px-12 bg-emerald-500 text-black rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-emerald-400 hover:scale-105 transition-all shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-4 group/btn"
            >
              <Radio size={18} className="animate-pulse" />
              Live Stream
            </button>
          </div>
        </div>
      </motion.div>

      {/* Telemetry Matrix */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card_, i) => {
          const c = colorMap[card_.color];
          const Icon = card_.icon;
          return (
            <motion.div
              key={card_.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="premium-card group hover:border-emerald-500/20 transition-all cursor-default"
            >
              <div className="flex items-center justify-between mb-8">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${c.bg} border ${c.border} transition-all group-hover:scale-110 shadow-inner`}>
                  <Icon size={20} className={c.icon} />
                </div>
                <div className="text-[9px] font-bold px-2 py-1 rounded bg-black/40 border border-white/5 text-zinc-500 tracking-[0.2em] uppercase italic">
                  {card_.trend}
                </div>
              </div>
              <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5 italic">{card_.label}</p>
              {isLoading ? (
                <Skeleton className="h-8 w-24 bg-white/5 rounded-lg" />
              ) : (
                <p className="text-3xl font-bold text-white italic tracking-tighter tabular-nums leading-none group-hover:text-emerald-400 transition-colors">
                  {card_.value}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Primary Operation Bays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Asset Discography Bay */}
        <div className="premium-card !p-0 overflow-hidden flex flex-col border-white/5 shadow-2xl">
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-950/50">
            <div>
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1">Asset Discography Registry</h3>
              <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest">High-priority musical transmissions</p>
            </div>
            <button
              onClick={() => navigate('/artist/songs')}
              className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-widest transition-all flex items-center gap-2 italic"
            >
              View Full Catalog <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="p-6 space-y-4 flex-1">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-5 p-5 bg-white/[0.01] rounded-2xl border border-white/5">
                  <Skeleton className="w-16 h-16 rounded-xl bg-white/5" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-48 bg-white/5" />
                    <Skeleton className="h-3 w-24 bg-white/5" />
                  </div>
                </div>
              ))
            ) : songs && songs.length > 0 ? (
              songs.slice(0, 5).map((track: any) => (
                <div key={track._id} className="flex items-center justify-between p-5 hover:bg-emerald-500/[0.02] rounded-2xl border border-transparent hover:border-emerald-500/20 transition-all group cursor-pointer">
                  <div className="flex items-center gap-5 min-w-0">
                    <div className="relative flex-shrink-0 group-hover:scale-105 transition-all duration-700">
                      <img
                        src={track.coverArtUrl || track.coverArt || '/default-track-cover.jpg'}
                        alt={track.name || track.title}
                        className="w-16 h-16 rounded-xl object-cover border border-white/5 bg-zinc-950 shadow-2xl"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/default-track-cover.jpg'; }}
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center rounded-xl backdrop-blur-[2px]">
                        <Play size={24} className="text-white fill-current" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white uppercase tracking-tight truncate italic group-hover:text-emerald-400 transition-colors">
                        {track.name || track.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                          <Activity size={12} className="text-emerald-500" />
                          <span className="text-[10px] text-emerald-500 font-bold tabular-nums">{(track.playCount ?? track.plays ?? 0).toLocaleString()}</span>
                        </div>
                        <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest italic">Signal Pulses</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <span className={`text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-lg border italic shadow-xl ${
                      track.status === 'approved' 
                        ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20' 
                        : 'bg-amber-500/5 text-amber-500 border-amber-500/20'
                    }`}>
                      {track.status || 'Pending'}
                    </span>
                    <button
                      onClick={() => navigate(`/artist/songs/${track._id}/analytics`)}
                      className="w-12 h-12 flex items-center justify-center bg-[#0a0a0a] text-zinc-600 hover:text-emerald-500 hover:bg-emerald-500/5 rounded-2xl transition-all border border-white/5 hover:border-emerald-500/20 shadow-xl"
                    >
                      <ArrowUpRight size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-24 text-center">
                <div className="w-20 h-20 bg-zinc-950 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/5 shadow-2xl group cursor-default">
                  <Music2 size={32} className="text-zinc-800 group-hover:text-emerald-500 transition-colors" />
                </div>
                <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.3em] mb-2 italic">Registry Empty</h4>
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold opacity-60">Publish your first musical asset to initiate tracking.</p>
              </div>
            )}
          </div>
          <div className="p-6 bg-[#0a0a0a] border-t border-white/5 text-center">
             <button className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest hover:text-white transition-all">Audit Full Neural Discography</button>
          </div>
        </div>

        {/* Operational Telemetry Bay */}
        <div className="premium-card !p-0 overflow-hidden flex flex-col border-white/5 shadow-2xl">
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-950/50">
            <div>
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1">Operational Telemetry Log</h3>
              <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest">Real-time fiscal and system events</p>
            </div>
            <button
              onClick={() => navigate('/artist/earnings')}
              className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-widest transition-all italic flex items-center gap-2"
            >
              Fiscal Archive <ChevronRight size={14} />
            </button>
          </div>

          <div className="p-6 space-y-4 flex-1">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-5 p-5 bg-white/[0.01] rounded-2xl border border-white/5">
                  <Skeleton className="w-16 h-16 rounded-xl bg-white/5" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-56 bg-white/5" />
                    <Skeleton className="h-3 w-32 bg-white/5" />
                  </div>
                </div>
              ))
            ) : earnings?.history && earnings.history.length > 0 ? (
              earnings.history.slice(0, 5).map((activity: any) => (
                <div key={activity._id} className="flex items-center gap-5 p-5 hover:bg-white/[0.02] rounded-2xl border border-transparent hover:border-white/10 transition-all group cursor-pointer relative overflow-hidden">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/5 shadow-inner transition-transform group-hover:scale-105 ${
                    activity.type === 'gift_received'
                      ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10'
                      : 'bg-indigo-500/5 text-indigo-500 border-indigo-500/10'
                  }`}>
                    {activity.type === 'gift_received'
                      ? <DollarSign size={24} />
                      : <Music2 size={24} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors uppercase tracking-tight truncate italic leading-none mb-2">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-2">
                          <Clock size={12} className="text-zinc-700" />
                          <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest italic">{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true }).toUpperCase()}</span>
                       </div>
                       <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                       <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 italic">LOGGED</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white italic tracking-tighter tabular-nums group-hover:text-emerald-400 transition-colors">
                       ${(activity.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-24 text-center">
                <div className="w-20 h-20 bg-zinc-950 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/5 shadow-2xl group cursor-default">
                  <Zap size={32} className="text-zinc-800 group-hover:text-emerald-500 transition-colors" />
                </div>
                <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.3em] mb-2 italic">Neural Stream Empty</h4>
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold opacity-60">System telemetry will initiate upon first engagement.</p>
              </div>
            )}
          </div>
          <div className="p-6 bg-[#0a0a0a] border-t border-white/5 text-center">
             <button className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest hover:text-white transition-all">Intercept Neural Activity Logs</button>
          </div>
        </div>
      </div>

      {/* Tertiary Ecosystem Layers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Collaboration Protocol Bay */}
        <div className="premium-card !p-0 overflow-hidden flex flex-col border-white/5">
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-950/50">
             <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-xl">
                   <Layers size={18} className="text-indigo-500" />
                </div>
                <div>
                   <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1">Collaboration Protocols</h3>
                   <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest">Semantic splits and shared asset revenue</p>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                  SYNCED
                </div>
             </div>
          </div>
          <div className="p-10">
            <ContributionList contributions={contributions} loading={loadingContributions} />
          </div>
        </div>

        {/* Fiscal Intelligence Bay */}
        <div className="premium-card !p-0 overflow-hidden flex flex-col border-white/5 shadow-2xl">
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-950/50">
             <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-xl">
                   <TrendingUp size={18} className="text-emerald-500" />
                </div>
                <div>
                   <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1">Fiscal Intelligence HUD</h3>
                   <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest">Liquidity projections and yield analysis</p>
                </div>
             </div>
             <button
               onClick={() => navigate('/artist/earnings')}
               className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-widest transition-all italic"
             >
               Full Ledger
             </button>
          </div>
          <div className="p-10 grid grid-cols-2 gap-8">
            {[
              { label: 'CUMULATIVE YIELD', value: `$${(earnings?.totalEarnings ?? 0).toLocaleString()}`, icon: Wallet, color: 'emerald' },
              { label: 'MONTHLY VELOCITY', value: `$${(earnings?.monthlyEarnings ?? 0).toLocaleString()}`, icon: Zap, color: 'indigo' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="p-8 bg-zinc-950/50 rounded-[2rem] border border-white/5 group hover:border-emerald-500/20 transition-all relative overflow-hidden shadow-inner">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-bl-full pointer-events-none" />
                <div className={`w-12 h-12 rounded-2xl ${colorMap[color].bg} border ${colorMap[color].border} mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                   <Icon size={20} className={colorMap[color].icon} />
                </div>
                <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-[0.2em] mb-2 italic">{label}</p>
                {isLoading ? (
                  <Skeleton className="h-10 w-28 bg-white/5 rounded-lg mt-2" />
                ) : (
                  <p className="text-4xl font-bold text-white italic tracking-tighter tabular-nums group-hover:text-emerald-400 transition-colors leading-none">{value}</p>
                )}
              </div>
            ))}
          </div>
          <div className="p-8 mt-auto">
             <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-emerald-500/10 transition-all">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <CreditCard size={20} className="text-black" />
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-white uppercase tracking-widest">Liquidity Transfer Protocol</p>
                      <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Initiate Payout to Registered Nodes</p>
                   </div>
                </div>
                <ChevronRight size={18} className="text-emerald-500 group-hover:translate-x-1 transition-transform" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Internal Wallet icon since it wasn't imported from lucide-react in the top block
const Wallet = ({ size, className }: { size: number, className: string }) => <TrendingUp size={size} className={className} />;
const CreditCard = ({ size, className }: { size: number, className: string }) => <DollarSign size={size} className={className} />;
