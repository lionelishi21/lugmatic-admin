import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Preloader from '../../components/ui/Preloader';
import useCreateArtist from '../../hooks/artist/useCreateArtist';

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

const ArtistCreate: React.FC = () => {
  const navigate = useNavigate();
  const { isSubmitting, createArtist } = useCreateArtist();

  // Form state
  const [formData, setFormData] = useState<ArtistFormData>({
    firstName: '',
    lastName: '',
    name: '',
    email: '',
    bio: '',
    gender: '',
    genres: [],
    socialLinks: {
      website: '',
      facebook: '',
      twitter: '',
      instagram: ''
    },
    image: null
  });
  
  const [genreInput, setGenreInput] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Jamaican music genres
  const jamaicaGenres = [
    "Mento", "Ska", "Rocksteady", "Reggae", "Dub", "Dancehall", "Ragga", "Reggaeton", 
    "Jungle/DnB", "Gospel Reggae", "Lover's Rock", "Dub Poetry", "Jamaican Jazz", 
    "Reggae Fusion", "Afrobeat & Dancehall Fusion"
  ];
  
  // Handle text input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Handle nested socialLinks fields
    if (name.startsWith('socialLinks.')) {
      const socialLinkField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialLinkField]: value
        }
      }));
    } else {
      // Handle top-level fields
      setFormData(prev => {
        // Update stage name when first or last name changes
        if (name === 'firstName' || name === 'lastName') {
          const firstName = name === 'firstName' ? value : prev.firstName;
          const lastName = name === 'lastName' ? value : prev.lastName;
          if (firstName || lastName) {
            return { 
              ...prev, 
              [name]: value,
              name: `${firstName} ${lastName}`.trim() 
            };
          }
        }
        
        // Default case for other fields
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

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle genre management
  const addGenre = () => {
    if (genreInput.trim() && !formData.genres.includes(genreInput.trim())) {
      setFormData(prev => ({
        ...prev,
        genres: [...prev.genres, genreInput.trim()]
      }));
      setGenreInput('');
    }
  };

  const removeGenre = (genreToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.filter(genre => genre !== genreToRemove)
    }));
  };

  // Add a predefined genre
  const addPredefinedGenre = (genre: string) => {
    if (!formData.genres.includes(genre)) {
      setFormData(prev => ({
        ...prev,
        genres: [...prev.genres, genre]
      }));
    }
  };

  // Validate form data
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.firstName || formData.firstName.trim() === '') {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName || formData.lastName.trim() === '') {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Artist name is required';
    }
    
    if (!formData.email || formData.email.trim() === '') {
      errors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.gender) {
      errors.gender = 'Gender is required';
    }
    
    if (formData.genres.length === 0) {
      errors.genres = 'At least one genre is required';
    }
    
    // URL validation for social links if provided
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/;
    
    Object.entries(formData.socialLinks).forEach(([key, value]) => {
      if (value && !urlPattern.test(value)) {
        errors[`socialLinks.${key}`] = 'Please enter a valid URL';
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        console.log('Submitting form data:', formData); // Debug log
        await createArtist(formData);
        navigate('/admin/artist-management');
      } catch (err) {
        // Error is already handled by the hook
        console.error('Failed to create artist:', err);
      }
    } else {
      console.log('Form validation failed. Current errors:', formErrors);
      console.log('Current form data:', formData);
    }
  };

  // Cancel creating and go back
  const handleCancel = () => {
    navigate('/admin/artists');
  };

  // Show loading state
  if (isSubmitting) {
    return <Preloader isVisible={true} text="Creating artist profile..." />;
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
        <h1 className="text-3xl font-bold text-gray-800">Create Artist Profile</h1>
        <p className="text-gray-600 mt-1">Set up your artist presence on the platform</p>
      </motion.div>

      {/* Create Form */}
      <motion.div 
        className="bg-white p-6 rounded-lg shadow-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-6">
            <div>
              {/* First Name Field */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${
                    formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                  placeholder="Enter first name"
                />
                {formErrors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>
                )}
              </div>

              {/* Last Name Field */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${
                    formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                  placeholder="Enter last name"
                />
                {formErrors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>
                )}
              </div>

              {/* Stage/Artist Name Field */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Artist/Stage Name <span className="text-red-500">*</span>
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
                  placeholder="Enter artist name or stage name"
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

              {/* Gender Field */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gender">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${
                    formErrors.gender ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
                {formErrors.gender && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.gender}</p>
                )}
              </div>

              {/* Bio Field */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bio">
                  Biography
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Tell us about yourself as an artist"
                />
              </div>

              {/* Profile Image Field */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
                  Profile Image
                </label>
                <div className="flex items-center space-x-4">
                  {imagePreview && (
                    <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-300">
                      <img 
                        src={imagePreview} 
                        alt="Profile preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                </div>
              </div>
            </div>

            <div>                                                                                                                                                                                                                                                 
              {/* Genres Field */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Genres <span className="text-red-500">*</span>
                </label>

                <div className="flex">
                  <input
                    type="text"
                    value={genreInput}
                    onChange={(e) => setGenreInput(e.target.value)}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Add a music genre"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGenre())}
                  />
                  <button
                    type="button"
                    onClick={addGenre}
                    className="px-4 py-2 bg-green-600 text-white rounded-r-lg hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>

                {formErrors.genres && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.genres}</p>
                )}

                {/* Jamaican Genre Quick Selectors */}
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Popular Jamaican Genres:</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {jamaicaGenres.map((genre, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => addPredefinedGenre(genre)}
                        className={`px-2 py-1 text-xs rounded-full border ${
                          formData.genres.includes(genre)
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.genres.map((genre, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full flex items-center"
                    >
                      {genre}
                      <button 
                        type="button" 
                        onClick={() => removeGenre(genre)}
                        className="ml-2 text-green-600 hover:text-red-500 focus:outline-none"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Social Links Section */}
              <div className="mb-6">
                <h3 className="text-gray-700 font-bold mb-2">Social Links</h3>
                
                {/* Website */}
                <div className="mb-3">
                  <label className="block text-gray-700 text-sm mb-1" htmlFor="website">
                    Website
                  </label>
                  <input
                    id="website"
                    name="socialLinks.website"
                    type="url"
                    value={formData.socialLinks.website}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors['socialLinks.website'] ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                    placeholder="https://yourwebsite.com"
                  />
                  {formErrors['socialLinks.website'] && (
                    <p className="text-red-500 text-xs mt-1">{formErrors['socialLinks.website']}</p>
                  )}
                </div>
                
                {/* Facebook */}
                <div className="mb-3">
                  <label className="block text-gray-700 text-sm mb-1" htmlFor="facebook">
                    Facebook
                  </label>
                  <input
                    id="facebook"
                    name="socialLinks.facebook"
                    type="url"
                    value={formData.socialLinks.facebook}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors['socialLinks.facebook'] ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                    placeholder="https://facebook.com/yourpage"
                  />
                  {formErrors['socialLinks.facebook'] && (
                    <p className="text-red-500 text-xs mt-1">{formErrors['socialLinks.facebook']}</p>
                  )}
                </div>
                
                {/* Twitter */}
                <div className="mb-3">
                  <label className="block text-gray-700 text-sm mb-1" htmlFor="twitter">
                    Twitter
                  </label>
                  <input
                    id="twitter"
                    name="socialLinks.twitter"
                    type="url"
                    value={formData.socialLinks.twitter}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors['socialLinks.twitter'] ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                    placeholder="https://twitter.com/yourhandle"
                  />
                  {formErrors['socialLinks.twitter'] && (
                    <p className="text-red-500 text-xs mt-1">{formErrors['socialLinks.twitter']}</p>
                  )}
                </div>
                
                {/* Instagram */}
                <div className="mb-3">
                  <label className="block text-gray-700 text-sm mb-1" htmlFor="instagram">
                    Instagram
                  </label>
                  <input
                    id="instagram"
                    name="socialLinks.instagram"
                    type="url"
                    value={formData.socialLinks.instagram}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors['socialLinks.instagram'] ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                    placeholder="https://instagram.com/yourprofile"
                  />
                  {formErrors['socialLinks.instagram'] && (
                    <p className="text-red-500 text-xs mt-1">{formErrors['socialLinks.instagram']}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 mt-6">
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
              {isSubmitting ? 'Creating...' : 'Create Artist Profile'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ArtistCreate;