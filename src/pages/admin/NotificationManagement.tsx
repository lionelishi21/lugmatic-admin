import React, { useState, useEffect } from 'react';
import {
  Bell, Send, History, Info, AlertTriangle, Users,
  MessageSquare, Search, CheckCircle2, Clock, Trash2,
  RefreshCw, Plus, ChevronDown, ShieldAlert, Zap,
  Activity, ArrowRight
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface NotificationHistory {
  id: string;
  title: string;
  message: string;
  sentAt: string;
  recipientsCount: number;
  type: string;
}

const NotificationManagement: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('system_alert');
  const [priority, setPriority] = useState('normal');
  const [loading, setLoading] = useState(false);
  const [sentCount, setSentCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    const loadingId = toast.loading('Initiating broadcast...');
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.sendBroadcastNotification({
        title,
        message,
        contentType: category
      });

      if (response.data.success) {
        setSentCount(response.data.data.count);
        toast.success(`Successfully broadcast to ${response.data.data.count} users`, { id: loadingId });
        setTitle('');
        setMessage('');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Broadcast failed';
      setError(msg);
      toast.error(msg, { id: loadingId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <Bell className="text-indigo-500" size={32} />
            Notifications
          </h1>
          <p className="text-zinc-500">Broadcast system-wide transmissions and push alerts.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="premium-card !py-2 !px-4 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">~1,240 Active Targets</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Composer */}
        <div className="lg:col-span-2">
          <div className="premium-card">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/5 flex items-center justify-center">
                <Send size={20} className="text-indigo-500" />
              </div>
              <h2 className="text-lg font-bold text-white">Compose Broadcast</h2>
            </div>

            <form onSubmit={handleSend} className="space-y-6">
              <AnimatePresence>
                {sentCount !== null && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-emerald-400">Transmission Complete</p>
                      <p className="text-xs text-emerald-500/80">Notification delivered to {sentCount} nodes successfully.</p>
                    </div>
                    <button onClick={() => setSentCount(null)} className="ml-auto text-emerald-500 hover:text-white transition-colors">×</button>
                  </motion.div>
                )}

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3"
                  >
                    <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-rose-400">Sync Failure</p>
                      <p className="text-xs text-rose-500/80">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Broadcast Identity</label>
                <input 
                  type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter broadcast title..."
                  className="input-field" required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Category</label>
                  <div className="relative">
                    <select 
                      value={category} onChange={(e) => setCategory(e.target.value)}
                      className="input-field appearance-none pr-10"
                    >
                      <option value="system_alert">System Alert</option>
                      <option value="marketing">Marketing / Promotion</option>
                      <option value="new_release">New Content</option>
                      <option value="live_stream">Live Event</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" size={16} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Priority Protocol</label>
                  <div className="relative">
                    <select 
                      value={priority} onChange={(e) => setPriority(e.target.value)}
                      className="input-field appearance-none pr-10"
                    >
                      <option value="normal">Standard Delivery</option>
                      <option value="high">High Velocity (Popup)</option>
                      <option value="urgent">Critical / Lockdown</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" size={16} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Transmission Content</label>
                <textarea 
                  value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter detailed message content..." rows={5}
                  className="input-field resize-none" required
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
                <p className="text-[10px] font-medium text-zinc-500 flex items-center gap-2">
                  <Info size={14} className="text-indigo-500" />
                  Payload will be delivered via Push and In-App feeds.
                </p>
                <button 
                  type="submit" disabled={loading}
                  className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2 !px-8"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap size={16} />}
                  Initiate Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="premium-card">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <History size={18} className="text-zinc-400" />
                </div>
                <h3 className="text-lg font-bold text-white">History</h3>
              </div>
              <button className="text-[10px] font-bold text-indigo-500 hover:text-indigo-400 uppercase tracking-widest">Archive</button>
            </div>
            
            <div className="space-y-1 divide-y divide-white/5">
              {[
                { id: '1', title: 'Welcome to Lugmatic!', date: '2h ago', count: 1242, tag: 'Marketing' },
                { id: '2', title: 'Scheduled Maintenance', date: 'Yesterday', count: 1238, tag: 'System' },
                { id: '3', title: 'Artist Contest Winners', date: '2d ago', count: 1190, tag: 'Event' },
              ].map(item => (
                <div key={item.id} className="py-4 hover:bg-white/[0.02] transition-all cursor-pointer group rounded-xl px-2 -mx-2">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-bold text-zinc-300 group-hover:text-indigo-400 transition-colors">{item.title}</h4>
                    <span className="text-[9px] px-2 py-0.5 bg-white/5 text-zinc-500 rounded-lg font-bold uppercase tracking-widest border border-white/5">{item.tag}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Clock size={12} /> {item.date}</span>
                    <span className="flex items-center gap-1.5"><Users size={12} /> {item.count} Targets</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="premium-card bg-amber-500/5 border-amber-500/20">
            <h3 className="text-sm font-bold text-amber-500 flex items-center gap-2 mb-4 uppercase tracking-widest">
              <ShieldAlert size={16} />
              Broadcast Protocol
            </h3>
            <div className="space-y-4">
              {[
                'Maintain absolute professional tone.',
                'Reserve Critical Priority for verified emergencies.',
                'Synchronize marketing alerts with peak activity cycles.',
                'Validate all external hyperlinks before ignition.'
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3 text-xs font-medium text-amber-500/80 leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500/40 mt-1 shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationManagement;