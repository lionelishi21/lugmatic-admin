## Why
The admin dashboard currently contains several hardcoded or placeholder modules (Notifications, Analytics, Promotions, Reports, Settings) that need functional restoration and backend integration for the upcoming launch.

## What Changes
- Implement Admin Broadcast Notifications
- Implement real-time Analytics data fetching
- Implement Promotions CRUD
- Implement persistent System Settings
- Implement dynamic Reports data retrieval
- Stabilize Content Moderation connectivity

## Impact
- Affected specs: admin-experience, notification-system, analytics-system
- Affected code: src/pages/admin/*, src/services/adminService.ts, lugmatic-api controllers/routes