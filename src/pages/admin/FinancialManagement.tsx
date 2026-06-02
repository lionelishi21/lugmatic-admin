import { useState, useEffect } from 'react';
import {
  TrendingUp, CreditCard, FileText, Receipt, Settings,
  DollarSign, Users, Activity, BarChart3, Download,
  Filter, Calendar, ChevronRight, Clock, CheckCircle2,
  AlertCircle, XCircle, Search, Music, Zap, Crown, Plus,
  FileCheck, ShieldCheck, ArrowUpRight, ArrowDownRight,
  Package, Globe, Layers, Wallet
} from 'lucide-react';
import financeService, { AdminFinancialStats, Payout } from '../../services/financeService';
import { motion, AnimatePresence } from 'framer-motion';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [revenueStats, payoutList] = await Promise.all([
          financeService.getAdminRevenue(),
          financeService.getAdminPayouts()
        ]);
        setStats(revenueStats);
        setAllPayouts(payoutList);
      } catch (error) {
        console.error('Error fetching financial data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

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
          <button className="btn-secondary !px-8 flex items-center gap-2">
            <Download size={18} />
            <span className="text-[10px] font-bold">Export CSV</span>
          </button>
          <button className="btn-primary flex items-center gap-2 !px-10 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
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
            {activeTab === 'revenue' && <RevenueSection stats={stats} />}
            {activeTab === 'payouts' && <PayoutsSection stats={stats} payouts={allPayouts} />}
            {activeTab === 'subscriptions' && <SubscriptionsSection stats={stats} />}
            {activeTab === 'compliance' && <ComplianceSection />}
            {activeTab === 'pricing' && <PricingSection />}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

/* ─── Revenue Section ─── */
const RevenueSection = ({ stats }: { stats: AdminFinancialStats | null }) => {
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
              {['30D', '90D', '1Y'].map(t => (
                <button key={t} className="px-5 py-2 text-[10px] font-bold text-zinc-600 hover:text-zinc-900 dark:text-white transition-all rounded-xl hover:bg-black/5 dark:bg-white/5">
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 bg-zinc-100 dark:bg-zinc-950/50 border border-black/5 dark:border-white/5 rounded-3xl mb-8 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 flex items-end justify-between px-10 pb-10">
               {[...Array(12)].map((_, i) => (
                 <div key={i} className="w-8 bg-emerald-500/10 rounded-t-lg transition-all group-hover:bg-emerald-500/20" style={{ height: `${20 + Math.random() * 60}%` }} />
               ))}
            </div>
            <BarChart3 className="w-12 h-12 text-zinc-800 relative z-10" />
            <p className="text-[10px] font-bold text-zinc-800 relative z-10 mt-4">Financial Chart</p>
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
            <button className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 transition-colors">Global Rank</button>
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
             <button className="w-full py-3.5 rounded-2xl bg-black/5 dark:bg-white/5 text-[10px] font-bold text-zinc-600 hover:text-zinc-900 dark:text-white hover:bg-black/10 dark:bg-white/10 transition-all border border-black/5 dark:border-white/5">Analyze Full Payout Spectrum</button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Payout Section ─── */
const PayoutsSection = ({ stats, payouts }: { stats: AdminFinancialStats | null, payouts: Payout[] }) => {
  const statusStyles: Record<string, string> = {
    completed: 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10',
    processing: 'text-blue-400 bg-blue-500/5 border-blue-500/10',
    pending: 'text-amber-400 bg-amber-500/5 border-amber-500/10',
    failed: 'text-rose-400 bg-rose-500/5 border-rose-500/10',
  };

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
              <input type="text" placeholder="Search artist..." className="input-field pl-12 !py-3 !text-[10px] font-bold" />
            </div>
            <button className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 text-zinc-600 hover:text-zinc-900 dark:text-white transition-all border border-black/5 dark:border-white/5"><Filter size={18} /></button>
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
                <th className="px-8 py-6 text-[10px] font-bold text-zinc-600 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payouts.map((p) => (
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
                  <td className="px-8 py-5 text-right text-[10px] text-zinc-600 font-bold">{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-8 bg-white dark:bg-[#0a0a0a] border-t border-black/5 dark:border-white/5 text-center">
            <button className="text-[10px] font-bold text-zinc-700 hover:text-zinc-900 dark:text-white transition-all">Load Extended Archive</button>
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
