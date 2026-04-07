import apiService from './api';

export interface Promotion {
  _id: string;
  song: {
    _id: string;
    name: string;
    coverArt?: string;
    status: string;
  };
  artist: string;
  packageType: 'trending_boost' | 'billboard_boost' | 'pro_spotlight';
  amount: number;
  currency: string;
  startDate?: string;
  endDate?: string;
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  createdAt: string;
}

const promotionService = {
  /**
   * Get promotions for the authenticated artist
   */
  getArtistPromotions: async () => {
    const response = await apiService.get('/song/artist-promotions');
    return response.data.data;
  },

  /**
   * Create a Stripe Checkout session for a promotion
   */
  createPromotionSession: async (songId: string, packageType: string) => {
    const response = await apiService.post('/song/promotions/create-session', {
      songId,
      packageType
    });
    return response.data.data;
  },

  /**
   * Get active boosts for a song
   */
  getSongBoosts: async (songId: string) => {
    const response = await apiService.get(`/song/stats/boosts/${songId}`);
    return response.data.data;
  }
};

export default promotionService;
