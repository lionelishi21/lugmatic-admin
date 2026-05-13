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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

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

    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile, userRoleProp]);

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
    { path: '/admin', label: 'Overview', icon: <BarChart2 size={20} /> },
    { path: '/admin/approvals', label: 'Approvals', icon: <Shield size={20} /> },
    { path: '/admin/artist-approvals', label: 'Artists', icon: <UserCheck size={20} /> },
    { path: '/admin/user-management', label: 'Users', icon: <Users size={20} /> },
    { path: '/admin/financial-management', label: 'Revenue', icon: <DollarSign size={20} /> },
    { path: '/admin/live-stream-management', label: 'Streams', icon: <Film size={20} /> },
    { path: '/admin/content', label: 'Library', icon: <Disc size={20} />, subItems: [
        { path: '/admin/album-management', label: 'Albums' },
        { path: '/admin/song-management', label: 'Songs' },
        { path: '/admin/genre-management', label: 'Genres' }
      ]
    },
    { path: '/admin/system-settings', label: 'Settings', icon: <Settings size={20} /> }
  ];

  const artistNavItems: NavItemType[] = [
    { path: '/artist', label: 'Studio', icon: <BarChart2 size={20} /> },
    { path: '/artist/songs', label: 'Music', icon: <Music size={20} /> },
    { path: '/artist/upload', label: 'Publish', icon: <Upload size={20} /> },
    { path: '/artist/live', label: 'Live', icon: <Radio size={20} /> },
    { path: '/artist/profile', label: 'Profile', icon: <User size={20} /> }
  ];

  const navItems = userRole === 'admin' ? adminNavItems : artistNavItems;

  return (
    <div className="flex h-screen bg-black text-white selection:bg-emerald-500/30">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? (isMobile ? '100%' : '260px') : '0px' }}
        className={`fixed lg:relative z-50 h-full bg-[#050505] border-r border-white/5 flex flex-col overflow-hidden ${!isSidebarOpen && isMobile ? 'hidden' : ''}`}
      >
        <div className="p-6 mb-4 flex items-center gap-3">
          <img src={lugmaticIcon} alt="Logo" className="w-8 h-8 opacity-90" />
          <span className="font-bold text-lg tracking-tight">Lugmatic</span>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <div key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive(item.path) 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'text-zinc-500 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                {item.icon}
                <span className="font-medium text-[15px]">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:bg-white/[0.03] transition-all">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span className="text-sm font-medium">Appearance</span>
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:bg-red-500/10 hover:text-red-500 transition-all">
            <LogOut size={18} />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-black overflow-hidden">
        <header className="h-16 border-b border-white/5 flex items-center px-6 gap-4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-zinc-400 hover:text-white transition-colors">
            <Menu size={20} />
          </button>
          <Breadcrumb />
          <div className="ml-auto flex items-center gap-4">
             <button className="text-zinc-400 hover:text-white"><Search size={20} /></button>
             <button className="text-zinc-400 hover:text-white"><Bell size={20} /></button>
             <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}