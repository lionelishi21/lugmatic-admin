import apiService from './api';

export interface ClashRanking {
  _id: string;
  totalScore: number;
  clashCount: number;
  name: string;
  image: string;
}

export interface ClashResponse {
  _id: string;
  challenger: { _id: string; name: string; image: string };
  opponent: { _id: string; name: string; image: string };
  challengerScore: number;
  opponentScore: number;
  status: string;
  startTime: string;
  endTime: string;
  winner?: { _id: string; name: string; image: string };
}

const clashService = {
  getRankings: async (period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<ClashRanking[]> => {
    const response = await apiService.get<ClashRanking[]>(`/clash/rankings?period=${period}`);
    return response.data.data;
  },

  getClashDetails: async (clashId: string): Promise<ClashResponse> => {
    const response = await apiService.get<ClashResponse>(`/clash/${clashId}`);
    return response.data.data;
  },

  inviteToClash: async (opponentArtistId: string, duration = 300): Promise<ClashResponse> => {
    const response = await apiService.post<ClashResponse>('/clash/invite', { opponentArtistId, duration });
    return response.data.data;
  },

  acceptClash: async (clashId: string): Promise<ClashResponse> => {
    const response = await apiService.post<ClashResponse>(`/clash/${clashId}/accept`);
    return response.data.data;
  },

  rejectClash: async (clashId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiService.post<{ success: boolean; message: string }>(`/clash/${clashId}/reject`);
    return response.data.data;
  }
};

export default clashService;
