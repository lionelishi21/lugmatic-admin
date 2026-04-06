import { apiService } from './api';
import { 
  Notification, 
  PaginatedResponse,
  ApiResponse 
} from '../types';

export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: 'system' | 'marketing' | 'gift' | 'comment' | 'like' | 'follow' | 'podcast' | 'earnings';
  userId?: string;
  metadata?: Record<string, any>;
}

export const notificationService = {
  /**
   * User methods
   */

  // Get user's notifications with pagination and filtering
  getUserNotifications: async (page = 1, pageSize = 10, filters?: Record<string, string>) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...filters
    });
    return apiService.get<PaginatedResponse<Notification>>(`/notifications?${params}`);
  },

  // Get unread notifications count
  getUnreadCount: async () => {
    return apiService.get<{ count: number }>('/notifications/unread-count');
  },

  // Mark a specific notification as read
  markAsRead: async (notificationId: string) => {
    return apiService.put<Notification>(`/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read for current user
  markAllAsRead: async () => {
    return apiService.put<void>('/notifications/mark-all-read');
  },

  // Delete a specific notification
  deleteNotification: async (notificationId: string) => {
    return apiService.delete<void>(`/notifications/${notificationId}`);
  },

  // Get user's notification settings (preferences)
  getNotificationSettings: async () => {
    return apiService.get<Record<string, boolean>>('/notifications/settings');
  },

  // Update user's notification settings
  updateNotificationSettings: async (settings: Record<string, boolean>) => {
    return apiService.put<Record<string, boolean>>('/notifications/settings', settings);
  },

  /**
   * Administrative methods
   */

  // Send system notification (admin only)
  sendSystemNotification: async (data: CreateNotificationRequest) => {
    return apiService.post<Notification>('/notifications/admin/system', data);
  },

  // Send marketing notification to all users (admin only)
  sendMarketingNotification: async (data: CreateNotificationRequest) => {
    return apiService.post<Notification>('/notifications/admin/marketing', data);
  },

  // Get administrative notification statistics
  getNotificationStats: async () => {
    return apiService.get<Record<string, number>>('/notifications/admin/stats');
  },

  // Cleanup old notifications (admin only)
  cleanupOldNotifications: async () => {
    return apiService.delete<ApiResponse<void>>('/notifications/admin/cleanup');
  },

  /**
   * Utilities & Helpers
   */

  // Subscribe to real-time notifications (WebSocket)
  subscribeToNotifications: (userId: string, onMessage: (notification: Notification) => void) => {
    // Derive WebSocket URL from API URL environment variable
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3008/api';
    const wsUrl = apiUrl.replace(/^http/, 'ws').replace(/\/api\/?$/, '');
    const ws = new WebSocket(`${wsUrl}/notifications/${userId}`);
    
    ws.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        onMessage(notification);
      } catch (e) {
        console.error('Error parsing WebSocket message:', e);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    return {
      unsubscribe: () => ws.close()
    };
  }
};

export default notificationService; 