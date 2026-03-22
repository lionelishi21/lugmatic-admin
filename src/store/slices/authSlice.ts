import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService, { setTokens, clearTokens, getAccessToken } from '../../services/api';
import { AxiosError } from 'axios';

interface AuthUser {
  id: string | number;
  _id?: string; // Standard MongoDB ID
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  artistId?: string;
  accessToken?: string;
  refreshToken?: string;
  termsAccepted?: boolean;
  termsVersion?: string;
  payoutInfo?: any;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastLogin: number | null;
}

const initialState: AuthState = {
  user: {
    id: 'mock-123',
    email: 'artist@lugmatic.com',
    role: 'artist',
    name: 'Lugmatic Artist',
    artistId: 'artist-123'
  },
  isAuthenticated: true,
  isLoading: false,
  error: null,
  lastLogin: Date.now(),
};

// Helper to extract meaningful error messages from API responses
const getErrorMessage = (error: unknown): string => {
  const axiosError = error as AxiosError<{
    message?: string;
    error?: string;
    [key: string]: unknown;
  }>;

  if (axiosError.response) {
    if (
      axiosError.response.data &&
      typeof axiosError.response.data === 'object'
    ) {
      if ('message' in axiosError.response.data) {
        return (axiosError.response.data as any).message || '';
      }
      if ('error' in axiosError.response.data) {
        return (axiosError.response.data as any).error || '';
      }
    }
    if (axiosError.response.status === 401) return 'Invalid email or password';
    if (axiosError.response.status === 403) return 'Account access restricted';
    if (axiosError.response.status === 404) return 'Account not found';
    if (axiosError.response.status === 429) return 'Too many login attempts. Please try again later';
    return `Error ${axiosError.response.status}: ${axiosError.response.statusText}`;
  } else if (axiosError.request) {
    return 'Server not responding. Please check your connection and try again.';
  }
  return axiosError.message || 'An unexpected error occurred';
};

// Initialize auth state from localStorage on app start
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAccessToken();
      if (!token) {
        return { isAuthenticated: false, user: null };
      }
      try {
        const response = await apiService.get('/users/profile');
        const userData = (response.data as any).data ?? response.data;
        return { isAuthenticated: true, user: userData };
      } catch (error) {
        clearTokens();
        return { isAuthenticated: false, user: null };
      }
    } catch (error: unknown) {
      clearTokens();
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/auth/login', credentials);
      const raw = response.data as any;
      const payload = raw?.data ?? raw;

      const accessToken = payload?.accessToken || payload?.token;
      const refreshToken = payload?.refreshToken || accessToken;

      if (accessToken) {
        setTokens(String(accessToken), String(refreshToken));
      } else {
        throw new Error('No token received from server');
      }

      const user: AuthUser = (payload?.user ?? payload) as AuthUser;
      return user;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const refreshUser = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get('/users/profile');
      const userData = (response.data as any).data ?? response.data;
      return userData;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: () => {
      clearTokens();
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize auth from localStorage
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.user = action.payload.user as any;
        if (action.payload.isAuthenticated) {
          state.lastLogin = Date.now();
        }
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload as any;
        state.lastLogin = Date.now();
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Refresh User
      .addCase(refreshUser.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
      });
  },
});

export const { clearError, logout } = authSlice.actions;
export default authSlice.reducer;