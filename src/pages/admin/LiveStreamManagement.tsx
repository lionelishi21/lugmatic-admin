import React, { useState, useEffect, useMemo } from 'react';
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
  Pencil,
  Trash2,
  Plus,
  Search,
  Calendar,
  BarChart3,
  X,
  MoreVertical,
  Radio,
  Share2,
  ArrowUpRight,
  Signal
} from 'lucide-react';

interface LiveStream {
  id: string;
  title: string;
  artist: string;
  artistAvatar?: string;
  status: 'live' | 'ended' | 'scheduled' | 'paused';
  viewers: number;
  peakViewers: number;
  duration: string;
  startTime: string;
  endTime?: string;
  category: string;
  quality: string;
  revenue: number;
  likes: number;
  comments: number;
  shares: number;
  thumbnail?: string;
}

const LiveStreamManagement: React.FC = () => {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const mockStreams: LiveStream[] = [
      {
        id: '1',
        title: 'Acoustic Night Session',
        artist: 'Sarah Johnson',
        status: 'live',
        viewers: 1245,
        peakViewers: 1580,
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
        peakViewers: 1120,
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
        peakViewers: 0,
        duration: '0:00:00',
        startTime: '2024-01-16T21:00:00Z',
        category: 'Jazz',
        quality: '1080p',
        revenue: 0,
        likes: 0,
        comments: 0,
        shares: 0
      },
      {
        id: '4',
        title: 'Hip-Hop Freestyle Friday',
        artist: 'MC Flow',
        status: 'live',
        viewers: 2310,
        peakViewers: 2890,
        duration: '1:12:45',
        startTime: '2024-01-15T21:30:00Z',
        category: 'Hip-Hop',
        quality: '1080p',
        revenue: 412.00,
        likes: 789,
        comments: 156,
        shares: 67
      },
      {
        id: '5',
        title: 'Chill Lo-Fi Beats',
        artist: 'LofiGirl',
        status: 'paused',
        viewers: 534,
        peakViewers: 890,
        duration: '3:20:10',
        startTime: '2024-01-15T16:00:00Z',
        category: 'Lo-Fi',
        quality: '720p',
        revenue: 89.25,
        likes: 312,
        comments: 28,
        shares: 15
      },
      {
        id: '6',
        title: 'Classical Piano Recital',
        artist: 'Elena Petrova',
        status: 'scheduled',
        viewers: 0,
        peakViewers: 0,
        duration: '0:00:00',
        startTime: '2024-01-17T19:00:00Z',
        category: 'Classical',
        quality: '4K',
        revenue: 0,
        likes: 0,
        comments: 0,
        shares: 0
      }
    ];
    setStreams(mockStreams);
    setLoading(false);
  }, []);

  const filteredStreams = useMemo(() => {
    return streams.filter(stream =>
      (statusFilter === 'all' || stream.status === statusFilter) &&
      (stream.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       stream.artist.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [streams, statusFilter, searchTerm]);

  const liveCount = streams.filter(s => s.status === 'live').length;
  const scheduledCount = streams.filter(s => s.status === 'scheduled').length;
  const totalViewers = streams.reduce((sum, s) => sum + s.viewers, 0);
  const totalRevenue = streams.reduce((sum, s) => sum + s.revenue, 0);

  const statusTabs = [
    { key: 'all', label: 'All', count: streams.length },
    { key: 'live', label: 'Live', count: liveCount },
    { key: 'scheduled', label: 'Scheduled', count: scheduledCount },
    { key: 'ended', label: 'Ended', count: streams.filter(s => s.status === 'ended').length },
    { key: 'paused', label: 'Paused', count: streams.filter(s => s.status === 'paused').length },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            LIVE
          </span>
        );
      case 'ended':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            <Square className="h-3 w-3" />
            Ended
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
            <Clock className="h-3 w-3" />
            Scheduled
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600">
            <Pause className="h-3 w-3" />
            Paused
          </span>
        );
      default:
        return null;
    }
  };

  const getArtistInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleStreamAction = (streamId: string, action: string) => {
    console.log(`Action ${action} on stream ${streamId}`);
    setOpenMenuId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-200 border-t-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Stream Management</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor and manage live streaming sessions</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm">
          <Plus className="h-4 w-4" />
          New Stream
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
              <Radio className="h-4.5 w-4.5 text-red-500" />
            </div>
            {liveCount > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium text-red-500">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Active
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900">{liveCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Live Now</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="h-4.5 w-4.5 text-blue-500" />
            </div>
            <span className="flex items-center gap-0.5 text-xs font-medium text-green-600">
              <ArrowUpRight className="h-3 w-3" />
              12%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalViewers.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Viewers</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
              <DollarSign className="h-4.5 w-4.5 text-green-500" />
            </div>
            <span className="flex items-center gap-0.5 text-xs font-medium text-green-600">
              <ArrowUpRight className="h-3 w-3" />
              8%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Revenue</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
              <Calendar className="h-4.5 w-4.5 text-purple-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{scheduledCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Scheduled</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-1">
            {statusTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === tab.key
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 text-xs ${
                  statusFilter === tab.key ? 'text-green-500' : 'text-gray-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search streams or artists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 text-sm bg-gray-50/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-400 outline-none transition-all"
            />
          </div>
        </div>

        {/* Streams Grid */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredStreams.length === 0 ? (
            <div className="col-span-full py-16 text-center">
              <Video className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No streams found</p>
            </div>
          ) : (
            filteredStreams.map((stream) => (
              <div
                key={stream.id}
                className="group relative bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-md transition-all duration-200"
              >
                {/* Thumbnail area */}
                <div className={`relative h-36 rounded-t-xl flex items-center justify-center ${
                  stream.status === 'live'
                    ? 'bg-gradient-to-br from-gray-900 to-gray-800'
                    : stream.status === 'scheduled'
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50'
                    : stream.status === 'paused'
                    ? 'bg-gradient-to-br from-amber-50 to-orange-50'
                    : 'bg-gradient-to-br from-gray-50 to-gray-100'
                }`}>
                  {stream.status === 'live' ? (
                    <>
                      <Signal className="h-10 w-10 text-white/20" />
                      <div className="absolute top-3 left-3">
                        {getStatusBadge(stream.status)}
                      </div>
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40 text-white text-xs">
                        <Eye className="h-3 w-3" />
                        {stream.viewers.toLocaleString()}
                      </div>
                      <div className="absolute bottom-3 left-3 text-white/70 text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {stream.duration}
                      </div>
                    </>
                  ) : stream.status === 'scheduled' ? (
                    <>
                      <Calendar className="h-10 w-10 text-blue-200" />
                      <div className="absolute top-3 left-3">
                        {getStatusBadge(stream.status)}
                      </div>
                      <div className="absolute bottom-3 left-3 text-blue-400 text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(stream.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </>
                  ) : stream.status === 'paused' ? (
                    <>
                      <Pause className="h-10 w-10 text-amber-200" />
                      <div className="absolute top-3 left-3">
                        {getStatusBadge(stream.status)}
                      </div>
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-100 text-amber-600 text-xs">
                        <Eye className="h-3 w-3" />
                        {stream.viewers.toLocaleString()}
                      </div>
                    </>
                  ) : (
                    <>
                      <Video className="h-10 w-10 text-gray-200" />
                      <div className="absolute top-3 left-3">
                        {getStatusBadge(stream.status)}
                      </div>
                      <div className="absolute bottom-3 left-3 text-gray-400 text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {stream.duration}
                      </div>
                    </>
                  )}

                  {/* Quality badge */}
                  <div className="absolute bottom-3 right-3">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      stream.status === 'live'
                        ? 'bg-black/40 text-white/80'
                        : 'bg-white/80 text-gray-500'
                    }`}>
                      {stream.quality}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-white">{getArtistInitials(stream.artist)}</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{stream.title}</h3>
                        <p className="text-xs text-gray-500">{stream.artist}</p>
                      </div>
                    </div>
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === stream.id ? null : stream.id)}
                        className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {openMenuId === stream.id && (
                        <div className="absolute right-0 top-7 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                          <button
                            onClick={() => { setSelectedStream(stream); setOpenMenuId(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                          >
                            <Eye className="h-3.5 w-3.5" /> View Details
                          </button>
                          <button
                            onClick={() => handleStreamAction(stream.id, 'edit')}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <hr className="my-1 border-gray-100" />
                          <button
                            onClick={() => handleStreamAction(stream.id, 'delete')}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Inline category tag */}
                  <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[11px] font-medium mb-3">
                    {stream.category}
                  </span>

                  {/* Mini stats row */}
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5" />
                      {stream.likes.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5" />
                      {stream.comments}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="h-3.5 w-3.5" />
                      {stream.shares}
                    </span>
                    {stream.revenue > 0 && (
                      <span className="ml-auto font-semibold text-green-600">
                        ${stream.revenue.toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-green-200 hover:shadow-md transition-all group text-left">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
            <BarChart3 className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Stream Analytics</p>
            <p className="text-xs text-gray-500">Performance metrics & insights</p>
          </div>
        </button>

        <button className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-green-200 hover:shadow-md transition-all group text-left">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Schedule Stream</p>
            <p className="text-xs text-gray-500">Plan upcoming live sessions</p>
          </div>
        </button>

        <button className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-green-200 hover:shadow-md transition-all group text-left">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
            <Settings className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Stream Settings</p>
            <p className="text-xs text-gray-500">Quality, encoding & platform config</p>
          </div>
        </button>
      </div>

      {/* Stream Details Modal */}
      {selectedStream && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelectedStream(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Stream Details</h2>
                <p className="text-xs text-gray-500 mt-0.5">View stream information and metrics</p>
              </div>
              <button
                onClick={() => setSelectedStream(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5">
              {/* Stream info header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{getArtistInitials(selectedStream.artist)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{selectedStream.title}</h3>
                  <p className="text-sm text-gray-500">{selectedStream.artist}</p>
                </div>
                {getStatusBadge(selectedStream.status)}
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-3 bg-gray-50 rounded-xl text-center">
                  <Users className="h-5 w-5 text-blue-500 mx-auto mb-1.5" />
                  <p className="text-lg font-bold text-gray-900">{selectedStream.viewers.toLocaleString()}</p>
                  <p className="text-[11px] text-gray-500">Current Viewers</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl text-center">
                  <DollarSign className="h-5 w-5 text-green-500 mx-auto mb-1.5" />
                  <p className="text-lg font-bold text-gray-900">${selectedStream.revenue.toFixed(2)}</p>
                  <p className="text-[11px] text-gray-500">Revenue</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl text-center">
                  <Heart className="h-5 w-5 text-red-500 mx-auto mb-1.5" />
                  <p className="text-lg font-bold text-gray-900">{selectedStream.likes.toLocaleString()}</p>
                  <p className="text-[11px] text-gray-500">Likes</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl text-center">
                  <MessageCircle className="h-5 w-5 text-purple-500 mx-auto mb-1.5" />
                  <p className="text-lg font-bold text-gray-900">{selectedStream.comments}</p>
                  <p className="text-[11px] text-gray-500">Comments</p>
                </div>
              </div>

              {/* Info rows */}
              <div className="space-y-2.5 mb-5">
                {[
                  { label: 'Category', value: selectedStream.category },
                  { label: 'Quality', value: selectedStream.quality },
                  { label: 'Duration', value: selectedStream.duration },
                  { label: 'Peak Viewers', value: selectedStream.peakViewers.toLocaleString() },
                  { label: 'Started', value: new Date(selectedStream.startTime).toLocaleString() },
                  { label: 'Shares', value: selectedStream.shares.toString() },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-1.5 text-sm">
                    <span className="text-gray-500">{row.label}</span>
                    <span className="font-medium text-gray-900">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setSelectedStream(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleStreamAction(selectedStream.id, 'edit')}
                  className="px-5 py-2 text-sm bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                  Edit Stream
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click-away listener for menus */}
      {openMenuId && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
      )}
    </div>
  );
};

export default LiveStreamManagement;
