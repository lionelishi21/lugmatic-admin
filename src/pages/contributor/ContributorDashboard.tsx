import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Music, 
  Wallet, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Loader2,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { userService } from '../../services/userService';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export default function ContributorDashboard() {
  const { user, refreshUser } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const [acceptingTerms, setAcceptingTerms] = useState(false);

  useEffect(() => {
    if (user && !user.termsAccepted) {
      setShowTerms(true);
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, songsRes] = await Promise.all([
        userService.getContributorStats(),
        userService.getContributorSongs()
      ]);
      setStats(statsRes.data);
      setSongs(songsRes.data);
    } catch (error) {
      console.error('Failed to fetch contributor data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTerms = async () => {
    try {
      setAcceptingTerms(true);
      await userService.acceptContributorTerms('1.0');
      if (refreshUser) await refreshUser();
      setShowTerms(false);
      toast.success('Terms accepted successfully');
    } catch (error) {
      toast.error('Failed to accept terms');
    } finally {
      setAcceptingTerms(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-green-500 animate-spin mb-4" />
        <p className="text-gray-500 text-sm font-medium">Loading your contributor dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Contributor Dashboard</h1>
          <p className="text-gray-500 mt-1">Monitor your contributions, revenue, and rights.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-green-50 border border-green-100 rounded-xl flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Verified Contributor</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Contributions" 
          value={stats?.totalTracks || 0} 
          icon={<Music className="h-5 w-5 text-blue-500" />}
          description="Songs with your credits"
        />
        <StatCard 
          title="Estimated Streams" 
          value={stats?.totalStreams?.toLocaleString() || 0} 
          icon={<TrendingUp className="h-5 w-5 text-purple-500" />}
          description="Pro-rated by your share"
        />
        <StatCard 
          title="Active Revenue" 
          value={`$${stats?.totalEarnings?.toFixed(2) || '0.00'}`} 
          icon={<Wallet className="h-5 w-5 text-green-500" />}
          description="Accumulated earnings"
        />
        <StatCard 
          title="Revenue Share" 
          value={`${songs.length > 0 ? (songs.reduce((acc, s) => {
            const myShare = s.splitSheet?.find((e: any) => e.user === user?._id || e.email === user?.email);
            return acc + (myShare?.share || 0);
          }, 0) / songs.length).toFixed(1) : 0}%`}
          icon={<BarChart3 className="h-5 w-5 text-orange-500" />}
          description="Average share per song"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Songs List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Music className="h-5 w-5 text-gray-400" />
              Your Contributions
            </h3>
            <span className="text-xs font-medium text-gray-500">{songs.length} Tracks Found</span>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {songs.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {songs.map((song) => {
                  const myShare = song.splitSheet?.find((e: any) => e.user === user?._id || e.email === user?.email);
                  return (
                    <div key={song._id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {song.coverArt ? (
                          <img src={song.coverArt} alt={song.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music className="h-6 w-6 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 truncate">{song.name}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">by {song.artist?.name || 'Unknown Artist'}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                           <span className="text-xs font-bold text-gray-900">{myShare?.share || 0}%</span>
                           <span className="text-[10px] font-medium text-gray-400 uppercase tracking-tighter">Share</span>
                        </div>
                        <p className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-1 inline-block capitalize">
                          {myShare?.role || 'Contributor'}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300 ml-2" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Music className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500">You haven't been added to any split sheets yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Banking Info Quick View */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center justify-between">
              Payout Method
              <Wallet className="h-4 w-4 text-gray-400" />
            </h3>
            {user?.payoutInfo?.method ? (
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 capitalize">{user.payoutInfo.method.replace('_', ' ')}</p>
                    <p className="text-[10px] text-gray-500">Active and ready for payouts</p>
                  </div>
                </div>
                <button 
                  onClick={() => window.location.href = '/contributor/settings'}
                  className="w-full py-2 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors border border-dashed border-gray-200"
                >
                  Manage Payout Details
                </button>
              </div>
            ) : (
              <div className="text-center p-4">
                <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <p className="text-xs text-gray-500 mb-4">You haven't added any banking details yet.</p>
                <button 
                   onClick={() => window.location.href = '/contributor/settings'}
                   className="w-full py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors"
                >
                  Add Bank Details
                </button>
              </div>
            )}
          </div>

          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
             <h3 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
               <AlertCircle className="h-4 w-4" />
               Rights Management
             </h3>
             <p className="text-xs text-amber-700 leading-relaxed mb-4">
               As a contributor, you are entitled to revenue distribution based on approved split sheets. Ensure your banking information is up to date to avoid payment delays.
             </p>
             <button className="text-xs font-bold text-amber-900 hover:underline flex items-center gap-1">
               View Rights Policy
               <ChevronRight className="h-3 w-3" />
             </button>
          </div>
        </div>
      </div>

      {/* Terms Modal */}
      <AnimatePresence>
        {showTerms && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Terms and Conditions</h2>
                <p className="text-gray-500 text-sm mb-6">Please review and accept our Contributor Terms and Conditions to access your dashboard and receive payouts.</p>
                
                <div className="max-h-60 overflow-y-auto bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8 text-xs text-gray-600 space-y-4 leading-relaxed scrollbar-hide">
                  <p className="font-bold text-gray-900">1. Revenue Distribution</p>
                  <p>Lugmatic acts as the intermediary for distributing revenue generated from song streams. You will receive payments pro-rated based on the share percentage agreed upon in the split sheet uploaded by the primary artist.</p>
                  
                  <p className="font-bold text-gray-900">2. Payout Eligibility</p>
                  <p>To be eligible for payouts, you must provide valid banking or PayPal information. Payments are processed only after reaching the minimum payout threshold configured in your settings.</p>
                  
                  <p className="font-bold text-gray-900">3. Rights Ownership</p>
                  <p>By accepting these terms, you confirm that you have the right to receive revenue for the contributions credited to you and that such credits do not infringe upon any third-party rights.</p>
                  
                  <p className="font-bold text-gray-900">4. Tax Responsibilities</p>
                  <p>You are solely responsible for reporting and paying any taxes applicable to the revenue you receive through the platform.</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAcceptTerms}
                    disabled={acceptingTerms}
                    className="flex-1 py-3.5 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {acceptingTerms ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Accept and Continue
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ title, value, icon, description }: { title: string; value: string | number; icon: React.ReactNode; description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 bg-gray-50 rounded-xl transition-colors">
          {icon}
        </div>
      </div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-black text-gray-900">{value}</h3>
      </div>
      <p className="text-[10px] text-gray-400 mt-2 font-medium">{description}</p>
    </motion.div>
  );
}
