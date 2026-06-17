## MODIFIED Requirements
### Requirement: Role-Based Navigation
The application SHALL restrict navigation visibility in the Layout based on the user's role.

#### Scenario: Admin views navigation
- **WHEN** the user has an `admin` or `super admin` role
- **THEN** the layout shows the admin navigation items, including the "Roles & Permissions" section.

#### Scenario: Artist views navigation
- **WHEN** the user has an `artist` role
- **THEN** the layout shows artist navigation items such as their songs, upload songs for approval, clashes, shell it, etc.

#### Scenario: Contributor and Provider view navigation
- **WHEN** the user has a `contributor` or `provider` role
- **THEN** the layout shows their respective navigation items related to their specific capabilities.
