import { useState, useEffect } from 'react';
import {
  TrendingUp, CreditCard, FileText, Receipt, Settings,
  DollarSign, Users, ArrowUpRight, ArrowDownRight, BarChart3,
  Download, Filter, Calendar, ChevronRight, Clock, CheckCircle2,
  AlertCircle, XCircle, Shield, FileCheck, Activity, Search,
  Music, Zap, Crown, Star, Percent, Globe, Tag, Plus
} from 'lucide-react';
import financeService, { AdminFinancialStats, Payout } from '../../services/financeService';

const card = 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg';

const tabs = [
  { id: 'revenue', label: 'Revenue', icon: TrendingUp },
  { id: 'payouts', label: 'Payouts', icon: CreditCard },
  { id: 'subscriptions', label: 'Subscriptions', icon: Receipt },
  { id: 'compliance', label: 'Compliance', icon: FileText },
  { id: 'pricing', label: 'Pricing', icon: Settings },
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
    <div className="max-w-5xl mx-auto pb-16 space-y-6">
      {/* Header */}
      <div className={`${card} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Financial Management
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Monitor revenue, payouts, and financial operations
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded hover:opacity-80 transition-opacity">
            <Calendar className="w-3.5 h-3.5" />
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 rounded hover:opacity-90 transition-opacity">
            <Download className="w-3.5 h-3.5" />
            Export Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded p-1 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded transition-all ${activeTab === tab.id
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {activeTab === 'revenue' && <RevenueSection stats={stats} />}
          {activeTab === 'payouts' && <PayoutsSection stats={stats} payouts={allPayouts} />}
          {activeTab === 'subscriptions' && <SubscriptionsSection stats={stats} />}
          {activeTab === 'compliance' && <ComplianceSection />}
          {activeTab === 'pricing' && <PricingSection />}
        </div>
      )}
    </div>
  );
}

/* ─── Revenue ─── */
const RevenueSection = ({ stats }: { stats: AdminFinancialStats | null }) => {
  const displayStats = [
    { label: 'Total Revenue', value: `$${((stats?.totalRevenue || 0) / 100).toLocaleString()}`, trend: '+12.5%', up: true, icon: DollarSign, color: 'text-emerald-500', bgColor: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: 'Subscribers', value: (stats?.activeSubscribers || 0).toLocaleString(), trend: '+5.2%', up: true, icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-500/10' },
    { label: 'Avg Rev / User', value: `$${((stats?.avgRevenuePerUser || 0) / 100).toFixed(2)}`, trend: '+2.1%', up: true, icon: TrendingUp, color: 'text-indigo-500', bgColor: 'bg-indigo-50 dark:bg-indigo-500/10' },
    { label: 'Transactions', value: stats?.recentTransactions?.length || 0, trend: '-0.3%', up: false, icon: Activity, color: 'text-rose-500', bgColor: 'bg-rose-50 dark:bg-rose-500/10' },
  ];

  const total = (stats?.revenueBreakdown?.['subscription_payment'] || 0) +
    (stats?.revenueBreakdown?.['coin_purchase'] || 0) +
    (stats?.revenueBreakdown?.['gift_received'] || 0);

  const breakdown = [
    { label: 'Subscriptions', value: `$${((stats?.revenueBreakdown?.['subscription_payment'] || 0) / 100).toLocaleString()}`, pct: total > 0 ? Math.round((stats?.revenueBreakdown?.['subscription_payment'] || 0) / total * 100) : 0, color: 'bg-emerald-500' },
    { label: 'Virtual Gifts', value: `$${((stats?.revenueBreakdown?.['gift_received'] || 0) / 100).toLocaleString()}`, pct: total > 0 ? Math.round((stats?.revenueBreakdown?.['gift_received'] || 0) / total * 100) : 0, color: 'bg-blue-500' },
    { label: 'Coin Purchases', value: `$${((stats?.revenueBreakdown?.['coin_purchase'] || 0) / 100).toLocaleString()}`, pct: total > 0 ? Math.round((stats?.revenueBreakdown?.['coin_purchase'] || 0) / total * 100) : 0, color: 'bg-amber-500' },
    { label: 'Other', value: '$0', pct: 0, color: 'bg-zinc-400' },
  ];

  const topArtists = (stats?.topEarners || []).map(te => ({
    name: te.name,
    revenue: `$${(te.revenue / 100).toLocaleString()}`,
    streams: te.transactions.toString(),
    avatar: te.name.substring(0, 2).toUpperCase()
  }));

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {displayStats.map((s) => (
          <div key={s.label} className={`${card} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded ${s.bgColor}`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <span className={`text-[10px] font-bold ${s.up ? 'text-emerald-500' : 'text-rose-500'}`}>
                {s.trend}
              </span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">{s.label}</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Breakdown */}
        <div className={`${card} lg:col-span-2 p-6`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight">Revenue Breakdown</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">Performance by income stream</p>
            </div>
            <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded p-0.5">
              {['Monthly', 'Yearly'].map(t => (
                <button key={t} className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="h-48 bg-zinc-50 dark:bg-zinc-800/20 rounded-lg mb-8 flex items-center justify-center border border-zinc-100 dark:border-white/[0.04]">
            <BarChart3 className="w-12 h-12 text-zinc-200 dark:text-white/5" />
          </div>

          <div className="flex rounded-full overflow-hidden h-2.5 mb-6 bg-zinc-100 dark:bg-zinc-800">
            {breakdown.map((b) => (
              <div key={b.label} className={`${b.color} transition-all`} style={{ width: `${b.pct}%` }} />
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {breakdown.map((b) => (
              <div key={b.label} className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${b.color}`} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{b.label}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold text-zinc-900 dark:text-white">{b.value}</span>
                  <span className="text-[10px] font-medium text-zinc-500">({b.pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Earning Artists */}
        <div className={`${card} p-6`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight">Top Earners</h3>
            <button className="text-[10px] font-bold text-emerald-500 hover:underline uppercase tracking-widest">View All</button>
          </div>
          <div className="space-y-5">
            {topArtists.map((a, i) => (
              <div key={a.name} className="flex items-center gap-4 group">
                <span className="text-[10px] font-bold text-zinc-400 w-3">{i + 1}</span>
                <div className="w-9 h-9 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-[10px] font-bold text-zinc-500 uppercase">
                  {a.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{a.name}</p>
                  <p className="text-[10px] font-medium text-zinc-500">{a.streams} transactions</p>
                </div>
                <p className="text-xs font-bold text-zinc-900 dark:text-white">{a.revenue}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Payouts ─── */
const PayoutsSection = ({ stats, payouts }: { stats: AdminFinancialStats | null, payouts: Payout[] }) => {
  const payoutStats = [
    { label: 'Pending Payouts', value: `$${((stats?.payouts?.['pending']?.amount || 0) / 100).toLocaleString()}`, sub: `${stats?.payouts?.['pending']?.count || 0} artists`, icon: Clock, color: 'text-amber-500', bgColor: 'bg-amber-50 dark:bg-amber-500/10' },
    { label: 'Processed', value: `$${((stats?.payouts?.['completed']?.amount || 0) / 100).toLocaleString()}`, sub: `${stats?.payouts?.['completed']?.count || 0} completed`, icon: CheckCircle2, color: 'text-emerald-500', bgColor: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: 'Failed Payouts', value: `$${((stats?.payouts?.['failed']?.amount || 0) / 100).toLocaleString()}`, sub: `${stats?.payouts?.['failed']?.count || 0} errors`, icon: XCircle, color: 'text-rose-500', bgColor: 'bg-rose-50 dark:bg-rose-500/10' },
    { label: 'Next Batch', value: 'Feb 15', sub: 'In 4 days', icon: Calendar, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-500/10' },
  ];

  const statusStyles: Record<string, string> = {
    completed: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20',
    processing: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20',
    pending: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20',
    failed: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20',
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {payoutStats.map((s) => (
          <div key={s.label} className={`${card} p-5`}>
            <div className={`w-9 h-9 rounded ${s.bgColor} flex items-center justify-center mb-4`}>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">{s.label}</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">{s.value}</p>
            <p className="text-[10px] font-medium text-zinc-500 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Payouts Table */}
      <div className={card}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 gap-4 border-b border-zinc-100 dark:border-white/[0.06]">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight">Recent Payouts</h3>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search artists..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
            <button className="px-4 py-2 text-[10px] font-bold text-white bg-emerald-500 rounded uppercase tracking-wider hover:bg-emerald-600 transition-colors">
              Process All
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-white/[0.04] bg-zinc-50/50 dark:bg-zinc-800/20">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Artist</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Amount</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Method</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Date</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-widest text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
              {payouts.map((p) => (
                <tr key={p._id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-[10px] font-bold text-zinc-500 uppercase">
                        {p.artist?.name?.substring(0, 2) || 'A'}
                      </div>
                      <span className="text-sm font-bold text-zinc-900 dark:text-white">{p.artist?.name || 'Unknown Artist'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-zinc-900 dark:text-white">${(p.amount / 100).toLocaleString()}</td>
                  <td className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">{p.method}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${statusStyles[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[11px] font-medium text-zinc-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[10px] font-bold text-emerald-500 hover:underline uppercase tracking-widest">Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ─── Subscriptions ─── */
const SubscriptionsSection = ({ stats }: { stats: AdminFinancialStats | null }) => {
  const plans = [
    { name: 'Free', price: '$0', period: '/month', subscribers: '12,456', features: ['Ad-supported', '5 skips/hour', 'Standard audio'], color: 'zinc', icon: Music },
    { name: 'Premium', price: '$9.99', period: '/month', subscribers: '5,234', features: ['Ad-free', 'Unlimited skips', 'High quality'], color: 'emerald', icon: Zap, popular: true },
    { name: 'Pro', price: '$14.99', period: '/month', subscribers: '2,456', features: ['Lossless audio', 'Exclusive content', 'Priority support'], color: 'indigo', icon: Crown },
    { name: 'Family', price: '$19.99', period: '/month', subscribers: '1,544', features: ['Up to 6 accounts', 'All Pro features', 'Shared playlists'], color: 'blue', icon: Users },
  ];

  const planStyles: Record<string, string> = {
    zinc: 'border-zinc-200 dark:border-white/10',
    emerald: 'border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-500/5',
    indigo: 'border-indigo-200 dark:border-indigo-500/20',
    blue: 'border-blue-200 dark:border-blue-500/20',
  };

  const iconStyles: Record<string, string> = {
    zinc: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500',
    emerald: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    indigo: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
    blue: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
  };

  return (
    <div className="space-y-6">
      {/* Overview stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Subscribers', value: (stats?.activeSubscribers || 0).toLocaleString(), icon: Users, color: 'text-emerald-500', trend: '+8.3%' },
          { label: 'Monthly Revenue', value: `$${((stats?.revenueBreakdown?.['subscription_payment'] || 0) / 100).toLocaleString()}`, icon: DollarSign, color: 'text-blue-500', trend: '+11.2%' },
          { label: 'Retention Rate', value: '94.2%', icon: TrendingUp, color: 'text-indigo-500', trend: '+2.1%' },
        ].map(s => (
          <div key={s.label} className={`${card} p-5`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-9 h-9 rounded bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{s.label}</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">{s.value}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-500">{s.trend} improvement</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight">Subscription Plans</h3>
        <button className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 rounded uppercase tracking-wider hover:opacity-90 transition-opacity">
          <Plus className="w-3.5 h-3.5" /> New Plan
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <div key={plan.name} className={`${card} ${planStyles[plan.color]} p-6 relative group transition-all hover:border-emerald-500/30`}>
              {plan.popular && (
                <span className="absolute -top-2.5 left-6 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white bg-emerald-500 rounded-full">
                  Popular
                </span>
              )}
              <div className={`w-10 h-10 rounded mb-5 flex items-center justify-center ${iconStyles[plan.color]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight">{plan.name}</h4>
              <div className="mt-2 mb-5">
                <span className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{plan.price}</span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase ml-1">{plan.period}</span>
              </div>
              <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-6">
                <Users className="w-3 h-3" />
                {plan.subscribers}
              </div>
              <ul className="space-y-2.5 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[11px] font-medium text-zinc-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded hover:opacity-80 transition-opacity">
                Edit Plan
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Compliance ─── */
const ComplianceSection = () => {
  const complianceItems = [
    {
      title: 'Tax Documents',
      desc: 'W-9, 1099, and international tax forms',
      icon: FileText,
      status: 'Up to date',
      items: [
        { name: 'W-9 Forms Collected', value: '234 / 256', type: 'warning' },
        { name: '1099 Forms Generated', value: '198', type: 'ok' },
        { name: 'International Tax Forms', value: '45 / 48', type: 'warning' },
      ],
    },
    {
      title: 'Audit Reports',
      desc: 'Regulatory and financial compliance logs',
      icon: FileCheck,
      status: 'Action needed',
      items: [
        { name: 'Q4 2025 Revenue Report', value: 'Ready', type: 'ok' },
        { name: 'Annual Audit Report', value: 'In Progress', type: 'warning' },
        { name: 'Royalty Distribution', value: 'Pending Review', type: 'warning' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg p-5">
        <div className="w-10 h-10 rounded bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-amber-900 dark:text-amber-200">22 artists missing tax documents</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5 font-medium">Payouts for these artists are currently on hold.</p>
        </div>
        <button className="px-4 py-2 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-200/50 dark:bg-amber-500/20 rounded uppercase tracking-widest hover:opacity-80 transition-opacity">
          Review List
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {complianceItems.map((section) => (
          <div key={section.title} className={card}>
            <div className="p-6 border-b border-zinc-100 dark:border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                  <section.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight">{section.title}</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{section.desc}</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
              {section.items.map((item) => (
                <div key={item.name} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${item.type === 'ok' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Pricing ─── */
const PricingSection = () => {
  const tiers = [
    { region: 'United States', currency: 'USD', premium: '$9.99', pro: '$14.99' },
    { region: 'European Union', currency: 'EUR', premium: '€9.49', pro: '€13.99' },
    { region: 'United Kingdom', currency: 'GBP', premium: '£7.99', pro: '£11.99' },
    { region: 'Japan', currency: 'JPY', premium: '¥980', pro: '¥1,480' },
  ];

  return (
    <div className={card}>
      <div className="p-6 border-b border-zinc-100 dark:border-white/[0.06] flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight">Regional Pricing</h3>
        <button className="px-4 py-2 text-[10px] font-bold text-white bg-emerald-500 rounded uppercase tracking-wider hover:bg-emerald-600 transition-colors">
          Add Region
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-white/[0.04] bg-zinc-50/50 dark:bg-zinc-800/20">
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Region</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Currency</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Premium</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Pro</th>
              <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-widest text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
            {tiers.map((t) => (
              <tr key={t.region} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-zinc-900 dark:text-white">{t.region}</td>
                <td className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">{t.currency}</td>
                <td className="px-6 py-4 text-sm font-bold text-zinc-900 dark:text-white">{t.premium}</td>
                <td className="px-6 py-4 text-sm font-bold text-zinc-900 dark:text-white">{t.pro}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-[10px] font-bold text-emerald-500 hover:underline uppercase tracking-widest">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
rencies</p>
          </div>
        </div>
      </div>
    </div>
  );
};
