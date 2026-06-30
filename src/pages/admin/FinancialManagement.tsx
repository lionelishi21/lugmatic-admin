import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, CreditCard, FileText, Receipt, Settings,
  DollarSign, Users, Activity, BarChart3, Download,
  Filter, Calendar, ChevronRight, Clock, CheckCircle2,
  AlertCircle, XCircle, Search, Music, Zap, Crown, Plus,
  FileCheck, ShieldCheck, ArrowUpRight, ArrowDownRight,
  Package, Globe, Layers, Wallet, X, ThumbsUp, ThumbsDown,
  Banknote
} from 'lucide-react';
import financeService, { AdminFinancialStats, Payout } from '../../services/financeService';
import artistService, { Artist } from '../../services/artistService';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const tabs = [
  { id: 'revenue', label: 'REVENUE', icon: TrendingUp },
  { id: 'payouts', label: 'PAYOUTS', icon: CreditCard },
  { id: 'subscriptions', label: 'PLANS', icon: Layers },
  { id: 'compliance', label: 'COMPLIANCE', icon: ShieldCheck },
  { id: 'pricing', label: 'PRICING', icon: Globe },
];

export default function FinancialManagement() {
  const [activeTab, setActiveTab] = useState('revenue');
  const [stats, setStats] = useState<AdminFinancialStats | null>(null);
  const [allPayouts, setAllPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [payoutStatusFilter, setPayoutStatusFilter] = useState<string>('');
  const [newTransactionOpen, setNewTransactionOpen] = useState(false);
  const [rankingOpen, setRankingOpen] = useState(false);

  const fetchPayouts = useCallback(async (status?: string) => {
    try {
      const payoutList = await financeService.getAdminPayouts(status || undefined);
      setAllPayouts(payoutList);
    } catch (error) {
      console.error('Error fetching payouts:', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const revenueStats = await financeService.getAdminRevenue();
      setStats(revenueStats);
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchStats(), fetchPayouts()]);
      setIsLoading(false);
    };
    fetchData();
  }, [fetchStats, fetchPayouts]);

  const handleExportCSV = () => {
    const rows = stats?.recentTransactions || [];
    if (rows.length === 0) { toast.error('No transactions to export'); return; }
    const csv = [
      ['Date', 'Type', 'Amount', 'Status', 'Description'].join(','),
      ...rows.map(t => [
        new Date(t.createdAt).toISOString(),
        t.type,
        (t.amount / 100).toFixed(2),
        t.status,
        `"${(t.description || '').replace(/"/g, '""')}"`,
      ].join(',')),
    ].join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: `revenue-${new Date().toISOString().slice(0, 10)}.csv`,
    });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white leading-none">Financial Management</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500">System: Online</span>
            </div>
          </div>
          <p className="text-zinc-500 text-xs font-semibold ml-1">Manage platform revenue, artist payouts, subscriptions, and compliance.</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleExportCSV} className="btn-secondary !px-8 flex items-center gap-2">
            <Download size={18} />
            <span className="text-[10px] font-bold">Export CSV</span>
          </button>
          <button onClick={() => setNewTransactionOpen(true)} className="btn-primary flex items-center gap-2 !px-10 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <Plus size={18} />
            <span className="text-[10px] font-bold">New Transaction</span>
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/5 rounded-[2rem] p-1.5 flex flex-wrap items-center gap-1.5 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.5rem] text-[10px] font-bold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white shadow-xl border border-white/5'
                  : 'text-zinc-600 hover:text-zinc-300'
              }`}
            >
              <Icon size={16} className={activeTab === tab.id ? 'text-emerald-500' : ''} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Workspace */}
      {isLoading ? (
        <div className="premium-card py-32 flex flex-col items-center justify-center text-center">
          <div className="relative mb-8">
            <div className="w-16 h-16 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <DollarSign size={24} className="text-emerald-500" />
            </div>
          </div>
          <p className="text-zinc-500 font-bold text-[10px]">Loading financial stats...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            {activeTab === 'revenue' && <RevenueSection stats={stats} onOpenRanking={() => setRankingOpen(true)} />}
            {activeTab === 'payouts' && (
              <PayoutsSection
                stats={stats}
                payouts={allPayouts}
                statusFilter={payoutStatusFilter}
                onStatusFilterChange={(s) => { setPayoutStatusFilter(s); fetchPayouts(s); }}
                onPayoutUpdated={() => { fetchPayouts(payoutStatusFilter); fetchStats(); }}
              />
            )}
            {activeTab === 'subscriptions' && <SubscriptionsSection stats={stats} />}
            {activeTab === 'compliance' && <ComplianceSection />}
            {activeTab === 'pricing' && <PricingSection />}
          </motion.div>
        </AnimatePresence>
      )}

      <NewTransactionModal
        isOpen={newTransactionOpen}
        onClose={() => setNewTransactionOpen(false)}
        onSuccess={() => { setNewTransactionOpen(false); fetchStats(); }}
      />
      <RevenueRankingModal isOpen={rankingOpen} onClose={() => setRankingOpen(false)} />
    </div>
  );
}

/* ─── New Transaction Modal ─── */
const NewTransactionModal = ({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [search, setSearch] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && artists.length === 0) {
      artistService.getAllArtists().then(setArtists).catch(() => {});
    }
    if (!isOpen) {
      setSelectedArtist(null); setAmount(''); setDescription(''); setSearch('');
    }
  }, [isOpen, artists.length]);

  const filteredArtists = artists.filter(a => a.name?.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = async () => {
    if (!selectedArtist) { toast.error('Select an artist'); return; }
    const dollars = parseFloat(amount);
    if (isNaN(dollars) || dollars <= 0) { toast.error('Enter a valid amount'); return; }
    if (!description.trim()) { toast.error('Enter a description'); return; }

    setIsSubmitting(true);
    const loadingId = toast.loading('Creating transaction...');
    try {
      await financeService.createTransaction(selectedArtist._id, Math.round(dollars * 100), description.trim());
      toast.success(`$${dollars.toFixed(2)} credited to ${selectedArtist.name}`, { id: loadingId });
      onSuccess();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create transaction', { id: loadingId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="premium-card w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">New Transaction</h3>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:bg-white/5 text-zinc-500"><X size={20} /></button>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Artist</label>
                {selectedArtist ? (
                  <div className="flex items-center justify-between input-field !py-3">
                    <span className="text-sm font-bold">{selectedArtist.name}</span>
                    <button onClick={() => setSelectedArtist(null)} className="text-zinc-500 hover:text-zinc-900 dark:text-white"><X size={16} /></button>
                  </div>
                ) : (
                  <>
                    <input
                      type="text" placeholder="Search artist by name..." value={search}
                      onChange={(e) => setSearch(e.target.value)} className="input-field"
                    />
                    {search && (
                      <div className="max-h-40 overflow-y-auto rounded-xl border border-black/5 dark:border-white/5">
                        {filteredArtists.slice(0, 8).map(a => (
                          <button
                            key={a._id} onClick={() => { setSelectedArtist(a); setSearch(''); }}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                          >
                            {a.name}
                          </button>
                        ))}
                        {filteredArtists.length === 0 && (
                          <p className="px-4 py-3 text-xs text-zinc-500">No artists match "{search}"</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Amount (USD)</label>
                <input
                  type="number" min="0.01" step="0.01" placeholder="0.00" value={amount}
                  onChange={(e) => setAmount(e.target.value)} className="input-field"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Description</label>
                <textarea
                  placeholder="e.g. Promotional bonus — Summer Fest 2026" value={description}
                  onChange={(e) => setDescription(e.target.value)} className="input-field h-24 resize-none"
                />
              </div>
              <div className="flex justify-end gap-4 pt-4 border-t border-black/5 dark:border-white/5">
                <button onClick={onClose} className="btn-secondary">Cancel</button>
                <button onClick={handleSubmit} disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? 'Creating...' : 'Create Transaction'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

/* ─── Revenue Ranking Modal ("Global Rank" / "Analyze Full Payout Spectrum") ─── */
const RevenueRankingModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [rankings, setRankings] = useState<AdminFinancialStats['topEarners']>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) { setPage(1); return; }
    setIsLoading(true);
    financeService.getRevenueRanking(page, 20)
      .then(res => { setRankings(res.rankings); setPages(res.pagination.pages); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [isOpen, page]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="premium-card w-full max-w-lg shadow-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Full Artist Revenue Ranking</h3>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:bg-white/5 text-zinc-500"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3">
              {isLoading ? (
                <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" /></div>
              ) : rankings.length === 0 ? (
                <p className="text-center text-zinc-500 text-sm py-12">No revenue data yet.</p>
              ) : (
                rankings.map((a, i) => (
                  <div key={a._id || i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-4">
                      <span className="w-6 text-center text-xs font-bold text-zinc-500">#{(page - 1) * 20 + i + 1}</span>
                      <span className="text-sm font-bold">{a.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-500">${(a.revenue / 100).toLocaleString()}</p>
                      <p className="text-[9px] text-zinc-600">{a.transactions} transactions</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {pages > 1 && (
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-black/5 dark:border-white/5">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary !px-5 !py-2 disabled:opacity-30">Previous</button>
                <span className="text-xs font-bold text-zinc-500">Page {page} of {pages}</span>
                <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="btn-secondary !px-5 !py-2 disabled:opacity-30">Next</button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

/* ─── Revenue Section ─── */
const RevenueSection = ({ stats, onOpenRanking }: { stats: AdminFinancialStats | null; onOpenRanking: () => void }) => {
  const [period, setPeriod] = useState<'30d' | '90d' | '1y'>('30d');
  const [series, setSeries] = useState<{ label: string; amount: number }[]>([]);
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    setChartLoading(true);
    financeService.getRevenueTimeSeries(period)
      .then(setSeries)
      .catch(() => setSeries([]))
      .finally(() => setChartLoading(false));
  }, [period]);

  const maxAmount = Math.max(1, ...series.map(s => s.amount));

  const displayStats = [
    { label: 'Cumulative Revenue', value: `$${((stats?.totalRevenue || 0) / 100).toLocaleString()}`, trend: '+12.5%', up: true, icon: DollarSign, color: 'text-emerald-500', bgColor: 'bg-emerald-500/5' },
    { label: 'Active Subscriptions', value: (stats?.activeSubscribers || 0).toLocaleString(), trend: '+5.2%', up: true, icon: Zap, color: 'text-blue-500', bgColor: 'bg-blue-500/5' },
    { label: 'Average User Value', value: `$${((stats?.avgRevenuePerUser || 0) / 100).toFixed(2)}`, trend: '+2.1%', up: true, icon: TrendingUp, color: 'text-indigo-500', bgColor: 'bg-indigo-500/5' },
    { label: 'Total Transactions', value: stats?.recentTransactions?.length || 0, trend: '-0.3%', up: false, icon: Activity, color: 'text-rose-500', bgColor: 'bg-rose-500/5' },
  ];

  const breakdown = [
    { label: 'Subscriptions', value: `$${((stats?.revenueBreakdown?.['subscription_payment'] || 0) / 100).toLocaleString()}`, pct: 65, color: 'bg-emerald-500' },
    { label: 'Virtual Gifts', value: `$${((stats?.revenueBreakdown?.['gift_received'] || 0) / 100).toLocaleString()}`, pct: 25, color: 'bg-blue-500' },
    { label: 'Coin Purchases', value: `$${((stats?.revenueBreakdown?.['coin_purchase'] || 0) / 100).toLocaleString()}`, pct: 10, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-10">
      {/* Primary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayStats.map((s, i) => (
          <div key={s.label} className="premium-card group hover:border-emerald-500/20 transition-all cursor-default">
            <div className="flex items-center justify-between mb-8">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.bgColor} border border-black/5 dark:border-white/5 transition-all group-hover:scale-110`}>
                <s.icon size={20} className={s.color} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold ${s.up ? 'text-emerald-500' : 'text-rose-500'} bg-black/40 px-2 py-1 rounded-lg border border-white/5`}>
                {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {s.trend}
              </div>
            </div>
            <p className="text-zinc-600 text-[10px] font-bold mb-1.5">{s.label}</p>
            <p className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tighter tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Revenue Analytics */}
        <div className="premium-card lg:col-span-2 space-y-10 border-black/5 dark:border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[10px] font-bold text-zinc-500 mb-1">Revenue Analytics</h3>
              <p className="text-[10px] text-zinc-700 font-bold">Revenue categorization and statistics</p>
            </div>
            <div className="flex bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/5 rounded-2xl p-1 shadow-inner">
              {(['30d', '90d', '1y'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setPeriod(t)}
                  className={`px-5 py-2 text-[10px] font-bold transition-all rounded-xl ${period === t ? 'bg-emerald-500 text-black' : 'text-zinc-600 hover:text-zinc-900 dark:text-white hover:bg-black/5 dark:bg-white/5'}`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 bg-zinc-100 dark:bg-zinc-950/50 border border-black/5 dark:border-white/5 rounded-3xl mb-8 flex flex-col items-center justify-center relative overflow-hidden group">
            {chartLoading ? (
              <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            ) : series.length === 0 ? (
              <>
                <BarChart3 className="w-12 h-12 text-zinc-800 relative z-10" />
                <p className="text-[10px] font-bold text-zinc-800 relative z-10 mt-4">No revenue data for this period</p>
              </>
            ) : (
              <div className="absolute inset-0 flex items-end justify-between gap-1 px-6 pb-6">
                {series.map((s) => (
                  <div
                    key={s.label}
                    className="flex-1 bg-emerald-500/20 rounded-t-lg transition-all hover:bg-emerald-500/40"
                    style={{ height: `${Math.max(4, (s.amount / maxAmount) * 100)}%` }}
                    title={`${s.label}: $${(s.amount / 100).toLocaleString()}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="flex rounded-full overflow-hidden h-3 bg-black/5 dark:bg-white/5 p-0.5 border border-black/5 dark:border-white/5">
              {breakdown.map((b) => (
                <div key={b.label} className={`${b.color} h-full first:rounded-l-full last:rounded-r-full shadow-[0_0_10px_rgba(0,0,0,0.5)]`} style={{ width: `${b.pct}%` }} />
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 pt-4">
              {breakdown.map((b) => (
                <div key={b.label} className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-black/5 dark:border-white/5 hover:border-black/10 dark:border-white/10 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${b.color} shadow-[0_0_8px_currentColor]`} />
                    <span className="text-[9px] font-bold text-zinc-500">{b.label}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight leading-none group-hover:text-emerald-400 transition-colors">{b.value}</p>
                    <span className="text-[10px] font-bold text-zinc-700">{b.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Earners */}
        <div className="premium-card space-y-10">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-zinc-500">Top Earners</h3>
            <button onClick={onOpenRanking} className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 transition-colors">Global Rank</button>
          </div>
          <div className="space-y-8 flex-1">
            {(stats?.topEarners || []).slice(0, 6).map((a, i) => (
              <div key={a.name} className="flex items-center justify-between group cursor-pointer hover:translate-x-1 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-black/5 dark:border-white/5 flex items-center justify-center text-[10px] font-bold text-zinc-600 transition-all group-hover:border-emerald-500/30 group-hover:text-emerald-500">
                    {a.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-200 group-hover:text-zinc-900 dark:text-white transition-colors">{a.name}</p>
                    <p className="text-[9px] text-zinc-600 font-bold mt-0.5">{a.transactions} Transactions</p>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-sm font-bold text-emerald-500 tracking-tight">${(a.revenue / 100).toLocaleString()}</p>
                   <div className="w-full h-1 bg-black/5 dark:bg-white/5 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-emerald-500/30" style={{ width: '70%' }} />
                   </div>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-6 border-t border-black/5 dark:border-white/5">
             <button onClick={onOpenRanking} className="w-full py-3.5 rounded-2xl bg-black/5 dark:bg-white/5 text-[10px] font-bold text-zinc-600 hover:text-zinc-900 dark:text-white hover:bg-black/10 dark:bg-white/10 transition-all border border-black/5 dark:border-white/5">Analyze Full Payout Spectrum</button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Payout Section ─── */
const PayoutsSection = ({
  stats, payouts, statusFilter, onStatusFilterChange, onPayoutUpdated,
}: {
  stats: AdminFinancialStats | null;
  payouts: Payout[];
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onPayoutUpdated: () => void;
}) => {
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const statusStyles: Record<string, string> = {
    completed: 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10',
    processing: 'text-blue-400 bg-blue-500/5 border-blue-500/10',
    pending: 'text-amber-400 bg-amber-500/5 border-amber-500/10',
    failed: 'text-rose-400 bg-rose-500/5 border-rose-500/10',
    cancelled: 'text-zinc-400 bg-zinc-500/5 border-zinc-500/10',
  };

  const handleStatusChange = async (payoutId: string, status: string) => {
    setActioningId(payoutId);
    const loadingId = toast.loading('Updating payout...');
    try {
      await financeService.updatePayoutStatus(payoutId, status);
      toast.success('Payout updated', { id: loadingId });
      onPayoutUpdated();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update payout', { id: loadingId });
    } finally {
      setActioningId(null);
    }
  };

  const filteredPayouts = payouts.filter(p =>
    !search || (p.artist?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10">
      {/* Payout Status */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Pending Payouts', value: `$${((stats?.payouts?.['pending']?.amount || 0) / 100).toLocaleString()}`, icon: Clock, color: 'text-amber-500' },
          { label: 'Completed Payouts', value: `$${((stats?.payouts?.['completed']?.amount || 0) / 100).toLocaleString()}`, icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Failed Payouts', value: `$${((stats?.payouts?.['failed']?.amount || 0) / 100).toLocaleString()}`, icon: XCircle, color: 'text-rose-500' },
          { label: 'Next Payout Cycle', value: 'FEB 15', icon: Calendar, color: 'text-blue-500' },
        ].map(s => (
          <div key={s.label} className="premium-card hover:border-emerald-500/20 transition-all group">
            <div className={`w-12 h-12 rounded-2xl bg-white/[0.03] border border-black/5 dark:border-white/5 flex items-center justify-center mb-6 transition-all group-hover:scale-110`}>
              <s.icon size={20} className={`${s.color}`} />
            </div>
            <p className="text-zinc-600 text-[10px] font-bold mb-1.5">{s.label}</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tighter leading-none">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Payout Log Table */}
      <div className="premium-card !p-0 overflow-hidden border-black/5 dark:border-white/5 shadow-2xl bg-white dark:bg-[#0a0a0a]">
        <div className="p-8 border-b border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-zinc-100 dark:bg-zinc-950/50">
          <div>
            <h3 className="text-[10px] font-bold text-zinc-500 mb-1">Payout Log</h3>
            <p className="text-[10px] text-zinc-700 font-bold">History of payments processed for artists</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-emerald-500 w-4 h-4 transition-colors" />
              <input
                type="text" placeholder="Search artist..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-12 !py-3 !text-[10px] font-bold"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setFilterOpen(o => !o)}
                className={`p-3 rounded-2xl transition-all border ${statusFilter ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-black/5 dark:bg-white/5 text-zinc-600 hover:text-zinc-900 dark:text-white border-black/5 dark:border-white/5'}`}
              >
                <Filter size={18} />
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/5 rounded-2xl shadow-2xl z-20 overflow-hidden">
                  {['', 'pending', 'processing', 'completed', 'failed', 'cancelled'].map(s => (
                    <button
                      key={s || 'all'}
                      onClick={() => { onStatusFilterChange(s); setFilterOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-[10px] font-bold capitalize transition-colors ${statusFilter === s ? 'text-emerald-500' : 'text-zinc-500 hover:text-zinc-900 dark:text-white'} hover:bg-black/5 dark:bg-white/5`}
                    >
                      {s || 'All Statuses'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/5 bg-black/20">
                <th className="px-8 py-6 text-[10px] font-bold text-zinc-600">Artist Name</th>
                <th className="px-8 py-6 text-[10px] font-bold text-zinc-600">Amount</th>
                <th className="px-8 py-6 text-[10px] font-bold text-zinc-600">Payment Method</th>
                <th className="px-8 py-6 text-[10px] font-bold text-zinc-600">Status</th>
                <th className="px-8 py-6 text-[10px] font-bold text-zinc-600">Date</th>
                <th className="px-8 py-6 text-[10px] font-bold text-zinc-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPayouts.map((p) => (
                <tr key={p._id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-black/5 dark:border-white/5 flex items-center justify-center text-[10px] font-bold text-zinc-600 group-hover:border-emerald-500/30 group-hover:text-emerald-500 transition-all">
                        {p.artist?.name?.substring(0, 2) || 'AT'}
                      </div>
                      <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:text-white transition-colors">{p.artist?.name || 'Unknown Artist'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-emerald-500">${(p.amount / 100).toLocaleString()}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500">
                       <Wallet size={12} className="text-zinc-700" />
                       {p.method}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-bold border ${statusStyles[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-[10px] text-zinc-600 font-bold">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {p.status === 'pending' && (
                        <>
                          <button
                            disabled={actioningId === p._id}
                            onClick={() => handleStatusChange(p._id, 'processing')}
                            title="Approve"
                            className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all disabled:opacity-40"
                          >
                            <ThumbsUp size={14} />
                          </button>
                          <button
                            disabled={actioningId === p._id}
                            onClick={() => handleStatusChange(p._id, 'cancelled')}
                            title="Reject"
                            className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all disabled:opacity-40"
                          >
                            <ThumbsDown size={14} />
                          </button>
                        </>
                      )}
                      {p.status === 'processing' && (
                        <>
                          <button
                            disabled={actioningId === p._id}
                            onClick={() => handleStatusChange(p._id, 'completed')}
                            title="Mark Paid"
                            className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all disabled:opacity-40"
                          >
                            <Banknote size={14} />
                          </button>
                          <button
                            disabled={actioningId === p._id}
                            onClick={() => handleStatusChange(p._id, 'failed')}
                            title="Mark Failed"
                            className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all disabled:opacity-40"
                          >
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                      {(p.status === 'completed' || p.status === 'failed' || p.status === 'cancelled') && (
                        <span className="text-[9px] text-zinc-700">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPayouts.length === 0 && (
                <tr><td colSpan={6} className="px-8 py-12 text-center text-[10px] text-zinc-600 font-bold">No payouts match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ─── Subscriptions Section ─── */
const SubscriptionsSection = ({ stats }: { stats: AdminFinancialStats | null }) => {
  const plans = [
    { name: 'Free Tier', price: '$0', period: '/mo', subscribers: '12,456', features: ['Ad-supported streams', '5 skips/hour', 'Standard audio quality'], icon: Music, color: 'zinc' },
    { name: 'Premium Tier', price: '$9.99', period: '/mo', subscribers: '5,234', features: ['Ad-free experience', 'Unlimited skips', 'High-quality audio'], icon: Zap, color: 'emerald', popular: true },
    { name: 'Pro Artist', price: '$14.99', period: '/mo', subscribers: '2,456', features: ['Lossless audio quality', 'Exclusive artist content', 'Priority support'], icon: Crown, color: 'indigo' },
  ];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {plans.map((plan) => (
          <div key={plan.name} className={`premium-card relative group transition-all duration-500 hover:border-emerald-500/30 ${plan.popular ? 'border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_50px_rgba(16,185,129,0.05)]' : 'border-white/5 bg-zinc-950/30'}`}>
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 text-[9px] font-bold text-black bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20">
                Most Popular
              </div>
            )}
            <div className={`w-14 h-14 rounded-2xl mb-10 flex items-center justify-center bg-black/5 dark:bg-white/5 text-zinc-500 group-hover:text-emerald-500 transition-all duration-500 group-hover:scale-110 border border-black/5 dark:border-white/5`}>
              <plan.icon size={28} />
            </div>
            <h4 className="text-[10px] font-bold text-zinc-500 mb-4">{plan.name}</h4>
            <div className="mb-10 flex items-end gap-1">
              <span className="text-5xl font-bold text-zinc-900 dark:text-white tracking-tighter leading-none">{plan.price}</span>
              <span className="text-zinc-600 text-xs font-bold mb-1">{plan.period}</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/40 dark:bg-black/40 rounded-2xl border border-black/5 dark:border-white/5 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-10">
              <Users size={16} className="text-emerald-500" />
              {plan.subscribers} Active Subscribers
            </div>
            <ul className="space-y-6 mb-12">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-4 text-xs font-medium text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-300 transition-colors">
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed text-[10px] font-bold">{f}</span>
                </li>
              ))}
            </ul>
            <button className="w-full py-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[10px] font-bold hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all duration-500">Edit Plan Specs</button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Compliance Section ─── */
const ComplianceSection = () => {
  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row items-center gap-8 bg-amber-500/5 border border-amber-500/10 rounded-[2rem] p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-amber-500/10 transition-all duration-700" />
        <div className="w-16 h-16 rounded-[1.5rem] bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-xl">
          <AlertCircle className="w-8 h-8 text-amber-500" />
        </div>
        <div className="flex-1 relative z-10">
          <p className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Tax Compliance Audits Needed</p>
          <p className="text-[11px] font-bold text-zinc-500 leading-loose max-w-2xl">22 artists are currently flagged for missing or invalid IRS tax forms. Payout cycles are suspended for these accounts until tax forms are verified.</p>
        </div>
        <button className="btn-primary !bg-amber-500 !text-black hover:!bg-amber-400 !px-12 relative z-10 shadow-2xl shadow-amber-500/20">
           <span className="text-[10px] font-bold">Initiate Audit</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="premium-card space-y-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center shadow-xl"><FileText size={22} className="text-emerald-500" /></div>
            <div>
              <h3 className="text-[10px] font-bold text-zinc-500 mb-1">Tax Documents</h3>
              <p className="text-[10px] text-zinc-700 font-bold">W-9/1099 verification status</p>
            </div>
          </div>
          <div className="space-y-8">
            {[
              { label: 'Completed W-9 Forms', value: '234 / 256', trend: 'warning' },
              { label: 'Generated 1099 Forms', value: '198 Active', trend: 'ok' },
              { label: 'International Forms', value: '45 / 48', trend: 'warning' },
            ].map(item => (
              <div key={item.label} className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-bold text-zinc-600">{item.label}</span>
                  <span className={`text-[10px] font-bold ${item.trend === 'ok' ? 'text-emerald-500' : 'text-amber-500'}`}>{item.value}</span>
                </div>
                <div className="w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                   <div className={`h-full ${item.trend === 'ok' ? 'bg-emerald-500' : 'bg-amber-500'} shadow-[0_0_8px_currentColor]`} style={{ width: item.trend === 'ok' ? '80%' : '92%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="premium-card space-y-10">
           <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center shadow-xl"><FileCheck size={22} className="text-blue-500" /></div>
            <div>
              <h3 className="text-[10px] font-bold text-zinc-500 mb-1">System Audits</h3>
              <p className="text-[10px] text-zinc-700 font-bold">Quarterly financial verification results</p>
            </div>
          </div>
          <div className="space-y-8">
            {[
              { label: 'Q4 2025 Revenue Audit', value: 'Completed', status: 'ok' },
              { label: 'Annual Financial Audit', value: 'In Progress', status: 'warning' },
              { label: 'Royalty Distribution Sync', value: 'Pending Sync', status: 'warning' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center p-5 bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl group hover:border-black/10 dark:border-white/10 transition-all cursor-default">
                <span className="text-[10px] font-bold text-zinc-500">{item.label}</span>
                <div className="flex items-center gap-3">
                   <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'ok' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'}`} />
                   <span className={`text-[10px] font-bold ${item.status === 'ok' ? 'text-emerald-500' : 'text-amber-500'}`}>{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Regional Pricing Section ─── */
const PricingSection = () => {
  const tiers = [
    { region: 'UNITED STATES', currency: 'USD', premium: '$9.99', pro: '$14.99' },
    { region: 'EUROPEAN UNION', currency: 'EUR', premium: '€9.49', pro: '€13.99' },
    { region: 'UNITED KINGDOM', currency: 'GBP', premium: '£7.99', pro: '£11.99' },
    { region: 'JAPAN', currency: 'JPY', premium: '¥980', pro: '¥1,480' },
  ];

  return (
    <div className="premium-card !p-0 overflow-hidden border-black/5 dark:border-white/5 shadow-2xl bg-white dark:bg-[#0a0a0a]">
      <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-zinc-100 dark:bg-zinc-950/50">
        <div>
          <h3 className="text-[10px] font-bold text-zinc-500 mb-1">Global Pricing Tiers</h3>
          <p className="text-[10px] text-zinc-700 font-bold">Pricing configurations across different regions</p>
        </div>
        <button className="btn-primary flex items-center gap-3 !px-8 !py-3.5 shadow-xl shadow-emerald-500/10">
          <Plus size={16} /> 
          <span className="text-[10px] font-bold uppercase">Add New Region</span>
        </button>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-black/5 dark:border-white/5 bg-black/20">
            <th className="px-8 py-6 text-[10px] font-bold text-zinc-600">Region</th>
            <th className="px-8 py-6 text-[10px] font-bold text-zinc-600">Currency</th>
            <th className="px-8 py-6 text-[10px] font-bold text-zinc-600">Premium Tier</th>
            <th className="px-8 py-6 text-[10px] font-bold text-zinc-600">Pro Artist</th>
            <th className="px-8 py-6 text-[10px] font-bold text-zinc-600 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {tiers.map((t) => (
            <tr key={t.region} className="hover:bg-white/[0.01] transition-colors group">
              <td className="px-8 py-6 text-sm font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:text-white transition-colors uppercase">{t.region}</td>
              <td className="px-8 py-6">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500">
                    <Globe size={14} className="text-zinc-700" />
                    {t.currency}
                 </div>
              </td>
              <td className="px-8 py-6 text-sm font-bold text-zinc-900 dark:text-white tracking-tighter">{t.premium}</td>
              <td className="px-8 py-6 text-sm font-bold text-emerald-500 tracking-tighter">{t.pro}</td>
              <td className="px-8 py-6 text-right">
                <button className="px-6 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-[10px] font-bold text-zinc-600 hover:text-zinc-900 dark:text-white hover:bg-black/10 dark:bg-white/10 transition-all border border-black/5 dark:border-white/5">Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
