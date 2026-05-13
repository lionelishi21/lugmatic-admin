import React, { useState, useEffect, useMemo } from 'react';
import { 
  Swords, Trophy, Users, Search, TrendingUp, Clock,
  ExternalLink, Filter, ChevronRight, Calendar, Zap,
  MoreVertical, ShieldCheck, RefreshCw, Star
} from 'lucide-react';
import clashService, { ClashRanking, ClashResponse } from '../../services/clashService';
import { getFullImageUrl } from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const ClashManagement: React.FC = () => {
  const [rankings, setRankings] = useState<ClashRanking[]>([]);
  const [upcoming, setUpcoming] = useState<ClashResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'rankings' | 'scheduled'>('scheduled');

  useEffect(() => {
    loadRankings();
    loadUpcoming();
  }, [period]);

  const loadUpcoming = async () => {
    try {
      setLoadingUpcoming(true);
      const data = await clashService.getUpcomingClashes();
      setUpcoming(data);
    } catch (error: any) {
      console.error('Failed to load upcoming clashes:', error);
    } finally {
      setLoadingUpcoming(false);
    }
  };

  const loadRankings = async () => {
    try {
      setLoading(true);
      const data = await clashService.getRankings(period);
      setRankings(data);
    } catch (error: any) {
      toast.error('Failed to load clash rankings');
    } finally {
      setLoading(false);
    }
  };

  const filteredRankings = useMemo(() => {
    if (!searchQuery.trim()) return rankings;
    return rankings.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [rankings, searchQuery]);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <Swords className="text-indigo-500" size={32} />
            Clashes
          </h1>
          <p className="text-zinc-500">Monitor real-time competitions, lyrical wars, and leaderboards.</p>
        </div>
        <button onClick={loadUpcoming} className="btn-secondary flex items-center gap-2 !py-2">
          <RefreshCw size={16} className={loadingUpcoming ? 'animate-spin' : ''} />
          Sync Data
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Upcoming Battles', value: upcoming.length, icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-500/5' },
          { label: 'Live Deployments', value: upcoming.filter(c => c.status === 'active').length, icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
          { label: 'Active Gladiators', value: rankings.length, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/5' },
        ].map(s => (
          <div key={s.label} className="premium-card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 ${s.bg}`}>
              <s.icon size={20} className={s.color} />
            </div>
            <p className="text-zinc-500 text-xs font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-white tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-1 flex items-center gap-1 w-fit">
        {[
          { id: 'scheduled', label: 'Schedule', icon: Clock },
          { id: 'rankings', label: 'Leaderboard', icon: Trophy }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === tab.id ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {activeTab === 'scheduled' ? (
            <div className="premium-card !p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-6 py-5 text-xs font-semibold text-zinc-500 uppercase">Matchup</th>
                      <th className="px-6 py-5 text-xs font-semibold text-zinc-500 uppercase">Opponents</th>
                      <th className="px-6 py-5 text-xs font-semibold text-zinc-500 uppercase">Engagement</th>
                      <th className="px-6 py-5 text-xs font-semibold text-zinc-500 uppercase text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loadingUpcoming ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-24 text-center">
                          <Loader loading text="Scanning schedule..." />
                        </td>
                      </tr>
                    ) : upcoming.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-24 text-center">
                          <Swords className="h-10 w-10 text-zinc-800 mx-auto mb-4" />
                          <p className="text-zinc-500">No upcoming battles detected.</p>
                        </td>
                      </tr>
                    ) : (
                      upcoming.map((clash) => (
                        <tr key={clash._id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{clash.title}</p>
                              <p className="text-[11px] text-zinc-500 mt-0.5">
                                {clash.scheduledAt ? format(new Date(clash.scheduledAt), 'MMM dd, yyyy • hh:mm a') : 'TBD'}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex -space-x-3">
                                <img src={getFullImageUrl(clash.challenger.image)} className="w-8 h-8 rounded-full border-2 border-zinc-900 object-cover" />
                                <img src={getFullImageUrl(clash.opponent.image)} className="w-8 h-8 rounded-full border-2 border-zinc-900 object-cover" />
                              </div>
                              <span className="text-xs font-medium text-zinc-400">
                                {clash.challenger.name} <span className="text-zinc-600 px-1">VS</span> {clash.opponent.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
                              <Users size={14} className="text-indigo-500" />
                              {clash.rsvpCount || 0} RSVPs
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                              clash.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                            }`}>
                              {clash.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search gladiator..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field pl-11"
                  />
                </div>
                <div className="flex bg-[#0a0a0a] border border-white/5 rounded-2xl p-1 gap-1">
                  {(['daily', 'weekly', 'monthly'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                        period === p ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="premium-card !p-0 overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-6 py-5 text-xs font-semibold text-zinc-500 uppercase">Rank</th>
                      <th className="px-6 py-5 text-xs font-semibold text-zinc-500 uppercase">Gladiator</th>
                      <th className="px-6 py-5 text-xs font-semibold text-zinc-500 uppercase">Battle Points</th>
                      <th className="px-6 py-5 text-xs font-semibold text-zinc-500 uppercase">Record</th>
                      <th className="px-6 py-5 text-xs font-semibold text-zinc-500 uppercase text-right">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-24 text-center">
                          <Loader loading text="Fetching rankings..." />
                        </td>
                      </tr>
                    ) : filteredRankings.map((rank, index) => (
                      <tr key={rank._id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            index === 0 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' :
                            index === 1 ? 'bg-zinc-400/10 text-zinc-400 border border-white/10' :
                            index === 2 ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                            'text-zinc-600'
                          }`}>
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img src={getFullImageUrl(rank.image)} className="w-9 h-9 rounded-full object-cover border border-white/5" />
                            <span className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{rank.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white tracking-tight">{rank.totalScore.toLocaleString()}</span>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Points</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-zinc-500">
                          {rank.clashCount} Total Battles
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all">
                            <ChevronRight size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const Loader = ({ loading, text }: { loading: boolean; text: string }) => (
  <div className="flex flex-col items-center gap-3">
    <RefreshCw className={`h-6 w-6 text-indigo-500 ${loading ? 'animate-spin' : ''}`} />
    <p className="text-xs font-medium text-zinc-500">{text}</p>
  </div>
);

export default ClashManagement;
