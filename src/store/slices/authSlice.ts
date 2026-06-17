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

// Sync check for token at startup to avoid UI flickering
const storedToken = getAccessToken();

const initialState: AuthState = {
  user: null, // We'll fetch the user data in the initializeAuth thunk
  isAuthenticated: !!storedToken,
  isLoading: !!storedToken, // Set loading true if we are about to verify a token
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
        
        // Allowed roles for this dashboard
        const allowedRoles = ['admin', 'artist', 'contributor', 'provider', 'super admin'];
        const userRole = (userData.role || '').toLowerCase().trim();
        if (!userRole || !allowedRoles.includes(userRole)) {
          clearTokens();
          return { isAuthenticated: false, user: null };
        }

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

      const user: AuthUser = (payload?.user ?? payload) as AuthUser;
      
      // Check role BEFORE setting tokens and returning
      const allowedRoles = ['admin', 'artist', 'contributor', 'provider', 'super admin'];
      const userRole = (user.role || '').toLowerCase().trim();
      
      if (!userRole || !allowedRoles.includes(userRole)) {
         throw new Error('Access denied. Regular user accounts are restricted to the main platform at lugmaticmusic.com.');
      }

      const accessToken = payload?.accessToken || payload?.token;
      const refreshToken = payload?.refreshToken || accessToken;

      if (accessToken) {
        setTokens(String(accessToken), String(refreshToken));
      } else {
        throw new Error('No token received from server');
      }

      return user;
    } catch (error: unknown) {
      // getErrorMessage doesn't handle Error objects directly with .message unless casted or structured differently, but wait, error.message works if it's a standard Error. 
      // getErrorMessage handles AxiosError. Let's just return the message if it's our custom error.
      if (error instanceof Error && error.message.includes('Access denied')) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const refreshUser = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get('/auth/me');
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
      // Always reset isLoading to false on logout — initialState.isLoading
      // was captured at module-load time (when a token existed) and would
      // be true, causing a permanent Preloader on the login page.
      return { ...initialState, isLoading: false, isAuthenticated: false };
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
        const user = action.payload.user as any;
        // Normalize role at state level
        if (user) {
          user.role = (user.role || '').toLowerCase().trim();
        }
        state.user = user;
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
        const user = action.payload as any;
        // Normalize role at state level
        if (user) {
          user.role = (user.role || '').toLowerCase().trim();
        }
        state.user = user;
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