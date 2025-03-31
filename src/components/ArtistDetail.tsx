import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import { 
  fetchArtistById, 
  fetchArtistAlbums, 
  fetchArtistSongs,
  clearCurrentArtist,
  clearArtistData
} from '../store/slices/artistSlice';

const ArtistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentArtist, albums, songs, loading, error } = useSelector(
    (state: RootState) => state.artist
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchArtistById(id));
      dispatch(fetchArtistAlbums(id));
      dispatch(fetchArtistSongs(id));
    }

    return () => {
      dispatch(clearCurrentArtist());
      dispatch(clearArtistData());
    };
  }, [dispatch, id]);

  if (loading) {
    return <div className="loading">Loading artist details...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!currentArtist) {
    return <div className="not-found">Artist not found</div>;
  }

  return (
    <div className="artist-detail">
      <div className="artist-header">
        {currentArtist.image && (
          <div className="artist-image">
            <img src={currentArtist.image} alt={currentArtist.name} />
          </div>
        )}
        <div className="artist-info">
          <h1>{currentArtist.name}</h1>
          {currentArtist.genres && currentArtist.genres.length > 0 && (
            <div className="artist-genres">
              {currentArtist.genres.map((genre, index) => (
                <span key={index} className="genre-tag">
                  {genre}
                </span>
              ))}
            </div>
          )}
          {currentArtist.bio && <p className="artist-bio">{currentArtist.bio}</p>}
          
          {currentArtist.socialLinks && (
            <div className="social-links">
              {currentArtist.socialLinks.website && (
                <a href={currentArtist.socialLinks.website} target="_blank" rel="noopener noreferrer">
                  Website
                </a>
              )}
              {currentArtist.socialLinks.instagram && (
                <a href={currentArtist.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              )}
              {currentArtist.socialLinks.twitter && (
                <a href={currentArtist.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                  Twitter
                </a>
              )}
              {currentArtist.socialLinks.facebook && (
                <a href={currentArtist.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="artist-content">
        <div className="artist-albums">
          <h2>Albums</h2>
          {albums.length === 0 ? (
            <p>No albums found</p>
          ) : (
            <div className="album-grid">
              {albums.map((album) => (
                <div key={album._id} className="album-card">
                  {album.cover && (
                    <div className="album-cover">
                      <img src={album.cover} alt={album.title} />
                    </div>
                  )}
                  <div className="album-info">
                    <h3>{album.title}</h3>
                    <p className="release-date">Released: {new Date(album.releaseDate).toLocaleDateString()}</p>
                    <p className="tracks-count">{album.tracks.length} tracks</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="artist-songs">
          <h2>Songs</h2>
          {songs.length === 0 ? (
            <p>No songs found</p>
          ) : (
            <ul className="song-list">
              {songs.map((song) => (
                <li key={song._id} className="song-item">
                  {song.coverArt && (
                    <div className="song-cover">
                      <img src={song.coverArt} alt={song.title} />
                    </div>
                  )}
                  <div className="song-info">
                    <h3>{song.title}</h3>
                    <p className="duration">{Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistDetail; 