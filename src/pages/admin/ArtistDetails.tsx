import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useArtist } from '../../context/ArtistContext';
import Preloader from '../../components/ui/Preloader';

const ArtistDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    fetchArtistById, 
    selectedArtist, 
    loading, 
    error, 
    approveArtist, 
    rejectArtist 
  } = useArtist();

  // Fetch artist details when component mounts
  useEffect(() => {
    if (id) {
      fetchArtistById(id);
    }
  }, [id, fetchArtistById]);

  // Handle artist approval
  const handleApprove = async () => {
    if (id && selectedArtist) {
      const success = await approveArtist(id);
      if (success) {
        // Optionally navigate back to the artist list
        // navigate('/admin/artists');
      }
    }
  };

  // Handle artist rejection
  const handleReject = async () => {
    if (id && selectedArtist) {
      // In a real app, you'd have a modal to collect the reason
      const reason = "Administrative decision";
      const success = await rejectArtist(id, reason);
      if (success) {
        // Optionally navigate back to the artist list
        // navigate('/admin/artists');
      }
    }
  };

  // Navigate to edit page
  const handleEdit = () => {
    navigate(`/admin/artists/${id}/edit`);
  };

  // Navigate to analytics page
  const handleViewAnalytics = () => {
    navigate(`/admin/artists/${id}/analytics`);
  };

  // Go back to artists list
  const handleBack = () => {
    navigate('/admin/artists');
  };

  if (loading) {
    return <Preloader isVisible={true} text="Loading artist details..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 p-4 rounded-lg text-red-700 mb-4">
          Error: {error}
        </div>
        <button 
          onClick={handleBack}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Back to Artists
        </button>
      </div>
    );
  }

  if (!selectedArtist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 p-4 rounded-lg text-yellow-700 mb-4">
          Artist not found
        </div>
        <button 
          onClick={handleBack}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Back to Artists
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <motion.div 
        className="mb-6 flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{selectedArtist.name}</h1>
          <p className="text-gray-600">{selectedArtist.email}</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleBack}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Back
          </button>
          <button 
            onClick={handleEdit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Edit
          </button>
        </div>
      </motion.div>

      {/* Artist Card */}
      <motion.div 
        className="bg-white rounded-lg shadow-md overflow-hidden mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="p-6">
          <div className="flex flex-col md:flex-row">
            {/* Artist Image */}
            <div className="md:w-1/4 flex justify-center mb-4 md:mb-0">
              <img 
                src={selectedArtist.imageUrl || 'https://via.placeholder.com/200'} 
                alt={selectedArtist.name} 
                className="w-48 h-48 rounded-full object-cover"
              />
            </div>
            
            {/* Artist Info */}
            <div className="md:w-3/4 md:pl-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Genre</h3>
                  <p className="font-medium">{selectedArtist.genre}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    selectedArtist.status === 'active' ? 'bg-green-100 text-green-800' :
                    selectedArtist.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  } capitalize`}>
                    {selectedArtist.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Joined</h3>
                  <p>{selectedArtist.joinDate}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Content</h3>
                  <p>{selectedArtist.totalSongs} songs, {selectedArtist.totalAlbums} albums</p>
                </div>
              </div>
              
              {/* Actions based on artist status */}
              {selectedArtist.status === 'pending' && (
                <div className="mt-6 flex space-x-3">
                  <button 
                    onClick={handleApprove}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={handleReject}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              )}
              
              {/* Analytics button */}
              <div className="mt-6">
                <button 
                  onClick={handleViewAnalytics}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Additional Sections (like songs, albums, etc.) would go here */}
    </div>
  );
};

export default ArtistDetails; 