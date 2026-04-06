import axios from 'axios';
import apiService from './api';

export interface PresignedUrlResponse {
    uploadUrl: string;
    key: string;
    publicUrl: string;
    maxSize: number;
    maxSizeFormatted: string;
}

const uploadService = {
    /**
     * Get a presigned URL for a music video upload
     */
    getPresignedVideoUrl: async (filename: string, contentType: string): Promise<PresignedUrlResponse> => {
        const response = await apiService.post<PresignedUrlResponse>('/upload/presign/music-video', {
            filename,
            contentType
        });
        return response.data.data;
    },

    /**
     * Get a presigned URL for a thumbnail image (cover art endpoint can be reused)
     */
    getPresignedThumbnailUrl: async (filename: string, contentType: string): Promise<PresignedUrlResponse> => {
        const response = await apiService.post<PresignedUrlResponse>('/upload/presign/cover-art', {
            filename,
            contentType
        });
        return response.data.data;
    },

    /**
     * Upload a file directly to S3 using a presigned URL
     */
    uploadToS3: async (
        uploadUrl: string,
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<void> => {
        // Use a clean axios instance to avoid global interceptors (like Auth headers)
        const cleanAxios = axios.create({});
        await cleanAxios.put(uploadUrl, file, {
            headers: {
                'Content-Type': file.type
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(progress);
                }
            }
        });
    }
};

export default uploadService;
