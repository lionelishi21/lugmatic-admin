import apiService from './api';

export interface Video {
    _id: string;
    title: string;
    description?: string;
    videoUrl: string;
    thumbnailUrl?: string;
    artist: {
        _id: string;
        name: string;
        image?: string;
    };
    song?: {
        _id: string;
        name: string;
        coverArt?: string;
    };
    pushedToFeed: boolean;
    views: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ShortClip {
    _id: string;
    title: string;
    description?: string;
    recordingUrl: string;
    thumbnailUrl?: string;
    artist: { _id: string; name: string; image?: string };
    views: number;
    likesCount: number;
    duration?: number;
    createdAt: string;
}

export interface CreateShortClipData {
    title: string;
    description?: string;
    videoUrl: string;
    thumbnailUrl?: string;
    duration?: number;
    songId?: string;
}

export interface VideoFormData {
    title: string;
    description?: string;
    videoUrl: string;
    thumbnailUrl?: string;
    artistId: string;
    songId?: string;
    pushedToFeed?: boolean;
}

const videoService = {
    getAllVideos: async (): Promise<Video[]> => {
        const response = await apiService.get<Video[]>('/video/list');
        return response.data.data;
    },

    getFeedVideos: async (): Promise<Video[]> => {
        const response = await apiService.get<Video[]>('/video/feed');
        return response.data.data;
    },

    getVideoById: async (id: string): Promise<Video> => {
        const response = await apiService.get<Video>(`/video/details/${id}`);
        return response.data.data;
    },

    getVideoBySongId: async (songId: string): Promise<Video | null> => {
        try {
            const response = await apiService.get<Video>(`/video/song/${songId}`);
            return response.data.data;
        } catch (error) {
            return null;
        }
    },

    createVideo: async (videoData: VideoFormData): Promise<Video> => {
        const response = await apiService.post<Video>('/video/create', videoData);
        return response.data.data;
    },

    updateVideo: async (id: string, videoData: Partial<VideoFormData>): Promise<Video> => {
        const response = await apiService.put<Video>(`/video/update/${id}`, videoData);
        return response.data.data;
    },

    deleteVideo: async (id: string): Promise<void> => {
        await apiService.delete(`/video/delete/${id}`);
    },

    incrementViews: async (id: string): Promise<number> => {
        const response = await apiService.post<{ views: number }>(`/video/view/${id}`);
        return response.data.data.views;
    },

    getShorts: async (page = 1, limit = 12): Promise<ShortClip[]> => {
        const response = await apiService.get<ShortClip[]>(`/video/shorts?page=${page}&limit=${limit}`);
        return response.data.data;
    },

    createShortClip: async (data: CreateShortClipData): Promise<ShortClip> => {
        const response = await apiService.post<ShortClip>('/video/shorts', data);
        return response.data.data;
    },

    toggleLike: async (videoId: string): Promise<{ liked: boolean; likesCount: number }> => {
        const response = await apiService.post<{ liked: boolean; likesCount: number }>(`/video/${videoId}/like`);
        return response.data.data;
    }
};

export default videoService;
