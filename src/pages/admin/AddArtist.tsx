import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { CreateArtistData } from '../../services/artistService';
import { Upload, ArrowLeft, User, Mail, Music, FileText, ImageIcon, X } from 'lucide-react';
import { usePostArtist } from '../../hooks/artist/usePostArtist';

interface ArtistFormData {
  firstName: string;
  lastName: string;
  email: string;
  stageName: string;
  bio: string;
  genre: string;
}

const schema: yup.ObjectSchema<ArtistFormData> = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Enter a valid email address').required('Email is required'),
  stageName: yup.string().required('Artist name is required'),
  bio: yup.string().required('Artist bio is required'),
  genre: yup.string().required('Genre is required'),
}) as yup.ObjectSchema<ArtistFormData>;

const AddArtist = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const { postArtist, isLoading } = usePostArtist();

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ArtistFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      stageName: '',
      bio: '',
      genre: ''
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImageFile(null);
      setImagePreview(null);
    }
  };

  const clearImage = () => {
    setSelectedImageFile(null);
    setImagePreview(null);
  };

  const onSubmit: SubmitHandler<ArtistFormData> = async (data) => {
    try {
      const genres = data.genre.trim() ? [data.genre.trim()] : undefined;
      const artistData: CreateArtistData = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        name: data.stageName.trim(),
        bio: data.bio.trim(),
        genres,
      };

      if (selectedImageFile) {
        artistData.image = await fileToBase64(selectedImageFile);
      }

      await postArtist(artistData);
      toast.success('Artist added successfully!');
      reset();
      setImagePreview(null);
      setSelectedImageFile(null);
      navigate('/admin/artists');
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error('Failed to add artist. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/admin/artists');
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-3.5 py-2.5 bg-gray-50/50 border rounded-xl text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:bg-white ${
      hasError
        ? 'border-red-300 focus:ring-red-500/20 focus:border-red-400'
        : 'border-gray-200 focus:ring-green-500/20 focus:border-green-400'
    }`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto"
    >
      {/* Page header */}
      <div className="mb-6">
        <button
          onClick={handleCancel}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Artists
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Add New Artist</h1>
        <p className="text-sm text-gray-500 mt-1">Fill in the details below to register a new artist on the platform.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile image section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Profile Image</h2>
          </div>
          <div className="flex items-center gap-5">
            {imagePreview ? (
              <div className="relative group">
                <img
                  src={imagePreview}
                  alt="Artist preview"
                  className="h-24 w-24 rounded-2xl object-cover border-2 border-gray-100"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="h-24 w-24 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center">
                <User className="h-8 w-8 text-gray-300" />
              </div>
            )}
            <div>
              <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 cursor-pointer transition-colors">
                <Upload className="h-4 w-4" />
                {imagePreview ? 'Change Image' : 'Upload Image'}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </label>
              <p className="text-xs text-gray-400 mt-2">JPG, PNG or WebP. Max 5MB.</p>
            </div>
          </div>
        </div>

        {/* Personal information */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <User className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Personal Information</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">First Name</label>
              <input
                type="text"
                placeholder="John"
                {...register('firstName')}
                className={inputClass(!!errors.firstName)}
              />
              {errors.firstName && (
                <p className="mt-1.5 text-xs text-red-500">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Last Name</label>
              <input
                type="text"
                placeholder="Doe"
                {...register('lastName')}
                className={inputClass(!!errors.lastName)}
              />
              {errors.lastName && (
                <p className="mt-1.5 text-xs text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                placeholder="john@example.com"
                {...register('email')}
                className={`${inputClass(!!errors.email)} pl-10`}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>
        </div>

        {/* Artist details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Music className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Artist Details</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Stage Name</label>
              <input
                type="text"
                placeholder="e.g., DJ Nova"
                {...register('stageName')}
                className={inputClass(!!errors.stageName)}
              />
              {errors.stageName && (
                <p className="mt-1.5 text-xs text-red-500">{errors.stageName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Genre</label>
              <input
                type="text"
                placeholder="e.g., Pop, Rock, Hip Hop"
                {...register('genre')}
                className={inputClass(!!errors.genre)}
              />
              {errors.genre && (
                <p className="mt-1.5 text-xs text-red-500">{errors.genre.message}</p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-gray-600">Bio</label>
              <FileText className="h-3.5 w-3.5 text-gray-300" />
            </div>
            <textarea
              {...register('bio')}
              rows={4}
              placeholder="Write a short biography about the artist..."
              className={inputClass(!!errors.bio)}
            />
            {errors.bio && (
              <p className="mt-1.5 text-xs text-red-500">{errors.bio.message}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 pb-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : 'Save Artist'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AddArtist;