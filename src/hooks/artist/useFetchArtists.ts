import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchArtists as fetchArtistsAction } from '../../store/slices/artistSlice';
import type { Artist as ApiArtist } from '../../services/artistService';

export type Artist = ApiArtist & {
  genre?: string;
  joinDate?: string;
  totalSongs?: number;
  totalAlbums?: number;
  imageUrl?: string;
};

export interface ArtistState {
  artists: Artist[];
  loading: boolean;
  error: string | null;
}

export const useFetchArtists = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Use type assertion to handle the type mismatch between Redux store artists and our local type
  const reduxState = useSelector((state: RootState) => state.artist) || { artists: [], loading: false, error: null };
  const artists = (reduxState.artists as unknown as Artist[]) || [];
  const loading = reduxState.loading || false;
  const error = reduxState.error || null;
  
  // Only fetch once when component mounts with empty dependency array
  useEffect(() => {
    // Only dispatch if we don't have artists
    if (artists.length === 0) {
      dispatch(fetchArtistsAction());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { artists, loading, error };
};

export default useFetchArtists; 