import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Music2, Users, Upload, Radio, Gift, DollarSign, LogOut, Shield,
  Settings, BarChart2, Film, Disc, Music, Tag, Menu, X, ChevronRight, LayoutGrid, CreditCard,
  MessageCircle, Bell, Search, User, Podcast, MessageSquare, TrendingUp, Video as VideoIcon,
  Users as UsersIcon, FileText, AlertTriangle, Zap, Award, Cog, HelpCircle, ListMusic, Swords, UserCheck, Sun, Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import lugmaticIcon from '../assets/lugmaticIcon.png';
import Breadcrumb from './Breadcrumb';

interface LayoutProps {
  children: React.ReactNode;
  userRole?: 'admin' | 'artist' | 'contributor';
}

type NavItemType = {
  path: string;
  label: string;
  icon: React.ReactNode;
  subItems?: { path: string; label: string; icon?: React.ReactNode }[];
  badge?: string;
};

export default function Layout({ children, userRole: userRoleProp }: LayoutProps) {
  const location = useLocation();
  const { logout } = useAuth();
  const [userRole, setUserRole] = useState(userRoleProp ?? 'admin');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // Detect mobile view
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Update userRole based on URL path
  useEffect(() => {
    if (userRoleProp) {
      setUserRole(userRoleProp);
    } else {
      if (location.pathname.startsWith('/admin')) {
        setUserRole('admin');
      } else if (location.pathname.startsWith('/contributor')) {
        setUserRole('contributor');
      } else {
        setUserRole('artist');
      }
    }

    // Close sidebar on mobile when navigating
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile, userRoleProp]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { theme, toggle: toggleTheme } = useTheme();

  const handleLogout = async () => {
    logout();
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const toggleExpand = (path: string) => {
    setExpandedItem(expandedItem === path ? null : path);
  };

  const adminNavItems: NavItemType[] = [
    { path: '/admin', label: 'COMMAND_CENTER', icon: <BarChart2 className="h-5 w-5" /> },
    { path: '/admin/home-page-management', label: 'INDEX_REDACTOR', icon: <LayoutGrid className="h-5 w-5" /> },
    { path: '/admin/approvals', label: 'SIGNAL_AUDIT', icon: <Shield className="h-5 w-5" /> },
    { path: '/admin/artist-approvals', label: 'ORIGIN_VETTING', icon: <UserCheck className="h-5 w-5" /> },
    {
      path: '/admin/artist-management',
      label: 'ARTIST_CORES',
      icon: <Music className="h-5 w-5" />,
      subItems: [
        { path: '/admin/artist-management', label: 'ALL_NODES', icon: <UsersIcon className="h-4 w-4" /> },
        { path: '/admin/artist-add', label: 'INITIALIZE_CORE', icon: <User className="h-4 w-4" /> },
        { path: '/admin/artist-management/verified', label: 'VERIFIED_SIGNALS', icon: <Award className="h-4 w-4" /> }
      ]
    },
    { path: '/admin/user-management', label: 'IDENTITY_GRID', icon: <Users className="h-5 w-5" /> },
    { path: '/admin/financial-management', label: 'CREDIT_LEDGER', icon: <DollarSign className="h-5 w-5" /> },
    { path: '/admin/live-stream-management', label: 'LIVE_UPLINKS', icon: <Film className="h-5 w-5" /> },
    { path: '/admin/clash-management', label: 'CLASH_PROTOCOLS', icon: <Swords className="h-5 w-5" /> },
    {
      path: '/admin/content',
      label: 'DATA_REPOSITORY',
      icon: <Disc className="h-5 w-5" />,
      subItems: [
        { path: '/admin/album-management', label: 'REPOSITORIES', icon: <Music2 className="h-4 w-4" /> },
        { path: '/admin/song-management', label: 'SIGNAL_UNITS', icon: <Music className="h-4 w-4" /> },
        { path: '/admin/playlist-management', label: 'CURATED_SETS', icon: <ListMusic className="h-4 w-4" /> },
        { path: '/admin/genre-management', label: 'FREQUENCY_TAGS', icon: <Tag className="h-4 w-4" /> }
      ]
    },
    { path: '/admin/podcast-management', label: 'VOICE_LOGS', icon: <Podcast className="h-5 w-5" /> },
    { path: '/admin/comment-management', label: 'FEEDBACK_STREAM', icon: <MessageSquare className="h-5 w-5" />, badge: '12' },
    { path: '/admin/gift-management', label: 'CREDIT_TRANSFERS', icon: <Gift className="h-5 w-5" /> },
    { path: '/admin/video-management', label: 'VISUAL_BUFFERS', icon: <VideoIcon className="h-5 w-5" /> },
    { path: '/admin/notification-management', label: 'ALERT_PROPAGATION', icon: <Bell className="h-5 w-5" /> },
    { path: '/admin/content-moderation', label: 'INTEGRITY_SCAN', icon: <AlertTriangle className="h-5 w-5" />, badge: '5' },
    { path: '/admin/analytics', label: 'INTELLIGENCE_GRID', icon: <TrendingUp className="h-5 w-5" /> },
    { path: '/admin/system-settings', label: 'CORE_SETTINGS', icon: <Cog className="h-5 w-5" /> },
    { path: '/admin/promotions', label: 'SIGNAL_BOOST', icon: <Zap className="h-5 w-5" /> },
    { path: '/admin/billboard', label: 'TOP_CHART_SYNC', icon: <Award className="h-5 w-5" /> },
    { path: '/admin/reports', label: 'DATA_ARCHIVE', icon: <FileText className="h-5 w-5" /> }
  ];

  const artistNavItems: NavItemType[] = [
    { path: '/artist', label: 'Dashboard', icon: <BarChart2 className="h-5 w-5" /> },
    { path: '/artist/songs', label: 'My Songs', icon: <Music className="h-5 w-5" /> },
    { path: '/artist/billboard', label: 'Billboard', icon: <Award className="h-5 w-5" /> },
    { path: '/artist/upload', label: 'Upload Music', icon: <Upload className="h-5 w-5" /> },
    { path: '/artist/live', label: 'Go Live', icon: <Radio className="h-5 w-5" /> },
    { path: '/artist/clashes', label: 'Live Clash', icon: <Swords className="h-5 w-5" /> },
    { path: '/artist/podcasts', label: 'Podcasts', icon: <Podcast className="h-5 w-5" /> },
    { path: '/artist/comments', label: 'Comments', icon: <MessageCircle className="h-5 w-5" />, badge: '8' },
    { path: '/artist/notifications', label: 'Notifications', icon: <Bell className="h-5 w-5" />, badge: '3' },
    { path: '/artist/search', label: 'Search', icon: <Search className="h-5 w-5" /> },
    { path: '/artist/gifts', label: 'Gifts', icon: <Gift className="h-5 w-5" /> },
    { path: '/artist/earnings', label: 'Earnings', icon: <DollarSign className="h-5 w-5" /> },
    { path: '/artist/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
    { path: '/artist/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
    { path: '/artist/support', label: 'Support', icon: <HelpCircle className="h-5 w-5" /> }
  ];

  const contributorNavItems: NavItemType[] = [
    { path: '/contributor', label: 'Dashboard', icon: <BarChart2 className="h-5 w-5" /> },
    { path: '/contributor/payouts', label: 'Payout Settings', icon: <CreditCard className="h-5 w-5" /> },
    { path: '/contributor/notifications', label: 'Notifications', icon: <Bell className="h-5 w-5" />, badge: '0' },
    { path: '/contributor/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
    { path: '/contributor/support', label: 'Support', icon: <HelpCircle className="h-5 w-5" /> }
  ];

  const navItems = userRole === 'admin' ? adminNavItems : (userRole === 'contributor' ? contributorNavItems : artistNavItems);

  const sidebarVariants = {
    open: { width: isMobile ? '85%' : '300px', transition: { type: 'spring', damping: 20, stiffness: 100 } },
    closed: { width: isMobile ? '0px' : '88px', transition: { type: 'spring', damping: 20, stiffness: 100 } }
  };

  const navItemClass = (active: boolean) => `
    w-full flex items-center justify-between px-4 py-3 rounded transition-all duration-200 group relative
    ${active 
      ? 'bg-emerald-500/10 text-emerald-400' 
      : 'hover:bg-white/[0.02] text-zinc-500 hover:text-white'
    }
  `;

  return (
    <div className="flex h-screen bg-black overflow-hidden font-sans antialiased text-zinc-100">
      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div
        className={`fixed lg:relative z-50 h-full bg-black border-r border-white/[0.06] shadow-[20px_0_40px_-15px_rgba(0,0,0,0.5)] ${isMobile && !isSidebarOpen ? 'invisible' : ''}`}
        variants={sidebarVariants}
        animate={isSidebarOpen ? 'open' : 'closed'}
        initial={isMobile ? 'closed' : 'open'}
      >
        <div className="flex flex-col h-full relative">
          {/* Header/Logo Section */}
          <div className="px-6 py-8 flex items-center justify-between border-b border-white/[0.04]">
            {isSidebarOpen ? (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 p-1 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <img src={lugmaticIcon} alt="Lugmatic" className="w-full h-full object-contain relative z-10 opacity-80" />
                </div>
                <div>
                   <h1 className="text-sm font-black text-white tracking-[0.2em] uppercase italic leading-none">
                     Lugmatic
                   </h1>
                   <p className="text-[9px] font-black text-emerald-500/80 uppercase tracking-[0.3em] italic mt-1.5">Studio HUD</p>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 p-1 mx-auto">
                <img src={lugmaticIcon} alt="Lugmatic" className="w-full h-full object-contain opacity-80" />
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-8 sidebar-nav px-4 space-y-8">
            <div>
              {isSidebarOpen && (
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] italic mb-4 ml-2">
                  {userRole === 'admin' ? 'Command Protocol' : (userRole === 'contributor' ? 'Sync Hub' : 'Signal Control')}
                </p>
              )}
              <ul className="space-y-1.5">
                {navItems.map((item) => (
                  <li key={item.path}>
                    {item.subItems ? (
                      <div className="space-y-1">
                        <button
                          onClick={() => toggleExpand(item.path)}
                          className={navItemClass(isActive(item.path))}
                        >
                          <div className="flex items-center">
                            <span className={`flex-shrink-0 transition-colors ${isActive(item.path) ? 'text-emerald-400' : 'text-zinc-600 group-hover:text-zinc-300'}`}>
                              {React.cloneElement(item.icon as React.ReactElement, { size: 18 })}
                            </span>
                            {isSidebarOpen && (
                              <span className="ml-4 text-[11px] font-black uppercase tracking-[0.15em] italic">{item.label}</span>
                            )}
                          </div>
                          {isSidebarOpen && (
                            <div className="flex items-center gap-3">
                              {item.badge && (
                                <span className="px-1.5 py-0.5 text-[8px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-sm italic uppercase tracking-widest">
                                  {item.badge}
                                </span>
                              )}
                              <ChevronRight
                                size={12}
                                className={`text-zinc-700 transition-transform duration-300 ${expandedItem === item.path ? 'rotate-90' : ''}`}
                              />
                            </div>
                          )}
                          {isActive(item.path) && (
                            <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                          )}
                        </button>

                        <AnimatePresence>
                          {isSidebarOpen && expandedItem === item.path && (
                            <motion.ul
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden pl-10 pr-2 space-y-1"
                            >
                              {item.subItems.map((subItem) => (
                                <li key={subItem.path}>
                                  <Link
                                    to={subItem.path}
                                    className={`flex items-center px-4 py-2.5 rounded text-[10px] font-black uppercase tracking-widest italic transition-all ${
                                      isActive(subItem.path)
                                        ? 'text-emerald-400 bg-emerald-500/5'
                                        : 'text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.02]'
                                    }`}
                                  >
                                    {subItem.label}
                                  </Link>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        to={item.path}
                        className={navItemClass(isActive(item.path))}
                      >
                        <div className="flex items-center">
                          <span className={`flex-shrink-0 transition-colors ${isActive(item.path) ? 'text-emerald-400' : 'text-zinc-600 group-hover:text-zinc-300'}`}>
                            {React.cloneElement(item.icon as React.ReactElement, { size: 18 })}
                          </span>
                          {isSidebarOpen && (
                            <span className="ml-4 text-[11px] font-black uppercase tracking-[0.15em] italic">{item.label}</span>
                          )}
                        </div>
                        {isSidebarOpen && item.badge && (
                          <span className="px-1.5 py-0.5 text-[8px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-sm italic uppercase tracking-widest">
                            {item.badge}
                          </span>
                        )}
                        {isActive(item.path) && (
                          <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                        )}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Footer Controls */}
          <div className="mt-auto p-4 space-y-2 border-t border-white/[0.04] bg-black/50 backdrop-blur-md">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center px-4 py-3 rounded text-zinc-600 hover:bg-white/[0.02] hover:text-white transition-all group"
            >
              <div className="w-8 h-8 rounded bg-zinc-950 border border-white/5 flex items-center justify-center group-hover:border-emerald-500/30 transition-colors">
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              </div>
              {isSidebarOpen && (
                <span className="ml-4 text-[10px] font-black uppercase tracking-[0.2em] italic">
                  {theme === 'dark' ? 'SOLAR_SYNC' : 'LUNAR_GRID'}
                </span>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 rounded text-zinc-600 hover:bg-rose-500/10 hover:text-rose-500 transition-all group"
            >
              <div className="w-8 h-8 rounded bg-zinc-950 border border-white/5 flex items-center justify-center group-hover:border-rose-500/30 transition-colors">
                <LogOut size={14} />
              </div>
              {isSidebarOpen && (
                <span className="ml-4 text-[10px] font-black uppercase tracking-[0.2em] italic">TERMINATE_SESSION</span>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-zinc-950">
        {/* Top Header/Toggle */}
        {isMobile && (
          <div className="fixed top-0 left-0 right-0 h-16 flex items-center px-6 bg-black/80 backdrop-blur-xl border-b border-white/5 z-40">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded bg-zinc-900 border border-white/10 text-zinc-400"
            >
              <Menu size={20} />
            </button>
            <div className="ml-auto flex items-center gap-3">
               <div className="text-right">
                  <p className="text-[10px] font-black text-white uppercase italic leading-none">Command</p>
                  <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest italic mt-1">Authorized</p>
               </div>
               <div className="w-8 h-8 rounded bg-zinc-900 border border-white/10" />
            </div>
          </div>
        )}

        {/* Scrollable Viewport */}
        <main className={`flex-1 overflow-y-auto scroll-smooth custom-scrollbar ${isMobile ? 'pt-24' : 'pt-12'}`}>
          <div className="min-h-full max-w-7xl mx-auto px-6 lg:px-8">
             <Breadcrumb />
             {children}
          </div>
        </main>

        {/* Global HUD Decorations */}
        <div className="fixed bottom-6 right-8 pointer-events-none z-10 flex items-center gap-4">
           <div className="flex flex-col items-end">
              <div className="flex gap-1 mb-1">
                 {[1,2,3,4,5].map(i => <div key={i} className={`w-1 h-1 bg-emerald-500/${i*20} rounded-full`} />)}
              </div>
              <p className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.4em] italic">System Integrity: Nominal</p>
           </div>
        </div>
      </div>
    </div>
  );
}