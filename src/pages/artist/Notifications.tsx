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
  Layers
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { notificationService } from '../../services/notificationService';
import { Notification } from '../../types';
import toast from 'react-hot-toast';

type NotificationTab = 'all' | 'unread' | 'read';
type NotificationCategory = 'all' | 'gift' | 'comment' | 'follow' | 'system' | 'earnings' | 'podcast';

// ── Shared primitives ─────────────────────────────────────────────
const card = 'bg-zinc-900 border border-white/[0.06] rounded-lg shadow-2xl relative overflow-hidden group';
const labelClass = 'block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 italic';

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
      toast.error('Failed to sync stream');
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
        toast(() => (
          <div className="flex items-center gap-5 p-2">
            <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 shadow-lg shadow-emerald-500/20">
              <Bell className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.1em] text-zinc-900 dark:text-white italic">{newNotification.title}</p>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1.5 line-clamp-1">{newNotification.message}</p>
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
        loading: 'Syncing inbox...',
        success: 'Inbox cleared!',
        error: 'Failed to clear inbox'
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
        return { icon: <Gift className="h-4.5 w-4.5" />, iconCls: 'text-rose-400', iconBg: 'bg-rose-500/10', border: 'border-rose-500/10' };
      case 'comment':
        return { icon: <MessageSquare className="h-4.5 w-4.5" />, iconCls: 'text-blue-400', iconBg: 'bg-blue-500/10', border: 'border-blue-500/10' };
      case 'follow':
        return { icon: <UserPlus className="h-4.5 w-4.5" />, iconCls: 'text-emerald-400', iconBg: 'bg-emerald-500/10', border: 'border-emerald-500/10' };
      case 'earnings':
        return { icon: <CreditCard className="h-4.5 w-4.5" />, iconCls: 'text-amber-400', iconBg: 'bg-amber-500/10', border: 'border-amber-500/10' };
      case 'podcast':
        return { icon: <Mic2 className="h-4.5 w-4.5" />, iconCls: 'text-purple-400', iconBg: 'bg-purple-500/10', border: 'border-purple-500/10' };
      default:
        return { icon: <Zap className="h-4.5 w-4.5" />, iconCls: 'text-indigo-400', iconBg: 'bg-indigo-500/10', border: 'border-indigo-500/10' };
    }
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesTab = activeTab === 'all' || (activeTab === 'unread' ? !n.isRead : n.isRead);
    const matchesCategory = activeCategory === 'all' || n.type === activeCategory;
    return matchesTab && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto pb-16 space-y-8 animate-in fade-in duration-700">

      {/* ── Branded Signal Header ── */}
      <div className={`${card} p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden group`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.02] rounded-bl-full pointer-events-none" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
            <Bell className="h-8 w-8 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2 italic">Signal Intelligence v2.0</p>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase italic">
              Signal Center
            </h1>
            <p className="text-sm text-zinc-500 mt-1 font-medium">
              Tactical activity stream monitoring and ecosystem alerts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`h-14 px-6 rounded-xl flex items-center justify-center transition-all border ${
              showSettings
                ? 'bg-white text-zinc-900 border-white shadow-2xl'
                : 'bg-zinc-950 text-zinc-400 border-white/[0.04] hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Settings2 className="h-5 w-5" />
          </button>
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="h-14 flex items-center gap-3 px-8 bg-emerald-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:scale-[1.02] transition-all shadow-2xl shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none italic"
          >
            <CheckCircle2 className="h-4.5 w-4.5" />
            Dismiss All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* ── Operational Sidebar ── */}
        <div className="space-y-8">
          {/* Tab HUD */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-2">
               <LayoutGrid className="h-4 w-4 text-emerald-500" />
               <p className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-500 italic">Inbound Focus</p>
            </div>
            <div className={`${card} p-2 flex flex-col gap-1.5 bg-zinc-950/20 shadow-inner`}>
              {(['all', 'unread', 'read'] as NotificationTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic group ${
                    activeTab === tab
                      ? 'bg-white text-zinc-950 shadow-2xl'
                      : 'text-zinc-500 hover:bg-white/[0.03] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={activeTab === tab ? 'text-emerald-600' : 'text-zinc-600 group-hover:text-emerald-500'}>
                      {tab === 'all' ? <Inbox className="h-4 w-4" /> : tab === 'unread' ? <Sparkles className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    </span>
                    {tab}
                  </div>
                  {tab === 'unread' && unreadCount > 0 && (
                    <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black tracking-tighter ${activeTab === tab ? 'bg-zinc-900 text-white' : 'bg-zinc-900 text-emerald-500 shadow-inner'}`}>
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Category HUD */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-2">
               <Filter className="h-4 w-4 text-emerald-500" />
               <p className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-500 italic">Signal Layers</p>
            </div>
            <div className={`${card} p-2 flex flex-col gap-1.5 bg-zinc-950/20 shadow-inner`}>
              {(['all', 'gift', 'comment', 'follow', 'system', 'earnings', 'podcast'] as NotificationCategory[]).map(cat => {
                const styles = cat === 'all' ? null : getNotificationStyles(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic group ${
                      activeCategory === cat
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'text-zinc-500 hover:bg-white/[0.03] hover:text-white'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-zinc-950 border border-white/[0.02] shadow-inner ${
                      activeCategory === cat
                        ? 'text-emerald-500'
                        : 'text-zinc-600 group-hover:text-emerald-500'
                    }`}>
                      {cat === 'all' ? <Layers className="h-4 w-4" /> : styles?.icon}
                    </div>
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Main Stream HUD ── */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {showSettings ? (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`${card} overflow-hidden`}
              >
                <div className="flex items-center justify-between px-8 py-6 border-b border-white/[0.06] bg-zinc-950/40">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
                         <Shield className="h-5 w-5 text-emerald-500" />
                      </div>
                      <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">Transmission Config</h2>
                   </div>
                </div>

                <div className="p-8 space-y-4 bg-zinc-950/10">
                  {Object.entries(settings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between px-8 py-6 rounded-2xl border border-white/[0.04] bg-zinc-950/30 hover:border-emerald-500/20 transition-all group relative overflow-hidden shadow-inner">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.01] rounded-bl-full pointer-events-none" />
                      <div className="flex items-center gap-6 relative z-10">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-zinc-950 border border-white/[0.04] text-zinc-600 group-hover:text-emerald-500 transition-colors shadow-2xl">
                          <Zap className="h-7 w-7" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">{key.replace(/([A-Z])/g, ' $1')}</p>
                          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1.5 opacity-60">Receive tactical frequency alerts.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSetting(key)}
                        className={`relative h-8 w-14 rounded-full transition-all duration-500 border border-white/[0.06] shadow-inner ${value ? 'bg-emerald-500' : 'bg-zinc-800'}`}
                      >
                        <div className={`absolute top-1 left-1 h-5.5 w-5.5 rounded-full bg-white shadow-2xl transition-transform duration-500 ${value ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="feed"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-32 bg-zinc-950/20 rounded-2xl border border-white/[0.04]">
                    <div className="relative">
                       <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin shadow-2xl shadow-emerald-500/20" />
                       <Activity className="absolute inset-0 m-auto h-5 w-5 text-emerald-500 animate-pulse" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mt-6 italic animate-pulse">Syncing Signal Stream...</p>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className={`${card} flex flex-col items-center justify-center py-32 text-center px-10 bg-zinc-950/20 shadow-inner`}>
                    <div className="w-20 h-20 bg-zinc-950 rounded-3xl flex items-center justify-center mb-8 border border-white/[0.04] shadow-2xl group cursor-default">
                      <Inbox className="h-10 w-10 text-zinc-700 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest italic">Clear Horizon</h3>
                    <p className="text-[11px] text-zinc-500 font-black uppercase tracking-[0.15em] mt-3 max-w-xs mx-auto leading-relaxed opacity-60">
                      Your signal stream is currently quiet. inbound events will materialize here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredNotifications.map((notification, i) => {
                      const styles = getNotificationStyles(notification.type);
                      return (
                        <motion.div
                          layout
                          key={notification._id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                          className={`${card} group flex items-start gap-6 px-8 py-6 hover:border-emerald-500/20 transition-all cursor-pointer relative overflow-hidden bg-zinc-950/20 ${
                            !notification.isRead ? 'ring-1 ring-emerald-500/20' : ''
                          }`}
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] rounded-bl-full pointer-events-none" />
                          {!notification.isRead && (
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                          )}
                          
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border bg-zinc-950 shadow-inner ${styles.iconCls} border-white/[0.04] group-hover:scale-105 transition-transform duration-500 shadow-2xl relative z-10`}>
                             <div className={`absolute inset-0 rounded-2xl blur-xl opacity-20 ${styles.iconBg}`} />
                             {styles.icon}
                          </div>

                          <div className="flex-1 min-w-0 py-1 relative z-10">
                            <div className="flex items-center justify-between gap-6 mb-2">
                              <div className="flex items-center gap-4 min-w-0">
                                <h3 className={`text-sm font-black uppercase tracking-tight truncate italic ${notification.isRead ? 'text-zinc-500' : 'text-zinc-900 dark:text-white'}`}>
                                  {notification.title}
                                </h3>
                                {!notification.isRead && (
                                  <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0 shadow-[0_0_15px_rgba(16,185,129,1)] animate-pulse" />
                                )}
                              </div>
                              <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest flex items-center gap-2 flex-shrink-0 bg-zinc-950 px-3 py-1 rounded-md border border-white/[0.04] italic">
                                <Clock className="h-3.5 w-3.5" />
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className={`text-sm font-medium leading-relaxed ${notification.isRead ? 'text-zinc-500 line-clamp-1' : 'text-zinc-600 dark:text-zinc-300'}`}>
                              {notification.message}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 pt-1 relative z-10">
                            <button
                              onClick={(e) => handleDelete(notification._id, e)}
                              className="w-12 h-12 flex items-center justify-center text-zinc-600 hover:text-rose-500 bg-zinc-950 hover:bg-rose-500/5 border border-white/[0.04] hover:border-rose-500/20 rounded-xl transition-all shadow-xl"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                            <ChevronRight className="h-6 w-6 text-zinc-700 group-hover:text-emerald-500 transition-all translate-x-0 group-hover:translate-x-1" />
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
