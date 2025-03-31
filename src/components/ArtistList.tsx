import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { fetchArtists } from '../store/slices/artistSlice';
import { AppDispatch } from '../store';

const ArtistList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { artists, loading, error } = useSelector((state: RootState) => state.artist);

  useEffect(() => {
    dispatch(fetchArtists());
  }, [dispatch]);

  if (loading) {
    return <div className="loading">Loading artists...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="artist-list">
      <h2>Artists</h2>
      {artists.length === 0 ? (
        <p>No artists found</p>
      ) : (
        <ul>
          {artists.map((artist) => (
            <li key={artist._id} className="artist-item">
              <div className="artist-info">
                <h3>{artist.name}</h3>
                {artist.genres && artist.genres.length > 0 && (
                  <div className="artist-genres">
                    {artist.genres.map((genre, index) => (
                      <span key={index} className="genre-tag">
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
                {artist.bio && <p className="artist-bio">{artist.bio}</p>}
              </div>
              {artist.image && (
                <div className="artist-image">
                  <img src={artist.image} alt={artist.name} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ArtistList; 