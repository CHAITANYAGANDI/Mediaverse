import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './watchlist.css';

// Helper to slugify titles
function createSlug(title) {
  return title.replace(/\s+/g, '-').toLowerCase();
}

const WatchListPage = () => {
  const navigate = useNavigate();
  
  // Local state for watchlist items fetched from JSON‑server
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Helper function to check if the token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      // Split the token to get the payload (assuming JWT format: header.payload.signature)
      const payload = JSON.parse(atob(token.split('.')[1]));
      // 'exp' is in seconds, convert to milliseconds
      if (payload.exp * 1000 < Date.now()) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error decoding token:", error);
      return true;
    }
  };

  // Check if a user is logged in and fetch the watchlist for that user.
  useEffect(() => {
    const storedUserStr = localStorage.getItem('loggedInUser');
    if (!storedUserStr) {
      // Redirect to login if no user is logged in
      navigate('/login');
      return;
    }

    const { id: userId } = JSON.parse(storedUserStr);

    const fetchWatchlist = async () => {
      try {
        // Only fetch watchlist items for the current user
        const response = await fetch(`http://localhost:3002/watch_list?user_id=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setWatchlist(data);
        } else {
          console.error('Failed to fetch watchlist:', response.status);
        }
      } catch (error) {
        console.error('Error fetching watchlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [navigate]);

  // Calculate total pages for pagination
  const totalPages = Math.ceil(watchlist.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = watchlist.slice(startIndex, startIndex + itemsPerPage);

  // Pagination handlers
  const handleFirstPage = () => setCurrentPage(1);
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };
  const handleLastPage = () => setCurrentPage(totalPages);

  // Clicking a card navigates to the detail page after verifying token
  const handleCardClick = (item) => {
    const token = localStorage.getItem('jwtToken');
    if (isTokenExpired(token)) {
      // Token is expired or invalid. Log out user and navigate to login.
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('loggedInUser');
      navigate('/login');
      return;
    }
    const slug = createSlug(item.Title);
    if (item.Type === 'movie') {
      navigate(`/movies/${slug}`);
    } else if (item.Type === 'series') {
      navigate(`/tvshows/${slug}`);
    }
  };

  return (
    <div className="watchlist-container">
      <h1 className="watchlist-heading">My Watch List</h1>
      <p className="watchlist-description">
        Your Watchlist is the place to track the titles you want to watch.
      </p>

      {loading ? (
        <p>Loading your watchlist...</p>
      ) : (
        <>
          {watchlist.length === 0 ? (
            <p className='no-items'>No items in your watchlist.</p>
          ) : (
            <>
              <div className="card-grid">
                {currentItems.map(item => (
                  <div
                    key={item.id}
                    className="card"
                    onClick={() => handleCardClick(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={item.Poster}
                      alt={item.Title}
                      className="card-img"
                    />
                    <div className="card-content">
                      <h3 className="card-title">
                        {item.Title && item.Title.length > 25
                          ? item.Title.substring(0, 25) + '...'
                          : item.Title}
                      </h3>
                      <div className="card-details">
                        {item.Year && <span>{item.Year}</span>}
                        {item.Type === 'movie' && (
                          <span className="card-type">Movie</span>
                        )}
                        {item.Type === 'series' && (
                          <span className="card-type">TV Show</span>
                        )}
                      </div>
                    </div>
                    {/* Overlay for glass effect and view text */}
                    <div className="card-overlay">
                      {item.Type === 'movie' ? 'View Movie' : 'View Show'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {watchlist.length > itemsPerPage && (
                <div className="pagination">
                  <button onClick={handleFirstPage} disabled={currentPage === 1}>
                    &laquo;
                  </button>
                  <button onClick={handlePrevPage} disabled={currentPage === 1}>
                    &lsaquo;
                  </button>
                  <span className="current-page">{currentPage}</span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    &rsaquo;
                  </button>
                  <button
                    onClick={handleLastPage}
                    disabled={currentPage === totalPages}
                  >
                    &raquo;
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default WatchListPage;
