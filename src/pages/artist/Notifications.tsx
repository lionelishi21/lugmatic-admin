import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCircle2,
  Trash2,
  Settings2,
  Gift,
  MessageSquare,
  UserPlus,
  Zap,
  Clock,
  Filter,
  Inbox,
  Sparkles,
  X,
  CreditCard,
  Mic2,
  ArrowRight,
  ChevronRight,
  LayoutGrid,
  Activity,
  Target,
  Shield,
  Layers,
  Check,
  User,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { notificationService } from '../../services/notificationService';
import { Notification } from '../../types';
import toast from 'react-hot-toast';

type NotificationTab = 'all' | 'unread' | 'read';
type NotificationCategory = 'all' | 'gift' | 'comment' | 'follow' | 'system' | 'earnings' | 'podcast';

const Notifications: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<NotificationTab>('all');
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<Record<string, boolean>>({});

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await notificationService.getUserNotifications(1, 50);
      const rawData = response.data.data as any;
      const notificationList = Array.isArray(rawData) ? rawData : (rawData.data || []);
      setNotifications(notificationList);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.data.data.count || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const response = await notificationService.getNotificationSettings();
      setSettings(response.data.data || {});
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
    loadSettings();

    if (user?._id) {
      const { unsubscribe } = notificationService.subscribeToNotifications(user._id, (newNotification) => {
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-zinc-950 border border-white/10 shadow-2xl rounded-3xl pointer-events-auto flex p-6 gap-5`}>
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-black shrink-0">
              <Bell size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white uppercase tracking-tight">{newNotification.title}</p>
              <p className="text-xs text-zinc-500 font-medium mt-1 line-clamp-2">{newNotification.message}</p>
            </div>
          </div>
        ));
      });
      return () => unsubscribe();
    }
  }, [user?._id, loadNotifications, loadUnreadCount, loadSettings]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const promise = notificationService.markAllAsRead();
      toast.promise(promise, {
        loading: 'Updating...',
        success: 'All marked as read',
        error: 'Failed to update'
      });
      await promise;
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {}
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      loadUnreadCount();
    } catch (error) {
      toast.error('Deletion failed');
    }
  };

  const toggleSetting = async (key: string) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    try {
      await notificationService.updateNotificationSettings(newSettings);
    } catch (error) {
      toast.error('Settings update failed');
      setSettings(settings);
    }
  };

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'gift':
        return { icon: <Gift size={20} />, color: 'text-rose-500', bg: 'bg-rose-500/10' };
      case 'comment':
        return { icon: <MessageSquare size={20} />, color: 'text-blue-500', bg: 'bg-blue-500/10' };
      case 'follow':
        return { icon: <UserPlus size={20} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
      case 'earnings':
        return { icon: <CreditCard size={20} />, color: 'text-amber-500', bg: 'bg-amber-500/10' };
      case 'podcast':
        return { icon: <Mic2 size={20} />, color: 'text-purple-500', bg: 'bg-purple-500/10' };
      default:
        return { icon: <Zap size={20} />, color: 'text-zinc-500', bg: 'bg-zinc-950' };
    }
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesTab = activeTab === 'all' || (activeTab === 'unread' ? !n.isRead : n.isRead);
    const matchesCategory = activeCategory === 'all' || n.type === activeCategory;
    return matchesTab && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto pb-24 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-none uppercase">Notifications</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live Updates</span>
            </div>
          </div>
          <p className="text-zinc-500 font-medium">Stay updated with your latest engagement, earnings, and system alerts.</p>
        </div>

        <div className="flex items-center gap-4">
           <button onClick={() => setShowSettings(!showSettings)} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border ${showSettings ? 'bg-white text-black shadow-xl' : 'bg-zinc-950 text-zinc-500 border-white/5 hover:text-white'}`}>
              <Settings2 size={24} />
           </button>
           <button onClick={handleMarkAllAsRead} disabled={unreadCount === 0} className="h-14 px-8 bg-zinc-950 text-white border border-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-3 disabled:opacity-50">
              <Check size={18} />
              Mark all as read
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Sidebar Filters */}
        <div className="space-y-10">
           <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 px-4">Status</p>
              <div className="premium-card !p-2 bg-zinc-950/20 border-white/5 rounded-[2rem]">
                 {(['all', 'unread', 'read'] as NotificationTab[]).map(tab => (
                   <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-black shadow-xl' : 'text-zinc-500 hover:text-white'}`}>
                      <span className="capitalize">{tab}</span>
                      {tab === 'unread' && unreadCount > 0 && <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${activeTab === tab ? 'bg-black text-white' : 'bg-zinc-900 text-emerald-500'}`}>{unreadCount}</span>}
                   </button>
                 ))}
              </div>
           </div>

           <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 px-4">Categories</p>
              <div className="premium-card !p-2 bg-zinc-950/20 border-white/5 rounded-[2rem] space-y-1">
                 {(['all', 'gift', 'comment', 'follow', 'system', 'earnings', 'podcast'] as NotificationCategory[]).map(cat => (
                   <button key={cat} onClick={() => setActiveCategory(cat)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'text-zinc-500 hover:text-white'}`}>
                      <div className="w-6 flex items-center justify-center shrink-0">
                        {cat === 'all' ? <Layers size={16} /> : getNotificationStyles(cat).icon}
                      </div>
                      <span className="capitalize">{cat}</span>
                   </button>
                 ))}
              </div>
           </div>
        </div>

        {/* Main Feed */}
        <div className="lg:col-span-3">
           <AnimatePresence mode="wait">
              {showSettings ? (
                <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                   <div className="premium-card p-10 border-white/5 shadow-2xl space-y-10">
                      <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Notification Preferences</h2>
                        <p className="text-sm text-zinc-500 mt-2 font-medium">Control which updates you receive across your devices.</p>
                      </div>
                      <div className="space-y-4">
                         {Object.entries(settings).map(([key, value]) => (
                           <div key={key} className="flex items-center justify-between p-8 rounded-3xl bg-zinc-950/40 border border-white/5">
                              <div>
                                 <p className="text-sm font-bold text-white uppercase tracking-tight">{key.replace(/([A-Z])/g, ' $1')}</p>
                                 <p className="text-xs text-zinc-600 font-medium mt-1">Receive alerts for this activity.</p>
                              </div>
                              <button onClick={() => toggleSetting(key)} className={`relative h-8 w-14 rounded-full transition-all duration-300 border border-white/5 ${value ? 'bg-emerald-500' : 'bg-zinc-800'}`}>
                                 <div className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-xl transition-transform duration-300 ${value ? 'translate-x-6' : 'translate-x-0'}`} />
                              </button>
                           </div>
                         ))}
                      </div>
                   </div>
                </motion.div>
              ) : (
                <motion.div key="feed" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                   {loading ? (
                     <div className="flex flex-col items-center justify-center py-40 gap-6">
                        <Loader2 size={40} className="text-emerald-500 animate-spin" />
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Loading Notifications</p>
                     </div>
                   ) : filteredNotifications.length === 0 ? (
                     <div className="premium-card py-32 text-center border-dashed border-white/5 bg-zinc-950/20 rounded-[3rem]">
                        <div className="w-24 h-24 bg-zinc-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-white/5">
                           <Bell size={40} className="text-zinc-800" />
                        </div>
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">All caught up</h3>
                        <p className="text-sm text-zinc-500 mt-3 font-medium">Your notification stream is currently empty.</p>
                     </div>
                   ) : (
                     <div className="space-y-4">
                        {filteredNotifications.map((n, i) => {
                          const styles = getNotificationStyles(n.type);
                          return (
                            <motion.div key={n._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} onClick={() => !n.isRead && handleMarkAsRead(n._id)} className={`premium-card p-6 border-white/5 shadow-xl hover:border-emerald-500/20 transition-all cursor-pointer group flex items-start gap-6 rounded-[2rem] bg-zinc-950/20 ${!n.isRead ? 'ring-1 ring-emerald-500/20' : ''}`}>
                               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 bg-zinc-950 shadow-inner ${styles.color}`}>
                                  {styles.icon}
                               </div>
                               <div className="flex-1 min-w-0 py-1">
                                  <div className="flex items-center justify-between gap-4 mb-1">
                                     <h3 className={`text-sm font-bold uppercase tracking-tight truncate ${n.isRead ? 'text-zinc-600' : 'text-white'}`}>{n.title}</h3>
                                     <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest flex items-center gap-2 shrink-0 bg-zinc-950 px-3 py-1 rounded-lg border border-white/5">
                                        <Clock size={12} />
                                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                     </span>
                                  </div>
                                  <p className={`text-sm font-medium leading-relaxed ${n.isRead ? 'text-zinc-600' : 'text-zinc-400'}`}>{n.message}</p>
                               </div>
                               <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all pt-1">
                                  <button onClick={(e) => handleDelete(n._id, e)} className="w-11 h-11 flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-600 hover:text-rose-500 border border-white/5 transition-all"><Trash2 size={18} /></button>
                                  <div className="w-8 h-8 flex items-center justify-center text-zinc-800 group-hover:text-white transition-all"><ChevronRight size={24} /></div>
                               </div>
                            </motion.div>
                          );
                        })}
                     </div>
                   )}
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
