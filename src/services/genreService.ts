import { AxiosResponse } from 'axios';
import apiService from './api';

export interface Genre {
  _id: string;
  name: string;
  description: string;
  image: string;
  color: string;
  isActive: boolean;
  songCount: number;
  artistCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGenreData {
  name: string;
  description?: string;
  image?: string;
  color?: string;
  isActive?: boolean;
}

export interface UpdateGenreData {
  name?: string;
  description?: string;
  image?: string;
  color?: string;
  isActive?: boolean;
}

const extractResponseData = <T>(response: AxiosResponse<T | { data: T }>): T => {
  const { data } = response;
  if (data && typeof data === 'object' && 'data' in (data as Record<string, unknown>)) {
    return (data as { data: T }).data;
  }
  return data as T;
};

const genreService = {
  getAllGenres: async (): Promise<Genre[]> => {
    const response = await apiService.get<Genre[]>('/genre/list');
    return extractResponseData<Genre[]>(response);
  },

  getGenreById: async (id: string): Promise<Genre> => {
    const response = await apiService.get<Genre>(`/genre/details/${id}`);
    return extractResponseData<Genre>(response);
  },

  createGenre: async (data: CreateGenreData): Promise<Genre> => {
    const response = await apiService.post<Genre>('/genre/create', data);
    return extractResponseData<Genre>(response);
  },

  updateGenre: async (id: string, data: UpdateGenreData): Promise<Genre> => {
    const response = await apiService.put<Genre>(`/genre/update/${id}`, data);
    return extractResponseData<Genre>(response);
  },

  deleteGenre: async (id: string): Promise<void> => {
    await apiService.delete(`/genre/delete/${id}`);
  },
};

export default genreService;
