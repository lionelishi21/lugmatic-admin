import React, { useState, useMemo, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { 
  Zap, Target, Calendar, Users, TrendingUp, Gift, 
  Star, Plus, Trash2, Eye, Search, MoreVertical, 
  Percent, Clock, ArrowUpRight, ArrowDownRight, 
  Copy, Pause, Play, ChevronRight, BarChart3, 
  FileText, Sparkles, Filter, ChevronDown, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

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
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoToDelete, setPromoToDelete] = useState<string | null>(null);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPromotions();
      if (response.data.success) {
        const data = response.data.data.map((p: any) => ({
          ...p,
          id: p._id || p.id
        }));
        setPromotions(data);
      }
    } catch (err) {
      console.error('Failed to fetch promotions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleDelete = async () => {
    if (!promoToDelete) return;
    const loadingId = toast.loading('Removing campaign...');
    try {
      await adminService.deletePromotion(promoToDelete);
      toast.success('Campaign removed', { id: loadingId });
      setPromotions(prev => prev.filter(p => p.id !== promoToDelete));
    } catch (err) {
      toast.error('Failed to remove campaign', { id: loadingId });
    } finally {
      setPromoToDelete(null);
      setOpenMenu(null);
    }
  };

  const filtered = useMemo(() => {
    return promotions.filter(p => {
      const matchesTab = activeTab === 'all' || p.status === activeTab;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.targetAudience.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [activeTab, search, promotions]);

  const stats = [
    { label: 'Active Campaigns', value: promotions.filter(p => p.status === 'active').length, icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-500/5', trend: '+3', up: true },
    { label: 'Total Reach', value: promotions.reduce((s, p) => s + (p.participants || 0), 0).toLocaleString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/5', trend: '+12.5%', up: true },
    { label: 'Revenue Generated', value: `$${(promotions.reduce((s, p) => s + (p.revenue || 0), 0) / 1000).toFixed(1)}K`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/5', trend: '+8.2%', up: true },
    { label: 'Growth Target', value: '23.4%', icon: Target, color: 'text-amber-500', bg: 'bg-amber-500/5', trend: '-1.2%', up: false },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">Promotions</h1>
          <p className="text-zinc-500">Manage marketing campaigns, seasonal offers, and rewards.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Calendar size={18} />
            Schedule
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Create Campaign
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="premium-card">
            <div className="flex items-center justify-between mb-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}>
                <s.icon size={20} className={s.color} />
              </div>
              <span className={`flex items-center gap-1 text-[10px] font-bold ${s.up ? 'text-emerald-500' : 'text-rose-500'}`}>
                {s.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {s.trend}
              </span>
            </div>
            <p className="text-zinc-500 text-xs font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/5 rounded-3xl p-1 flex items-center gap-1 w-fit overflow-x-auto no-scrollbar">
          {['all', 'active', 'scheduled', 'inactive'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="ml-2 opacity-50">
                {tab === 'all' ? promotions.length : promotions.filter(p => p.status === tab).length}
              </span>
            </button>
          ))}
        </div>
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-11"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="premium-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/5">
                <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Campaign</th>
                <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Timeline</th>
                <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Utilization</th>
                <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Impact</th>
                <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin mx-auto mb-4" />
                    <p className="text-zinc-500 font-medium">Syncing marketing data...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <Zap className="h-10 w-10 text-zinc-800 mx-auto mb-4" />
                    <p className="text-zinc-500 font-medium">No active campaigns detected.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((promo) => {
                  const spentPercent = promo.budget > 0 ? Math.round((promo.spent / promo.budget) * 100) : 0;
                  return (
                    <tr key={promo.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-zinc-900 border border-black/5 dark:border-white/5`}>
                            {promo.type === 'discount' && <Percent size={18} className="text-emerald-500" />}
                            {promo.type === 'featured' && <Star size={18} className="text-amber-500" />}
                            {promo.type === 'referral' && <Users size={18} className="text-blue-500" />}
                            {promo.type === 'bonus' && <Gift size={18} className="text-purple-500" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-emerald-400 transition-colors">{promo.name}</p>
                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{promo.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                          <Clock size={14} className="text-emerald-500" />
                          <span>{new Date(promo.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          <span className="opacity-30">—</span>
                          <span>{new Date(promo.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-32">
                          <div className="flex items-center justify-between text-[10px] font-bold text-zinc-600 mb-1.5 uppercase">
                            <span>Budget</span>
                            <span>{spentPercent}%</span>
                          </div>
                          <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${spentPercent > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                              style={{ width: `${spentPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-zinc-900 dark:text-white">${promo.revenue.toLocaleString()}</span>
                          <span className="text-[10px] text-zinc-600 font-bold uppercase">Impact Revenue</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            promo.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                            promo.status === 'scheduled' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                            'bg-zinc-500/10 text-zinc-500 border border-white/5'
                          }`}>
                            {promo.status}
                          </span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === promo.id ? null : promo.id); }}
                            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-white hover:bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-500/5', title: 'Quick Campaign', desc: 'Deploy a simple promo in minutes' },
          { icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-500/5', title: 'Marketing Analytics', desc: 'Deep dive into campaign performance' },
          { icon: FileText, color: 'text-amber-500', bg: 'bg-amber-500/5', title: 'Creative Templates', desc: 'Pre-built promotional assets' },
        ].map((action, i) => (
          <button
            key={i}
            className="premium-card !p-6 flex items-center gap-5 hover:border-emerald-500/20 transition-all group text-left"
          >
            <div className={`w-12 h-12 rounded-2xl ${action.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
              <action.icon size={24} className={action.color} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-zinc-900 dark:text-white mb-0.5">{action.title}</p>
              <p className="text-xs text-zinc-500">{action.desc}</p>
            </div>
            <ChevronRight size={20} className="text-zinc-800 group-hover:text-emerald-500 transition-colors" />
          </button>
        ))}
      </div>

      <ConfirmDialog
        isOpen={!!promoToDelete}
        title="Remove Campaign?"
        message="This action will permanently delete the promotion and cease all related marketing activities."
        confirmLabel="Remove"
        onConfirm={handleDelete}
        onCancel={() => setPromoToDelete(null)}
      />
    </div>
  );
};

export default Promotions;
