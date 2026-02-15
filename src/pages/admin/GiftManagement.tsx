import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  Settings,
  Gift,
  DollarSign,
  Star,
  Package,
  Search,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Filter,
  MoreHorizontal,
  Eye,
  Power,
} from 'lucide-react';
import adminGiftService, {
  AdminGiftPayload,
  GiftResponse,
} from '../../services/adminGiftService';
import toast from 'react-hot-toast';
import GiftDialog from '../../components/gift/GiftDialog';

const RARITY_COLORS: Record<string, string> = {
  common: 'bg-gray-100 text-gray-700',
  rare: 'bg-blue-50 text-blue-700',
  epic: 'bg-purple-50 text-purple-700',
  legendary: 'bg-amber-50 text-amber-700',
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

  useEffect(() => {
    loadGifts();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = () => setActiveMenu(null);
    if (activeMenu) document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [activeMenu]);

  const loadGifts = async () => {
    try {
      setLoading(true);
      const data = await adminGiftService.getAllGifts();
      setGifts(Array.isArray(data) ? data : []);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load gifts';
      if (errorMessage.includes('Access token required') || errorMessage.includes('token') || error.response?.status === 401) {
        toast.error('Authentication required. Please log in to continue.');
        setTimeout(() => { navigate('/login', { replace: true }); }, 2000);
      } else {
        toast.error(`Failed to load gifts: ${errorMessage}`);
      }
      console.error('Error loading gifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(
    () => Array.from(new Set(gifts.map((g) => g.category))),
    [gifts]
  );

  const filteredGifts = useMemo(() => {
    let list = gifts;
    if (tabValue === 1) list = list.filter((g) => g.isActive);
    if (filterCategory !== 'all') list = list.filter((g) => g.category === filterCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.description?.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [gifts, tabValue, filterCategory, searchQuery]);

  const handleOpenDialog = (gift?: GiftResponse) => {
    setEditingGift(gift || null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGift(null);
  };

  const handleDelete = async (giftId: string) => {
    if (window.confirm('Are you sure you want to deactivate this gift?')) {
      try {
        await adminGiftService.softDeleteGift(giftId);
        toast.success('Gift deactivated successfully');
        loadGifts();
      } catch (error) {
        toast.error('Failed to update gift');
        console.error('Error updating gift:', error);
      }
    }
  };

  const handleToggleActive = async (giftId: string, isActive: boolean) => {
    try {
      await adminGiftService.updateGift(giftId, { isActive: !isActive });
      toast.success(`Gift ${!isActive ? 'activated' : 'deactivated'} successfully`);
      loadGifts();
    } catch (error) {
      toast.error('Failed to update gift status');
      console.error('Error updating gift status:', error);
    }
  };

  const stats = useMemo(
    () => ({
      total: gifts.length,
      active: gifts.filter((g) => g.isActive).length,
      totalValue: gifts.reduce((s, g) => s + g.value, 0),
      totalCoins: gifts.reduce((s, g) => s + g.coinCost, 0),
    }),
    [gifts]
  );

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-500 border-t-transparent" />
        <p className="text-sm text-gray-400">Loading gifts...</p>
      </div>
    );
  }

  const tabs = [
    { label: 'All Gifts', count: gifts.length },
    { label: 'Active', count: stats.active },
    { label: 'Categories', count: categories.length },
    { label: 'Rules & Settings', count: null },
  ];

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gift Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage gifts, set values, and configure rules
          </p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Gift
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Gifts', value: stats.total, icon: Gift, color: 'green' },
          { label: 'Total Value', value: `$${stats.totalValue.toFixed(2)}`, icon: DollarSign, color: 'blue' },
          { label: 'Active Gifts', value: stats.active, icon: Star, color: 'emerald' },
          { label: 'Combined Cost', value: `${stats.totalCoins} coins`, icon: Package, color: 'amber' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl bg-${stat.color}-50 flex items-center justify-center`}>
                <stat.icon className={`w-4.5 h-4.5 text-${stat.color}-500`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex border-b border-gray-100">
          {tabs.map((tab, index) => (
            <button
              key={tab.label}
              onClick={() => setTabValue(index)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tabValue === index
                  ? 'text-green-600 border-green-500'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    tabValue === index
                      ? 'bg-green-50 text-green-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search & Filter Bar (for gift tabs) */}
        {(tabValue === 0 || tabValue === 1) && (
          <div className="p-4 border-b border-gray-50 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search gifts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-9 pr-8 py-2 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 appearance-none"
              >
                <option value="all">All categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs text-gray-400">
              {filteredGifts.length} result{filteredGifts.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Tab Content */}
        <div className="p-5">
          {/* All Gifts / Active */}
          {(tabValue === 0 || tabValue === 1) && (
            <>
              {filteredGifts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Gift className="w-10 h-10 mb-3 opacity-40" />
                  <p className="text-sm">No gifts found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredGifts.map((gift) => (
                    <div
                      key={gift._id}
                      className="group bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-all duration-200 overflow-hidden"
                    >
                      {/* Image */}
                      <div className="relative h-36 bg-gray-50 flex items-center justify-center">
                        {gift.image ? (
                          <img
                            src={gift.image.startsWith('http') ? gift.image : gift.image}
                            alt={gift.name}
                            className="h-24 w-24 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Gift className="w-10 h-10 text-gray-300" />
                        )}
                        {/* Status badge */}
                        <span
                          className={`absolute top-3 left-3 px-2 py-0.5 rounded-lg text-[11px] font-medium ${
                            gift.isActive
                              ? 'bg-green-50 text-green-600'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {gift.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {/* Rarity badge */}
                        <span
                          className={`absolute top-3 right-3 px-2 py-0.5 rounded-lg text-[11px] font-medium capitalize ${
                            RARITY_COLORS[gift.rarity] || RARITY_COLORS.common
                          }`}
                        >
                          {gift.rarity}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="text-sm font-semibold text-gray-900 truncate flex-1">
                            {gift.name}
                          </h3>
                          <div className="relative ml-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenu(activeMenu === gift._id ? null : gift._id);
                              }}
                              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            {activeMenu === gift._id && (
                              <div className="absolute right-0 top-8 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                                <button
                                  onClick={() => { handleOpenDialog(gift); setActiveMenu(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <Edit className="w-3.5 h-3.5" /> Edit
                                </button>
                                <button
                                  onClick={() => { handleToggleActive(gift._id, gift.isActive); setActiveMenu(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <Power className="w-3.5 h-3.5" />
                                  {gift.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                  onClick={() => { handleDelete(gift._id); setActiveMenu(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        {gift.description && (
                          <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                            {gift.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[11px] font-medium rounded-md capitalize">
                            {gift.category}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-50 text-gray-600 text-[11px] font-medium rounded-md capitalize">
                            {gift.type}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-gray-900">
                            ${gift.value.toFixed(2)}
                          </span>
                          <span className="text-gray-500">
                            {gift.coinCost} coins
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Categories */}
          {tabValue === 2 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Count</th>
                    <th className="px-4 py-3 font-medium">Total Value</th>
                    <th className="px-4 py-3 font-medium">Avg Coin Cost</th>
                    <th className="px-4 py-3 font-medium">Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {categories.map((category) => {
                    const catGifts = gifts.filter((g) => g.category === category);
                    const totalValue = catGifts.reduce((s, g) => s + g.value, 0);
                    const avgCoins = Math.round(
                      catGifts.reduce((s, g) => s + g.coinCost, 0) / catGifts.length
                    );
                    const activeCount = catGifts.filter((g) => g.isActive).length;
                    return (
                      <tr key={category} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3.5">
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {category}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-gray-600">{catGifts.length}</td>
                        <td className="px-4 py-3.5 text-sm text-gray-600">
                          ${totalValue.toFixed(2)}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-gray-600">{avgCoins} coins</td>
                        <td className="px-4 py-3.5">
                          <span className="text-sm text-green-600 font-medium">
                            {activeCount}/{catGifts.length}
                          </span>
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
            <div className="space-y-5">
              <div className="p-4 bg-green-50/50 border border-green-100 rounded-xl">
                <p className="text-sm text-green-700">
                  Configure global gift rules. These apply to all gifts unless overridden individually.
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="border border-gray-100 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-900">Global Rules</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Require verification for gifts over $50', defaultChecked: true },
                      { label: 'Enable cooldown between gifts', defaultChecked: true },
                      { label: 'Allow anonymous gifts', defaultChecked: false },
                    ].map((rule) => (
                      <label
                        key={rule.label}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          defaultChecked={rule.defaultChecked}
                          className="w-4 h-4 rounded text-green-500 focus:ring-green-500/20 border-gray-300"
                        />
                        <span className="text-sm text-gray-700">{rule.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="border border-gray-100 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-900">Effects & Animations</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Show gift animations', defaultChecked: true },
                      { label: 'Play sound effects', defaultChecked: true },
                      { label: 'Enable special effects', defaultChecked: false },
                    ].map((rule) => (
                      <label
                        key={rule.label}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          defaultChecked={rule.defaultChecked}
                          className="w-4 h-4 rounded text-green-500 focus:ring-green-500/20 border-gray-300"
                        />
                        <span className="text-sm text-gray-700">{rule.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Gift Dialog */}
      {openDialog && (
        <GiftDialog open={openDialog} onClose={handleCloseDialog} editingGift={editingGift} onSuccess={loadGifts} />
      )}
    </div>
  );
};

export default GiftManagement;
