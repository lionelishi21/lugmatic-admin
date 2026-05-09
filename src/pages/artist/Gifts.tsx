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
  Play
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

const card = 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg';

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

        // Calculate stats
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
    <div className="max-w-5xl mx-auto pb-16 space-y-6">
      {/* Header */}
      <div className={`${card} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-600/20">
            <GiftIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight uppercase">Gifts & Support</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Your community's digital contribution history.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="bg-zinc-100 dark:bg-zinc-800 rounded p-1 flex items-center gap-1">
            {['all', 'month', 'week'].map((p) => (
              <button
                key={p}
                onClick={() => setTimeFilter(p)}
                className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded ${
                  timeFilter === p
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Gifts', value: stats.totalGifts, icon: <GiftIcon className="h-5 w-5" />, color: 'purple', trend: 'All Time' },
          { label: 'Total Value', value: `$${stats.totalValue.toLocaleString()}`, icon: <DollarSign className="h-5 w-5" />, color: 'emerald', trend: '+12.5%' },
          { label: 'Monthly Gifts', value: stats.monthlyGifts, icon: <Calendar className="h-5 w-5" />, color: 'amber', trend: 'Last 30 Days' },
          { label: 'Monthly Value', value: `$${stats.monthlyValue.toLocaleString()}`, icon: <TrendingUp className="h-5 w-5" />, color: 'indigo', trend: '+8.3%' },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`${card} p-5 hover:border-zinc-300 dark:hover:border-white/10 transition-all group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${stat.color}-500/10 text-${stat.color}-500 border border-${stat.color}-500/20 shadow-sm`}>
                {stat.icon}
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                {stat.trend}
              </span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-white italic tracking-tighter tabular-nums">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Gift History */}
      <div className={`${card} overflow-hidden`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-zinc-800/20">
          <div className="flex items-center gap-3">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Transaction History</h2>
            <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-500">
              {filteredGifts.length}
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="FILTER SUPPORT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded text-[10px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none w-44 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-10 h-10 border-2 border-purple-500/10 border-t-purple-500 rounded-full animate-spin" />
            </div>
          ) : filteredGifts.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl mx-auto mb-4 flex items-center justify-center border border-zinc-200 dark:border-white/5">
                <GiftIcon className="h-8 w-8 text-zinc-400" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight">No support yet</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto leading-relaxed">
                When fans send you digital gifts, they'll appear here. Keep performing to earn support!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
              {filteredGifts.map((gift, idx) => (
                <motion.div
                  key={gift.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="group flex items-center gap-5 px-6 py-5 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  {/* Gift Image */}
                  <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0 border border-zinc-200 dark:border-white/5 group-hover:scale-110 transition-transform">
                    <img src={gift.gift_image} alt={gift.name} className="w-8 h-8 object-contain" />
                  </div>

                  {/* Sender */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={gift.sender_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(gift.sender_name)}&background=random`}
                      alt={gift.sender_name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-zinc-100 dark:border-white/10"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <span className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight">{gift.name}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        +${(gift.value / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        From <span className="text-zinc-900 dark:text-zinc-200">{gift.sender_name}</span>
                      </p>
                      {gift.stream_title && (
                        <>
                          <div className="w-1 h-1 rounded-full bg-zinc-700" />
                          <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-tighter text-rose-500">
                            <Play className="h-2.5 w-2.5 fill-current" />
                            {gift.stream_title}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Time & Action */}
                  <div className="flex items-center gap-8 flex-shrink-0">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1.5 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(gift.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    <button className="p-2 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded transition-all">
                      <ArrowUpRight className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
