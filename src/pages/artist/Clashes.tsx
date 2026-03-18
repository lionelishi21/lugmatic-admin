import React, { useState, useEffect } from 'react';
import { 
  Swords, 
  Trophy, 
  Calendar, 
  Clock, 
  ExternalLink, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api'; // Using the existing api service
import { Skeleton } from '../../components/ui/skeleton';

interface Artist {
  _id: string;
  name: string;
  image: string;
}

interface Clash {
  _id: string;
  challenger: Artist;
  opponent: Artist;
  status: 'pending' | 'accepted' | 'active' | 'ended' | 'cancelled' | 'rejected';
  challengerScore: number;
  opponentScore: number;
  winner?: Artist;
  startTime?: string;
  createdAt: string;
}

export default function Clashes() {
  const [clashes, setClashes] = useState<Clash[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClashes = async () => {
      try {
        const res = await api.get('/clash/history');
        if (res.data && res.data.success) {
          setClashes(res.data.data);
        } else {
          setError('Failed to load clash history');
        }
      } catch (err) {
        console.error('Error fetching clashes:', err);
        setError('An error occurred while fetching your clashes');
      } finally {
        setLoading(false);
      }
    };

    fetchClashes();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full animate-pulse">LIVE</span>;
      case 'ended':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">ENDED</span>;
      case 'accepted':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">UPCOMING</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full uppercase">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Clash</h1>
          <p className="text-gray-500 text-sm">Manage and review your Lyrical War history</p>
        </div>
        <div className="bg-purple-100 p-3 rounded-xl">
          <Swords className="h-6 w-6 text-purple-600" />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="flex items-center justify-around py-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-16 w-16 rounded-full" />
              </div>
            </div>
          ))
        ) : clashes.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-white/10 text-center space-y-4">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Swords className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No Clashes Yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              You haven't participated in any Lyrical Wars yet. Go live to challenge other artists!
            </p>
          </div>
        ) : (
          clashes.map((clash) => {
            const isWinner = clash.winner && (clash.winner._id === clash.challenger._id || clash.winner._id === clash.opponent._id);
            
            return (
              <div key={clash._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(clash.createdAt), 'MMM dd, yyyy')}
                    </div>
                    {getStatusBadge(clash.status)}
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    {/* Challenger */}
                    <div className="flex flex-col items-center text-center flex-1 space-y-2">
                       <div className="relative">
                          <img 
                            src={clash.challenger.image || '/default-artist.jpg'} 
                            alt={clash.challenger.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-50"
                          />
                          {clash.winner?._id === clash.challenger._id && (
                            <div className="absolute -top-1 -right-1 bg-yellow-400 p-1 rounded-full shadow-sm">
                                <Trophy className="h-3 w-3 text-white" />
                            </div>
                          )}
                       </div>
                       <p className="text-sm font-bold text-gray-900 truncate w-full">{clash.challenger.name}</p>
                       <p className="text-2xl font-black text-gray-800">{clash.challengerScore}</p>
                    </div>

                    <div className="flex flex-col items-center">
                        <span className="text-xs font-black text-gray-300 italic">VS</span>
                    </div>

                    {/* Opponent */}
                    <div className="flex flex-col items-center text-center flex-1 space-y-2">
                       <div className="relative">
                          <img 
                            src={clash.opponent.image || '/default-artist.jpg'} 
                            alt={clash.opponent.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-50"
                          />
                          {clash.winner?._id === clash.opponent._id && (
                            <div className="absolute -top-1 -right-1 bg-yellow-400 p-1 rounded-full shadow-sm">
                                <Trophy className="h-3 w-3 text-white" />
                            </div>
                          )}
                       </div>
                       <p className="text-sm font-bold text-gray-900 truncate w-full">{clash.opponent.name}</p>
                       <p className="text-2xl font-black text-gray-800">{clash.opponentScore}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50/50 px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        {clash.status === 'ended' ? (
                            <>
                                <TrendingUp className="h-3.5 w-3.5 text-purple-500" />
                                <span>Game concluded</span>
                            </>
                        ) : (
                            <>
                                <Clock className="h-3.5 w-3.5 text-green-500" />
                                <span>Active session</span>
                            </>
                        )}
                    </div>
                    {/* Link to the public webapp page for review and comments */}
                    <a 
                        href={`http://localhost:3000/clash/${clash._id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 transition-colors"
                    >
                        Review & Comments
                        <ExternalLink className="h-3 w-3" />
                    </a>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  );
}
