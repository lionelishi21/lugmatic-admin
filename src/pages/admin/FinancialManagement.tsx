import React, { useState } from 'react';
import { 
  TrendingUp, CreditCard, FileText, Receipt, Settings, 
  DollarSign, Users, ArrowUpRight, ArrowDownRight, BarChart3,
  Download, Filter, Calendar, ChevronRight, Clock, CheckCircle2,
  AlertCircle, XCircle, Shield, FileCheck, Activity, Search,
  Music, Zap, Crown, Star, Percent, Globe, Tag, Plus
} from 'lucide-react';

const tabs = [
  { id: 'revenue', label: 'Revenue', icon: TrendingUp },
  { id: 'payouts', label: 'Payouts', icon: CreditCard },
  { id: 'subscriptions', label: 'Subscriptions', icon: Receipt },
  { id: 'compliance', label: 'Compliance', icon: FileText },
  { id: 'pricing', label: 'Pricing', icon: Settings },
];

export default function FinancialManagement() {
  const [activeTab, setActiveTab] = useState('revenue');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Management</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor revenue, payouts, and financial operations</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4" />
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === 'revenue' && <RevenueSection />}
      {activeTab === 'payouts' && <PayoutsSection />}
      {activeTab === 'subscriptions' && <SubscriptionsSection />}
      {activeTab === 'compliance' && <ComplianceSection />}
      {activeTab === 'pricing' && <PricingSection />}
    </div>
  );
}

/* ─── Revenue ─── */
const RevenueSection = () => {
  const stats = [
    { label: 'Total Revenue (MTD)', value: '$124,567', change: '+12.5%', up: true, icon: DollarSign, color: 'green' },
    { label: 'Active Subscribers', value: '8,234', change: '+5.2%', up: true, icon: Users, color: 'blue' },
    { label: 'Avg Revenue / User', value: '$15.13', change: '+2.1%', up: true, icon: TrendingUp, color: 'emerald' },
    { label: 'Churn Rate', value: '2.4%', change: '-0.3%', up: false, icon: Activity, color: 'amber' },
  ];

  const breakdown = [
    { label: 'Subscriptions', value: '$56,055', pct: 45, color: 'bg-green-500' },
    { label: 'Virtual Gifts', value: '$37,370', pct: 30, color: 'bg-blue-500' },
    { label: 'Tickets', value: '$18,685', pct: 15, color: 'bg-amber-500' },
    { label: 'Other', value: '$12,457', pct: 10, color: 'bg-gray-400' },
  ];

  const topArtists = [
    { name: 'Luna Nova', revenue: '$8,234', streams: '124K', avatar: 'LN' },
    { name: 'DJ Pulse', revenue: '$6,891', streams: '98K', avatar: 'DP' },
    { name: 'The Velvet', revenue: '$5,467', streams: '87K', avatar: 'TV' },
    { name: 'Maya Chen', revenue: '$4,923', streams: '76K', avatar: 'MC' },
    { name: 'Neon Beats', revenue: '$4,112', streams: '65K', avatar: 'NB' },
  ];

  const colorMap: Record<string, string> = {
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[s.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  s.up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}>
                  {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {s.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">Revenue Breakdown</h3>
            <div className="flex items-center gap-2">
              <button className="text-xs font-medium px-3 py-1.5 bg-green-50 text-green-600 rounded-lg">Monthly</button>
              <button className="text-xs font-medium px-3 py-1.5 text-gray-500 hover:bg-gray-50 rounded-lg">Quarterly</button>
              <button className="text-xs font-medium px-3 py-1.5 text-gray-500 hover:bg-gray-50 rounded-lg">Yearly</button>
            </div>
          </div>

          {/* Chart placeholder */}
          <div className="h-48 bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-xl mb-6 flex items-center justify-center">
            <BarChart3 className="w-12 h-12 text-green-200" />
          </div>

          {/* Breakdown bar */}
          <div className="flex rounded-full overflow-hidden h-3 mb-4">
            {breakdown.map((b) => (
              <div key={b.label} className={`${b.color} transition-all`} style={{ width: `${b.pct}%` }} />
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {breakdown.map((b) => (
              <div key={b.label} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${b.color}`} />
                <div>
                  <p className="text-xs text-gray-500">{b.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{b.value} <span className="text-xs text-gray-400 font-normal">({b.pct}%)</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Earning Artists */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900">Top Earners</h3>
            <button className="text-xs text-green-600 font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {topArtists.map((a, i) => (
              <div key={a.name} className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-400 w-4">#{i + 1}</span>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                  {a.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{a.name}</p>
                  <p className="text-xs text-gray-400">{a.streams} streams</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">{a.revenue}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Payouts ─── */
const PayoutsSection = () => {
  const payoutStats = [
    { label: 'Pending Payouts', value: '$34,567', count: '23 artists', icon: Clock, color: 'amber' },
    { label: 'Processed (MTD)', value: '$89,234', count: '156 payouts', icon: CheckCircle2, color: 'green' },
    { label: 'Failed', value: '$1,234', count: '3 payouts', icon: XCircle, color: 'red' },
    { label: 'Next Payout Date', value: 'Feb 15', count: 'In 4 days', icon: Calendar, color: 'blue' },
  ];

  const payouts = [
    { artist: 'Luna Nova', avatar: 'LN', amount: '$2,456.78', method: 'Bank Transfer', status: 'completed', date: 'Feb 10, 2026' },
    { artist: 'DJ Pulse', avatar: 'DP', amount: '$1,891.34', method: 'PayPal', status: 'processing', date: 'Feb 10, 2026' },
    { artist: 'The Velvet', avatar: 'TV', amount: '$1,567.00', method: 'Bank Transfer', status: 'pending', date: 'Feb 15, 2026' },
    { artist: 'Maya Chen', avatar: 'MC', amount: '$923.45', method: 'Stripe', status: 'pending', date: 'Feb 15, 2026' },
    { artist: 'Neon Beats', avatar: 'NB', amount: '$678.90', method: 'Bank Transfer', status: 'failed', date: 'Feb 8, 2026' },
    { artist: 'Echo Falls', avatar: 'EF', amount: '$2,103.67', method: 'PayPal', status: 'completed', date: 'Feb 9, 2026' },
  ];

  const statusStyles: Record<string, string> = {
    completed: 'bg-green-50 text-green-700',
    processing: 'bg-blue-50 text-blue-700',
    pending: 'bg-amber-50 text-amber-700',
    failed: 'bg-red-50 text-red-700',
  };

  const colorMap: Record<string, string> = {
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {payoutStats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[s.color]} mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.count}</p>
            </div>
          );
        })}
      </div>

      {/* Payouts Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-50">
          <h3 className="font-semibold text-gray-900">Recent Payouts</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search artists..."
                className="pl-9 pr-4 py-2 text-sm bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-300 w-56"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors">
              Process Payouts
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-medium">Artist</th>
                <th className="text-left px-5 py-3 font-medium">Amount</th>
                <th className="text-left px-5 py-3 font-medium">Method</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Date</th>
                <th className="text-right px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payouts.map((p) => (
                <tr key={p.artist + p.date} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                        {p.avatar}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{p.artist}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-gray-900">{p.amount}</td>
                  <td className="px-5 py-4 text-sm text-gray-500">{p.method}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusStyles[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">{p.date}</td>
                  <td className="px-5 py-4 text-right">
                    <button className="text-xs text-green-600 font-medium hover:underline">Details</button>
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
const SubscriptionsSection = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      subscribers: '12,456',
      features: ['Ad-supported listening', '5 skips/hour', 'Standard audio quality'],
      color: 'gray',
      icon: Music,
      active: true,
    },
    {
      name: 'Premium',
      price: '$9.99',
      period: '/month',
      subscribers: '5,234',
      features: ['Ad-free listening', 'Unlimited skips', 'High quality audio', 'Offline downloads'],
      color: 'green',
      icon: Zap,
      active: true,
      popular: true,
    },
    {
      name: 'Pro',
      price: '$14.99',
      period: '/month',
      subscribers: '2,456',
      features: ['Everything in Premium', 'Lossless audio', 'Exclusive content', 'Priority support', 'Early access'],
      color: 'amber',
      icon: Crown,
      active: true,
    },
    {
      name: 'Family',
      price: '$19.99',
      period: '/month',
      subscribers: '1,544',
      features: ['Up to 6 accounts', 'All Pro features', 'Parental controls', 'Shared playlists'],
      color: 'blue',
      icon: Users,
      active: true,
    },
  ];

  const planColorMap: Record<string, { bg: string; border: string; icon: string; badge: string }> = {
    gray: { bg: 'bg-gray-50', border: 'border-gray-200', icon: 'bg-gray-100 text-gray-600', badge: 'bg-gray-100 text-gray-600' },
    green: { bg: 'bg-green-50/50', border: 'border-green-200', icon: 'bg-green-100 text-green-600', badge: 'bg-green-100 text-green-700' },
    amber: { bg: 'bg-amber-50/50', border: 'border-amber-200', icon: 'bg-amber-100 text-amber-600', badge: 'bg-amber-100 text-amber-700' },
    blue: { bg: 'bg-blue-50/50', border: 'border-blue-200', icon: 'bg-blue-100 text-blue-600', badge: 'bg-blue-100 text-blue-700' },
  };

  return (
    <div className="space-y-6">
      {/* Overview stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">21,690</p>
              <p className="text-xs text-gray-500">Total Subscribers</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-green-600">
            <ArrowUpRight className="w-3 h-3" /> +8.3% this month
          </span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">$98,456</p>
              <p className="text-xs text-gray-500">Monthly Recurring Revenue</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-green-600">
            <ArrowUpRight className="w-3 h-3" /> +11.2% this month
          </span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">68.4%</p>
              <p className="text-xs text-gray-500">Conversion Rate (Free → Paid)</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-green-600">
            <ArrowUpRight className="w-3 h-3" /> +2.1% this month
          </span>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Subscription Plans</h3>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors">
          <Plus className="w-4 h-4" />
          Add Plan
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const colors = planColorMap[plan.color];
          return (
            <div key={plan.name} className={`relative rounded-2xl border ${colors.border} ${colors.bg} p-5 transition-all hover:shadow-md`}>
              {plan.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 text-xs font-semibold text-white bg-green-600 rounded-full shadow-sm">
                    Most Popular
                  </span>
                </div>
              )}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.icon} mb-4`}>
                <Icon className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-gray-900">{plan.name}</h4>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-sm text-gray-400">{plan.period}</span>
              </div>
              <div className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${colors.badge} mb-4`}>
                <Users className="w-3 h-3" />
                {plan.subscribers} subscribers
              </div>
              <ul className="space-y-2 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button className="w-full py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
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
      description: 'Manage W-9, 1099, and international tax forms for artist payouts',
      icon: FileText,
      status: 'Up to date',
      statusColor: 'green',
      items: [
        { name: 'W-9 Forms Collected', value: '234 / 256', status: 'warning' },
        { name: '1099 Forms Generated', value: '198', status: 'ok' },
        { name: 'International Tax Forms', value: '45 / 48', status: 'warning' },
      ],
    },
    {
      title: 'Compliance Reports',
      description: 'Automated regulatory and financial compliance reporting',
      icon: FileCheck,
      status: 'Action needed',
      statusColor: 'amber',
      items: [
        { name: 'Q4 2025 Revenue Report', value: 'Ready', status: 'ok' },
        { name: 'Annual Audit Report', value: 'In Progress', status: 'warning' },
        { name: 'Royalty Distribution Report', value: 'Pending Review', status: 'warning' },
      ],
    },
    {
      title: 'Audit Logs',
      description: 'Track all financial operations and administrative actions',
      icon: Shield,
      status: 'Monitored',
      statusColor: 'blue',
      items: [
        { name: 'Total Entries (MTD)', value: '12,456', status: 'ok' },
        { name: 'Flagged Transactions', value: '3', status: 'error' },
        { name: 'Last Reviewed', value: 'Feb 10, 2026', status: 'ok' },
      ],
    },
  ];

  const statusDot: Record<string, string> = {
    ok: 'bg-green-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
  };

  const headerBadge: Record<string, string> = {
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-700',
  };

  return (
    <div className="space-y-6">
      {/* Alert banner */}
      <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4">
        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-800">22 artists have incomplete tax documentation</p>
          <p className="text-xs text-amber-600 mt-0.5">Please review and collect missing forms before the next payout cycle</p>
        </div>
        <button className="text-xs font-medium text-amber-700 bg-amber-100 px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors shrink-0">
          Review Now
        </button>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {complianceItems.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 p-5 border-b border-gray-50">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{section.title}</h3>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${headerBadge[section.statusColor]}`}>
                      {section.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{section.description}</p>
                </div>
                <button className="flex items-center gap-1 text-sm text-green-600 font-medium hover:underline">
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {section.items.map((item) => (
                  <div key={item.name} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${statusDot[item.status]}`} />
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Pricing ─── */
const PricingSection = () => {
  const tiers = [
    { region: 'United States', currency: 'USD', basic: '$0', premium: '$9.99', pro: '$14.99', family: '$19.99' },
    { region: 'European Union', currency: 'EUR', basic: '€0', premium: '€9.49', pro: '€13.99', family: '€18.99' },
    { region: 'United Kingdom', currency: 'GBP', basic: '£0', premium: '£7.99', pro: '£11.99', family: '£16.99' },
    { region: 'Japan', currency: 'JPY', basic: '¥0', premium: '¥980', pro: '¥1,480', family: '¥1,980' },
    { region: 'Brazil', currency: 'BRL', basic: 'R$0', premium: 'R$19.90', pro: 'R$27.90', family: 'R$34.90' },
  ];

  const discounts = [
    { name: 'Student Discount', value: '50% off', type: 'Ongoing', status: true },
    { name: 'Annual Billing', value: '2 months free', type: 'Ongoing', status: true },
    { name: 'New User Trial', value: '30 days free', type: 'Promotional', status: true },
    { name: 'Referral Bonus', value: '1 month free', type: 'Ongoing', status: false },
  ];

  return (
    <div className="space-y-6">
      {/* Regional Pricing */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Regional Pricing</h3>
              <p className="text-xs text-gray-500">Manage pricing across different regions and currencies</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add Region
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-medium">Region</th>
                <th className="text-left px-5 py-3 font-medium">Currency</th>
                <th className="text-center px-5 py-3 font-medium">Free</th>
                <th className="text-center px-5 py-3 font-medium">Premium</th>
                <th className="text-center px-5 py-3 font-medium">Pro</th>
                <th className="text-center px-5 py-3 font-medium">Family</th>
                <th className="text-right px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tiers.map((t) => (
                <tr key={t.region} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{t.region}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{t.currency}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 text-center">{t.basic}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-900 text-center">{t.premium}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-900 text-center">{t.pro}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-900 text-center">{t.family}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button className="text-xs text-green-600 font-medium hover:underline">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Discounts & Promotions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Discounts & Promotions</h3>
              <p className="text-xs text-gray-500">Active discount rules and promotional offers</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add Discount
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {discounts.map((d) => (
            <div key={d.name} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{d.name}</p>
                  <p className="text-xs text-gray-400">{d.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-900">{d.value}</span>
                <button
                  className={`relative w-10 h-5.5 rounded-full transition-colors ${d.status ? 'bg-green-500' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform ${d.status ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Currency Settings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Currency Settings</h3>
            <p className="text-xs text-gray-500">Default currency and conversion preferences</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Default Currency</p>
            <p className="text-sm font-semibold text-gray-900">USD - United States Dollar</p>
          </div>
          <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Exchange Rate Source</p>
            <p className="text-sm font-semibold text-gray-900">ECB (European Central Bank)</p>
          </div>
          <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Rate Update Frequency</p>
            <p className="text-sm font-semibold text-gray-900">Daily (12:00 UTC)</p>
          </div>
          <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Supported Currencies</p>
            <p className="text-sm font-semibold text-gray-900">12 currencies</p>
          </div>
        </div>
      </div>
    </div>
  );
};
