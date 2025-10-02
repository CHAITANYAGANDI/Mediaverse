import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import './PreferredList.css';

// Helper to create a slug from a title for navigation
function createSlug(title) {
  return title.replace(/\s+/g, '-').toLowerCase();
}

// Helper to check if a JWT token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

const ListDetails = () => {
  const navigate = useNavigate();
  const [listData, setListData] = useState([]);
  const [allMedia, setAllMedia] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Get logged-in user info from localStorage
  const storedUser = localStorage.getItem('loggedInUser');
  const loggedInUser = storedUser ? JSON.parse(storedUser) : null;

  // Token verification helper. If token is missing or expired, log out.
  const verifyToken = () => {
    const token = localStorage.getItem('jwtToken');
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('loggedInUser');
      navigate('/login');
      return false;
    }
    return true;
  };

  // Fetch preferred list from JSON‑server for the current user
  useEffect(() => {
    const fetchListData = async () => {
      if (!loggedInUser) {
        console.error('No logged in user.');
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:3002/preferred_list?user_id=${loggedInUser.id}`
        );
        if (response.ok) {
          const data = await response.json();
          setListData(data);
        } else {
          console.error('Failed to fetch preferred list data:', response.status);
        }
      } catch (error) {
        console.error('Error fetching preferred list data:', error);
      }
    };
    fetchListData();
  }, [loggedInUser]);

  // Fetch all media (movies + TV shows) for searching
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const [moviesResp, showsResp] = await Promise.all([
          fetch('http://localhost:3002/movies'),
          fetch('http://localhost:3002/tv_shows')
        ]);
        if (!moviesResp.ok || !showsResp.ok) {
          throw new Error('Failed to fetch media data');
        }
        const moviesData = await moviesResp.json();
        const showsData = await showsResp.json();
        setAllMedia([...moviesData, ...showsData]);
      } catch (error) {
        console.error('Error fetching media:', error);
      }
    };
    fetchMedia();
  }, []);

  // Filter media based on search term
  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const results = allMedia.filter(item =>
      item.Title &&
      item.Title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(results);
    setShowDropdown(results.length > 0);
  }, [searchTerm, allMedia]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Add an item from search to the preferred list (POST to JSON‑server)
  const handleAddItem = async (mediaItem) => {
    if (!verifyToken()) return;
    if (!loggedInUser) {
      alert('You must be logged in to add items to your list.');
      return;
    }

    const newItem = {
      user_id: loggedInUser.id,
      Title: mediaItem.Title,
      Year: mediaItem.Year,
      imdbRating: mediaItem.imdbRating,
      Rated: mediaItem.Rated,
      Poster: mediaItem.Poster,
      Type: mediaItem.Type || 'unknown',
      addedAt: new Date().toISOString()
    };

    // Check if the item is already in the list by matching Title
    const alreadyInList = listData.some(item => item.Title === newItem.Title);
    if (alreadyInList) {
      alert('Item already in the list!');
      return;
    }

    try {
      const response = await fetch('http://localhost:3002/preferred_list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      if (response.ok) {
        const addedItem = await response.json();
        setListData(prev => [...prev, addedItem]);
        console.log('Item added to list:', addedItem.Title);
      } else {
        console.error('Failed to add item:', response.status);
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
    setSearchTerm('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  // Remove an item from the preferred list (DELETE from JSON‑server)
  const handleRemoveItem = async (itemId) => {
    if (!verifyToken()) return;
    try {
      const response = await fetch(`http://localhost:3002/preferred_list/${itemId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setListData(prev => prev.filter(item => item.id !== itemId));
      } else {
        console.error('Failed to remove item:', response.status);
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  // Render each list item
  const renderListItems = () => {
    if (!listData || listData.length === 0) {
      return <p className="no-titles">No Media Found</p>;
    }
    return listData.map((item, index) => (
      <div key={item.id || index} className="list-item-row">
        <button
          className="remove-history-item-btn"
          onClick={() => handleRemoveItem(item.id)}
        >
          <FontAwesomeIcon icon={faTimes} className="remove-icon" />
        </button>
        {item.Poster && (
          <img
            src={item.Poster}
            alt={item.Title}
            className="list-item-poster"
          />
        )}
        <div className="list-item-info">
          <div className="item-title-row">
            <span className="list-item-number">{index + 1}.</span>
            <span
              className="list-item-title clickable-title"
              onClick={() => {
                if (!verifyToken()) return;
                if (item.Type.toLowerCase() === 'movie') {
                  navigate(`/movies/${createSlug(item.Title)}`);
                } else {
                  navigate(`/tvshows/${createSlug(item.Title)}`);
                }
              }}
            >
              {item.Title} {item.Year ? `(${item.Year})` : ''}
            </span>
          </div>
          {item.imdbRating && (
            <span className="list-item-rating">
              IMDb: <strong className="list-item-rating-value">{item.imdbRating}/10</strong>
            </span>
          )}
          {item.Rated && (
            <span className="list-item-rated">
              {item.Rated}
            </span>
          )}
          {item.addedAt && (
            <span className="list-item-added-date">
              Added {new Date(item.addedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className="list-details-container">
      <div className="list-header">
        <h1 className="list-title">Your Preferred List of Movies and TV Shows</h1>
      </div>

      {/* "Add a title" section */}
      <div className="add-title-section">
        <p className="add-title-heading">Add Movie / TV Show to this list</p>
        <input
          type="text"
          className="add-title-input"
          placeholder="Search with Movie / TV Show Title to add"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setShowDropdown(searchResults.length > 0)}
        />
        {showDropdown && searchResults.length > 0 && (
          <div className="search-dropdown">
            {searchResults.slice(0, 8).map((mediaItem) => (
              <div
                key={mediaItem.id || Math.random()}
                className="search-dropdown-item"
                onClick={() => handleAddItem(mediaItem)}
              >
                {mediaItem.Poster && (
                  <img
                    src={mediaItem.Poster}
                    alt={mediaItem.Title}
                    className="search-result-poster"
                  />
                )}
                <span className="search-result-text">
                  {mediaItem.Title} {mediaItem.Year ? `(${mediaItem.Year})` : ""}
                </span>
                <FontAwesomeIcon icon={faPlus} className="add-icon" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Display the items in the preferred list */}
      <div className="list-items-container">
        {renderListItems()}
      </div>
    </div>
  );
};

export default ListDetails;
