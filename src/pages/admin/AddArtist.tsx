import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { CreateArtistData } from '../../services/artistService';
import { Upload } from 'lucide-react';
import { usePostArtist } from '../../hooks/artist/usePostArtist';

interface ArtistFormData {
  name: string;
  bio: string;
  genre: string;
  image?: File | undefined;
}

const AddArtist = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigate = useNavigate();
  const { postArtist, isLoading } = usePostArtist();
  
  // Form validation schema
  const schema: yup.ObjectSchema<ArtistFormData> = yup.object({
    name: yup.string().required('Artist name is required'),
    bio: yup.string().required('Artist bio is required'),
    genre: yup.string().required('Genre is required'),
    image: yup.mixed<File>().optional()
  }) as yup.ObjectSchema<ArtistFormData>;
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ArtistFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      bio: '',
      genre: '',
      image: undefined
    }
  });
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const onSubmit: SubmitHandler<ArtistFormData> = async (data) => {
    try {
      const artistData: CreateArtistData = {
        name: data.name,
        bio: data.bio,
        genres: data.genre ? [data.genre] : []
      };
      
      await postArtist(artistData);
      toast.success('Artist added successfully!');
      reset();
      setImagePreview(null);
      navigate('/admin/artists');
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error('Failed to add artist. Please try again.');
    }
  };
  
  const handleCancel = () => {
    navigate('/admin/artists');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto mt-8">
          <h1 className="text-2xl font-bold mb-6">Add New Artist</h1>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Artist Name
              </label>
              <input
                type="text"
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Genre
              </label>
              <input
                type="text"
                {...register('genre')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter genre (e.g., Pop, Rock, Hip Hop)"
              />
              {errors.genre && (
                <p className="mt-1 text-sm text-red-600">{errors.genre.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                {...register('bio')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
              )}
            </div>
            
            <div>
              <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                <Upload className="h-5 w-5 mr-2" />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  {...register('image', { onChange: handleImageChange })}
                />
              </label>
              {errors.image && (
                <p className="mt-1 text-sm text-red-600">{errors.image?.message?.toString()}</p>
              )}
              
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Artist preview"
                    className="max-h-48 object-contain"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : 'Save Artist'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddArtist;