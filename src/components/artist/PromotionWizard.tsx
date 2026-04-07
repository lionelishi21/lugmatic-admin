import React, { useState, useEffect } from 'react';
import { 
  Music, 
  ChevronRight, 
  ChevronLeft, 
  Zap, 
  TrendingUp, 
  Star, 
  CreditCard,
  CheckCircle2,
  Loader2,
  Info,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import artistService from '../../services/artistService';
import promotionService from '../../services/promotionService';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface PromotionWizardProps {
  onClose: () => void;
}

const PACKAGES = [
  {
    id: 'trending_boost',
    name: 'Trending Boost',
    price: '$19.99',
    duration: '7 Days',
    desc: 'Priority placement in Trending discovery and global searches.',
    icon: <TrendingUp className="h-5 w-5" />,
    color: 'green'
  },
  {
    id: 'billboard_boost',
    name: 'Billboard Boost',
    price: '$49.99',
    duration: '14 Days',
    desc: '2x Billboard point multiplier and permanent chart history icon.',
    icon: <Star className="h-5 w-5" />,
    color: 'amber'
  },
  {
    id: 'pro_spotlight',
    name: 'Pro Spotlight',
    price: '$99.99',
    duration: '3 Days',
    desc: 'Maximum exposure with a front-page hero section feature.',
    icon: <Zap className="h-5 w-5" />,
    color: 'emerald'
  }
];

const PromotionWizard: React.FC<PromotionWizardProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [songs, setSongs] = useState<any[]>([]);
  const [selectedSong, setSelectedSong] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    if (!user?.artistId) return;
    setIsLoading(true);
    try {
      const data = await artistService.getArtistSongs(String(user.artistId));
      // Filter for approved songs only
      setSongs(data.filter((s: any) => s.status === 'approved'));
    } catch (error) {
      toast.error('Failed to load your songs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const startCheckout = async () => {
    if (!selectedSong || !selectedPackage) return;
    
    setIsRedirecting(true);
    try {
      const data: any = await promotionService.createPromotionSession(selectedSong, selectedPackage);
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to start payment session');
      setIsRedirecting(false);
    }
  };

  const currentSong = songs.find(s => s._id === selectedSong);
  const currentPkg = PACKAGES.find(p => p.id === selectedPackage);

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Promote Your Music</h2>
          <div className="flex items-center gap-1.5 mt-1">
             {[1, 2, 3].map(i => (
               <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${step >= i ? 'w-6 bg-green-500' : 'w-2 bg-gray-200'}`} 
               />
             ))}
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
          <X className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-bold text-gray-900">Select a Track</h3>
                <p className="text-sm text-gray-500 font-medium">Which song would you like to boost?</p>
              </div>

              {isLoading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
                </div>
              ) : songs.length === 0 ? (
                <div className="text-center py-8">
                  <Music className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No approved songs found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {songs.map(song => (
                    <button
                      key={song._id}
                      onClick={() => setSelectedSong(song._id)}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                        selectedSong === song._id 
                          ? 'border-green-500 bg-green-50/50' 
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <img src={song.coverArt} className="w-12 h-12 rounded-lg object-cover shadow-sm" alt="" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{song.name}</p>
                        <p className="text-xs text-gray-500 font-medium">{song.playCount || 0} plays</p>
                      </div>
                      {selectedSong === song._id && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-bold text-gray-900">Choose a Package</h3>
                <p className="text-sm text-gray-500 font-medium">Select the level of exposure you want</p>
              </div>

              <div className="space-y-4">
                {PACKAGES.map(pkg => (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`relative w-full p-5 rounded-3xl border-2 transition-all text-left overflow-hidden ${
                      selectedPackage === pkg.id 
                        ? 'border-green-500 bg-green-50/50' 
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl bg-${pkg.color}-100 text-${pkg.color}-600`}>
                          {pkg.icon}
                        </div>
                        <h4 className="font-bold text-gray-900">{pkg.name}</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-gray-900">{pkg.price}</p>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">/ {pkg.duration}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed mr-8">
                      {pkg.desc}
                    </p>
                    {selectedPackage === pkg.id && (
                      <div className="absolute top-4 right-4 text-green-500">
                        <CheckCircle2 className="h-5 w-5 fill-green-50" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center py-4">
                 <div className="w-20 h-20 bg-green-100 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-10 w-10 text-green-600" />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-900">Almost There!</h3>
                 <p className="text-gray-500 font-medium">Ready to boost your sound?</p>
              </div>

              <div className="bg-gray-50 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">Track</span>
                  <span className="text-gray-900 font-bold text-sm">{currentSong?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">Package</span>
                  <span className="text-gray-900 font-bold text-sm">{currentPkg?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">Duration</span>
                  <span className="text-gray-900 font-bold text-sm">{currentPkg?.duration}</span>
                </div>
                <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-gray-900 font-bold">Total</span>
                  <span className="text-2xl font-black text-green-600">{currentPkg?.price}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                 <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                 <p className="text-xs text-amber-700 leading-relaxed font-medium">
                   You will be redirected to Stripe to securely complete your payment. Once confirmed, your boost will activate instantly.
                 </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer / Nav */}
      <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-4">
        {step > 1 ? (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-3 text-gray-500 font-bold hover:text-gray-900"
          >
            <ChevronLeft className="h-5 w-5" />
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            onClick={handleNext}
            disabled={step === 1 ? !selectedSong : !selectedPackage}
            className="flex items-center gap-2 px-8 py-3 bg-gray-950 text-white rounded-2xl font-bold hover:bg-black transition-all disabled:opacity-30"
          >
            Next Step
            <ChevronRight className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={startCheckout}
            disabled={isRedirecting}
            className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-green-600 text-white rounded-2xl font-black hover:bg-green-700 shadow-xl shadow-green-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isRedirecting ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <CreditCard className="h-6 w-6" />
                Pay & Boost Song
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default PromotionWizard;
