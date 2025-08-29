import { apiService } from './api';
import { 
  Podcast, 
  CreatePodcastRequest, 
  UpdatePodcastRequest, 
  PaginatedResponse,
  ApiResponse 
} from '../types';

export const podcastService = {
  // Get all podcasts with pagination and filters
  getPodcasts: async (page = 1, pageSize = 10, filters?: any) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...filters
    });
    return apiService.get<PaginatedResponse<Podcast>>(`/podcasts?${params}`);
  },

  // Get podcast by ID
  getPodcastById: async (id: string) => {
    return apiService.get<ApiResponse<Podcast>>(`/podcasts/${id}`);
  },

  // Create new podcast
  createPodcast: async (data: CreatePodcastRequest) => {
    return apiService.post<ApiResponse<Podcast>>('/podcasts', data);
  },

  // Update podcast
  updatePodcast: async (id: string, data: UpdatePodcastRequest) => {
    return apiService.put<ApiResponse<Podcast>>(`/podcasts/${id}`, data);
  },

  // Delete podcast
  deletePodcast: async (id: string) => {
    return apiService.delete<ApiResponse<void>>(`/podcasts/${id}`);
  },

  // Get artist's podcasts
  getArtistPodcasts: async (artistId: string, page = 1, pageSize = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    return apiService.get<PaginatedResponse<Podcast>>(`/podcasts/artist/${artistId}?${params}`);
  },

  // Publish/unpublish podcast
  togglePublishStatus: async (id: string, isPublished: boolean) => {
    return apiService.put<ApiResponse<Podcast>>(`/podcasts/${id}/publish`, { isPublished });
  },

  // Get podcast analytics
  getPodcastAnalytics: async (id: string) => {
    return apiService.get<ApiResponse<any>>(`/podcasts/${id}/analytics`);
  },

  // Get trending podcasts
  getTrendingPodcasts: async (limit = 10) => {
    return apiService.get<ApiResponse<Podcast[]>>(`/podcasts/trending?limit=${limit}`);
  },

  // Get podcasts by category
  getPodcastsByCategory: async (category: string, page = 1, pageSize = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    return apiService.get<PaginatedResponse<Podcast>>(`/podcasts/category/${category}?${params}`);
  },

  // Search podcasts
  searchPodcasts: async (query: string, page = 1, pageSize = 10) => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    return apiService.get<PaginatedResponse<Podcast>>(`/podcasts/search?${params}`);
  },

  // Admin: Get all podcasts for moderation
  getAllPodcastsForModeration: async (page = 1, pageSize = 10, status?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(status && { status })
    });
    return apiService.get<PaginatedResponse<Podcast>>(`/admin/podcasts?${params}`);
  },

  // Admin: Moderate podcast
  moderatePodcast: async (id: string, action: 'approve' | 'reject', reason?: string) => {
    return apiService.put<ApiResponse<Podcast>>(`/admin/podcasts/${id}/moderate`, { action, reason });
  },

  // Admin: Get podcast statistics
  getPodcastStats: async () => {
    return apiService.get<ApiResponse<any>>('/admin/podcasts/stats');
  }
}; 