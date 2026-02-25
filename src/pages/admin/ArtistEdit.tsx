import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useArtistContext } from '../../context/ArtistContext';
import Preloader from '../../components/ui/Preloader';
import { toast } from 'react-hot-toast';
import { Artist } from '../../services/artistService';
import genreService, { Genre } from '../../services/genreService';

const ArtistEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchArtistById, selectedArtist, updateArtist, loading, error } = useArtistContext();

  // Local form state
  const [formData, setFormData] = useState<Partial<Artist>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [availableGenres, setAvailableGenres] = useState<Genre[]>([]);
  const [loadingGenres, setLoadingGenres] = useState<boolean>(true);

  // Fetch artist and genre data when component mounts
  useEffect(() => {
    if (id) {
      fetchArtistById(id);
    }
  }, [id, fetchArtistById]);

  // Load genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genres = await genreService.getAllGenres();
        setAvailableGenres(genres);
      } catch (err) {
        toast.error('Failed to load genres');
      } finally {
        setLoadingGenres(false);
      }
    };
    fetchGenres();
  }, []);

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
        navigate(`/admin/artist-details/${id}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel editing and go back
  const handleCancel = () => {
    navigate(`/admin/artist-details/${id}`);
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
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Genres
                </label>
                {loadingGenres ? (
                  <div className="text-gray-500 text-sm py-2">Loading genres...</div>
                ) : (
                  <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-white space-y-2">
                    {availableGenres.map((genre) => {
                      const isSelected = Array.isArray(formData.genres) && formData.genres.includes(genre.name);
                      return (
                        <label key={genre._id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                            checked={isSelected}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setFormData(prev => {
                                const current = Array.isArray(prev.genres) ? prev.genres : [];
                                if (checked) {
                                  return { ...prev, genres: [...current, genre.name] };
                                } else {
                                  return { ...prev, genres: current.filter(g => g !== genre.name) };
                                }
                              });
                            }}
                          />
                          <span className="text-sm text-gray-700">{genre.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
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