import { AxiosResponse } from 'axios';
import apiService from './api';

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data: T;
};

const extractResponseData = <T>(response: AxiosResponse<T | ApiEnvelope<T>>): T => {
  const { data } = response;
  if (data && typeof data === 'object' && 'data' in (data as ApiEnvelope<T>)) {
    return (data as ApiEnvelope<T>).data;
  }
  return data as T;
};

export interface GiftResponse {
  _id: string;
  name: string;
  description?: string;
  image: string;
  type: 'coin' | 'badge' | 'sticker' | 'special';
  value: number;
  coinCost: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'music' | 'celebration' | 'love' | 'support' | 'funny' | 'custom';
  isActive: boolean;
  isSeasonal: boolean;
  seasonalStart?: string;
  seasonalEnd?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminGiftPayload {
  name: string;
  description?: string;
  image: string;
  type: 'coin' | 'badge' | 'sticker' | 'special';
  value: number;
  coinCost: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'music' | 'celebration' | 'love' | 'support' | 'funny' | 'custom';
  isActive: boolean;
  isSeasonal: boolean;
  seasonalStart?: string;
  seasonalEnd?: string;
}

const adminGiftService = {
  getAllGifts: async (): Promise<GiftResponse[]> => {
    const response = await apiService.get<GiftResponse[]>('/gift');
    return extractResponseData(response);
  },

  createGift: async (payload: AdminGiftPayload): Promise<GiftResponse> => {
    const response = await apiService.post<GiftResponse>('/gift/admin/create', payload);
    return extractResponseData(response);
  },

  createGiftWithImage: async (formData: FormData): Promise<GiftResponse> => {
    // Token is automatically added by API interceptor
    // Do not set Content-Type header; axios will set boundary automatically
    const response = await apiService.post<GiftResponse>('/gift/admin/create-with-image', formData);
    return extractResponseData(response);
  },

  updateGift: async (id: string, payload: Partial<AdminGiftPayload>): Promise<GiftResponse> => {
    const response = await apiService.put<GiftResponse>(`/gift/admin/${id}`, payload);
    return extractResponseData(response);
  },

  updateGiftWithImage: async (id: string, formData: FormData): Promise<GiftResponse> => {
    const response = await apiService.put<GiftResponse>(`/gift/admin/${id}/with-image`, formData);
    return extractResponseData(response);
  },

  softDeleteGift: async (id: string): Promise<GiftResponse> => {
    return adminGiftService.updateGift(id, { isActive: false });
  },

  uploadGiftIcon: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    // Backend expects field name 'image' (as per uploadGiftImage.single('image'))
    formData.append('image', file);
    
    console.log('Uploading file:', {
      name: file.name,
      type: file.type,
      size: file.size,
      formDataKeys: Array.from(formData.keys())
    });
    
    try {
      // Don't set Content-Type header - let axios set it automatically with boundary for FormData
      const response = await apiService.post<{ success: boolean; url?: string; data?: { url: string; filename: string; originalName: string; size: number; mimetype: string } }>('/gift/upload-image', formData);
      
      console.log('Upload response:', response);
      console.log('Response data:', response.data);
      
      // Backend returns: { success: true, url: '/uploads/gifts/filename', data: { url: '/uploads/gifts/filename', ... } }
      const responseData = response.data;
      
      // Handle the response structure - check top-level url first (new format)
      if (responseData && typeof responseData === 'object') {
        // Check top-level url (new format)
        if ('url' in responseData && responseData.url) {
          console.log('Found URL at top level:', responseData.url);
          return { url: responseData.url };
        }
        // Check nested data.url
        if ('data' in responseData && responseData.data && typeof responseData.data === 'object') {
          const dataObj = responseData.data as { url: string };
          if ('url' in dataObj && dataObj.url) {
            console.log('Found URL in data:', dataObj.url);
            return { url: dataObj.url };
          }
        }
      }
      
      // Try extractResponseData as fallback
      const extracted = extractResponseData(response);
      if (extracted && typeof extracted === 'object') {
        if ('url' in extracted && extracted.url) {
          console.log('Found URL in extracted data:', extracted.url);
          return { url: (extracted as { url: string }).url };
        }
        if ('data' in extracted && extracted.data && typeof extracted.data === 'object' && 'url' in extracted.data) {
          const nestedUrl = (extracted.data as { url: string }).url;
          if (nestedUrl) {
            console.log('Found URL in nested extracted data:', nestedUrl);
            return { url: nestedUrl };
          }
        }
      }
      
      console.error('Unexpected response structure:', responseData);
      throw new Error('Unexpected response structure from upload endpoint - URL not found');
    } catch (error: any) {
      console.error('Upload error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload icon';
      throw new Error(errorMessage);
    }
  }
};

export default adminGiftService;

