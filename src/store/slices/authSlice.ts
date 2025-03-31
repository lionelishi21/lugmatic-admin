import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService, { setTokens, clearTokens } from '../../services/api';
import { AxiosError } from 'axios';

interface AuthUser {
  id: string | number;
  email: string;
  role: string;
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
    // Check for structured error response
    if (
      axiosError.response.data && 
      typeof axiosError.response.data === 'object'
    ) {
      if ('message' in axiosError.response.data) {
        return axiosError.response.data.message || '';
      }
      if ('error' in axiosError.response.data) {
        return axiosError.response.data.error || '';
      }
    }
    
    // Check HTTP status code for common errors
    if (axiosError.response.status === 401) {
      return 'Invalid email or password';
    } else if (axiosError.response.status === 403) {
      return 'Account access restricted';
    } else if (axiosError.response.status === 404) {
      return 'Account not found';
    } else if (axiosError.response.status === 429) {
      return 'Too many login attempts. Please try again later';
    }
    
    return `Error ${axiosError.response.status}: ${axiosError.response.statusText}`;
  } else if (axiosError.request) {
    return 'Server not responding. Please check your connection and try again.';
  }
  
  return axiosError.message || 'An unexpected error occurred';
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await apiService.login(credentials.email, credentials.password);
      const userData = response.data;
      
      // Save tokens to localStorage
      if (userData.accessToken && userData.refreshToken) {
        setTokens(userData.accessToken, userData.refreshToken);
      }
      
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
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
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