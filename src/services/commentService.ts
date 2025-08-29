import { apiService } from './api';
import { 
  Comment, 
  CreateCommentRequest, 
  UpdateCommentRequest, 
  PaginatedResponse,
  ApiResponse 
} from '../types';

export const commentService = {
  // Get comments with pagination and filters
  getComments: async (page = 1, pageSize = 10, filters?: Record<string, string>) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...filters
    });
    return apiService.get<PaginatedResponse<Comment>>(`/comments?${params}`);
  },

  // Get comment by ID
  getCommentById: async (id: string) => {
    return apiService.get<ApiResponse<Comment>>(`/comments/${id}`);
  },

  // Create new comment
  createComment: async (data: CreateCommentRequest) => {
    return apiService.post<ApiResponse<Comment>>('/comments', data);
  },

  // Update comment
  updateComment: async (id: string, data: UpdateCommentRequest) => {
    return apiService.put<ApiResponse<Comment>>(`/comments/${id}`, data);
  },

  // Delete comment
  deleteComment: async (id: string) => {
    return apiService.delete<ApiResponse<void>>(`/comments/${id}`);
  },

  // Get comments for a specific podcast
  getPodcastComments: async (podcastId: string, page = 1, pageSize = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    return apiService.get<PaginatedResponse<Comment>>(`/comments/podcast/${podcastId}?${params}`);
  },

  // Get comments for a specific artist
  getArtistComments: async (artistId: string, page = 1, pageSize = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    return apiService.get<PaginatedResponse<Comment>>(`/comments/artist/${artistId}?${params}`);
  },

  // Get replies to a comment
  getCommentReplies: async (commentId: string, page = 1, pageSize = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    return apiService.get<PaginatedResponse<Comment>>(`/comments/${commentId}/replies?${params}`);
  },

  // Like/unlike comment
  toggleCommentLike: async (id: string) => {
    return apiService.put<ApiResponse<Comment>>(`/comments/${id}/like`);
  },

  // Report comment
  reportComment: async (id: string, reason: string) => {
    return apiService.post<ApiResponse<void>>(`/comments/${id}/report`, { reason });
  },

  // Admin: Get all comments for moderation
  getAllCommentsForModeration: async (page = 1, pageSize = 10, status?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(status && { status })
    });
    return apiService.get<PaginatedResponse<Comment>>(`/admin/comments?${params}`);
  },

  // Admin: Moderate comment
  moderateComment: async (id: string, action: 'approve' | 'reject', reason?: string) => {
    return apiService.put<ApiResponse<Comment>>(`/admin/comments/${id}/moderate`, { action, reason });
  },

  // Admin: Get comment statistics
  getCommentStats: async () => {
    return apiService.get<ApiResponse<Record<string, number>>>('/admin/comments/stats');
  },

  // Get user's comments
  getUserComments: async (userId: string, page = 1, pageSize = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    return apiService.get<PaginatedResponse<Comment>>(`/comments/user/${userId}?${params}`);
  }
}; 