import { useState, useEffect } from 'react';
import {
  TrendingUp, CreditCard, FileText, Receipt, Settings,
  DollarSign, Users, Activity, BarChart3, Download,
  Filter, Calendar, ChevronRight, Clock, CheckCircle2,
  AlertCircle, XCircle, Search, Music, Zap, Crown, Plus,
  FileCheck
} from 'lucide-react';
import financeService, { AdminFinancialStats, Payout } from '../../services/financeService';
import { motion, AnimatePresence } from 'framer-motion';

const tabs = [
  { id: 'revenue', label: 'Revenue', icon: TrendingUp },
  { id: 'payouts', label: 'Payouts', icon: CreditCard },
  { id: 'subscriptions', label: 'Plans', icon: Receipt },
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Finance</h1>
          <p className="text-zinc-500">Monitor revenue, payouts, and financial health.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Download size={18} />
            Export
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#0a0a0a] border border-white/5 rounded-2xl p-1 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="premium-card py-24 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
          <p className="text-zinc-500 font-medium">Processing financial data...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
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

/* ─── Revenue ─── */
const RevenueSection = ({ stats }: { stats: AdminFinancialStats | null }) => {
  const displayStats = [
    { label: 'Total Revenue', value: `$${((stats?.totalRevenue || 0) / 100).toLocaleString()}`, trend: '+12.5%', up: true, icon: DollarSign, color: 'text-emerald-500', bgColor: 'bg-emerald-500/5' },
    { label: 'Active Subscribers', value: (stats?.activeSubscribers || 0).toLocaleString(), trend: '+5.2%', up: true, icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-500/5' },
    { label: 'Avg Rev / User', value: `$${((stats?.avgRevenuePerUser || 0) / 100).toFixed(2)}`, trend: '+2.1%', up: true, icon: TrendingUp, color: 'text-indigo-500', bgColor: 'bg-indigo-500/5' },
    { label: 'Transactions', value: stats?.recentTransactions?.length || 0, trend: '-0.3%', up: false, icon: Activity, color: 'text-rose-500', bgColor: 'bg-rose-500/5' },
  ];

  const breakdown = [
    { label: 'Subscriptions', value: `$${((stats?.revenueBreakdown?.['subscription_payment'] || 0) / 100).toLocaleString()}`, pct: 65, color: 'bg-emerald-500' },
    { label: 'Virtual Gifts', value: `$${((stats?.revenueBreakdown?.['gift_received'] || 0) / 100).toLocaleString()}`, pct: 25, color: 'bg-blue-500' },
    { label: 'Coin Purchases', value: `$${((stats?.revenueBreakdown?.['coin_purchase'] || 0) / 100).toLocaleString()}`, pct: 10, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayStats.map((s, i) => (
          <div key={s.label} className="premium-card premium-card-hover">
            <div className="flex items-center justify-between mb-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bgColor}`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <span className={`text-xs font-bold ${s.up ? 'text-emerald-500' : 'text-rose-500'}`}>
                {s.trend}
              </span>
            </div>
            <p className="text-zinc-500 text-xs font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-white tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Revenue Breakdown */}
        <div className="premium-card lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Revenue Breakdown</h3>
            <div className="flex bg-[#0a0a0a] border border-white/5 rounded-xl p-1">
              {['30D', '90D', '1Y'].map(t => (
                <button key={t} className="px-3 py-1 text-[10px] font-bold text-zinc-500 hover:text-white">
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="h-48 bg-white/[0.02] border border-white/5 rounded-2xl mb-8 flex items-center justify-center">
            <BarChart3 className="w-10 h-10 text-white/5" />
          </div>

          <div className="space-y-6">
            <div className="flex rounded-full overflow-hidden h-2.5 bg-white/5">
              {breakdown.map((b) => (
                <div key={b.label} className={`${b.color} h-full`} style={{ width: `${b.pct}%` }} />
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {breakdown.map((b) => (
                <div key={b.label} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${b.color}`} />
                    <span className="text-xs font-medium text-zinc-500">{b.label}</span>
                  </div>
                  <p className="text-lg font-bold text-white">{b.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Earners */}
        <div className="premium-card">
          <h3 className="text-lg font-bold mb-8">Top Earning Artists</h3>
          <div className="space-y-6">
            {(stats?.topEarners || []).slice(0, 5).map((a, i) => (
              <div key={a.name} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center text-xs font-bold text-zinc-400">
                    {a.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">{a.name}</p>
                    <p className="text-[11px] text-zinc-500">{a.transactions} payments</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-white">${(a.revenue / 100).toLocaleString()}</p>
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
  const statusStyles: Record<string, string> = {
    completed: 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10',
    processing: 'text-blue-400 bg-blue-500/5 border-blue-500/10',
    pending: 'text-amber-400 bg-amber-500/5 border-amber-500/10',
    failed: 'text-rose-400 bg-rose-500/5 border-rose-500/10',
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Pending Payouts', value: `$${((stats?.payouts?.['pending']?.amount || 0) / 100).toLocaleString()}`, icon: Clock, color: 'text-amber-500' },
          { label: 'Total Processed', value: `$${((stats?.payouts?.['completed']?.amount || 0) / 100).toLocaleString()}`, icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Failed Batches', value: `$${((stats?.payouts?.['failed']?.amount || 0) / 100).toLocaleString()}`, icon: XCircle, color: 'text-rose-500' },
          { label: 'Next Cycle', value: 'Feb 15', icon: Calendar, color: 'text-blue-500' },
        ].map(s => (
          <div key={s.label} className="premium-card">
            <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-6`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className="text-zinc-500 text-xs font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-white tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="premium-card !p-0 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-lg font-bold">Recent Payouts</h3>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <input type="text" placeholder="Search artist..." className="input-field pl-11" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Artist</th>
                <th className="px-6 py-5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-5 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payouts.map((p) => (
                <tr key={p._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/5 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                        {p.artist?.name?.substring(0, 2) || 'A'}
                      </div>
                      <span className="text-sm font-semibold text-white">{p.artist?.name || 'Unknown Artist'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-white">${(p.amount / 100).toLocaleString()}</td>
                  <td className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">{p.method}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusStyles[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-zinc-500 font-medium">{new Date(p.createdAt).toLocaleDateString()}</td>
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
    { name: 'Free', price: '$0', period: '/mo', subscribers: '12,456', features: ['Ad-supported', '5 skips/hour', 'Standard audio'], icon: Music, color: 'zinc' },
    { name: 'Premium', price: '$9.99', period: '/mo', subscribers: '5,234', features: ['Ad-free', 'Unlimited skips', 'High quality'], icon: Zap, color: 'emerald', popular: true },
    { name: 'Pro', price: '$14.99', period: '/mo', subscribers: '2,456', features: ['Lossless audio', 'Exclusive content', 'Priority support'], icon: Crown, color: 'indigo' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.name} className={`premium-card relative group transition-all hover:border-emerald-500/30 ${plan.popular ? 'border-emerald-500/20 bg-emerald-500/5' : ''}`}>
            {plan.popular && (
              <span className="absolute -top-3 left-6 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-black bg-emerald-500 rounded-full">
                Most Popular
              </span>
            )}
            <div className={`w-12 h-12 rounded-2xl mb-8 flex items-center justify-center bg-white/5 text-zinc-400 group-hover:text-white transition-colors`}>
              <plan.icon size={24} />
            </div>
            <h4 className="text-lg font-bold mb-2">{plan.name}</h4>
            <div className="mb-6">
              <span className="text-3xl font-bold text-white tracking-tight">{plan.price}</span>
              <span className="text-zinc-500 text-sm ml-1">{plan.period}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-8">
              <Users size={14} className="text-emerald-500" />
              {plan.subscribers} Subscribers
            </div>
            <ul className="space-y-4 mb-10">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-zinc-400">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  {f}
                </li>
              ))}
            </ul>
            <button className="w-full btn-secondary">Edit Plan Details</button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Compliance ─── */
const ComplianceSection = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
          <AlertCircle className="w-6 h-6 text-amber-500" />
        </div>
        <div className="flex-1">
          <p className="text-white font-bold">Tax Compliance Alert</p>
          <p className="text-sm text-zinc-500 mt-1">22 artists are missing required tax documentation. Payouts are currently paused.</p>
        </div>
        <button className="btn-primary !bg-amber-500 !text-black hover:!bg-amber-400">Review Compliance</button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="premium-card">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><FileText size={20} className="text-emerald-500" /></div>
            <h3 className="text-lg font-bold">Tax Documents</h3>
          </div>
          <div className="space-y-6">
            {[
              { label: 'W-9 Forms Collected', value: '234 / 256', trend: 'warning' },
              { label: '1099 Forms Generated', value: '198', trend: 'ok' },
              { label: 'International Forms', value: '45 / 48', trend: 'warning' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">{item.label}</span>
                <span className={`text-sm font-bold ${item.trend === 'ok' ? 'text-white' : 'text-amber-500'}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="premium-card">
           <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><FileCheck size={20} className="text-blue-500" /></div>
            <h3 className="text-lg font-bold">Audit Reports</h3>
          </div>
          <div className="space-y-6">
            {[
              { label: 'Q4 2025 Revenue', value: 'Ready', trend: 'ok' },
              { label: 'Annual Audit', value: 'In Progress', trend: 'warning' },
              { label: 'Royalty Distribution', value: 'Pending', trend: 'warning' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">{item.label}</span>
                <span className={`text-sm font-bold ${item.trend === 'ok' ? 'text-emerald-500' : 'text-amber-500'}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
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
    <div className="premium-card !p-0 overflow-hidden">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-lg font-bold">Regional Pricing</h3>
        <button className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Region</button>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/5">
            <th className="px-6 py-5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Region</th>
            <th className="px-6 py-5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Currency</th>
            <th className="px-6 py-5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Premium</th>
            <th className="px-6 py-5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Pro</th>
            <th className="px-6 py-5 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {tiers.map((t) => (
            <tr key={t.region} className="hover:bg-white/[0.02] transition-colors">
              <td className="px-6 py-4 text-sm font-bold text-white">{t.region}</td>
              <td className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">{t.currency}</td>
              <td className="px-6 py-4 text-sm font-bold text-white">{t.premium}</td>
              <td className="px-6 py-4 text-sm font-bold text-white">{t.pro}</td>
              <td className="px-6 py-4 text-right">
                <button className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors">Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
