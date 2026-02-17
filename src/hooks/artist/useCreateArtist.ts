import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createArtist } from '../../store/slices/artistSlice';
import { toast } from 'react-hot-toast';
import { AppDispatch } from '../../store';
import { ArtistSocialLinks, CreateArtistData } from '../../services/artistService';

interface ArtistFormData {
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  bio: string;
  gender: string;
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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);

      reader.readAsDataURL(file);
    });
  };

  const createArtistHandler = async (formData: ArtistFormData): Promise<void> => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Create data object that matches CreateArtistData type
      const normalizedSocialLinks = Object.entries(formData.socialLinks).reduce(
        (acc, [key, value]) => {
          const trimmedValue = value.trim();
          if (trimmedValue) {
            acc[key as keyof ArtistSocialLinks] = trimmedValue;
          }
          return acc;
        },
        {} as ArtistSocialLinks
      );

      const normalizedGenres = formData.genres
        .map((genre) => genre.trim())
        .filter((genre) => genre.length > 0);

      const artistData: CreateArtistData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        name: formData.name.trim(),
        bio: formData.bio?.trim() || undefined,
        gender: formData.gender || undefined,
        genres: normalizedGenres.length > 0 ? normalizedGenres : undefined,
        image: undefined,
      };

      if (Object.keys(normalizedSocialLinks).length > 0) {
        artistData.socialLinks = normalizedSocialLinks;
      }

      // Handle file separately if it exists
      if (formData.image) {
        artistData.image = await fileToBase64(formData.image);
      }

      // Dispatch the create artist action with normalized payload
      await dispatch(createArtist(artistData)).unwrap();
      
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