import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useArtistContext } from '../../context/ArtistContext';
import Preloader from '../../components/ui/Preloader';
import { toast } from 'react-hot-toast';
import { Artist } from '../../services/artistService';

const ArtistEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchArtistById, selectedArtist, updateArtist, loading, error } = useArtistContext();

  // Local form state
  const [formData, setFormData] = useState<Partial<Artist>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch artist data when component mounts
  useEffect(() => {
    if (id) {
      fetchArtistById(id);
    }
  }, [id, fetchArtistById]);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Update form data when selectedArtist changes
  useEffect(() => {
    if (selectedArtist) {
      setFormData({
        name: selectedArtist.name,
        email: selectedArtist.email,
        genres: selectedArtist.genres,
        status: selectedArtist.status,
        image: selectedArtist.image || '',
      });
      setImagePreview(selectedArtist.image || null);
    }
  }, [selectedArtist]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const base64 = await fileToBase64(file);
        setFormData(prev => ({ ...prev, image: base64 }));
        setImagePreview(base64);
      } catch (err) {
        toast.error('Failed to process image');
      }
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear any errors for this field
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form data
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Name is required';
    }

    if (!formData.email || formData.email.trim() === '') {
      errors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.genres || (Array.isArray(formData.genres) && formData.genres.length === 0)) {
      errors.genre = 'At least one genre is required';
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    if (!id) {
      toast.error('Artist ID is missing');
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await updateArtist(id, formData);
      if (success) {
        toast.success('Artist updated successfully');
        navigate(`/admin/artists/${id}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel editing and go back
  const handleCancel = () => {
    navigate(`/admin/artists/${id}`);
  };

  // Show loading state
  if (loading && !selectedArtist) {
    return <Preloader isVisible={true} text="Loading artist details..." />;
  }

  // Show error state
  if (error && !selectedArtist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 p-4 rounded-lg text-red-700 mb-4">
          Error: {error}
        </div>
        <button
          onClick={() => navigate('/admin/artists')}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Back to Artists
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-800">Edit Artist</h1>
        <p className="text-gray-600 mt-1">Update information for {selectedArtist?.name}</p>
      </motion.div>

      {/* Edit Form */}
      <motion.div
        className="bg-white p-6 rounded-lg shadow-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name || ''}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
            {formErrors.name && (
              <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email || ''}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
            {formErrors.email && (
              <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
            )}
          </div>

          {/* Genres Field */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="genres">
              Genres (comma separated)
            </label>
            <input
              id="genres"
              name="genres"
              type="text"
              value={Array.isArray(formData.genres) ? formData.genres.join(', ') : ''}
              onChange={(e) => setFormData(prev => ({ ...prev, genres: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
              className={`w-full px-3 py-2 border ${formErrors.genre ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
            {formErrors.genre && (
              <p className="text-red-500 text-xs mt-1">{formErrors.genre}</p>
            )}
          </div>

          {/* Status Field */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status || 'pending'}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Profile Image Field */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Profile Image
            </label>
            <div className="flex items-start space-x-6">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-50 flex shrink-0 items-center justify-center relative group">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">No Image</span>
                )}
                {/* Overlay for hover */}
                <label htmlFor="image-upload" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
              </div>
              <div className="flex-1">
                <input
                  id="image-upload"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Select a new profile image. Format: JPG, PNG.
                </p>
                {imagePreview ? (
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData(prev => ({ ...prev, image: '' }));
                    }}
                    className="mt-3 text-xs text-red-500 font-medium hover:text-red-700 transition-colors"
                  >
                    Remove Image
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ArtistEdit; 