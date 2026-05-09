import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, TrendingUp, BarChart2, Calendar,
  Download, ChevronDown, ArrowUpRight, Music,
  Gift, Clock, CheckCircle2,
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
      label: 'Monthly Earnings',
      value: `$${stats.monthlyEarnings.toLocaleString()}`,
      icon: TrendingUp,
      iconCls: 'text-emerald-600 dark:text-emerald-400',
      iconBg:  'bg-emerald-50 dark:bg-emerald-500/10',
      trend: '+15.3%',
      trendUp: true,
    },
    {
      label: 'Stream Revenue',
      value: `$${stats.streamEarnings.toLocaleString()}`,
      icon: BarChart2,
      iconCls: 'text-indigo-600 dark:text-indigo-400',
      iconBg:  'bg-indigo-50 dark:bg-indigo-500/10',
      trend: 'Subscription',
      trendUp: false,
    },
    {
      label: 'Gift Revenue',
      value: `$${stats.giftEarnings.toLocaleString()}`,
      icon: Gift,
      iconCls: 'text-rose-600 dark:text-rose-400',
      iconBg:  'bg-rose-50 dark:bg-rose-500/10',
      trend: 'Direct',
      trendUp: false,
    },
    {
      label: 'Next Payout',
      value: format(endOfMonth(selectedMonth), 'MMM d, yyyy'),
      icon: Calendar,
      iconCls: 'text-amber-600 dark:text-amber-400',
      iconBg:  'bg-amber-50 dark:bg-amber-500/10',
      trend: 'Scheduled',
      trendUp: false,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-6">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className={`${card} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Financial Overview
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Transparent earnings and payout tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
            <select
              value={selectedMonth.toISOString()}
              onChange={e => setSelectedMonth(new Date(e.target.value))}
              className="pl-9 pr-8 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] rounded text-zinc-700 dark:text-zinc-200 text-xs font-semibold focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
            >
              {Array.from({ length: 12 }, (_, i) => subMonths(new Date(), i)).map(d => (
                <option key={d.toISOString()} value={d.toISOString()}>
                  {format(d, 'MMMM yyyy')}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
          </div>
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold rounded hover:opacity-90 transition-opacity"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Stats Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`${card} p-5`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded ${s.iconBg}`}>
                <s.icon className={`h-4 w-4 ${s.iconCls}`} />
              </div>
              {s.trendUp ? (
                <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="h-3 w-3" />{s.trend}
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">
                  {s.trend}
                </span>
              )}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">{s.label}</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-white">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Transaction History ─────────────────────────────────── */}
      <div className={card}>
        {/* Filter bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-white/[0.06]">
          <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
            Transaction History
          </span>
          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded p-0.5 gap-0.5">
            {(['all', 'pending', 'paid'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wide transition-all ${
                  statusFilter === s
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
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
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-8">
              <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-zinc-400" />
              </div>
              <p className="font-semibold text-zinc-700 dark:text-zinc-300">No transactions yet</p>
              <p className="text-sm text-zinc-400 mt-1 max-w-xs">
                Earnings from streams, gifts, and subscriptions will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
              {filtered.map((e, i) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between px-5 py-4 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${
                      e.source === 'subscription'
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500'
                        : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {e.source === 'subscription'
                        ? <Music className="h-4 w-4" />
                        : <Gift className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                          {e.source_name}
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                          {e.source}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(e.created_at), 'MMM d, yyyy')}
                        </span>
                        {e.payout_date && (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Paid {format(new Date(e.payout_date), 'MMM d')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">
                      ${e.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <span className={`text-[10px] font-bold uppercase tracking-wide ${
                      e.status === 'paid'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
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
