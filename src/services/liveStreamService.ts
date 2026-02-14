import apiService from './api';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ChatMessage {
  user: string;
  username: string;
  profilePicture: string;
  message: string;
  type: 'chat' | 'gift' | 'system' | 'join' | 'leave';
  giftId?: string;
  giftName?: string;
  giftValue?: number;
  timestamp: string;
}

export interface Speaker {
  user: {
    _id: string;
    firstName: string;
    lastName?: string;
    profilePicture?: string;
  };
  role: 'host' | 'co-host' | 'speaker' | 'listener';
  joinedAt: string;
  isMuted: boolean;
}

export interface LiveStream {
  _id: string;
  title: string;
  description: string;
  category: string;
  coverImage: string;
  host: {
    _id: string;
    name: string;
    image?: string;
  };
  hostUser: {
    _id: string;
    firstName: string;
    lastName?: string;
    profilePicture?: string;
  };
  livekitRoom: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  scheduledStartTime?: string;
  actualStartTime?: string;
  endTime?: string;
  duration: number;
  currentViewers: number;
  peakViewers: number;
  totalViewers: number;
  speakers: Speaker[];
  chatMessages: ChatMessage[];
  totalGiftsReceived: number;
  totalGiftValue: number;
  chatEnabled: boolean;
  giftsEnabled: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LiveKitTokenResponse {
  token: string;
  url: string;
  roomName: string;
  role: 'host' | 'viewer';
}

export interface StreamEndSummary {
  streamId: string;
  duration: number;
  totalViewers: number;
  peakViewers: number;
  totalGiftsReceived: number;
  totalGiftValue: number;
}

export interface CreateStreamPayload {
  title: string;
  description?: string;
  category?: string;
  coverImage?: string;
  scheduledStartTime?: string;
  tags?: string[];
  chatEnabled?: boolean;
  giftsEnabled?: boolean;
}

// ─── API Calls ───────────────────────────────────────────────────────────────

const BASE = '/live-stream';

/**
 * Create a new live stream (immediate or scheduled).
 * Omit `scheduledStartTime` to go live immediately.
 */
export const createStream = async (payload: CreateStreamPayload): Promise<LiveStream> => {
  const res = await apiService.post<LiveStream>(BASE, payload);
  return res.data.data;
};

/**
 * Get a LiveKit access token + server URL for the given stream.
 * Returns host token if authenticated user is the host, viewer token otherwise.
 */
export const getStreamToken = async (streamId: string): Promise<LiveKitTokenResponse> => {
  const res = await apiService.get<LiveKitTokenResponse>(`${BASE}/${streamId}/token`);
  return res.data.data;
};

/**
 * Start a previously scheduled stream.
 */
export const startScheduledStream = async (streamId: string): Promise<LiveStream> => {
  const res = await apiService.put<LiveStream>(`${BASE}/${streamId}/start`);
  return res.data.data;
};

/**
 * End a live stream. Returns summary stats.
 */
export const endStream = async (streamId: string): Promise<StreamEndSummary> => {
  const res = await apiService.put<StreamEndSummary>(`${BASE}/${streamId}/end`);
  return res.data.data;
};

/**
 * Get stream details by ID.
 */
export const getStreamDetails = async (streamId: string): Promise<LiveStream> => {
  const res = await apiService.get<LiveStream>(`${BASE}/${streamId}`);
  return res.data.data;
};

/**
 * List all currently active (live) streams.
 */
export const getActiveStreams = async (page = 1, limit = 20, category?: string) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (category) params.set('category', category);
  const res = await apiService.get<LiveStream[]>(`${BASE}/active?${params}`);
  return res.data;
};

/**
 * Update stream settings (title, description, chat/gifts toggles).
 */
export const updateStreamSettings = async (
  streamId: string,
  settings: { chatEnabled?: boolean; giftsEnabled?: boolean; title?: string; description?: string }
): Promise<LiveStream> => {
  const res = await apiService.put<LiveStream>(`${BASE}/${streamId}/settings`, settings);
  return res.data.data;
};

export default {
  createStream,
  getStreamToken,
  startScheduledStream,
  endStream,
  getStreamDetails,
  getActiveStreams,
  updateStreamSettings,
};
