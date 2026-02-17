import { useState, useEffect } from 'react';
import { Users, Filter, Star, Search } from 'lucide-react';

interface Artist {
    _id: string;
    name: string;
    image: string;
    featured: boolean;
    isActive: boolean;
    isApproved: boolean;
    user: {
        email: string;
    };
}

export default function HomePageManagement() {
    const [artists, setArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

    useEffect(() => {
        fetchArtists();
    }, [showFeaturedOnly]);

    const fetchArtists = async () => {
        try {
            setLoading(true);
            // Construct URL with query params
            const baseUrl = 'http://localhost:5000/api/artists';
            const params = new URLSearchParams();
            if (showFeaturedOnly) params.append('featured', 'true');

            const response = await fetch(`${baseUrl}?${params.toString()}`);
            const data = await response.json();
            setArtists(data);
        } catch (error) {
            console.error('Error fetching artists:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFeatured = async (artistId: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`http://localhost:5000/api/artists/${artistId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ featured: !currentStatus }),
            });

            if (response.ok) {
                // Optimistic update
                setArtists(artists.map(a =>
                    a._id === artistId ? { ...a, featured: !currentStatus } : a
                ));
            }
        } catch (error) {
            console.error('Error updating artist:', error);
        }
    };

    const filteredArtists = artists.filter(artist =>
        artist.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Home Page Management</h1>
                    <p className="text-sm text-gray-500">Manage featured artists on the landing page</p>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                        className={`flex items-center px-4 py-2 rounded-lg transition-colors ${showFeaturedOnly
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-white text-gray-600 border hover:bg-gray-50'
                            }`}
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        {showFeaturedOnly ? 'Showing Featured' : 'All Artists'}
                    </button>
                </div>
            </div>

            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                    type="text"
                    placeholder="Search artists..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                    Loading artists...
                                </td>
                            </tr>
                        ) : filteredArtists.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                    No artists found
                                </td>
                            </tr>
                        ) : (
                            filteredArtists.map((artist) => (
                                <tr key={artist._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                {artist.image ? (
                                                    <img className="h-10 w-10 rounded-full object-cover" src={artist.image} alt="" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                        <Users className="h-5 w-5 text-purple-600" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{artist.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${artist.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {artist.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => toggleFeatured(artist._id, artist.featured)}
                                            className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${artist.featured ? 'bg-purple-600' : 'bg-gray-200'
                                                }`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${artist.featured ? 'translate-x-5' : 'translate-x-0'
                                                    }`}
                                            />
                                        </button>
                                        {artist.featured && <Star className="inline-block ml-2 h-4 w-4 text-yellow-400 fill-current" />}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {artist.user?.email}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
