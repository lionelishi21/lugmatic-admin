import { apiService } from './api';
import {
  User,
  Artist,
  Podcast,
  Comment,
  Gift,
  GiftTransaction,
  AdminDashboardData,
  ContentModerationData,
  PaginatedResponse,
  ApiResponse
} from '../types';

export const adminService = {
  // Dashboard data
  getDashboardData: async () => {
    return apiService.get<AdminDashboardData>('/admin/dashboard');
  },

  // User management
  getAllUsers: async (page = 1, pageSize = 10, filters?: Record<string, string>) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...filters
    });
    return apiService.get<User[]>(`/admin/users?${params}`);
  },

  createUser: async (data: { firstName: string; lastName: string; email: string; role: string }) => {
    return apiService.post<ApiResponse<User>>('/admin/users', data);
  },

  getUserById: async (id: string) => {
    return apiService.get<User>(`/admin/users/${id}`);
  },

  updateUser: async (id: string, data: Partial<User>) => {
    return apiService.put<User>(`/admin/users/${id}`, data);
  },

  deleteUser: async (id: string) => {
    return apiService.delete<void>(`/admin/users/${id}`);
  },

  updateEmail: async (userId: string, email: string) => {
    return apiService.patch<ApiResponse<User>>(`/admin/users/${userId}/email`, { email });
  },

  resendInvitation: async (userId: string) => {
    return apiService.post<ApiResponse<void>>(`/admin/users/${userId}/resend-verification`);
  },

  manuallyVerifyEmail: async (userId: string) => {
    return apiService.patch<ApiResponse<void>>(`/admin/users/${userId}/verify-email`);
  },

  toggleUserStatus: async (id: string, isActive: boolean) => {
    return apiService.put<User>(`/admin/users/${id}/status`, { isActive });
  },

  resetPassword: async (userId: string) => {
    return apiService.post<ApiResponse<{ temporaryPassword: string }>>(`/admin/users/${userId}/reset-password`);
  },

  // Artist management
  getAllArtists: async (page = 1, pageSize = 10, filters?: Record<string, string>) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...filters
    });
    return apiService.get<Artist[]>(`/admin/artists?${params}`);
  },

  getArtistById: async (id: string) => {
    return apiService.get<Artist>(`/admin/artists/${id}`);
  },

  updateArtist: async (id: string, data: Partial<Artist>) => {
    return apiService.put<Artist>(`/admin/artists/${id}`, data);
  },

  deleteArtist: async (id: string) => {
    return apiService.delete<void>(`/admin/artists/${id}`);
  },

  approveArtist: async (id: string) => {
    return apiService.put<Artist>(`/admin/artists/${id}/approve`);
  },

  rejectArtist: async (id: string, reason: string) => {
    return apiService.put<Artist>(`/admin/artists/${id}/reject`, { reason });
  },

  // Content moderation
  getContentModerationData: async () => {
    return apiService.get<ContentModerationData>('/admin/moderation');
  },

  getContentForModeration: async (contentType: string, page = 1, limit = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    return apiService.get<any>(`/admin/moderation/${contentType}?${params}`);
  },

  moderateContent: async (contentType: string, contentId: string, action: 'approve' | 'reject' | 'delete', reason?: string) => {
    return apiService.put<any>(`/admin/moderation/${contentType}/${contentId}`, { action, reason });
  },

  getFlaggedContent: async (page = 1, pageSize = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    return apiService.get<PaginatedResponse<any>>(`/admin/moderation/flagged?${params}`);
  },

  // Podcast management
  getAllPodcasts: async (page = 1, pageSize = 10, filters?: Record<string, string>) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...filters
    });
    return apiService.get<Podcast[]>(`/admin/podcasts?${params}`);
  },

  moderatePodcast: async (id: string, action: 'approve' | 'reject', reason?: string) => {
    return apiService.put<ApiResponse<Podcast>>(`/admin/podcasts/${id}/moderate`, { action, reason });
  },

  // Comment moderation
  getAllComments: async (page = 1, pageSize = 10, filters?: Record<string, string>) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...filters
    });
    return apiService.get<Comment[]>(`/admin/comments?${params}`);
  },

  moderateComment: async (id: string, action: 'approve' | 'reject', reason?: string) => {
    return apiService.put<ApiResponse<Comment>>(`/admin/comments/${id}/moderate`, { action, reason });
  },

  // Gift management
  getAllGifts: async (page = 1, pageSize = 10, filters?: Record<string, string>) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...filters
    });
    return apiService.get<PaginatedResponse<Gift>>(`/admin/gifts?${params}`);
  },

  createGift: async (data: Omit<Gift, '_id' | 'createdAt' | 'updatedAt'>) => {
    return apiService.post<ApiResponse<Gift>>('/admin/gifts', data);
  },

  updateGift: async (id: string, data: Partial<Gift>) => {
    return apiService.put<ApiResponse<Gift>>(`/admin/gifts/${id}`, data);
  },

  deleteGift: async (id: string) => {
    return apiService.delete<ApiResponse<void>>(`/admin/gifts/${id}`);
  },

  // Gift transaction management
  getAllGiftTransactions: async (page = 1, pageSize = 10, filters?: Record<string, string>) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...filters
    });
    return apiService.get<PaginatedResponse<GiftTransaction>>(`/admin/gifts/transactions?${params}`);
  },

  updateGiftTransactionStatus: async (id: string, status: 'pending' | 'completed' | 'failed' | 'refunded') => {
    return apiService.put<ApiResponse<GiftTransaction>>(`/admin/gifts/transactions/${id}/status`, { status });
  },

  // Analytics and reporting
  getAnalytics: async (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    return apiService.get<ApiResponse<Record<string, number>>>(`/admin/analytics?period=${period}`);
  },

  getRevenueAnalytics: async (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    return apiService.get<ApiResponse<Record<string, number>>>(`/admin/analytics/revenue?period=${period}`);
  },

  getUserAnalytics: async () => {
    return apiService.get<ApiResponse<Record<string, number>>>('/admin/analytics/users');
  },

  getContentAnalytics: async () => {
    return apiService.get<ApiResponse<Record<string, number>>>('/admin/analytics/content');
  },

  // System settings
  getSystemSettings: async () => {
    return apiService.get<ApiResponse<Record<string, any>>>('/admin/settings');
  },

  updateSystemSettings: async (settings: Record<string, any>) => {
    return apiService.put<ApiResponse<Record<string, any>>>('/admin/settings', settings);
  },

  // Promotions and campaigns
  createPromotion: async (data: Record<string, any>) => {
    return apiService.post<ApiResponse<any>>('/admin/promotions', data);
  },

  getPromotions: async (page = 1, pageSize = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    return apiService.get<PaginatedResponse<any>>(`/admin/promotions?${params}`);
  },

  updatePromotion: async (id: string, data: Record<string, any>) => {
    return apiService.put<ApiResponse<any>>(`/admin/promotions/${id}`, data);
  },

  deletePromotion: async (id: string) => {
    return apiService.delete<ApiResponse<void>>(`/admin/promotions/${id}`);
  },

  // Reports
  generateReport: async (type: string, filters?: Record<string, any>) => {
    return apiService.post<ApiResponse<any>>(`/admin/reports/${type}`, filters);
  },

  getReportHistory: async (page = 1, pageSize = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    return apiService.get<PaginatedResponse<any>>(`/admin/reports/history?${params}`);
  }
}; 