import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GiftResponse, AdminGiftPayload } from '../../services/adminGiftService';
import { getAccessToken } from '../../services/api';
import { toast } from 'react-hot-toast';
import {
    Upload,
    Calendar,
    Image as ImageIcon,
    Coins,
  DollarSign,
  Tag,
  Type as TypeIcon,
  } from 'lucide-react';
import FileUpload from '../ui/FileUpload';
import { useCreateGift } from '../../hooks/gift/useCreateGift';
import { createGiftWithImage, createGiftJson, updateGift, updateGiftWithImage, UpdateGiftWithImagePayload } from '../../store/slices/giftSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';

interface GiftFormData {
  name: string;
  description: string;
  value: number;
  coinCost: number;
  type: AdminGiftPayload['type'];
  rarity: AdminGiftPayload['rarity'];
  category: string;
  image: string;
  isActive: boolean;
  isSeasonal: boolean;
  seasonalStart: string;
  seasonalEnd: string;
}

interface GiftDialogProps {
  open: boolean;
  onClose: () => void;
  editingGift?: GiftResponse | null;
  onSuccess?: () => void;
}

const INITIAL_FORM_DATA: GiftFormData = {
    name: '',
    description: '',
    value: 0,
    coinCost: 0,
    type: 'coin',
    rarity: 'common',
  category: 'support',
    image: '',
    isActive: true,
    isSeasonal: false,
    seasonalStart: '',
    seasonalEnd: '',
};

const GIFT_TYPES: Array<{ value: AdminGiftPayload['type']; label: string }> = [
  { value: 'coin', label: 'Coin' },
  { value: 'badge', label: 'Badge' },
  { value: 'sticker', label: 'Sticker' },
  { value: 'special', label: 'Special' },
];

const GIFT_RARITIES: Array<{ value: AdminGiftPayload['rarity']; label: string }> = [
  { value: 'common', label: 'Common' },
  { value: 'rare', label: 'Rare' },
  { value: 'epic', label: 'Epic' },
  { value: 'legendary', label: 'Legendary' },
];

const GIFT_CATEGORIES: string[] = ['support', 'music', 'celebration', 'love', 'funny', 'custom'];

const GiftDialog: React.FC<GiftDialogProps> = ({ open, onClose, editingGift, onSuccess }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<GiftFormData>(INITIAL_FORM_DATA);
  const [uploading, setUploading] = useState(false);
  const [iconUploading] = useState(false);
  const [pendingIconFile, setPendingIconFile] = useState<File | null>(null);
  const { createGiftHandler, isLoading } = useCreateGift();

  // Reset form when dialog opens/closes or editingGift changes
  useEffect(() => {
    if (open) {
      if (editingGift) {
        setFormData({
          name: editingGift.name,
          description: editingGift.description || '',
          value: editingGift.value,
          coinCost: editingGift.coinCost,
          type: editingGift.type,
          rarity: editingGift.rarity,
          category: editingGift.category,
          image: editingGift.image,
          isActive: editingGift.isActive,
          isSeasonal: editingGift.isSeasonal,
          seasonalStart: editingGift.seasonalStart ? editingGift.seasonalStart.split('T')[0] : '',
          seasonalEnd: editingGift.seasonalEnd ? editingGift.seasonalEnd.split('T')[0] : '',
        });
      } else {
        setFormData(INITIAL_FORM_DATA);
      }
      setPendingIconFile(null);
    }
  }, [open, editingGift]);

  const handleIconSelect = useCallback((file: File) => {
    setPendingIconFile(file);
    setFormData((prev) => ({ ...prev, image: '' }));
    toast('Icon file selected. It will be uploaded when you submit.', { icon: '📎' });
  }, []);

  // Derived state: form validity and submitting flag must be defined before handleSubmit
  const isSubmitting = useMemo(() => uploading || iconUploading || isLoading, [uploading, iconUploading, isLoading]);

  const getValidationError = useCallback((): string | null => {
    if (!formData.name.trim()) return 'Please enter a gift name';
    if (!formData.category) return 'Please select a category';
    // When editing, existing image is okay; when creating, need either file or URL
    if (!editingGift && !pendingIconFile && !formData.image) return 'Please upload an icon file';
    if (!formData.value || formData.value <= 0) return 'Please enter a valid value (> 0)';
    if (!formData.coinCost || formData.coinCost <= 0) return 'Please enter a valid coin cost (> 0)';
    return null;
  }, [formData, pendingIconFile, editingGift]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Check token before submission
      const token = getAccessToken();
      if (!token) {
        toast.error('Session expired. Please log in again.', { duration: 3000 });
        navigate('/login', { replace: true });
        return;
      }

      const validationMsg = getValidationError();
      if (validationMsg) {
        toast.error(validationMsg, { duration: 3000 });
        return;
      }

      try {
        setUploading(true);

        const giftPayload = {
          name: formData.name.trim(),
          description: formData.description?.trim() || undefined,
          type: formData.type,
          value: Number(formData.value),
          coinCost: Number(formData.coinCost),
          category: formData.category as AdminGiftPayload['category'],
          rarity: formData.rarity,
          isActive: formData.isActive,
          isSeasonal: formData.isSeasonal,
          seasonalStart: formData.isSeasonal ? formData.seasonalStart || undefined : undefined,
          seasonalEnd: formData.isSeasonal ? formData.seasonalEnd || undefined : undefined,
        };

        let resultAction;

        if (editingGift) {
          // UPDATE existing gift
          if (pendingIconFile) {
            // Update with new image
            const updatePayload: UpdateGiftWithImagePayload = {
              id: editingGift._id,
              image: pendingIconFile,
              ...giftPayload,
            };
            resultAction = await dispatch(updateGiftWithImage(updatePayload));
            if (updateGiftWithImage.rejected.match(resultAction)) {
              throw new Error((resultAction.payload as string) || 'Failed to update gift');
            }
          } else {
            // Update without image change
            resultAction = await dispatch(updateGift({
              id: editingGift._id,
              data: {
                ...giftPayload,
                image: formData.image,
              } as AdminGiftPayload,
            }));
            if (updateGift.rejected.match(resultAction)) {
              throw new Error((resultAction.payload as string) || 'Failed to update gift');
            }
          }
        } else {
          // CREATE new gift
          resultAction = await createGiftHandler(giftPayload, pendingIconFile || undefined);
          if (createGiftWithImage.rejected.match(resultAction) || createGiftJson.rejected.match(resultAction)) {
            throw new Error((resultAction.payload as string) || 'Failed to create gift');
          }
        }

        toast.success(editingGift ? 'Gift updated successfully!' : 'Gift created successfully!', {
          duration: 4000,
          icon: '✅',
          style: { background: '#10b981', color: '#fff' },
        });
        onSuccess?.();
        onClose();
      } catch (error: unknown) {
        const errorMessage =
          (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
          (error as Error).message ||
          'Failed to save gift';

        if (
          errorMessage.includes('Access token required') ||
          errorMessage.includes('token') ||
          (error as { response?: { status?: number } }).response?.status === 401
        ) {
          toast.error('Authentication required. Please log in to continue.', {
            duration: 4000,
            icon: '🔒',
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          });
          navigate('/login', { replace: true });
        } else {
          toast.error(`Failed to save gift: ${errorMessage}`, {
            duration: 5000,
            icon: '❌',
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          });
        }
        console.error('Error saving gift:', error);
      } finally {
        setUploading(false);
      }
    },
    [formData, pendingIconFile, onClose, onSuccess, navigate, createGiftHandler, getValidationError]
  );

  const handleClose = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setPendingIconFile(null);
    onClose();
  }, [onClose]);

  const updateFormField = useCallback(
    <K extends keyof GiftFormData>(field: K, value: GiftFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleNumberChange = useCallback(
    (field: 'value' | 'coinCost', value: string) => {
      const numValue = value === '' ? 0 : parseFloat(value);
      updateFormField(field, (isNaN(numValue) ? 0 : numValue) as GiftFormData[typeof field]);
    },
    [updateFormField]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
              {editingGift ? 'Edit Gift' : 'Add New Gift'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {editingGift ? 'Update gift details below' : 'Fill in the details to create a new gift'}
              </p>
          </div>
        <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Gift Name */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gift Name *
                </label>
                <input
                type="text"
                    placeholder="Enter gift name"
                value={formData.name}
                  onChange={(e) => updateFormField('name', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-colors ${
                    !formData.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                />
                {!formData.name && (
                    <p className="text-xs text-red-600 mt-1">Gift name is required</p>
                )}
                </div>

              {/* Description */}
                <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                    placeholder="Enter gift description (optional)"
                value={formData.description}
                  onChange={(e) => updateFormField('description', e.target.value)}
                rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-400 resize-none"
                />
                </div>

              {/* Type and Rarity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <TypeIcon className="w-4 h-4" />
                    Type *
                    </label>
                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3">
                    <select
                        value={formData.type}
                      onChange={(e) =>
                        updateFormField('type', e.target.value as AdminGiftPayload['type'])
                      }
                        className="w-full py-2 focus:outline-none bg-transparent"
                    >
                      {GIFT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Rarity *
                    </label>
                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3">
                    <select
                        value={formData.rarity}
                      onChange={(e) =>
                        updateFormField('rarity', e.target.value as AdminGiftPayload['rarity'])
                      }
                        className="w-full py-2 focus:outline-none bg-transparent"
                    >
                      {GIFT_RARITIES.map((rarity) => (
                        <option key={rarity.value} value={rarity.value}>
                          {rarity.label}
                        </option>
                      ))}
                    </select>
                    </div>
                </div>
                </div>

              {/* Category */}
                <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                <select
                value={formData.category}
                  onChange={(e) => updateFormField('category', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-colors ${
                    !formData.category ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                >
                    <option value="">Select a category</option>
                  {GIFT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
                {!formData.category && (
                    <p className="text-xs text-red-600 mt-1">Category is required</p>
                )}
                </div>
            </div>

            {/* Right Column */}
            <div>
              {/* Value and Coin Cost */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Value (USD) *
                    </label>
                <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={formData.value || ''}
                    onChange={(e) => handleNumberChange('value', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-colors ${
                        formData.value <= 0 ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                    />
                    {formData.value <= 0 && (
                    <p className="text-xs text-red-600 mt-1">Value must be greater than 0</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    Coin Cost *
                    </label>
                <input
                type="number"
                    step="1"
                    min="1"
                    placeholder="0"
                    value={formData.coinCost || ''}
                    onChange={(e) => handleNumberChange('coinCost', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-colors ${
                        formData.coinCost <= 0 ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                    />
                    {formData.coinCost <= 0 && (
                    <p className="text-xs text-red-600 mt-1">Coin cost must be greater than 0</p>
                    )}
                </div>
                </div>

              {/* Image Upload */}
                <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Gift Icon * (PNG, SVG, GIF)
                </label>
                <FileUpload
                    label="Upload Icon"
                    accept="image/png,image/svg+xml,image/gif,image/jpeg,image/jpg"
                    maxSize={5}
                    onFileSelect={handleIconSelect}
                    onFileRemove={() => {
                    updateFormField('image', '');
                    setPendingIconFile(null);
                    toast('Icon file removed', { icon: '🗑️' });
                    }}
                  currentFile={
                    formData.image || (pendingIconFile ? pendingIconFile.name : undefined)
                  }
                    error={!formData.image && !pendingIconFile ? 'Icon is required' : undefined}
                />
                {pendingIconFile && !iconUploading && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-700 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        File selected: {pendingIconFile.name} (will be uploaded on submit)
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                        Size: {(pendingIconFile.size / 1024).toFixed(2)} KB
                    </p>
                    </div>
                )}
                {iconUploading && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 animate-pulse" />
                        Uploading icon... Please wait
                    </p>
                    </div>
                )}
                {formData.image && !iconUploading && !pendingIconFile && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-700 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Icon URL ready
                    </p>
                    <p
                      className="text-xs text-gray-600 mt-1 break-all truncate"
                      title={formData.image}
                    >
                        {formData.image}
                    </p>
                    </div>
                )}
                </div>

              {/* Active Checkbox */}
                <label className="flex items-center mt-4">
                <input
                    type="checkbox"
                    checked={formData.isActive}
                  onChange={(e) => updateFormField('isActive', e.target.checked)}
                    className="mr-3"
                />
                <span>Active</span>
                </label>

              {/* Seasonal Checkbox */}
                <label className="flex items-center mt-4">
                <input
                    type="checkbox"
                    checked={formData.isSeasonal}
                  onChange={(e) => updateFormField('isSeasonal', e.target.checked)}
                    className="mr-3"
                />
                <span>Seasonal availability</span>
                </label>

              {/* Seasonal Dates */}
                {formData.isSeasonal && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                <input
                        type="date"
                        value={formData.seasonalStart}
                      onChange={(e) => updateFormField('seasonalStart', e.target.value)}
                        className="w-full py-2 focus:outline-none"
                    />
                    </div>
                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                <input
                        type="date"
                        value={formData.seasonalEnd}
                      onChange={(e) => updateFormField('seasonalEnd', e.target.value)}
                        className="w-full py-2 focus:outline-none"
                    />
                    </div>
                </div>
                )}
            </div>
            </div>

          {/* Form Actions */}
          <div className="p-6 border-t border-gray-200 flex justify-end gap-4 mt-6">
            <button
            type="button"
              onClick={handleClose}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 font-medium rounded-xl transition-colors"
            >
            Cancel
            </button>
            <button
            type="submit"
              disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] justify-center"
            >
              {isSubmitting ? (
                <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>{iconUploading ? 'Uploading...' : 'Saving...'}</span>
                </>
            ) : (
                <>
                <Upload className="w-5 h-5" />
                <span>{editingGift ? 'Update Gift' : 'Create Gift'}</span>
                </>
            )}
            </button>
        </div>
        </form>
        </div>
    </div>
  );
};

export default GiftDialog;