import apiService from './api';

// Artist interface
export interface Artist {
  _id: string;
  name: string;
  bio?: string;
  image?: string;
  genres?: string[];
  socialLinks?: {
    website?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  createdAt: string;
  updatedAt: string;
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

// Interface for creating a new artist
export interface CreateArtistData {
  name: string;
  email: string;
  genre: string;
  status?: 'active' | 'pending' | 'inactive';
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

const artistService = {
  /**
   * Get all artists with pagination and filters
   */
  getAllArtists: async (): Promise<Artist[]> => {
    const response = await apiService.get<Artist[]>('/artist/list');
    console.log(response);
    return response.data;
  },

  /**
   * Get artist by ID
   */
  getArtistById: async (id: string): Promise<Artist> => {
    const response = await apiService.get<Artist>(`/artist/${id}`);
    console.log(response);
    return response.data.data;
  },

  /**
   * Create a new artist
   */
  createArtist: async (artistData: Omit<Artist, '_id' | 'createdAt' | 'updatedAt'>): Promise<Artist> => {
    const response = await apiService.post<Artist>('/artist/create', artistData);
    return response.data.data;
  },

  /**
   * Update an existing artist
   */
  updateArtist: async (id: string, artistData: Partial<Artist>): Promise<Artist> => {
    const response = await apiService.put<Artist>(`/artist/update/${id}`, artistData);
    return response.data.data;
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
    return response.data.data;
  },

  /**
   * Get artist albums
   */
  getArtistAlbums: async (id: string): Promise<Album[]> => {
    const response = await apiService.get<Album[]>(`/artist/${id}/albums`);
    return response.data.data;
  },

  /**
   * Approve a pending artist
   */
  approveArtist: async (id: string | number) => {
    const response = await apiService.post(`/artists/${id}/approve`);
    return response.data;
  },

  /**
   * Reject a pending artist
   */
  rejectArtist: async (id: string | number, reason: string) => {
    const response = await apiService.post(`/artists/${id}/reject`, { reason });
    return response.data;
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