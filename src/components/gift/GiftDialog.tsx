import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminGiftService, { GiftResponse, AdminGiftPayload } from '../../services/adminGiftService';
import { getAccessToken, getFullImageUrl } from '../../services/api';
import { toast } from 'react-hot-toast';
import {
  Upload, Calendar, ImageIcon, Coins, DollarSign, Tag,
  Type as TypeIcon, Star, X, CheckCircle2, ShieldCheck,
  Zap, Activity, Loader2, Sparkles, ChevronRight, Gift
} from 'lucide-react';
import FileUpload from '../ui/FileUpload';
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

interface GiftDialogProps {
  open: boolean;
  onClose: () => void;
  editingGift?: GiftResponse | null;
  onSuccess?: () => void;
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

const GiftDialog: React.FC<GiftDialogProps> = ({ open, onClose, editingGift, onSuccess }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<GiftFormData>(INITIAL_FORM_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [pendingIconFile, setPendingIconFile] = useState<File | null>(null);

  useEffect(() => {
    if (open) {
      if (editingGift) {
        setFormData({
          name: editingGift.name,
          description: editingGift.description || '',
          value: editingGift.value,
          coinCost: editingGift.coinCost,
          type: editingGift.type,
          rarity: editingGift.rarity,
          category: editingGift.category,
          image: editingGift.image,
          isActive: editingGift.isActive,
          isAnimated: editingGift.isAnimated ?? false,
          isSeasonal: editingGift.isSeasonal,
          seasonalStart: editingGift.seasonalStart ? editingGift.seasonalStart.split('T')[0] : '',
          seasonalEnd: editingGift.seasonalEnd ? editingGift.seasonalEnd.split('T')[0] : '',
          clashPoints: editingGift.clashPoints || 0,
          clashAction: editingGift.clashAction || 'none',
        });
      } else {
        setFormData(INITIAL_FORM_DATA);
      }
      setPendingIconFile(null);
    }
  }, [open, editingGift]);

  const handleIconSelect = (file: File) => {
    setPendingIconFile(file);
    toast('Icon protocol queued', { icon: '📎' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const loadingId = toast.loading(editingGift ? 'Synchronizing asset registry...' : 'Registering new digital asset...');

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

      if (editingGift) {
        const result = await dispatch(updateGift({ id: editingGift._id, data: giftPayload }));
        if (updateGift.rejected.match(result)) throw new Error(result.payload as string);
        toast.success('Asset registry updated', { id: loadingId });
      } else {
        const result = await dispatch(createGiftJson(giftPayload));
        if (createGiftJson.rejected.match(result)) throw new Error(result.payload as string);
        toast.success('Asset deployed to economy', { id: loadingId });
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Transmission failure', { id: loadingId });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" onClick={() => !submitting && onClose()}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="premium-card w-full max-w-4xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}
      >
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <Gift className="text-emerald-500" size={24} />
              {editingGift ? 'Modify Digital Asset' : 'Register New Gift'}
            </h3>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">Configure virtual economy parameters and visual signals.</p>
          </div>
          <button onClick={() => !submitting && onClose()} className="p-2.5 rounded-full hover:bg-white/5 text-zinc-600 hover:text-white transition-all"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left Column: Identity & Economics */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2">
                  <ShieldCheck size={14} /> Identity Registry
                </h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Asset Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className="input-field" placeholder="e.g. Emerald Crown" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Protocol Description</label>
                    <textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} className="input-field h-24 resize-none" placeholder="Contextual data for the user..." />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2">
                  <DollarSign size={14} /> Economic Parameters
                </h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Fiat Value (USD)</label>
                    <div className="relative">
                      <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                      <input type="number" step="0.01" value={formData.value || ''} onChange={(e) => setFormData(p => ({ ...p, value: parseFloat(e.target.value) || 0 }))} className="input-field pl-12" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Coin Cost (Virtual)</label>
                    <div className="relative">
                      <Coins size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                      <input type="number" value={formData.coinCost || ''} onChange={(e) => setFormData(p => ({ ...p, coinCost: parseInt(e.target.value) || 0 }))} className="input-field pl-12" required />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4">
                <label className="flex items-center gap-3 group cursor-pointer">
                  <div className={`w-10 h-5 rounded-full relative transition-all ${formData.isActive ? 'bg-emerald-500' : 'bg-zinc-800'}`}>
                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${formData.isActive ? 'right-1 shadow-[0_0_8px_white]' : 'left-1'}`} />
                  </div>
                  <input type="checkbox" className="hidden" checked={formData.isActive} onChange={e => setFormData(p => ({ ...p, isActive: e.target.checked }))} />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Active Signal</span>
                </label>
                <label className="flex items-center gap-3 group cursor-pointer">
                  <div className={`w-10 h-5 rounded-full relative transition-all ${formData.isAnimated ? 'bg-emerald-500' : 'bg-zinc-800'}`}>
                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${formData.isAnimated ? 'right-1 shadow-[0_0_8px_white]' : 'left-1'}`} />
                  </div>
                  <input type="checkbox" className="hidden" checked={formData.isAnimated} onChange={e => setFormData(p => ({ ...p, isAnimated: e.target.checked }))} />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Animated Asset</span>
                </label>
              </div>
            </div>

            {/* Right Column: Visuals & Rarity */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2">
                  <ImageIcon size={14} /> Visual Signature
                </h4>
                <FileUpload 
                  label="Drop asset icon here"
                  currentFile={pendingIconFile ? URL.createObjectURL(pendingIconFile) : (formData.image ? getFullImageUrl(formData.image) : undefined)}
                  onFileSelect={handleIconSelect}
                  onFileRemove={() => { setPendingIconFile(null); setFormData(p => ({ ...p, image: '' })); }}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Asset Classification</label>
                  <div className="relative">
                    <select value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value as any }))} className="input-field appearance-none">
                      {GIFT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-zinc-600 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Rarity Index</label>
                  <div className="relative">
                    <select value={formData.rarity} onChange={e => setFormData(p => ({ ...p, rarity: e.target.value as any }))} className="input-field appearance-none">
                      {GIFT_RARITIES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                    <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-zinc-600 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Market Category</label>
                <div className="relative">
                  <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} className="input-field appearance-none">
                    {GIFT_CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                  </select>
                  <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-zinc-600 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Section: Clash & Seasonal */}
          <div className="pt-10 border-t border-white/5 grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2">
                <Zap size={14} className="text-amber-500" /> Clash Battle Intelligence
              </h4>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Battle Bar Shift</label>
                  <input type="number" value={formData.clashPoints || ''} onChange={(e) => setFormData(p => ({ ...p, clashPoints: parseInt(e.target.value) || 0 }))} className="input-field" placeholder="Points" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Tactical Effect</label>
                  <div className="relative">
                    <select value={formData.clashAction} onChange={e => setFormData(p => ({ ...p, clashAction: e.target.value as any }))} className="input-field appearance-none">
                      {CLASH_ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                    </select>
                    <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-zinc-600 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2">
                <Calendar size={14} className="text-rose-500" /> Seasonal Availability
              </h4>
              <div className="space-y-4">
                <label className="flex items-center gap-3 group cursor-pointer">
                  <div className={`w-10 h-5 rounded-full relative transition-all ${formData.isSeasonal ? 'bg-rose-500' : 'bg-zinc-800'}`}>
                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${formData.isSeasonal ? 'right-1 shadow-[0_0_8px_white]' : 'left-1'}`} />
                  </div>
                  <input type="checkbox" className="hidden" checked={formData.isSeasonal} onChange={e => setFormData(p => ({ ...p, isSeasonal: e.target.checked }))} />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Temporal Protocol</span>
                </label>
                
                {formData.isSeasonal && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Deployment</label>
                      <input type="date" value={formData.seasonalStart} onChange={e => setFormData(p => ({ ...p, seasonalStart: e.target.value }))} className="input-field" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Withdrawal</label>
                      <input type="date" value={formData.seasonalEnd} onChange={e => setFormData(p => ({ ...p, seasonalEnd: e.target.value }))} className="input-field" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        <div className="p-8 border-t border-white/5 flex justify-end gap-4 bg-[#0a0a0a]">
          <button type="button" onClick={onClose} disabled={submitting} className="btn-secondary !px-10">Abort</button>
          <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex items-center gap-3 !px-12 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
            {editingGift ? 'Update Protocol' : 'Deploy Asset'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default GiftDialog;