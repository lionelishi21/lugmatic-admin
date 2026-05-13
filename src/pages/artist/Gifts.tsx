import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift as GiftIcon,
  TrendingUp,
  Calendar,
  DollarSign,
  Search,
  Clock,
  ArrowUpRight,
  Play,
  Heart,
  Zap,
  Sparkles,
  ChevronRight,
  Filter,
  History,
  Target,
  Activity,
  Award,
  Layers,
  Database,
  Shield,
  Activity as ActivityIcon,
  Globe,
  ArrowRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import apiService, { getFullImageUrl } from '../../services/api';

interface GiftStats {
  totalGifts: number;
  totalValue: number;
  monthlyGifts: number;
  monthlyValue: number;
}

interface Gift {
  id: string;
  name: string;
  value: number;
  sender_name: string;
  sender_image: string;
  created_at: string;
  stream_title?: string;
  song_title?: string;
  gift_image: string;
}

export default function Gifts() {
  const [stats, setStats] = useState<GiftStats>({
    totalGifts: 0,
    totalValue: 0,
    monthlyGifts: 0,
    monthlyValue: 0
  });
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchGiftsData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiService.get(`/gift/history?type=received&limit=100&period=${timeFilter}`);

      if (response.data && response.data.success) {
        const fetchedGifts: Gift[] = response.data.data.map((transaction: any) => ({
          id: transaction._id,
          name: transaction.gift?.name || 'Unknown Gift',
          value: transaction.totalValue,
          sender_name: transaction.sender?.firstName
            ? `${transaction.sender.firstName} ${transaction.sender.lastName || ''}`.trim()
            : 'Anonymous',
          sender_image: transaction.sender?.profilePicture || '',
          created_at: transaction.createdAt,
          stream_title: transaction.streamId?.title || undefined,
          song_title: transaction.songId?.title || undefined,
          gift_image: transaction.gift?.image ? getFullImageUrl(transaction.gift.image) : '/placeholder-gift.png'
        }));

        setGifts(fetchedGifts);

        const total = fetchedGifts.reduce((sum: number, gift: Gift) => sum + gift.value, 0);
        const monthlyGifts = fetchedGifts.filter(gift => {
          const giftDate = new Date(gift.created_at);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return giftDate >= thirtyDaysAgo;
        });
        const monthlyTotal = monthlyGifts.reduce((sum: number, gift: Gift) => sum + gift.value, 0);

        setStats({
          totalGifts: fetchedGifts.length,
          totalValue: total / 100,
          monthlyGifts: monthlyGifts.length,
          monthlyValue: monthlyTotal / 100
        });
      }
    } catch (error) {
      console.error('Error fetching gifts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [timeFilter]);

  useEffect(() => {
    fetchGiftsData();
  }, [fetchGiftsData]);

  const filteredGifts = gifts.filter(gift =>
    gift.sender_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gift.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (gift.stream_title && gift.stream_title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (gift.song_title && gift.song_title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-10 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-none">Digital Gifts</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live Updates</span>
            </div>
          </div>
          <p className="text-zinc-500 font-medium">Track community support and digital gifts received from your fans.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-zinc-950/40 p-1 rounded-2xl border border-white/5 shadow-xl backdrop-blur-3xl">
          {['all', 'month', 'week'].map((p) => (
            <button
              key={p}
              onClick={() => setTimeFilter(p)}
              className={`px-6 py-2.5 text-xs font-semibold capitalize transition-all rounded-xl ${
                timeFilter === p
                  ? 'bg-white text-black shadow-lg'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {p === 'all' ? 'All Time' : `This ${p.charAt(0).toUpperCase() + p.slice(1)}`}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Gifts', value: stats.totalGifts.toLocaleString(), icon: GiftIcon, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
          { label: 'Accumulated Value', value: `$${stats.totalValue.toLocaleString()}`, icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-500/5' },
          { label: 'Monthly Gifts', value: stats.monthlyGifts.toLocaleString(), icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-500/5' },
          { label: 'Monthly Value', value: `$${stats.monthlyValue.toLocaleString()}`, icon: TrendingUp, color: 'text-rose-500', bg: 'bg-rose-500/5' },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="premium-card group hover:border-emerald-500/20 transition-all cursor-default relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between mb-8">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                <stat.icon size={20} className={stat.color} />
              </div>
            </div>
            <p className="text-zinc-500 text-xs font-semibold mb-1.5">{stat.label}</p>
            <p className="text-3xl font-bold text-white tracking-tight tabular-nums leading-none group-hover:text-emerald-400 transition-colors">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Gifts Ledger */}
      <div className="premium-card !p-0 overflow-hidden border-white/5 shadow-2xl">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 bg-zinc-950/20">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
               <History className="text-emerald-500" size={20} />
            </div>
            <div>
               <h3 className="text-lg font-bold text-white">Gift History</h3>
               <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-zinc-500 font-medium">Detailed log of gifts received</p>
                  <div className="w-1 h-1 rounded-full bg-zinc-800" />
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded">
                    {filteredGifts.length} Records
                  </span>
               </div>
            </div>
          </div>
          
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by sender or gift..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 h-12 bg-[#0a0a0a] border border-white/5 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-emerald-500/30 transition-all shadow-inner placeholder:text-zinc-700"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="py-40 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin shadow-2xl" />
                <p className="text-xs font-semibold text-zinc-600 mt-6 animate-pulse tracking-wide">Syncing records...</p>
              </div>
            ) : filteredGifts.length === 0 ? (
              <div className="py-32 text-center">
                <div className="w-20 h-20 bg-zinc-950 rounded-3xl mx-auto mb-6 flex items-center justify-center border border-white/5 shadow-inner">
                   <GiftIcon size={32} className="text-zinc-800" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No gifts found</h3>
                <p className="text-sm text-zinc-500 max-w-xs mx-auto leading-relaxed">
                  Your gift history will appear here once you receive support from your fans.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-zinc-950/40">
                  <tr className="border-b border-white/5">
                    <th className="px-8 py-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">Gift</th>
                    <th className="px-8 py-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">Sender</th>
                    <th className="px-8 py-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">Source</th>
                    <th className="px-8 py-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">Value</th>
                    <th className="px-8 py-5 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredGifts.map((gift, idx) => (
                    <motion.tr
                      key={gift.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="group hover:bg-white/[0.01] transition-all cursor-pointer"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-[#0a0a0a] rounded-xl flex items-center justify-center border border-white/5 group-hover:border-emerald-500/20 transition-all shadow-inner relative overflow-hidden">
                              <img src={gift.gift_image} alt={gift.name} className="w-8 h-8 object-contain group-hover:scale-110 transition-transform relative z-10" />
                           </div>
                           <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors leading-none">{gift.name}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-semibold text-zinc-300">{gift.sender_name}</span>
                      </td>
                      <td className="px-8 py-6">
                         {gift.stream_title ? (
                           <div className="flex items-center gap-2">
                              <Radio size={14} className="text-rose-500/70" />
                              <span className="text-xs font-semibold text-zinc-500 truncate max-w-[150px]">{gift.stream_title}</span>
                           </div>
                         ) : gift.song_title ? (
                           <div className="flex items-center gap-2">
                              <Music2 size={14} className="text-indigo-500/70" />
                              <span className="text-xs font-semibold text-zinc-500 truncate max-w-[150px]">{gift.song_title}</span>
                           </div>
                         ) : (
                           <span className="text-xs font-semibold text-zinc-700 italic">Direct</span>
                         )}
                      </td>
                      <td className="px-8 py-6">
                         <span className="text-base font-bold text-emerald-500 tracking-tight">+${(gift.value / 100).toFixed(2)}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <div className="flex items-center justify-end gap-2 text-zinc-600 text-xs font-medium">
                            <Clock size={12} className="text-zinc-800" />
                            {formatDistanceToNow(new Date(gift.created_at), { addSuffix: true })}
                         </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </AnimatePresence>
        </div>
        <div className="p-6 bg-[#0a0a0a] border-t border-white/5 text-center">
            <button className="text-xs font-bold text-zinc-600 hover:text-white transition-all uppercase tracking-widest">Load More History</button>
        </div>
      </div>
    </div>
  );
}

const Radio = ({ size, className }: { size: number, className: string }) => <Activity size={size} className={className} />;
