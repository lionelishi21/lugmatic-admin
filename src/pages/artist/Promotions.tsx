import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  TrendingUp, 
  Star, 
  Plus, 
  Clock, 
  ChevronRight, 
  BarChart3, 
  Search,
  Filter,
  Sparkles,
  ArrowUpRight,
  Loader2,
  Rocket,
  Target,
  Trophy,
  History,
  Layout,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import promotionService, { Promotion } from '../../services/promotionService';
import PromotionWizard from '../../components/artist/PromotionWizard';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const ArtistPromotions: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchPromotions();
    if (searchParams.get('success')) {
      toast.success('Promotion activated successfully!');
    } else if (searchParams.get('cancelled')) {
      toast.error('Payment cancelled.');
    }
  }, [searchParams]);

  const fetchPromotions = async () => {
    try {
      const data = await promotionService.getArtistPromotions();
      setPromotions(data as Promotion[]);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'expired': return 'bg-zinc-950 text-zinc-500 border-white/5';
      default: return 'bg-zinc-950 text-zinc-500 border-white/5';
    }
  };

  const getPackageIcon = (type: string) => {
    switch (type) {
      case 'trending_boost': return <TrendingUp size={16} />;
      case 'billboard_boost': return <Star size={16} />;
      case 'pro_spotlight': return <Zap size={16} />;
      default: return <Sparkles size={16} />;
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-24 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-none uppercase">Promotions</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active System</span>
            </div>
          </div>
          <p className="text-zinc-500 font-medium">Amplify your tracks, increase visibility, and boost your billboard ranking.</p>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="h-14 px-8 bg-white text-black rounded-2xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3"
        >
          <Plus size={18} />
          New Promotion
        </button>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-[3rem] bg-zinc-950 border border-white/5 shadow-2xl group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] -mr-64 -mt-64" />
        <div className="relative z-10 p-12 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-6 max-w-xl">
             <div className="flex items-center gap-3">
               <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">Featured Service</span>
             </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-none uppercase">
              Amplify Your <span className="text-emerald-500">Artist Reach</span>
            </h2>
            <p className="text-zinc-500 text-lg font-medium leading-relaxed">
              Our promotion tools prioritize your tracks in discovery algorithms and activate billboard scoring multipliers for maximum impact.
            </p>
            <div className="flex flex-wrap gap-4">
              {[
                { icon: Target, label: 'Algorithm Priority' },
                { icon: Trophy, label: '2x Billboard Score' },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 bg-zinc-900 px-5 py-3 rounded-2xl border border-white/5 text-xs font-bold uppercase tracking-widest text-white">
                  <f.icon size={16} className="text-emerald-500" />
                  {f.label}
                </div>
              ))}
            </div>
          </div>
          <div className="w-64 h-64 relative flex items-center justify-center">
             <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-pulse" />
             <div className="w-48 h-48 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 shadow-2xl">
                <Zap size={64} className="text-emerald-500" />
             </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/5 text-zinc-600">
               <History size={18} />
            </div>
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Promotion History</h3>
          </div>
        </div>

        {promotions.length === 0 ? (
          <div className="premium-card py-32 text-center border-dashed border-white/5 bg-zinc-950/20 rounded-[3rem]">
            <div className="w-20 h-20 bg-zinc-900 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/5">
              <Sparkles className="h-10 w-10 text-zinc-800" />
            </div>
            <h4 className="text-xl font-bold text-white uppercase tracking-tight">No active campaigns</h4>
            <p className="text-sm text-zinc-500 mt-3 mb-8 max-w-sm mx-auto font-medium">Your current reach is at baseline. Start a promotion to see results.</p>
            <button onClick={() => setShowWizard(true)} className="h-14 px-10 bg-zinc-950 text-white border border-white/5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">New Campaign</button>
          </div>
        ) : (
          <div className="space-y-4">
            {promotions.map((promo, idx) => (
              <motion.div
                key={promo._id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                className="premium-card p-6 border-white/5 shadow-xl hover:border-emerald-500/20 transition-all flex flex-col md:flex-row items-center gap-8 rounded-[2rem] bg-zinc-950/20"
              >
                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shrink-0 shadow-2xl">
                  <img src={promo.song?.coverArt || 'https://via.placeholder.com/150'} alt={promo.song?.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0 text-center md:text-left">
                  <h4 className="text-lg font-bold text-white truncate">{promo.song?.name}</h4>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                       <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">{getPackageIcon(promo.packageType)}</div>
                       {promo.packageType.replace('_', ' ')}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      <Clock size={14} className="text-zinc-600" />
                      {formatDate(promo.startDate)} — {formatDate(promo.endDate)}
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${getStatusStyle(promo.status)}`}>
                    {promo.status}
                  </span>
                </div>

                <div className="hidden lg:flex flex-col items-end px-6 text-right">
                   <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-white tabular-nums tracking-tight">+{(Math.random() * 50).toFixed(1)}%</span>
                      <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"><ArrowUpRight size={14} /></div>
                   </div>
                   <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Impression Lift</p>
                </div>

                <div className="shrink-0 p-2">
                   <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-600 group-hover:text-white transition-all"><ChevronRight size={20} /></div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Wizard */}
      <AnimatePresence>
        {showWizard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowWizard(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="premium-card !p-0 w-full max-w-2xl relative z-10 border-white/10 shadow-2xl overflow-hidden rounded-[3rem]">
              <PromotionWizard onClose={() => setShowWizard(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArtistPromotions;
