import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift as GiftIcon, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  ChevronDown, 
  Search,
  Clock,
  User,
  MoreVertical,
  ArrowUpRight,
  Filter,
  Play
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
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
          totalValue: total / 100, // Converts cents to dollars
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
    <div className="max-w-6xl mx-auto px-6 py-10 bg-zinc-50/40 min-h-screen font-['Geist'] text-zinc-900">
      {/* Header - Soft UI Elevation */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] p-8 mb-10 shadow-2xl shadow-zinc-200/50 flex flex-col lg:flex-row lg:items-center justify-between gap-8 border border-zinc-100"
      >
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-purple-500 rounded-[2rem] flex items-center justify-center shadow-lg shadow-purple-500/20">
            <GiftIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight font-['Bebas_Neue'] uppercase leading-none">
              Gifts & Donations
            </h1>
            <p className="text-zinc-500 text-sm font-medium mt-1">
              Your community's massive support history.
            </p>
          </div>
        </div>

        {/* Action Tray */}
        <div className="flex items-center gap-4 bg-zinc-50 p-2 rounded-[2rem] border border-zinc-100/50">
          <div className="flex bg-white rounded-full p-1 shadow-sm border border-zinc-200">
            {['all', 'month', 'week'].map((p) => (
              <button
                key={p}
                onClick={() => setTimeFilter(p)}
                className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                  timeFilter === p 
                  ? 'bg-zinc-900 text-white shadow-lg' 
                  : 'text-zinc-400 hover:text-zinc-600'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 group-hover:text-purple-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Filter support..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-6 py-3 bg-white border border-zinc-200 rounded-full text-xs font-bold focus:ring-2 focus:ring-purple-500/20 outline-none w-48 transition-all"
            />
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Gifts', value: stats.totalGifts, icon: <GiftIcon />, color: 'text-purple-600', bg: 'bg-purple-50', trend: 'All Time' },
          { label: 'Total Value', value: `$${stats.totalValue.toLocaleString()}`, icon: <DollarSign />, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+12.5%' },
          { label: 'Monthly Gifts', value: stats.monthlyGifts, icon: <Calendar />, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Last 30 Days' },
          { label: 'Monthly Value', value: `$${stats.monthlyValue.toLocaleString()}`, icon: <TrendingUp />, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+8.3%' },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-xl shadow-zinc-100/50 hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} shadow-inner`}>
                {stat.icon}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded bg-zinc-50 ${stat.color}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">{stat.label}</p>
            <h4 className="text-2xl font-black text-zinc-900 mt-1">{stat.value}</h4>
          </motion.div>
        ))}
      </div>

      {/* History Stream */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40 grayscale opacity-30">
              <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
            </div>
          ) : filteredGifts.length === 0 ? (
            <div className="bg-white rounded-[3rem] border border-dashed border-zinc-200/60 p-24 text-center">
              <div className="w-20 h-20 bg-zinc-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner shadow-zinc-100">
                <GiftIcon className="h-10 w-10 text-zinc-200" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 italic">No Support Received</h3>
              <p className="text-zinc-500 text-sm mt-2 max-w-xs mx-auto font-medium">
                When fans send you digital gifts, they'll appear here for you to acknowledge.
              </p>
            </div>
          ) : (
            filteredGifts.map((gift, idx) => (
              <motion.div
                key={gift.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-white rounded-[2.5rem] p-6 border border-zinc-100 shadow-lg shadow-zinc-200/40 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300"
              >
                <div className="flex items-center gap-8">
                  {/* Gift Icon Display */}
                  <div className="w-24 h-24 bg-zinc-50 rounded-[2rem] p-4 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                    <img src={gift.gift_image} alt={gift.name} className="w-full h-full object-contain filter drop-shadow-md" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-black text-zinc-900 flex items-center gap-3">
                          {gift.name}
                          <span className="text-[10px] font-black uppercase text-purple-500 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                            +${(gift.value / 100).toFixed(2)}
                          </span>
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-6 h-6 rounded-full bg-zinc-100 overflow-hidden border border-zinc-200 shadow-sm">
                            <img src={gift.sender_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(gift.sender_name)}&background=random`} alt={gift.sender_name} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-xs font-bold text-zinc-500 tracking-tight">
                            From <span className="text-zinc-900">{gift.sender_name}</span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1.5 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100 shadow-sm float-right">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(gift.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {gift.stream_title ? (
                          <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-xl text-[10px] font-bold text-rose-600 border border-rose-100 shadow-sm group/btn cursor-pointer transition-all hover:bg-rose-500 hover:text-white">
                            <Play className="h-3.5 w-3.5" />
                            LIVE: {gift.stream_title}
                          </div>
                        ) : gift.song_title ? (
                          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl text-[10px] font-bold text-indigo-600 border border-indigo-100 shadow-sm">
                            SONG: {gift.song_title}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-xl text-[10px] font-bold text-zinc-400 border border-zinc-100 shadow-sm">
                            Direct Profile Gift
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-purple-500 transition-all shadow-lg hover:shadow-purple-500/20">
                          Acknowledge
                          <ArrowUpRight className="h-3.5 w-3.5 font-black" />
                        </button>
                        <button className="p-2.5 text-zinc-300 hover:text-zinc-900 bg-zinc-100 rounded-xl transition-colors">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}