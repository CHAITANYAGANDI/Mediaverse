// src/components/EditMoviesTvShows.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './EditMoviesTvShows.css';

/* Helper to create a slug from a title (optional) */
function createSlug(title) {
  return title.replace(/\s+/g, '-').toLowerCase();
}

/* Helper function: Check if token is expired */
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

/* Helper function: Verify token; if missing/expired, log out and redirect */
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

const EditMoviesTvShows = () => {
  const navigate = useNavigate();
  const [mediaList, setMediaList] = useState([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

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
        // Merge them into one array
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

  // Handler for any button click that should force a token check
  const handleActionWithTokenCheck = (actionCallback) => {
    if (verifyToken(navigate)) {
      actionCallback();
    }
  };

  // Open the edit modal for the selected item
  const handleEditClick = (item) => {
    handleActionWithTokenCheck(() => {
      setEditingItem(item);
      setShowEditForm(true);
    });
  };

  // Close the modal
  const handleCloseModal = () => {
    handleActionWithTokenCheck(() => {
      setShowEditForm(false);
      setEditingItem(null);
    });
  };

  // Handle changes to the form fields in the modal
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Use bracket notation to update editingItem
    setEditingItem((prev) => ({ ...prev, [name]: value }));
  };

  // Submit the updated item with token verification
  const handleUpdate = async (e) => {
    e.preventDefault();

    handleActionWithTokenCheck(async () => {
      if (!editingItem) return;
      try {
        // Choose endpoint based on media type.
        const endpoint =
          (editingItem.media_type || editingItem.Type || '').toLowerCase() === 'movie'
            ? 'http://localhost:3002/movies'
            : 'http://localhost:3002/tv_shows';

        const res = await fetch(`${endpoint}/${editingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingItem),
        });
        if (!res.ok) {
          throw new Error(`Server returned ${res.status}`);
        }
        toast.success('Updated successfully!', {
          position: 'bottom-center',
          autoClose: 3000,
        });
        // Update local list (optional)
        setMediaList((prev) =>
          prev.map((m) => (m.id === editingItem.id ? editingItem : m))
        );
        setShowEditForm(false);
        setEditingItem(null);
      } catch (error) {
        console.error('Error updating media:', error);
        toast.error('Failed to update. Please try again.', {
          position: 'bottom-center',
          autoClose: 3000,
        });
      }
    });
  };

  // Render each media item in a list
  const renderMediaItems = () => {
    if (!mediaList || mediaList.length === 0) {
      return <p className="no-titles">No Movies or TV Shows Found</p>;
    }
    return mediaList.map((item, index) => (
      <div key={item.id || index} className="edit-item-row">
        {item.Poster && (
          <img
            src={item.Poster}
            alt={item.title || item.Title}
            className="edit-item-poster"
          />
        )}
        <div className="edit-item-info">
          <div className="edit-item-title-row">
            <span className="edit-item-number">{index + 1}.</span>
            <span
              className="edit-item-title clickable-title"
              onClick={() => {
                handleActionWithTokenCheck(() => {
                  if ((item.media_type || item.Type || '').toLowerCase() === 'movie') {
                    navigate(`/movies/${createSlug(item.title || item.Title)}`);
                  } else {
                    navigate(`/tvshows/${createSlug(item.title || item.Title)}`);
                  }
                });
              }}
            >
              {item.title || item.Title} {item.year || item.Year ? `(${item.year || item.Year})` : ''}
            </span>
          </div>
          {item.imdbRating && (
            <span className="edit-item-rating">
              IMDb: <strong className="edit-item-rating-value">{item.imdbRating}/10</strong>
            </span>
          )}
          {item.Rated && (
            <span className="edit-item-rated">{item.Rated}</span>
          )}
        </div>
        <div className="edit-button-container">
          <button
            className="edit-item-btn"
            onClick={() => handleEditClick(item)}
          >
            Edit
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="edit-list-container">
      <ToastContainer />
      <div className="edit-list-header">
        <h1 className="edit-list-title">Edit Movies and TV Shows</h1>
      </div>
      <div className="edit-items-container">{renderMediaItems()}</div>

      {/* Edit Modal */}
      {showEditForm && editingItem && (
        <div className="edit-modal-overlay">
          <div className="edit-modal-content">
            <h2>Edit: {editingItem.title || editingItem.Title}</h2>
            <form onSubmit={handleUpdate} className="edit-modal-form">
              <div className="form-group">
                <label>Type of Media</label>
                <select
                  name="media_type"
                  value={editingItem.media_type || editingItem.Type || ''}
                  onChange={handleChange}
                >
                  <option value="movie">Movie</option>
                  <option value="tvshow">TV Show</option>
                </select>
              </div>

              <div className="form-group">
                <label>Title</label>
                <input
                  name="title"
                  type="text"
                  value={editingItem.title || editingItem.Title || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Year</label>
                <input
                  name="year"
                  type="text"
                  value={editingItem.year || editingItem.Year || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Rating</label>
                <input
                  name="Rated"
                  type="text"
                  value={editingItem.Rated || editingItem.rated || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Release Date</label>
                <input
                  name="Released"
                  type="text"
                  value={editingItem.Released || editingItem.releaseDate || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Runtime</label>
                <input
                  name="Runtime"
                  type="text"
                  value={editingItem.Runtime || editingItem.runtime || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Genre</label>
                <input
                  name="Genre"
                  type="text"
                  value={editingItem.Genre || editingItem.genre || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Director</label>
                <input
                  name="Director"
                  type="text"
                  value={editingItem.Director || editingItem.director || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Writer</label>
                <input
                  name="Writer"
                  type="text"
                  value={editingItem.Writer || editingItem.writer || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Actors (comma separated)</label>
                <input
                  name="Actors"
                  type="text"
                  value={editingItem.Actors || editingItem.actors || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Plot</label>
                <textarea
                  name="Plot"
                  rows="3"
                  value={editingItem.Plot || editingItem.plot || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Language</label>
                <input
                  name="Language"
                  type="text"
                  value={editingItem.Language || editingItem.language || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Country</label>
                <input
                  name="Country"
                  type="text"
                  value={editingItem.Country || editingItem.country || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Poster URL</label>
                <input
                  name="Poster"
                  type="text"
                  value={editingItem.Poster || editingItem.poster || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>IMDb Rating</label>
                <input
                  name="imdbRating"
                  type="text"
                  value={editingItem.imdbRating || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="edit-modal-buttons">
                <button type="submit" className="save-edit-btn">Update</button>
                <button type="button" className="cancel-edit-btn" onClick={handleCloseModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default EditMoviesTvShows;
