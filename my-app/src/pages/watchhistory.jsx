import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import './watchhistory.css';

// 1) Import Toastify
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Helper to create a slug from a title
function createSlug(title) {
  return title.replace(/\s+/g, '-').toLowerCase();
}

// Helper to check if the JWT token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // exp is in seconds, convert to milliseconds
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

const WatchHistory = () => {
  const [groupedHistory, setGroupedHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Helper to verify token validity and logout if expired
  const verifyToken = () => {
    const token = localStorage.getItem('jwtToken');
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('loggedInUser');
      toast.error('Your session has expired. Please log in again.', {
        position: 'bottom-center',
        autoClose: 3000,
      });
      navigate('/login');
      return false;
    }
    return true;
  };

  // Fetch watch history from JSON‑server for the current logged‑in user
  const fetchWatchHistory = async () => {
    const storedUserStr = localStorage.getItem('loggedInUser');
    let userId = null;
    if (storedUserStr) {
      try {
        const userObj = JSON.parse(storedUserStr);
        userId = userObj.id;
      } catch (err) {
        console.error('Error parsing loggedInUser:', err);
      }
    }
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`http://localhost:3002/watch_history?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        const result = regroupHistory(data);
        setGroupedHistory(result);
      } else {
        console.error('Failed to fetch watch history:', res.status);
      }
    } catch (err) {
      console.error('Error fetching watch history:', err);
    } finally {
      setLoading(false);
    }
  };

  // Group history items by date
  const regroupHistory = (historyArray) => {
    const mapByDate = {};
    historyArray.forEach((entry) => {
      const dateKey = entry.date;
      if (!mapByDate[dateKey]) {
        mapByDate[dateKey] = [];
      }
      mapByDate[dateKey].push(entry);
    });
    return Object.keys(mapByDate).map((date) => ({
      date,
      items: mapByDate[date],
    }));
  };

  // Load watch history on mount
  useEffect(() => {
    fetchWatchHistory();
  }, []);

  // Remove a history entry from JSON‑server and refresh the list
  const removeFromHistory = async (historyId) => {
    // Verify token before deletion
    if (!verifyToken()) return;

    try {
      const deleteRes = await fetch(`http://localhost:3002/watch_history/${historyId}`, {
        method: 'DELETE',
      });
      if (deleteRes.ok) {
        // Re-fetch the watch history
        fetchWatchHistory();
        // Show success toast
        toast.success('History item removed successfully.', {
          position: 'bottom-center',
          autoClose: 3000,
        });
      } else {
        console.error('Failed to delete history entry:', deleteRes.status);
        toast.error('Failed to remove history item.', {
          position: 'bottom-center',
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error('Error deleting history entry:', err);
      toast.error('Error removing history item. Please try again.', {
        position: 'bottom-center',
        autoClose: 3000,
      });
    }
  };

  // Handle clicking the title to navigate to the detail page
  const handleTitleClick = (item) => {
    // Verify token before navigation
    if (!verifyToken()) return;

    const slug = createSlug(item.title);
    if (item.type && item.type.toLowerCase() === 'movie') {
      navigate(`/movies/${slug}`);
    } else {
      navigate(`/tvshows/${slug}`);
    }
  };

  // Utility: get only the first sentence from the plot
  const getFirstSentence = (plot) => {
    if (!plot) return '';
    const idx = plot.indexOf('.');
    return idx === -1 ? plot : plot.slice(0, idx + 1);
  };

  return (
    <div className="watch-history-container">
      {/* 2) ToastContainer for displaying toasts */}
      <ToastContainer />

      <h1 className="watch-history-title">Watch History</h1>
      {loading ? (
        <p>Loading your watch history...</p>
      ) : (
        <>
          {groupedHistory.length === 0 ? (
            <p className="no-history">No watch history found.</p>
          ) : (
            groupedHistory.map((group) => (
              <div key={group.date} className="watch-history-date-group">
                <div className="watch-history-date">{group.date}</div>
                <div className="watch-history-items">
                  {group.items.map((item) => {
                    const displayType = item.type && item.type.toLowerCase() !== 'movie';
                    const shortPlot = getFirstSentence(item.plot);
                    return (
                      <div key={item.id} className="watch-history-item">
                        <button
                          className="remove-history-item-btn"
                          onClick={() => removeFromHistory(item.id)}
                        >
                          <FontAwesomeIcon icon={faTimes} className="remove-icon" />
                        </button>
                        <img
                          src={item.poster}
                          alt={item.title}
                          className="history-item-poster"
                        />
                        <div className="history-item-details">
                          <div className="history-item-header">
                            <span
                              className="history-item-title clickable-title"
                              onClick={() => handleTitleClick(item)}
                            >
                              {item.title}
                            </span>
                            {item.year && (
                              <span className="history-item-year">{item.year}</span>
                            )}
                            {displayType && (
                              <span className="history-item-type">{item.type}</span>
                            )}
                          </div>
                          {item.imdbRating && (
                            <div className="history-item-imdb">
                              <span className="imdb-label">IMDb: </span>
                              <span className="imdb-value">{item.imdbRating}</span>
                            </div>
                          )}
                          {shortPlot && (
                            <p className="history-item-plot">{shortPlot}</p>
                          )}
                          <div className="history-item-credits">
                            {item.director && (
                              <p className="history-item-director">
                                <span className="director-label">Director: </span>
                                <span className="director-value">{item.director}</span>
                              </p>
                            )}
                            {item.actors && (
                              <p className="history-item-stars">
                                <span className="stars-label">Stars: </span>
                                <span className="stars-value">{item.actors}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
};

export default WatchHistory;
