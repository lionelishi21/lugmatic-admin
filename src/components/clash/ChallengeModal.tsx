import { useState, useEffect } from 'react';
import { X, Search, Swords, Loader2, Users } from 'lucide-react';
import { getActiveStreams, type LiveStream } from '../../services/liveStreamService';
import clashService from '../../services/clashService';
import toast from 'react-hot-toast';

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStreamId: string;
}

export default function ChallengeModal({ isOpen, onClose, currentStreamId }: ChallengeModalProps) {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [invitingId, setInvitingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchLiveStreams();
    }
  }, [isOpen]);

  const fetchLiveStreams = async () => {
    setLoading(true);
    try {
      const res = await getActiveStreams();
      // Filter out own stream
      const otherStreams = (res.data as LiveStream[]).filter(s => s._id !== currentStreamId);
      setStreams(otherStreams);
    } catch (error) {
      console.error('Error fetching live streams:', error);
      toast.error('Failed to load active streams');
    } finally {
      setLoading(false);
    }
  };

  const handleChallenge = async (artistId: string) => {
    setInvitingId(artistId);
    try {
      await clashService.inviteToClash(artistId);
      toast.success('Challenge sent! Waiting for response...');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send challenge');
    } finally {
      setInvitingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Swords className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Challenge an Artist</h3>
              <p className="text-xs text-gray-500">Select a live artist to start a Lyrical War</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
              <p className="text-sm text-gray-500">Searching for live artists...</p>
            </div>
          ) : streams.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Search className="h-8 w-8 text-gray-300" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-900">No other artists are live</p>
                <p className="text-xs text-gray-500 max-w-[240px] mx-auto">
                  Try again later or share your stream to invite friends!
                </p>
              </div>
              <button 
                onClick={fetchLiveStreams}
                className="text-sm font-medium text-purple-600 hover:text-purple-700"
              >
                Refresh List
              </button>
            </div>
          ) : (
            streams.map((stream) => (
              <div key={stream._id} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-purple-200 transition-all group">
                <img 
                  src={stream.host?.image || '/default-artist.jpg'} 
                  alt={stream.host?.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">{stream.host?.name}</h4>
                  <div className="flex items-center gap-3 mt-0.5">
                    <p className="text-[11px] text-gray-500 truncate flex-1">{stream.title}</p>
                    <span className="flex items-center gap-1 text-[11px] font-medium text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100">
                      <Users className="h-2.5 w-2.5" />
                      {stream.currentViewers}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleChallenge(stream.host?._id)}
                  disabled={!!invitingId}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-200 disabled:opacity-50 transition-all"
                >
                  {invitingId === stream.host?._id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Swords className="h-3.5 w-3.5" />
                  )}
                  Challenge
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              Lugmatic Lyrical Wars • 5 Minute Rounds
            </p>
        </div>
      </div>
    </div>
  );
}
