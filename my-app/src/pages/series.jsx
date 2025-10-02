import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../HomePage.css';
import UserIcon from '../Icon/UserIcon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

function createSlug(title) {
  return title.replace(/\s+/g, '-').toLowerCase();
}

const SeriesPage = () => {
  const navigate = useNavigate();
  const [tvshows, setTvshows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const tvshowsPerPage = 20;

  useEffect(() => {
    // Fetch TV shows from JSON-Server (assumes it's running on localhost:3002)
    fetch('http://localhost:3002/tv_shows')
      .then(response => response.json())
      .then(data => {
        setTvshows(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching TV shows:", error);
        setLoading(false);
      });
  }, []);

  // Calculate total pages
  const totalPages = Math.ceil(tvshows.length / tvshowsPerPage);

  // Determine which TV shows to display on the current page
  const startIndex = (currentPage - 1) * tvshowsPerPage;
  const endIndex = startIndex + tvshowsPerPage;
  const currentTvShows = tvshows.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handleCardClick = (tvShow) => {
    const slug = createSlug(tvShow.Title);
    // Route to /tvshows/:slug
    navigate(`/tvshows/${slug}`);
  };

  return (
    <div className="home-container">
      {/* Main Content */}
      <main className="main">
        {loading ? (
          <p>Loading TV shows...</p>
        ) : (
          <>
            <div className="card-grid">
              {currentTvShows.map((tvShow) => (
                <div 
                  className="card" 
                  key={tvShow.id} 
                  onClick={() => handleCardClick(tvShow)}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={tvShow.Poster}
                    alt={tvShow.Title}
                    className="card-img"
                  />
                  <div className="card-content">
                    <h3 className="card-title">
                      {tvShow.Title && tvShow.Title.length > 25
                        ? tvShow.Title.substring(0, 25) + '...'
                        : tvShow.Title}
                    </h3>
                    <div className="card-details">
                      {tvShow.Year && <span>{tvShow.Year}</span>}
                      {tvShow.Type === 'movie' ? (
                        <span className="card-type">Movie</span>
                      ) : (
                        <span className="card-type">TV Show</span>
                      )}
                    </div>
                  </div>
                  {/* Overlay for glass effect and "View" text */}
                  <div className="card-overlay">
                    {tvShow.Type === 'movie' ? 'View Movie' : 'View Show'}
                  </div>
                </div>
              ))}
            </div>

            {tvshows.length > tvshowsPerPage && (
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

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 Mediaverse. All rights reserved.</p>
        <p>Discover your favorite movies and TV shows, curated just for you.</p>
      </footer>
    </div>
  );
};

export default SeriesPage;
