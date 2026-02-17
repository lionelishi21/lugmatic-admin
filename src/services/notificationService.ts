import { apiService } from './api';
import { 
  Notification, 
  CreateNotificationRequest, 
  PaginatedResponse,
  ApiResponse 
} from '../types';

export const notificationService = {
  // Get user's notifications
  getUserNotifications: async (page = 1, pageSize = 10, filters?: Record<string, string>) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...filters
    });
    return apiService.get<PaginatedResponse<Notification>>(`/notifications?${params}`);
  },

  // Get notification by ID
  getNotificationById: async (id: string) => {
    return apiService.get<ApiResponse<Notification>>(`/notifications/${id}`);
  },

  // Create new notification (admin/system only)
  createNotification: async (data: CreateNotificationRequest) => {
    return apiService.post<ApiResponse<Notification>>('/notifications', data);
  },

  // Update notification
  updateNotification: async (id: string, data: Partial<Notification>) => {
    return apiService.put<ApiResponse<Notification>>(`/notifications/${id}`, data);
  },

  // Delete notification
  deleteNotification: async (id: string) => {
    return apiService.delete<ApiResponse<void>>(`/notifications/${id}`);
  },

  // Mark notification as read
  markAsRead: async (id: string) => {
    return apiService.put<ApiResponse<Notification>>(`/notifications/${id}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    return apiService.put<ApiResponse<void>>('/notifications/read-all');
  },

  // Get unread notifications count
  getUnreadCount: async () => {
    return apiService.get<{ count: number }>('/notifications/unread-count');
  },

  // Get notifications by type
  getNotificationsByType: async (type: string, page = 1, pageSize = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    return apiService.get<PaginatedResponse<Notification>>(`/notifications/type/${type}?${params}`);
  },

  // Delete all read notifications
  deleteReadNotifications: async () => {
    return apiService.delete<ApiResponse<void>>('/notifications/read');
  },

  // Get notification preferences
  getNotificationPreferences: async () => {
    return apiService.get<ApiResponse<Record<string, boolean>>>('/notifications/preferences');
  },

  // Update notification preferences
  updateNotificationPreferences: async (preferences: Record<string, boolean>) => {
    return apiService.put<ApiResponse<Record<string, boolean>>>('/notifications/preferences', preferences);
  },

  // Admin: Get all notifications
  getAllNotifications: async (page = 1, pageSize = 10, filters?: Record<string, string>) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...filters
    });
    return apiService.get<PaginatedResponse<Notification>>(`/admin/notifications?${params}`);
  },

  // Admin: Send notification to all users
  sendBroadcastNotification: async (data: Omit<CreateNotificationRequest, 'userId'>) => {
    return apiService.post<ApiResponse<void>>('/admin/notifications/broadcast', data);
  },

  // Admin: Send notification to specific users
  sendNotificationToUsers: async (userIds: string[], data: Omit<CreateNotificationRequest, 'userId'>) => {
    return apiService.post<ApiResponse<void>>('/admin/notifications/send', { userIds, ...data });
  },

  // Admin: Get notification statistics
  getNotificationStats: async () => {
    return apiService.get<ApiResponse<Record<string, number>>>('/admin/notifications/stats');
  },

  // Get recent notifications (last 24 hours)
  getRecentNotifications: async (limit = 10) => {
    return apiService.get<ApiResponse<Notification[]>>(`/notifications/recent?limit=${limit}`);
  },

  // Subscribe to real-time notifications (WebSocket)
  subscribeToNotifications: (userId: string, onMessage: (notification: Notification) => void) => {
    // Derive WebSocket URL from API URL environment variable
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3008/api';
    const wsUrl = apiUrl.replace(/^http/, 'ws').replace(/\/api\/?$/, '');
    const ws = new WebSocket(`${wsUrl}/notifications/${userId}`);
    
    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      onMessage(notification);
    };

    return {
      unsubscribe: () => ws.close()
    };
  }
}; 