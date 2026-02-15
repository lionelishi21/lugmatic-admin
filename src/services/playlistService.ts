import { AxiosResponse } from 'axios';
import apiService from './api';

// Playlist interface
export interface Playlist {
  _id: string;
  name: string;
  description?: string;
  owner?: string | { _id: string; name: string };
  songs?: string[];
  artwork?: {
    thumbnail?: string;
    full?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  isRecommended?: boolean;
  category?: string;
}

export interface CreatePlaylistData {
  name: string;
  description?: string;
  owner?: string;
  songs?: string[];
  artwork?: {
    thumbnail?: string;
    full?: string;
  };
  isRecommended?: boolean;
  category?: string;
}

export interface UpdatePlaylistData {
  name?: string;
  description?: string;
  songs?: string[];
  artwork?: {
    thumbnail?: string;
    full?: string;
  };
}

const extractResponseData = <T>(response: AxiosResponse<T | { data: T }>): T => {
  const { data } = response;

  if (data && typeof data === 'object' && 'data' in (data as Record<string, unknown>)) {
    return (data as { data: T }).data;
  }

  return data as T;
};

const playlistService = {
  /**
   * Get all playlists
   */
  getAllPlaylists: async (): Promise<Playlist[]> => {
    const response = await apiService.get<Playlist[]>('/playlist/list');
    return extractResponseData<Playlist[]>(response);
  },

  /**
   * Get recommended playlists (available to all users)
   */
  getRecommendedPlaylists: async (): Promise<Playlist[]> => {
    const response = await apiService.get<Playlist[]>('/playlist/recommended');
    return extractResponseData<Playlist[]>(response);
  },

  /**
   * @deprecated Use getRecommendedPlaylists instead
   */
  getPredefinedPlaylists: async (): Promise<Playlist[]> => {
    return playlistService.getRecommendedPlaylists();
  },

  /**
   * Get playlist by ID
   */
  getPlaylistById: async (id: string): Promise<Playlist> => {
    const response = await apiService.get<Playlist>(`/playlist/details/${id}`);
    return extractResponseData<Playlist>(response);
  },

  /**
   * Create a new playlist
   */
  createPlaylist: async (playlistData: CreatePlaylistData): Promise<Playlist> => {
    const response = await apiService.post<Playlist>('/playlist/create', playlistData);
    return extractResponseData<Playlist>(response);
  },

  /**
   * Create a recommended playlist (admin only, available to all users)
   */
  createRecommendedPlaylist: async (playlistData: CreatePlaylistData): Promise<Playlist> => {
    const data = { ...playlistData, isRecommended: true };
    return playlistService.createPlaylist(data);
  },

  /**
   * Update an existing playlist
   */
  updatePlaylist: async (id: string, playlistData: Partial<UpdatePlaylistData>): Promise<Playlist> => {
    const response = await apiService.put<Playlist>(`/playlist/update/${id}`, playlistData);
    return extractResponseData<Playlist>(response);
  },

  /**
   * Delete a playlist
   */
  deletePlaylist: async (id: string): Promise<void> => {
    await apiService.delete(`/playlist/delete/${id}`);
  },

  /**
   * Add song to playlist
   */
  addSongToPlaylist: async (playlistId: string, songId: string): Promise<Playlist> => {
    const response = await apiService.post<Playlist>(`/playlist/add-song/${playlistId}`, { songId });
    return extractResponseData<Playlist>(response);
  },

  /**
   * Remove song from playlist
   */
  removeSongFromPlaylist: async (playlistId: string, songId: string): Promise<Playlist> => {
    const response = await apiService.delete<Playlist>(`/playlist/remove-song/${playlistId}`, {
      data: { songId },
    });
    return extractResponseData<Playlist>(response);
  },

  /**
   * Get songs from playlist
   */
  getPlaylistSongs: async (playlistId: string): Promise<any[]> => {
    const response = await apiService.get<any[]>(`/playlist/songs/${playlistId}`);
    return extractResponseData<any[]>(response);
  },
};

export default playlistService;

