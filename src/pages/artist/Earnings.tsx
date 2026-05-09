import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, TrendingUp, BarChart2, Calendar,
  Download, ChevronDown, ArrowUpRight, Music,
  Gift, Clock, CheckCircle2,
  Shield,
  Activity,
  History
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

// ── Shared primitives ─────────────────────────────────────────────
const card = 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg';
const labelClass = 'block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 italic';

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
      iconCls: 'text-emerald-400',
      iconBg:  'bg-emerald-500/10',
      trend: '+15.3%',
      trendUp: true,
    },
    {
      label: 'Stream Revenue',
      value: `$${stats.streamEarnings.toLocaleString()}`,
      icon: BarChart2,
      iconCls: 'text-indigo-400',
      iconBg:  'bg-indigo-500/10',
      trend: 'Protocol',
      trendUp: false,
    },
    {
      label: 'Gift Inventory',
      value: `$${stats.giftEarnings.toLocaleString()}`,
      icon: Gift,
      iconCls: 'text-rose-400',
      iconBg:  'bg-rose-500/10',
      trend: 'Direct',
      trendUp: false,
    },
    {
      label: 'Payout Target',
      value: format(endOfMonth(selectedMonth), 'MMM d, yyyy'),
      icon: Calendar,
      iconCls: 'text-amber-400',
      iconBg:  'bg-amber-500/10',
      trend: 'Scheduled',
      trendUp: false,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-16 space-y-8 animate-in fade-in duration-700">

      {/* ── Branded Fiscal Header ── */}
      <div className={`${card} p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden group`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.02] rounded-bl-full pointer-events-none" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
            <DollarSign className="h-8 w-8 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2 italic">Fiscal Protocol v2.1</p>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase italic">
              Financial Overview
            </h1>
            <p className="text-sm text-zinc-500 mt-1 font-medium">
              Transparent telemetry and payout tracking for tactical revenue management.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
            <select
              value={selectedMonth.toISOString()}
              onChange={e => setSelectedMonth(new Date(e.target.value))}
              className="pl-11 pr-10 py-3 bg-zinc-950 border border-white/[0.06] rounded-xl text-zinc-300 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer transition-all hover:bg-zinc-900"
            >
              {Array.from({ length: 12 }, (_, i) => subMonths(new Date(), i)).map(d => (
                <option key={d.toISOString()} value={d.toISOString()}>
                  {format(d, 'MMMM yyyy').toUpperCase()}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
          </div>
          <button
            onClick={downloadReport}
            className="flex items-center gap-3 px-6 h-12 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-xl shadow-zinc-950/20"
          >
            <Download className="h-4 w-4" />
            Export Ledger
          </button>
        </div>
      </div>

      {/* ── Yield Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`${card} p-6 hover:border-emerald-500/20 transition-all group cursor-default shadow-sm hover:shadow-2xl hover:shadow-emerald-500/5`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.iconBg} border border-white/[0.04] shadow-inner`}>
                <s.icon className={`h-6 w-6 ${s.iconCls}`} />
              </div>
              {s.trendUp ? (
                <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md uppercase tracking-widest italic">
                  <ArrowUpRight className="h-3.5 w-3.5" />{s.trend}
                </span>
              ) : (
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic bg-zinc-950 border border-white/[0.04] px-2.5 py-1 rounded-md">
                  {s.trend}
                </span>
              )}
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 mb-2 italic">{s.label}</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-white italic tracking-tighter tabular-nums group-hover:text-emerald-500 transition-colors">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Operational Ledger ── */}
      <div className={`${card} overflow-hidden`}>
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-8 py-6 border-b border-zinc-100 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-zinc-950/20 gap-4">
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <History className="h-4 w-4 text-emerald-500" />
             </div>
             <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">Operational Ledger</h2>
          </div>
          <div className="flex bg-zinc-100 dark:bg-zinc-950 rounded-xl p-1 gap-1 border border-white/[0.04]">
            {(['all', 'pending', 'paid'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all italic ${
                  statusFilter === s
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xl'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-white/5'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Rows */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="flex items-center justify-center py-32 bg-zinc-950/20">
              <div className="relative">
                 <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin shadow-2xl shadow-emerald-500/20" />
                 <Activity className="absolute inset-0 m-auto h-5 w-5 text-emerald-500 animate-pulse" />
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center px-10 bg-zinc-950/20">
              <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-950 rounded-3xl flex items-center justify-center mb-6 border border-zinc-200 dark:border-white/5 shadow-inner">
                <DollarSign className="h-10 w-10 text-zinc-600" />
              </div>
              <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest italic">Zero Fiscal Records</h4>
              <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest font-black opacity-60 max-w-xs leading-relaxed">
                Telemetry for streams, gifts, and subscriptions will emerge here upon deployment.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-white/[0.04] bg-zinc-950/10">
              {filtered.map((e, i) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between px-8 py-6 hover:bg-emerald-500/[0.02] transition-colors group"
                >
                  <div className="flex items-center gap-6 min-w-0">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/[0.04] shadow-inner transition-transform group-hover:scale-105 ${
                      e.source === 'subscription'
                        ? 'bg-indigo-500/5 text-indigo-500'
                        : 'bg-emerald-500/5 text-emerald-500'
                    }`}>
                      {e.source === 'subscription'
                        ? <Music className="h-6 w-6" />
                        : <Gift className="h-6 w-6" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-zinc-800 dark:text-zinc-100 uppercase italic tracking-tight truncate">
                          {e.source_name}
                        </span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-900 border border-white/[0.04] px-2 py-0.5 rounded-md">
                          {e.source}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {format(new Date(e.created_at), 'MMM d, yyyy')}
                        </span>
                        {e.payout_date && (
                          <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            SETTLED {format(new Date(e.payout_date), 'MMM d')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-black text-zinc-900 dark:text-white italic tracking-tighter tabular-nums group-hover:text-emerald-500 transition-colors">
                      ${e.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <span className={`text-[9px] font-black uppercase tracking-widest mt-1.5 inline-block px-2 py-0.5 rounded border ${
                      e.status === 'paid'
                        ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20'
                        : 'bg-amber-500/5 text-amber-500 border-amber-500/20'
                    }`}>
                      {e.status}
                    </span>
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
