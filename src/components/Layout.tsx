import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Users, Shield, DollarSign, Settings, BarChart2, Film, Disc, Music, Tag, 
  Menu, X, ChevronRight, LayoutGrid, Bell, Search, User, UserCheck, Sun, Moon, LogOut, ChevronDown,
  Swords, Award, Podcast, Megaphone, MessageSquare, Gift, AlertTriangle, Radio as RadioIcon, Upload
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
  const { logout } = useAuth();
  const [userRole, setUserRole] = useState(userRoleProp ?? 'admin');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

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
      if (!mobile) setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    { path: '/admin/promotions', label: 'Promotions', icon: <Megaphone size={20} />, section: 'Engagement' },
    { path: '/admin/comment-management', label: 'Comments', icon: <MessageSquare size={20} />, section: 'Engagement' },
    { path: '/admin/gift-management', label: 'Gifts', icon: <Gift size={20} />, section: 'Engagement' },
    { path: '/admin/notification-management', label: 'Notifications', icon: <Bell size={20} />, section: 'Engagement' },
    { path: '/admin/content-moderation', label: 'Moderation', icon: <AlertTriangle size={20} />, section: 'Engagement' },

    { path: '/admin/system-settings', label: 'Settings', icon: <Settings size={20} />, section: 'System' }
  ];

  const artistNavItems: NavItemType[] = [
    // Core
    { path: '/artist', label: 'Overview', icon: <LayoutGrid size={20} />, section: 'General' },
    { path: '/artist/songs', label: 'Music', icon: <Music size={20} />, section: 'General' },
    { path: '/artist/upload', label: 'Publish', icon: <Upload size={20} />, section: 'General' },
    { path: '/artist/live', label: 'Live', icon: <RadioIcon size={20} />, section: 'General' },
    
    // Engagement
    { path: '/artist/clashes', label: 'Clashes', icon: <Swords size={20} />, section: 'Engagement' },
    { path: '/artist/billboard', label: 'Billboard', icon: <Award size={20} />, section: 'Engagement' },
    { path: '/artist/podcasts', label: 'Podcasts', icon: <Podcast size={20} />, section: 'Engagement' },
    { path: '/artist/gifts', label: 'Gifts', icon: <Gift size={20} />, section: 'Engagement' },
    { path: '/artist/reels', label: 'Reels', icon: <Film size={20} />, section: 'Engagement' },
    
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
        animate={{ width: isSidebarOpen ? (isMobile ? '100%' : '280px') : '0px' }}
        className={`fixed lg:relative z-50 h-full bg-[#050505] border-r border-white/5 flex flex-col overflow-hidden ${!isSidebarOpen && isMobile ? 'hidden' : ''}`}
      >
        <div className="p-8 mb-4 flex items-center gap-3">
          <img src={lugmaticIcon} alt="Logo" className="w-10 h-10" />
          <span className="font-bold text-xl tracking-tight">Lugmatic</span>
        </div>

        <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar pb-10">
          {sections.length > 0 ? (
            sections.map((section) => (
              <div key={section} className="space-y-1">
                <p className="px-4 text-[10px] font-bold text-zinc-600">{section}</p>
                <div className="space-y-1">
                  {navItems.filter(i => i.section === section).map((item) => (
                    <div key={item.path}>
                      {item.subItems ? (
                        <div>
                          <button
                            onClick={() => setExpandedItem(expandedItem === item.path ? null : item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                              isActive(item.path) || expandedItem === item.path
                                ? 'bg-white/10 text-white' 
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]'
                            }`}
                          >
                            <div className={isActive(item.path) || expandedItem === item.path ? 'text-emerald-500' : 'text-zinc-600 group-hover:text-zinc-400'}>
                              {item.icon}
                            </div>
                            <span className="font-semibold text-[14px]">{item.label}</span>
                            <ChevronDown size={14} className={`ml-auto transition-transform duration-200 ${expandedItem === item.path ? 'rotate-180' : ''}`} />
                          </button>
                          
                          <AnimatePresence>
                            {expandedItem === item.path && (
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
                          className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                            isActive(item.path) 
                              ? 'bg-white/10 text-white' 
                              : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]'
                          }`}
                        >
                          <div className={isActive(item.path) ? 'text-emerald-500' : 'text-zinc-600 group-hover:text-zinc-400'}>
                            {item.icon}
                          </div>
                          <span className="font-semibold text-[14px]">{item.label}</span>
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                    isActive(item.path) 
                      ? 'bg-white/10 text-white' 
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className={isActive(item.path) ? 'text-emerald-500' : 'text-zinc-600 group-hover:text-zinc-400'}>
                    {item.icon}
                  </div>
                  <span className="font-semibold text-[14px]">{item.label}</span>
                </Link>
              ))}
            </div>
          )}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-2 bg-[#050505]">
          <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-500 hover:bg-white/[0.03] transition-all">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span className="text-sm font-semibold">Appearance</span>
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-500 hover:bg-rose-500/10 hover:text-red-500 transition-all">
            <LogOut size={18} />
            <span className="text-sm font-semibold">Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-black overflow-hidden relative">
        <header className="h-20 border-b border-white/5 flex items-center px-8 gap-4 bg-black/50 backdrop-blur-md sticky top-0 z-40">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-zinc-500 hover:text-white transition-colors lg:hidden">
            <Menu size={24} />
          </button>
          <Breadcrumb />
          <div className="ml-auto flex items-center gap-6">
             <button className="text-zinc-500 hover:text-white transition-colors"><Search size={20} /></button>
             <button className="text-zinc-500 hover:text-white transition-colors relative">
               <Bell size={20} />
               <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full" />
             </button>
             <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 font-bold text-xs">
                AD
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