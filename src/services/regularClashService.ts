import apiService from './api';

export interface ClashPool {
  _id: string;
  title: string;
  description?: string;
  season: number;
  status: 'open' | 'submission' | 'voting' | 'ended';
  realm: string;
  challengeDeadline: string;
  submissionDeadline: string;
  votingDeadline: string;
  totalClashes: number;
  createdAt: string;
}

export interface RegularClashArtist {
  _id: string;
  name: string;
  image?: string;
}

export interface RegularClashItem {
  _id: string;
  status: string;
  realm: string;
  challenger: RegularClashArtist;
  opponent: RegularClashArtist;
  challengerVotes: number;
  opponentVotes: number;
  giftPoints: { challenger: number; opponent: number };
  challengerVideo?: { submittedAt?: string };
  opponentVideo?: { submittedAt?: string };
  winner?: { _id: string; name: string };
  createdAt: string;
}

const REALMS = ['fire', 'ice', 'reggae', 'dancehall', 'hiphop', 'rnb', 'afrobeats'];

export const getAdminPools = async (): Promise<ClashPool[]> => {
  const res = await apiService.get('/regular-clash/pool/admin');
  return res.data?.data ?? [];
};

export const createPool = async (data: {
  title: string;
  description?: string;
  season: number;
  realm: string;
  challengeDeadline: string;
  submissionDeadline: string;
  votingDeadline: string;
}): Promise<ClashPool> => {
  const res = await apiService.post('/regular-clash/pool', data);
  return res.data?.data;
};

export const updatePoolStatus = async (poolId: string, status: string): Promise<ClashPool> => {
  const res = await apiService.patch(`/regular-clash/pool/${poolId}/status`, { status });
  return res.data?.data;
};

export const getPool = async (poolId: string): Promise<{ pool: ClashPool; clashes: RegularClashItem[] }> => {
  const res = await apiService.get(`/regular-clash/pool/${poolId}`);
  return res.data?.data;
};

export { REALMS };
