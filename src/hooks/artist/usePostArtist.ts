import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createArtist } from '../../store/slices/artistSlice';
import { AppDispatch } from '../../store';

// Custom hook for posting artist data
export const usePostArtist = () => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const postArtist = async (data: Artist) => {
    setIsLoading(true);
    try {

      console.log(data);
      const resultAction = await dispatch(createArtist(data));
      
      if (createArtist.rejected.match(resultAction)) {
        throw new Error(resultAction.payload as string || 'Failed to add artist');
      }
      
      return resultAction.payload;
    } catch (error) {
      console.error('Error adding artist:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { postArtist, isLoading };
};