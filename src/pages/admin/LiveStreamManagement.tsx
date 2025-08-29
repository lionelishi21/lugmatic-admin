import React, { useState, useEffect } from 'react';
import {
  Video,
  Users,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  DollarSign,
  Play,
  Pause,
  Square,
  Settings,
  Edit,
  Trash2,
  Plus,
  Search,
  Calendar,
  BarChart3,
  XCircle
} from 'lucide-react';

interface LiveStream {
  id: string;
  title: string;
  artist: string;
  status: 'live' | 'ended' | 'scheduled' | 'paused';
  viewers: number;
  duration: string;
  startTime: string;
  endTime?: string;
  category: string;
  quality: string;
  revenue: number;
  likes: number;
  comments: number;
  shares: number;
}

const LiveStreamManagement: React.FC = () => {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Mock data
    const mockStreams: LiveStream[] = [
      {
        id: '1',
        title: 'Acoustic Night Session',
        artist: 'Sarah Johnson',
        status: 'live',
        viewers: 1245,
        duration: '2:34:15',
        startTime: '2024-01-15T20:00:00Z',
        category: 'Acoustic',
        quality: '1080p',
        revenue: 234.50,
        likes: 456,
        comments: 89,
        shares: 23
      },
      {
        id: '2',
        title: 'Electronic Music Mix',
        artist: 'DJ Mike',
        status: 'ended',
        viewers: 892,
        duration: '1:45:30',
        startTime: '2024-01-15T18:00:00Z',
        endTime: '2024-01-15T19:45:30Z',
        category: 'Electronic',
        quality: '720p',
        revenue: 156.75,
        likes: 234,
        comments: 45,
        shares: 12
      },
      {
        id: '3',
        title: 'Jazz Improvisation',
        artist: 'The Jazz Quartet',
        status: 'scheduled',
        viewers: 0,
        duration: '0:00:00',
        startTime: '2024-01-16T21:00:00Z',
        category: 'Jazz',
        quality: '1080p',
        revenue: 0,
        likes: 0,
        comments: 0,
        shares: 0
      }
    ];
    setStreams(mockStreams);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-100 text-red-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live':
        return <Play className="h-4 w-4 text-red-600" />;
      case 'ended':
        return <Square className="h-4 w-4 text-gray-600" />;
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-600" />;
      default:
        return <Video className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleStreamAction = (streamId: string, action: string) => {
    console.log(`Action ${action} on stream ${streamId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const liveStreams = streams.filter(s => s.status === 'live');
  const totalViewers = streams.reduce((sum, s) => sum + s.viewers, 0);
  const totalRevenue = streams.reduce((sum, s) => sum + s.revenue, 0);
  const totalLikes = streams.reduce((sum, s) => sum + s.likes, 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
          Live Stream Management
        </h1>
        <p className="text-gray-600 text-lg">
          Monitor and manage live streaming sessions, viewer engagement, and performance metrics.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Live Streams</p>
              <p className="text-3xl font-bold text-red-600">{liveStreams.length}</p>
            </div>
            <Video className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Viewers</p>
              <p className="text-3xl font-bold text-blue-600">{totalViewers.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Likes</p>
              <p className="text-3xl font-bold text-purple-600">{totalLikes.toLocaleString()}</p>
            </div>
            <Heart className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search streams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="live">Live</option>
            <option value="ended">Ended</option>
            <option value="scheduled">Scheduled</option>
            <option value="paused">Paused</option>
          </select>
        </div>
        <button
          onClick={() => setSelectedStream(null)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
        >
          <Plus className="h-5 w-5" />
          New Stream
        </button>
      </div>

      {/* Streams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {streams
          .filter(stream => 
            (statusFilter === 'all' || stream.status === statusFilter) &&
            stream.title.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((stream) => (
            <div
              key={stream.id}
              className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Stream Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(stream.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{stream.title}</h3>
                    <p className="text-sm text-gray-500">{stream.artist}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(stream.status)}`}>
                  {stream.status}
                </span>
              </div>

              {/* Stream Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-sm font-semibold text-gray-900">{stream.viewers.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Viewers</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <p className="text-sm font-semibold text-gray-900">{stream.duration}</p>
                  <p className="text-xs text-gray-500">Duration</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Heart className="h-5 w-5 text-red-600 mx-auto mb-1" />
                  <p className="text-sm font-semibold text-gray-900">{stream.likes.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Likes</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-sm font-semibold text-gray-900">{stream.comments}</p>
                  <p className="text-xs text-gray-500">Comments</p>
                </div>
              </div>

              {/* Stream Details */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Category:</span>
                  <span className="font-medium">{stream.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Quality:</span>
                  <span className="font-medium">{stream.quality}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Revenue:</span>
                  <span className="font-medium text-green-600">${stream.revenue.toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between">
                <button
                  onClick={() => setSelectedStream(stream)}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  View
                </button>
                <button
                  onClick={() => handleStreamAction(stream.id, 'edit')}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleStreamAction(stream.id, 'delete')}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Stream Analytics</h3>
          <p className="text-gray-600 text-sm mb-4">
            View detailed analytics and performance metrics for all streams.
          </p>
          <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
            <BarChart3 className="h-4 w-4 inline mr-2" />
            View Analytics
          </button>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Schedule Stream</h3>
          <p className="text-gray-600 text-sm mb-4">
            Schedule upcoming live streams with advanced settings.
          </p>
          <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
            <Calendar className="h-4 w-4 inline mr-2" />
            Schedule
          </button>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Stream Settings</h3>
          <p className="text-gray-600 text-sm mb-4">
            Configure stream quality, encoding, and platform settings.
          </p>
          <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
            <Settings className="h-4 w-4 inline mr-2" />
            Configure
          </button>
        </div>
      </div>

      {/* Stream Details Modal */}
      {selectedStream && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Stream Details</h2>
                <button
                  onClick={() => setSelectedStream(null)}
                  className="text-white hover:text-gray-200"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedStream.title}</h3>
                  <p className="text-gray-600 mb-4">by {selectedStream.artist}</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedStream.status)}`}>
                        {selectedStream.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-medium">{selectedStream.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Quality:</span>
                      <span className="font-medium">{selectedStream.quality}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Start Time:</span>
                      <span className="font-medium">{new Date(selectedStream.startTime).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-lg font-bold text-blue-600">{selectedStream.viewers.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Viewers</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <p className="text-lg font-bold text-green-600">${selectedStream.revenue.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Revenue</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <Heart className="h-6 w-6 text-red-600 mx-auto mb-2" />
                      <p className="text-lg font-bold text-red-600">{selectedStream.likes.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Likes</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <MessageCircle className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <p className="text-lg font-bold text-purple-600">{selectedStream.comments}</p>
                      <p className="text-xs text-gray-500">Comments</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedStream(null)}
                  className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleStreamAction(selectedStream.id, 'edit')}
                  className="px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Edit Stream
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveStreamManagement; 