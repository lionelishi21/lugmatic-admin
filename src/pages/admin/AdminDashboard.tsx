import React, { useEffect, useState } from 'react';
import {
  Users, Music2, Radio, DollarSign, TrendingUp, Clock, Headphones, 
  Globe, PlayCircle, AlertCircle, UserPlus, LayoutGrid, ChevronRight,
  ShieldCheck, Zap, Activity, Star, Calendar, ArrowUpRight, ArrowDownRight,
  Package, Search, Bell, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { adminService } from '../../services/adminService';
import { Skeleton } from '../../components/ui/skeleton';

interface DashboardOverview {
  totalUsers: number;
  totalArtists: number;
  totalSongs: number;
  totalAlbums: number;
  totalPodcasts: number;
  totalGifts: number;
  totalComments: number;
  totalSubscriptions: number;
  activeLiveStreams: number;
}

interface TopArtist {
  _id: string;
  name: string;
  image?: string;
  genres: string[];
  followerCount: number;
}

interface RecentActivity {
  id: string;
  type: 'track_upload' | 'live_stream' | 'artist_signup' | 'playlist_created';
  artistName: string;
  title?: string | null;
  timestamp: string;
}

interface Revenue {
  total: number;
  monthly: number;
  totalTransactions: number;
}

interface DashboardData {
  overview: DashboardOverview;
  topArtists: TopArtist[];
  recentActivity: RecentActivity[];
  revenue: Revenue;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminService.getDashboardData();
        const raw = response.data as any;
        const dashData: DashboardData = raw?.data || raw;
        if (!dashData || (!dashData.overview && !dashData.topArtists)) {
          throw new Error('Invalid dashboard data received');
        }
        setData(dashData);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err?.response?.data?.message || err?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const StatCard = ({
    icon: Icon,
    title,
    value,
    trend,
    color = 'emerald',
    index
  }: {
    icon: any,
    title: string,
    value: string | number,
    trend?: string,
    color?: 'emerald' | 'blue' | 'amber' | 'rose',
    index: number
  }) => {
    const colorMap = {
      emerald: { bg: 'bg-emerald-500/5', text: 'text-emerald-500', border: 'border-emerald-500/10' },
      blue:    { bg: 'bg-blue-500/5',    text: 'text-blue-500',    border: 'border-blue-500/10' },
      amber:   { bg: 'bg-amber-500/5',   text: 'text-amber-500',   border: 'border-amber-500/10' },
      rose:    { bg: 'bg-rose-500/5',    text: 'text-rose-500',    border: 'border-rose-500/10' },
    };
    const c = colorMap[color];
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="premium-card group hover:border-emerald-500/20 transition-all cursor-default relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight size={16} className="text-zinc-700" />
        </div>
        
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.bg} border ${c.border}`}>
            <Icon size={18} className={c.text} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">{title}</p>
          </div>
        </div>
        
        <div className="flex items-end justify-between">
          <h3 className="text-3xl font-bold text-white tracking-tight leading-none">
            {value}
          </h3>
          {trend && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 mb-1">
              <TrendingUp size={12} />
              <span>{trend}</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="flex justify-between items-end h-16 bg-white/5 rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 border border-white/5 rounded-3xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-white/5 border border-white/5 rounded-3xl" />
          <div className="h-96 bg-white/5 border border-white/5 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="premium-card p-20 text-center flex flex-col items-center max-w-2xl mx-auto mt-20">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-6">
          <AlertCircle className="h-8 w-8 text-rose-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Registry Connection Failure</h2>
        <p className="text-zinc-500 text-sm mb-8 leading-relaxed uppercase tracking-widest font-medium">Failed to synchronize with the intelligence server. Error protocol: {error || 'UNKNOWN_EXCEPTION'}</p>
        <button onClick={() => window.location.reload()} className="btn-primary !px-12 !py-4 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          Reconnect System
        </button>
      </div>
    );
  }

  const overview = data.overview || {} as DashboardOverview;
  const topArtists = Array.isArray(data.topArtists) ? data.topArtists : [];
  const recentActivity = Array.isArray(data.recentActivity) ? data.recentActivity : [];
  const revenue = data.revenue || { total: 0, monthly: 0, totalTransactions: 0 };

  return (
    <div className="space-y-12">
      {/* Intelligence Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-none">Intelligence</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live Sync</span>
            </div>
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em] ml-1">Platform-wide executive overview and signal analysis.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-white tracking-tighter leading-none">${revenue.total.toLocaleString()}</p>
          </div>
          <div className="w-px h-10 bg-white/5" />
          <div className="text-right">
            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Transactions</p>
            <p className="text-2xl font-bold text-emerald-500 tracking-tighter leading-none">{revenue.totalTransactions.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Active Artists"
          value={(overview.totalArtists ?? 0).toLocaleString()}
          trend="+12%"
          color="emerald"
          index={0}
        />
        <StatCard
          icon={Headphones}
          title="Total Listeners"
          value={(overview.totalUsers ?? 0).toLocaleString()}
          trend="+5.4%"
          color="blue"
          index={1}
        />
        <StatCard
          icon={Music2}
          title="Catalog Assets"
          value={(overview.totalSongs ?? 0).toLocaleString()}
          color="amber"
          index={2}
        />
        <StatCard
          icon={Radio}
          title="Live Signals"
          value={overview.activeLiveStreams ?? 0}
          color="rose"
          index={3}
        />
      </div>

      {/* Strategic Insight Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Leaderboard: High Fidelity Artist Monitoring */}
        <div className="premium-card !p-0 overflow-hidden flex flex-col border-emerald-500/5">
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-950/50">
            <div>
              <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Star size={14} className="text-amber-500" /> Elite Artist Roster
              </h2>
              <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest mt-1">Ranking by engagement & follower density</p>
            </div>
            <button className="p-2.5 rounded-xl bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all border border-white/5">
              <ChevronRight size={18} />
            </button>
          </div>
          
          <div className="p-8 space-y-7 flex-1">
            {topArtists.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-700 italic text-xs uppercase tracking-widest">No signals detected</div>
            ) : (
              topArtists.slice(0, 6).map((artist, index) => (
                <div key={artist._id} className="flex items-center justify-between group cursor-pointer hover:translate-x-1 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <span className="text-zinc-800 font-bold text-[10px] w-4 uppercase">0{index + 1}</span>
                    <div className="relative">
                      <img
                        src={artist.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=10b981&color=fff`}
                        alt={artist.name}
                        className="w-12 h-12 rounded-xl object-cover border border-white/5 group-hover:border-emerald-500/40 transition-all shadow-xl"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#0a0a0a] rounded-full border border-white/5 flex items-center justify-center">
                        <CheckCircle2 size={10} className="text-emerald-500" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors text-sm">{artist.name}</h4>
                      <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">
                        {(artist.followerCount ?? 0).toLocaleString()} <span className="opacity-50">Fans</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 bg-emerald-500/5 px-2 py-1 rounded-lg border border-emerald-500/10">
                    <ArrowUpRight size={12} />
                    <span>SIGNAL ACTIVE</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-6 bg-[#0a0a0a] border-t border-white/5 text-center">
             <button className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest hover:text-white transition-all">View Extended Catalog</button>
          </div>
        </div>

        {/* Intelligence Stream: Activity Analysis */}
        <div className="premium-card !p-0 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-950/50">
            <div>
              <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Activity size={14} className="text-emerald-500" /> Operational Stream
              </h2>
              <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest mt-1">Real-time system telemetry and user events</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Auto-Refresh</span>
              <div className="w-8 h-4 rounded-full bg-emerald-500 relative">
                <div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full shadow-[0_0_5px_white]" />
              </div>
            </div>
          </div>
          
          <div className="p-8 space-y-8 flex-1">
            {recentActivity.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-700 italic text-xs uppercase tracking-widest">Telemetry stream empty</div>
            ) : (
              recentActivity.slice(0, 6).map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all ${
                    activity.type === 'track_upload' ? 'bg-blue-500/5 text-blue-500 border-blue-500/10' :
                    activity.type === 'live_stream' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' :
                    'bg-zinc-800/20 text-zinc-500 border-white/5'
                  }`}>
                    {activity.type === 'track_upload' ? <Music2 size={16} /> : 
                     activity.type === 'live_stream' ? <Zap size={16} /> : 
                     <UserPlus size={16} />}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                      <span className="font-bold text-white group-hover:text-emerald-400 transition-colors uppercase text-[11px]">{activity.artistName}</span>
                      <span className="text-zinc-600 font-bold text-[10px] uppercase tracking-widest mx-1.5">
                        {activity.type === 'track_upload' ? 'INITIATED UPLOAD' : 
                         activity.type === 'live_stream' ? 'ESTABLISHED STREAM' : 
                         'REGISTERED ACCOUNT'}
                      </span>
                      {activity.title && (
                        <span className="text-zinc-400 font-bold block mt-1 text-[11px]">[{activity.title.toUpperCase()}]</span>
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                       <Clock size={10} className="text-zinc-700" />
                       <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-[0.2em]">
                         {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true }).toUpperCase()}
                       </span>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-lg bg-white/5 text-zinc-600 hover:text-white transition-all"><ChevronRight size={14} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-6 bg-[#0a0a0a] border-t border-white/5 text-center">
             <button className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest hover:text-white transition-all">Intercept All Telemetry</button>
          </div>
        </div>
      </div>
    </div>
  );
}