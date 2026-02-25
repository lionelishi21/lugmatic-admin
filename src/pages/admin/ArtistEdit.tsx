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
        firstName: selectedArtist.firstName || (selectedArtist.user as any)?.firstName || '',
        lastName: selectedArtist.lastName || (selectedArtist.user as any)?.lastName || '',
        name: selectedArtist.name || '',
        email: selectedArtist.email || selectedArtist.contactEmail || (selectedArtist.user as any)?.email || '',
        genres: selectedArtist.genres || [],
        status: selectedArtist.status || 'pending',
        image: selectedArtist.image || '',
        bio: selectedArtist.bio || '',
        gender: selectedArtist.gender || (selectedArtist.user as any)?.gender || '',
        socialLinks: selectedArtist.socialLinks || { website: '', facebook: '', twitter: '', instagram: '' }
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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('socialLinks.')) {
      const socialLinkField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...(prev.socialLinks as any),
          [socialLinkField]: value
        }
      }));
    } else {
      setFormData(prev => {
        if (name === 'firstName' || name === 'lastName') {
          const firstName = name === 'firstName' ? value : prev.firstName;
          const lastName = name === 'lastName' ? value : prev.lastName;
          if (firstName || lastName) {
            return {
              ...prev,
              [name]: value,
              name: `${firstName || ''} ${lastName || ''}`.trim()
            };
          }
        }
        return { ...prev, [name]: value };
      });
    }

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {/* First Name Field */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                />
              </div>

              {/* Last Name Field */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${formErrors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                />
              </div>

              {/* Stage/Artist Name Field */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Artist/Stage Name
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

              {/* Gender Field */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gender">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${formErrors.gender ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              {/* Bio Field */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bio">
                  Biography
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Tell us about yourself as an artist"
                />
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
            </div>

            <div>
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
                  className={`w-full px-3 py-2 border ${formErrors.genre ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                />
                {formErrors.genre && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.genre}</p>
                )}
              </div>

              {/* Social Links Section */}
              <div className="mb-6">
                <h3 className="text-gray-700 font-bold mb-3 border-b pb-2">Social Links</h3>

                {/* Website */}
                <div className="mb-3">
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="website">Website</label>
                  <input
                    id="website"
                    name="socialLinks.website"
                    type="url"
                    value={(formData.socialLinks as any)?.website || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                {/* Facebook */}
                <div className="mb-3">
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="facebook">Facebook</label>
                  <input
                    id="facebook"
                    name="socialLinks.facebook"
                    type="url"
                    value={(formData.socialLinks as any)?.facebook || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>

                {/* Twitter */}
                <div className="mb-3">
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="twitter">Twitter</label>
                  <input
                    id="twitter"
                    name="socialLinks.twitter"
                    type="url"
                    value={(formData.socialLinks as any)?.twitter || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="https://twitter.com/yourhandle"
                  />
                </div>

                {/* Instagram */}
                <div className="mb-3">
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="instagram">Instagram</label>
                  <input
                    id="instagram"
                    name="socialLinks.instagram"
                    type="url"
                    value={(formData.socialLinks as any)?.instagram || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="https://instagram.com/yourprofile"
                  />
                </div>
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