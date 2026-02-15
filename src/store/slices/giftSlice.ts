import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminGiftService, { GiftResponse, AdminGiftPayload } from '../../services/adminGiftService';

export const fetchGifts = createAsyncThunk(
  'gift/fetchGifts',
  async (_, { rejectWithValue }) => {
    try {
      return await adminGiftService.getAllGifts();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch gifts';
      return rejectWithValue(message);
    }
  }
);

export interface CreateGiftWithImagePayload {
  image: File;
  name: string;
  type: 'coin' | 'badge' | 'sticker' | 'special';
  value: number;
  coinCost: number;
  category: 'music' | 'celebration' | 'love' | 'support' | 'funny' | 'custom';
  description?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  isSeasonal?: boolean;
  seasonalStart?: string;
  seasonalEnd?: string;
}

export const createGiftWithImage = createAsyncThunk(
  'gift/createGiftWithImage',
  async (payload: CreateGiftWithImagePayload, { rejectWithValue }) => {
    try {
      // Create FormData in the slice - service just makes the request
      const formData = new FormData();
      formData.append('image', payload.image);
      formData.append('name', payload.name);
      formData.append('type', payload.type);
      formData.append('value', payload.value.toString());
      formData.append('coinCost', payload.coinCost.toString());
      formData.append('category', payload.category);
      if (payload.description) formData.append('description', payload.description);
      if (payload.rarity) formData.append('rarity', payload.rarity);
      if (payload.isSeasonal !== undefined) formData.append('isSeasonal', payload.isSeasonal.toString());
      if (payload.seasonalStart) formData.append('seasonalStart', payload.seasonalStart);
      if (payload.seasonalEnd) formData.append('seasonalEnd', payload.seasonalEnd);
      
      return await adminGiftService.createGiftWithImage(formData);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to create gift';
      return rejectWithValue(message);
    }
  }
);

export const createGiftJson = createAsyncThunk(
  'gift/createGiftJson',
  async (data: AdminGiftPayload, { rejectWithValue }) => {
    try {
      return await adminGiftService.createGift(data);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to create gift';
      return rejectWithValue(message);
    }
  }
);

export const updateGift = createAsyncThunk(
  'gift/updateGift',
  async ({ id, data }: { id: string; data: Partial<AdminGiftPayload> }, { rejectWithValue }) => {
    try {
      return await adminGiftService.updateGift(id, data);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to update gift';
      return rejectWithValue(message);
    }
  }
);

export interface UpdateGiftWithImagePayload {
  id: string;
  image: File;
  name?: string;
  type?: 'coin' | 'badge' | 'sticker' | 'special';
  value?: number;
  coinCost?: number;
  category?: 'music' | 'celebration' | 'love' | 'support' | 'funny' | 'custom';
  description?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  isActive?: boolean;
  isSeasonal?: boolean;
  seasonalStart?: string;
  seasonalEnd?: string;
}

export const updateGiftWithImage = createAsyncThunk(
  'gift/updateGiftWithImage',
  async (payload: UpdateGiftWithImagePayload, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('image', payload.image);
      if (payload.name) formData.append('name', payload.name);
      if (payload.type) formData.append('type', payload.type);
      if (payload.value !== undefined) formData.append('value', payload.value.toString());
      if (payload.coinCost !== undefined) formData.append('coinCost', payload.coinCost.toString());
      if (payload.category) formData.append('category', payload.category);
      if (payload.description) formData.append('description', payload.description);
      if (payload.rarity) formData.append('rarity', payload.rarity);
      if (payload.isActive !== undefined) formData.append('isActive', payload.isActive.toString());
      if (payload.isSeasonal !== undefined) formData.append('isSeasonal', payload.isSeasonal.toString());
      if (payload.seasonalStart) formData.append('seasonalStart', payload.seasonalStart);
      if (payload.seasonalEnd) formData.append('seasonalEnd', payload.seasonalEnd);

      return await adminGiftService.updateGiftWithImage(payload.id, formData);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to update gift';
      return rejectWithValue(message);
    }
  }
);

export const deleteGift = createAsyncThunk(
  'gift/deleteGift',
  async (id: string, { rejectWithValue }) => {
    try {
      await adminGiftService.softDeleteGift(id);
      return id;
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to delete gift';
      return rejectWithValue(message);
    }
  }
);

interface GiftState {
  gifts: GiftResponse[];
  loading: boolean;
  error: string | null;
  actionLoading: { [key: string]: boolean };
}

const initialState: GiftState = {
  gifts: [],
  loading: false,
  error: null,
  actionLoading: {},
};

const giftSlice = createSlice({
  name: 'gift',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetGiftState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchGifts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGifts.fulfilled, (state, action) => {
        state.loading = false;
        state.gifts = action.payload;
      })
      .addCase(fetchGifts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create with image
      .addCase(createGiftWithImage.pending, (state) => {
        state.actionLoading.create = true;
        state.error = null;
      })
      .addCase(createGiftWithImage.fulfilled, (state, action) => {
        state.actionLoading.create = false;
        state.gifts.push(action.payload);
      })
      .addCase(createGiftWithImage.rejected, (state, action) => {
        state.actionLoading.create = false;
        state.error = action.payload as string;
      })

      // Create JSON (fallback)
      .addCase(createGiftJson.pending, (state) => {
        state.actionLoading.create = true;
        state.error = null;
      })
      .addCase(createGiftJson.fulfilled, (state, action) => {
        state.actionLoading.create = false;
        state.gifts.push(action.payload);
      })
      .addCase(createGiftJson.rejected, (state, action) => {
        state.actionLoading.create = false;
        state.error = action.payload as string;
      })

      // Update
      .addCase(updateGift.pending, (state, action) => {
        state.actionLoading[`update_${action.meta.arg.id}`] = true;
        state.error = null;
      })
      .addCase(updateGift.fulfilled, (state, action) => {
        const id = action.meta.arg.id;
        state.actionLoading[`update_${id}`] = false;
        const index = state.gifts.findIndex((gift) => gift._id === id);
        if (index !== -1) {
          state.gifts[index] = action.payload;
        }
      })
      .addCase(updateGift.rejected, (state, action) => {
        const id = action.meta.arg.id;
        state.actionLoading[`update_${id}`] = false;
        state.error = action.payload as string;
      })

      // Update with image
      .addCase(updateGiftWithImage.pending, (state, action) => {
        state.actionLoading[`update_${action.meta.arg.id}`] = true;
        state.error = null;
      })
      .addCase(updateGiftWithImage.fulfilled, (state, action) => {
        const id = action.meta.arg.id;
        state.actionLoading[`update_${id}`] = false;
        const index = state.gifts.findIndex((gift) => gift._id === id);
        if (index !== -1) {
          state.gifts[index] = action.payload;
        }
      })
      .addCase(updateGiftWithImage.rejected, (state, action) => {
        const id = action.meta.arg.id;
        state.actionLoading[`update_${id}`] = false;
        state.error = action.payload as string;
      })

      // Delete
      .addCase(deleteGift.pending, (state, action) => {
        state.actionLoading[`delete_${action.meta.arg}`] = true;
        state.error = null;
      })
      .addCase(deleteGift.fulfilled, (state, action) => {
        state.actionLoading[`delete_${action.payload}`] = false;
        state.gifts = state.gifts.filter((gift) => gift._id !== action.payload);
      })
      .addCase(deleteGift.rejected, (state, action) => {
        const id = action.meta.arg;
        state.actionLoading[`delete_${id}`] = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetGiftState } = giftSlice.actions;
export default giftSlice.reducer;