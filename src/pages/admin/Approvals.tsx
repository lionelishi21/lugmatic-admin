import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Music2, Search, Filter, Play, Pause, ChevronDown, CheckCircle, XCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface Track {
  id: string;
  title: string;
  description: string;
  genre: string;
  cover_url: string;
  audio_url: string;
  created_at: string;
  artist: {
    id: string;
    name: string;
    profile_image: string;
  };
}

export default function Approvals() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audioElements] = useState<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    fetchPendingTracks();
  }, []);

  useEffect(() => {
    // Cleanup audio elements on unmount
    return () => {
      Object.values(audioElements).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);

  const fetchPendingTracks = async () => {
    // Simulate fetching tracks from a different source
    const mockTracks = [
      // Add mock tracks here
    ];
    setTracks(mockTracks);
    setIsLoading(false);
  };

  const handlePlayPause = (trackId: string, audioUrl: string) => {
    if (!audioElements[trackId]) {
      audioElements[trackId] = new Audio(audioUrl);
      audioElements[trackId].addEventListener('ended', () => {
        setCurrentlyPlaying(null);
      });
    }

    if (currentlyPlaying === trackId) {
      audioElements[trackId].pause();
      setCurrentlyPlaying(null);
    } else {
      // Pause any currently playing audio
      if (currentlyPlaying) {
        audioElements[currentlyPlaying].pause();
      }
      audioElements[trackId].play();
      setCurrentlyPlaying(trackId);
    }
  };

  const handleApproval = async (trackId: string, approved: boolean) => {
    // Simulate updating track status
    // Assuming the tracks array is updated elsewhere or in a different context
    toast.success(`Track ${approved ? 'approved' : 'rejected'} successfully`);
  };

  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         track.artist.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = genreFilter === 'all' || track.genre === genreFilter;
    return matchesSearch && matchesGenre;
  });

  const uniqueGenres = ['all', ...new Set(tracks.map(track => track.genre))];

  return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Track Approvals</h1>
            <div className="flex space-x-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tracks or artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div className="relative">
                <select
                  value={genreFilter}
                  onChange={(e) => setGenreFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-md pl-4 pr-10 py-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {uniqueGenres.map(genre => (
                    <option key={genre} value={genre}>
                      {genre.charAt(0).toUpperCase() + genre.slice(1)}
                    </option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <Music2 className="h-8 w-8 text-purple-600 animate-pulse mx-auto mb-4" />
              <p className="text-gray-500">Loading tracks...</p>
            </div>
          ) : filteredTracks.length === 0 ? (
            <div className="text-center py-12">
              <Music2 className="h-8 w-8 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No pending tracks found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredTracks.map((track) => (
                <div key={track.id} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                    {/* Track Cover & Controls */}
                    <div className="relative group w-40 h-40 flex-shrink-0">
                      <img
                        src={track.cover_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'}
                        alt={track.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handlePlayPause(track.id, track.audio_url)}
                        className="absolute inset-0 bg-black bg-opacity-50 group-hover:bg-opacity-75 rounded-lg flex items-center justify-center transition-all"
                      >
                        {currentlyPlaying === track.id ? (
                          <Pause className="h-12 w-12 text-white" />
                        ) : (
                          <Play className="h-12 w-12 text-white" />
                        )}
                      </button>
                    </div>

                    {/* Track Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{track.title}</h3>
                          <div className="flex items-center mt-2">
                            <img
                              src={track.artist.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(track.artist.name)}&background=random`}
                              alt={track.artist.name}
                              className="h-6 w-6 rounded-full"
                            />
                            <span className="ml-2 text-sm text-gray-600">{track.artist.name}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproval(track.id, true)}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproval(track.id, false)}
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </button>
                        </div>
                      </div>

                      <p className="mt-2 text-sm text-gray-600">{track.description}</p>

                      <div className="mt-4 flex items-center space-x-4">
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                          {track.genre}
                        </span>
                        <span className="text-sm text-gray-500">
                          Submitted {formatDistanceToNow(new Date(track.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );
}