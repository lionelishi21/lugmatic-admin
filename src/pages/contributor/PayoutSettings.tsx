import React, { useEffect, useState } from 'react';
import { userService } from '../../services/userService';
import { 
  Building2, 
  Mail, 
  ChevronLeft, 
  Save, 
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PayoutInfo {
  method: 'paypal' | 'bank_transfer' | 'stripe';
  paypalEmail?: string;
  bankAccount?: {
    accountNumber: string;
    routingNumber: string;
    accountHolder: string;
    bankName: string;
  };
  stripeAccountId?: string;
}

const PayoutSettings: React.FC = () => {
  const [payoutInfo, setPayoutInfo] = useState<PayoutInfo>({
    method: 'paypal',
    paypalEmail: '',
    bankAccount: {
      accountNumber: '',
      routingNumber: '',
      accountHolder: '',
      bankName: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPayoutInfo();
  }, []);

  const fetchPayoutInfo = async () => {
    try {
      const response = await userService.getContributorDashboard();
      const { success, data } = response.data as any;
      if (success && data.user?.payoutInfo) {
        setPayoutInfo(data.user.payoutInfo);
      }
    } catch (error) {
      toast.error('Failed to load payout settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await userService.updatePayoutInfo(payoutInfo);
      if (response.data.success) {
        toast.success('Payout settings updated');
      }
    } catch (error) {
      toast.error('Failed to update payout settings');
    } finally {
      setSaving(false);
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Payout Settings</h1>
            <p className="text-gray-400 mt-1">Manage how you receive your earnings.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar / Method Selector */}
        <div className="space-y-4">
          <button 
            onClick={() => setPayoutInfo({ ...payoutInfo, method: 'paypal' })}
            className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${
              payoutInfo.method === 'paypal' 
                ? 'bg-purple-500/10 border-purple-500 text-white ring-1 ring-purple-500/50 shadow-lg shadow-purple-500/10' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
            }`}
          >
            <div className={`p-2 rounded-lg ${payoutInfo.method === 'paypal' ? 'bg-purple-500 text-white' : 'bg-white/10'}`}>
              <Mail className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-bold">PayPal</p>
              <p className="text-xs opacity-60">Instant & Global</p>
            </div>
          </button>

          <button 
            onClick={() => setPayoutInfo({ ...payoutInfo, method: 'bank_transfer' })}
            className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${
              payoutInfo.method === 'bank_transfer' 
                ? 'bg-blue-500/10 border-blue-500 text-white ring-1 ring-blue-500/50 shadow-lg shadow-blue-500/10' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
            }`}
          >
            <div className={`p-2 rounded-lg ${payoutInfo.method === 'bank_transfer' ? 'bg-blue-500 text-white' : 'bg-white/10'}`}>
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-bold">Bank Transfer</p>
              <p className="text-xs opacity-60">Direct to account</p>
            </div>
          </button>

          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-400" />
              Payout Info
            </h3>
            <div className="space-y-3 text-xs text-gray-400 leading-relaxed">
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5" />
                Minimum payout threshold: $50
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5" />
                Payments processed every Friday
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5" />
                Secure data encryption enabled
              </p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
              {payoutInfo.method === 'paypal' ? <Mail className="w-32 h-32" /> : <Building2 className="w-32 h-32" />}
            </div>

            {payoutInfo.method === 'paypal' && (
              <div className="space-y-6 relative animate-in fade-in duration-500">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-300 ml-1">PayPal Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                    <input 
                      type="email" 
                      value={payoutInfo.paypalEmail}
                      onChange={(e) => setPayoutInfo({ ...payoutInfo, paypalEmail: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-medium"
                      placeholder="email@example.com"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Ensure this email is linked to a verified PayPal account.</p>
                </div>
              </div>
            )}

            {payoutInfo.method === 'bank_transfer' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative animate-in fade-in duration-500">
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-bold text-gray-300 ml-1">Account Holder Name</label>
                  <input 
                    type="text" 
                    value={payoutInfo.bankAccount?.accountHolder}
                    onChange={(e) => setPayoutInfo({ 
                      ...payoutInfo, 
                      bankAccount: { ...payoutInfo.bankAccount!, accountHolder: e.target.value }
                    })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                    placeholder="Full legal name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-300 ml-1">Bank Name</label>
                  <input 
                    type="text" 
                    value={payoutInfo.bankAccount?.bankName}
                    onChange={(e) => setPayoutInfo({ 
                      ...payoutInfo, 
                      bankAccount: { ...payoutInfo.bankAccount!, bankName: e.target.value }
                    })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                    placeholder="e.g. Chase Bank"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-300 ml-1">Routing Number</label>
                  <input 
                    type="text" 
                    value={payoutInfo.bankAccount?.routingNumber}
                    onChange={(e) => setPayoutInfo({ 
                      ...payoutInfo, 
                      bankAccount: { ...payoutInfo.bankAccount!, routingNumber: e.target.value }
                    })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                    placeholder="9-digit code"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-bold text-gray-300 ml-1">Account Number</label>
                  <input 
                    type="password" 
                    value={payoutInfo.bankAccount?.accountNumber}
                    onChange={(e) => setPayoutInfo({ 
                      ...payoutInfo, 
                      bankAccount: { ...payoutInfo.bankAccount!, accountNumber: e.target.value }
                    })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 pb-12">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
              ) : <Save className="w-5 h-5" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayoutSettings;
