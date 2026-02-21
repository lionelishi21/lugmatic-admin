import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login'
import ArtistDashboard from './pages/artist/ArtistDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import Approvals from './pages/admin/Approvals';
import Upload from './pages/artist/Upload';
import Live from './pages/artist/Live';
import Gifts from './pages/artist/Giifts';
import Earnings from './pages/artist/Earnings';
import ArtistManagement from './pages/admin/ArtistManagement';
import UserManagement from './pages/admin/UserManagement';
import FinancialManagement from './pages/admin/FinancialManagement';
import LiveStreamManagement from './pages/admin/LiveStreamManagement';
import AlbumManagement from './pages/admin/AlbumManagement';
import SongManagement from './pages/admin/SongManagement';
import GenreManagement from './pages/admin/GenreManagement';
import Layout from './components/Layout';
import ArtistDetails from './pages/admin/ArtistDetails';
import ArtistCreate from './pages/admin/ArtistCreate';
import { ArtistProvider } from './context/ArtistContext';
import AuthInitializer from './components/AuthInitializer';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

// Import new pages for comprehensive features
import Podcasts from './pages/artist/Podcasts';
import Comments from './pages/artist/Comments';
import Notifications from './pages/artist/Notifications';
import Search from './pages/artist/Search';
import UserProfile from './pages/artist/UserProfile';
import Settings from './pages/artist/Settings';
import Support from './pages/artist/Support';

// Import new admin pages
import PodcastManagement from './pages/admin/PodcastManagement';
import CommentManagement from './pages/admin/CommentManagement';
import GiftManagement from './pages/admin/GiftManagement';
import NotificationManagement from './pages/admin/NotificationManagement';
import ContentModeration from './pages/admin/ContentModeration';
import Analytics from './pages/admin/Analytics';
import SystemSettings from './pages/admin/SystemSettings';
import Promotions from './pages/admin/Promotions';
import Reports from './pages/admin/Reports';
import PlaylistManagement from './pages/admin/PlaylistManagement';

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <AuthInitializer>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="/artist/*" element={
              <ProtectedRoute requiredRole="artist">
                <Layout>
                  <Routes>
                    <Route index element={<ArtistDashboard />} />
                    <Route path="upload" element={<Upload />} />
                    <Route path="live" element={<Live />} />
                    <Route path="gifts" element={<Gifts />} />
                    <Route path="earnings" element={<Earnings />} />
                    {/* New artist routes */}
                    <Route path="podcasts" element={<Podcasts />} />
                    <Route path="comments" element={<Comments />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="search" element={<Search />} />
                    <Route path="profile" element={<UserProfile />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="support" element={<Support />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />

            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ArtistProvider>
                    <Layout>
                      <Routes>
                        <Route index element={<AdminDashboard />} />
                        <Route path="approvals" element={<Approvals />} />
                        <Route path="artist-management" element={<ArtistManagement />} />
                        <Route path="artist-details/:id" element={<ArtistDetails />} />
                        <Route path="user-management" element={<UserManagement />} />
                        <Route path="financial-management" element={<FinancialManagement />} />
                        <Route path="live-stream-management" element={<LiveStreamManagement />} />
                        <Route path="album-management" element={<AlbumManagement />} />
                        <Route path="song-management" element={<SongManagement />} />
                        <Route path="playlist-management" element={<PlaylistManagement />} />
                        <Route path="genre-management" element={<GenreManagement />} />
                        <Route path="artist-add" element={<ArtistCreate />} />
                        {/* New admin routes */}
                        <Route path="podcast-management" element={<PodcastManagement />} />
                        <Route path="comment-management" element={<CommentManagement />} />
                        <Route path="gift-management" element={<GiftManagement />} />
                        <Route path="notification-management" element={<NotificationManagement />} />
                        <Route path="content-moderation" element={<ContentModeration />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="system-settings" element={<SystemSettings />} />
                        <Route path="promotions" element={<Promotions />} />
                        <Route path="reports" element={<Reports />} />
                      </Routes>
                    </Layout>
                  </ArtistProvider>
                </ProtectedRoute>
              }
            />

          </Routes>
        </Router>
      </AuthInitializer>
    </>
  )
}

export default App
