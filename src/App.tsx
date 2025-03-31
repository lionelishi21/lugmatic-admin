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

function App() {
  return (
    <>
      <Router>
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            <Route path="/artist/*" element={<Layout><Routes>
              <Route index element={<ArtistDashboard />} />
              <Route path="upload" element={<Upload />} />
              <Route path="live" element={<Live />} />
              <Route path="gifts" element={<Gifts />} />
              <Route path="earnings" element={<Earnings />} />
            </Routes></Layout>} />
            
            <Route path="/admin/*" element={<Layout><Routes>
              <Route index element={<AdminDashboard />} />
              <Route path="approvals" element={<Approvals />} />
              <Route path="artist-management" element={<ArtistManagement />} />
              <Route path="artist-details/:id" element={<ArtistDetails />} />
              <Route path="user-management" element={<UserManagement />} />
              <Route path="financial-management" element={<FinancialManagement />} />
              <Route path="live-stream-management" element={<LiveStreamManagement />} />
              <Route path="album-management" element={<AlbumManagement />} />
              <Route path="song-management" element={<SongManagement />} />
              <Route path="genre-management" element={<GenreManagement />} /> 
            </Routes></Layout>} />

        </Routes>
      </Router>
    </>
  )
}

export default App
