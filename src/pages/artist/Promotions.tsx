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
  Loader2
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
      case 'active': return 'bg-green-50 text-green-700 border-green-100';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'expired': return 'bg-gray-50 text-gray-500 border-gray-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
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
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-green-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading your promotions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            Promotion Manager
            <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider">
              BETA
            </span>
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Boost your sound and reach thousands of new listeners</p>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-2xl font-bold shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="h-5 w-5" />
          New Promotion
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-8 text-white shadow-xl shadow-green-600/20 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Amplify Your Audience</h2>
            <p className="text-green-50 text-sm leading-relaxed max-w-md">
              Promoted tracks get prioritized in Trending searches, automated Billboard score multipliers, and featured slots on the Home page.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-semibold">
                <TrendingUp className="h-4 w-4 text-green-300" />
                Featured Discovery
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-semibold">
                <BarChart3 className="h-4 w-4 text-green-300" />
                2x Billboard Points
              </div>
            </div>
          </div>
          <div className="hidden md:flex justify-end">
            <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
               <Zap className="h-24 w-24 text-green-100 drop-shadow-lg animate-pulse" />
            </div>
          </div>
        </div>
        
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Promotions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Your Campaigns</h3>
          <div className="flex items-center gap-3">
             <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Filter campaigns..."
                  className="pl-9 pr-4 py-1.5 bg-white border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-green-500/10 focus:outline-none w-48"
                />
             </div>
             <button className="p-1.5 rounded-lg border border-gray-100 bg-white text-gray-500 hover:text-gray-700">
               <Filter className="h-4 w-4" />
             </button>
          </div>
        </div>

        {promotions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-gray-300" />
            </div>
            <h4 className="text-gray-900 font-bold mb-2 text-lg">No active promotions</h4>
            <p className="text-gray-500 text-sm max-w-xs mx-auto mb-8 font-medium">
              Ready to grow? Create your first campaign to boost your reach and climb the charts.
            </p>
            <button 
              onClick={() => setShowWizard(true)}
              className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all"
            >
              Start Promoting
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {promotions.map((promo) => (
              <motion.div
                key={promo._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all flex flex-col md:flex-row items-center gap-6"
              >
                {/* Song Cover */}
                <div className="w-16 h-16 rounded-xl overflow-hidden shadow-md flex-shrink-0">
                  <img 
                    src={promo.song?.coverArt || 'https://via.placeholder.com/150'} 
                    alt={promo.song?.name} 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 text-center md:text-left">
                  <h4 className="font-bold text-gray-900 truncate">{promo.song?.name}</h4>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-1">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                      {getPackageIcon(promo.packageType)}
                      {promo.packageType.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium font-mono">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex-shrink-0">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusStyle(promo.status)}`}>
                    {promo.status}
                  </span>
                </div>

                {/* ROI / Stats (Placeholder for now) */}
                <div className="hidden lg:flex flex-col items-end pr-4 text-right">
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-1">
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                    +{(Math.random() * 50).toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Discovery Boost</p>
                </div>

                <div className="md:pr-2">
                   <button className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                     <ChevronRight className="h-5 w-5" />
                   </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal / Wizard */}
      <AnimatePresence>
        {showWizard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWizard(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden"
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
