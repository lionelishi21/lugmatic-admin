## ADDED Requirements

### Requirement: Admin Content Management Pages Load Live Data
The admin song, album, and playlist management pages SHALL load data from lugmatic-api endpoints and display loading, empty, and error states appropriately.

#### Scenario: Admin views song management page
- **WHEN** an admin navigates to the song management page
- **THEN** the page requests songs from the API
- **AND** displays a loading state while fetching
- **AND** renders the list of songs when data is available
- **OR** displays an empty state message when no songs exist
- **OR** displays an error message if the request fails

#### Scenario: Admin views album management page
- **WHEN** an admin navigates to the album management page
- **THEN** the page requests albums from the API
- **AND** displays a loading state while fetching
- **AND** renders the list of albums when data is available
- **OR** displays an empty state message when no albums exist
- **OR** displays an error message if the request fails

#### Scenario: Admin views playlist management page
- **WHEN** an admin navigates to the playlist management page
- **THEN** the page requests predefined playlists from the API
- **AND** displays a loading state while fetching
- **AND** renders the list of playlists when data is available
- **OR** displays an empty state message when no playlists exist
- **OR** displays an error message if the request fails

### Requirement: Admin File Upload for Cover Art
The admin interface SHALL provide a file upload component for song cover art that accepts image files, validates file type and size, and displays upload progress.

#### Scenario: Admin uploads cover art image
- **WHEN** an admin selects an image file for song cover art
- **THEN** the file is validated (type and size)
- **AND** upload progress is displayed
- **AND** the image is uploaded to the server
- **AND** a preview of the uploaded image is shown
- **OR** an error message is displayed if upload fails

