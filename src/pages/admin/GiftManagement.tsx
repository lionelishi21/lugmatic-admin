import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Edit, Trash2, Settings, Gift, DollarSign, Star, Package,
  Search, Sparkles, Filter, MoreHorizontal, Power, AlertTriangle,
  X, ChevronDown, CheckCircle2, Zap, LayoutGrid, List
} from 'lucide-react';
import adminGiftService, { GiftResponse } from '../../services/adminGiftService';
import { getFullImageUrl } from '../../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import GiftDialog from '../../components/gift/GiftDialog';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const RARITY_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  common: { color: 'text-zinc-400', bg: 'bg-zinc-500/5', border: 'border-white/5' },
  rare: { color: 'text-blue-500', bg: 'bg-blue-500/5', border: 'border-blue-500/10' },
  epic: { color: 'text-purple-500', bg: 'bg-purple-500/5', border: 'border-purple-500/10' },
  legendary: { color: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/10' },
};

const GiftManagement: React.FC = () => {
  const navigate = useNavigate();
  const [gifts, setGifts] = useState<GiftResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGift, setEditingGift] = useState<GiftResponse | null>(null);
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

  const handleOpenDialog = (gift?: GiftResponse) => {
    setEditingGift(gift || null);
    setOpenDialog(true);
  };

  const handleToggleActive = async (giftId: string, isActive: boolean) => {
    try {
      await adminGiftService.updateGift(giftId, { isActive: !isActive });
      toast.success(`Gift ${!isActive ? 'activated' : 'deactivated'}`);
      loadGifts();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Digital Gifts</h1>
          <p className="text-zinc-500">Manage virtual assets, set values, and configure rewards.</p>
        </div>
        <button onClick={() => handleOpenDialog()} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Create Gift
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Assets', value: stats.total, icon: Gift, color: 'text-indigo-500', bg: 'bg-indigo-500/5' },
          { label: 'Live Economy', value: stats.active, icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
          { label: 'Economic Value', value: `$${stats.value.toFixed(0)}`, icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-500/5' },
          { label: 'Coin Volume', value: stats.coins.toLocaleString(), icon: Package, color: 'text-amber-500', bg: 'bg-amber-500/5' },
        ].map(s => (
          <div key={s.label} className="premium-card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 ${s.bg}`}>
              <s.icon size={20} className={s.color} />
            </div>
            <p className="text-zinc-500 text-xs font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-white tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-1 flex flex-wrap items-center gap-1 w-fit">
        {['All Gifts', 'Active Only', 'Categories', 'Rules'].map((label, i) => (
          <button
            key={label}
            onClick={() => setTabValue(i)}
            className={`px-6 py-2 rounded-2xl text-xs font-semibold transition-all ${
              tabValue === i ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {label}
            {i < 3 && <span className="ml-2 opacity-50">{i === 2 ? categories.length : (i === 1 ? stats.active : stats.total)}</span>}
          </button>
        ))}
      </div>

      {(tabValue === 0 || tabValue === 1) && (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-11"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input-field pl-11 pr-10 appearance-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tabValue}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {/* Gifts Grid */}
          {(tabValue === 0 || tabValue === 1) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredGifts.map((gift) => {
                const rarity = RARITY_CONFIG[gift.rarity] || RARITY_CONFIG.common;
                return (
                  <div key={gift._id} className="premium-card group !p-0 overflow-hidden hover:border-emerald-500/20">
                    <div className="relative h-48 bg-zinc-950 flex items-center justify-center p-8">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-60" />
                      {gift.image ? (
                        <img src={getFullImageUrl(gift.image)} alt={gift.name} className="h-full w-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <Gift size={48} className="text-zinc-800" />
                      )}
                      
                      <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${rarity.bg} ${rarity.color} ${rarity.border}`}>
                          {gift.rarity}
                        </span>
                        {gift.isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />}
                      </div>

                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <button onClick={() => setActiveMenu(activeMenu === gift._id ? null : gift._id)} className="p-2 rounded-xl bg-black/40 backdrop-blur-md text-white border border-white/10">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                      
                      <AnimatePresence>
                        {activeMenu === gift._id && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            className="absolute top-16 right-4 w-44 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl z-30 p-2"
                          >
                            <button onClick={() => { handleOpenDialog(gift); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5"><Edit size={16} /> Edit Asset</button>
                            <button onClick={() => { handleToggleActive(gift._id, gift.isActive); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5"><Power size={16} /> {gift.isActive ? 'Deactivate' : 'Activate'}</button>
                            <button onClick={() => { setGiftToDelete(gift._id); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/5"><Trash2 size={16} /> Delete</button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-white font-bold tracking-tight mb-1">{gift.name}</h3>
                        <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">{gift.category}</p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-zinc-600 uppercase">Value</span>
                          <span className="text-sm font-bold text-white">${gift.value.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[10px] font-bold text-zinc-600 uppercase">Cost</span>
                          <span className="text-sm font-bold text-emerald-500">{gift.coinCost} coins</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Categories Table */}
          {tabValue === 2 && (
            <div className="premium-card !p-0 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-5 text-xs font-semibold text-zinc-500 uppercase">Category</th>
                    <th className="px-6 py-5 text-xs font-semibold text-zinc-500 uppercase">Inventory</th>
                    <th className="px-6 py-5 text-xs font-semibold text-zinc-500 uppercase">Economic Value</th>
                    <th className="px-6 py-5 text-xs font-semibold text-zinc-500 uppercase text-right">Live Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {categories.map((category) => {
                    const catGifts = gifts.filter(g => g.category === category);
                    const totalValue = catGifts.reduce((s, g) => s + g.value, 0);
                    const activeCount = catGifts.filter(g => g.isActive).length;
                    return (
                      <tr key={category} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-white capitalize">{category}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-zinc-400">{catGifts.length} unique assets</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-emerald-500">${totalValue.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-xs font-bold text-zinc-500">{activeCount} / {catGifts.length} Active</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Rules & Settings */}
          {tabValue === 3 && (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="premium-card">
                <h3 className="text-lg font-bold mb-8">Economic Rules</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Require verification for gifts over $50', active: true },
                    { label: 'Enable cooldown between transactions', active: true },
                    { label: 'Allow anonymous contributors', active: false },
                  ].map(rule => (
                    <div key={rule.label} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-sm font-medium text-zinc-300">{rule.label}</span>
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${rule.active ? 'bg-emerald-500' : 'bg-zinc-800'}`}>
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${rule.active ? 'right-1' : 'left-1'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="premium-card">
                <h3 className="text-lg font-bold mb-8">Visual Effects</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Display high-fidelity animations', active: true },
                    { label: 'Enable spatial sound effects', active: true },
                    { label: 'Particle systems on legendary gifts', active: true },
                  ].map(rule => (
                    <div key={rule.label} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-sm font-medium text-zinc-300">{rule.label}</span>
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${rule.active ? 'bg-emerald-500' : 'bg-zinc-800'}`}>
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${rule.active ? 'right-1' : 'left-1'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Modals */}
      {openDialog && (
        <GiftDialog open={openDialog} onClose={() => setOpenDialog(false)} editingGift={editingGift} onSuccess={loadGifts} />
      )}

      <ConfirmDialog
        isOpen={!!giftToDelete}
        title="Permanently Delete Gift"
        message="This will remove the digital asset from all systems. This action cannot be undone."
        confirmLabel="Delete Asset"
        onConfirm={async () => {
          if (!giftToDelete) return;
          try {
            await adminGiftService.hardDeleteGift(giftToDelete);
            toast.success('Asset purged');
            loadGifts();
          } catch (error) {
            toast.error('Deletion failed');
          } finally {
            setGiftToDelete(null);
          }
        }}
        onCancel={() => setGiftToDelete(null)}
      />
    </div>
  );
};

export default GiftManagement;
