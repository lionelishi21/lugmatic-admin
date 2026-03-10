import apiService from './api';

export interface Transaction {
    _id: string;
    user: any;
    artist?: any;
    type: 'coin_purchase' | 'gift_sent' | 'gift_received' | 'subscription_payment' | 'payout' | 'withdrawal';
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
    monthlyEarnings: number;
    breakdown: Record<string, number>;
    history: Transaction[];
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

export const financeService = {
    // Artist methods
    getArtistEarnings: async () => {
        const response = await apiService.get<ArtistEarningsStats>('/finance/earnings');
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
    }
};

export default financeService;
