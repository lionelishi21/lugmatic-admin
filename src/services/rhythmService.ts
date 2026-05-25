import apiService from './api';

export interface Rhythm {
  _id: string;
  title: string;
  genre?: string;
  bpm?: number;
  audioUrl: string;
  coverArtUrl?: string;
  duration: number;
  isActive: boolean;
}

const rhythmService = {
  getRhythms: async (): Promise<Rhythm[]> => {
    const res = await apiService.get('/rhythm');
    return (res.data as any)?.data || [];
  },
  createRhythm: async (data: Partial<Rhythm> & { audioFile: string; coverArt?: string }): Promise<Rhythm> => {
    const res = await apiService.post('/rhythm', data);
    return (res.data as any)?.data;
  },
  updateRhythm: async (id: string, data: Partial<Rhythm>): Promise<Rhythm> => {
    const res = await apiService.put(`/rhythm/${id}`, data);
    return (res.data as any)?.data;
  },
  deleteRhythm: async (id: string): Promise<void> => {
    await apiService.delete(`/rhythm/${id}`);
  },
};

export default rhythmService;
