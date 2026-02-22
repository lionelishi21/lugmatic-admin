import { AxiosResponse } from 'axios';
import apiService from './api';

// Album interface
export interface Album {
  _id: string;
  name: string;
  artist: string | { _id: string; name: string };
  releaseDate: string;
  genre: string | { _id: string; name: string };
  coverArt: string;
  songs?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAlbumData {
  name: string;
  artist: string;
  releaseDate: string;
  genre: string;
  coverArt: string;
  songs?: string[];
}

export interface UpdateAlbumData {
  name?: string;
  artist?: string;
  releaseDate?: string;
  genre?: string;
  coverArt?: string;
  songs?: string[];
}

const extractResponseData = <T>(response: AxiosResponse<T | { data: T }>): T => {
  const { data } = response;

  if (data && typeof data === 'object' && 'data' in (data as Record<string, unknown>)) {
    return (data as { data: T }).data;
  }

  return data as T;
};

const albumService = {
  /**
   * Get all albums
   */
  getAllAlbums: async (): Promise<Album[]> => {
    const response = await apiService.get<Album[]>('/album/list');
    return extractResponseData<Album[]>(response);
  },

  /**
   * Get album by ID
   */
  getAlbumById: async (id: string): Promise<Album> => {
    const response = await apiService.get<Album>(`/album/details/${id}`);
    return extractResponseData<Album>(response);
  },

  /**
   * Get album for admin view (details + populated songs/artist)
   */
  adminGetAlbumById: async (id: string): Promise<Album> => {
    const response = await apiService.get<Album>(`/admin/albums/${id}`);
    return extractResponseData<Album>(response);
  },

  /**
   * Create a new album (JSON, no image)
   */
  createAlbum: async (albumData: CreateAlbumData): Promise<Album> => {
    const response = await apiService.post<Album>('/album/create', albumData);
    return extractResponseData<Album>(response);
  },

  /**
   * Create album with cover art image file (multipart/form-data)
   */
  createAlbumWithImage: async (albumData: Omit<CreateAlbumData, 'coverArt'>, coverArtFile: File): Promise<Album> => {
    const formData = new FormData();
    formData.append('coverArt', coverArtFile);
    formData.append('name', albumData.name);
    formData.append('artist', albumData.artist);
    if (albumData.releaseDate) formData.append('releaseDate', albumData.releaseDate);
    if (albumData.genre) formData.append('genre', albumData.genre);
    if (albumData.songs?.length) formData.append('songs', JSON.stringify(albumData.songs));

    const response = await apiService.post<Album>('/album/create-with-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return extractResponseData<Album>(response);
  },

  /**
   * Upload cover art separately and get URL
   */
  uploadCoverArt: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('coverArt', file);
    const response = await apiService.post<{ url: string }>('/album/upload-cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const data = extractResponseData<{ url: string }>(response);
    return data.url;
  },

  /**
   * Update an existing album
   */
  updateAlbum: async (id: string, albumData: Partial<UpdateAlbumData>): Promise<Album> => {
    const response = await apiService.put<Album>(`/album/update/${id}`, albumData);
    return extractResponseData<Album>(response);
  },

  /**
   * Admin update album content
   */
  adminUpdateAlbum: async (id: string, albumData: Partial<UpdateAlbumData>): Promise<Album> => {
    const response = await apiService.patch<Album>(`/admin/albums/${id}`, albumData);
    return extractResponseData<Album>(response);
  },

  /**
   * Delete an album
   */
  deleteAlbum: async (id: string): Promise<void> => {
    await apiService.delete(`/album/delete/${id}`);
  },
};

export default albumService;

