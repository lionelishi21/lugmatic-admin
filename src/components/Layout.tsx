import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Music2, Users, Upload, Radio, Gift, DollarSign, LogOut, Shield,
  Settings, BarChart2, Film, Disc, Music, Tag, Menu, X, ChevronRight, LayoutGrid, CreditCard,
  MessageCircle, Bell, Search, User, Podcast, MessageSquare, TrendingUp, Video as VideoIcon,
  Users as UsersIcon, FileText, AlertTriangle, Zap, Award, Cog, HelpCircle, ListMusic, Swords, UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import lugmaticIcon from '../assets/lugmaticIcon.png';
import { Sun, Moon } from 'lucide-react';
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
    // Call logout which will:
    // 1. Try to call backend logout endpoint (with token still available)
    // 2. Clear tokens from localStorage (via Redux action)
    // 3. Reset Redux auth state to initialState
    // 4. Clear persisted Redux state (via redux-persist)
    // 5. Navigate to login page
    logout();
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const toggleExpand = (path: string) => {
    setExpandedItem(expandedItem === path ? null : path);
  };

  const adminNavItems: NavItemType[] = [
    {
      path: '/admin',
      label: 'Dashboard',
      icon: <BarChart2 className="h-5 w-5" />
    },
    {
      path: '/admin/home-page-management',
      label: 'Home Page',
      icon: <LayoutGrid className="h-5 w-5" />
    },
    {
      path: '/admin/approvals',
      label: 'Track Approvals',
      icon: <Shield className="h-5 w-5" />,
    },
    {
      path: '/admin/artist-approvals',
      label: 'Artist Applications',
      icon: <UserCheck className="h-5 w-5" />,
    },
    {
      path: '/admin/artist-management',
      label: 'Artists',
      icon: <Music className="h-5 w-5" />,
      subItems: [
        { path: '/admin/artist-management', label: 'All Artists', icon: <UsersIcon className="h-4 w-4" /> },
        { path: '/admin/artist-add', label: 'Add Artist', icon: <User className="h-4 w-4" /> },
        { path: '/admin/artist-management/verified', label: 'Verified Artists', icon: <Award className="h-4 w-4" /> }
      ]
    },
    {
      path: '/admin/user-management',
      label: 'Users',
      icon: <Users className="h-5 w-5" />
    },
    {
      path: '/admin/financial-management',
      label: 'Finances',
      icon: <DollarSign className="h-5 w-5" />
    },
    {
      path: '/admin/live-stream-management',
      label: 'Live Streams',
      icon: <Film className="h-5 w-5" />
    },
    {
      path: '/admin/clash-management',
      label: 'Live Clash',
      icon: <Swords className="h-5 w-5" />
    },
    {
      path: '/admin/content',
      label: 'Content',
      icon: <Disc className="h-5 w-5" />,
      subItems: [
        { path: '/admin/album-management', label: 'Albums', icon: <Music2 className="h-4 w-4" /> },
        { path: '/admin/song-management', label: 'Songs', icon: <Music className="h-4 w-4" /> },
        { path: '/admin/playlist-management', label: 'Playlists', icon: <ListMusic className="h-4 w-4" /> },
        { path: '/admin/genre-management', label: 'Genres', icon: <Tag className="h-4 w-4" /> }
      ]
    },
    // New admin features
    {
      path: '/admin/podcast-management',
      label: 'Podcasts',
      icon: <Podcast className="h-5 w-5" />
    },
    {
      path: '/admin/comment-management',
      label: 'Comments',
      icon: <MessageSquare className="h-5 w-5" />,
      badge: '12'
    },
    {
      path: '/admin/gift-management',
      label: 'Gifts',
      icon: <Gift className="h-5 w-5" />
    },
    {
      path: '/admin/video-management',
      label: 'Videos',
      icon: <VideoIcon className="h-5 w-5" />
    },
    {
      path: '/admin/notification-management',
      label: 'Notifications',
      icon: <Bell className="h-5 w-5" />
    },
    {
      path: '/admin/content-moderation',
      label: 'Moderation',
      icon: <AlertTriangle className="h-5 w-5" />,
      badge: '5'
    },
    {
      path: '/admin/analytics',
      label: 'Analytics',
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      path: '/admin/system-settings',
      label: 'Settings',
      icon: <Cog className="h-5 w-5" />
    },
    {
      path: '/admin/promotions',
      label: 'Promotions',
      icon: <Zap className="h-5 w-5" />
    },
    {
      path: '/admin/billboard',
      label: 'Billboard',
      icon: <Award className="h-5 w-5" />
    },
    {
      path: '/admin/reports',
      label: 'Reports',
      icon: <FileText className="h-5 w-5" />
    }
  ];

  const artistNavItems: NavItemType[] = [
    {
      path: '/artist',
      label: 'Dashboard',
      icon: <BarChart2 className="h-5 w-5" />
    },
    {
      path: '/artist/songs',
      label: 'My Songs',
      icon: <Music className="h-5 w-5" />
    },
    {
      path: '/artist/billboard',
      label: 'Billboard',
      icon: <Award className="h-5 w-5" />
    },
    {
      path: '/artist/upload',
      label: 'Upload Music',
      icon: <Upload className="h-5 w-5" />
    },
    {
      path: '/artist/live',
      label: 'Go Live',
      icon: <Radio className="h-5 w-5" />
    },
    {
      path: '/artist/clashes',
      label: 'Live Clash',
      icon: <Swords className="h-5 w-5" />
    },
    {
      path: '/artist/podcasts',
      label: 'Podcasts',
      icon: <Podcast className="h-5 w-5" />
    },
    {
      path: '/artist/comments',
      label: 'Comments',
      icon: <MessageCircle className="h-5 w-5" />,
      badge: '8'
    },
    {
      path: '/artist/notifications',
      label: 'Notifications',
      icon: <Bell className="h-5 w-5" />,
      badge: '3'
    },
    {
      path: '/artist/search',
      label: 'Search',
      icon: <Search className="h-5 w-5" />
    },
    {
      path: '/artist/gifts',
      label: 'Gifts',
      icon: <Gift className="h-5 w-5" />
    },
    {
      path: '/artist/earnings',
      label: 'Earnings',
      icon: <DollarSign className="h-5 w-5" />
    },
    {
      path: '/artist/profile',
      label: 'Profile',
      icon: <User className="h-5 w-5" />
    },
    {
      path: '/artist/settings',
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />
    },
    {
      path: '/artist/support',
      label: 'Support',
      icon: <HelpCircle className="h-5 w-5" />
    }
  ];

  const contributorNavItems: NavItemType[] = [
    {
      path: '/contributor',
      label: 'Dashboard',
      icon: <BarChart2 className="h-5 w-5" />
    },
    {
      path: '/contributor/payouts',
      label: 'Payout Settings',
      icon: <CreditCard className="h-5 w-5" />
    },
    {
      path: '/contributor/notifications',
      label: 'Notifications',
      icon: <Bell className="h-5 w-5" />,
      badge: '0'
    },
    {
      path: '/contributor/settings',
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />
    },
    {
      path: '/contributor/support',
      label: 'Support',
      icon: <HelpCircle className="h-5 w-5" />
    }
  ];

  const navItems = userRole === 'admin' ? adminNavItems : (userRole === 'contributor' ? contributorNavItems : artistNavItems);

  // Animation variants
  const sidebarVariants = {
    open: { width: isMobile ? '85%' : '280px', transition: { duration: 0.3 } },
    closed: { width: isMobile ? '0px' : '80px', transition: { duration: 0.3 } }
  };

  const subMenuVariants = {
    open: {
      height: 'auto',
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    },
    closed: {
      height: 0,
      opacity: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const itemVariants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: -10 }
  };

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div
        className={`fixed lg:relative z-30 h-full bg-black border-r border-white/5 shadow-2xl ${isMobile && !isSidebarOpen ? 'invisible' : ''}`}
        variants={sidebarVariants}
        animate={isSidebarOpen ? 'open' : 'closed'}
        initial={isMobile ? 'closed' : 'open'}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-5 py-4 flex items-center justify-between border-b border-white/5">
            {isSidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded overflow-hidden flex items-center justify-center bg-white/5">
                  <img src={lugmaticIcon} alt="Lugmatic" className="h-9 w-9 object-cover" />
                </div>
                <div>
                  <h1 className="text-base font-bold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent tracking-tight">
                    Lugmatic
                  </h1>
                  <p className="text-[10px] text-zinc-500 font-semibold tracking-widest uppercase">Studio</p>
                </div>
              </div>
            ) : (
              <div className="w-9 h-9 rounded overflow-hidden flex items-center justify-center mx-auto bg-white/5">
                <img src={lugmaticIcon} alt="Lugmatic" className="h-9 w-9 object-cover" />
              </div>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded bg-white/5 hover:bg-white/10 transition-all text-zinc-400 hover:text-white ml-auto"
            >
              {isSidebarOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-3 sidebar-nav">
            {isSidebarOpen && (
              <div className="px-5 mb-3">
                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.15em]">
                  {userRole === 'admin' ? 'Admin Panel' : (userRole === 'contributor' ? 'Contributor Hub' : 'Artist Dashboard')}
                </p>
              </div>
            )}
            <ul className="space-y-0.5 px-3">
              {navItems.map((item) => (
                <li key={item.path}>
                  {item.subItems ? (
                    <>
                      <button
                        onClick={() => toggleExpand(item.path)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-all duration-150 group ${
                          isActive(item.path)
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'hover:bg-white/5 text-zinc-400 hover:text-white'
                          }`}
                      >
                        <div className="flex items-center">
                          <span className={`flex-shrink-0 mr-3 p-1.5 rounded transition-all duration-150 ${
                            isActive(item.path)
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'text-zinc-500 group-hover:text-zinc-300'
                          }`}>
                            {item.icon}
                          </span>
                          {isSidebarOpen && (
                            <span className="text-sm font-medium">{item.label}</span>
                          )}
                        </div>
                        {isSidebarOpen && (
                          <div className="flex items-center gap-2">
                            {item.badge && (
                              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-red-500/20 text-red-400 rounded-md">
                                {item.badge}
                              </span>
                            )}
                            <ChevronRight
                              size={14}
                              className={`text-zinc-600 transform transition-transform duration-200 ${expandedItem === item.path ? 'rotate-90' : ''}`}
                            />
                          </div>
                        )}
                      </button>

                      {isSidebarOpen && (
                        <AnimatePresence>
                          {expandedItem === item.path && (
                            <motion.ul
                              variants={subMenuVariants}
                              initial="closed"
                              animate="open"
                              exit="closed"
                              className="overflow-hidden pl-11 pr-2 mt-1 space-y-0.5"
                            >
                              {item.subItems.map((subItem) => (
                                <motion.li
                                  key={subItem.path}
                                  variants={itemVariants}
                                >
                                  <Link
                                    to={subItem.path}
                                    className={`flex items-center px-3 py-2 rounded-md transition-all duration-200 text-sm ${isActive(subItem.path)
                                      ? 'text-emerald-400 font-medium bg-emerald-500/10'
                                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                                      }`}
                                  >
                                    {subItem.icon && (
                                      <span className="mr-2.5 text-zinc-600">
                                        {subItem.icon}
                                      </span>
                                    )}
                                    {subItem.label}
                                  </Link>
                                </motion.li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.path}
                  className={`flex items-center justify-between px-3 py-2.5 rounded transition-all duration-150 group ${
                    isActive(item.path)
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'hover:bg-white/5 text-zinc-400 hover:text-white'
                  }`}
                    >
                      <div className="flex items-center">
                        <span className={`flex-shrink-0 mr-3 p-1.5 rounded transition-all duration-150 ${
                          isActive(item.path)
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'text-zinc-500 group-hover:text-zinc-300'
                        }`}>
                          {item.icon}
                        </span>
                        {isSidebarOpen && (
                          <span className="text-sm font-medium">{item.label}</span>
                        )}
                      </div>
                      {isSidebarOpen && item.badge && (
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-red-500/20 text-red-400 rounded-md">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t border-white/5 p-3 space-y-0.5">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center px-3 py-2.5 rounded text-zinc-500 hover:bg-white/5 hover:text-zinc-300 transition-all duration-150"
            >
              {theme === 'dark'
                ? <Sun className="h-4 w-4 mr-3 flex-shrink-0" />
                : <Moon className="h-4 w-4 mr-3 flex-shrink-0" />}
              {isSidebarOpen && (
                <span className="text-sm font-medium">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2.5 rounded text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150 group"
            >
              <LogOut className="h-4 w-4 mr-3 text-zinc-600 group-hover:text-red-400 transition-colors flex-shrink-0" />
              {isSidebarOpen && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Mobile Toggle Button */}
      {isMobile && !isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-20 p-3 rounded bg-black/80 backdrop-blur-xl shadow-2xl border border-white/5 hover:bg-black/90 transition-all duration-200"
        >
          <Menu size={20} className="text-white" />
        </button>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-zinc-950 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <main className={`p-5 lg:p-8 ${isMobile ? 'pt-16' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
}