import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createArtist } from '../../store/slices/artistSlice';
import { toast } from 'react-hot-toast';
import { AppDispatch } from '../../store';
import { CreateArtistData } from '../../services/artistService';

interface ArtistFormData {
  name: string;
  email: string;
  bio: string;
  genres: string[];
  socialLinks: {
    website: string;
    facebook: string;
    twitter: string;
    instagram: string;
  };
  image?: File | null;
}

interface UseCreateArtistReturn {
  isSubmitting: boolean;
  error: string | null;
  createArtist: (formData: ArtistFormData) => Promise<void>;
}

const useCreateArtist = (): UseCreateArtistReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createArtistHandler = async (formData: ArtistFormData): Promise<void> => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Create data object that matches CreateArtistData type
      const artistData: CreateArtistData = {
        name: formData.name,
        bio: formData.bio,
        genres: formData.genres,
        socialLinks: formData.socialLinks,
      };

      // Handle file separately if it exists
      if (formData.image) {
        const formDataToSend = new FormData();
        
        // Append all data as JSON except the image
        formDataToSend.append('data', JSON.stringify(artistData));
        formDataToSend.append('image', formData.image);
        
        // Dispatch the create artist action with FormData
        await dispatch(createArtist(formDataToSend as unknown as CreateArtistData)).unwrap();
      } else {
        // Dispatch without image
        await dispatch(createArtist(artistData)).unwrap();
      }
      
      toast.success('Artist profile created successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create artist profile';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    error,
    createArtist: createArtistHandler,
  };
};

export default useCreateArtist;