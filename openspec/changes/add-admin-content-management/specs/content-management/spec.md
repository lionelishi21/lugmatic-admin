## ADDED Requirements

### Requirement: Admin Song Management with Cover Art Upload
The admin interface SHALL provide song management capabilities including create, read, update, and delete operations. Songs SHALL support cover art image uploads through a file upload interface.

#### Scenario: Admin uploads song with cover art
- **WHEN** an admin navigates to the song management page and creates a new song
- **AND** uploads a cover art image file
- **THEN** the song is created with the cover art attached
- **AND** the cover art is displayed in the song list and detail views

#### Scenario: Admin updates song cover art
- **WHEN** an admin edits an existing song
- **AND** uploads a new cover art image
- **THEN** the song's cover art is updated
- **AND** the new cover art is displayed immediately

### Requirement: Admin Album Management
The admin interface SHALL provide album management capabilities including create, read, update, and delete operations. Albums SHALL be manageable independently and SHALL support associating songs.

#### Scenario: Admin creates new album
- **WHEN** an admin navigates to the album management page and creates a new album
- **THEN** the album is created with the provided metadata
- **AND** the album appears in the admin album list

#### Scenario: Admin associates songs with album
- **WHEN** an admin edits an album
- **AND** selects songs to associate with the album
- **THEN** the songs are linked to the album
- **AND** the album detail view displays all associated songs

### Requirement: Admin Predefined Playlist Management
The admin interface SHALL provide playlist management capabilities for creating and managing predefined/curated playlists. These playlists SHALL be available to users and SHALL be distinguishable from user-created playlists.

#### Scenario: Admin creates predefined playlist
- **WHEN** an admin navigates to the playlist management page and creates a new predefined playlist
- **THEN** the playlist is created with admin designation
- **AND** the playlist is available to all users
- **AND** the playlist appears in the admin playlist list

#### Scenario: Admin curates playlist content
- **WHEN** an admin edits a predefined playlist
- **AND** adds or removes songs
- **THEN** the playlist content is updated
- **AND** users see the updated playlist content

### Requirement: Admin Gift Management with Icon Upload
The admin interface SHALL provide gift management capabilities including create, read, update, and delete operations. Gifts SHALL support icon image uploads through a file upload interface. Gift creation SHALL use the backend endpoint `POST /api/gift/admin/create` with Bearer token authentication and SHALL require the following fields: name, type, value, coinCost, rarity, category, image, isActive, and isSeasonal. The image field SHALL be populated by first uploading an image file to `POST /api/gift/upload-image` endpoint using multipart/form-data with field name "image".

#### Scenario: Admin creates gift with icon upload
- **WHEN** an admin navigates to the gift management page and creates a new gift
- **AND** fills in required fields (name, type, value, coinCost, rarity, category)
- **AND** uploads an icon image file
- **THEN** the image is uploaded to `/api/gift/upload-image` endpoint using multipart/form-data with field name "image"
- **AND** the upload response provides an image URL
- **AND** the gift is created via `POST /api/gift/admin/create` with the image URL included in the request body
- **AND** the request includes Bearer token authentication with admin role
- **AND** the gift appears in the admin gift list

#### Scenario: Admin creates seasonal gift
- **WHEN** an admin creates a new gift
- **AND** marks it as seasonal (isSeasonal: true)
- **AND** provides seasonalStart and seasonalEnd dates
- **THEN** the gift is created with seasonal availability settings
- **AND** the gift is only available during the specified date range

#### Scenario: Admin updates gift
- **WHEN** an admin edits an existing gift
- **AND** modifies gift properties (name, description, value, coinCost, rarity, category, etc.)
- **THEN** the gift is updated via `PUT /api/gift/admin/{id}` endpoint
- **AND** the updated gift information is reflected immediately

