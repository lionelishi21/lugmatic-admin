import { apiService } from './api';
import { 
  SearchResult, 
  SearchFilters, 
  Podcast, 
  Artist, 
  Music, 
  PaginatedResponse,
  ApiResponse 
} from '../types';

export const searchService = {
  // Global search across all content types
  globalSearch: async (query: string, page = 1, pageSize = 10, filters?: SearchFilters) => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.genre && { genre: filters.genre }),
      ...(filters?.duration && { duration: filters.duration.toString() }),
      ...(filters?.priceRange && { 
        minPrice: filters.priceRange.min.toString(),
        maxPrice: filters.priceRange.max.toString()
      }),
      ...(filters?.sortBy && { sortBy: filters.sortBy }),
      ...(filters?.sortOrder && { sortOrder: filters.sortOrder })
    });
    return apiService.get<ApiResponse<SearchResult>>(`/search?${params}`);
  },

  // Search podcasts specifically
  searchPodcasts: async (query: string, page = 1, pageSize = 10, filters?: SearchFilters) => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.genre && { genre: filters.genre }),
      ...(filters?.duration && { duration: filters.duration.toString() }),
      ...(filters?.priceRange && { 
        minPrice: filters.priceRange.min.toString(),
        maxPrice: filters.priceRange.max.toString()
      }),
      ...(filters?.sortBy && { sortBy: filters.sortBy }),
      ...(filters?.sortOrder && { sortOrder: filters.sortOrder })
    });
    return apiService.get<PaginatedResponse<Podcast>>(`/search/podcasts?${params}`);
  },

  // Search artists specifically
  searchArtists: async (query: string, page = 1, pageSize = 10, filters?: SearchFilters) => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.genre && { genre: filters.genre }),
      ...(filters?.duration && { duration: filters.duration.toString() }),
      ...(filters?.priceRange && { 
        minPrice: filters.priceRange.min.toString(),
        maxPrice: filters.priceRange.max.toString()
      }),
      ...(filters?.sortBy && { sortBy: filters.sortBy }),
      ...(filters?.sortOrder && { sortOrder: filters.sortOrder })
    });
    return apiService.get<PaginatedResponse<Artist>>(`/search/artists?${params}`);
  },

  // Search music/tracks specifically
  searchMusic: async (query: string, page = 1, pageSize = 10, filters?: SearchFilters) => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.genre && { genre: filters.genre }),
      ...(filters?.duration && { duration: filters.duration.toString() }),
      ...(filters?.priceRange && { 
        minPrice: filters.priceRange.min.toString(),
        maxPrice: filters.priceRange.max.toString()
      }),
      ...(filters?.sortBy && { sortBy: filters.sortBy }),
      ...(filters?.sortOrder && { sortOrder: filters.sortOrder })
    });
    return apiService.get<PaginatedResponse<Music>>(`/search/music?${params}`);
  },

  // Get trending content
  getTrendingContent: async (type?: 'podcasts' | 'artists' | 'music', limit = 10) => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(type && { type })
    });
    return apiService.get<ApiResponse<Podcast[] | Artist[] | Music[]>>(`/search/trending?${params}`);
  },

  // Get recommended content for user
  getRecommendations: async (userId: string, type?: 'podcasts' | 'artists' | 'music', limit = 10) => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(type && { type })
    });
    return apiService.get<ApiResponse<Podcast[] | Artist[] | Music[]>>(`/search/recommendations/${userId}?${params}`);
  },

  // Get content by category
  getContentByCategory: async (category: string, type: 'podcasts' | 'artists' | 'music', page = 1, pageSize = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    return apiService.get<PaginatedResponse<Podcast | Artist | Music>>(`/search/category/${category}/${type}?${params}`);
  },

  // Get content by genre
  getContentByGenre: async (genre: string, type: 'podcasts' | 'artists' | 'music', page = 1, pageSize = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    return apiService.get<PaginatedResponse<Podcast | Artist | Music>>(`/search/genre/${genre}/${type}?${params}`);
  },

  // Get popular content
  getPopularContent: async (type: 'podcasts' | 'artists' | 'music', period: 'daily' | 'weekly' | 'monthly', page = 1, pageSize = 10) => {
    const params = new URLSearchParams({
      period,
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    return apiService.get<PaginatedResponse<Podcast | Artist | Music>>(`/search/popular/${type}?${params}`);
  },

  // Get new releases
  getNewReleases: async (type: 'podcasts' | 'artists' | 'music', page = 1, pageSize = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    return apiService.get<PaginatedResponse<Podcast | Artist | Music>>(`/search/new-releases/${type}?${params}`);
  },

  // Get similar content
  getSimilarContent: async (contentId: string, contentType: 'podcast' | 'artist' | 'music', limit = 10) => {
    return apiService.get<ApiResponse<Podcast[] | Artist[] | Music[]>>(`/search/similar/${contentType}/${contentId}?limit=${limit}`);
  },

  // Get search suggestions/autocomplete
  getSearchSuggestions: async (query: string, type?: 'podcasts' | 'artists' | 'music', limit = 5) => {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      ...(type && { type })
    });
    return apiService.get<ApiResponse<string[]>>(`/search/suggestions?${params}`);
  },

  // Get search filters and options
  getSearchFilters: async () => {
    return apiService.get<ApiResponse<{
      categories: string[];
      genres: string[];
      priceRanges: Array<{ min: number; max: number }>;
      durationRanges: Array<{ min: number; max: number }>;
    }>>('/search/filters');
  },

  // Advanced search with multiple filters
  advancedSearch: async (filters: SearchFilters, page = 1, pageSize = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(filters.category && { category: filters.category }),
      ...(filters.genre && { genre: filters.genre }),
      ...(filters.duration && { duration: filters.duration.toString() }),
      ...(filters.priceRange && { 
        minPrice: filters.priceRange.min.toString(),
        maxPrice: filters.priceRange.max.toString()
      }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.sortOrder && { sortOrder: filters.sortOrder })
    });
    return apiService.get<ApiResponse<SearchResult>>(`/search/advanced?${params}`);
  },

  // Get search analytics (admin only)
  getSearchAnalytics: async (period: 'daily' | 'weekly' | 'monthly') => {
    return apiService.get<ApiResponse<Record<string, number>>>(`/admin/search/analytics?period=${period}`);
  },

  // Get popular search terms
  getPopularSearchTerms: async (limit = 10) => {
    return apiService.get<ApiResponse<string[]>>(`/search/popular-terms?limit=${limit}`);
  }
}; 