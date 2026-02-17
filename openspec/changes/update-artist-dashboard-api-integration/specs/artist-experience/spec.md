## ADDED Requirements
### Requirement: Admin Artist Dashboard Loads Profile From API
The admin `ArtistDetail` route SHALL request the artist profile from `GET /artist/details/:id` when navigated to with a valid `id` parameter, rendering the returned name, bio, genres, image, and social links for review.

#### Scenario: Profile loads successfully
- **GIVEN** an admin navigates to `ArtistDetail` with route param `id="123"`
- **WHEN** `GET /artist/details/123` responds `200 OK` with an artist payload
- **THEN** the view SHALL render the artist's name, bio, primary image, and genre pills from the payload
- **AND** any social links provided SHALL render as external anchors opening in a new tab

#### Scenario: Artist not found
- **GIVEN** `ArtistDetail` mounts with route param `id="missing"`
- **WHEN** `GET /artist/details/missing` responds `404 Not Found`
- **THEN** the view SHALL render the configured "Artist not found" state
- **AND** no profile data from prior artists SHALL remain visible

### Requirement: Admin Artist Dashboard Loads Discography From API
The admin `ArtistDetail` route SHALL request `GET /artist/:id/albums` and `GET /artist/:id/songs` and render the returned album and song collections with empty-state handling for administrators.

#### Scenario: Albums returned
- **GIVEN** the admin `ArtistDetail` view mounts with route param `id="123"`
- **WHEN** `GET /artist/123/albums` responds `200 OK` with one or more albums
- **THEN** the UI SHALL render album cards showing title, cover art, release date, and track count

#### Scenario: Songs returned
- **GIVEN** `ArtistDetail` mounts with route param `id="123"`
- **WHEN** `GET /artist/123/songs` responds `200 OK` with one or more songs
- **THEN** the UI SHALL render song rows including title, cover art when available, and formatted duration

#### Scenario: No discography data
- **GIVEN** the albums or songs request returns an empty array
- **WHEN** the response is processed
- **THEN** the UI SHALL render the "No albums found" or "No songs found" placeholder copy without throwing errors

### Requirement: Admin Artist Dashboard Handles Loading And Errors
The admin artist Redux slice and UI SHALL surface loading and failure states for profile and discography requests.

#### Scenario: Fetch in progress
- **WHEN** any admin artist profile, album, or song request is pending
- **THEN** `artistSlice.loading` SHALL be `true`
- **AND** the UI SHALL display a loading indicator instead of stale data

#### Scenario: Upstream failure
- **WHEN** an admin artist API call returns an HTTP status `>= 400`
- **THEN** `artistSlice.error` SHALL capture the failure message
- **AND** the UI SHALL render an error state exposing that message to the artist

### Requirement: Admin Artist Service Targets Lugmatic API Routes
The admin `artistService` SHALL call the lugmatic-api artist endpoints and unwrap payloads into domain models expected by the Redux slice.

#### Scenario: Fetch artists list
- **WHEN** `artistService.getAllArtists()` executes
- **THEN** it SHALL issue `GET /artist/list`
- **AND** resolve to an array of artists

#### Scenario: Fetch artist by id
- **WHEN** `artistService.getArtistById('123')` executes
- **THEN** it SHALL issue `GET /artist/details/123`
- **AND** return the parsed artist object to the caller

