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
  Award
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import apiService, { getFullImageUrl } from '../../services/api';

// ── Shared primitives ─────────────────────────────────────────────
const card = 'bg-zinc-900 border border-white/[0.06] rounded-lg shadow-2xl relative overflow-hidden group';
const labelClass = 'block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 italic';

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
    <div className="max-w-7xl mx-auto pb-16 space-y-8 animate-in fade-in duration-700">
      
      {/* ── Branded Gratuity Header ── */}
      <div className={`${card} p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden group`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.02] rounded-bl-full pointer-events-none" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2 italic">Contribution Stream v1.2</p>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase italic">
              Digital Gratuity
            </h1>
            <p className="text-sm text-zinc-500 mt-1 font-medium">
              Historical log of community support and digital asset transmissions.
            </p>
          </div>
        </div>

        {/* Tactical Filters */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-zinc-950 border border-white/[0.04] rounded-2xl p-1.5 flex items-center gap-1.5 shadow-inner">
            {['all', 'month', 'week'].map((p) => (
              <button
                key={p}
                onClick={() => setTimeFilter(p)}
                className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl italic ${
                  timeFilter === p
                    ? 'bg-white text-zinc-900 shadow-2xl'
                    : 'text-zinc-500 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                {p} Spectrum
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* gratuity Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Transmissions', value: stats.totalGifts, icon: <GiftIcon className="h-6 w-6" />, color: 'emerald', trend: 'Global' },
          { label: 'Accumulated Value', value: `$${stats.totalValue.toLocaleString()}`, icon: <DollarSign className="h-6 w-6" />, color: 'blue', trend: 'Gross' },
          { label: 'Monthly Volume', value: stats.monthlyGifts, icon: <Calendar className="h-6 w-6" />, color: 'purple', trend: '30D' },
          { label: 'Cycle Earnings', value: `$${stats.monthlyValue.toLocaleString()}`, icon: <TrendingUp className="h-6 w-6" />, color: 'rose', trend: 'Active' },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`${card} p-6 hover:border-emerald-500/20 transition-all shadow-sm group cursor-default relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/[0.01] rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-950 border border-white/[0.04] shadow-inner text-emerald-500 group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-lg bg-zinc-950 text-zinc-500 border border-white/[0.02] shadow-inner italic">
                {stat.trend}
              </span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 italic">{stat.label}</p>
            <p className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter tabular-nums italic group-hover:text-emerald-500 transition-colors">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Contribution History Ledger */}
      <div className={`${card} overflow-hidden shadow-2xl`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between px-8 py-7 border-b border-white/[0.06] bg-zinc-950/40 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/[0.04] shadow-inner">
               <History className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="flex flex-col">
               <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] italic">Mission Log</span>
               <div className="flex items-center gap-3">
                  <h2 className="text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-white italic">Received Transmissions</h2>
                  <span className="px-3 py-0.5 rounded-lg bg-zinc-900 text-[10px] font-black text-emerald-500 border border-white/[0.04] shadow-inner">
                    {filteredGifts.length} UNITS
                  </span>
               </div>
            </div>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="SEARCH TRANSMISSIONS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 h-12 bg-zinc-950 border border-white/[0.08] rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none w-full md:w-80 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-600 shadow-inner italic"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 bg-zinc-950/10">
              <div className="relative">
                 <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin shadow-2xl shadow-emerald-500/20" />
                 <Activity className="absolute inset-0 m-auto h-5 w-5 text-emerald-500 animate-pulse" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mt-6 italic animate-pulse">Syncing Asset Stream...</p>
            </div>
          ) : filteredGifts.length === 0 ? (
            <div className="py-32 text-center bg-zinc-950/20 shadow-inner">
              <div className="w-20 h-20 bg-zinc-950 rounded-3xl mx-auto mb-8 flex items-center justify-center border border-white/[0.04] shadow-2xl group cursor-default">
                <GiftIcon className="h-10 w-10 text-zinc-700 group-hover:text-emerald-500 transition-colors" />
              </div>
              <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest italic">Zero Signal Strength</h3>
              <p className="text-[11px] text-zinc-500 font-black uppercase tracking-[0.15em] mt-3 max-w-xs mx-auto leading-relaxed opacity-60">
                No digital assets identified in this sector. Perform live or release transmissions to trigger gratuity cycles.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
              {filteredGifts.map((gift, idx) => (
                <motion.div
                  key={gift.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="group flex items-center gap-8 px-8 py-7 hover:bg-white/[0.02] transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.01] rounded-bl-full pointer-events-none" />
                  
                  {/* Gift Image HUD */}
                  <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/[0.04] group-hover:border-emerald-500/30 transition-all shadow-2xl relative z-10 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <img src={gift.gift_image} alt={gift.name} className="w-12 h-12 object-contain group-hover:scale-110 transition-transform relative z-10" />
                  </div>

                  {/* Info HUD */}
                  <div className="flex-1 min-w-0 relative z-10">
                    <div className="flex items-center gap-5 flex-wrap mb-2.5">
                      <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight italic group-hover:text-emerald-500 transition-colors">{gift.name}</span>
                      <div className="flex items-center gap-3">
                         <div className="w-1 h-1 rounded-full bg-zinc-700 shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
                         <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 italic">
                           +${(gift.value / 100).toFixed(2)}
                         </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic flex items-center gap-2">
                        Source: <span className="text-zinc-200 bg-zinc-950 px-2 py-0.5 rounded border border-white/[0.04] shadow-inner">{gift.sender_name}</span>
                      </p>
                      {gift.stream_title && (
                        <>
                          <div className="w-1 h-1 rounded-full bg-zinc-800" />
                          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-rose-500 bg-rose-500/5 px-3 py-1 rounded-xl border border-rose-500/10 italic shadow-sm">
                            <Target className="h-3 w-3" />
                            {gift.stream_title}
                          </span>
                        </>
                      )}
                      {gift.song_title && (
                        <>
                          <div className="w-1 h-1 rounded-full bg-zinc-800" />
                          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-indigo-400 bg-indigo-500/5 px-3 py-1 rounded-xl border border-indigo-500/10 italic shadow-sm">
                            <Award className="h-3 w-3" />
                            {gift.song_title}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Time & Action HUD */}
                  <div className="flex items-center gap-10 flex-shrink-0 relative z-10">
                    <div className="hidden lg:block text-right">
                      <div className="flex items-center justify-end gap-2.5 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] italic">
                        <Clock className="h-4 w-4 text-emerald-500/50" />
                        {formatDistanceToNow(new Date(gift.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-zinc-950 flex items-center justify-center text-zinc-600 group-hover:text-emerald-500 border border-white/[0.04] group-hover:border-emerald-500/30 transition-all shadow-xl group-hover:shadow-emerald-500/5">
                       <ArrowUpRight className="h-6 w-6" />
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
