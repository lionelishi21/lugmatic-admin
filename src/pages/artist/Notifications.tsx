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
  ArrowRight
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
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded">
              <Bell className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-white">{newNotification.title}</p>
              <p className="text-[10px] text-zinc-500 line-clamp-1">{newNotification.message}</p>
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
        loading: 'Cleaning up...',
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
        return { icon: <Gift className="h-4 w-4" />, iconCls: 'text-rose-600 dark:text-rose-400', iconBg: 'bg-rose-50 dark:bg-rose-500/10' };
      case 'comment':
        return { icon: <MessageSquare className="h-4 w-4" />, iconCls: 'text-blue-600 dark:text-blue-400', iconBg: 'bg-blue-50 dark:bg-blue-500/10' };
      case 'follow':
        return { icon: <UserPlus className="h-4 w-4" />, iconCls: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-50 dark:bg-emerald-500/10' };
      case 'earnings':
        return { icon: <CreditCard className="h-4 w-4" />, iconCls: 'text-amber-600 dark:text-amber-400', iconBg: 'bg-amber-50 dark:bg-amber-500/10' };
      case 'podcast':
        return { icon: <Mic2 className="h-4 w-4" />, iconCls: 'text-purple-600 dark:text-purple-400', iconBg: 'bg-purple-50 dark:bg-purple-500/10' };
      default:
        return { icon: <Zap className="h-4 w-4" />, iconCls: 'text-indigo-600 dark:text-indigo-400', iconBg: 'bg-indigo-50 dark:bg-indigo-500/10' };
    }
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesTab = activeTab === 'all' || (activeTab === 'unread' ? !n.isRead : n.isRead);
    const matchesCategory = activeCategory === 'all' || n.type === activeCategory;
    return matchesTab && matchesCategory;
  });

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-6">

      {/* Header */}
      <div className={`${card} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Notifications
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Your real-time activity stream and platform updates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              showSettings
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Settings2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark All Read
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Tab filter */}
          <div className={card}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-white/[0.06]">
              <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Focus</span>
            </div>
            <div className="p-2 flex flex-col gap-0.5">
              {(['all', 'unread', 'read'] as NotificationTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center justify-between px-3 py-2 rounded text-sm font-semibold capitalize transition-colors ${
                    activeTab === tab
                      ? 'bg-zinc-900 dark:bg-zinc-700 text-white'
                      : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/[0.02] hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {tab === 'all' ? <Inbox className="h-4 w-4" /> : tab === 'unread' ? <Sparkles className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    {tab}
                  </div>
                  {tab === 'unread' && unreadCount > 0 && (
                    <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Category filter */}
          <div className={card}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-white/[0.06]">
              <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Categories</span>
            </div>
            <div className="p-2 flex flex-col gap-0.5">
              {(['all', 'gift', 'comment', 'follow', 'system', 'earnings', 'podcast'] as NotificationCategory[]).map(cat => {
                const styles = cat === 'all' ? null : getNotificationStyles(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex items-center gap-3 px-3 py-2 rounded text-sm font-semibold capitalize transition-colors ${
                      activeCategory === cat
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                        : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/[0.02] hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded flex items-center justify-center ${
                      activeCategory === cat
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500'
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

        {/* Main content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {showSettings ? (
              <motion.div
                key="settings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={card}
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-white/[0.06]">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">Delivery Preferences</span>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="p-5 space-y-3">
                  {Object.entries(settings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between px-4 py-3 rounded border border-zinc-100 dark:border-white/[0.06] hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500">
                          <Zap className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                          <p className="text-[11px] text-zinc-400">Receive platform alerts for {key}.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSetting(key)}
                        className={`relative h-5 w-9 rounded-full transition-colors ${value ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'}`}
                      >
                        <div className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="feed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center py-24">
                    <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className={`${card} flex flex-col items-center justify-center py-20 text-center px-8`}>
                    <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
                      <Inbox className="h-6 w-6 text-zinc-400" />
                    </div>
                    <p className="font-semibold text-zinc-700 dark:text-zinc-300">Clear Skies!</p>
                    <p className="text-sm text-zinc-400 mt-1 max-w-xs">
                      Your notification stream is currently empty. Check back later for music updates.
                    </p>
                  </div>
                ) : (
                  <div className={`${card} divide-y divide-zinc-100 dark:divide-white/[0.04]`}>
                    {filteredNotifications.map((notification) => {
                      const styles = getNotificationStyles(notification.type);
                      return (
                        <motion.div
                          layout
                          key={notification._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                          className={`group flex items-start gap-4 px-5 py-4 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer ${
                            !notification.isRead ? 'border-l-2 border-emerald-500' : ''
                          }`}
                        >
                          <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${styles.iconBg} ${styles.iconCls}`}>
                            {styles.icon}
                          </div>

                          <div className="flex-1 min-w-0 py-0.5">
                            <div className="flex items-center justify-between gap-4 mb-1">
                              <div className="flex items-center gap-2 min-w-0">
                                <h3 className={`text-sm font-semibold truncate ${notification.isRead ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-900 dark:text-white'}`}>
                                  {notification.title}
                                </h3>
                                {!notification.isRead && (
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                                )}
                              </div>
                              <span className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1 flex-shrink-0">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className={`text-sm leading-relaxed ${notification.isRead ? 'text-zinc-400 line-clamp-1' : 'text-zinc-600 dark:text-zinc-300'}`}>
                              {notification.message}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 pt-0.5">
                            <button
                              onClick={(e) => handleDelete(notification._id, e)}
                              className="px-3 py-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded text-xs font-semibold transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            <ArrowRight className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />
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
