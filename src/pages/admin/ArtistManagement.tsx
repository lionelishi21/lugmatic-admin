import React, { useState, useEffect } from 'react';
import { Users, Music2, TrendingUp, DollarSign, Shield, MoreVertical } from 'lucide-react';

interface Artist {
  id: string;
  name: string;
  email: string;
  followers: number;
  totalTracks: number;
  totalRevenue: number;
  status: 'active' | 'pending' | 'suspended';
  joinDate: string;
  genres: string[];
}

export default function ArtistManagement() {
  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    const mockArtists: Artist[] = [
      {
        id: '1',
        name: 'Aria Waves',
        email: 'aria@example.com',
        followers: 12345,
        totalTracks: 45,
        totalRevenue: 12500,
        status: 'active',
        joinDate: '2024-01-15',
        genres: ['Electronic', 'Ambient']
      },
      {
        id: '2',
        name: 'Jazz Horizons',
        email: 'jazz@example.com',
        followers: 8900,
        totalTracks: 32,
        totalRevenue: 8500,
        status: 'active',
        joinDate: '2024-02-01',
        genres: ['Jazz', 'Fusion']
      }
    ];
    setArtists(mockArtists);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Artist Management</h1>
        <div className="flex items-center space-x-4">
          <button className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg">
            <Shield className="h-4 w-4 mr-2" />
            Pending Approvals
          </button>
          <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg">
            <Users className="h-4 w-4 mr-2" />
            Add Artist
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Artist</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stats</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {artists.map((artist) => (
              <tr key={artist.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Music2 className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{artist.name}</div>
                      <div className="text-sm text-gray-500">{artist.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      {artist.followers.toLocaleString()} followers
                    </div>
                    <div className="flex items-center text-sm">
                      <Music2 className="h-4 w-4 mr-2 text-gray-400" />
                      {artist.totalTracks} tracks
                    </div>
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                      ${artist.totalRevenue.toLocaleString()}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${artist.status === 'active' ? 'bg-green-100 text-green-800' : 
                    artist.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'}`}>
                    {artist.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-gray-400 hover:text-gray-500">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}