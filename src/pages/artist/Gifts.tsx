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
  Filter
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import apiService, { getFullImageUrl } from '../../services/api';

const card = 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg';

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
    <div className="max-w-5xl mx-auto pb-16 space-y-6">
      
      {/* ── Header Card ── */}
      <div className={`${card} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6`}>
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <div>
             <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1 italic">Contribution Stream</p>
             <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight uppercase italic">
               Digital Gratuity
             </h1>
             <p className="text-sm text-zinc-500 mt-0.5">
               Historical log of community support and digital asset transmissions.
             </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 flex items-center gap-1 border border-zinc-200 dark:border-white/5 shadow-inner">
            {['all', 'month', 'week'].map((p) => (
              <button
                key={p}
                onClick={() => setTimeFilter(p)}
                className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg ${
                  timeFilter === p
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-lg'
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
          { label: 'Total Transmissions', value: stats.totalGifts, icon: <GiftIcon className="h-5 w-5" />, color: 'emerald', trend: 'Total' },
          { label: 'Accumulated Value', value: `$${stats.totalValue.toLocaleString()}`, icon: <DollarSign className="h-5 w-5" />, color: 'blue', trend: '+12.5%' },
          { label: 'Monthly Volume', value: stats.monthlyGifts, icon: <Calendar className="h-5 w-5" />, color: 'purple', trend: '30 Days' },
          { label: 'Cycle Earnings', value: `$${stats.monthlyValue.toLocaleString()}`, icon: <TrendingUp className="h-5 w-5" />, color: 'rose', trend: '+8.3%' },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`${card} p-6 group relative overflow-hidden`}
          >
             <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-100/50 dark:bg-white/[0.02] rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
            <div className="flex items-center justify-between mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/10 shadow-sm group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                {stat.trend}
              </span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 italic">{stat.label}</p>
            <p className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tighter tabular-nums">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Gift History */}
      <div className={`${card} overflow-hidden`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-white/[0.06] bg-zinc-50/30 dark:bg-white/[0.01] gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-200 dark:border-white/5">
               <History className="h-4 w-4 text-zinc-500" />
            </div>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white italic">Mission Log / Received</h2>
            <span className="px-2 py-0.5 rounded-full bg-zinc-900 dark:bg-white text-[9px] font-black text-white dark:text-zinc-900 uppercase">
              {filteredGifts.length} Units
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="SEARCH TRANSMISSIONS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 h-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none w-full sm:w-64 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-500 shadow-sm"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="flex items-center justify-center py-32">
              <div className="w-10 h-10 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          ) : filteredGifts.length === 0 ? (
            <div className="py-32 text-center">
              <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl mx-auto mb-6 flex items-center justify-center border border-dashed border-zinc-200 dark:border-white/10 group">
                <GiftIcon className="h-10 w-10 text-zinc-400 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">Zero Signal Strength</h3>
              <p className="text-xs text-zinc-500 mt-2 max-w-xs mx-auto leading-relaxed font-medium">
                No digital assets identified in this sector. Perform live or release transmissions to trigger gratuity cycles.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
              {filteredGifts.map((gift, idx) => (
                <motion.div
                  key={gift.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="group flex items-center gap-6 px-6 py-5 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-all cursor-pointer"
                >
                  {/* Gift Image HUD */}
                  <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center flex-shrink-0 border border-zinc-200 dark:border-white/5 group-hover:border-emerald-500/30 transition-all shadow-sm">
                    <img src={gift.gift_image} alt={gift.name} className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
                  </div>

                  {/* Info Grid */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 flex-wrap mb-1.5">
                      <span className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-widest italic">{gift.name}</span>
                      <div className="flex items-center gap-2">
                         <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                         <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                           +${(gift.value / 100).toFixed(2)}
                         </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        Source: <span className="text-zinc-900 dark:text-zinc-200 font-black italic">{gift.sender_name}</span>
                      </p>
                      {gift.stream_title && (
                        <>
                          <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                          <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-tighter text-rose-500 bg-rose-500/5 px-2 py-0.5 rounded-md border border-rose-500/10">
                            <Play className="h-2.5 w-2.5 fill-current" />
                            {gift.stream_title}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Time & Action HUD */}
                  <div className="flex items-center gap-8 flex-shrink-0">
                    <div className="hidden sm:block text-right">
                      <div className="flex items-center justify-end gap-2 text-zinc-400 text-[10px] font-black uppercase tracking-widest italic">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDistanceToNow(new Date(gift.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-500 border border-transparent group-hover:border-emerald-500/20 transition-all">
                       <ArrowUpRight className="h-5 w-5" />
                    </div>
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
