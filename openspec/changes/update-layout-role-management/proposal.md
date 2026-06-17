## Why
The application needs a unified role and permission management system. Currently, there's no way to configure or manage the granular permissions for different roles in the system. The platform has a base role of `user`, and users can gain additional access via specific roles (`artist`, `contributor`, `provider`). We need to control the layout access based on these roles, and we need an interface for administrators to view and update the permissions assigned to each role.

## What Changes
- Introduce role definitions: `user` (base), `artist`, `contributor`, `provider`.
- Update `src/components/Layout.tsx` to conditionally render navigation items (e.g. artist gets upload, clashes, shell it; contributor gets their own section; provider gets theirs).
- Add a new "Roles & Permissions" management page in the admin portal (`lugmatic-artist`) where an admin can view and update the permissions associated with each role.

## Impact
- Affected specs: navigation, role-management
- Affected code: `src/components/Layout.tsx`, `src/pages/admin/RoleManagement.tsx` (new)
