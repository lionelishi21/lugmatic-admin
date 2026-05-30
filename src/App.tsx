import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import Approvals from './pages/admin/Approvals';
import ArtistManagement from './pages/admin/ArtistManagement';
import ArtistEdit from './pages/admin/ArtistEdit';
import UserManagement from './pages/admin/UserManagement';
import FinancialManagement from './pages/admin/FinancialManagement';
import LiveStreamManagement from './pages/admin/LiveStreamManagement';
import AlbumManagement from './pages/admin/AlbumManagement';
import SongManagement from './pages/admin/SongManagement';
import SongDetail from './pages/admin/SongDetail';
import SongCreate from './pages/admin/SongCreate';
import GenreManagement from './pages/admin/GenreManagement';
import Layout from './components/Layout';
import ArtistDetails from './pages/admin/ArtistDetails';
import ArtistCreate from './pages/admin/ArtistCreate';
import { ArtistProvider } from './context/ArtistContext';
import AuthInitializer from './components/AuthInitializer';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import Documentation from './pages/admin/Documentation';
import PodcastManagement from './pages/admin/PodcastManagement';
import CommentManagement from './pages/admin/CommentManagement';
import GiftManagement from './pages/admin/GiftManagement';
import GiftEdit from './pages/admin/GiftEdit';
import VideoManagement from './pages/admin/VideoManagement';
import NotificationManagement from './pages/admin/NotificationManagement';
import ContentModeration from './pages/admin/ContentModeration';
import Analytics from './pages/admin/Analytics';
import SystemSettings from './pages/admin/SystemSettings';
import Promotions from './pages/admin/Promotions';
import Reports from './pages/admin/Reports';
import PlaylistManagement from './pages/admin/PlaylistManagement';
import ClashManagement from './pages/admin/ClashManagement';
import RegularClashManagement from './pages/admin/RegularClashManagement';
import Billboard from './pages/admin/Billboard';
import ArtistApprovals from './pages/admin/ArtistApprovals';
import RhythmManagement from './pages/admin/RhythmManagement';
import { ThemeProvider } from './context/ThemeContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { usePushNotifications } from './hooks/usePushNotifications';

function AppInner() {
  usePushNotifications();
  return null;
}

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''}>
      <ThemeProvider>
        <AppInner />
        <Toaster position="top-center" />
        <AuthInitializer>
          <Router>
            <Routes>
              {/* Auth */}
              <Route path="/" element={<Navigate to="/admin" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Admin dashboard */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <ArtistProvider>
                      <Layout>
                        <Routes>
                          <Route index element={<AdminDashboard />} />
                          <Route path="approvals" element={<Approvals />} />
                          <Route path="artist-management/*" element={<ArtistManagement />} />
                          <Route path="artist-details/:id" element={<ArtistDetails />} />
                          <Route path="artists/:id/edit" element={<ArtistEdit />} />
                          <Route path="user-management" element={<UserManagement />} />
                          <Route path="financial-management" element={<FinancialManagement />} />
                          <Route path="live-stream-management" element={<LiveStreamManagement />} />
                          <Route path="album-management" element={<AlbumManagement />} />
                          <Route path="song-management" element={<SongManagement />} />
                          <Route path="song-management/add" element={<SongCreate />} />
                          <Route path="song-management/:id" element={<SongDetail />} />
                          <Route path="playlist-management" element={<PlaylistManagement />} />
                          <Route path="video-management" element={<VideoManagement />} />
                          <Route path="genre-management" element={<GenreManagement />} />
                          <Route path="artist-add" element={<ArtistCreate />} />
                          <Route path="podcast-management" element={<PodcastManagement />} />
                          <Route path="comment-management" element={<CommentManagement />} />
                          <Route path="gift-management" element={<GiftManagement />} />
                          <Route path="gift-management/add" element={<GiftEdit />} />
                          <Route path="gift-management/:id" element={<GiftEdit />} />
                          <Route path="notification-management" element={<NotificationManagement />} />
                          <Route path="content-moderation" element={<ContentModeration />} />
                          <Route path="analytics" element={<Analytics />} />
                          <Route path="system-settings" element={<SystemSettings />} />
                          <Route path="promotions" element={<Promotions />} />
                          <Route path="reports" element={<Reports />} />
                          <Route path="clash-management" element={<ClashManagement />} />
                          <Route path="regular-clash-management" element={<RegularClashManagement />} />
                          <Route path="billboard" element={<Billboard />} />
                          <Route path="artist-approvals" element={<ArtistApprovals />} />
                          <Route path="rhythm-management" element={<RhythmManagement />} />
                          <Route path="documentation" element={<Documentation />} />
                        </Routes>
                      </Layout>
                    </ArtistProvider>
                  </ProtectedRoute>
                }
              />

              {/* Catch-all → admin */}
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </Router>
        </AuthInitializer>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
