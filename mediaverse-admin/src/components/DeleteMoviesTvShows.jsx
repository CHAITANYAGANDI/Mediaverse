// src/components/DeleteMoviesTvShows.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './DeleteMoviesTvShows.css';

/* Helper to create a slug from a title for optional navigation */
function createSlug(title) {
  return title.replace(/\s+/g, '-').toLowerCase();
}

// Helper: Check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // exp is in seconds; convert to milliseconds
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

// Helper: Verify token and if expired, log out and navigate to login
const verifyToken = (navigate) => {
  const token = localStorage.getItem('jwtToken');
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('loggedInUser');
    toast.error('Session expired. Please log in again.', {
      position: 'bottom-center',
      autoClose: 3000,
      style: { backgroundColor: '#dc3545', color: '#fff' },
    });
    navigate('/login');
    return false;
  }
  return true;
};

const DeleteMoviesTvShows = () => {
  const navigate = useNavigate();
  const [mediaList, setMediaList] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Fetch movies + TV shows from JSON-server
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const [moviesResp, showsResp] = await Promise.all([
          fetch('http://localhost:3002/movies'),
          fetch('http://localhost:3002/tv_shows'),
        ]);
        if (!moviesResp.ok || !showsResp.ok) {
          throw new Error('Failed to fetch media data');
        }
        const moviesData = await moviesResp.json();
        const showsData = await showsResp.json();
        // Merge into one array
        setMediaList([...moviesData, ...showsData]);
      } catch (error) {
        console.error('Error fetching media:', error);
        toast.error('Failed to fetch media data.', {
          position: 'bottom-center',
          autoClose: 3000,
        });
      }
    };
    fetchMedia();
  }, []);

  // When Delete button is clicked, open the confirmation modal
  const handleDeleteClick = (item) => {
    // Verify token before proceeding
    if (!verifyToken(navigate)) return;
    setSelectedItem(item);
    setShowConfirmModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowConfirmModal(false);
    setSelectedItem(null);
  };

  // Confirm deletion: send DELETE request and update state
  const handleConfirmDelete = async () => {
    if (!verifyToken(navigate)) return;
    if (!selectedItem) return;
    try {
      // Determine the correct endpoint based on media type
      const endpoint =
        (selectedItem.Type?.toLowerCase() === 'movie' ||
          selectedItem.media_type?.toLowerCase() === 'movie')
          ? 'http://localhost:3002/movies'
          : 'http://localhost:3002/tv_shows';

      const response = await fetch(`${endpoint}/${selectedItem.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      // Remove the item from local state
      setMediaList((prev) => prev.filter((item) => item.id !== selectedItem.id));
      toast.success('Item deleted successfully!', {
        position: 'bottom-center',
        autoClose: 3000,
      });
      handleCloseModal();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item. Please try again.', {
        position: 'bottom-center',
        autoClose: 3000,
      });
    }
  };

  // Render the list of media items
  const renderMediaItems = () => {
    if (!mediaList || mediaList.length === 0) {
      return <p className="no-titles">No Movies or TV Shows Found</p>;
    }
    return mediaList.map((item, index) => (
      <div key={item.id || index} className="delete-item-row">
        {item.Poster && (
          <img
            src={item.Poster}
            alt={item.Title || item.title}
            className="delete-item-poster"
          />
        )}
        <div className="delete-item-info">
          <div className="delete-item-title-row">
            <span className="delete-item-number">{index + 1}.</span>
            <span
              className="delete-item-title clickable-title"
              onClick={() => {
                // Optionally navigate to detail page
                if (
                  item.Type?.toLowerCase() === 'movie' ||
                  item.media_type?.toLowerCase() === 'movie'
                ) {
                  navigate(`/movies/${createSlug(item.Title || item.title)}`);
                } else {
                  navigate(`/tvshows/${createSlug(item.Title || item.title)}`);
                }
              }}
            >
              {item.Title || item.title} {item.Year ? `(${item.Year || item.year})` : ''}
            </span>
          </div>
          {item.imdbRating && (
            <span className="delete-item-rating">
              IMDb: <strong className="delete-item-rating-value">{item.imdbRating}/10</strong>
            </span>
          )}
          {item.Rated && (
            <span className="delete-item-rated">{item.Rated}</span>
          )}
        </div>
        <div className="delete-button-container">
          <button
            className="delete-item-btn"
            onClick={() => handleDeleteClick(item)}
          >
            Delete
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="delete-list-container">
      <ToastContainer />
      <div className="delete-list-header">
        <h1 className="delete-list-title">Delete Movies and TV Shows</h1>
      </div>
      <div className="delete-items-container">
        {renderMediaItems()}
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmModal && selectedItem && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-content">
            <h2>Confirm Deletion</h2>
            <p>
              Are you sure you want to delete "{selectedItem.Title || selectedItem.title}"?
              This action cannot be undone.
            </p>
            <div className="delete-modal-buttons">
              <button className="confirm-delete-btn" onClick={handleConfirmDelete}>
                Delete
              </button>
              <button className="cancel-delete-btn" onClick={handleCloseModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteMoviesTvShows;
