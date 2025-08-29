import React, { useState, useCallback } from 'react';
import { 
  Upload, 
  X, 
  Save,
  AlertCircle
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { giftService } from '../services/giftService';
import { CreateGiftRequest } from '../types';
import toast from 'react-hot-toast';

interface GiftUploadProps {
  onGiftCreated?: (gift: unknown) => void;
  onClose?: () => void;
}

interface UploadResponse {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
}

const GiftUpload: React.FC<GiftUploadProps> = ({ onGiftCreated, onClose }) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CreateGiftRequest>({
    name: '',
    description: '',
    price: 0,
    category: '',
    image: '',
    isActive: true,
    stock: 0,
    rules: {
      minAmount: 1,
      maxAmount: 100,
      cooldownMinutes: 0,
      dailyLimit: 10,
      requiresVerification: false,
    },
    effects: {
      showAnimation: true,
      playSound: true,
      specialEffect: 'none',
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFormData(prev => ({ ...prev, image: url }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Gift name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!selectedFile && !formData.image) {
      newErrors.image = 'Gift image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    try {
      setUploading(true);

      // Upload image if file is selected
      let imageUrl = formData.image;
      if (selectedFile) {
        try {
          const uploadResponse = await giftService.uploadGiftImage(selectedFile);
          const uploadData = uploadResponse.data.data as UploadResponse;
          imageUrl = uploadData.url;
        } catch {
          toast.error('Failed to upload image');
          return;
        }
      }

      // Create gift
      const giftData = {
        ...formData,
        image: imageUrl,
      };

      const response = await giftService.createGift(giftData);
      
      toast.success('Gift created successfully!');
      
      if (onGiftCreated) {
        onGiftCreated(response.data);
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: '',
        image: '',
        isActive: true,
        stock: 0,
        rules: {
          minAmount: 1,
          maxAmount: 100,
          cooldownMinutes: 0,
          dailyLimit: 10,
          requiresVerification: false,
        },
        effects: {
          showAnimation: true,
          playSound: true,
          specialEffect: 'none',
        },
      });
      setSelectedFile(null);
      setPreviewUrl('');
      setErrors({});

    } catch (error) {
      toast.error('Failed to create gift');
      console.error('Error creating gift:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          Upload New Gift
        </h1>
        <p className="text-gray-600 text-lg">
          Create and upload new gifts with custom images and settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Image Upload Section */}
        <div className="lg:col-span-1">
          <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Gift Image</h3>

            {previewUrl ? (
              <div className="relative mb-4">
                <img
                  src={previewUrl}
                  alt="Gift preview"
                  className="w-full h-48 object-cover rounded-xl"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  isDragActive 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-300 hover:border-purple-500 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {isDragActive ? 'Drop the image here' : 'Drag & drop image here'}
                </h4>
                <p className="text-gray-600 mb-2">or click to select</p>
                <p className="text-sm text-gray-500">
                  Supports: JPG, PNG, GIF, WebP (max 5MB)
                </p>
              </div>
            )}

            {errors.image && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mt-4">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-800 text-sm">{errors.image}</span>
              </div>
            )}
          </div>
        </div>

        {/* Form Section */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Gift Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gift Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gift Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter gift name"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.category ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select category</option>
                  <option value="virtual">Virtual</option>
                  <option value="physical">Physical</option>
                  <option value="experience">Experience</option>
                  <option value="digital">Digital</option>
                  <option value="premium">Premium</option>
                  <option value="limited">Limited Edition</option>
                </select>
                {errors.category && (
                  <p className="text-red-600 text-sm mt-1">{errors.category}</p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', Number(e.target.value))}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.price ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                {errors.price && (
                  <p className="text-red-600 text-sm mt-1">{errors.price}</p>
                )}
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter gift description..."
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Rules Section */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Gift Rules</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Amount
                  </label>
                  <input
                    type="number"
                    value={formData.rules?.minAmount || 1}
                    onChange={(e) => setFormData({
                      ...formData,
                      rules: { 
                        ...formData.rules, 
                        minAmount: Number(e.target.value),
                        maxAmount: formData.rules?.maxAmount || 100,
                        cooldownMinutes: formData.rules?.cooldownMinutes || 0,
                        dailyLimit: formData.rules?.dailyLimit || 10,
                        requiresVerification: formData.rules?.requiresVerification || false
                      }
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Amount
                  </label>
                  <input
                    type="number"
                    value={formData.rules?.maxAmount || 100}
                    onChange={(e) => setFormData({
                      ...formData,
                      rules: { 
                        ...formData.rules, 
                        maxAmount: Number(e.target.value),
                        minAmount: formData.rules?.minAmount || 1,
                        cooldownMinutes: formData.rules?.cooldownMinutes || 0,
                        dailyLimit: formData.rules?.dailyLimit || 10,
                        requiresVerification: formData.rules?.requiresVerification || false
                      }
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Limit
                  </label>
                  <input
                    type="number"
                    value={formData.rules?.dailyLimit || 10}
                    onChange={(e) => setFormData({
                      ...formData,
                      rules: { 
                        ...formData.rules, 
                        dailyLimit: Number(e.target.value),
                        minAmount: formData.rules?.minAmount || 1,
                        maxAmount: formData.rules?.maxAmount || 100,
                        cooldownMinutes: formData.rules?.cooldownMinutes || 0,
                        requiresVerification: formData.rules?.requiresVerification || false
                      }
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cooldown (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.rules?.cooldownMinutes || 0}
                    onChange={(e) => setFormData({
                      ...formData,
                      rules: { 
                        ...formData.rules, 
                        cooldownMinutes: Number(e.target.value),
                        minAmount: formData.rules?.minAmount || 1,
                        maxAmount: formData.rules?.maxAmount || 100,
                        dailyLimit: formData.rules?.dailyLimit || 10,
                        requiresVerification: formData.rules?.requiresVerification || false
                      }
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Effects Section */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Gift Effects</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Show Animation</label>
                    <p className="text-xs text-gray-500">Display animation when gift is sent</p>
                  </div>
                  <button
                    onClick={() => setFormData({
                      ...formData,
                      effects: { 
                        ...formData.effects, 
                        showAnimation: !formData.effects?.showAnimation,
                        playSound: formData.effects?.playSound || true,
                        specialEffect: formData.effects?.specialEffect || 'none'
                      }
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.effects?.showAnimation ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.effects?.showAnimation ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Play Sound</label>
                    <p className="text-xs text-gray-500">Play sound effect when gift is sent</p>
                  </div>
                  <button
                    onClick={() => setFormData({
                      ...formData,
                      effects: { 
                        ...formData.effects, 
                        playSound: !formData.effects?.playSound,
                        showAnimation: formData.effects?.showAnimation || true,
                        specialEffect: formData.effects?.specialEffect || 'none'
                      }
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.effects?.playSound ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.effects?.playSound ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-end gap-4">
        <button
          onClick={onClose}
          disabled={uploading}
          className="px-6 py-3 text-gray-600 hover:text-gray-800 font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={uploading || !selectedFile}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Creating Gift...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Create Gift
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default GiftUpload; 