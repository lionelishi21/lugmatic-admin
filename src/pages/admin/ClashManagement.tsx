import React, { useState, useEffect, useMemo } from 'react';
import { 
  Swords, 
  Trophy, 
  Users, 
  Search, 
  TrendingUp, 
  Clock,
  ExternalLink
} from 'lucide-react';
import clashService, { ClashRanking, ClashResponse } from '../../services/clashService';
import { getFullImageUrl } from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRankings = useMemo(() => {
    if (!searchQuery.trim()) return rankings;
    return rankings.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [rankings, searchQuery]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Swords className="w-7 h-7 text-purple-600" />
            Live Clash & Battle Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor real-time competitions, rankings, and "Lyrical War" history
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Upcoming Battles', value: upcoming.length.toString(), icon: Clock, color: 'blue' },
          { label: 'Live Clashes', value: upcoming.filter(c => c.status === 'active').length.toString(), icon: Swords, color: 'red' },
          { label: 'Participating Artists', value: rankings.length.toString(), icon: Users, color: 'purple' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-${stat.color}-50 flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-gray-100 px-2 gap-8">
        <button
          onClick={() => setActiveTab('scheduled')}
          className={`pb-4 text-sm font-semibold transition-all relative ${
            activeTab === 'scheduled' ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Scheduled Clashes
          {activeTab === 'scheduled' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('rankings')}
          className={`pb-4 text-sm font-semibold transition-all relative ${
            activeTab === 'rankings' ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Leaderboards
          {activeTab === 'rankings' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-full" />
          )}
        </button>
      </div>

      {activeTab === 'rankings' ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-300">
        <div className="p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-gray-900">Battle Leaderboards</h2>
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {(['daily', 'weekly', 'monthly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  period === p ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-b border-gray-50 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider bg-gray-50/30">
                <th className="px-6 py-4 font-semibold">Rank</th>
                <th className="px-6 py-4 font-semibold">Artist</th>
                <th className="px-6 py-4 font-semibold">Battle Points</th>
                <th className="px-6 py-4 font-semibold">Wins/Total</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto mb-2" />
                    Loading rankings...
                  </td>
                </tr>
              ) : filteredRankings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No rankings found for this period.
                  </td>
                </tr>
              ) : (
                filteredRankings.map((rank, index) => (
                  <tr key={rank._id} className="hover:bg-purple-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                        index === 1 ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                        index === 2 ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                        'text-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={getFullImageUrl(rank.image)} 
                          alt={rank.name} 
                          className="w-10 h-10 rounded-full object-cover border border-gray-100"
                          onError={(e) => (e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + rank.name)}
                        />
                        <span className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {rank.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-purple-600">
                          {rank.totalScore.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-gray-400">PTS</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {rank.clashCount} Battles
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <h2 className="font-bold text-gray-900">Scheduled Battles</h2>
            </div>
            <button 
              onClick={loadUpcoming}
              className="px-3 py-1 text-xs font-semibold text-purple-600 hover:bg-purple-50 rounded-lg transition-colors border border-purple-100"
            >
              Refresh Schedule
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider bg-gray-50/30">
                  <th className="px-6 py-4 font-semibold">Title / Date</th>
                  <th className="px-6 py-4 font-semibold">Challenger</th>
                  <th className="px-6 py-4 font-semibold">Opponent</th>
                  <th className="px-6 py-4 font-semibold">RSVPs</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loadingUpcoming ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto mb-2" />
                      Loading schedule...
                    </td>
                  </tr>
                ) : upcoming.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      No upcoming scheduled clashes found.
                    </td>
                  </tr>
                ) : (
                  upcoming.map((clash) => (
                    <tr key={clash._id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{clash.title}</span>
                          <span className="text-xs text-gray-500 truncate max-w-[200px]">
                            {clash.scheduledAt ? format(new Date(clash.scheduledAt), 'MMM dd, yyyy • hh:mm a') : 'Unscheduled'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <img 
                            src={getFullImageUrl(clash.challenger.image)} 
                            className="w-8 h-8 rounded-full object-cover" 
                            alt=""
                          />
                          <span className="text-sm font-medium">{clash.challenger.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <img 
                            src={getFullImageUrl(clash.opponent.image)} 
                            className="w-8 h-8 rounded-full object-cover" 
                            alt=""
                          />
                          <span className="text-sm font-medium">{clash.opponent.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-bold text-gray-700">{clash.rsvpCount || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          clash.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
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
      )}
    </div>
  );
};

export default ClashManagement;
