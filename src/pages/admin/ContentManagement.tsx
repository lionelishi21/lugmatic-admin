import { useState, useEffect } from 'react';
import { Music2, Trash2, Edit2, Filter } from 'lucide-react';

interface Content {
  id: string;
  title: string;
  artist: string;
  type: 'song' | 'album' | 'playlist';
  status: 'active' | 'inactive' | 'flagged';
  uploadDate: string;
}

export default function ContentManagement() {
  const [contents, setContents] = useState<Content[]>([]);

  // Mock data generation (replace with actual API call)
  useEffect(() => {
    const mockContents: Content[] = [
      {
        id: '1',
        title: 'Summer Vibes',
        artist: 'Aria Waves',
        type: 'song',
        status: 'active',
        uploadDate: '2024-03-27'
      },
      {
        id: '2',
        title: 'Midnight Jazz Collection',
        artist: 'Jazz Horizons',
        type: 'album',
        status: 'active',
        uploadDate: '2024-03-26'
      },
      {
        id: '3',
        title: 'Rock Classics',
        artist: 'Rock Pulse',
        type: 'playlist',
        status: 'flagged',
        uploadDate: '2024-03-25'
      }
    ];

    setContents(mockContents);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
        <div className="flex items-center space-x-4">
          <button className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contents.map((content) => (
              <tr key={content.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <Music2 className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm font-medium text-gray-900">{content.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">{content.type}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">{content.artist}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${content.status === 'active' ? 'bg-green-100 text-green-800' : 
                    content.status === 'flagged' ? 'bg-red-100 text-red-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                    {content.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">{content.uploadDate}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-3">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}