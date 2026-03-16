import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import financeService, { ArtistEarningsStats } from '../../services/financeService';
import { AxiosError } from 'axios';

interface FinanceState {
  earnings: ArtistEarningsStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: FinanceState = {
  earnings: null,
  loading: false,
  error: null,
};

export const fetchArtistEarnings = createAsyncThunk(
  'finance/fetchEarnings',
  async (_, { rejectWithValue }) => {
    try {
      return await financeService.getArtistEarnings();
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch earnings');
    }
  }
);

export const requestPayout = createAsyncThunk(
  'finance/requestPayout',
  async (amount: number, { rejectWithValue }) => {
    try {
      return await financeService.requestPayout(amount);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Failed to request payout');
    }
  }
);

const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    clearFinanceData: (state) => {
      state.earnings = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchArtistEarnings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArtistEarnings.fulfilled, (state, action: PayloadAction<ArtistEarningsStats>) => {
        state.loading = false;
        state.earnings = action.payload;
      })
      .addCase(fetchArtistEarnings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearFinanceData } = financeSlice.actions;
export default financeSlice.reducer;
