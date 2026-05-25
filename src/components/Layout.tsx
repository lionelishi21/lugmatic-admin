import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { liveGuard } from '../store/liveGuard';
import {
  Users, Shield, DollarSign, Settings, BarChart2, Film, Disc, Music, Music2, Tag,
  Menu, X, ChevronRight, LayoutGrid, Bell, Search, User, UserCheck, Sun, Moon, LogOut, ChevronDown,
  Swords, Award, Podcast, Megaphone, MessageSquare, Gift, AlertTriangle, Radio as RadioIcon, Upload, HelpCircle
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
  section?: string;
  subItems?: { path: string; label: string }[];
};

export default function Layout({ children, userRole: userRoleProp }: LayoutProps) {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [userRole, setUserRole] = useState(userRoleProp ?? 'admin');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (userRoleProp) {
      setUserRole(userRoleProp);
    } else {
      if (location.pathname.startsWith('/admin')) {
        setUserRole('admin');
      } else {
        setUserRole('artist');
      }
    }
  }, [location.pathname, userRoleProp]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile && !isSidebarOpen) {
        // Keep it collapsed if the user manually collapsed it
      } else if (!mobile) {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  const { theme, toggle: toggleTheme } = useTheme();

  const handleLogout = async () => {
    logout();
  };

  const isActive = (path: string) => {
    if (path === '/admin' || path === '/artist') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const adminNavItems: NavItemType[] = [
    // Core Management
    { path: '/admin', label: 'Overview', icon: <BarChart2 size={20} />, section: 'Management' },
    { path: '/admin/approvals', label: 'Approvals', icon: <Shield size={20} />, section: 'Management' },
    { path: '/admin/artist-approvals', label: 'Artists', icon: <UserCheck size={20} />, section: 'Management' },
    { path: '/admin/user-management', label: 'Users', icon: <Users size={20} />, section: 'Management' },
    { path: '/admin/financial-management', label: 'Revenue', icon: <DollarSign size={20} />, section: 'Management' },
    { path: '/admin/live-stream-management', label: 'Streams', icon: <Film size={20} />, section: 'Management' },
    { 
      path: '/admin/library', 
      label: 'Library', 
      icon: <Disc size={20} />,
      section: 'Management',
      subItems: [
        { path: '/admin/album-management', label: 'Albums' },
        { path: '/admin/song-management', label: 'Songs' },
        { path: '/admin/genre-management', label: 'Genres' }
      ]
    },

    // Advanced Tools
    { path: '/admin/clash-management', label: 'Clashes', icon: <Swords size={20} />, section: 'Engagement' },
    { path: '/admin/billboard', label: 'Billboard', icon: <Award size={20} />, section: 'Engagement' },
    { path: '/admin/podcast-management', label: 'Podcasts', icon: <Podcast size={20} />, section: 'Engagement' },
    { path: '/admin/rhythm-management', label: 'Rhythms', icon: <Music2 size={20} />, section: 'Engagement' },
    { path: '/admin/promotions', label: 'Promotions', icon: <Megaphone size={20} />, section: 'Engagement' },
    { path: '/admin/comment-management', label: 'Comments', icon: <MessageSquare size={20} />, section: 'Engagement' },
    { path: '/admin/gift-management', label: 'Gifts', icon: <Gift size={20} />, section: 'Engagement' },
    { path: '/admin/notification-management', label: 'Notifications', icon: <Bell size={20} />, section: 'Engagement' },
    { path: '/admin/content-moderation', label: 'Moderation', icon: <AlertTriangle size={20} />, section: 'Engagement' },

    { path: '/admin/system-settings', label: 'Settings', icon: <Settings size={20} />, section: 'System' },
    { path: '/admin/documentation', label: 'Documentation', icon: <HelpCircle size={20} />, section: 'System' }
  ];

  const artistNavItems: NavItemType[] = [
    // Core
    { path: '/artist', label: 'Overview', icon: <LayoutGrid size={20} />, section: 'General' },
    { path: '/artist/songs', label: 'Music', icon: <Music size={20} />, section: 'General' },
    { path: '/artist/upload', label: 'Publish', icon: <Upload size={20} />, section: 'General' },
    { path: '/artist/live', label: 'Live', icon: <RadioIcon size={20} />, section: 'General' },
    { path: '/artist/streams', label: 'Past Streams', icon: <Film size={20} />, section: 'General' },
    { path: '/artist/mixer', label: 'AI Mixer', icon: <Music2 size={20} />, section: 'General' },
    { path: '/artist/search', label: 'Search', icon: <Search size={20} />, section: 'General' },
    
    // Engagement
    { path: '/artist/clashes', label: 'Clashes', icon: <Swords size={20} />, section: 'Engagement' },
    { path: '/artist/billboard', label: 'Billboard', icon: <Award size={20} />, section: 'Engagement' },
    { path: '/artist/podcasts', label: 'Podcasts', icon: <Podcast size={20} />, section: 'Engagement' },
    { path: '/artist/gifts', label: 'Gifts', icon: <Gift size={20} />, section: 'Engagement' },
    { path: '/artist/messages', label: 'Messages', icon: <MessageSquare size={20} />, section: 'Engagement' },
    { path: '/artist/shell-it', label: 'Shell It', icon: <Disc size={20} />, section: 'Engagement' },
    { path: '/artist/notifications', label: 'Notifications', icon: <Bell size={20} />, section: 'Engagement' },
    
    // Performance
    { path: '/artist/earnings', label: 'Earnings', icon: <DollarSign size={20} />, section: 'Performance' },
    { path: '/artist/profile', label: 'Profile', icon: <User size={20} />, section: 'Performance' },
    { path: '/artist/support', label: 'Support', icon: <Shield size={20} />, section: 'Performance' },
    { path: '/artist/settings', label: 'Settings', icon: <Settings size={20} />, section: 'Performance' }
  ];

  const navItems = userRole === 'admin' ? adminNavItems : artistNavItems;
  const sections = Array.from(new Set(navItems.map(i => i.section).filter(Boolean)));

  return (
    <div className="flex h-screen bg-black text-white selection:bg-emerald-500/30 font-inter">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? (isMobile ? '100%' : '280px') : (isMobile ? '0px' : '88px') }}
        className={`fixed lg:relative z-50 h-full bg-[#050505] border-r border-white/5 flex flex-col overflow-hidden ${!isSidebarOpen && isMobile ? 'hidden' : ''}`}
      >
        <div className={`p-8 mb-4 flex items-center ${!isSidebarOpen && !isMobile ? 'justify-center p-4' : 'justify-between'}`}>
          <div className="flex items-center gap-3">
            <img src={lugmaticIcon} alt="Logo" className="w-10 h-10 flex-shrink-0" />
            <span className={`font-bold text-xl tracking-tight transition-all duration-300 whitespace-nowrap ${!isSidebarOpen && !isMobile ? 'opacity-0 w-0 overflow-hidden' : ''}`}>Lugmatic</span>
          </div>
          {isMobile && (
            <button onClick={() => setIsSidebarOpen(false)} className="text-zinc-500 hover:text-white flex-shrink-0">
              <X size={24} />
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar pb-10">
          {sections.length > 0 ? (
            sections.map((section) => (
              <div key={section} className="space-y-1">
                <p className={`px-4 text-[10px] font-bold text-zinc-600 transition-all duration-300 ${!isSidebarOpen && !isMobile ? 'opacity-0 h-0 overflow-hidden m-0 p-0' : ''}`}>{section}</p>
                <div className="space-y-1">
                  {navItems.filter(i => i.section === section).map((item) => (
                    <div key={item.path}>
                      {item.subItems ? (
                        <div>
                          <button
                            onClick={() => {
                               if (!isSidebarOpen && !isMobile) setIsSidebarOpen(true);
                               setExpandedItem(expandedItem === item.path ? null : item.path);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                              isActive(item.path) || expandedItem === item.path
                                ? 'bg-white/10 text-white' 
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]'
                            } ${!isSidebarOpen && !isMobile ? 'justify-center px-0' : ''}`}
                          >
                            <div className={`flex-shrink-0 ${isActive(item.path) || expandedItem === item.path ? 'text-emerald-500' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
                              {item.icon}
                            </div>
                            <span className={`font-semibold text-[14px] whitespace-nowrap transition-all duration-300 ${!isSidebarOpen && !isMobile ? 'opacity-0 w-0 overflow-hidden' : ''}`}>{item.label}</span>
                            <ChevronDown size={14} className={`flex-shrink-0 transition-all duration-200 ${expandedItem === item.path ? 'rotate-180' : ''} ${!isSidebarOpen && !isMobile ? 'opacity-0 w-0 overflow-hidden ml-0' : 'ml-auto'}`} />
                          </button>
                          
                          <AnimatePresence>
                            {(expandedItem === item.path && (isSidebarOpen || isMobile)) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden pl-11 space-y-1 mt-1"
                              >
                                {item.subItems.map((sub) => (
                                  <Link
                                    key={sub.path}
                                    to={sub.path}
                                    onClick={(e) => {
                                      if (liveGuard.intercept(sub.path)) { e.preventDefault(); return; }
                                      if (isMobile) setIsSidebarOpen(false);
                                    }}
                                    className={`block py-2 text-sm font-medium transition-all ${
                                      location.pathname === sub.path ? 'text-emerald-400' : 'text-zinc-500 hover:text-white'
                                    }`}
                                  >
                                    {sub.label}
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Link
                          to={item.path}
                          onClick={(e) => {
                            if (liveGuard.intercept(item.path)) { e.preventDefault(); return; }
                            if (isMobile) setIsSidebarOpen(false);
                          }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                            isActive(item.path) 
                              ? 'bg-white/10 text-white' 
                              : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]'
                          } ${!isSidebarOpen && !isMobile ? 'justify-center px-0' : ''}`}
                        >
                          <div className={`flex-shrink-0 ${isActive(item.path) ? 'text-emerald-500' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
                            {item.icon}
                          </div>
                          <span className={`font-semibold text-[14px] whitespace-nowrap transition-all duration-300 ${!isSidebarOpen && !isMobile ? 'opacity-0 w-0 overflow-hidden' : ''}`}>{item.label}</span>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={(e) => {
                    if (liveGuard.intercept(item.path)) { e.preventDefault(); return; }
                    if (isMobile) setIsSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                    isActive(item.path) 
                      ? 'bg-white/10 text-white' 
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]'
                  } ${!isSidebarOpen && !isMobile ? 'justify-center px-0' : ''}`}
                >
                  <div className={`flex-shrink-0 ${isActive(item.path) ? 'text-emerald-500' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
                    {item.icon}
                  </div>
                  <span className={`font-semibold text-[14px] whitespace-nowrap transition-all duration-300 ${!isSidebarOpen && !isMobile ? 'opacity-0 w-0 overflow-hidden' : ''}`}>{item.label}</span>
                </Link>
              ))}
            </div>
          )}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-2 bg-[#050505]">
          <button onClick={toggleTheme} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-500 hover:bg-white/[0.03] transition-all ${!isSidebarOpen && !isMobile ? 'justify-center px-0' : ''}`}>
            <div className="flex-shrink-0">{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</div>
            <span className={`text-sm font-semibold whitespace-nowrap transition-all duration-300 ${!isSidebarOpen && !isMobile ? 'opacity-0 w-0 overflow-hidden' : ''}`}>Appearance</span>
          </button>
          <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-500 hover:bg-rose-500/10 hover:text-red-500 transition-all ${!isSidebarOpen && !isMobile ? 'justify-center px-0' : ''}`}>
            <div className="flex-shrink-0"><LogOut size={18} /></div>
            <span className={`text-sm font-semibold whitespace-nowrap transition-all duration-300 ${!isSidebarOpen && !isMobile ? 'opacity-0 w-0 overflow-hidden' : ''}`}>Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-black overflow-hidden relative">
        <header className="h-20 border-b border-white/5 flex items-center px-8 gap-4 bg-black/50 backdrop-blur-md sticky top-0 z-40">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-zinc-500 hover:text-white transition-colors">
            <Menu size={24} />
          </button>
          <Breadcrumb />
          <div className="ml-auto flex items-center gap-6">
             <Link to={userRole === 'admin' ? '/admin' : '/artist/search'} className="text-zinc-500 hover:text-white transition-colors">
               <Search size={20} />
             </Link>
             <Link to={userRole === 'admin' ? '/admin/notification-management' : '/artist/notifications'} className="text-zinc-500 hover:text-white transition-colors relative">
               <Bell size={20} />
               <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full" />
             </Link>
             <div ref={profileRef} className="relative">
               <button
                 onClick={() => setIsProfileOpen(prev => !prev)}
                 className="w-10 h-10 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 font-bold text-xs flex-shrink-0 hover:border-emerald-500/50 hover:text-white transition-all overflow-hidden focus:outline-none"
               >
                 {user?.name ? (
                   <span className="uppercase">{user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}</span>
                 ) : (
                   <User size={18} />
                 )}
               </button>

               <AnimatePresence>
                 {isProfileOpen && (
                   <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: -8 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: -8 }}
                     transition={{ duration: 0.15, ease: 'easeOut' }}
                     className="absolute right-0 top-full mt-3 w-60 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50"
                   >
                     {/* User info */}
                     <div className="px-4 py-4 border-b border-white/5">
                       <div className="flex items-center gap-3">
                         <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs flex-shrink-0">
                           {user?.name ? (
                             <span className="uppercase">{user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}</span>
                           ) : (
                             <User size={16} />
                           )}
                         </div>
                         <div className="min-w-0">
                           <p className="text-sm font-semibold text-white truncate">{user?.name || 'Artist'}</p>
                           <p className="text-xs text-zinc-500 truncate">{user?.email || ''}</p>
                         </div>
                       </div>
                       {userRole !== 'admin' && (
                         <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                           {userRole === 'contributor' ? 'Contributor' : 'Artist'}
                         </span>
                       )}
                     </div>

                     {/* Menu items */}
                     <div className="p-1.5 space-y-0.5">
                       <Link
                         to={userRole === 'admin' ? '/admin/system-settings' : '/artist/profile'}
                         onClick={(e) => {
                           const path = userRole === 'admin' ? '/admin/system-settings' : '/artist/profile';
                           if (liveGuard.intercept(path)) { e.preventDefault(); return; }
                           setIsProfileOpen(false);
                         }}
                         className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-400 hover:bg-white/5 hover:text-white transition-all"
                       >
                         <UserCheck size={16} className="flex-shrink-0" />
                         View Profile
                       </Link>
                       <Link
                         to={userRole === 'admin' ? '/admin/system-settings' : '/artist/settings'}
                         onClick={(e) => {
                           const path = userRole === 'admin' ? '/admin/system-settings' : '/artist/settings';
                           if (liveGuard.intercept(path)) { e.preventDefault(); return; }
                           setIsProfileOpen(false);
                         }}
                         className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-400 hover:bg-white/5 hover:text-white transition-all"
                       >
                         <Settings size={16} className="flex-shrink-0" />
                         Settings
                       </Link>
                     </div>

                     <div className="p-1.5 border-t border-white/5">
                       <button
                         onClick={() => { setIsProfileOpen(false); handleLogout(); }}
                         className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-400 hover:bg-rose-500/10 hover:text-red-400 transition-all"
                       >
                         <LogOut size={16} className="flex-shrink-0" />
                         Sign Out
                       </button>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-8 lg:p-12">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}