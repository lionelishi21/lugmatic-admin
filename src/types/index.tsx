export interface PlatformStats {
    totalArtists: number;
    totalTracks: number;
    activeLiveStreams: number;
    totalRevenue: number;
  }

  export interface RecentActivity {
    id: string;
    type: 'track_upload' | 'live_stream' | 'artist_signup';
    artistName: string;
    title?: string;
    timestamp: string;
  }
  
  export interface Track {
    id: string;
    title: string;
    cover_url?: string;
    artistName: string;
    timestamp: string;
    profiles: {
      name: string;
    };
  }  

// types/user.ts
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country: string;
}

export interface PaymentMethod {
  cardNumber: string;
  expirationDate: Date;
  cvv: string;
  billingAddress: Address;
}

export interface UserPreferences {
  newsletter: boolean;
  theme: 'light' | 'dark';
}

export type UserRole = 'user' | 'admin' | 'artist' | 'super admin';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: Address;
  paymentMethods?: PaymentMethod[];
  isEmailVerified: boolean;
  isActive: boolean;
  role: UserRole;
  profilePicture?: string;
  preferences: UserPreferences;
  isArtist: boolean;
  createdAt: Date;
  updatedAt: Date;
  fullName: string; // Virtual field
}

export interface SocialLinks {
  website?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
}

export interface Artist {
  _id: string;
  name: string;
  bio?: string;
  image?: string;
  genres: string[];
  socialLinks: SocialLinks;
  user: string | User; // Can be either ID string or populated User object
  createdAt: Date;
  updatedAt: Date;
}

// Request/Response types for artist operations
export interface CreateArtistRequest {
  name: string;
  bio?: string;
  image?: string;
  genres?: string[];
  socialLinks?: {
    website?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
}

export interface UpdateArtistRequest {
  name?: string;
  bio?: string;
  image?: string;
  genres?: string[];
  socialLinks?: {
    website?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
}

export interface ArtistResponse {
  success: boolean;
  data: Artist;
}

export interface ArtistsListResponse {
  success: boolean;
  count: number;
  data: Artist[];
}

// Optional: Type guard to check if user field is populated
export function isPopulatedUser(user: string | User): user is User {
  return typeof user !== 'string' && user !== null && typeof user === 'object';
}

// New types for comprehensive features

// Podcast types
export interface Podcast {
  _id: string;
  title: string;
  description: string;
  artist: string | Artist;
  coverImage?: string;
  audioUrl: string;
  duration: number;
  category: string;
  tags: string[];
  isPublished: boolean;
  isLive: boolean;
  listeners: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePodcastRequest {
  title: string;
  description: string;
  coverImage?: string;
  audioUrl: string;
  category: string;
  tags?: string[];
}

export interface UpdatePodcastRequest {
  title?: string;
  description?: string;
  coverImage?: string;
  audioUrl?: string;
  category?: string;
  tags?: string[];
  isPublished?: boolean;
}

// Comment types
export interface Comment {
  _id: string;
  content: string;
  user: string | User;
  artist?: string | Artist;
  podcast?: string | Podcast;
  parentComment?: string | Comment;
  replies: Comment[];
  likes: number;
  isEdited: boolean;
  isModerated: boolean;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentRequest {
  content: string;
  artist?: string;
  podcast?: string;
  parentComment?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

// Gift types
export interface Gift {
  _id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  isActive: boolean;
  stock: number;
  rules?: GiftRules;
  effects?: GiftEffects;
  createdAt: Date;
  updatedAt: Date;
}

export interface GiftRules {
  minAmount: number;
  maxAmount: number;
  cooldownMinutes: number;
  dailyLimit: number;
  requiresVerification: boolean;
  allowedCategories?: string[];
  restrictedUsers?: string[];
  timeRestrictions?: {
    startTime?: string;
    endTime?: string;
    daysOfWeek?: number[];
  };
}

export interface GiftEffects {
  showAnimation: boolean;
  playSound: boolean;
  specialEffect: string;
  animationDuration?: number;
  soundUrl?: string;
  visualEffects?: {
    particles?: boolean;
    sparkles?: boolean;
    glow?: boolean;
    color?: string;
  };
}

export interface CreateGiftRequest {
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isActive?: boolean;
  stock?: number;
  rules?: GiftRules;
  effects?: GiftEffects;
}

export interface UpdateGiftRequest {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  image?: string;
  isActive?: boolean;
  stock?: number;
  rules?: GiftRules;
  effects?: GiftEffects;
}

export interface GiftAnalytics {
  totalSent: number;
  totalReceived: number;
  totalRevenue: number;
  averageValue: number;
  popularGifts: Array<{
    gift: Gift;
    count: number;
    revenue: number;
  }>;
  dailyStats: Array<{
    date: string;
    sent: number;
    received: number;
    revenue: number;
  }>;
  userStats: Array<{
    user: User;
    sentCount: number;
    receivedCount: number;
    totalSpent: number;
    totalEarned: number;
  }>;
}

export interface GiftStats {
  totalGifts: number;
  activeGifts: number;
  totalValue: number;
  totalStock: number;
  categories: Array<{
    name: string;
    count: number;
    totalValue: number;
  }>;
  recentActivity: Array<{
    gift: Gift;
    action: 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated';
    timestamp: Date;
    user: User;
  }>;
}

export interface GiftTemplate {
  _id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  defaultRules: GiftRules;
  defaultEffects: GiftEffects;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GiftBackup {
  _id: string;
  giftId: string;
  version: string;
  data: Gift;
  createdAt: Date;
  size: number;
  checksum: string;
}

export interface GiftAuditLog {
  _id: string;
  giftId: string;
  action: 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated' | 'stock_updated' | 'price_updated';
  changes: Record<string, any>;
  user: User;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface GiftTransaction {
  _id: string;
  gift: string | Gift;
  sender: string | User;
  recipient: string | Artist;
  quantity: number;
  totalAmount: number;
  message?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGiftTransactionRequest {
  giftId: string;
  recipientId: string;
  quantity: number;
  message?: string;
}

// Notification types
export interface Notification {
  _id: string;
  user: string | User;
  type: 'gift' | 'comment' | 'like' | 'follow' | 'system' | 'podcast' | 'earnings';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationRequest {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}

// Subscription types
export interface Subscription {
  _id: string;
  user: string | User;
  artist: string | Artist;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Search and Discovery types
export interface SearchFilters {
  category?: string;
  genre?: string;
  duration?: number;
  priceRange?: { min: number; max: number };
  sortBy?: 'relevance' | 'newest' | 'popular' | 'price';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  podcasts: Podcast[];
  artists: Artist[];
  total: number;
  page: number;
  pageSize: number;
}

// Analytics types
export interface AnalyticsData {
  totalListeners: number;
  totalEarnings: number;
  totalGifts: number;
  totalComments: number;
  growthRate: number;
  topPodcasts: Podcast[];
  recentActivity: RecentActivity[];
}

export interface EarningsData {
  totalEarnings: number;
  monthlyEarnings: number;
  giftEarnings: number;
  subscriptionEarnings: number;
  earningsHistory: Array<{
    date: string;
    amount: number;
    source: string;
  }>;
}

// Admin types
export interface AdminDashboardData {
  totalUsers: number;
  totalArtists: number;
  totalPodcasts: number;
  totalRevenue: number;
  recentSignups: User[];
  topArtists: Artist[];
  systemStats: {
    activeUsers: number;
    totalStreams: number;
    averageSessionTime: number;
  };
}

export interface ContentModerationData {
  pendingComments: Comment[];
  flaggedContent: Array<{
    type: 'comment' | 'podcast' | 'user';
    item: Comment | Podcast | User;
    reason: string;
    reporter: User;
  }>;
  moderationStats: {
    totalFlagged: number;
    resolvedToday: number;
    pendingReview: number;
  };
}

// Music/Track types (extended)
export interface Music {
  _id: string;
  title: string;
  artist: string | Artist;
  album?: string;
  genre: string;
  duration: number;
  audioUrl: string;
  coverImage?: string;
  lyrics?: string;
  isPublished: boolean;
  plays: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Album {
  _id: string;
  title: string;
  artist: string | Artist;
  description?: string;
  coverImage?: string;
  tracks: Music[];
  releaseDate: Date;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Live streaming types
export interface LiveStream {
  _id: string;
  title: string;
  description: string;
  artist: string | Artist;
  streamUrl: string;
  thumbnail?: string;
  isLive: boolean;
  viewers: number;
  likes: number;
  gifts: GiftTransaction[];
  scheduledAt?: Date;
  startedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Payment and billing types
export interface Payment {
  _id: string;
  user: string | User;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  description: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Form types for components
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  isArtist: boolean;
}

export interface ProfileUpdateForm {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: Address;
  profilePicture?: string;
  preferences?: UserPreferences;
}

// Filter and sort types
export interface FilterOptions {
  category?: string;
  genre?: string;
  priceRange?: { min: number; max: number };
  duration?: { min: number; max: number };
  dateRange?: { start: Date; end: Date };
}

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

// Error types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

// WebSocket types for real-time features
export interface WebSocketMessage {
  type: 'notification' | 'live_stream_update' | 'gift_received' | 'comment_added';
  data: any;
  timestamp: Date;
}

// Theme and UI types
export interface Theme {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
}

export interface UIState {
  sidebarOpen: boolean;
  theme: Theme;
  notifications: Notification[];
  unreadCount: number;
}