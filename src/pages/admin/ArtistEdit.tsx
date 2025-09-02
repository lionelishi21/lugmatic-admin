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

  // Update form data when selectedArtist changes
  useEffect(() => {
    if (selectedArtist) {
      setFormData({
        name: selectedArtist.name,
        email: selectedArtist.email,
        genres: selectedArtist.genres,
        status: selectedArtist.status
      });
    }
  }, [selectedArtist]);

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
              className={`w-full px-3 py-2 border ${
                formErrors.name ? 'border-red-500' : 'border-gray-300'
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
              className={`w-full px-3 py-2 border ${
                formErrors.email ? 'border-red-500' : 'border-gray-300'
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
              className={`w-full px-3 py-2 border ${
                formErrors.genre ? 'border-red-500' : 'border-gray-300'
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