import { AxiosResponse } from 'axios';
import apiService from './api';

// Artist interface
export interface Artist {
  _id: string;
  name: string;
  bio?: string;
  email?: string;
  contactEmail?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  image?: string;
  profilePicture?: string | null;
  genres?: string[];
  favoriteGenres?: string[];
  status?: 'active' | 'pending' | 'inactive' | 'approved' | 'rejected';
  socialLinks?: {
    website?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  approvedAt?: string | null;
  isApproved?: boolean;
  isVerified?: boolean;
  [key: string]: unknown;
}

export interface Album {
  _id: string;
  title: string;
  artist: string;
  cover?: string;
  releaseDate: string;
  tracks: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Song {
  _id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  audioUrl: string;
  coverArt?: string;
  createdAt: string;
  updatedAt: string;
}

// Interface for API response
// interface ApiResponse<T> {
//   data: T;
//   message?: string;
//   status?: string;
// }

// Interface for creating a new artist
export interface ArtistSocialLinks {
  website?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
}

export interface CreateArtistData {
  firstName: string;
  lastName: string;
  email: string;
  name: string;
  bio?: string;
  gender?: string;
  image?: string | null;
  genres?: string[];
  socialLinks?: ArtistSocialLinks;
}

// Interface for updating an artist
export interface UpdateArtistData {
  name?: string;
  email?: string;
  genre?: string;
  status?: 'active' | 'pending' | 'inactive';
}

// Interface for pagination and filtering
export interface ArtistQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  genre?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Utility function to generate artist data
export const generateArtistData = (overrides: Partial<CreateArtistData> = {}): CreateArtistData => {
  const defaultGenres = ['Pop', 'Rock', 'Hip Hop', 'R&B', 'Electronic'];
  const randomGenres = Array.from(
    { length: Math.floor(Math.random() * 3) + 1 },
    () => defaultGenres[Math.floor(Math.random() * defaultGenres.length)]
  );

  const defaultData: CreateArtistData = {
    firstName: 'Sample',
    lastName: 'Artist',
    email: `artist${Math.floor(Math.random() * 1000)}@example.com`,
    name: `Artist ${Math.floor(Math.random() * 1000)}`,
    bio: 'A talented musician with a unique sound and style.',
    image: `https://picsum.photos/seed/${Math.random()}/400/400`,
    genres: randomGenres,
    socialLinks: {
      website: 'https://example.com',
      facebook: 'https://facebook.com/example',
      twitter: 'https://twitter.com/example',
      instagram: 'https://instagram.com/example'
    }
  };

  return {
    ...defaultData,
    ...overrides
  };
};

const extractResponseData = <T>(response: AxiosResponse<T | { data: T }>): T => {
  const { data } = response;

  if (data && typeof data === 'object' && 'data' in (data as Record<string, unknown>)) {
    return (data as { data: T }).data;
  }

  return data as T;
};

const artistService = {
  /**
   * Get all artists with pagination and filters
   */
  getAllArtists: async (): Promise<Artist[]> => {
    const response = await apiService.get<Artist[]>('/artist/list');
    return extractResponseData<Artist[]>(response);
  },

  /**
   * Get artist by ID
   */
  getArtistById: async (id: string): Promise<Artist> => {
    const response = await apiService.get<Artist>(`/artist/details/${id}`);
    return extractResponseData<Artist>(response);
  },

  /**
   * Create a new artist
   */
  createArtist: async (artistData: CreateArtistData): Promise<Artist> => {
    const response = await apiService.post<Artist>('/artist', artistData);
    return extractResponseData<Artist>(response);
  },

  /**
   * Update an existing artist
   */
  updateArtist: async (id: string, artistData: Partial<Artist>): Promise<Artist> => {
    const response = await apiService.put<Artist>(`/artist/update/${id}`, artistData);
    return extractResponseData<Artist>(response);
  },

  /**
   * Delete an artist
   */
  deleteArtist: async (id: string): Promise<void> => {
    await apiService.delete(`/artist/delete/${id}`);
  },

  /**
   * Get artist statistics
   */
  getArtistStats: async (id: string | number) => {
    const response = await apiService.get(`/artists/${id}/stats`);
    return response.data;
  },

  /**
   * Get artist songs
   */
  getArtistSongs: async (id: string): Promise<Song[]> => {
    const response = await apiService.get<Song[]>(`/artist/${id}/songs`);
    return extractResponseData<Song[]>(response);
  },

  /**
   * Get artist albums
   */
  getArtistAlbums: async (id: string): Promise<Album[]> => {
    const response = await apiService.get<Album[]>(`/artist/${id}/albums`);
    return extractResponseData<Album[]>(response);
  },

  /**
   * Approve a pending artist
   */
  approveArtist: async (id: string | number) => {
    const response = await apiService.put<Artist>(`/admin/artists/${id}/approve`, { approved: true });
    return extractResponseData<Artist>(response);
  },

  /**
   * Reject a pending artist
   */
  rejectArtist: async (id: string | number, reason: string) => {
    const response = await apiService.put<Artist>(`/admin/artists/${id}/approve`, { approved: false, reason });
    return extractResponseData<Artist>(response);
  },

  /**
   * Suspend an artist
   */
  suspendArtist: async (id: string | number, reason: string) => {
    const response = await apiService.post(`/artists/${id}/suspend`, { reason });
    return response.data;
  },

  /**
   * Reactivate a suspended artist
   */
  reactivateArtist: async (id: string | number) => {
    const response = await apiService.post(`/artists/${id}/reactivate`);
    return response.data;
  }
};

export default artistService; 