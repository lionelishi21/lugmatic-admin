import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useArtistContext } from '../../context/ArtistContext';
import Preloader from '../../components/ui/Preloader';

const ArtistDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    fetchArtistById, 
    fetchArtistAlbums,
    fetchArtistSongs,
    selectedArtist, 
    albums,
    songs,
    loading, 
    error, 
    albumsLoading,
    songsLoading,
    albumsError,
    songsError,
    approveArtist, 
    rejectArtist,
    clearSelectedArtist,
    clearDiscography 
  } = useArtistContext();

  // Fetch artist details when component mounts
  useEffect(() => {
    if (id) {
      fetchArtistById(id);
      fetchArtistAlbums(id);
      fetchArtistSongs(id);
    }

    return () => {
      clearSelectedArtist();
      clearDiscography();
    };
  }, [id, fetchArtistById, fetchArtistAlbums, fetchArtistSongs, clearSelectedArtist, clearDiscography]);

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

  if (loading && !selectedArtist) {
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

  const isLoadingAll =
    loading || albumsLoading || songsLoading;
  const hasError = error || albumsError || songsError;

  const artistName =
    selectedArtist?.name ||
    selectedArtist?.fullName ||
    [selectedArtist?.firstName, selectedArtist?.lastName].filter(Boolean).join(' ') ||
    '';

  if (!isLoadingAll && !selectedArtist) {
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

  const displayName =
    selectedArtist.name ||
    selectedArtist.fullName ||
    [selectedArtist.firstName, selectedArtist.lastName].filter(Boolean).join(' ') ||
    'Unknown Artist';
  const displayEmail = selectedArtist.email || (selectedArtist as any).contactEmail || '—';
  const avatarSrc =
    (selectedArtist as any).imageUrl ||
    selectedArtist.profilePicture ||
    (selectedArtist.image as string) ||
    'https://placehold.co/200x200/gray/white?text=Artist';
  const statusValue =
    selectedArtist.status ||
    (selectedArtist.isApproved ? 'active' : selectedArtist.isVerified ? 'verified' : 'pending');
  const normalizedStatus = (statusValue || '').toLowerCase();
  const statusClass =
    normalizedStatus === 'active' || normalizedStatus === 'approved'
      ? 'bg-green-100 text-green-800'
      : normalizedStatus === 'pending'
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800';
  const joinDate = selectedArtist.createdAt
    ? new Date(selectedArtist.createdAt).toLocaleDateString()
    : '—';
  const genres =
    Array.isArray(selectedArtist.genres) && selectedArtist.genres.length > 0
      ? selectedArtist.genres
      : Array.isArray((selectedArtist as any).favoriteGenres)
        ? ((selectedArtist as any).favoriteGenres as string[])
        : [];
  const canReviewArtist =
    (selectedArtist.status && selectedArtist.status.toLowerCase() === 'pending') ||
    selectedArtist.isApproved === false;

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
          <h1 className="text-3xl font-bold text-gray-800">{displayName}</h1>
          <p className="text-gray-600">{displayEmail}</p>
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
                src={avatarSrc} 
                alt={displayName} 
                className="w-48 h-48 rounded-full object-cover"
              />
            </div>
            
            {/* Artist Info */}
            <div className="md:w-3/4 md:pl-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Genres</h3>
                  <p className="font-medium">
                    {genres.length > 0 ? genres.join(', ') : '—'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${statusClass} capitalize`}>
                    {statusValue}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Joined</h3>
                  <p>{joinDate}</p>
                </div>
              </div>
              
              {/* Actions based on artist status */}
              {canReviewArtist && (
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

      {/* Albums */}
      <motion.div
        className="bg-white rounded-lg shadow-md overflow-hidden mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Albums</h2>
            {albumsLoading && <span className="text-sm text-gray-500">Loading albums...</span>}
          </div>
          {albumsError && (
            <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4">
              {albumsError}
            </div>
          )}
          {!albumsLoading && !albumsError && albums.length === 0 && (
            <p className="text-gray-500">No albums found for this artist.</p>
          )}
          {!albumsLoading && !albumsError && albums.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {albums.map((album) => (
                <div key={album._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    {(album.cover || (album as any).coverArt) && (
                      <img
                        src={album.cover || (album as any).coverArt}
                        alt={album.title}
                        className="w-16 h-16 rounded object-cover"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{album.title}</h3>
                      <p className="text-sm text-gray-500">
                        Released:{' '}
                        {album.releaseDate
                          ? new Date(album.releaseDate).toLocaleDateString()
                          : '—'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Tracks:{' '}
                        {Array.isArray(album.tracks)
                          ? album.tracks.length
                          : (album as any).trackCount ?? 0}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Songs */}
      <motion.div
        className="bg-white rounded-lg shadow-md overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Songs</h2>
            {songsLoading && <span className="text-sm text-gray-500">Loading songs...</span>}
          </div>
          {songsError && (
            <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4">
              {songsError}
            </div>
          )}
          {!songsLoading && !songsError && songs.length === 0 && (
            <p className="text-gray-500">No songs found for this artist.</p>
          )}
          {!songsLoading && !songsError && songs.length > 0 && (
            <div className="space-y-4">
              {songs.map((song) => (
                <div key={song._id} className="flex items-center justify-between border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    {(song.coverArt || (song as any).cover) && (
                      <img
                        src={song.coverArt || (song as any).cover}
                        alt={song.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{song.title}</h3>
                      <p className="text-sm text-gray-500">
                        Duration:{' '}
                        {song.duration
                          ? `${Math.floor(song.duration / 60)}:${(song.duration % 60)
                              .toString()
                              .padStart(2, '0')}`
                          : (song as any).formattedDuration || '—'}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {song.album ? `Album: ${song.album}` : 'Single'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ArtistDetails; 