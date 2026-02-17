## 1. Implementation
- [x] 1.1 Update the admin `artistService` methods to call the lugmatic-api artist routes and normalize responses
- [x] 1.2 Wire the admin artist dashboard/detail views to the Redux slice so they render live API data instead of mock content
- [x] 1.3 Ensure Redux loading, empty, and error states drive the UI skeleton, empty placeholders, and error messaging across admin pages
- [x] 1.4 Validate admin routing (list/detail) against an actual `lugmatic-api` instance and adjust types if the payload shape differs

## 2. Validation
- [ ] 2.1 Manually verify admin success, empty, and failure scenarios against the running backend
- [ ] 2.2 Capture console or UI evidence that each artist endpoint (`list`, `details`, `albums`, `songs`) is exercised from the admin frontend

