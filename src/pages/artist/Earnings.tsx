import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  BarChart2, 
  Calendar, 
  Download, 
  ChevronDown, 
  Filter,
  ArrowUpRight,
  Music,
  Gift,
  Clock,
  MoreVertical,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { format, endOfMonth, subMonths } from 'date-fns';
import financeService from '../../services/financeService';

interface EarningsStats {
  totalEarnings: number;
  monthlyEarnings: number;
  streamEarnings: number;
  giftEarnings: number;
}

interface EarningsData {
  id: string;
  amount: number;
  source: 'stream' | 'gift' | 'subscription';
  source_name: string;
  created_at: string;
  status: 'pending' | 'paid';
  payout_date?: string;
}

export default function Earnings() {
  const [stats, setStats] = useState<EarningsStats>({
    totalEarnings: 0,
    monthlyEarnings: 0,
    streamEarnings: 0,
    giftEarnings: 0
  });
  const [earnings, setEarnings] = useState<EarningsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');

  const fetchEarningsData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await financeService.getArtistEarnings();

      setStats({
        totalEarnings: data.totalEarnings / 100,
        monthlyEarnings: data.monthlyEarnings / 100,
        streamEarnings: (data.breakdown['subscription_revenue'] || 0) / 100,
        giftEarnings: (data.breakdown['gift_received'] || 0) / 100
      });

      const mappedEarnings: EarningsData[] = data.history.map(t => ({
        id: t._id,
        amount: t.amount / 100,
        source: t.type === 'gift_received' ? 'gift' : 'subscription',
        source_name: t.description,
        created_at: t.createdAt,
        status: t.status === 'completed' ? 'paid' : 'pending'
      }));

      setEarnings(mappedEarnings);
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEarningsData();
  }, [fetchEarningsData]);

  const downloadEarningsReport = () => {
    const csvContent = [
      ['Date', 'Source', 'Amount', 'Status', 'Payout Date'].join(','),
      ...earnings.map(earning => [
        format(new Date(earning.created_at), 'yyyy-MM-dd'),
        earning.source_name,
        earning.amount.toFixed(2),
        earning.status,
        earning.payout_date ? format(new Date(earning.payout_date), 'yyyy-MM-dd') : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings-${format(selectedMonth, 'yyyy-MM')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const filteredEarnings = earnings.filter(e => {
    if (statusFilter === 'all') return true;
    return e.status === statusFilter;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 bg-zinc-50/40 min-h-screen font-['Geist'] text-zinc-900">
      {/* Header - Soft UI Elevation */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] p-8 mb-10 shadow-2xl shadow-zinc-200/50 flex flex-col lg:flex-row lg:items-center justify-between gap-8 border border-zinc-100"
      >
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-500 rounded-[2rem] flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <DollarSign className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight font-['Bebas_Neue'] uppercase leading-none">
              Financial Overview
            </h1>
            <p className="text-zinc-500 text-sm font-medium mt-1">
              Transparent earnings and payout tracking.
            </p>
          </div>
        </div>

        {/* Action Tray */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 group-hover:text-emerald-500 transition-colors" />
            <select
              value={selectedMonth.toISOString()}
              onChange={(e) => setSelectedMonth(new Date(e.target.value))}
              className="pl-11 pr-10 py-3 bg-zinc-50 border border-zinc-100 rounded-full text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer hover:bg-white transition-all shadow-sm focus:ring-2 focus:ring-emerald-500/20"
            >
              {Array.from({ length: 12 }, (_, i) => subMonths(new Date(), i)).map((date) => (
                <option key={date.toISOString()} value={date.toISOString()}>
                  {format(date, 'MMMM yyyy')}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 pointer-events-none" />
          </div>
          <button 
            onClick={downloadEarningsReport}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-emerald-500 transition-all shadow-xl hover:shadow-emerald-500/20"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Monthly Earnings', value: `$${stats.monthlyEarnings.toLocaleString()}`, icon: <TrendingUp />, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+15.3%' },
          { label: 'Stream Revenue', value: `$${stats.streamEarnings.toLocaleString()}`, icon: <BarChart2 />, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: 'Subscription' },
          { label: 'Gift Revenue', value: `$${stats.giftEarnings.toLocaleString()}`, icon: <Gift />, color: 'text-rose-600', bg: 'bg-rose-50', trend: 'Direct' },
          { label: 'Next Payout', value: format(endOfMonth(selectedMonth), 'MMM d, yyyy'), icon: <Calendar />, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Scheduled' },
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
              {stat.trend.startsWith('+') ? (
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  {stat.trend}
                </span>
              ) : (
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                  {stat.trend}
                </span>
              )}
            </div>
            <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">{stat.label}</p>
            <h4 className="text-2xl font-black text-zinc-900 mt-1">{stat.value}</h4>
          </motion.div>
        ))}
      </div>

      {/* History Stream */}
      <div className="space-y-4">
        {/* Filter Bar */}
        <div className="flex items-center justify-between px-8 mb-6">
          <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Transaction History</p>
          <div className="flex bg-white rounded-full p-1 shadow-sm border border-zinc-200">
            {['all', 'pending', 'paid'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s as any)}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === s 
                  ? 'bg-zinc-900 text-white shadow-lg' 
                  : 'text-zinc-400 hover:text-zinc-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40 grayscale opacity-30">
              <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          ) : filteredEarnings.length === 0 ? (
            <div className="bg-white rounded-[3rem] border border-dashed border-zinc-200/60 p-24 text-center">
              <div className="w-20 h-20 bg-zinc-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner shadow-zinc-100">
                <DollarSign className="h-10 w-10 text-zinc-200" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 italic">No Earnings Data</h3>
              <p className="text-zinc-500 text-sm mt-2 max-w-xs mx-auto font-medium">
                When you generate revenue from streams or gifts, they'll appear here for your records.
              </p>
            </div>
          ) : (
            filteredEarnings.map((earning, idx) => (
              <motion.div
                key={earning.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-white rounded-[1.8rem] p-5 border border-zinc-100 shadow-lg shadow-zinc-100/50 hover:shadow-xl hover:scale-[1.005] transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-6">
                  {/* Source Icon SoftUI */}
                  <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform ${
                    earning.source === 'subscription' ? 'bg-indigo-50 text-indigo-500' : 'bg-emerald-50 text-emerald-500'
                  }`}>
                    {earning.source === 'subscription' ? <Music className="h-6 w-6" /> : <Gift className="h-6 w-6" />}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-black text-zinc-900 flex items-center gap-2">
                      {earning.source_name}
                      <span className="text-[10px] font-bold text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-100 uppercase tracking-tight">
                        {earning.source}
                      </span>
                    </h4>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1.5 px-3 py-1 bg-zinc-50 rounded-full border border-zinc-100">
                        <Clock className="h-3 w-3" />
                        {format(new Date(earning.created_at), 'MMM d, yyyy')}
                      </span>
                      {earning.payout_date && (
                        <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1.5 px-3 py-1 bg-zinc-50 rounded-full border border-zinc-100">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          Paid on {format(new Date(earning.payout_date), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-12">
                  <div className="text-right">
                    <p className="text-lg font-black text-zinc-900 leading-none">
                      ${earning.amount.toLocaleString()}
                    </p>
                    <span className={`text-[10px] font-black uppercase tracking-wider mt-1 inline-block ${
                      earning.status === 'paid' ? 'text-emerald-500' : 'text-amber-500'
                    }`}>
                      {earning.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pr-4">
                    <button className="p-3 text-zinc-300 hover:text-zinc-900 bg-zinc-50 rounded-xl transition-all shadow-sm">
                      <BarChart2 className="h-5 w-5" />
                    </button>
                    <button className="p-3 text-zinc-300 hover:text-zinc-900 bg-zinc-50 rounded-xl transition-all shadow-sm">
                      <MoreVertical className="h-5 w-5" />
                    </button>
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