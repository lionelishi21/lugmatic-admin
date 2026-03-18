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
  }
};

export default clashService;
