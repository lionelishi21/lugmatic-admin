import { AxiosResponse } from 'axios';
import apiService from './api';

// Song interface
export interface Song {
  _id: string;
  name: string;
  artist: string | { _id: string; name: string };
  album?: string | { _id: string; name: string };
  duration: number;
  genre: string;
  releaseDate: string;
  lyrics: string;
  coverArt: string;
  audioFile: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSongData {
  name: string;
  artist: string;
  album?: string;
  duration: number;
  genre: string;
  releaseDate: string;
  lyrics: string;
  coverArt: string;
  audioFile: string;
}

export interface UpdateSongData {
  name?: string;
  artist?: string;
  album?: string;
  duration?: number;
  genre?: string;
  releaseDate?: string;
  lyrics?: string;
  coverArt?: string;
  audioFile?: string;
  isActive?: boolean;
}

const extractResponseData = <T>(response: AxiosResponse<T | { data: T }>): T => {
  const { data } = response;

  if (data && typeof data === 'object' && 'data' in (data as Record<string, unknown>)) {
    return (data as { data: T }).data;
  }

  return data as T;
};

const songService = {
  /**
   * Get all songs
   */
  getAllSongs: async (): Promise<Song[]> => {
    const response = await apiService.get<Song[]>('/song/list');
    return extractResponseData<Song[]>(response);
  },

  /**
   * Get song by ID
   */
  getSongById: async (id: string): Promise<Song> => {
    const response = await apiService.get<Song>(`/song/details/${id}`);
    return extractResponseData<Song>(response);
  },

  /**
   * Create a new song with file uploads
   */
  createSong: async (songData: CreateSongData, audioFile?: File, coverArtFile?: File): Promise<Song> => {
    const formData = new FormData();
    
    // Add text fields
    formData.append('name', songData.name);
    formData.append('artist', songData.artist);
    // Only append album if it has a value
    if (songData.album) {
      formData.append('album', songData.album);
    }
    formData.append('duration', songData.duration.toString());
    formData.append('genre', songData.genre);
    formData.append('releaseDate', songData.releaseDate);
    formData.append('lyrics', songData.lyrics || '');
    
    // Add files if provided
    if (audioFile) {
      formData.append('audioFile', audioFile);
    } else if (songData.audioFile) {
      // Fallback to URL if no file provided
      formData.append('audioFile', songData.audioFile);
    }
    
    if (coverArtFile) {
      formData.append('coverArt', coverArtFile);
    } else if (songData.coverArt) {
      // Fallback to base64 or URL if no file provided
      formData.append('coverArt', songData.coverArt);
    }
    
    // Don't set Content-Type header - let axios set it automatically with boundary for FormData
    const response = await apiService.post<Song>('/song/create', formData);
    return extractResponseData<Song>(response);
  },

  /**
   * Update an existing song (if backend supports it)
   */
  updateSong: async (id: string, songData: Partial<UpdateSongData>): Promise<Song> => {
    // Note: Backend may not have update endpoint yet
    const response = await apiService.put<Song>(`/song/update/${id}`, songData);
    return extractResponseData<Song>(response);
  },

  /**
   * Delete a song (if backend supports it)
   */
  deleteSong: async (id: string): Promise<void> => {
    // Note: Backend may not have delete endpoint yet
    await apiService.delete(`/song/delete/${id}`);
  },

  /**
   * Upload cover art image (converts to base64 for preview)
   */
  uploadCoverArt: async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  },
};

export default songService;

