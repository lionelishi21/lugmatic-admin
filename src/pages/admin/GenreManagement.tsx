import React, { useState } from 'react';

interface Genre {
  id: number;
  name: string;
  description: string;
  songCount: number;
  albumCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

const GenreManagement: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const handleOpenDialog = (genre?: Genre) => {
    setSelectedGenre(genre || null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedGenre(null);
  };

  // Mock data - replace with actual API calls
  const genres: Genre[] = [
    {
      id: 1,
      name: 'Pop',
      description: 'Popular music characterized by catchy melodies and contemporary production',
      songCount: 150,
      albumCount: 25,
      status: 'active',
      createdAt: '2024-01-01',
      updatedAt: '2024-03-28',
    },
    {
      id: 2,
      name: 'Rock',
      description: 'Guitar-driven music with strong rhythms and powerful vocals',
      songCount: 200,
      albumCount: 30,
      status: 'active',
      createdAt: '2024-01-02',
      updatedAt: '2024-03-28',
    },
    {
      id: 3,
      name: 'Hip Hop',
      description: 'Urban music featuring rap vocals and electronic beats',
      songCount: 180,
      albumCount: 28,
      status: 'active',
      createdAt: '2024-01-03',
      updatedAt: '2024-03-28',
    },
    {
      id: 4,
      name: 'Electronic',
      description: 'Music created using electronic instruments and digital production',
      songCount: 120,
      albumCount: 20,
      status: 'inactive',
      createdAt: '2024-01-04',
      updatedAt: '2024-03-28',
    },
  ];

  const getStatusChip = (status: Genre['status']) => {
    const color = status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
    return <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${color}`}>{status}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto mt-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Genre Management</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="px-4 py-2 border rounded-md text-sm"
          >
            {viewMode === 'list' ? 'Grid View' : 'List View'}
          </button>
          <button
            onClick={() => handleOpenDialog()}
            className="px-4 py-2 rounded-md bg-purple-600 text-white text-sm"
          >
            + Add New Genre
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Songs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Albums</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {genres.map((genre) => (
                  <tr key={genre.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{genre.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{genre.description}</td>
                    <td className="px-6 py-4 text-sm">{genre.songCount}</td>
                    <td className="px-6 py-4 text-sm">{genre.albumCount}</td>
                    <td className="px-6 py-4 text-sm">{getStatusChip(genre.status)}</td>
                    <td className="px-6 py-4 text-sm">{new Date(genre.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm">{new Date(genre.updatedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleOpenDialog(genre)} className="px-3 py-1 text-indigo-600 hover:bg-indigo-50 rounded">
                          Edit
                        </button>
                        <button className="px-3 py-1 text-red-600 hover:bg-red-50 rounded">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {genres.map((genre) => (
            <div key={genre.id} className="rounded-lg border bg-white p-4 shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <h3 className="font-semibold">{genre.name}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">{genre.description}</p>
              <div className="flex items-center gap-2 text-xs text-gray-700 mb-3">
                <span className="px-2 py-1 border rounded">{genre.songCount} Songs</span>
                <span className="px-2 py-1 border rounded">{genre.albumCount} Albums</span>
              </div>
              <div className="flex items-center justify-between">
                {getStatusChip(genre.status)}
                <div className="flex items-center gap-2">
                  <button onClick={() => handleOpenDialog(genre)} className="px-3 py-1 text-indigo-600 hover:bg-indigo-50 rounded">
                    Edit
                  </button>
                  <button className="px-3 py-1 text-red-600 hover:bg-red-50 rounded">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {openDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{selectedGenre ? 'Edit Genre' : 'Add New Genre'}</h2>
              <button onClick={handleCloseDialog} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Genre Name</label>
                <input defaultValue={selectedGenre?.name} className="mt-1 w-full rounded border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea defaultValue={selectedGenre?.description} rows={3} className="mt-1 w-full rounded border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select defaultValue={selectedGenre?.status || 'active'} className="mt-1 w-full rounded border px-3 py-2">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={handleCloseDialog} className="px-4 py-2 text-sm rounded border">Cancel</button>
              <button onClick={handleCloseDialog} className="px-4 py-2 text-sm rounded bg-purple-600 text-white">
                {selectedGenre ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenreManagement; 