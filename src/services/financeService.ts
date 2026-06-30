import apiService from './api';

export interface Transaction {
    _id: string;
    user: any;
    artist?: any;
    type: 'coin_purchase' | 'gift_sent' | 'gift_received' | 'subscription_payment' | 'payout' | 'withdrawal' | 'manual_adjustment';
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    metadata?: any;
    description: string;
    createdAt: string;
}

export interface Payout {
    _id: string;
    artist: any;
    user: any;
    amount: number;
    currency: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    method: 'stripe' | 'paypal' | 'bank_transfer';
    stripeTransferId?: string;
    destination?: string;
    processedAt?: string;
    createdAt: string;
}

export interface ArtistEarningsStats {
    totalEarnings: number;
    availableBalance: number;
    monthlyEarnings: number;
    breakdown: Record<string, number>;
    history: Transaction[];
    pagination: { page: number; limit: number; total: number; pages: number };
}

export interface AdminFinancialStats {
    totalRevenue: number;
    revenueBreakdown: Record<string, number>;
    topEarners: {
        _id: string;
        name: string;
        revenue: number;
        transactions: number;
    }[];
    activeSubscribers: number;
    avgRevenuePerUser: number;
    payouts: Record<string, { amount: number, count: number }>;
    recentTransactions: Transaction[];
}

export interface SubscriptionPlan {
    _id: string;
    name: string;
    description?: string;
    price: number; // cents
    currency: string;
    billingCycle: 'monthly' | 'quarterly' | 'yearly';
    features: { name: string; description?: string; isEnabled?: boolean }[];
    isActive: boolean;
    sortOrder?: number;
}

export const financeService = {
    // Artist methods
    getArtistEarnings: async (page = 1, limit = 20) => {
        const response = await apiService.get<ArtistEarningsStats>(`/finance/earnings?page=${page}&limit=${limit}`);
        return response.data.data;
    },

    requestPayout: async (amount: number) => {
        const response = await apiService.post<Payout>('/finance/payouts', { amount });
        return response.data.data;
    },

    // Admin methods
    getAdminRevenue: async () => {
        const response = await apiService.get<AdminFinancialStats>('/finance/admin/revenue');
        return response.data.data;
    },

    getAdminPayouts: async (status?: string) => {
        const url = status ? `/finance/admin/payouts?status=${status}` : '/finance/admin/payouts';
        const response = await apiService.get<Payout[]>(url);
        return response.data.data;
    },

    updatePayoutStatus: async (payoutId: string, status: string, notes?: string) => {
        const response = await apiService.put<Payout>(`/finance/admin/payouts/${payoutId}/status`, { status, notes });
        return response.data.data;
    },

    createTransaction: async (artistId: string, amount: number, description: string) => {
        const response = await apiService.post<Transaction>('/finance/admin/transactions', { artistId, amount, description });
        return response.data.data;
    },

    getRevenueRanking: async (page = 1, limit = 20) => {
        const response = await apiService.get<{ rankings: AdminFinancialStats['topEarners']; pagination: { page: number; limit: number; total: number; pages: number } }>(
            `/finance/admin/revenue/ranking?page=${page}&limit=${limit}`
        );
        return response.data.data;
    },

    getRevenueTimeSeries: async (period: '30d' | '90d' | '1y' = '30d') => {
        const response = await apiService.get<{ label: string; amount: number }[]>(`/finance/admin/revenue/timeseries?period=${period}`);
        return response.data.data;
    },

    // Subscription plans
    getSubscriptionPlans: async () => {
        const response = await apiService.get<SubscriptionPlan[]>('/admin/subscription-plans');
        return response.data.data;
    },

    createSubscriptionPlan: async (plan: Partial<SubscriptionPlan>) => {
        const response = await apiService.post<SubscriptionPlan>('/admin/subscription-plans', plan);
        return response.data.data;
    },

    updateSubscriptionPlan: async (planId: string, plan: Partial<SubscriptionPlan>) => {
        const response = await apiService.put<SubscriptionPlan>(`/admin/subscription-plans/${planId}`, plan);
        return response.data.data;
    },

    // Global pricing tiers
    getPricingTiers: async () => {
        const response = await apiService.get<PricingTier[]>('/finance/admin/pricing/tiers');
        return response.data.data;
    },
    createPricingTier: async (tier: Omit<PricingTier, '_id' | 'createdAt' | 'updatedAt'>) => {
        const response = await apiService.post<PricingTier>('/finance/admin/pricing/tiers', tier);
        return response.data.data;
    },
    updatePricingTier: async (id: string, updates: Partial<PricingTier>) => {
        const response = await apiService.put<PricingTier>(`/finance/admin/pricing/tiers/${id}`, updates);
        return response.data.data;
    },
    deletePricingTier: async (id: string) => {
        await apiService.delete(`/finance/admin/pricing/tiers/${id}`);
    },
};

export interface PricingTier {
    _id: string;
    region: string;
    currency: string;
    currencySymbol: string;
    premiumPriceCents: number;
    proArtistPriceCents: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export default financeService;
