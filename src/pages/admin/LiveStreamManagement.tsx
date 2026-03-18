import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Signal,
  AlertCircle
} from 'lucide-react';
import {
  LiveKitRoom,
  VideoTrack,
  AudioTrack,
  useTracks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';
import toast from 'react-hot-toast';

import {
  adminGetAllStreams,
  getStreamToken,
  type LiveStream
} from '../../services/liveStreamService';
import { getFullImageUrl } from '../../services/api';

// ─── Monitoring Modal ────────────────────────────────────────────────────────

interface MonitoringModalProps {
  stream: LiveStream;
  onClose: () => void;
}

const MonitoringModal: React.FC<MonitoringModalProps> = ({ stream, onClose }) => {
  const [tokenData, setTokenData] = useState<{ token: string; url: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await getStreamToken(stream._id);
        setTokenData({ token: res.data.token, url: res.data.url });
      } catch (err) {
        console.error('Failed to get monitoring token:', err);
        toast.error('Failed to join stream for monitoring');
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, [stream._id, onClose]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60]" onClick={onClose}>
      <div className="bg-gray-950 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 aspect-video relative overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              MONITORING
            </div>
            <h2 className="text-white font-bold truncate max-w-[300px]">{stream.title}</h2>
            <span className="text-white/40 text-xs">•</span>
            <span className="text-white/60 text-xs">{stream.host.name}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-white">
            <Radio className="h-12 w-12 text-green-500 animate-pulse mb-4" />
            <p className="text-sm font-medium">Connecting to stream...</p>
          </div>
        ) : tokenData ? (
          <LiveKitRoom
            serverUrl={tokenData.url}
            token={tokenData.token}
            connect={true}
            className="h-full w-full"
          >
            <StreamVideoRenderer />
          </LiveKitRoom>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-white p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="font-bold">Connection Failed</p>
            <p className="text-sm text-white/60 mt-2">Could not establish connection to the LiveKit server.</p>
          </div>
        )}
      </div>
    </div>
  );
};

function StreamVideoRenderer() {
  const tracks = useTracks(
    [Track.Source.Camera, Track.Source.ScreenShare, Track.Source.Microphone],
    { onlySubscribed: true }
  );

  const videoTrack = tracks.find(
    (t) => t.source === Track.Source.Camera || t.source === Track.Source.ScreenShare
  );

  const audioTracks = tracks.filter((t) => t.source === Track.Source.Microphone);

  if (!videoTrack) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-900">
        <Video className="h-16 w-16 text-white/10 mb-4" />
        <p className="text-white/40 text-sm">Waiting for video signal...</p>
        {audioTracks.map((t, i) => <AudioTrack key={i} trackRef={t} />)}
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-black relative">
      <VideoTrack trackRef={videoTrack} className="h-full w-full object-contain" />
      {audioTracks.map((t, i) => <AudioTrack key={i} trackRef={t} />)}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

const LiveStreamManagement: React.FC = () => {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [monitoringStream, setMonitoringStream] = useState<LiveStream | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });

  const fetchStreams = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGetAllStreams({
        status: statusFilter,
        search: searchTerm,
        page: pagination.page,
        limit: pagination.limit
      });

      if (res.success) {
        setStreams(res.data);
        if (res.pagination) {
          setPagination(prev => ({
            ...prev,
            total: res.pagination?.total || 0,
            pages: res.pagination?.pages || 1
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching live streams:', err);
      toast.error('Failed to load live streams');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchStreams();
  }, [fetchStreams]);

  const liveCount = useMemo(() => streams.filter(s => s.status === 'live').length, [streams]);
  const scheduledCount = useMemo(() => streams.filter(s => s.status === 'scheduled').length, [streams]);
  const totalViewers = useMemo(() => streams.reduce((sum, s) => sum + (s.currentViewers || 0), 0), [streams]);
  const totalRevenue = useMemo(() => streams.reduce((sum, s) => sum + (s.totalGiftValue || 0), 0), [streams]);

  const statusTabs = [
    { key: 'all', label: 'All', count: pagination.total },
    { key: 'live', label: 'Live', count: liveCount },
    { key: 'scheduled', label: 'Scheduled', count: scheduledCount },
    { key: 'ended', label: 'Ended', count: streams.filter(s => s.status === 'ended').length },
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
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600">
            <X className="h-3 w-3" />
            Cancelled
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

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '00:00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Stream Management</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor and manage live streaming sessions</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fetchStreams()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
          >
            Refresh
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm">
            <Plus className="h-4 w-4" />
            New Stream
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
              <Radio className="h-4.5 w-4.5 text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{liveCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Live Now</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="h-4.5 w-4.5 text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalViewers.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Viewers</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
              <DollarSign className="h-4.5 w-4.5 text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(0)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Stream Revenue</p>
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
                onClick={() => { setStatusFilter(tab.key); setPagination(prev => ({ ...prev, page: 1 })); }}
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
              onChange={(e) => { setSearchTerm(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
              className="pl-9 pr-4 py-2 w-64 text-sm bg-gray-50/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-400 outline-none transition-all"
            />
          </div>
        </div>

        {/* Streams Grid */}
        <div className="p-5">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-200 border-t-green-600"></div>
            </div>
          ) : streams.length === 0 ? (
            <div className="py-16 text-center">
              <Video className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No streams found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {streams.map((stream) => (
                <div
                  key={stream._id}
                  className="group relative bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-md transition-all duration-200"
                >
                  {/* Thumbnail area */}
                  <div className={`relative h-40 rounded-t-xl overflow-hidden`}>
                    {stream.coverImage ? (
                      <img
                        src={getFullImageUrl(stream.coverImage)}
                        alt={stream.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${
                        stream.status === 'live' ? 'bg-gray-900' : 'bg-gray-100'
                      }`}>
                        <Radio className={`h-10 w-10 ${stream.status === 'live' ? 'text-white/20' : 'text-gray-200'}`} />
                      </div>
                    )}

                    <div className="absolute top-3 left-3">
                      {getStatusBadge(stream.status)}
                    </div>

                    {stream.status === 'live' && (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40 text-white text-xs">
                        <Eye className="h-3 w-3" />
                        {(stream.currentViewers || 0).toLocaleString()}
                      </div>
                    )}

                    {stream.status === 'live' && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                        <button
                          onClick={() => setMonitoringStream(stream)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full text-xs font-bold hover:bg-green-700 transform scale-90 group-hover:scale-100 transition-all shadow-lg"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          MONITOR LIVE
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                          {stream.host.image ? (
                            <img src={getFullImageUrl(stream.host.image)} alt={stream.host.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-green-500 text-white text-[10px] font-bold">
                              {getArtistInitials(stream.host.name)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">{stream.title}</h3>
                          <p className="text-xs text-gray-400 font-medium">@{stream.host.name.replace(/\s+/g, '').toLowerCase()}</p>
                        </div>
                      </div>
                      <div className="relative flex-shrink-0">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === stream._id ? null : stream._id)}
                          className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {openMenuId === stream._id && (
                          <div className="absolute right-0 top-7 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                            <button
                              onClick={() => { setSelectedStream(stream); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                            >
                              <Eye className="h-3.5 w-3.5" /> View Analytics
                            </button>
                            {stream.status === 'live' && (
                              <button
                                onClick={() => { setMonitoringStream(stream); setOpenMenuId(null); }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-green-600 hover:bg-green-50"
                              >
                                <Play className="h-3.5 w-3.5" /> Open Monitor
                              </button>
                            )}
                            <button
                              onClick={() => handleStreamAction(stream._id, 'edit')}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                            >
                              <Pencil className="h-3.5 w-3.5" /> Edit Settings
                            </button>
                            <hr className="my-1 border-gray-100" />
                            <button
                              onClick={() => handleStreamAction(stream._id, 'delete')}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Stop / End Stream
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mini stats row */}
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {(stream.totalViewers || 0).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" />
                        {(stream.totalGiftValue || 0).toFixed(0)}
                      </span>
                      <span className="flex items-center gap-1 ml-auto">
                        <Clock className="h-3.5 w-3.5" />
                        {stream.status === 'live' ? formatDuration(stream.duration) : stream.status === 'scheduled' ? 'Scheduled' : 'Ended'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> streams
            </p>
            <div className="flex gap-2">
              <button
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stream Details Modal */}
      {selectedStream && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelectedStream(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Stream Analytics</h2>
                <p className="text-xs text-gray-500 mt-0.5">Performance insights for this session</p>
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
                <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-100">
                  {selectedStream.host.image ? (
                    <img src={getFullImageUrl(selectedStream.host.image)} alt={selectedStream.host.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-green-500 text-white font-bold">
                      {getArtistInitials(selectedStream.host.name)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{selectedStream.title}</h3>
                  <p className="text-sm text-gray-500">Live with {selectedStream.host.name}</p>
                </div>
                {getStatusBadge(selectedStream.status)}
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-3 bg-gray-50 rounded-xl text-center">
                  <Users className="h-5 w-5 text-blue-500 mx-auto mb-1.5" />
                  <p className="text-lg font-bold text-gray-900">{(selectedStream.totalViewers || 0).toLocaleString()}</p>
                  <p className="text-[11px] text-gray-500">Total Viewers</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl text-center">
                  <DollarSign className="h-5 w-5 text-green-500 mx-auto mb-1.5" />
                  <p className="text-lg font-bold text-gray-900">${(selectedStream.totalGiftValue || 0).toFixed(2)}</p>
                  <p className="text-[11px] text-gray-500">Revenue</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl text-center">
                  <Heart className="h-5 w-5 text-red-500 mx-auto mb-1.5" />
                  <p className="text-lg font-bold text-gray-900">{(selectedStream.peakViewers || 0).toLocaleString()}</p>
                  <p className="text-[11px] text-gray-500">Peak Viewers</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl text-center">
                  <MessageCircle className="h-5 w-5 text-purple-500 mx-auto mb-1.5" />
                  <p className="text-lg font-bold text-gray-900">{selectedStream.totalGiftsReceived || 0}</p>
                  <p className="text-[11px] text-gray-500">Gifts Received</p>
                </div>
              </div>

              {/* Info rows */}
              <div className="space-y-2.5 mb-5">
                {[
                  { label: 'Category', value: selectedStream.category },
                  { label: 'Stream ID', value: selectedStream._id.slice(-8).toUpperCase() },
                  { label: 'Duration', value: formatDuration(selectedStream.duration) },
                  { label: 'Started At', value: selectedStream.actualStartTime ? new Date(selectedStream.actualStartTime).toLocaleString() : 'Not started' },
                  { label: 'Scheduled For', value: selectedStream.scheduledStartTime ? new Date(selectedStream.scheduledStartTime).toLocaleString() : 'Immediate' },
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
                {selectedStream.status === 'live' && (
                  <button
                    onClick={() => { setMonitoringStream(selectedStream); setSelectedStream(null); }}
                    className="px-5 py-2 text-sm bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                  >
                    Watch Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monitoring Modal */}
      {monitoringStream && (
        <MonitoringModal
          stream={monitoringStream}
          onClose={() => setMonitoringStream(null)}
        />
      )}

      {/* Click-away listener for menus */}
      {openMenuId && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
      )}
    </div>
  );
};

export default LiveStreamManagement;
