import axios, { AxiosInstance, AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse, AxiosError } from 'axios';

// Base API URL — reads from Vite env, falls back to localhost for dev
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3008/api';

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Token helper functions
export const getAccessToken = (): string | null => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    return token;
  }

  // Fallback: support legacy/session-based storage
  try {
    const sessionStr = localStorage.getItem('storageSession');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      return session?.accessToken || session?.access_token || null;
    }
  } catch {
    // ignore
  }

  return null;
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};
export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};
export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

interface RetryConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// Create API instance with defaults
export const createApiInstance = (config?: AxiosRequestConfig): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
    },
    ...config,
  });

  // Request interceptor - add auth token to requests
  instance.interceptors.request.use(
    (config) => {
      // Ensure headers object exists
      if (!config.headers) {
        config.headers = {} as AxiosRequestHeaders;
      }
      
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // If data is FormData, remove Content-Type header to let axios set it with boundary
      // BUT preserve Authorization header
      if (config.data instanceof FormData) {
        const authHeader = config.headers.Authorization;
        delete config.headers['Content-Type'];
        // Re-ensure Authorization is still there after deleting Content-Type
        if (authHeader && !config.headers.Authorization) {
          config.headers.Authorization = typeof authHeader === 'string' ? authHeader : String(authHeader);
        }
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle token refresh
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryConfig;
      
      // If error is 401 and we have a refresh token, try to refresh
      if (
        error.response?.status === 401 &&
        originalRequest && 
        !originalRequest._retry
      ) {
        const refreshToken = getRefreshToken();
        
        // No refresh token available, reject the request
        if (!refreshToken) {
          clearTokens();
          return Promise.reject(error);
        }
        
        try {
          originalRequest._retry = true;
          
          // Create a separate axios instance without interceptors for refresh call
          // to avoid infinite loop (refresh endpoint shouldn't require auth)
          const refreshInstance = axios.create({
            baseURL: API_URL,
            timeout: 15000,
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          // Call token refresh endpoint
          const response = await refreshInstance.post('/refresh-token', {
            refreshToken,
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data as { accessToken: string; refreshToken: string };
          
          // Save new tokens
          setTokens(accessToken, newRefreshToken);
          
          // Retry the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          
          return instance(originalRequest);
        } catch (refreshError) {
          // If refresh fails, clear tokens and reject
          clearTokens();
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

// Default API instance
const api = createApiInstance();

// API interface for common methods
export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  message?: string;
}

// Type for responses with pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Common API methods
export const apiService = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => 
    api.get(url, config),
  
  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => 
    api.post(url, data, config),
  
  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => 
    api.put(url, data, config),
  
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => 
    api.delete(url, config),
    
  // Auth specific methods
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
    
  refreshToken: (refreshToken: string) => 
    api.post('/refresh-token', { refreshToken }),
    
  logout: () => 
    api.post('/logout').catch(() => {
      // If logout endpoint fails, that's okay - tokens will still be cleared by Redux
    })
};

export default apiService; 