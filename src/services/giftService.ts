import apiService from './api';
import { CreateGiftRequest, UpdateGiftRequest, GiftRules, GiftEffects } from '../types';

export const giftService = {
  // Get all gifts
  getAllGifts: async () => {
    return apiService.get('/gifts');
  },

  // Get gift by ID
  getGiftById: async (id: string) => {
    return apiService.get(`/gifts/${id}`);
  },

  // Create new gift
  createGift: async (giftData: CreateGiftRequest) => {
    return apiService.post('/gifts', giftData);
  },

  // Update gift
  updateGift: async (id: string, giftData: UpdateGiftRequest) => {
    return apiService.put(`/gifts/${id}`, giftData);
  },

  // Delete gift
  deleteGift: async (id: string) => {
    return apiService.delete(`/gifts/${id}`);
  },

  // Get gifts by category
  getGiftsByCategory: async (category: string) => {
    return apiService.get(`/gifts/category/${category}`);
  },

  // Get active gifts
  getActiveGifts: async () => {
    return apiService.get('/gifts/active');
  },

  // Update gift rules
  updateGiftRules: async (id: string, rules: GiftRules) => {
    return apiService.put(`/gifts/${id}/rules`, rules);
  },

  // Update gift effects
  updateGiftEffects: async (id: string, effects: GiftEffects) => {
    return apiService.put(`/gifts/${id}/effects`, effects);
  },

  // Get gift analytics
  getGiftAnalytics: async (id: string) => {
    return apiService.get(`/gifts/${id}/analytics`);
  },

  // Get all gift analytics
  getAllGiftAnalytics: async () => {
    return apiService.get('/gifts/analytics');
  },

  // Bulk update gifts
  bulkUpdateGifts: async (gifts: { id: string; data: UpdateGiftRequest }[]) => {
    return apiService.put('/gifts/bulk', { gifts });
  },

  // Upload gift image
  uploadGiftImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiService.post('/gifts/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get gift categories
  getGiftCategories: async () => {
    return apiService.get('/gifts/categories');
  },

  // Get gift statistics
  getGiftStats: async () => {
    return apiService.get('/gifts/stats');
  },

  // Search gifts
  searchGifts: async (query: string) => {
    return apiService.get(`/gifts/search?q=${encodeURIComponent(query)}`);
  },

  // Filter gifts
  filterGifts: async (filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    isActive?: boolean;
  }) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    return apiService.get(`/gifts/filter?${params.toString()}`);
  },

  // Export gifts
  exportGifts: async (format: 'csv' | 'json' | 'xlsx' = 'csv') => {
    return apiService.get(`/gifts/export?format=${format}`, {
      responseType: 'blob',
    });
  },

  // Import gifts
  importGifts: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiService.post('/gifts/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get gift templates
  getGiftTemplates: async () => {
    return apiService.get('/gifts/templates');
  },

  // Create gift from template
  createGiftFromTemplate: async (templateId: string, customizations: Partial<CreateGiftRequest>) => {
    return apiService.post(`/gifts/templates/${templateId}`, customizations);
  },

  // Duplicate gift
  duplicateGift: async (id: string, newName: string) => {
    return apiService.post(`/gifts/${id}/duplicate`, { newName });
  },

  // Archive gift
  archiveGift: async (id: string) => {
    return apiService.put(`/gifts/${id}/archive`);
  },

  // Restore archived gift
  restoreGift: async (id: string) => {
    return apiService.put(`/gifts/${id}/restore`);
  },

  // Get archived gifts
  getArchivedGifts: async () => {
    return apiService.get('/gifts/archived');
  },

  // Update gift stock
  updateGiftStock: async (id: string, stock: number) => {
    return apiService.put(`/gifts/${id}/stock`, { stock });
  },

  // Get gift usage history
  getGiftUsageHistory: async (id: string, period: 'day' | 'week' | 'month' | 'year' = 'month') => {
    return apiService.get(`/gifts/${id}/usage-history?period=${period}`);
  },

  // Get popular gifts
  getPopularGifts: async (limit: number = 10) => {
    return apiService.get(`/gifts/popular?limit=${limit}`);
  },

  // Get trending gifts
  getTrendingGifts: async (limit: number = 10) => {
    return apiService.get(`/gifts/trending?limit=${limit}`);
  },

  // Set gift as featured
  setGiftFeatured: async (id: string, featured: boolean) => {
    return apiService.put(`/gifts/${id}/featured`, { featured });
  },

  // Get featured gifts
  getFeaturedGifts: async () => {
    return apiService.get('/gifts/featured');
  },

  // Update gift pricing
  updateGiftPricing: async (id: string, pricing: {
    price: number;
    discount?: number;
    salePrice?: number;
    saleEndDate?: Date;
  }) => {
    return apiService.put(`/gifts/${id}/pricing`, pricing);
  },

  // Get gift recommendations
  getGiftRecommendations: async (giftId: string, limit: number = 5) => {
    return apiService.get(`/gifts/${giftId}/recommendations?limit=${limit}`);
  },

  // Validate gift data
  validateGiftData: async (giftData: CreateGiftRequest) => {
    return apiService.post('/gifts/validate', giftData);
  },

  // Get gift performance metrics
  getGiftPerformance: async (id: string) => {
    return apiService.get(`/gifts/${id}/performance`);
  },

  // Set gift availability
  setGiftAvailability: async (id: string, available: boolean) => {
    return apiService.put(`/gifts/${id}/availability`, { available });
  },

  // Get gift inventory
  getGiftInventory: async () => {
    return apiService.get('/gifts/inventory');
  },

  // Update gift inventory
  updateGiftInventory: async (inventory: { id: string; stock: number }[]) => {
    return apiService.put('/gifts/inventory', { inventory });
  },

  // Get low stock gifts
  getLowStockGifts: async (threshold: number = 10) => {
    return apiService.get(`/gifts/low-stock?threshold=${threshold}`);
  },

  // Get gift sales report
  getGiftSalesReport: async (startDate: string, endDate: string) => {
    return apiService.get(`/gifts/sales-report?startDate=${startDate}&endDate=${endDate}`);
  },

  // Get gift revenue analytics
  getGiftRevenueAnalytics: async (period: 'day' | 'week' | 'month' | 'year' = 'month') => {
    return apiService.get(`/gifts/revenue-analytics?period=${period}`);
  },

  // Get gift user engagement
  getGiftUserEngagement: async (id: string) => {
    return apiService.get(`/gifts/${id}/user-engagement`);
  },

  // Set gift priority
  setGiftPriority: async (id: string, priority: number) => {
    return apiService.put(`/gifts/${id}/priority`, { priority });
  },

  // Get gift priority list
  getGiftPriorityList: async () => {
    return apiService.get('/gifts/priority-list');
  },

  // Update gift display order
  updateGiftDisplayOrder: async (order: { id: string; order: number }[]) => {
    return apiService.put('/gifts/display-order', { order });
  },

  // Get gift display order
  getGiftDisplayOrder: async () => {
    return apiService.get('/gifts/display-order');
  },

  // Set gift visibility
  setGiftVisibility: async (id: string, visible: boolean) => {
    return apiService.put(`/gifts/${id}/visibility`, { visible });
  },

  // Get visible gifts
  getVisibleGifts: async () => {
    return apiService.get('/gifts/visible');
  },

  // Get gift audit log
  getGiftAuditLog: async (id: string) => {
    return apiService.get(`/gifts/${id}/audit-log`);
  },

  // Get all gift audit logs
  getAllGiftAuditLogs: async () => {
    return apiService.get('/gifts/audit-logs');
  },

  // Restore gift from audit log
  restoreGiftFromAudit: async (id: string, auditId: string) => {
    return apiService.post(`/gifts/${id}/restore-from-audit/${auditId}`);
  },

  // Get gift change history
  getGiftChangeHistory: async (id: string) => {
    return apiService.get(`/gifts/${id}/change-history`);
  },

  // Compare gift versions
  compareGiftVersions: async (id: string, version1: string, version2: string) => {
    return apiService.get(`/gifts/${id}/compare-versions?version1=${version1}&version2=${version2}`);
  },

  // Get gift version history
  getGiftVersionHistory: async (id: string) => {
    return apiService.get(`/gifts/${id}/version-history`);
  },

  // Revert gift to version
  revertGiftToVersion: async (id: string, version: string) => {
    return apiService.post(`/gifts/${id}/revert-to-version/${version}`);
  },

  // Get gift backup
  getGiftBackup: async (id: string) => {
    return apiService.get(`/gifts/${id}/backup`);
  },

  // Restore gift from backup
  restoreGiftFromBackup: async (id: string, backupId: string) => {
    return apiService.post(`/gifts/${id}/restore-from-backup/${backupId}`);
  },

  // Create gift backup
  createGiftBackup: async (id: string) => {
    return apiService.post(`/gifts/${id}/backup`);
  },

  // Get gift backup history
  getGiftBackupHistory: async (id: string) => {
    return apiService.get(`/gifts/${id}/backup-history`);
  },

  // Delete gift backup
  deleteGiftBackup: async (id: string, backupId: string) => {
    return apiService.delete(`/gifts/${id}/backup/${backupId}`);
  },

  // Get gift backup size
  getGiftBackupSize: async (id: string) => {
    return apiService.get(`/gifts/${id}/backup-size`);
  },

  // Get all gift backup sizes
  getAllGiftBackupSizes: async () => {
    return apiService.get('/gifts/backup-sizes');
  },

  // Clean up old backups
  cleanupOldBackups: async (daysToKeep: number = 30) => {
    return apiService.post(`/gifts/cleanup-backups?daysToKeep=${daysToKeep}`);
  },

  // Get gift backup statistics
  getGiftBackupStats: async () => {
    return apiService.get('/gifts/backup-stats');
  },

  // Export gift backup
  exportGiftBackup: async (id: string, backupId: string) => {
    return apiService.get(`/gifts/${id}/backup/${backupId}/export`, {
      responseType: 'blob',
    });
  },

  // Import gift backup
  importGiftBackup: async (file: File) => {
    const formData = new FormData();
    formData.append('backup', file);
    return apiService.post('/gifts/import-backup', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Validate gift backup
  validateGiftBackup: async (file: File) => {
    const formData = new FormData();
    formData.append('backup', file);
    return apiService.post('/gifts/validate-backup', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get gift backup metadata
  getGiftBackupMetadata: async (file: File) => {
    const formData = new FormData();
    formData.append('backup', file);
    return apiService.post('/gifts/backup-metadata', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Schedule gift backup
  scheduleGiftBackup: async (schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    retentionDays: number;
  }) => {
    return apiService.post('/gifts/schedule-backup', schedule);
  },

  // Get gift backup schedule
  getGiftBackupSchedule: async () => {
    return apiService.get('/gifts/backup-schedule');
  },

  // Update gift backup schedule
  updateGiftBackupSchedule: async (schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    retentionDays: number;
  }) => {
    return apiService.put('/gifts/backup-schedule', schedule);
  },

  // Delete gift backup schedule
  deleteGiftBackupSchedule: async () => {
    return apiService.delete('/gifts/backup-schedule');
  },

  // Test gift backup
  testGiftBackup: async () => {
    return apiService.post('/gifts/test-backup');
  },

  // Get gift backup test results
  getGiftBackupTestResults: async () => {
    return apiService.get('/gifts/backup-test-results');
  },

  // Get gift backup logs
  getGiftBackupLogs: async () => {
    return apiService.get('/gifts/backup-logs');
  },

  // Clear gift backup logs
  clearGiftBackupLogs: async () => {
    return apiService.delete('/gifts/backup-logs');
  },

  // Get gift backup configuration
  getGiftBackupConfig: async () => {
    return apiService.get('/gifts/backup-config');
  },

  // Update gift backup configuration
  updateGiftBackupConfig: async (config: {
    compression: boolean;
    encryption: boolean;
    storageLocation: string;
    maxBackupSize: number;
  }) => {
    return apiService.put('/gifts/backup-config', config);
  },

  // Get gift backup health
  getGiftBackupHealth: async () => {
    return apiService.get('/gifts/backup-health');
  },

  // Repair gift backup
  repairGiftBackup: async (id: string, backupId: string) => {
    return apiService.post(`/gifts/${id}/repair-backup/${backupId}`);
  },

  // Get gift backup repair status
  getGiftBackupRepairStatus: async (id: string, backupId: string) => {
    return apiService.get(`/gifts/${id}/repair-backup/${backupId}/status`);
  },

  // Cancel gift backup repair
  cancelGiftBackupRepair: async (id: string, backupId: string) => {
    return apiService.delete(`/gifts/${id}/repair-backup/${backupId}`);
  },

  // Get gift backup repair logs
  getGiftBackupRepairLogs: async (id: string, backupId: string) => {
    return apiService.get(`/gifts/${id}/repair-backup/${backupId}/logs`);
  },

  // Get gift backup repair history
  getGiftBackupRepairHistory: async (id: string) => {
    return apiService.get(`/gifts/${id}/repair-backup/history`);
  },

  // Get all gift backup repair history
  getAllGiftBackupRepairHistory: async () => {
    return apiService.get('/gifts/repair-backup/history');
  },

  // Get gift backup repair statistics
  getGiftBackupRepairStats: async () => {
    return apiService.get('/gifts/repair-backup/stats');
  },

  // Get gift backup repair recommendations
  getGiftBackupRepairRecommendations: async () => {
    return apiService.get('/gifts/repair-backup/recommendations');
  },

  // Apply gift backup repair recommendations
  applyGiftBackupRepairRecommendations: async (recommendations: string[]) => {
    return apiService.post('/gifts/repair-backup/apply-recommendations', { recommendations });
  },

  // Get gift backup repair schedule
  getGiftBackupRepairSchedule: async () => {
    return apiService.get('/gifts/repair-backup/schedule');
  },

  // Update gift backup repair schedule
  updateGiftBackupRepairSchedule: async (schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    autoRepair: boolean;
  }) => {
    return apiService.put('/gifts/repair-backup/schedule', schedule);
  },

  // Delete gift backup repair schedule
  deleteGiftBackupRepairSchedule: async () => {
    return apiService.delete('/gifts/repair-backup/schedule');
  },

  // Test gift backup repair
  testGiftBackupRepair: async () => {
    return apiService.post('/gifts/repair-backup/test');
  },

  // Get gift backup repair test results
  getGiftBackupRepairTestResults: async () => {
    return apiService.get('/gifts/repair-backup/test-results');
  },

  // Clear gift backup repair logs
  clearGiftBackupRepairLogs: async () => {
    return apiService.delete('/gifts/repair-backup/logs');
  },

  // Get gift backup repair configuration
  getGiftBackupRepairConfig: async () => {
    return apiService.get('/gifts/repair-backup/config');
  },

  // Update gift backup repair configuration
  updateGiftBackupRepairConfig: async (config: {
    autoRepair: boolean;
    repairThreshold: number;
    maxRepairAttempts: number;
    repairTimeout: number;
  }) => {
    return apiService.put('/gifts/repair-backup/config', config);
  },

  // Get gift backup repair health
  getGiftBackupRepairHealth: async () => {
    return apiService.get('/gifts/repair-backup/health');
  },
}; 