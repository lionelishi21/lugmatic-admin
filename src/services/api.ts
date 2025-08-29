import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Base API URL
const API_URL = 'http://localhost:3008/api';

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Token helper functions
export const getAccessToken = (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY);
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
      const token = getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
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
          
          // Call token refresh endpoint
          const response = await axios.post(`${API_URL}/refresh-token`, {
            refreshToken,
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
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
    
  logout: () => {
    clearTokens();
    return api.post('/logout');
  }
};

export default apiService; 