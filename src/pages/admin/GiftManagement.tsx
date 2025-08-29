import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  Eye,
  Settings,
  Gift,
  DollarSign,
  Star,
  Package,
  TrendingUp,
  Users,
  Archive,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { giftService } from '../../services/giftService';
import { Gift as GiftType } from '../../types';
import toast from 'react-hot-toast';

interface GiftFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isActive: boolean;
  stock: number;
  rules: {
    minAmount: number;
    maxAmount: number;
    cooldownMinutes: number;
    dailyLimit: number;
    requiresVerification: boolean;
  };
  effects: {
    showAnimation: boolean;
    playSound: boolean;
    specialEffect: string;
  };
}

const GiftManagement: React.FC = () => {
  const [gifts, setGifts] = useState<GiftType[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGift, setEditingGift] = useState<GiftType | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<GiftFormData>({
    name: '',
    description: '',
    price: 0,
    category: '',
    image: '',
    isActive: true,
    stock: 0,
    rules: {
      minAmount: 1,
      maxAmount: 100,
      cooldownMinutes: 0,
      dailyLimit: 10,
      requiresVerification: false,
    },
    effects: {
      showAnimation: true,
      playSound: true,
      specialEffect: 'none',
    },
  });

  useEffect(() => {
    loadGifts();
  }, []);

  const loadGifts = async () => {
    try {
      setLoading(true);
      const response = await giftService.getAllGifts();
      if (response.data && response.data.data) {
        setGifts(response.data.data as GiftType[]);
      } else {
        setGifts([]);
      }
    } catch (error) {
      toast.error('Failed to load gifts');
      console.error('Error loading gifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (gift?: GiftType) => {
    if (gift) {
      setEditingGift(gift);
      setFormData({
        name: gift.name,
        description: gift.description,
        price: gift.price,
        category: gift.category,
        image: gift.image,
        isActive: gift.isActive,
        stock: gift.stock,
        rules: {
          minAmount: 1,
          maxAmount: 100,
          cooldownMinutes: 0,
          dailyLimit: 10,
          requiresVerification: false,
        },
        effects: {
          showAnimation: true,
          playSound: true,
          specialEffect: 'none',
        },
      });
    } else {
      setEditingGift(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: '',
        image: '',
        isActive: true,
        stock: 0,
        rules: {
          minAmount: 1,
          maxAmount: 100,
          cooldownMinutes: 0,
          dailyLimit: 10,
          requiresVerification: false,
        },
        effects: {
          showAnimation: true,
          playSound: true,
          specialEffect: 'none',
        },
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGift(null);
  };

  const handleSubmit = async () => {
    try {
      setUploading(true);
      const giftData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        image: formData.image,
        isActive: formData.isActive,
        stock: formData.stock,
        rules: formData.rules,
        effects: formData.effects,
      };

      if (editingGift) {
        await giftService.updateGift(editingGift._id, giftData);
        toast.success('Gift updated successfully');
      } else {
        await giftService.createGift(giftData);
        toast.success('Gift created successfully');
      }
      handleCloseDialog();
      loadGifts();
    } catch (error) {
      toast.error('Failed to save gift');
      console.error('Error saving gift:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (giftId: string) => {
    if (window.confirm('Are you sure you want to delete this gift?')) {
      try {
        await giftService.deleteGift(giftId);
        toast.success('Gift deleted successfully');
        loadGifts();
      } catch (error) {
        toast.error('Failed to delete gift');
        console.error('Error deleting gift:', error);
      }
    }
  };

  const handleToggleActive = async (giftId: string, isActive: boolean) => {
    try {
      await giftService.updateGift(giftId, { isActive: !isActive });
      toast.success(`Gift ${!isActive ? 'activated' : 'deactivated'} successfully`);
      loadGifts();
    } catch (error) {
      toast.error('Failed to update gift status');
      console.error('Error updating gift status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/30 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Gift Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage gifts, set values, and configure rules for the platform
            </p>
          </div>
          <button
            onClick={() => handleOpenDialog()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <Plus className="w-5 h-5" />
            Add Gift
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 text-center">
            <Gift className="w-10 h-10 text-blue-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-blue-600">{gifts.length}</div>
            <div className="text-sm text-gray-600">Total Gifts</div>
          </div>
          <div className="p-6 rounded-3xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-center">
            <DollarSign className="w-10 h-10 text-green-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-green-600">
              ${gifts.reduce((sum, g) => sum + g.price, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Value</div>
          </div>
          <div className="p-6 rounded-3xl bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 text-center">
            <Star className="w-10 h-10 text-yellow-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-yellow-600">
              {gifts.filter(g => g.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Active Gifts</div>
          </div>
          <div className="p-6 rounded-3xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 text-center">
            <Package className="w-10 h-10 text-pink-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-pink-600">
              {gifts.reduce((sum, g) => sum + g.stock, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Stock</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/30 overflow-hidden">
        <div className="flex">
          {['All Gifts', 'Active', 'Categories', 'Rules & Settings'].map((tab, index) => (
            <button
              key={tab}
              onClick={() => handleTabChange(index)}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-300 ${
                tabValue === index
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {tabValue === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gifts.map((gift) => (
              <div
                key={gift._id}
                className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{gift.name}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      gift.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {gift.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{gift.description}</p>
                <div className="flex gap-2 mb-4 flex-wrap">
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs rounded-full font-medium">
                    {gift.category}
                  </span>
                  <span className="px-3 py-1 border border-blue-600 text-blue-600 text-xs rounded-full">
                    ${gift.price}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Stock: {gift.stock}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenDialog(gift)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(gift._id, gift.isActive)}
                      className={`p-2 rounded-lg transition-colors ${
                        gift.isActive
                          ? 'text-yellow-600 hover:bg-yellow-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(gift._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tabValue === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gifts.filter(g => g.isActive).map((gift) => (
              <div
                key={gift._id}
                className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 p-6"
              >
                <h3 className="text-lg font-semibold mb-2">{gift.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{gift.description}</p>
                <div className="flex gap-2 mb-4">
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                    {gift.category}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    ${gift.price}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Stock: {gift.stock}</span>
                  <button
                    onClick={() => handleOpenDialog(gift)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tabValue === 2 && (
          <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Gift Categories</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">Category</th>
                    <th className="px-6 py-3 text-left font-semibold">Count</th>
                    <th className="px-6 py-3 text-left font-semibold">Total Value</th>
                    <th className="px-6 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(new Set(gifts.map(g => g.category))).map((category) => {
                    const categoryGifts = gifts.filter(g => g.category === category);
                    const totalValue = categoryGifts.reduce((sum, g) => sum + g.price, 0);
                    return (
                      <tr key={category} className="hover:bg-gray-50 border-b border-gray-100">
                        <td className="px-6 py-4">{category}</td>
                        <td className="px-6 py-4">{categoryGifts.length}</td>
                        <td className="px-6 py-4">${totalValue}</td>
                        <td className="px-6 py-4">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            View All
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tabValue === 3 && (
          <div>
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                Configure global gift rules and settings. These settings apply to all gifts unless overridden by individual gift rules.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl p-6">
                <h3 className="text-lg font-semibold mb-4">Global Rules</h3>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-3" />
                    <span>Require verification for gifts over $50</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-3" />
                    <span>Enable cooldown between gifts</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" />
                    <span>Allow anonymous gifts</span>
                  </label>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl p-6">
                <h3 className="text-lg font-semibold mb-4">Effects & Animations</h3>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-3" />
                    <span>Show gift animations</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-3" />
                    <span>Play sound effects</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" />
                    <span>Enable special effects</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Gift Dialog */}
      {openDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-3xl">
              <h2 className="text-xl font-semibold">
                {editingGift ? 'Edit Gift' : 'Add New Gift'}
              </h2>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <input
                    type="text"
                    placeholder="Gift Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    <option value="virtual">Virtual</option>
                    <option value="physical">Physical</option>
                    <option value="experience">Experience</option>
                    <option value="digital">Digital</option>
                  </select>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <label className="flex items-center mt-4">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="mr-3"
                    />
                    <span>Active</span>
                  </label>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Rules & Settings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Min Amount"
                    value={formData.rules.minAmount}
                    onChange={(e) => setFormData({
                      ...formData,
                      rules: { ...formData.rules, minAmount: Number(e.target.value) }
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max Amount"
                    value={formData.rules.maxAmount}
                    onChange={(e) => setFormData({
                      ...formData,
                      rules: { ...formData.rules, maxAmount: Number(e.target.value) }
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Cooldown (minutes)"
                    value={formData.rules.cooldownMinutes}
                    onChange={(e) => setFormData({
                      ...formData,
                      rules: { ...formData.rules, cooldownMinutes: Number(e.target.value) }
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Daily Limit"
                    value={formData.rules.dailyLimit}
                    onChange={(e) => setFormData({
                      ...formData,
                      rules: { ...formData.rules, dailyLimit: Number(e.target.value) }
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
              <button
                onClick={handleCloseDialog}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={uploading || !formData.name || !formData.category}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    {editingGift ? 'Update' : 'Create Gift'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftManagement;
