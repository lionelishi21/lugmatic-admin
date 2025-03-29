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

  export interface Artist {
    id: string;
    name: string;
    profile_image?: string;
    total_listeners: number;
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
