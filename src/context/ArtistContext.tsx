import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import artistService, { Album, Artist, ArtistQueryParams, Song } from '../services/artistService';
import { toast } from 'react-hot-toast';

// Interface for the context state
interface ArtistContextState {
  artists: Artist[];
  selectedArtist: Artist | null;
  albums: Album[];
  songs: Song[];
  loading: boolean;
  error: string | null;
  albumsLoading: boolean;
  songsLoading: boolean;
  albumsError: string | null;
  songsError: string | null;
  totalArtists: number;
  queryParams: ArtistQueryParams;
  // Methods
  fetchArtists: (params?: ArtistQueryParams) => Promise<void>;
  fetchArtistById: (id: string) => Promise<void>;
  fetchArtistAlbums: (id: string) => Promise<void>;
  fetchArtistSongs: (id: string) => Promise<void>;
  createArtist: (data: any) => Promise<boolean>;
  updateArtist: (id: string, data: any) => Promise<boolean>;
  deleteArtist: (id: string) => Promise<boolean>;
  approveArtist: (id: string) => Promise<boolean>;
  rejectArtist: (id: string, reason: string) => Promise<boolean>;
  setQueryParams: (params: ArtistQueryParams) => void;
  clearSelectedArtist: () => void;
  clearDiscography: () => void;
}

// Creating the context with default values
const ArtistContext = createContext<ArtistContextState>({
  artists: [],
  selectedArtist: null,
  albums: [],
  songs: [],
  loading: false,
  error: null,
  albumsLoading: false,
  songsLoading: false,
  albumsError: null,
  songsError: null,
  totalArtists: 0,
  queryParams: {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  fetchArtists: async () => {},
  fetchArtistById: async () => {},
  fetchArtistAlbums: async () => {},
  fetchArtistSongs: async () => {},
  createArtist: async () => false,
  updateArtist: async () => false,
  deleteArtist: async () => false,
  approveArtist: async () => false,
  rejectArtist: async () => false,
  setQueryParams: () => {},
  clearSelectedArtist: () => {},
  clearDiscography: () => {}
});

// Provider props interface
interface ArtistProviderProps {
  children: ReactNode;
}

// Provider component
export const ArtistProvider: React.FC<ArtistProviderProps> = ({ children }) => {
  // State
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [albumsLoading, setAlbumsLoading] = useState<boolean>(false);
  const [songsLoading, setSongsLoading] = useState<boolean>(false);
  const [albumsError, setAlbumsError] = useState<string | null>(null);
  const [songsError, setSongsError] = useState<string | null>(null);
  const [totalArtists, setTotalArtists] = useState<number>(0);
  const [queryParams, setQueryParams] = useState<ArtistQueryParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Fetch artists with given query parameters
  const fetchArtists = useCallback(async (params?: ArtistQueryParams) => {
    setLoading(true);
    setError(null);
    
    try {
      // Store the params for future use, but don't pass them to service
      if (params) {
        setQueryParams((prev) => ({ ...prev, ...params }));
      }
      
      // Call without params since the service doesn't accept any
      const artists = await artistService.getAllArtists();
      setArtists(artists);
      setTotalArtists(artists.length);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to fetch artists';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single artist by ID
  const fetchArtistById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const [artistResult, albumsResult, songsResult] = await Promise.all([
        artistService.getArtistById(id),
        artistService.getArtistAlbums(id).catch(() => []),
        artistService.getArtistSongs(id).catch(() => [])
      ]);
      setSelectedArtist(artistResult);
      setAlbums(Array.isArray(albumsResult) ? albumsResult : []);
      setSongs(Array.isArray(songsResult) ? songsResult : []);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        `Failed to fetch artist with ID ${id}`;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchArtistAlbums = useCallback(async (id: string) => {
    setAlbumsLoading(true);
    setAlbumsError(null);

    try {
      const artistAlbums = await artistService.getArtistAlbums(id);
      setAlbums(Array.isArray(artistAlbums) ? artistAlbums : []);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        `Failed to fetch albums for artist ${id}`;
      setAlbumsError(errorMessage);
      toast.error(errorMessage);
      setAlbums([]);
    } finally {
      setAlbumsLoading(false);
    }
  }, []);

  const fetchArtistSongs = useCallback(async (id: string) => {
    setSongsLoading(true);
    setSongsError(null);

    try {
      const artistSongs = await artistService.getArtistSongs(id);
      setSongs(Array.isArray(artistSongs) ? artistSongs : []);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        `Failed to fetch songs for artist ${id}`;
      setSongsError(errorMessage);
      toast.error(errorMessage);
      setSongs([]);
    } finally {
      setSongsLoading(false);
    }
  }, []);

  // Create a new artist
  const createArtist = useCallback(async (data: any): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await artistService.createArtist(data);
      // Refresh the artist list after creating a new one
      await fetchArtists();
      toast.success('Artist created successfully!');
      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to create artist';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchArtists]);

  // Update an existing artist
  const updateArtist = useCallback(async (id: string, data: any): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await artistService.updateArtist(id, data);
      
      // Update the local state to reflect changes
      setArtists(prevArtists => 
        prevArtists.map(artist => 
          artist._id === id ? { ...artist, ...result } : artist
        )
      );
      
      // If the updated artist is currently selected, update it
      if (selectedArtist && selectedArtist._id === id) {
        setSelectedArtist({ ...selectedArtist, ...result });
      }
      
      toast.success('Artist updated successfully!');
      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        `Failed to update artist with ID ${id}`;
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [selectedArtist]);

  // Delete an artist
  const deleteArtist = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await artistService.deleteArtist(id);
      
      // Remove the deleted artist from the local state
      setArtists(prevArtists => prevArtists.filter(artist => artist._id !== id));
      
      // If the deleted artist is currently selected, clear it
      if (selectedArtist && selectedArtist._id === id) {
        setSelectedArtist(null);
      }
      
      toast.success('Artist deleted successfully!');
      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        `Failed to delete artist with ID ${id}`;
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [selectedArtist]);

  // Approve a pending artist
  const approveArtist = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await artistService.approveArtist(id);
      
      // Update the local state to reflect changes
      setArtists(prevArtists => 
        prevArtists.map(artist => 
          artist._id === id ? { ...artist, status: 'active' } : artist
        )
      );
      
      // If the approved artist is currently selected, update it
      if (selectedArtist && selectedArtist._id === id) {
        setSelectedArtist({ ...selectedArtist, status: 'active' } as Artist);
      }
      
      toast.success('Artist approved successfully!');
      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        `Failed to approve artist with ID ${id}`;
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [selectedArtist]);

  // Reject a pending artist
  const rejectArtist = useCallback(async (id: string, reason: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await artistService.rejectArtist(id, reason);
      
      // Update the local state to reflect changes
      setArtists(prevArtists => 
        prevArtists.map(artist => 
          artist._id === id ? { ...artist, status: 'inactive' } : artist
        )
      );
      
      // If the rejected artist is currently selected, update it
      if (selectedArtist && selectedArtist._id === id) {
        setSelectedArtist({ ...selectedArtist, status: 'inactive' } as Artist);
      }
      
      toast.success('Artist rejected successfully!');
      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        `Failed to reject artist with ID ${id}`;
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [selectedArtist]);

  // Clear the selected artist
  const clearSelectedArtist = useCallback(() => {
    setSelectedArtist(null);
    setError(null);
  }, []);

  const clearDiscography = useCallback(() => {
    setAlbums([]);
    setSongs([]);
    setAlbumsError(null);
    setSongsError(null);
  }, []);

  // Context value
  const value = {
    artists,
    selectedArtist,
    albums,
    songs,
    loading,
    error,
    albumsLoading,
    songsLoading,
    albumsError,
    songsError,
    totalArtists,
    queryParams,
    fetchArtists,
    fetchArtistById,
    fetchArtistAlbums,
    fetchArtistSongs,
    createArtist,
    updateArtist,
    deleteArtist,
    approveArtist,
    rejectArtist,
    setQueryParams,
    clearSelectedArtist,
    clearDiscography
  };

  return (
    <ArtistContext.Provider value={value}>
      {children}
    </ArtistContext.Provider>
  );
};

// Custom hook to use the artist context
export const useArtistContext = () => {
  const context = useContext(ArtistContext);
  if (!context) {
    throw new Error('useArtistContext must be used within an ArtistProvider');
  }
  return context;
};

export default ArtistContext; 