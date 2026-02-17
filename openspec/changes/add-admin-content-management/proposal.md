## Why
Admin users need comprehensive content management capabilities to manage songs, albums, and playlists. Currently, the admin interface lacks the ability to upload song cover art, manage albums, and create predefined playlists that can be curated for users.

## What Changes
- Add admin song management with cover art upload functionality
- Add admin album management (create, edit, delete albums)
- Add admin playlist management with predefined/curated playlist creation
- Integrate file upload for song cover art images
- Connect all admin content management features to lugmatic-api endpoints

## Impact
- Affected specs: `content-management`, `admin-experience`
- Affected code: 
  - `src/pages/admin/SongManagement.tsx`
  - `src/pages/admin/AlbumManagement.tsx`
  - `src/services/songService.ts`
  - `src/services/albumService.ts`
  - `src/services/playlistService.ts`
  - `src/middleware/upload.ts` (if needed for cover art)

