import { apiService } from './api';
import { 
  User, 
  LoginForm, 
  RegisterForm, 
  ProfileUpdateForm, 
  ApiResponse 
} from '../types';

export const userService = {
  // Authentication
  login: async (data: LoginForm) => {
    return apiService.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>('/auth/login', data);
  },

  register: async (data: RegisterForm) => {
    return apiService.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>('/auth/register', data);
  },

  logout: async () => {
    return apiService.post<ApiResponse<void>>('/auth/logout');
  },

  refreshToken: async (refreshToken: string) => {
    return apiService.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh-token', { refreshToken });
  },

  forgotPassword: async (email: string) => {
    return apiService.post<ApiResponse<void>>('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, newPassword: string) => {
    return apiService.post<ApiResponse<void>>('/auth/reset-password', { token, newPassword });
  },

  verifyEmail: async (token: string) => {
    return apiService.post<ApiResponse<void>>('/auth/verify-email', { token });
  },

  resendVerificationEmail: async (email: string) => {
    return apiService.post<ApiResponse<void>>('/auth/resend-verification', { email });
  },

  // User profile
  getCurrentUser: async () => {
    return apiService.get<ApiResponse<User>>('/users/profile');
  },

  updateProfile: async (data: ProfileUpdateForm) => {
    return apiService.put<ApiResponse<User>>('/users/profile', data);
  },

  updateProfilePicture: async (file: File) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    return apiService.put<ApiResponse<User>>('/users/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiService.put<ApiResponse<void>>('/users/change-password', { currentPassword, newPassword });
  },

  // User preferences
  getUserPreferences: async () => {
    return apiService.get<ApiResponse<Record<string, any>>>('/users/preferences');
  },

  updateUserPreferences: async (preferences: Record<string, any>) => {
    return apiService.put<ApiResponse<Record<string, any>>>('/users/preferences', preferences);
  },

  // User subscriptions
  getUserSubscriptions: async () => {
    return apiService.get<ApiResponse<any[]>>('/users/subscriptions');
  },

  subscribeToArtist: async (artistId: string) => {
    return apiService.post<ApiResponse<any>>('/users/subscriptions', { artistId });
  },

  unsubscribeFromArtist: async (artistId: string) => {
    return apiService.delete<ApiResponse<void>>(`/users/subscriptions/${artistId}`);
  },

  // User library
  getUserLibrary: async () => {
    return apiService.get<ApiResponse<any>>('/users/library');
  },

  addToLibrary: async (contentId: string, contentType: 'podcast' | 'music' | 'album') => {
    return apiService.post<ApiResponse<void>>('/users/library', { contentId, contentType });
  },

  removeFromLibrary: async (contentId: string, contentType: 'podcast' | 'music' | 'album') => {
    return apiService.delete<ApiResponse<void>>(`/users/library/${contentType}/${contentId}`);
  },

  // User playlists
  getUserPlaylists: async () => {
    return apiService.get<ApiResponse<any[]>>('/users/playlists');
  },

  createPlaylist: async (name: string, description?: string) => {
    return apiService.post<ApiResponse<any>>('/users/playlists', { name, description });
  },

  updatePlaylist: async (playlistId: string, data: { name?: string; description?: string }) => {
    return apiService.put<ApiResponse<any>>(`/users/playlists/${playlistId}`, data);
  },

  deletePlaylist: async (playlistId: string) => {
    return apiService.delete<ApiResponse<void>>(`/users/playlists/${playlistId}`);
  },

  addToPlaylist: async (playlistId: string, contentId: string, contentType: 'podcast' | 'music') => {
    return apiService.post<ApiResponse<void>>(`/users/playlists/${playlistId}/tracks`, { contentId, contentType });
  },

  removeFromPlaylist: async (playlistId: string, contentId: string) => {
    return apiService.delete<ApiResponse<void>>(`/users/playlists/${playlistId}/tracks/${contentId}`);
  },

  // User activity
  getUserActivity: async (page = 1, pageSize = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    return apiService.get<ApiResponse<any[]>>(`/users/activity?${params}`);
  },

  // User settings
  getUserSettings: async () => {
    return apiService.get<ApiResponse<Record<string, any>>>('/users/settings');
  },

  updateUserSettings: async (settings: Record<string, any>) => {
    return apiService.put<ApiResponse<Record<string, any>>>('/users/settings', settings);
  },

  // User billing and payments
  getUserBillingInfo: async () => {
    return apiService.get<ApiResponse<any>>('/users/billing');
  },

  updateBillingInfo: async (billingInfo: any) => {
    return apiService.put<ApiResponse<any>>('/users/billing', billingInfo);
  },

  getUserPaymentHistory: async (page = 1, pageSize = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    return apiService.get<ApiResponse<any[]>>(`/users/payment-history?${params}`);
  },

  // User support
  createSupportTicket: async (data: { subject: string; message: string; category: string }) => {
    return apiService.post<ApiResponse<any>>('/users/support/tickets', data);
  },

  getUserSupportTickets: async (page = 1, pageSize = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    return apiService.get<ApiResponse<any[]>>(`/users/support/tickets?${params}`);
  },

  getSupportTicket: async (ticketId: string) => {
    return apiService.get<ApiResponse<any>>(`/users/support/tickets/${ticketId}`);
  },

  // Account deletion
  requestAccountDeletion: async (reason?: string) => {
    return apiService.post<ApiResponse<void>>('/users/delete-account', { reason });
  },

  cancelAccountDeletion: async () => {
    return apiService.delete<ApiResponse<void>>('/users/delete-account');
  }
}; 