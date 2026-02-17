import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  Target, 
  Calendar, 
  Users, 
  TrendingUp, 
  Gift, 
  Star, 
  Plus,
  Trash2,
  Eye,
  Search,
  MoreHorizontal,
  Percent,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  Pause,
  Play,
  ChevronRight,
  BarChart3,
  FileText,
  Sparkles
} from 'lucide-react';

interface Promotion {
  id: string;
  name: string;
  type: 'discount' | 'bonus' | 'featured' | 'referral';
  status: 'active' | 'inactive' | 'scheduled';
  startDate: string;
  endDate: string;
  targetAudience: string;
  discount: number;
  participants: number;
  revenue: number;
  description: string;
  budget: number;
  spent: number;
}

const Promotions: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const promotions: Promotion[] = [
    {
      id: '1',
      name: 'Summer Music Festival',
      type: 'discount',
      status: 'active',
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      targetAudience: 'All Users',
      discount: 25,
      participants: 1250,
      revenue: 45678,
      description: '25% off Premium subscriptions for the summer season',
      budget: 50000,
      spent: 34200,
    },
    {
      id: '2',
      name: 'New Artist Spotlight',
      type: 'featured',
      status: 'active',
      startDate: '2024-05-15',
      endDate: '2024-06-15',
      targetAudience: 'New Artists',
      discount: 0,
      participants: 89,
      revenue: 12345,
      description: 'Featured placement for emerging artists on homepage',
      budget: 15000,
      spent: 8900,
    },
    {
      id: '3',
      name: 'Referral Bonus Program',
      type: 'referral',
      status: 'scheduled',
      startDate: '2024-07-01',
      endDate: '2024-09-30',
      targetAudience: 'Existing Users',
      discount: 15,
      participants: 0,
      revenue: 0,
      description: 'Earn 1 month free for each friend referred',
      budget: 30000,
      spent: 0,
    },
    {
      id: '4',
      name: 'Holiday Gift Bundle',
      type: 'bonus',
      status: 'inactive',
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      targetAudience: 'Premium Users',
      discount: 30,
      participants: 3420,
      revenue: 67890,
      description: 'Gift a subscription and get bonus coins',
      budget: 80000,
      spent: 72000,
    },
    {
      id: '5',
      name: 'First Listen Free',
      type: 'discount',
      status: 'active',
      startDate: '2024-05-01',
      endDate: '2024-07-31',
      targetAudience: 'New Users',
      discount: 100,
      participants: 5670,
      revenue: 23400,
      description: 'Free 7-day trial for new sign-ups',
      budget: 25000,
      spent: 18300,
    },
    {
      id: '6',
      name: 'Artist Collab Promo',
      type: 'featured',
      status: 'scheduled',
      startDate: '2024-08-01',
      endDate: '2024-08-15',
      targetAudience: 'All Users',
      discount: 10,
      participants: 0,
      revenue: 0,
      description: 'Cross-promotion with top artists for new releases',
      budget: 20000,
      spent: 0,
    },
  ];

  const tabs = [
    { key: 'all', label: 'All', count: promotions.length },
    { key: 'active', label: 'Active', count: promotions.filter(p => p.status === 'active').length },
    { key: 'scheduled', label: 'Scheduled', count: promotions.filter(p => p.status === 'scheduled').length },
    { key: 'inactive', label: 'Inactive', count: promotions.filter(p => p.status === 'inactive').length },
  ];

  const filtered = useMemo(() => {
    return promotions.filter(p => {
      const matchesTab = activeTab === 'all' || p.status === activeTab;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.targetAudience.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [activeTab, search]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-700 border border-green-200';
      case 'inactive': return 'bg-gray-50 text-gray-600 border border-gray-200';
      case 'scheduled': return 'bg-amber-50 text-amber-700 border border-amber-200';
      default: return 'bg-gray-50 text-gray-600 border border-gray-200';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-400';
      case 'scheduled': return 'bg-amber-500';
      default: return 'bg-gray-400';
    }
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'discount': return { icon: <Percent className="h-4 w-4" />, bg: 'bg-green-50', text: 'text-green-600', label: 'Discount' };
      case 'featured': return { icon: <Star className="h-4 w-4" />, bg: 'bg-amber-50', text: 'text-amber-600', label: 'Featured' };
      case 'referral': return { icon: <Users className="h-4 w-4" />, bg: 'bg-blue-50', text: 'text-blue-600', label: 'Referral' };
      case 'bonus': return { icon: <Gift className="h-4 w-4" />, bg: 'bg-purple-50', text: 'text-purple-600', label: 'Bonus' };
      default: return { icon: <Zap className="h-4 w-4" />, bg: 'bg-gray-50', text: 'text-gray-600', label: type };
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const budgetPercent = (spent: number, budget: number) => budget > 0 ? Math.round((spent / budget) * 100) : 0;

  const totalRevenue = promotions.reduce((sum, p) => sum + p.revenue, 0);
  const totalParticipants = promotions.reduce((sum, p) => sum + p.participants, 0);
  const activeCount = promotions.filter(p => p.status === 'active').length;
  const avgConversion = 23.4;

  return (
    <div className="p-6 max-w-[1400px] mx-auto" onClick={() => openMenu && setOpenMenu(null)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotions</h1>
          <p className="text-sm text-gray-500 mt-1">Manage campaigns and promotional offers</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            <Calendar className="h-4 w-4" />
            Schedule
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
            <Plus className="h-4 w-4" />
            Create Promotion
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active Promos', value: activeCount, icon: <Zap className="h-4 w-4" />, iconBg: 'bg-green-50 text-green-600', trend: '+3', up: true },
          { label: 'Participants', value: totalParticipants.toLocaleString(), icon: <Users className="h-4 w-4" />, iconBg: 'bg-blue-50 text-blue-600', trend: '+12.5%', up: true },
          { label: 'Revenue Generated', value: `$${(totalRevenue / 1000).toFixed(1)}K`, icon: <TrendingUp className="h-4 w-4" />, iconBg: 'bg-emerald-50 text-emerald-600', trend: '+8.2%', up: true },
          { label: 'Conversion Rate', value: `${avgConversion}%`, icon: <Target className="h-4 w-4" />, iconBg: 'bg-amber-50 text-amber-600', trend: '-1.2%', up: false },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-8 h-8 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                {stat.icon}
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${stat.up ? 'text-green-600' : 'text-red-500'}`}>
                {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {stat.trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-1">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search promotions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-300 w-64"
            />
          </div>
        </div>

        {/* Promotions List */}
        <div className="divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Zap className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No promotions found</p>
            </div>
          ) : (
            filtered.map((promo) => {
              const typeConfig = getTypeConfig(promo.type);
              const bp = budgetPercent(promo.spent, promo.budget);
              return (
                <div
                  key={promo.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors group"
                >
                  {/* Type icon */}
                  <div className={`w-10 h-10 rounded-xl ${typeConfig.bg} ${typeConfig.text} flex items-center justify-center flex-shrink-0`}>
                    {typeConfig.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{promo.name}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${getStatusStyle(promo.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(promo.status)} ${promo.status === 'active' ? 'animate-pulse' : ''}`} />
                        {promo.status.charAt(0).toUpperCase() + promo.status.slice(1)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${typeConfig.bg} ${typeConfig.text}`}>
                        {typeConfig.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{promo.description}</p>
                  </div>

                  {/* Date range */}
                  <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-500 flex-shrink-0">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatDate(promo.startDate)} - {formatDate(promo.endDate)}</span>
                  </div>

                  {/* Budget bar */}
                  <div className="hidden lg:block w-28 flex-shrink-0">
                    <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                      <span>Budget</span>
                      <span className="font-medium text-gray-700">{bp}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${bp > 80 ? 'bg-amber-500' : 'bg-green-500'}`}
                        style={{ width: `${bp}%` }}
                      />
                    </div>
                  </div>

                  {/* Participants */}
                  <div className="hidden md:block text-right flex-shrink-0 w-20">
                    <p className="text-sm font-semibold text-gray-900">{promo.participants.toLocaleString()}</p>
                    <p className="text-[11px] text-gray-500">users</p>
                  </div>

                  {/* Revenue */}
                  <div className="text-right flex-shrink-0 w-20">
                    <p className="text-sm font-semibold text-gray-900">${promo.revenue.toLocaleString()}</p>
                    <p className="text-[11px] text-gray-500">revenue</p>
                  </div>

                  {/* Discount */}
                  {promo.discount > 0 && (
                    <div className="hidden xl:flex items-center flex-shrink-0">
                      <span className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold">
                        {promo.discount}% off
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenu(openMenu === promo.id ? null : promo.id);
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {openMenu === promo.id && (
                      <div className="absolute right-0 top-8 z-20 w-44 bg-white rounded-xl border border-gray-200 shadow-lg py-1">
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <Eye className="h-3.5 w-3.5" /> View Details
                        </button>
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <Copy className="h-3.5 w-3.5" /> Duplicate
                        </button>
                        {promo.status === 'active' ? (
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-600 hover:bg-amber-50">
                            <Pause className="h-3.5 w-3.5" /> Pause
                          </button>
                        ) : promo.status === 'inactive' ? (
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50">
                            <Play className="h-3.5 w-3.5" /> Reactivate
                          </button>
                        ) : null}
                        <hr className="my-1 border-gray-100" />
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">Showing {filtered.length} of {promotions.length} promotions</p>
            <p className="text-xs text-gray-500">
              Total budget: <span className="font-medium text-gray-700">${promotions.reduce((s, p) => s + p.budget, 0).toLocaleString()}</span>
              {' / '}
              Spent: <span className="font-medium text-gray-700">${promotions.reduce((s, p) => s + p.spent, 0).toLocaleString()}</span>
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: <Sparkles className="h-5 w-5" />, iconBg: 'bg-green-50 text-green-600', title: 'Quick Campaign', desc: 'Create a simple promo in minutes' },
          { icon: <BarChart3 className="h-5 w-5" />, iconBg: 'bg-blue-50 text-blue-600', title: 'View Analytics', desc: 'Detailed performance metrics' },
          { icon: <FileText className="h-5 w-5" />, iconBg: 'bg-amber-50 text-amber-600', title: 'Templates', desc: 'Pre-built promotion templates' },
        ].map((action, i) => (
          <button
            key={i}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:border-green-200 hover:shadow-md transition-all text-left group"
          >
            <div className={`w-10 h-10 rounded-xl ${action.iconBg} flex items-center justify-center flex-shrink-0`}>
              {action.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{action.title}</p>
              <p className="text-xs text-gray-500">{action.desc}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-green-500 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Promotions;
