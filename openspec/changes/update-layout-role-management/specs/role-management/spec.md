## ADDED Requirements
### Requirement: Role and Permission Management UI
The system SHALL provide an administrative interface to manage roles and their associated permissions.

#### Scenario: Admin views roles
- **WHEN** an administrator navigates to the Roles & Permissions section
- **THEN** they see the available roles: `user` (base), `artist`, `contributor`, and `provider`.

#### Scenario: Admin updates permissions
- **WHEN** an administrator toggles or updates the permissions for a specific role
- **THEN** the changes are saved and applied to all users who hold that role.
