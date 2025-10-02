import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../HomePage.css';
import UserIcon from '../Icon/UserIcon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

function createSlug(title) {
  return title.replace(/\s+/g, '-').toLowerCase();
}

const MoviesPage = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 20;

  useEffect(() => {
    // Fetch movies from JSON-Server (assumes it's running on localhost:3002)
    fetch('http://localhost:3002/movies')
      .then(response => response.json())
      .then(data => {
        setMovies(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching movies:", error);
        setLoading(false);
      });
  }, []);

  // Calculate total pages
  const totalPages = Math.ceil(movies.length / moviesPerPage);

  // Determine which movies to display on the current page
  const startIndex = (currentPage - 1) * moviesPerPage;
  const endIndex = startIndex + moviesPerPage;
  const currentMovies = movies.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handleCardClick = (movie) => {
    const slug = createSlug(movie.Title);
    // Determine movie type using either 'Type' or 'media_type'
    const movieType = movie.Type || movie.media_type;
    // Navigate to the appropriate detail route
    if (movieType === 'movie') {
      navigate(`/movies/${slug}`);
    } else {
      navigate(`/tvshows/${slug}`);
    }
  };

  return (
    <div className="home-container">
      <main className="main">
        {loading ? (
          <p>Loading movies...</p>
        ) : (
          <>
            <div className="card-grid">
              {currentMovies.map((movie) => {
                // Determine movie type using either 'Type' or 'media_type'
                const movieType = movie.Type || movie.media_type;
                return (
                  <div
                    className="card"
                    key={movie.id}
                    onClick={() => handleCardClick(movie)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={movie.Poster}
                      alt={movie.Title}
                      className="card-img"
                    />
                    <div className="card-content">
                      <h3 className="card-title">
                        {movie.Title && movie.Title.length > 25
                          ? movie.Title.substring(0, 25) + '...'
                          : movie.Title}
                      </h3>
                      <div className="card-details">
                        {movie.Year && <span>{movie.Year}</span>}
                        {movieType === 'movie' ? (
                          <span className="card-type">Movie</span>
                        ) : (
                          <span className="card-type">TV Show</span>
                        )}
                      </div>
                    </div>
                    <div className="card-overlay">
                      {movieType === 'movie' ? 'View Movie' : 'View Show'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {movies.length > moviesPerPage && (
              <div className="pagination">
                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                  &laquo;
                </button>
                <button onClick={handlePrevPage} disabled={currentPage === 1}>
                  &lsaquo;
                </button>
                <span className="current-page">{currentPage}</span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                  &rsaquo;
                </button>
                <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                  &raquo;
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="footer">
        <p>© 2025 Mediaverse. All rights reserved.</p>
        <p>Discover your favorite movies and TV shows, curated just for you.</p>
      </footer>
    </div>
  );
};

export default MoviesPage;
