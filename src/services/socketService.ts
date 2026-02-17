import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './api';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface StreamState {
  streamId: string;
  title: string;
  status: 'live';
  currentViewers: number;
  speakers: Array<{
    user: { _id: string; firstName: string; lastName?: string; profilePicture?: string };
    role: string;
    isMuted: boolean;
  }>;
  chatEnabled: boolean;
  giftsEnabled: boolean;
  recentMessages: ChatMessage[];
}

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
  animation?: boolean;
}

export interface ViewerEvent {
  userId: string;
  username: string;
  profilePicture?: string;
  currentViewers: number;
  timestamp: string;
}

export interface StreamEndedEvent {
  streamId: string;
  duration: number;
  totalViewers: number;
  peakViewers: number;
  totalGiftsReceived: number;
  totalGiftValue: number;
  timestamp: string;
}

// ─── Socket Service ──────────────────────────────────────────────────────────

// Socket.io needs a direct connection to the backend server (can't go through Vercel proxy)
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
  || (() => {
    const api = import.meta.env.VITE_API_URL || 'http://localhost:3008/api';
    // If API_URL is a relative path like /api, we can't derive a socket URL from it
    if (api.startsWith('/')) return 'http://localhost:3008';
    return api.replace(/\/api\/?$/, '');
  })();

class SocketService {
  private socket: Socket | null = null;
  private currentStreamId: string | null = null;

  // Event handler maps
  private handlers: Map<string, Set<(...args: unknown[]) => void>> = new Map();

  /**
   * Connect to the Socket.io server with auth token.
   */
  connect(): Socket {
    if (this.socket?.connected) return this.socket;

    const token = getAccessToken();
    if (!token) throw new Error('No auth token available');

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    return this.socket;
  }

  /**
   * Disconnect from the Socket.io server.
   */
  disconnect(): void {
    if (this.currentStreamId) {
      this.leaveStream(this.currentStreamId);
    }
    this.socket?.disconnect();
    this.socket = null;
    this.handlers.clear();
  }

  /**
   * Ensure socket is connected, connect if not.
   */
  private ensureConnected(): Socket {
    if (!this.socket?.connected) {
      return this.connect();
    }
    return this.socket;
  }

  // ─── Stream Room Events ──────────────────────────────────────────────────

  /**
   * Join a live stream room.
   */
  joinStream(streamId: string): void {
    const socket = this.ensureConnected();
    this.currentStreamId = streamId;
    socket.emit('stream:join', { streamId });
  }

  /**
   * Leave a live stream room.
   */
  leaveStream(streamId: string): void {
    this.socket?.emit('stream:leave', { streamId });
    if (this.currentStreamId === streamId) {
      this.currentStreamId = null;
    }
  }

  // ─── Send Events ────────────────────────────────────────────────────────

  /**
   * Send a chat message in the current stream.
   */
  sendChat(streamId: string, message: string): void {
    this.ensureConnected().emit('stream:chat', { streamId, message });
  }

  /**
   * Send a gift in the current stream.
   */
  sendGift(streamId: string, giftId: string, giftName: string, giftValue: number, message?: string): void {
    this.ensureConnected().emit('stream:gift', {
      streamId,
      giftId,
      giftName,
      giftValue,
      message,
    });
  }

  /**
   * Send an emoji reaction.
   */
  sendReaction(streamId: string, emoji: string): void {
    this.ensureConnected().emit('stream:reaction', { streamId, emoji });
  }

  /**
   * Send typing indicator.
   */
  sendTyping(streamId: string): void {
    this.ensureConnected().emit('stream:typing', { streamId });
  }

  // ─── Listen for Events ──────────────────────────────────────────────────

  /**
   * Listen for initial stream state on join.
   */
  onStreamState(callback: (data: StreamState) => void): void {
    this.on('stream:state', callback);
  }

  /**
   * Listen for new chat messages.
   */
  onChatMessage(callback: (data: ChatMessage) => void): void {
    this.on('stream:chat-message', callback);
  }

  /**
   * Listen for gift events.
   */
  onGiftReceived(callback: (data: ChatMessage) => void): void {
    this.on('stream:gift-received', callback);
  }

  /**
   * Listen for viewer joined events.
   */
  onViewerJoined(callback: (data: ViewerEvent) => void): void {
    this.on('stream:viewer-joined', callback);
  }

  /**
   * Listen for viewer left events.
   */
  onViewerLeft(callback: (data: ViewerEvent) => void): void {
    this.on('stream:viewer-left', callback);
  }

  /**
   * Listen for stream ended event.
   */
  onStreamEnded(callback: (data: StreamEndedEvent) => void): void {
    this.on('stream:ended', callback);
  }

  /**
   * Listen for settings updates.
   */
  onSettingsUpdated(callback: (data: { chatEnabled: boolean; giftsEnabled: boolean; title: string }) => void): void {
    this.on('stream:settings-updated', callback);
  }

  /**
   * Listen for errors.
   */
  onError(callback: (data: { message: string }) => void): void {
    this.on('error', callback);
  }

  // ─── Generic Helpers ────────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private on(event: string, callback: (...args: any[]) => void): void {
    const socket = this.ensureConnected();

    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(callback);
    socket.on(event, callback);
  }

  /**
   * Remove a specific listener for an event.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  off(event: string, callback: (...args: any[]) => void): void {
    this.socket?.off(event, callback);
    this.handlers.get(event)?.delete(callback);
  }

  /**
   * Remove all listeners for all stream events.
   */
  removeAllStreamListeners(): void {
    const streamEvents = [
      'stream:state',
      'stream:chat-message',
      'stream:gift-received',
      'stream:viewer-joined',
      'stream:viewer-left',
      'stream:ended',
      'stream:settings-updated',
      'stream:reaction',
      'stream:user-typing',
      'error',
    ];

    for (const event of streamEvents) {
      const eventHandlers = this.handlers.get(event);
      if (eventHandlers) {
        for (const handler of eventHandlers) {
          this.socket?.off(event, handler);
        }
        this.handlers.delete(event);
      }
    }
  }
}

// Singleton instance
const socketService = new SocketService();
export default socketService;
