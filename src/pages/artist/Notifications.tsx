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
  ChevronRight,
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
            <div className="bg-emerald-500/10 p-2 rounded-xl">
              <Bell className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">{newNotification.title}</p>
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
        return { icon: <Gift className="h-4 w-4" />, text: 'text-rose-500', bg: 'bg-rose-50' };
      case 'comment':
        return { icon: <MessageSquare className="h-4 w-4" />, text: 'text-blue-500', bg: 'bg-blue-50' };
      case 'follow':
        return { icon: <UserPlus className="h-4 w-4" />, text: 'text-emerald-500', bg: 'bg-emerald-50' };
      case 'earnings':
        return { icon: <CreditCard className="h-4 w-4" />, text: 'text-amber-500', bg: 'bg-amber-50' };
      case 'podcast':
        return { icon: <Mic2 className="h-4 w-4" />, text: 'text-purple-500', bg: 'bg-purple-50' };
      default:
        return { icon: <Zap className="h-4 w-4" />, text: 'text-indigo-500', bg: 'bg-indigo-50' };
    }
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesTab = activeTab === 'all' || (activeTab === 'unread' ? !n.isRead : n.isRead);
    const matchesCategory = activeCategory === 'all' || n.type === activeCategory;
    return matchesTab && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 bg-zinc-50/40 min-h-screen font-['Geist']">
      {/* Header - Soft Elevation */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] p-8 mb-10 shadow-2xl shadow-zinc-200/50 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-zinc-100"
      >
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-500 rounded-[2rem] flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Bell className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight font-['Bebas_Neue'] uppercase leading-none">
              Notifications
            </h1>
            <p className="text-zinc-500 text-sm font-medium mt-1">
              Your real-time activity stream and platform updates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`w-14 h-14 flex items-center justify-center rounded-[1.5rem] transition-all duration-300 ${
              showSettings 
              ? 'bg-zinc-900 text-white shadow-xl rotate-45' 
              : 'bg-white text-zinc-400 border border-zinc-100 hover:text-emerald-500 hover:border-emerald-200'
            }`}
          >
            <Settings2 className="h-6 w-6" />
          </button>
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="h-14 px-8 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 text-white font-bold rounded-[1.5rem] transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2"
          >
            <CheckCircle2 className="h-5 w-5" />
            Clear Inbox
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Navigation - Sidebar SoftUI */}
        <div className="space-y-8">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 px-6 mb-4">Focus</p>
            <div className="bg-white/80 rounded-[2rem] p-3 border border-zinc-100 shadow-xl shadow-zinc-100/50 flex flex-col gap-1">
              {(['all', 'unread', 'read'] as NotificationTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center justify-between px-5 py-3.5 rounded-[1.2rem] text-sm font-bold capitalize transition-all ${
                    activeTab === tab 
                    ? 'bg-zinc-900 text-white shadow-lg' 
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-3 text-inherit">
                    {tab === 'all' ? <Inbox className="h-4 w-4" /> : tab === 'unread' ? <Sparkles className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    {tab}
                  </div>
                  {tab === 'unread' && unreadCount > 0 && (
                    <span className="w-5 h-5 flex items-center justify-center bg-rose-500 text-white text-[10px] rounded-full shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 px-6 mb-4">Categories</p>
            <div className="bg-white/80 rounded-[2rem] p-3 border border-zinc-100 shadow-xl shadow-zinc-100/50 flex flex-col gap-1">
              {(['all', 'gift', 'comment', 'follow', 'system', 'earnings', 'podcast'] as NotificationCategory[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-4 px-5 py-3 rounded-[1.2rem] text-sm font-bold capitalize transition-all ${
                    activeCategory === cat
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${activeCategory === cat ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-zinc-100 text-zinc-400'}`}>
                    {cat === 'all' ? <Filter className="h-3.5 w-3.5" /> : getNotificationStyles(cat).icon}
                  </div>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contents */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {showSettings ? (
              <motion.div
                key="settings"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[2.5rem] p-10 border border-zinc-100 shadow-2xl shadow-zinc-200/40"
              >
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-2xl font-extrabold text-zinc-900 font-['Bebas_Neue'] uppercase tracking-tight">
                    Delivery Preferences
                  </h2>
                </div>
                
                <div className="space-y-4">
                  {Object.entries(settings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-6 rounded-[2rem] border border-zinc-50 bg-zinc-50/20 hover:bg-zinc-50/50 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-zinc-400 group-hover:text-emerald-500 transition-colors">
                          <Zap className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold capitalize text-zinc-900">{key.replace(/([A-Z])/g, ' $1')}</p>
                          <p className="text-xs text-zinc-400">Receive platform alerts for {key}.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSetting(key)}
                        className={`w-14 h-8 rounded-full transition-all relative p-1 ${value ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-zinc-200'}`}
                      >
                        <div className={`w-6 h-6 rounded-full bg-white transition-all shadow-md ${value ? 'translate-x-6' : 'translate-x-0'}`} />
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
                className="space-y-6"
              >
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-40 grayscale opacity-30">
                    <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="bg-white rounded-[3rem] border border-dashed border-zinc-200/60 p-24 text-center">
                    <div className="w-20 h-20 bg-zinc-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner shadow-zinc-100">
                      <Inbox className="h-10 w-10 text-zinc-200" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 italic">Clear Skies!</h3>
                    <p className="text-zinc-500 text-sm mt-2 max-w-xs mx-auto font-medium">
                      Your notification stream is currently empty. Check back later for music updates.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {filteredNotifications.map((notification) => {
                      const styles = getNotificationStyles(notification.type);
                      return (
                        <motion.div
                          layout
                          key={notification._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                          className={`group bg-white rounded-[2rem] p-7 flex items-start gap-6 transition-all duration-300 cursor-pointer border border-zinc-100 hover:scale-[1.01] hover:shadow-2xl hover:shadow-zinc-200/50 ${
                            !notification.isRead && 'ring-2 ring-emerald-500/10'
                          }`}
                        >
                          {/* Icon Soft Circle */}
                          <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 shadow-sm ${styles.bg} ${styles.text}`}>
                            {styles.icon}
                          </div>

                          {/* Content Body */}
                          <div className="flex-1 min-w-0 py-1">
                            <div className="flex items-center justify-between gap-4 mb-2">
                              <div className="flex items-center gap-3">
                                <h3 className={`text-base font-bold truncate ${notification.isRead ? 'text-zinc-500' : 'text-zinc-900 font-black'}`}>
                                  {notification.title}
                                </h3>
                                {!notification.isRead && (
                                  <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50 shrink-0" />
                                )}
                              </div>
                              <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1.5 flex-shrink-0 bg-zinc-50 px-3 py-1.5 rounded-full">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className={`text-sm leading-relaxed ${notification.isRead ? 'text-zinc-400 line-clamp-1' : 'text-zinc-600 font-medium'}`}>
                              {notification.message}
                            </p>
                          </div>

                          {/* Soft Action Tray */}
                          <div className="flex flex-col gap-2 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handleDelete(notification._id, e)}
                              className="p-3 bg-zinc-50 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 hover:shadow-md rounded-xl transition-all"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                            <div className="p-2 text-zinc-200 group-hover:text-emerald-500">
                              <ArrowRight className="h-5 w-5" />
                            </div>
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