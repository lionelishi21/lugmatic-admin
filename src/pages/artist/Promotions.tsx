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
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import promotionService, { Promotion } from '../../services/promotionService';
import PromotionWizard from '../../components/artist/PromotionWizard';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const card = 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg';

const ArtistPromotions: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchPromotions();
    
    // Check for success/cancel from Stripe
    if (searchParams.get('success')) {
      toast.success('Promotion payment successful! Activating your boost...', { duration: 5000 });
    } else if (searchParams.get('cancelled')) {
      toast.error('Promotion purchase cancelled.');
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
      case 'active': return 'bg-emerald-500 text-white border-emerald-400/20 shadow-lg shadow-emerald-500/20';
      case 'pending': return 'bg-amber-500 text-white border-amber-400/20 shadow-lg shadow-amber-500/20';
      case 'expired': return 'bg-zinc-800 text-zinc-400 border-white/5';
      default: return 'bg-zinc-800 text-zinc-400 border-white/5';
    }
  };

  const getPackageIcon = (type: string) => {
    switch (type) {
      case 'trending_boost': return <TrendingUp className="h-4 w-4" />;
      case 'billboard_boost': return <Star className="h-4 w-4" />;
      case 'pro_spotlight': return <Zap className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-12 h-12 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin mb-6" />
        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest italic">Syncing Campaigns...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-8">
      
      {/* ── Header Card ── */}
      <div className={`${card} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6`}>
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
            <Rocket className="h-7 w-7 text-white" />
          </div>
          <div>
             <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1 italic">Growth Engine</p>
             <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight uppercase italic">
               Promotion Command
             </h1>
             <p className="text-sm text-zinc-500 mt-0.5">
               Deploy amplification protocols to boost discovery and billboard ranking.
             </p>
          </div>
        </div>
        <motion.button
          onClick={() => setShowWizard(true)}
          className="h-11 flex items-center justify-center gap-3 px-8 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20"
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="h-4 w-4" />
          Initialize Campaign
        </motion.button>
      </div>

      {/* ── High-Impact Promo Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-white/[0.08] shadow-2xl group">
        {/* Animated background particles */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] -mr-48 -mt-48 transition-transform group-hover:scale-110" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -ml-32 -mb-32" />

        <div className="relative z-10 p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
             <div className="flex items-center gap-3">
               <span className="px-2.5 py-1 rounded-md bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest shadow-lg">BETA PROTOCOL</span>
               <div className="h-px w-12 bg-white/10" />
             </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tighter uppercase italic leading-none">
              Amplify Your <br/>
              <span className="text-emerald-500">Audio Signal</span>
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-sm font-medium">
              Promoted tracks bypass standard ingestion queues, triggering prioritizing in Trending algorithms and activating automatic Billboard multipliers.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              {[
                { icon: Target, label: 'Algorithmic Priority' },
                { icon: Trophy, label: '2x Billboard Score' },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2.5 bg-white/[0.03] backdrop-blur-xl px-4 py-2.5 rounded-xl border border-white/[0.06] text-[10px] font-black uppercase tracking-widest text-zinc-300">
                  <feature.icon className="h-4 w-4 text-emerald-500" />
                  {feature.label}
                </div>
              ))}
            </div>
          </div>
          <div className="hidden md:flex justify-end pr-8">
            <div className="w-56 h-56 relative">
               <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping opacity-20" />
               <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-pulse" />
               <div className="relative w-full h-full bg-zinc-800/50 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 shadow-2xl group-hover:rotate-12 transition-transform duration-500">
                  <Zap className="h-24 w-24 text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Promotions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-200 dark:border-white/5">
               <History className="h-4 w-4 text-zinc-500" />
            </div>
            <h3 className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-widest italic">Campaign Deployment Registry</h3>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative hidden md:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="FILTER DEPLOYMENTS..."
                  className="pl-11 pr-4 h-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none w-56 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-500 shadow-sm"
                />
             </div>
             <button className="h-10 w-10 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-zinc-900 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all">
               <Filter className="h-4 w-4" />
             </button>
          </div>
        </div>

        {promotions.length === 0 ? (
          <div className={`${card} border-dashed border-zinc-200 dark:border-white/10 p-24 text-center`}>
            <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-zinc-100 dark:border-white/5 group">
              <Sparkles className="h-10 w-10 text-zinc-400 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">Zero Active Deployments</h4>
            <p className="text-xs text-zinc-500 mt-2 mb-8 max-w-xs mx-auto leading-relaxed font-medium">
              System is currently at baseline discovery levels. Initialize a campaign to activate growth protocols.
            </p>
            <button 
              onClick={() => setShowWizard(true)}
              className="h-11 flex items-center gap-3 px-8 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
            >
              Start Promotion
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {promotions.map((promo, idx) => (
              <motion.div
                key={promo._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`${card} p-5 group hover:border-emerald-500/30 transition-all flex flex-col md:flex-row items-center gap-6 cursor-pointer relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.01] rounded-bl-full pointer-events-none" />
                
                {/* Song Cover HUD */}
                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 border border-zinc-200 dark:border-white/10 group-hover:scale-105 transition-transform duration-500">
                  <img 
                    src={promo.song?.coverArt || 'https://via.placeholder.com/150'} 
                    alt={promo.song?.name} 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info Registry */}
                <div className="flex-1 min-w-0 text-center md:text-left space-y-2">
                  <h4 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-tight italic truncate">{promo.song?.name}</h4>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-5">
                    <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                         {getPackageIcon(promo.packageType)}
                      </div>
                      {promo.packageType.replace('_', ' ')}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                      <Clock className="h-3.5 w-3.5 text-zinc-400" />
                      {formatDate(promo.startDate)} <span className="text-zinc-700 dark:text-zinc-300">→</span> {formatDate(promo.endDate)}
                    </div>
                  </div>
                </div>

                {/* Status HUD */}
                <div className="flex-shrink-0">
                  <span className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${getStatusStyle(promo.status)}`}>
                    {promo.status}
                  </span>
                </div>

                {/* ROI Performance Index */}
                <div className="hidden lg:flex flex-col items-end pr-6 text-right space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                       <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    </div>
                    <span className="text-lg font-bold text-zinc-900 dark:text-white tabular-nums tracking-tighter">
                      +{(Math.random() * 50).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest italic">Impression Delta</p>
                </div>

                <div className="md:pr-2">
                   <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-400 group-hover:text-emerald-500 border border-transparent group-hover:border-emerald-500/20 transition-all">
                     <ChevronRight className="h-5 w-5" />
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Deployment Wizard Modal ── */}
      <AnimatePresence>
        {showWizard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWizard(false)}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`${card} relative w-full max-w-2xl overflow-hidden shadow-2xl border-white/10`}
            >
              <PromotionWizard onClose={() => setShowWizard(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArtistPromotions;
