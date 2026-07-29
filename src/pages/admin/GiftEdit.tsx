import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import adminGiftService, { GiftResponse, AdminGiftPayload } from '../../services/adminGiftService';
import { getAccessToken, getFullImageUrl } from '../../services/api';
import { toast } from 'react-hot-toast';
import {
  Upload, Calendar, ImageIcon, Coins, DollarSign, Tag,
  Type as TypeIcon, Star, X, CheckCircle2, ShieldCheck,
  Zap, Activity, Loader2, Sparkles, ChevronRight, Gift,
  ArrowLeft, Cpu, Target, Layers, SlidersHorizontal,
  Save, Globe, HardDrive, Info, ChevronDown
} from 'lucide-react';
import FileUpload from '../../components/ui/FileUpload';
import { updateGift, createGiftJson } from '../../store/slices/giftSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';

interface GiftFormData {
  name: string;
  description: string;
  value: number;
  coinCost: number;
  type: AdminGiftPayload['type'];
  rarity: AdminGiftPayload['rarity'];
  category: string;
  image: string;
  isActive: boolean;
  isAnimated: boolean;
  isSeasonal: boolean;
  seasonalStart: string;
  seasonalEnd: string;
  clashPoints: number;
  clashAction: AdminGiftPayload['clashAction'];
}

const INITIAL_FORM_DATA: GiftFormData = {
  name: '',
  description: '',
  value: 0,
  coinCost: 0,
  type: 'coin',
  rarity: 'common',
  category: 'support',
  image: '',
  isActive: true,
  isAnimated: false,
  isSeasonal: false,
  seasonalStart: '',
  seasonalEnd: '',
  clashPoints: 0,
  clashAction: 'none',
};

const GIFT_TYPES: Array<{ value: AdminGiftPayload['type']; label: string }> = [
  { value: 'coin', label: 'COIN_UNIT' },
  { value: 'badge', label: 'IDENTITY_BADGE' },
  { value: 'sticker', label: 'VISUAL_SIGNAL' },
  { value: 'special', label: 'ELITE_ASSET' },
];

const GIFT_RARITIES: Array<{ value: AdminGiftPayload['rarity']; label: string }> = [
  { value: 'common', label: 'COMMON_TIER' },
  { value: 'rare', label: 'RARE_TIER' },
  { value: 'epic', label: 'EPIC_TIER' },
  { value: 'legendary', label: 'LEGENDARY_TIER' },
];

const GIFT_CATEGORIES: string[] = ['support', 'music', 'celebration', 'love', 'funny', 'custom'];

const CLASH_ACTIONS: Array<{ value: AdminGiftPayload['clashAction']; label: string }> = [
  { value: 'none', label: 'NULL_ACTION' },
  { value: 'mute_opponent', label: 'MUTE_TARGET' },
  { value: 'flame_overlay', label: 'THERMAL_OVERLAY' },
  { value: 'sound_effect', label: 'SONIC_PULSE' },
  { value: 'noise', label: 'SONIC_DISRUPTION' },
];

const GiftEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<GiftFormData>(INITIAL_FORM_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [pendingIconFile, setPendingIconFile] = useState<File | null>(null);

  useEffect(() => {
    if (id) {
      fetchGift();
    }
  }, [id]);

  const fetchGift = async () => {
    try {
      setLoading(true);
      const gifts = await adminGiftService.getAllGifts();
      const gift = gifts.find(g => g._id === id);
      
      if (gift) {
        setFormData({
          name: gift.name,
          description: gift.description || '',
          value: gift.value,
          coinCost: gift.coinCost,
          type: gift.type,
          rarity: gift.rarity,
          category: gift.category,
          image: gift.image,
          isActive: gift.isActive,
          isAnimated: gift.isAnimated ?? false,
          isSeasonal: gift.isSeasonal,
          seasonalStart: gift.seasonalStart ? gift.seasonalStart.split('T')[0] : '',
          seasonalEnd: gift.seasonalEnd ? gift.seasonalEnd.split('T')[0] : '',
          clashPoints: gift.clashPoints || 0,
          clashAction: gift.clashAction || 'none',
        });
      } else {
        toast.error('Asset not found in registry');
        navigate('/admin/gift-management');
      }
    } catch (error) {
      toast.error('Failed to load asset data');
    } finally {
      setLoading(false);
    }
  };

  const handleIconSelect = (file: File) => {
    setPendingIconFile(file);
    toast('Spectral icon protocol queued', { icon: '📎' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const loadingId = toast.loading(id ? 'Synchronizing asset registry...' : 'Registering new digital asset...');

    try {
      let finalImageUrl = formData.image;

      if (pendingIconFile) {
        const presign = await adminGiftService.getPresignedUrl('gift-image', pendingIconFile.name, pendingIconFile.type);
        await adminGiftService.uploadToS3(presign.uploadUrl, pendingIconFile, pendingIconFile.type);
        finalImageUrl = presign.publicUrl;
      }

      const giftPayload: AdminGiftPayload = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description?.trim(),
        value: Number(formData.value),
        coinCost: Number(formData.coinCost),
        image: finalImageUrl,
        category: formData.category as any,
        seasonalStart: formData.isSeasonal ? formData.seasonalStart : undefined,
        seasonalEnd: formData.isSeasonal ? formData.seasonalEnd : undefined,
      };

      if (id) {
        const result = await dispatch(updateGift({ id, data: giftPayload }));
        if (updateGift.rejected.match(result)) throw new Error(result.payload as string);
        toast.success('Asset registry synchronized', { id: loadingId });
      } else {
        const result = await dispatch(createGiftJson(giftPayload));
        if (createGiftJson.rejected.match(result)) throw new Error(result.payload as string);
        toast.success('Asset deployed to economy matrix', { id: loadingId });
      }

      navigate('/admin/gift-management');
    } catch (error: any) {
      toast.error(error.message || 'Transmission failure', { id: loadingId });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative inline-block mb-8">
             <div className="w-24 h-24 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
          </div>
          <p className="text-sm font-medium text-zinc-500">Loading gift details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24">
      {/* Cinematic Asset Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/admin/gift-management')} 
            className="w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-950 text-zinc-600 hover:text-zinc-900 dark:text-white hover:bg-black/5 dark:bg-white/5 transition-all border border-black/5 dark:border-white/5 shadow-inner flex items-center justify-center group"
          >
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white leading-none">
                {id ? 'Edit Gift' : 'Add Gift'}
              </h1>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{id ? 'Editing' : 'New Gift'}</span>
              </div>
            </div>
            <p className="text-zinc-500 text-sm font-medium ml-1">
              Gift ID: <span className="text-zinc-700 dark:text-zinc-300 select-all">{id || 'Pending'}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/gift-management')} 
            className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={submitting} 
            className="px-6 py-3 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-all shadow-lg flex items-center justify-center gap-2 group"
          >
            {submitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {id ? 'Save Changes' : 'Create Gift'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Main Configuration Console */}
        <div className="xl:col-span-2 space-y-10">
          
          <div className="premium-card !p-12 relative overflow-hidden group border-black/5 dark:border-white/5 shadow-2xl bg-white dark:bg-[#0a0a0a]">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/[0.02] blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="flex items-center gap-6 mb-12 border-b border-black/5 dark:border-white/5 pb-10">
              <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-950 rounded-[1.5rem] flex items-center justify-center border border-black/5 dark:border-white/5 shadow-inner relative overflow-hidden group-hover:border-emerald-500/30 transition-all">
                 <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <ShieldCheck size={28} className="text-emerald-500 relative z-10" />
              </div>
              <div>
                 <p className="text-sm font-medium text-emerald-600 mb-1">Gift Information</p>
                 <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Basic Details</h2>
              </div>
            </div>

            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Name <span className="text-emerald-500">*</span></label>
                  <div className="relative group">
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} 
                      className="w-full h-12 px-4 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-xl text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500/30 transition-all shadow-inner placeholder:text-zinc-400" 
                      placeholder="e.g. Crown" 
                      required 
                    />
                    <Target size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-900 group-focus-within:text-emerald-500 transition-all" />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Category</label>
                  <div className="relative group">
                    <select 
                      value={formData.category} 
                      onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} 
                      className="w-full h-12 px-4 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-xl text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500/30 appearance-none shadow-inner transition-all cursor-pointer"
                    >
                      {GIFT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-900 pointer-events-none group-focus-within:rotate-180 duration-500 transition-all group-focus-within:text-emerald-500" />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
                  <span className="text-xs text-zinc-500">Optional</span>
                </div>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} 
                  className="w-full p-4 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-xl text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500/30 transition-all shadow-inner resize-none h-32 placeholder:text-zinc-400" 
                  placeholder="Enter gift description..." 
                />
              </div>
            </div>

            <div className="mt-16 pt-12 border-t border-black/5 dark:border-white/5 space-y-10">
              <div className="flex items-center gap-6 mb-12">
                <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-950 rounded-[1.5rem] flex items-center justify-center border border-black/5 dark:border-white/5 shadow-inner relative overflow-hidden group-hover:border-blue-500/30 transition-all">
                   <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <DollarSign size={28} className="text-blue-500 relative z-10" />
                </div>
                <div>
                   <p className="text-sm font-medium text-blue-600 mb-1">Pricing</p>
                   <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Value & Cost</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Value (USD)</label>
                  <div className="relative group">
                    <DollarSign size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-all" />
                    <input 
                      type="number" 
                      step="0.01" 
                      value={formData.value || ''} 
                      onChange={(e) => setFormData(p => ({ ...p, value: parseFloat(e.target.value) || 0 }))} 
                      className="w-full h-12 pl-12 pr-4 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-xl text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500/30 shadow-inner tabular-nums" 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Coin Cost</label>
                  <div className="relative group">
                    <Zap size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-all" />
                    <input 
                      type="number" 
                      value={formData.coinCost || ''} 
                      onChange={(e) => setFormData(p => ({ ...p, coinCost: parseInt(e.target.value) || 0 }))} 
                      className="w-full h-12 pl-12 pr-4 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-xl text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500/30 shadow-inner tabular-nums" 
                      required 
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-500">COINS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="premium-card !p-10 space-y-10 border-black/5 dark:border-white/5 bg-white dark:bg-[#0a0a0a]">
              <div className="flex items-center gap-5">
                 <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-950 rounded-2xl flex items-center justify-center border border-black/5 dark:border-white/5 shadow-inner">
                    <Activity size={24} className="text-amber-500" />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Live Battle Settings</h3>
                    <p className="text-sm text-zinc-500">Clash points & actions</p>
                 </div>
              </div>
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Clash Points</label>
                  <input 
                    type="number" 
                    value={formData.clashPoints || ''} 
                    onChange={(e) => setFormData(p => ({ ...p, clashPoints: parseInt(e.target.value) || 0 }))} 
                    className="w-full h-12 px-4 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-xl text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-amber-500/30 shadow-inner tabular-nums" 
                    placeholder="e.g. 500" 
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Action Effect</label>
                  <div className="relative group">
                    <select 
                      value={formData.clashAction} 
                      onChange={e => setFormData(p => ({ ...p, clashAction: e.target.value as any }))} 
                      className="w-full h-12 px-4 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-xl text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-amber-500/30 appearance-none shadow-inner transition-all cursor-pointer"
                    >
                      {CLASH_ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-900 pointer-events-none group-focus-within:rotate-180 duration-500 transition-all group-focus-within:text-amber-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="premium-card !p-10 space-y-10 border-black/5 dark:border-white/5 bg-white dark:bg-[#0a0a0a]">
              <div className="flex items-center gap-5">
                 <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-950 rounded-2xl flex items-center justify-center border border-black/5 dark:border-white/5 shadow-inner">
                    <Calendar size={24} className="text-rose-500" />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Seasonal Settings</h3>
                    <p className="text-sm text-zinc-500">Limited time availability</p>
                 </div>
              </div>
              <div className="space-y-8">
                <label className="flex items-center justify-between p-6 bg-zinc-50 dark:bg-zinc-950 rounded-[2rem] border border-black/5 dark:border-white/5 group cursor-pointer hover:border-rose-500/20 transition-all shadow-inner relative overflow-hidden">
                   <div className="absolute inset-0 bg-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="flex items-center gap-5 relative z-10">
                       <div className={`w-1.5 h-1.5 rounded-full ${formData.isSeasonal ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-zinc-800'} transition-all`} />
                       <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:text-white transition-colors">Is Seasonal Gift?</span>
                    </div>
                   <div className={`w-14 h-7 rounded-full relative transition-all duration-500 shadow-inner group/toggle ${formData.isSeasonal ? 'bg-rose-500' : 'bg-zinc-900 border border-white/5'}`}>
                      <div className={`absolute top-1.5 w-4 h-4 rounded-full transition-all duration-500 ${formData.isSeasonal ? 'left-8 bg-black shadow-[0_0_10px_white]' : 'left-1.5 bg-zinc-700'}`} />
                   </div>
                   <input type="checkbox" className="hidden" checked={formData.isSeasonal} onChange={e => setFormData(p => ({ ...p, isSeasonal: e.target.checked }))} />
                </label>
                
                <AnimatePresence>
                  {formData.isSeasonal && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-2 gap-6"
                    >
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Start Date</label>
                        <input type="date" value={formData.seasonalStart} onChange={e => setFormData(p => ({ ...p, seasonalStart: e.target.value }))} className="w-full h-12 px-4 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-xl text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-rose-500/30 shadow-inner" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">End Date</label>
                        <input type="date" value={formData.seasonalEnd} onChange={e => setFormData(p => ({ ...p, seasonalEnd: e.target.value }))} className="w-full h-12 px-4 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-xl text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-rose-500/30 shadow-inner" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Status Matrix */}
        <div className="space-y-10">
          <div className="premium-card !p-10 space-y-10 border-black/5 dark:border-white/5 bg-white dark:bg-[#0a0a0a]">
            <div className="flex items-center gap-5">
               <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-950 rounded-2xl flex items-center justify-center border border-black/5 dark:border-white/5 shadow-inner">
                  <ImageIcon size={24} className="text-emerald-500" />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Gift Image</h3>
                  <p className="text-sm text-zinc-500">Visual representation</p>
               </div>
            </div>
            
            <div className="bg-zinc-50 dark:bg-zinc-950 rounded-[2.5rem] border border-black/5 dark:border-white/5 p-8 shadow-inner group/upload">
               <FileUpload 
                label="Upload Gift Image"
                currentFile={pendingIconFile ? URL.createObjectURL(pendingIconFile) : (formData.image ? getFullImageUrl(formData.image) : undefined)}
                onFileSelect={handleIconSelect}
                onFileRemove={() => { setPendingIconFile(null); setFormData(p => ({ ...p, image: '' })); }}
              />
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-6 bg-zinc-50 dark:bg-zinc-950 rounded-[2rem] border border-black/5 dark:border-white/5 group cursor-pointer hover:border-emerald-500/20 transition-all shadow-inner relative overflow-hidden">
                 <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <div className="flex items-center gap-5 relative z-10">
                    <div className={`w-1.5 h-1.5 rounded-full ${formData.isActive ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-zinc-800'} transition-all`} />
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:text-white transition-colors">Is Active?</span>
                 </div>
                 <div className={`w-14 h-7 rounded-full relative transition-all duration-500 shadow-inner group/toggle ${formData.isActive ? 'bg-emerald-500' : 'bg-zinc-900 border border-white/5'}`}>
                    <div className={`absolute top-1.5 w-4 h-4 rounded-full transition-all duration-500 ${formData.isActive ? 'left-8 bg-black shadow-[0_0_10px_white]' : 'left-1.5 bg-zinc-700'}`} />
                 </div>
                 <input type="checkbox" className="hidden" checked={formData.isActive} onChange={e => setFormData(p => ({ ...p, isActive: e.target.checked }))} />
              </label>

              <label className="flex items-center justify-between p-6 bg-zinc-50 dark:bg-zinc-950 rounded-[2rem] border border-black/5 dark:border-white/5 group cursor-pointer hover:border-emerald-500/20 transition-all shadow-inner relative overflow-hidden">
                 <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <div className="flex items-center gap-5 relative z-10">
                    <div className={`w-1.5 h-1.5 rounded-full ${formData.isAnimated ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-zinc-800'} transition-all`} />
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:text-white transition-colors">Is Animated?</span>
                 </div>
                 <div className={`w-14 h-7 rounded-full relative transition-all duration-500 shadow-inner group/toggle ${formData.isAnimated ? 'bg-emerald-500' : 'bg-zinc-900 border border-white/5'}`}>
                    <div className={`absolute top-1.5 w-4 h-4 rounded-full transition-all duration-500 ${formData.isAnimated ? 'left-8 bg-black shadow-[0_0_10px_white]' : 'left-1.5 bg-zinc-700'}`} />
                 </div>
                 <input type="checkbox" className="hidden" checked={formData.isAnimated} onChange={e => setFormData(p => ({ ...p, isAnimated: e.target.checked }))} />
              </label>
            </div>
          </div>

          <div className="premium-card !p-10 space-y-10 border-black/5 dark:border-white/5 bg-white dark:bg-[#0a0a0a]">
            <div className="flex items-center gap-5">
               <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-950 rounded-2xl flex items-center justify-center border border-black/5 dark:border-white/5 shadow-inner">
                  <Tag size={24} className="text-indigo-500" />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Classification</h3>
                  <p className="text-sm text-zinc-500">Type and rarity</p>
               </div>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Gift Type</label>
                <div className="relative group/sel">
                  <select 
                    value={formData.type} 
                    onChange={e => setFormData(p => ({ ...p, type: e.target.value as any }))} 
                    className="w-full h-12 px-4 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-xl text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500/30 appearance-none shadow-inner transition-all cursor-pointer"
                  >
                    {GIFT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-900 pointer-events-none group-focus-within/sel:rotate-180 duration-500 transition-all group-focus-within/sel:text-indigo-500" />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Rarity</label>
                <div className="relative group/sel">
                  <select 
                    value={formData.rarity} 
                    onChange={e => setFormData(p => ({ ...p, rarity: e.target.value as any }))} 
                    className="w-full h-12 px-4 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-xl text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500/30 appearance-none shadow-inner transition-all cursor-pointer"
                  >
                    {GIFT_RARITIES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-900 pointer-events-none group-focus-within/sel:rotate-180 duration-500 transition-all group-focus-within/sel:text-indigo-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftEdit;
