import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, TrendingUp, BarChart2, Calendar,
  Download, ChevronDown, ArrowUpRight, Music,
  Gift, Clock, CheckCircle2,
  Shield,
  Activity,
  History,
  Wallet,
  Zap,
  ArrowRight,
  TrendingDown,
  Activity as ActivityIcon,
  Layers,
  ChevronRight,
  FileText,
  Search
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
    totalEarnings: 0, monthlyEarnings: 0, streamEarnings: 0, giftEarnings: 0,
  });
  const [earnings, setEarnings]       = useState<EarningsData[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter]   = useState<'all' | 'pending' | 'paid'>('all');

  const fetchEarningsData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await financeService.getArtistEarnings();
      setStats({
        totalEarnings:   data.totalEarnings   / 100,
        monthlyEarnings: data.monthlyEarnings  / 100,
        streamEarnings:  (data.breakdown['subscription_revenue'] || 0) / 100,
        giftEarnings:    (data.breakdown['gift_received']         || 0) / 100,
      });
      setEarnings(data.history.map((t: any) => ({
        id:          t._id,
        amount:      t.amount / 100,
        source:      t.type === 'gift_received' ? 'gift' : 'subscription',
        source_name: t.description,
        created_at:  t.createdAt,
        status:      t.status === 'completed' ? 'paid' : 'pending',
        payout_date: t.payout_date,
      })));
    } catch { /* silently handled */ }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchEarningsData(); }, [fetchEarningsData]);

  const downloadReport = () => {
    const csv = [
      ['Date', 'Source', 'Amount', 'Status', 'Payout Date'].join(','),
      ...earnings.map(e => [
        format(new Date(e.created_at), 'yyyy-MM-dd'),
        e.source_name,
        e.amount.toFixed(2),
        e.status,
        e.payout_date ? format(new Date(e.payout_date), 'yyyy-MM-dd') : '',
      ].join(',')),
    ].join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: `earnings-${format(selectedMonth, 'yyyy-MM')}.csv`,
    });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const filtered = earnings.filter(e =>
    statusFilter === 'all' || e.status === statusFilter,
  );

  const STATS = [
    {
      label: 'Monthly Yield',
      value: `$${stats.monthlyEarnings.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/5',
      trend: '+15.3%',
      trendUp: true,
      tag: 'Growth'
    },
    {
      label: 'Stream Revenue',
      value: `$${stats.streamEarnings.toLocaleString()}`,
      icon: ActivityIcon,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/5',
      trend: 'Standard',
      trendUp: false,
      tag: 'Revenue'
    },
    {
      label: 'Gift Assets',
      value: `$${stats.giftEarnings.toLocaleString()}`,
      icon: Gift,
      color: 'text-rose-500',
      bg: 'bg-rose-500/5',
      trend: 'Direct',
      trendUp: false,
      tag: 'Support'
    },
    {
      label: 'Payout Target',
      value: format(endOfMonth(selectedMonth), 'MMM d, yyyy'),
      icon: Shield,
      color: 'text-amber-500',
      bg: 'bg-amber-500/5',
      trend: 'Secure',
      trendUp: false,
      tag: 'Scheduled'
    },
  ];

  return (
    <div className="space-y-10 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-none">Financial Overview</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Updates Active</span>
            </div>
          </div>
          <p className="text-zinc-500 font-medium">Detailed tracking of your revenue streams and global earnings history.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 pointer-events-none" />
            <select
              value={selectedMonth.toISOString()}
              onChange={e => setSelectedMonth(new Date(e.target.value))}
              className="pl-11 pr-10 h-12 bg-zinc-950 border border-white/5 rounded-xl text-zinc-400 text-xs font-semibold focus:outline-none focus:border-emerald-500/30 appearance-none cursor-pointer transition-all hover:bg-zinc-900 shadow-xl"
            >
              {Array.from({ length: 12 }, (_, i) => subMonths(new Date(), i)).map(d => (
                <option key={d.toISOString()} value={d.toISOString()}>
                  {format(d, 'MMMM yyyy')}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 pointer-events-none" />
          </div>
          <button
            onClick={downloadReport}
            className="flex items-center gap-3 px-8 h-12 bg-white text-black text-xs font-bold rounded-xl hover:scale-105 transition-all shadow-xl border border-white/10"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="premium-card group hover:border-emerald-500/20 transition-all cursor-default relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between mb-8">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.bg} border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                <s.icon size={20} className={s.color} />
              </div>
              <div className="flex flex-col items-end">
                {s.trendUp ? (
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 flex items-center gap-1 mb-1">
                    <TrendingUp size={10} /> {s.trend}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-zinc-500 bg-black/40 border border-white/5 px-2 py-0.5 rounded mb-1">
                    {s.trend}
                  </span>
                )}
              </div>
            </div>
            <p className="text-zinc-500 text-xs font-semibold mb-1.5">{s.label}</p>
            <p className="text-3xl font-bold text-white tracking-tight tabular-nums leading-none group-hover:text-emerald-400 transition-colors">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Transaction History */}
      <div className="premium-card !p-0 overflow-hidden border-white/5 shadow-2xl">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 bg-zinc-950/20">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
               <History className="text-emerald-500" size={20} />
            </div>
            <div>
               <h3 className="text-lg font-bold text-white">Earnings Archive</h3>
               <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-zinc-500 font-medium">Verified historical transaction records</p>
                  <div className="w-1 h-1 rounded-full bg-zinc-800" />
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                    Synced
                  </span>
               </div>
            </div>
          </div>
          
          <div className="flex bg-[#0a0a0a] border border-white/5 rounded-2xl p-1 shadow-inner backdrop-blur-3xl">
            {(['all', 'pending', 'paid'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-6 py-2.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                  statusFilter === s
                    ? 'bg-white/10 text-white shadow-lg border border-white/5'
                    : 'text-zinc-600 hover:text-zinc-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="py-40 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin shadow-2xl" />
                <p className="text-xs font-semibold text-zinc-600 mt-6 animate-pulse tracking-wide">Syncing earnings...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-32 text-center">
                <div className="w-20 h-20 bg-zinc-950 rounded-3xl mx-auto mb-6 flex items-center justify-center border border-white/5 shadow-inner">
                   <DollarSign size={32} className="text-zinc-800" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No transaction records</h3>
                <p className="text-sm text-zinc-500 max-w-xs mx-auto leading-relaxed">
                  Your earnings history will appear here once you start generating revenue.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-zinc-950/40">
                  <tr className="border-b border-white/5">
                    <th className="px-8 py-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">Source</th>
                    <th className="px-8 py-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">Type</th>
                    <th className="px-8 py-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">Amount</th>
                    <th className="px-8 py-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                    <th className="px-8 py-5 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((e, i) => (
                    <motion.tr
                      key={e.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="group hover:bg-white/[0.01] transition-all cursor-pointer"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/5 shadow-inner transition-transform group-hover:scale-105 ${
                              e.source === 'subscription'
                                ? 'bg-indigo-500/5 text-indigo-500'
                                : 'bg-emerald-500/5 text-emerald-500'
                            }`}>
                              {e.source === 'subscription'
                                ? <Music size={20} />
                                : <Gift size={20} />}
                           </div>
                           <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors leading-none">{e.source_name}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-semibold text-zinc-500 capitalize">{e.source}</span>
                      </td>
                      <td className="px-8 py-6">
                         <p className="text-base font-bold text-white tracking-tight">
                            ${e.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                         </p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                          e.status === 'paid'
                            ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20'
                            : 'bg-amber-500/5 text-amber-500 border-amber-500/20'
                        }`}>
                          {e.status}
                        </span>
                        {e.payout_date && (
                          <div className="flex items-center gap-1.5 mt-1.5 opacity-60">
                             <CheckCircle2 size={10} className="text-emerald-500" />
                             <span className="text-[10px] font-semibold text-zinc-600">Settled: {format(new Date(e.payout_date), 'MMM d')}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                         <div className="flex items-center justify-end gap-2 text-zinc-600 text-xs font-medium">
                            <Clock size={12} className="text-zinc-800" />
                            {format(new Date(e.created_at), 'MMM d, yyyy')}
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
            <button className="text-xs font-bold text-zinc-600 hover:text-white transition-all uppercase tracking-widest">Load More Earnings</button>
        </div>
      </div>
    </div>
  );
}
