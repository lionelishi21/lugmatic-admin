import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { fetchArtists as fetchArtistsAction } from '../../store/slices/artistSlice';
import artistService, { Artist } from '../../services/artistService';

// Hook to fetch artists filtered by name
export const useFetchArtist = (nameFilter?: string) => {
  const dispatch = useDispatch<AppDispatch>();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        
        // Dispatch the action to fetch artists from the Redux store
        await dispatch(fetchArtistsAction());
        
        // Get artists from the service as a fallback
        const response = await artistService.getAllArtists();
        
        if (response && response.length > 0) {
          if (nameFilter) {
            // Filter artists by name if nameFilter is provided
            const filteredArtists = response.filter(artist => 
              artist.name.toLowerCase().includes(nameFilter.toLowerCase())
            );
            setArtists(filteredArtists);
          } else {
            // Return all artists if no filter is provided
            setArtists(response);
          }
        } else {
          setArtists([]);
        }
        setError(null);
      } catch (err) {
        setError('Failed to fetch artists');
        setArtists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, [nameFilter, dispatch]);
  
  return {
    artists,
    loading,
    error
  };
};

export default useFetchArtist;
