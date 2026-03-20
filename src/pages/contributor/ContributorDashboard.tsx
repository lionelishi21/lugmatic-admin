import React, { useEffect, useState } from 'react';
import { userService } from '../../services/userService';
import { 
  BarChart3, 
  Music, 
  DollarSign, 
  CreditCard, 
  Clock, 
  ExternalLink,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ContributorStats {
  totalSongs: number;
  totalEarnings: number;
  pendingPayout: number;
  acceptedTerms: boolean;
}

interface ContributedSong {
  _id: string;
  title: string;
  artists: string[];
  coverImage: string;
  duration: number;
}

const ContributorDashboard: React.FC = () => {
  const [stats, setStats] = useState<ContributorStats | null>(null);
  const [songs, setSongs] = useState<ContributedSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await userService.getContributorDashboard();
      const { success, data } = response.data as any;
      if (success) {
        setStats(data.stats);
        setSongs(data.songs);
        if (!data.stats.acceptedTerms) {
          setShowTermsModal(true);
        }
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTerms = async () => {
    try {
      const response = await userService.acceptContributorTerms('1.0');
      if (response.data.success) {
        toast.success('Terms accepted successfully');
        setShowTermsModal(false);
        setStats(prev => prev ? { ...prev, acceptedTerms: true } : null);
      }
    } catch (error) {
      toast.error('Failed to accept terms');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Contributor Dashboard</h1>
          <p className="text-gray-400 mt-1">Monitor your contributions and track your earnings.</p>
        </div>
        <button 
          onClick={() => window.location.href = '/contributor/payouts'}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all active:scale-95"
        >
          <CreditCard className="w-4 h-4" />
          Payout Settings
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm group hover:border-purple-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-gray-400 text-sm font-medium">Total Balance</p>
          <h3 className="text-3xl font-bold text-white mt-1">L$ {stats?.totalEarnings.toLocaleString()}</h3>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm group hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
              <Music className="w-6 h-6" />
            </div>
          </div>
          <p className="text-gray-400 text-sm font-medium">Tracks Contributed</p>
          <h3 className="text-3xl font-bold text-white mt-1">{stats?.totalSongs}</h3>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm group hover:border-orange-500/50 transition-all text-gray-400 italic">
           <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-gray-400 text-sm font-medium">Monthly Insight</p>
          <h3 className="text-3xl font-bold text-white mt-1">Coming Soon</h3>
        </div>
      </div>

      {/* Songs Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Your Contributions</h2>
          <span className="text-sm text-gray-400 bg-white/5 px-3 py-1 rounded-full">{songs.length} Tracks</span>
        </div>
        
        {songs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-sm border-b border-white/5">
                  <th className="px-6 py-4 font-medium">Track</th>
                  <th className="px-6 py-4 font-medium">Duration</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {songs.map((song) => (
                  <tr key={song._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={song.coverImage || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-lg object-cover" alt="" />
                        <div>
                          <p className="text-white font-medium group-hover:text-purple-400 transition-colors">{song.title}</p>
                          <p className="text-xs text-gray-500">{Array.isArray(song.artists) ? song.artists.join(', ') : 'Various Artists'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium bg-emerald-400/10 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="p-4 bg-white/5 rounded-full w-fit mx-auto mb-4">
              <Music className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-gray-400">No tracks found. When artists credit you in splits, they will appear here.</p>
          </div>
        )}
      </div>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#121212] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 p-8 border-b border-white/10 text-center">
              <div className="p-4 bg-purple-500/20 rounded-full w-fit mx-auto mb-4 text-purple-400 ring-8 ring-purple-500/5">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Review Contributor Terms</h2>
              <p className="text-gray-400 text-sm">To start receiving payouts, please accept our contributor terms.</p>
            </div>
            
            <div className="p-8 space-y-4 max-h-[40vh] overflow-y-auto custom-scrollbar text-sm text-gray-300 leading-relaxed">
              <p>1. <strong>Split Payments</strong>: You agree to receive payments based on the percentages defined by the track uploader.</p>
              <p>2. <strong>Verification</strong>: Standard identity verification may be required for large payouts.</p>
              <p>3. <strong>Content Rights</strong>: By accepting these terms, you confirm that your contribution does not infringe on any third-party intellectual property.</p>
              <p>4. <strong>Fees</strong>: Any applicable processing fees (e.g., Stripe, PayPal, Currency conversion) will be deducted from the gross payout.</p>
            </div>

            <div className="p-6 bg-white/5 flex flex-col gap-3">
              <button 
                onClick={handleAcceptTerms}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
              >
                I Agree & Accept Terms
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContributorDashboard;
