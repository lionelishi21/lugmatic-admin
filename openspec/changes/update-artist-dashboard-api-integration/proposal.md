## Why
The admin-facing artist management pages in `lugmatic-artist` still render mocked data and rely on endpoint paths that do not exist in the `lugmatic-api` backend. Admin staff cannot review live artist profiles, albums, or songs pulled from the production API.

## What Changes
- Align the admin `artistService` calls with the backend artist routes (`/artist/list`, `/artist/details/:id`, `/artist/:id/albums`, `/artist/:id/songs`)
- Replace mocked data in the admin artist dashboard/detail views with Redux-backed API calls
- Ensure loading, empty, and error states surface correctly when admin users review artist data that fails to load or returns empty

## Impact
- Affected specs: `artist-experience`
- Affected code: `src/services/artistService.ts`, `src/store/slices/artistSlice.ts`, `src/components/ArtistDetail.tsx`, `src/pages/artist/ArtistDashboard.tsx`, admin routing components that surface these views

