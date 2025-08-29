import React, { createContext, useContext, useState, ReactNode } from 'react';
import artistService, { Artist, ArtistQueryParams } from '../services/artistService';
import { toast } from 'react-hot-toast';

// Interface for the context state
interface ArtistContextState {
  artists: Artist[];
  selectedArtist: Artist | null;
  loading: boolean;
  error: string | null;
  totalArtists: number;
  queryParams: ArtistQueryParams;
  // Methods
  fetchArtists: (params?: ArtistQueryParams) => Promise<void>;
  fetchArtistById: (id: string | number) => Promise<void>;
  createArtist: (data: any) => Promise<boolean>;
  updateArtist: (id: string | number, data: any) => Promise<boolean>;
  deleteArtist: (id: string | number) => Promise<boolean>;
  approveArtist: (id: string | number) => Promise<boolean>;
  rejectArtist: (id: string | number, reason: string) => Promise<boolean>;
  setQueryParams: (params: ArtistQueryParams) => void;
  clearSelectedArtist: () => void;
}

// Creating the context with default values
const ArtistContext = createContext<ArtistContextState>({
  artists: [],
  selectedArtist: null,
  loading: false,
  error: null,
  totalArtists: 0,
  queryParams: {
    page: 1,
    limit: 10,
    sortBy: 'joinDate',
    sortOrder: 'desc'
  },
  fetchArtists: async () => {},
  fetchArtistById: async () => {},
  createArtist: async () => false,
  updateArtist: async () => false,
  deleteArtist: async () => false,
  approveArtist: async () => false,
  rejectArtist: async () => false,
  setQueryParams: () => {},
  clearSelectedArtist: () => {}
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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalArtists, setTotalArtists] = useState<number>(0);
  const [queryParams, setQueryParams] = useState<ArtistQueryParams>({
    page: 1,
    limit: 10,
    sortBy: 'joinDate',
    sortOrder: 'desc'
  });

  // Fetch artists with given query parameters
  const fetchArtists = async (params?: ArtistQueryParams) => {
    setLoading(true);
    setError(null);
    
    try {
      // Store the params for future use, but don't pass them to service
      if (params) {
        setQueryParams({ ...queryParams, ...params });
      }
      
      // Call without params since the service doesn't accept any
      const artists = await artistService.getAllArtists();
      setArtists(artists);
      setTotalArtists(artists.length);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch artists';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch a single artist by ID
  const fetchArtistById = async (id: string | number) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await artistService.getArtistById(id);
      setSelectedArtist(result.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Failed to fetch artist with ID ${id}`;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Create a new artist
  const createArtist = async (data: any): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await artistService.createArtist(data);
      // Refresh the artist list after creating a new one
      await fetchArtists();
      toast.success('Artist created successfully!');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create artist';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing artist
  const updateArtist = async (id: string | number, data: any): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await artistService.updateArtist(id, data);
      
      // Update the local state to reflect changes
      setArtists(prevArtists => 
        prevArtists.map(artist => 
          artist.id === id ? { ...artist, ...result.data } : artist
        )
      );
      
      // If the updated artist is currently selected, update it
      if (selectedArtist && selectedArtist.id === id) {
        setSelectedArtist({ ...selectedArtist, ...result.data });
      }
      
      toast.success('Artist updated successfully!');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Failed to update artist with ID ${id}`;
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete an artist
  const deleteArtist = async (id: string | number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await artistService.deleteArtist(id);
      
      // Remove the deleted artist from the local state
      setArtists(prevArtists => prevArtists.filter(artist => artist.id !== id));
      
      // If the deleted artist is currently selected, clear it
      if (selectedArtist && selectedArtist.id === id) {
        setSelectedArtist(null);
      }
      
      toast.success('Artist deleted successfully!');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Failed to delete artist with ID ${id}`;
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Approve a pending artist
  const approveArtist = async (id: string | number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await artistService.approveArtist(id);
      
      // Update the local state to reflect changes
      setArtists(prevArtists => 
        prevArtists.map(artist => 
          artist.id === id ? { ...artist, status: 'active' } : artist
        )
      );
      
      // If the approved artist is currently selected, update it
      if (selectedArtist && selectedArtist.id === id) {
        setSelectedArtist({ ...selectedArtist, status: 'active' });
      }
      
      toast.success('Artist approved successfully!');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Failed to approve artist with ID ${id}`;
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Reject a pending artist
  const rejectArtist = async (id: string | number, reason: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await artistService.rejectArtist(id, reason);
      
      // Update the local state to reflect changes
      setArtists(prevArtists => 
        prevArtists.map(artist => 
          artist.id === id ? { ...artist, status: 'inactive' } : artist
        )
      );
      
      // If the rejected artist is currently selected, update it
      if (selectedArtist && selectedArtist.id === id) {
        setSelectedArtist({ ...selectedArtist, status: 'inactive' });
      }
      
      toast.success('Artist rejected successfully!');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Failed to reject artist with ID ${id}`;
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Clear the selected artist
  const clearSelectedArtist = () => {
    setSelectedArtist(null);
  };

  // Context value
  const value = {
    artists,
    selectedArtist,
    loading,
    error,
    totalArtists,
    queryParams,
    fetchArtists,
    fetchArtistById,
    createArtist,
    updateArtist,
    deleteArtist,
    approveArtist,
    rejectArtist,
    setQueryParams,
    clearSelectedArtist
  };

  return (
    <ArtistContext.Provider value={value}>
      {children}
    </ArtistContext.Provider>
  );
};

// Custom hook to use the Artist context
export const useArtist = () => {
  const context = useContext(ArtistContext);
  if (context === undefined) {
    throw new Error('useArtist must be used within an ArtistProvider');
  }
  return context;
};

export default ArtistContext; 