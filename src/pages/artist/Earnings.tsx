import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, TrendingUp, Calendar,
  Download, ChevronDown,
  Gift, Clock, CheckCircle2,
  History,
  Wallet,
} from 'lucide-react';
import { format, endOfMonth, subMonths } from 'date-fns';
import financeService from '../../services/financeService';

interface EarningsStats {
  totalEarnings: number;
  availableBalance: number;
  monthlyEarnings: number;
  giftEarnings: number;
  totalPages: number;
}

interface EarningsRow {
  id: string;
  amount: number;
  source: 'gift';
  source_name: string;
  created_at: string;
  status: 'pending' | 'paid';
  payout_date?: string;
}

interface PayoutModalState {
  open: boolean;
  amount: string;
  loading: boolean;
  error: string;
}

export default function Earnings() {
  const [stats, setStats] = useState<EarningsStats>({
    totalEarnings: 0, availableBalance: 0, monthlyEarnings: 0, giftEarnings: 0, totalPages: 1,
  });
  const [earnings, setEarnings] = useState<EarningsRow[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [page, setPage]                   = useState(1);
  const [hasMore, setHasMore]             = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter]   = useState<'all' | 'pending' | 'paid'>('all');
  const [payout, setPayout]               = useState<PayoutModalState>({ open: false, amount: '', loading: false, error: '' });

  const fetchPage = useCallback(async (p: number, replace: boolean) => {
    try {
      if (replace) setIsLoading(true);
      const data = await financeService.getArtistEarnings(p, 20);
      setStats({
        totalEarnings:   (data.totalEarnings   || 0) / 100,
        availableBalance:(data.availableBalance || 0) / 100,
        monthlyEarnings: (data.monthlyEarnings  || 0) / 100,
        giftEarnings:    ((data.breakdown['gift_received'] || 0)) / 100,
        totalPages:      data.pagination?.pages || 1,
      });
      const rows: EarningsRow[] = (data.history || []).map((t: any) => ({
        id:          t._id,
        amount:      (t.amount || 0) / 100,
        source:      'gift',
        source_name: t.description || 'Gift received',
        created_at:  t.createdAt,
        status:      t.status === 'completed' ? 'paid' : 'pending',
        payout_date: t.payout_date,
      }));
      setEarnings(prev => replace ? rows : [...prev, ...rows]);
      setHasMore(p < (data.pagination?.pages || 1));
    } catch { /* silently handled */ }
    finally { if (replace) setIsLoading(false); }
  }, []);

  useEffect(() => { fetchPage(1, true); setPage(1); }, [fetchPage]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPage(next, false);
  };

  const downloadReport = () => {
    const csv = [
      ['Date', 'Source', 'Amount', 'Status'].join(','),
      ...earnings.map(e => [
        format(new Date(e.created_at), 'yyyy-MM-dd'),
        e.source_name,
        e.amount.toFixed(2),
        e.status,
      ].join(',')),
    ].join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: `earnings-${format(selectedMonth, 'yyyy-MM')}.csv`,
    });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const handlePayoutRequest = async () => {
    const amountCents = Math.round(parseFloat(payout.amount) * 100);
    if (isNaN(amountCents) || amountCents < 5000) {
      setPayout(p => ({ ...p, error: 'Minimum payout is $50.00' }));
      return;
    }
    if (amountCents > Math.round(stats.availableBalance * 100)) {
      setPayout(p => ({ ...p, error: 'Amount exceeds available balance' }));
      return;
    }
    try {
      setPayout(p => ({ ...p, loading: true, error: '' }));
      await financeService.requestPayout(amountCents);
      setPayout({ open: false, amount: '', loading: false, error: '' });
      fetchPage(1, true);
    } catch (err: any) {
      setPayout(p => ({ ...p, loading: false, error: err?.response?.data?.message || 'Payout request failed' }));
    }
  };

  const filtered = earnings.filter(e => statusFilter === 'all' || e.status === statusFilter);

  const STATS = [
    {
      label: 'Total Earnings',
      value: `$${stats.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/5',
      sub: 'All-time',
    },
    {
      label: 'This Month',
      value: `$${stats.monthlyEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      icon: Calendar,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/5',
      sub: format(new Date(), 'MMMM yyyy'),
    },
    {
      label: 'Gift Revenue',
      value: `$${stats.giftEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      icon: Gift,
      color: 'text-rose-500',
      bg: 'bg-rose-500/5',
      sub: 'From fan gifts',
    },
    {
      label: 'Available Balance',
      value: `$${stats.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      icon: Wallet,
      color: 'text-amber-500',
      bg: 'bg-amber-500/5',
      sub: 'Ready to withdraw',
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
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live</span>
            </div>
          </div>
          <p className="text-zinc-500 font-medium">Track your revenue streams and request payouts.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
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
            onClick={() => setPayout(p => ({ ...p, open: true }))}
            disabled={stats.availableBalance < 50}
            className="flex items-center gap-3 px-6 h-12 bg-emerald-500 text-black text-xs font-bold rounded-xl hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xl"
          >
            <Wallet className="h-4 w-4" />
            Request Payout
          </button>
          <button
            onClick={downloadReport}
            className="flex items-center gap-3 px-6 h-12 bg-white text-black text-xs font-bold rounded-xl hover:scale-105 transition-all shadow-xl"
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
              <span className="text-[10px] font-bold text-zinc-500 bg-black/40 border border-white/5 px-2 py-0.5 rounded">
                {s.sub}
              </span>
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
               <p className="text-xs text-zinc-500 font-medium mt-1">Complete transaction history</p>
            </div>
          </div>

          <div className="flex bg-[#0a0a0a] border border-white/5 rounded-2xl p-1 shadow-inner">
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
                <p className="text-xs font-semibold text-zinc-600 mt-6 animate-pulse tracking-wide">Syncing earnings…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-32 text-center">
                <div className="w-20 h-20 bg-zinc-950 rounded-3xl mx-auto mb-6 flex items-center justify-center border border-white/5 shadow-inner">
                   <DollarSign size={32} className="text-zinc-800" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No transaction records</h3>
                <p className="text-sm text-zinc-500 max-w-xs mx-auto leading-relaxed">
                  Your earnings history will appear once fans start sending gifts.
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
                      className="group hover:bg-white/[0.01] transition-all"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/5 shadow-inner bg-emerald-500/5 text-emerald-500">
                              <Gift size={20} />
                           </div>
                           <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors leading-none">{e.source_name}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-semibold text-zinc-500">Gift</span>
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

        {hasMore && (
          <div className="p-6 bg-[#0a0a0a] border-t border-white/5 text-center">
            <button
              onClick={loadMore}
              className="text-xs font-bold text-zinc-400 hover:text-white transition-all uppercase tracking-widest"
            >
              Load More Earnings
            </button>
          </div>
        )}
      </div>

      {/* Payout Request Modal */}
      <AnimatePresence>
        {payout.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={e => { if (e.target === e.currentTarget) setPayout(p => ({ ...p, open: false })); }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-zinc-900 border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl"
            >
              <h2 className="text-xl font-bold text-white mb-1">Request Payout</h2>
              <p className="text-sm text-zinc-500 mb-6">
                Available: <span className="text-emerald-400 font-bold">${stats.availableBalance.toFixed(2)}</span> · Min $50.00
              </p>

              <label className="block text-xs font-semibold text-zinc-400 mb-2">Amount (USD)</label>
              <div className="relative mb-4">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
                <input
                  type="number"
                  min="50"
                  step="0.01"
                  value={payout.amount}
                  onChange={e => setPayout(p => ({ ...p, amount: e.target.value, error: '' }))}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 h-12 bg-zinc-950 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              {payout.error && (
                <p className="text-xs text-red-400 font-medium mb-4">{payout.error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setPayout(p => ({ ...p, open: false, error: '' }))}
                  className="flex-1 h-12 rounded-xl border border-white/10 text-zinc-400 text-xs font-bold hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayoutRequest}
                  disabled={payout.loading}
                  className="flex-1 h-12 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 disabled:opacity-50 transition-all"
                >
                  {payout.loading ? 'Submitting…' : 'Confirm Payout'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
