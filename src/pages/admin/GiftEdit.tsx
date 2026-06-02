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
             <Cpu className="absolute inset-0 m-auto text-emerald-500 animate-pulse" size={32} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 italic">Accessing Secure Asset Registry...</p>
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
              <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white leading-none italic uppercase">
                {id ? 'Asset Synchronizer' : 'Asset Ingestion'}
              </h1>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest italic">{id ? 'Modifying Node' : 'Forging New Asset'}</span>
              </div>
            </div>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] ml-1 italic">
              Registry Identifier: <span className="text-zinc-700 dark:text-zinc-300 select-all">{id || 'PENDING_REGISTRATION'}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/gift-management')} 
            className="h-16 px-10 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] border border-black/5 dark:border-white/5 hover:text-zinc-900 dark:text-white transition-all italic"
          >
            Abort Protocol
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={submitting} 
            className="h-16 px-12 bg-white text-black rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-emerald-400 transition-all shadow-2xl flex items-center justify-center gap-6 group border border-black/10 dark:border-white/10"
          >
            {submitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} className="group-hover:translate-y-1 transition-transform" />}
            {id ? 'Commit Sync' : 'Deploy Asset'}
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
                 <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-500 mb-2 italic">Neural Identity Protocol</p>
                 <h2 className="text-2xl font-bold text-zinc-900 dark:text-white uppercase tracking-tighter italic">Semantic Parameters</h2>
              </div>
            </div>

            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] italic">Asset Identifier <span className="text-emerald-500">*</span></label>
                  <div className="relative group">
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} 
                      className="w-full h-16 px-8 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-2xl text-zinc-900 dark:text-white text-[11px] font-bold tracking-[0.2em] uppercase focus:outline-none focus:border-emerald-500/30 transition-all shadow-inner placeholder:text-zinc-800 italic" 
                      placeholder="e.g. EMERALD_CROWN_PRO" 
                      required 
                    />
                    <Target size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-900 group-focus-within:text-emerald-500 transition-all" />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] italic">Market Classification</label>
                  <div className="relative group">
                    <select 
                      value={formData.category} 
                      onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} 
                      className="w-full h-16 px-8 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-2xl text-zinc-900 dark:text-white text-[11px] font-bold tracking-[0.2em] uppercase focus:outline-none focus:border-emerald-500/30 appearance-none shadow-inner transition-all italic cursor-pointer"
                    >
                      {GIFT_CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                    </select>
                    <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-900 pointer-events-none group-focus-within:rotate-180 duration-500 transition-all group-focus-within:text-emerald-500" />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] italic">Registry Logbook (Description)</label>
                  <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest italic">Semantic Context Mapping</span>
                </div>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} 
                  className="w-full p-8 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-3xl text-zinc-700 dark:text-zinc-300 text-[11px] font-bold tracking-[0.1em] focus:outline-none focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-inner resize-none h-40 leading-relaxed placeholder:text-zinc-800" 
                  placeholder="Inscribe detailed contextual metadata for the virtual asset node..." 
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
                   <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-500 mb-2 italic">Economic Configuration</p>
                   <h2 className="text-2xl font-bold text-zinc-900 dark:text-white uppercase tracking-tighter italic">Fiscal Valuation</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] italic">Fiat Valuation (USD)</label>
                  <div className="relative group">
                    <DollarSign size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-800 group-focus-within:text-emerald-500 transition-all" />
                    <input 
                      type="number" 
                      step="0.01" 
                      value={formData.value || ''} 
                      onChange={(e) => setFormData(p => ({ ...p, value: parseFloat(e.target.value) || 0 }))} 
                      className="w-full h-16 pl-16 pr-8 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-2xl text-zinc-900 dark:text-white text-[12px] font-bold tracking-[0.2em] focus:outline-none focus:border-emerald-500/30 shadow-inner italic tabular-nums" 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] italic">Virtual Unit Equivalent</label>
                  <div className="relative group">
                    <Zap size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-800 group-focus-within:text-emerald-500 transition-all" />
                    <input 
                      type="number" 
                      value={formData.coinCost || ''} 
                      onChange={(e) => setFormData(p => ({ ...p, coinCost: parseInt(e.target.value) || 0 }))} 
                      className="w-full h-16 pl-16 pr-8 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-2xl text-zinc-900 dark:text-white text-[12px] font-bold tracking-[0.2em] focus:outline-none focus:border-emerald-500/30 shadow-inner italic tabular-nums" 
                      required 
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-bold text-zinc-800 uppercase italic">COINS</span>
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
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-tighter italic leading-none mb-1.5">Engagement Protocol</h3>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.3em] italic">Battle Tactical Modifiers</p>
                 </div>
              </div>
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic ml-1">Clash Battle Multiplier</label>
                  <input 
                    type="number" 
                    value={formData.clashPoints || ''} 
                    onChange={(e) => setFormData(p => ({ ...p, clashPoints: parseInt(e.target.value) || 0 }))} 
                    className="w-full h-14 px-6 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-2xl text-zinc-900 dark:text-white text-[11px] font-bold tracking-[0.2em] focus:outline-none focus:border-amber-500/30 shadow-inner italic tabular-nums" 
                    placeholder="e.g. 500" 
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic ml-1">Live Tactical Signature</label>
                  <div className="relative group">
                    <select 
                      value={formData.clashAction} 
                      onChange={e => setFormData(p => ({ ...p, clashAction: e.target.value as any }))} 
                      className="w-full h-14 px-6 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-2xl text-zinc-900 dark:text-white text-[10px] font-bold tracking-[0.2em] uppercase focus:outline-none focus:border-amber-500/30 appearance-none shadow-inner transition-all italic cursor-pointer"
                    >
                      {CLASH_ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                    </select>
                    <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-900 pointer-events-none group-focus-within:rotate-180 duration-500 transition-all group-focus-within:text-amber-500" />
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
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-tighter italic leading-none mb-1.5">Availability Matrix</h3>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.3em] italic">Temporal Deployment Window</p>
                 </div>
              </div>
              <div className="space-y-8">
                <label className="flex items-center justify-between p-6 bg-zinc-50 dark:bg-zinc-950 rounded-[2rem] border border-black/5 dark:border-white/5 group cursor-pointer hover:border-rose-500/20 transition-all shadow-inner relative overflow-hidden">
                   <div className="absolute inset-0 bg-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="flex items-center gap-5 relative z-10">
                      <div className={`w-1.5 h-1.5 rounded-full ${formData.isSeasonal ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-zinc-800'} transition-all`} />
                      <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest italic group-hover:text-zinc-900 dark:text-white transition-colors">Seasonal Deployment Protocol</span>
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
                        <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest italic ml-1">Initiation Cycle</label>
                        <input type="date" value={formData.seasonalStart} onChange={e => setFormData(p => ({ ...p, seasonalStart: e.target.value }))} className="w-full h-12 px-6 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-2xl text-zinc-900 dark:text-white text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-rose-500/30 shadow-inner italic" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest italic ml-1">Termination Cycle</label>
                        <input type="date" value={formData.seasonalEnd} onChange={e => setFormData(p => ({ ...p, seasonalEnd: e.target.value }))} className="w-full h-12 px-6 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-2xl text-zinc-900 dark:text-white text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-rose-500/30 shadow-inner italic" />
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
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-tighter italic leading-none mb-1.5">Spectral Icon</h3>
                  <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.3em] italic">Visual Asset Protocol</p>
               </div>
            </div>
            
            <div className="bg-zinc-50 dark:bg-zinc-950 rounded-[2.5rem] border border-black/5 dark:border-white/5 p-8 shadow-inner group/upload">
               <FileUpload 
                label="SYNC_SPECTRAL_ASSET"
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
                    <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest italic group-hover:text-zinc-900 dark:text-white transition-colors">Active Link Protocol</span>
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
                    <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest italic group-hover:text-zinc-900 dark:text-white transition-colors">Neural Animation Signal</span>
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
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-tighter italic leading-none mb-1.5">Catalog Logic</h3>
                  <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.3em] italic">Structural Classification</p>
               </div>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic ml-1">Asset Category</label>
                <div className="relative group/sel">
                  <select 
                    value={formData.type} 
                    onChange={e => setFormData(p => ({ ...p, type: e.target.value as any }))} 
                    className="w-full h-14 px-6 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-2xl text-zinc-900 dark:text-white text-[10px] font-bold tracking-[0.2em] uppercase focus:outline-none focus:border-indigo-500/30 appearance-none shadow-inner transition-all italic cursor-pointer"
                  >
                    {GIFT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-900 pointer-events-none group-focus-within/sel:rotate-180 duration-500 transition-all group-focus-within/sel:text-indigo-500" />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic ml-1">Rarity Classification</label>
                <div className="relative group/sel">
                  <select 
                    value={formData.rarity} 
                    onChange={e => setFormData(p => ({ ...p, rarity: e.target.value as any }))} 
                    className="w-full h-14 px-6 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-2xl text-zinc-900 dark:text-white text-[10px] font-bold tracking-[0.2em] uppercase focus:outline-none focus:border-indigo-500/30 appearance-none shadow-inner transition-all italic cursor-pointer"
                  >
                    {GIFT_RARITIES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                  <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-900 pointer-events-none group-focus-within/sel:rotate-180 duration-500 transition-all group-focus-within/sel:text-indigo-500" />
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
