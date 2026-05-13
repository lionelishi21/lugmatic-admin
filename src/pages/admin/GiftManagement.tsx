import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Edit, Trash2, Settings, Gift, DollarSign, Star, Package,
  Search, Sparkles, Filter, MoreHorizontal, Power, AlertTriangle,
  X, ChevronDown, CheckCircle2, Zap, LayoutGrid, List,
  Target, Activity, Globe, Cpu, ArrowUpRight, ShieldCheck,
  SlidersHorizontal, Layers
} from 'lucide-react';
import adminGiftService, { GiftResponse } from '../../services/adminGiftService';
import { getFullImageUrl } from '../../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const RARITY_CONFIG: Record<string, { color: string; bg: string; border: string; shadow: string }> = {
  common: { color: 'text-zinc-500', bg: 'bg-zinc-500/5', border: 'border-white/5', shadow: '' },
  rare: { color: 'text-blue-500', bg: 'bg-blue-500/5', border: 'border-blue-500/10', shadow: 'shadow-[0_0_10px_rgba(59,130,246,0.2)]' },
  epic: { color: 'text-purple-500', bg: 'bg-purple-500/5', border: 'border-purple-500/10', shadow: 'shadow-[0_0_10px_rgba(168,85,247,0.2)]' },
  legendary: { color: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/10', shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]' },
};

const GiftManagement: React.FC = () => {
  const navigate = useNavigate();
  const [gifts, setGifts] = useState<GiftResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [giftToDelete, setGiftToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadGifts();
  }, []);

  const loadGifts = async () => {
    try {
      setLoading(true);
      const data = await adminGiftService.getAllGifts();
      setGifts(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error('Failed to load gifts');
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => Array.from(new Set(gifts.map((g) => g.category))), [gifts]);

  const filteredGifts = useMemo(() => {
    let list = gifts;
    if (tabValue === 1) list = list.filter((g) => g.isActive);
    if (filterCategory !== 'all') list = list.filter((g) => g.category === filterCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(g => g.name.toLowerCase().includes(q) || g.category.toLowerCase().includes(q));
    }
    return list;
  }, [gifts, tabValue, filterCategory, searchQuery]);

  const stats = useMemo(() => ({
    total: gifts.length,
    active: gifts.filter(g => g.isActive).length,
    value: gifts.reduce((s, g) => s + g.value, 0),
    coins: gifts.reduce((s, g) => s + g.coinCost, 0),
  }), [gifts]);

  const handleToggleActive = async (giftId: string, isActive: boolean) => {
    try {
      await adminGiftService.updateGift(giftId, { isActive: !isActive });
      toast.success(`Asset protocol ${!isActive ? 'activated' : 'deactivated'}`);
      loadGifts();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Cinematic Asset Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-none">Virtual Economy</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Protocol Sync: Active</span>
            </div>
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em] ml-1">Managing high-fidelity digital assets, fiscal valuation, and reward distribution.</p>
        </div>
        <button
          onClick={() => navigate('/admin/gift-management/add')}
          className="h-16 px-10 bg-white text-black rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-4 group border border-white/10"
        >
          <Plus size={18} />
          Forge New Asset
        </button>
      </div>

      {/* Intelligence Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total Registry', value: stats.total, icon: Gift, color: 'text-indigo-500', bg: 'bg-indigo-500/5' },
          { label: 'Active Economy', value: stats.active, icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
          { label: 'Fiscal Volume', value: `$${stats.value.toFixed(0)}`, icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-500/5' },
          { label: 'Virtual Liquidity', value: stats.coins.toLocaleString(), icon: Package, color: 'text-amber-500', bg: 'bg-amber-500/5' },
        ].map((s, i) => (
          <motion.div 
            key={s.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="premium-card group border-white/5 hover:border-emerald-500/20 transition-all cursor-default relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-bl-full pointer-events-none" />
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${s.bg} border border-white/5 shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform duration-500`}>
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <s.icon size={24} className={s.color} />
            </div>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em] mb-2 italic">{s.label}</p>
            <p className="text-3xl font-bold text-white tracking-tighter italic">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Operation Matrix HUD */}
      <div className="premium-card !p-3 bg-zinc-950/40 border-white/5 flex flex-wrap items-center gap-3 w-fit shadow-inner">
        {['Registry Archive', 'Active Stream', 'Market Sectors', 'Distribution Rules'].map((label, i) => (
          <button
            key={label}
            onClick={() => setTabValue(i)}
            className={`px-8 py-3 rounded-2xl text-[9px] font-bold uppercase tracking-widest transition-all duration-300 relative overflow-hidden group ${
              tabValue === i ? 'bg-white/10 text-white shadow-xl border border-white/5' : 'text-zinc-600 hover:text-zinc-300 hover:bg-white/5'
            }`}
          >
            <span className="relative z-10">
              {label}
              {i < 3 && <span className="ml-3 opacity-40 font-mono italic">[{i === 2 ? categories.length : (i === 1 ? stats.active : stats.total)}]</span>}
            </span>
            {tabValue === i && <motion.div layoutId="activeTab" className="absolute inset-0 bg-white/5" />}
          </button>
        ))}
      </div>

      {(tabValue === 0 || tabValue === 1) && (
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="relative w-full lg:max-w-md group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 h-5 w-5 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="SCAN ASSET REGISTRY..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-12 h-14 bg-[#0a0a0a] border border-white/5 rounded-2xl text-white text-[10px] font-bold tracking-[0.2em] uppercase focus:outline-none focus:border-emerald-500/30 transition-all shadow-inner placeholder:text-zinc-800 italic"
            />
          </div>
          <div className="relative group">
            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 h-5 w-5 group-focus-within:text-emerald-500 transition-colors" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full lg:w-72 h-14 pl-14 pr-12 bg-[#0a0a0a] border border-white/5 rounded-2xl text-white text-[10px] font-bold tracking-[0.2em] uppercase focus:outline-none focus:border-emerald-500/30 appearance-none shadow-inner transition-all italic cursor-pointer"
            >
              <option value="all">ALL MARKET SECTORS</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-800 pointer-events-none group-focus-within:text-emerald-500 transition-all group-focus-within:rotate-180 duration-500" size={18} />
          </div>
        </div>
      )}

      {/* Tactical Asset Matrix */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tabValue}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4 }}
        >
          {/* Asset Grid */}
          {(tabValue === 0 || tabValue === 1) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
              {filteredGifts.map((gift, i) => {
                const rarity = RARITY_CONFIG[gift.rarity] || RARITY_CONFIG.common;
                return (
                  <motion.div 
                    key={gift._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="premium-card group !p-0 overflow-hidden hover:border-emerald-500/30 transition-all duration-700 bg-[#0a0a0a] border-white/5 shadow-2xl"
                  >
                    <div className="relative h-64 bg-zinc-950 flex items-center justify-center p-12 group-hover:bg-zinc-900/50 transition-all duration-700 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 z-10" />
                      
                      {/* Spectral Background Artifacts */}
                      <div className="absolute inset-0 pointer-events-none z-0">
                         <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 blur-[60px] rounded-full opacity-0 group-hover:opacity-20 transition-all duration-1000 ${rarity.bg.replace('bg-', 'bg-')}`} />
                      </div>

                      {gift.image ? (
                        <img 
                          src={getFullImageUrl(gift.image)} 
                          alt={gift.name} 
                          className="h-full w-full object-contain relative z-20 group-hover:scale-125 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" 
                        />
                      ) : (
                        <Gift size={64} className="text-zinc-900 relative z-20 group-hover:text-zinc-800 transition-colors" />
                      )}
                      
                      <div className="absolute top-6 left-6 flex flex-col gap-3 z-30">
                        <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] border backdrop-blur-md italic ${rarity.bg} ${rarity.color} ${rarity.border} ${rarity.shadow}`}>
                          {gift.rarity}
                        </div>
                        {gift.isActive && (
                           <div className="flex items-center gap-2 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
                              <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest italic">Live</span>
                           </div>
                        )}
                      </div>

                      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all z-30 translate-x-4 group-hover:translate-x-0">
                        <button 
                          onClick={() => setActiveMenu(activeMenu === gift._id ? null : gift._id)} 
                          className="w-12 h-12 rounded-2xl bg-black/80 backdrop-blur-xl text-white border border-white/10 hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all shadow-2xl flex items-center justify-center"
                        >
                          <MoreHorizontal size={20} />
                        </button>
                      </div>
                      
                      <AnimatePresence>
                        {activeMenu === gift._id && (
                          <motion.div 
                            initial={{ opacity: 0, x: 20, scale: 0.95 }} 
                            animate={{ opacity: 1, x: 0, scale: 1 }} 
                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                            className="absolute top-20 right-6 w-56 bg-zinc-900 border border-white/10 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.9)] z-50 p-3 backdrop-blur-2xl"
                          >
                            <div className="px-6 py-4 border-b border-white/5 mb-2">
                               <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.3em] italic">Asset Management</p>
                            </div>
                            <button onClick={() => navigate(`/admin/gift-management/${gift._id}`)} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-emerald-500/10 transition-all text-left italic group/opt">
                               <Edit size={18} className="text-emerald-500 group-hover/opt:scale-110 transition-transform" /> Reconfigure
                            </button>
                            <button onClick={() => { handleToggleActive(gift._id, gift.isActive); setActiveMenu(null); }} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-left italic group/opt">
                               <Power size={18} className={gift.isActive ? 'text-zinc-600' : 'text-emerald-500'} /> {gift.isActive ? 'Suspend Asset' : 'Activate Asset'}
                            </button>
                            <div className="h-px bg-white/5 my-2" />
                            <button onClick={() => { setGiftToDelete(gift._id); setActiveMenu(null); }} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/10 transition-all text-left italic group/opt">
                               <Trash2 size={18} className="group-hover/opt:scale-110 transition-transform" /> Purge Asset
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="p-8 space-y-6 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                      <div>
                        <h3 className="text-white font-bold tracking-tight text-xl mb-2 italic uppercase">{gift.name}</h3>
                        <div className="flex items-center gap-3">
                           <div className="px-3 py-1 bg-zinc-950 rounded-lg border border-white/5 shadow-inner">
                              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em] italic leading-none">{gift.category}</p>
                           </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-[0.3em] italic">Fiscal Valuation</span>
                          <span className="text-base font-bold text-white tracking-tighter italic">${gift.value.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-[0.3em] italic">Virtual Unit Cost</span>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 rounded-xl border border-emerald-500/10 shadow-inner">
                             <Zap size={12} className="text-emerald-500" />
                             <span className="text-sm font-bold text-emerald-500 tabular-nums italic">{gift.coinCost}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Sectors Management Grid */}
          {tabValue === 2 && (
            <div className="premium-card !p-0 overflow-hidden border-white/5 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-zinc-950/50">
                      <th className="px-10 py-8 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] italic">Market Sector</th>
                      <th className="px-10 py-8 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] italic">Asset Inventory</th>
                      <th className="px-10 py-8 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] italic">Cumulative Value</th>
                      <th className="px-10 py-8 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] italic text-right">Deployment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {categories.map((category, i) => {
                      const catGifts = gifts.filter(g => g.category === category);
                      const totalValue = catGifts.reduce((s, g) => s + g.value, 0);
                      const activeCount = catGifts.filter(g => g.isActive).length;
                      return (
                        <motion.tr 
                          key={category}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="hover:bg-emerald-500/[0.01] transition-all group"
                        >
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-6">
                               <div className="w-12 h-12 bg-zinc-950 rounded-2xl border border-white/5 flex items-center justify-center shadow-inner group-hover:border-emerald-500/30 transition-all">
                                  <Layers size={20} className="text-zinc-700 group-hover:text-emerald-500 transition-colors" />
                               </div>
                               <span className="text-sm font-bold text-white uppercase tracking-widest italic">{category}</span>
                            </div>
                          </td>
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-3">
                               <Package size={14} className="text-zinc-700" />
                               <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] italic">{catGifts.length} UNIQUE_NODES</span>
                            </div>
                          </td>
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-3">
                               <DollarSign size={14} className="text-emerald-500" />
                               <span className="text-lg font-bold text-white tracking-tighter italic tabular-nums">${totalValue.toFixed(2)}</span>
                            </div>
                          </td>
                          <td className="px-10 py-8 text-right">
                            <div className="inline-flex items-center gap-3 px-4 py-2 bg-black/40 rounded-xl border border-white/5">
                               <span className="text-[10px] font-bold text-emerald-500 tabular-nums italic">{activeCount}</span>
                               <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">/ {catGifts.length} ACTIVE_ASSETS</span>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Protocol Configuration Grid */}
          {tabValue === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="premium-card space-y-10 border-white/5 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/[0.02] blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="flex items-center gap-5 border-b border-white/5 pb-8 relative z-10">
                   <div className="w-14 h-14 bg-zinc-950 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                      <ShieldCheck size={28} className="text-indigo-500" />
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-white uppercase tracking-tighter italic leading-none mb-2">Fiscal Protocol Rules</h3>
                      <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.3em] italic">Economy Enforcement Parameters</p>
                   </div>
                </div>
                <div className="space-y-6 relative z-10">
                  {[
                    { label: 'Require verification for gifts over $50', active: true, icon: ShieldCheck },
                    { label: 'Enable cooldown between transactions', active: true, icon: Clock },
                    { label: 'Allow anonymous contributors', active: false, icon: UserIcon },
                  ].map(rule => {
                    const RuleIcon = rule.icon as any;
                    return (
                      <div key={rule.label} className="flex items-center justify-between p-6 bg-[#0a0a0a] rounded-[2rem] border border-white/5 group hover:border-indigo-500/20 transition-all shadow-inner">
                        <div className="flex items-center gap-5">
                           <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/5 shadow-inner group-hover:bg-indigo-500/5 transition-all">
                              <RuleIcon size={18} className="text-zinc-700 group-hover:text-indigo-500 transition-colors" />
                           </div>
                           <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">{rule.label}</span>
                        </div>
                        <button className={`w-14 h-7 rounded-full relative transition-all duration-500 shadow-inner group/toggle ${rule.active ? 'bg-indigo-500' : 'bg-zinc-900 border border-white/5'}`}>
                          <div className={`absolute top-1.5 w-4 h-4 rounded-full transition-all duration-500 ${rule.active ? 'left-8 bg-black shadow-[0_0_10px_white]' : 'left-1.5 bg-zinc-700'}`} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="premium-card space-y-10 border-white/5 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/[0.02] blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="flex items-center gap-5 border-b border-white/5 pb-8 relative z-10">
                   <div className="w-14 h-14 bg-zinc-950 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                      <Sparkles size={28} className="text-amber-500" />
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-white uppercase tracking-tighter italic leading-none mb-2">Spectral Processing</h3>
                      <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.3em] italic">Visual Identity Parameters</p>
                   </div>
                </div>
                <div className="space-y-6 relative z-10">
                  {[
                    { label: 'Display high-fidelity animations', active: true, icon: Zap },
                    { label: 'Enable spatial sound effects', active: true, icon: Globe },
                    { label: 'Particle systems on legendary gifts', active: true, icon: Target },
                  ].map(rule => {
                    const RuleIcon = rule.icon as any;
                    return (
                      <div key={rule.label} className="flex items-center justify-between p-6 bg-[#0a0a0a] rounded-[2rem] border border-white/5 group hover:border-amber-500/20 transition-all shadow-inner">
                        <div className="flex items-center gap-5">
                           <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/5 shadow-inner group-hover:bg-amber-500/5 transition-all">
                              <RuleIcon size={18} className="text-zinc-700 group-hover:text-amber-500 transition-colors" />
                           </div>
                           <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">{rule.label}</span>
                        </div>
                        <button className={`w-14 h-7 rounded-full relative transition-all duration-500 shadow-inner group/toggle ${rule.active ? 'bg-amber-500' : 'bg-zinc-900 border border-white/5'}`}>
                          <div className={`absolute top-1.5 w-4 h-4 rounded-full transition-all duration-500 ${rule.active ? 'left-8 bg-black shadow-[0_0_10px_white]' : 'left-1.5 bg-zinc-700'}`} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <ConfirmDialog
        isOpen={!!giftToDelete}
        title="Permanently Purge Digital Asset"
        message="This will remove the asset from all economy nodes. This action is irreversible."
        confirmLabel="Purge Asset"
        onConfirm={async () => {
          if (!giftToDelete) return;
          try {
            await adminGiftService.hardDeleteGift(giftToDelete);
            toast.success('Asset purged from registry');
            loadGifts();
          } catch (error) {
            toast.error('Deletion protocol failure');
          } finally {
            setGiftToDelete(null);
          }
        }}
        onCancel={() => setGiftToDelete(null)}
      />
    </div>
  );
};

// Internal icon for rules
const Clock = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

export default GiftManagement;
