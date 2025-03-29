import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Music2, Users, Upload, Radio, Gift, DollarSign, LogOut, Shield, Settings, BarChart2, Film, Disc, Music, Tag } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  // Use state for userRole with default value of 'admin'
  const [userRole, setUserRole] = useState('admin');
  
  // Update userRole based on URL path
  React.useEffect(() => {
    setUserRole(location.pathname.startsWith('/admin') ? 'admin' : 'artist');
  }, [location.pathname]);

  const handleLogout = async () => {
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-purple-600 flex items-center gap-2">
             <img src="/assets/images/logo.png" width={ 20 } alt="Lugmatic logo" />
             Lugmatic
          </h1>
        </div>
        
        <nav className="mt-6">
          {userRole === 'admin' ? (
            <>
              <Link to="/admin" className={`flex items-center px-6 py-3 ${isActive('/admin') && !location.pathname.includes('/admin/') ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700 hover:bg-purple-50'}`}>
                <BarChart2 className="h-5 w-5 mr-3" />
                Dashboard
              </Link>
              <Link to="/admin/approvals" className={`flex items-center px-6 py-3 ${isActive('/admin/approvals') ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700 hover:bg-purple-50'}`}>
                <Shield className="h-5 w-5 mr-3" />
                Approvals
              </Link>
              <Link to="/admin/artist-management" className={`flex items-center px-6 py-3 ${isActive('/admin/artist-management') ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700 hover:bg-purple-50'}`}>
                <Music className="h-5 w-5 mr-3" />
                Artists
              </Link>
              <Link to="/admin/user-management" className={`flex items-center px-6 py-3 ${isActive('/admin/user-management') ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700 hover:bg-purple-50'}`}>
                <Users className="h-5 w-5 mr-3" />
                Users
              </Link>
              <Link to="/admin/financial-management" className={`flex items-center px-6 py-3 ${isActive('/admin/financial-management') ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700 hover:bg-purple-50'}`}>
                <DollarSign className="h-5 w-5 mr-3" />
                Finances
              </Link>
              <Link to="/admin/live-stream-management" className={`flex items-center px-6 py-3 ${isActive('/admin/live-stream-management') ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700 hover:bg-purple-50'}`}>
                <Film className="h-5 w-5 mr-3" />
                Live Streams
              </Link>
              <Link to="/admin/album-management" className={`flex items-center px-6 py-3 ${isActive('/admin/album-management') ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700 hover:bg-purple-50'}`}>
                <Disc className="h-5 w-5 mr-3" />
                Albums
              </Link>
              <Link to="/admin/song-management" className={`flex items-center px-6 py-3 ${isActive('/admin/song-management') ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700 hover:bg-purple-50'}`}>
                <Music2 className="h-5 w-5 mr-3" />
                Songs
              </Link>
              <Link to="/admin/genre-management" className={`flex items-center px-6 py-3 ${isActive('/admin/genre-management') ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700 hover:bg-purple-50'}`}>
                <Tag className="h-5 w-5 mr-3" />
                Genres
              </Link>
            </>
          ) : (
            <>
              <Link to="/artist" className={`flex items-center px-6 py-3 ${isActive('/artist') && !location.pathname.includes('/artist/') ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700 hover:bg-purple-50'}`}>
                <BarChart2 className="h-5 w-5 mr-3" />
                Dashboard
              </Link>
              <Link to="/artist/upload" className={`flex items-center px-6 py-3 ${isActive('/artist/upload') ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700 hover:bg-purple-50'}`}>
                <Upload className="h-5 w-5 mr-3" />
                Upload Music
              </Link>
              <Link to="/artist/live" className={`flex items-center px-6 py-3 ${isActive('/artist/live') ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700 hover:bg-purple-50'}`}>
                <Radio className="h-5 w-5 mr-3" />
                Go Live
              </Link>
              <Link to="/artist/gifts" className={`flex items-center px-6 py-3 ${isActive('/artist/gifts') ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700 hover:bg-purple-50'}`}>
                <Gift className="h-5 w-5 mr-3" />
                Gifts
              </Link>
              <Link to="/artist/earnings" className={`flex items-center px-6 py-3 ${isActive('/artist/earnings') ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700 hover:bg-purple-50'}`}>
                <DollarSign className="h-5 w-5 mr-3" />
                Earnings
              </Link>
              <Link to="/artist/settings" className={`flex items-center px-6 py-3 ${isActive('/artist/settings') ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700 hover:bg-purple-50'}`}>
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </Link>
            </>
          )}
          
          <button
            onClick={handleLogout}
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-purple-50 w-full mt-6"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}