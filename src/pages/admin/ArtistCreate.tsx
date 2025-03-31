import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useArtist } from '../../context/ArtistContext';
import Preloader from '../../components/ui/Preloader';
import { toast } from 'react-hot-toast';
import { CreateArtistData } from '../../services/artistService';

const ArtistCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createArtist, loading } = useArtist();
  
  // Form state
  const [formData, setFormData] = useState<CreateArtistData>({
    name: '',
    email: '',
    genre: '',
    status: 'pending'
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
    
    if (!formData.genre || formData.genre.trim() === '') {
      errors.genre = 'Genre is required';
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
    
    setIsSubmitting(true);
    
    try {
      const success = await createArtist(formData);
      if (success) {
        toast.success('Artist created successfully');
        navigate('/admin/artists');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel creating and go back
  const handleCancel = () => {
    navigate('/admin/artists');
  };

  // Show loading state
  if (loading && isSubmitting) {
    return <Preloader isVisible={true} text="Creating artist..." />;
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
        <h1 className="text-3xl font-bold text-gray-800">Add New Artist</h1>
        <p className="text-gray-600 mt-1">Create a new artist account in the system</p>
      </motion.div>

      {/* Create Form */}
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
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border ${
                formErrors.name ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
              placeholder="Enter artist's full name"
            />
            {formErrors.name && (
              <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border ${
                formErrors.email ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
              placeholder="Enter email address"
            />
            {formErrors.email && (
              <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
            )}
          </div>

          {/* Genre Field */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="genre">
              Genre <span className="text-red-500">*</span>
            </label>
            <input
              id="genre"
              name="genre"
              type="text"
              value={formData.genre}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border ${
                formErrors.genre ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
              placeholder="Enter primary music genre"
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
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              New artists are typically set to "Pending" until approved
            </p>
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
              {isSubmitting ? 'Creating...' : 'Create Artist'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ArtistCreate; 