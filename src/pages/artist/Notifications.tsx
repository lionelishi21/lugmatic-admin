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
  LayoutGrid
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { notificationService } from '../../services/notificationService';
import { Notification } from '../../types';
import toast from 'react-hot-toast';

type NotificationTab = 'all' | 'unread' | 'read';
type NotificationCategory = 'all' | 'gift' | 'comment' | 'follow' | 'system' | 'earnings' | 'podcast';

const card = 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg';

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
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
              <Bell className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-white italic">{newNotification.title}</p>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1 line-clamp-1">{newNotification.message}</p>
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
        return { icon: <Gift className="h-4 w-4" />, iconCls: 'text-rose-500', iconBg: 'bg-rose-500/10', border: 'border-rose-500/10' };
      case 'comment':
        return { icon: <MessageSquare className="h-4 w-4" />, iconCls: 'text-blue-500', iconBg: 'bg-blue-500/10', border: 'border-blue-500/10' };
      case 'follow':
        return { icon: <UserPlus className="h-4 w-4" />, iconCls: 'text-emerald-500', iconBg: 'bg-emerald-500/10', border: 'border-emerald-500/10' };
      case 'earnings':
        return { icon: <CreditCard className="h-4 w-4" />, iconCls: 'text-amber-500', iconBg: 'bg-amber-500/10', border: 'border-amber-500/10' };
      case 'podcast':
        return { icon: <Mic2 className="h-4 w-4" />, iconCls: 'text-purple-500', iconBg: 'bg-purple-500/10', border: 'border-purple-500/10' };
      default:
        return { icon: <Zap className="h-4 w-4" />, iconCls: 'text-indigo-500', iconBg: 'bg-indigo-500/10', border: 'border-indigo-500/10' };
    }
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesTab = activeTab === 'all' || (activeTab === 'unread' ? !n.isRead : n.isRead);
    const matchesCategory = activeCategory === 'all' || n.type === activeCategory;
    return matchesTab && matchesCategory;
  });

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-6">

      {/* ── Header Card ── */}
      <div className={`${card} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6`}>
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
            <Bell className="h-7 w-7 text-white" />
          </div>
          <div>
             <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1 italic">Event Log</p>
             <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight uppercase italic">
               Signal Center
             </h1>
             <p className="text-sm text-zinc-500 mt-0.5">
               Your real-time activity stream and ecosystem updates.
             </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`h-11 px-4 rounded-lg flex items-center justify-center transition-all ${
              showSettings
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xl shadow-black/20'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Settings2 className="h-5 w-5" />
          </button>
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="h-11 flex items-center gap-2 px-6 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <CheckCircle2 className="h-4 w-4" />
            Dismiss All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* ── Sidebar ── */}
        <div className="space-y-6">
          {/* Tab filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
               <LayoutGrid className="h-3.5 w-3.5 text-zinc-500" />
               <p className="text-[10px] uppercase tracking-widest font-black text-zinc-500">Inbound Focus</p>
            </div>
            <div className={`${card} p-1.5 flex flex-col gap-1 bg-zinc-50/50 dark:bg-zinc-800/20`}>
              {(['all', 'unread', 'read'] as NotificationTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab
                      ? 'bg-zinc-900 dark:bg-zinc-700 text-white shadow-lg'
                      : 'text-zinc-500 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {tab === 'all' ? <Inbox className="h-4 w-4" /> : tab === 'unread' ? <Sparkles className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    {tab}
                  </div>
                  {tab === 'unread' && unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Category filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
               <Filter className="h-3.5 w-3.5 text-zinc-500" />
               <p className="text-[10px] uppercase tracking-widest font-black text-zinc-500">Signal Categories</p>
            </div>
            <div className={`${card} p-1.5 flex flex-col gap-1 bg-zinc-50/50 dark:bg-zinc-800/20`}>
              {(['all', 'gift', 'comment', 'follow', 'system', 'earnings', 'podcast'] as NotificationCategory[]).map(cat => {
                const styles = cat === 'all' ? null : getNotificationStyles(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeCategory === cat
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'text-zinc-500 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded flex items-center justify-center ${
                      activeCategory === cat
                        ? 'text-emerald-500'
                        : 'text-zinc-400'
                    }`}>
                      {cat === 'all' ? <Filter className="h-3.5 w-3.5" /> : styles?.icon}
                    </div>
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Main Feed ── */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {showSettings ? (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className={card}
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-white/[0.06] bg-zinc-50/30 dark:bg-white/[0.01]">
                   <div className="flex items-center gap-2">
                      <Settings2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Transmission Config</span>
                   </div>
                </div>

                <div className="p-6 space-y-3">
                  {Object.entries(settings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between px-5 py-4 rounded-xl border border-zinc-100 dark:border-white/[0.06] bg-zinc-50/30 dark:bg-white/[0.01] hover:border-zinc-300 dark:hover:border-white/10 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-emerald-500 border border-transparent group-hover:border-emerald-500/20 transition-all">
                          <Zap className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-widest italic">{key.replace(/([A-Z])/g, ' $1')}</p>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Receive platform alerts for this frequency.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSetting(key)}
                        className={`relative h-6 w-11 rounded-full transition-all duration-300 ${value ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                      >
                        <div className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-lg transition-transform duration-300 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="feed"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {loading ? (
                  <div className="flex items-center justify-center py-24">
                    <div className="w-10 h-10 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className={`${card} flex flex-col items-center justify-center py-32 text-center px-8 bg-zinc-50/30 dark:bg-white/[0.01]`}>
                    <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mb-6 border border-zinc-200 dark:border-white/5">
                      <Inbox className="h-10 w-10 text-zinc-400 dark:text-zinc-700" />
                    </div>
                    <p className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">Clear Horizon</p>
                    <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest mt-2 max-w-xs leading-relaxed">
                      Your signal stream is currently quiet. inbound events will materialize here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredNotifications.map((notification, i) => {
                      const styles = getNotificationStyles(notification.type);
                      return (
                        <motion.div
                          layout
                          key={notification._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                          className={`${card} group flex items-start gap-5 px-6 py-5 hover:border-zinc-300 dark:hover:border-white/10 transition-all cursor-pointer relative overflow-hidden ${
                            !notification.isRead ? 'ring-1 ring-emerald-500/20' : ''
                          }`}
                        >
                          {!notification.isRead && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                          )}
                          
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${styles.iconBg} ${styles.iconCls} ${styles.border} group-hover:scale-105 transition-transform duration-300`}>
                            {styles.icon}
                          </div>

                          <div className="flex-1 min-w-0 py-1">
                            <div className="flex items-center justify-between gap-4 mb-1.5">
                              <div className="flex items-center gap-3 min-w-0">
                                <h3 className={`text-sm font-bold uppercase tracking-tight truncate ${notification.isRead ? 'text-zinc-500' : 'text-zinc-900 dark:text-white'}`}>
                                  {notification.title}
                                </h3>
                                {!notification.isRead && (
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0 shadow-[0_0_10px_rgba(16,185,129,1)]" />
                                )}
                              </div>
                              <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest flex items-center gap-1.5 flex-shrink-0 bg-zinc-50 dark:bg-zinc-800/50 px-2 py-0.5 rounded border border-zinc-100 dark:border-white/5">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className={`text-sm font-medium leading-relaxed ${notification.isRead ? 'text-zinc-500 line-clamp-1' : 'text-zinc-600 dark:text-zinc-300'}`}>
                              {notification.message}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 pt-1">
                            <button
                              onClick={(e) => handleDelete(notification._id, e)}
                              className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-rose-500 bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-500/10 rounded-lg transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <ChevronRight className="h-5 w-5 text-zinc-300 dark:text-zinc-700 group-hover:text-emerald-500 transition-all" />
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
