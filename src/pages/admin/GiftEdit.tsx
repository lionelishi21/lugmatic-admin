import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import adminGiftService, { GiftResponse, AdminGiftPayload } from '../../services/adminGiftService';
import { getAccessToken, getFullImageUrl } from '../../services/api';
import { toast } from 'react-hot-toast';
import {
  Upload, Calendar, ImageIcon, Coins, DollarSign, Tag,
  Type as TypeIcon, Star, X, CheckCircle2, ShieldCheck,
  Zap, Activity, Loader2, Sparkles, ChevronRight, Gift,
  ArrowLeft
} from 'lucide-react';
import FileUpload from '../../components/ui/FileUpload';
import { updateGift, createGiftJson } from '../../store/slices/giftSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { motion } from 'framer-motion';

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
  { value: 'coin', label: 'COIN' },
  { value: 'badge', label: 'BADGE' },
  { value: 'sticker', label: 'STICKER' },
  { value: 'special', label: 'SPECIAL' },
];

const GIFT_RARITIES: Array<{ value: AdminGiftPayload['rarity']; label: string }> = [
  { value: 'common', label: 'COMMON' },
  { value: 'rare', label: 'RARE' },
  { value: 'epic', label: 'EPIC' },
  { value: 'legendary', label: 'LEGENDARY' },
];

const GIFT_CATEGORIES: string[] = ['support', 'music', 'celebration', 'love', 'funny', 'custom'];

const CLASH_ACTIONS: Array<{ value: AdminGiftPayload['clashAction']; label: string }> = [
  { value: 'none', label: 'NONE' },
  { value: 'mute_opponent', label: 'MUTE OPPONENT' },
  { value: 'flame_overlay', label: 'FLAME OVERLAY' },
  { value: 'sound_effect', label: 'SOUND EFFECT' },
  { value: 'noise', label: 'NOISE (VUVUZELA)' },
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
        toast.error('Asset not found');
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
    toast('Icon protocol queued', { icon: '📎' });
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
        toast.success('Asset registry updated', { id: loadingId });
      } else {
        const result = await dispatch(createGiftJson(giftPayload));
        if (createGiftJson.rejected.match(result)) throw new Error(result.payload as string);
        toast.success('Asset deployed to economy', { id: loadingId });
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
          <Loader2 size={40} className="animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Accessing Secure Registry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/admin/gift-management')} className="p-3 rounded-2xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all border border-white/5">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{id ? 'Edit Digital Asset' : 'New Asset Registration'}</h1>
            <p className="text-zinc-500 uppercase text-[10px] tracking-[0.2em] font-bold">Protocol Identifier: {id || 'PENDING_REGISTRATION'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/gift-management')} className="btn-secondary !px-8">Abort</button>
          <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex items-center gap-3 !px-10 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
            {id ? 'Synchronize' : 'Register Asset'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Main Configuration */}
        <div className="xl:col-span-2 space-y-10">
          <div className="premium-card space-y-10">
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2">
                <ShieldCheck size={14} /> Core Identity
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Asset Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className="input-field" placeholder="e.g. Emerald Crown" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Market Classification</label>
                  <div className="relative">
                    <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} className="input-field appearance-none">
                      {GIFT_CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                    </select>
                    <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-zinc-600 pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Registry Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} className="input-field h-32 resize-none" placeholder="Provide detailed contextual information for the virtual asset..." />
              </div>
            </div>

            <div className="space-y-6 pt-10 border-t border-white/5">
              <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2">
                <DollarSign size={14} /> Economic Intelligence
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Fiat Valuation (USD)</label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input type="number" step="0.01" value={formData.value || ''} onChange={(e) => setFormData(p => ({ ...p, value: parseFloat(e.target.value) || 0 }))} className="input-field pl-12" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Virtual Coin Equivalent</label>
                  <div className="relative">
                    <Coins size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input type="number" value={formData.coinCost || ''} onChange={(e) => setFormData(p => ({ ...p, coinCost: parseInt(e.target.value) || 0 }))} className="input-field pl-12" required />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="premium-card space-y-8">
              <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2">
                <Zap size={14} className="text-amber-500" /> Battle Engagement
              </h4>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Clash Battle Points</label>
                  <input type="number" value={formData.clashPoints || ''} onChange={(e) => setFormData(p => ({ ...p, clashPoints: parseInt(e.target.value) || 0 }))} className="input-field" placeholder="Intensity modifier..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Live Tactical Action</label>
                  <div className="relative">
                    <select value={formData.clashAction} onChange={e => setFormData(p => ({ ...p, clashAction: e.target.value as any }))} className="input-field appearance-none">
                      {CLASH_ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                    </select>
                    <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-zinc-600 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="premium-card space-y-8">
              <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2">
                <Calendar size={14} className="text-rose-500" /> Availability Matrix
              </h4>
              <div className="space-y-6">
                <label className="flex items-center gap-4 group cursor-pointer p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-rose-500/30 transition-all">
                  <div className={`w-10 h-5 rounded-full relative transition-all ${formData.isSeasonal ? 'bg-rose-500' : 'bg-zinc-800'}`}>
                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${formData.isSeasonal ? 'right-1' : 'left-1'}`} />
                  </div>
                  <input type="checkbox" className="hidden" checked={formData.isSeasonal} onChange={e => setFormData(p => ({ ...p, isSeasonal: e.target.checked }))} />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Seasonal Deployment</span>
                </label>
                
                {formData.isSeasonal && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Start Date</label>
                      <input type="date" value={formData.seasonalStart} onChange={e => setFormData(p => ({ ...p, seasonalStart: e.target.value }))} className="input-field" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">End Date</label>
                      <input type="date" value={formData.seasonalEnd} onChange={e => setFormData(p => ({ ...p, seasonalEnd: e.target.value }))} className="input-field" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Configuration */}
        <div className="space-y-10">
          <div className="premium-card space-y-8">
            <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2">
              <ImageIcon size={14} /> Asset Visual
            </h4>
            <FileUpload 
              label="Sync Asset Icon"
              currentFile={pendingIconFile ? URL.createObjectURL(pendingIconFile) : (formData.image ? getFullImageUrl(formData.image) : undefined)}
              onFileSelect={handleIconSelect}
              onFileRemove={() => { setPendingIconFile(null); setFormData(p => ({ ...p, image: '' })); }}
            />
            <div className="pt-4 space-y-4">
              <label className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group cursor-pointer hover:border-emerald-500/30 transition-all">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Active Status</span>
                <div className={`w-10 h-5 rounded-full relative transition-all ${formData.isActive ? 'bg-emerald-500' : 'bg-zinc-800'}`}>
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${formData.isActive ? 'right-1 shadow-[0_0_8px_white]' : 'left-1'}`} />
                </div>
                <input type="checkbox" className="hidden" checked={formData.isActive} onChange={e => setFormData(p => ({ ...p, isActive: e.target.checked }))} />
              </label>
              <label className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group cursor-pointer hover:border-emerald-500/30 transition-all">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Animation Signal</span>
                <div className={`w-10 h-5 rounded-full relative transition-all ${formData.isAnimated ? 'bg-emerald-500' : 'bg-zinc-800'}`}>
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${formData.isAnimated ? 'right-1 shadow-[0_0_8px_white]' : 'left-1'}`} />
                </div>
                <input type="checkbox" className="hidden" checked={formData.isAnimated} onChange={e => setFormData(p => ({ ...p, isAnimated: e.target.checked }))} />
              </label>
            </div>
          </div>

          <div className="premium-card space-y-8">
            <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2">
              <Tag size={14} /> Catalog Metrics
            </h4>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Asset Category</label>
                <div className="relative">
                  <select value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value as any }))} className="input-field appearance-none">
                    {GIFT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-zinc-600 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Rarity Classification</label>
                <div className="relative">
                  <select value={formData.rarity} onChange={e => setFormData(p => ({ ...p, rarity: e.target.value as any }))} className="input-field appearance-none">
                    {GIFT_RARITIES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                  <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-zinc-600 pointer-events-none" />
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
