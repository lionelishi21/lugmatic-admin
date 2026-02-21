import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService, { setTokens, clearTokens, getAccessToken } from '../../services/api';
import { AxiosError } from 'axios';

interface AuthUser {
  id: string | number;
  email: string;
  role: string;
  artistId?: string;
  accessToken?: string;
  refreshToken?: string;
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
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  lastLogin: null,
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
        const response = await apiService.get('/auth/me');
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
      const response = await apiService.login(credentials.email, credentials.password);
      const raw = response.data as any;
      // Backend now returns { success: true, data: { ...user, token, accessToken, refreshToken } }
      const payload = raw?.data ?? raw;

      // Extract tokens from multiple possible shapes
      // Backend returns token (not accessToken) and may not have refreshToken
      const accessToken = payload?.accessToken || payload?.access_token || payload?.token || payload?.tokens?.accessToken || payload?.tokens?.access_token;
      const refreshToken = payload?.refreshToken || payload?.refresh_token || payload?.tokens?.refreshToken || payload?.tokens?.refresh_token || accessToken; // Use accessToken as fallback

      if (accessToken) {
        // Store accessToken, use it as refreshToken if no refreshToken provided
        setTokens(String(accessToken), String(refreshToken || accessToken));
      } else {
        throw new Error('No token received from server');
      }

      // Derive user object to store in state (some APIs return user under `user`)
      const user: AuthUser = (payload?.user ?? payload) as AuthUser;
      return user;
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
      });
  },
});

export const { clearError, logout } = authSlice.actions;
export default authSlice.reducer; 