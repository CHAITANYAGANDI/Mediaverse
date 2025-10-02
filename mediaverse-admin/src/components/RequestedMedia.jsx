// src/components/RequestedMedia.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css';
import './RequestedMedia.css';

// Helper to create a slug from a title
const createSlug = (title) => title.replace(/\s+/g, '-').toLowerCase();

// Helper to check if a token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Convert exp (seconds) to milliseconds and compare to current time
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

const RequestedMedia = () => {
  const navigate = useNavigate();
  const [requestedMediaList, setRequestedMediaList] = useState([]);

  // Fetch all requested media from JSON‑server
  useEffect(() => {
    const fetchRequestedMedia = async () => {
      try {
        const response = await fetch('http://localhost:3002/user_requested_media');
        if (response.ok) {
          const data = await response.json();
          setRequestedMediaList(data);
        } else {
          console.error('Failed to fetch requested media:', response.status);
        }
      } catch (error) {
        console.error('Error fetching requested media:', error);
      }
    };

    fetchRequestedMedia();
  }, [navigate]);

  // Navigate to details page (movie or tvshow) based on media_type
  const navigateToDetails = (media) => {
    if (media.media_type === 'movie') {
      navigate(`/movies/${createSlug(media.title)}`);
    } else {
      navigate(`/tvshows/${createSlug(media.title)}`);
    }
  };

  // Update request_status (pending -> approved or pending -> declined)
  // And if approved, add the media to movies or tv_shows
  const handleStatusChange = async (mediaId, newStatus) => {
    // Verify token before proceeding
    const token = localStorage.getItem('jwtToken');
    if (!token || isTokenExpired(token)) {
      toast.error("Session expired. Please log in again.", {
        position: "bottom-center",
        autoClose: 3000,
        style: { backgroundColor: "#dc3545", color: "#fff" },
      });
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('loggedInUser');
      navigate('/login');
      return;
    }

    try {
      // PATCH the request_status in user_requested_media
      const response = await fetch(`http://localhost:3002/user_requested_media/${mediaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_status: newStatus }),
      });
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      // Update the local state
      setRequestedMediaList((prev) =>
        prev.map((item) =>
          item.id === mediaId ? { ...item, request_status: newStatus } : item
        )
      );

      // If approved, add the media record to movies or tv_shows
      if (newStatus.toLowerCase() === 'approved') {
        // Find the media object
        const media = requestedMediaList.find((item) => item.id === mediaId);
        if (media) {
          const approvedMedia = {
            user_id: media.user_id,
            media_type: media.media_type,
            Title: media.title || media.Title,
            Year: media.year || media.Year,
            Rated: media.Rated || media.rated,
            Released: media.Released || media.releaseDate,
            Runtime: media.Runtime || media.runtime,
            Genre: media.Genre || media.genre,
            Director: media.Director || media.director,
            Writer: media.Writer || media.writer,
            Actors: media.Actors || media.actors,
            Plot: media.Plot || media.plot,
            Language: media.Language || media.language,
            Country: media.Country || media.country,
            Poster: media.Poster || media.poster,
            imdbRating: media.imdbRating,
            createdAt: new Date().toISOString()
          };

          const endpoint =
            media.media_type.toLowerCase() === 'movie'
              ? 'http://localhost:3002/movies'
              : 'http://localhost:3002/tv_shows';

          const postResponse = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(approvedMedia),
          });
          if (!postResponse.ok) {
            throw new Error(`Failed to post approved media. Server returned ${postResponse.status}`);
          }
        }
      }

      toast.success(`Media request ${newStatus}!`, {
        position: "bottom-center",
        autoClose: 3000,
        style: { backgroundColor: "#4BB543", color: "#fff" },
      });
    } catch (error) {
      console.error('Error updating media request:', error);
      toast.error("Failed to update media request. Please try again.", {
        position: "bottom-center",
        autoClose: 3000,
        style: { backgroundColor: "#dc3545", color: "#fff" },
      });
    }
  };

  return (
    <div className="requested-media-container">
      <h1 className="requested-media-title">Requested Media</h1>
      {requestedMediaList.length === 0 ? (
        <p className="no-media">No media requested yet.</p>
      ) : (
        <div className="requested-media-list">
          {requestedMediaList.map((media) => {
            const isPending = media.request_status.toLowerCase() === 'pending';

            // Set status text and class
            let statusText = 'Waiting for Approval';
            let statusClass = 'waiting-approval';
            if (media.request_status.toLowerCase() === 'approved') {
              statusText = 'Approved';
              statusClass = 'approved';
            } else if (media.request_status.toLowerCase() === 'declined') {
              statusText = 'Declined';
              statusClass = 'declined';
            }

            return (
              <div key={media.id} className="requested-media-item">
                {/* Poster on the left */}
                <div className="poster-container">
                  <img
                    src={media.Poster}
                    alt={media.title}
                    className="media-poster"
                    onClick={() => navigateToDetails(media)}
                  />
                </div>

                {/* Main info on the right */}
                <div className="info-container" onClick={() => navigateToDetails(media)}>
                  <div className="top-row">
                    <span className="media-title">
                      {media.title} {media.year ? `(${media.year})` : ''}
                    </span>
                    {media.imdbRating && (
                      <span className="media-imdb">IMDb: {media.imdbRating}/10</span>
                    )}
                    {media.Rating && (
                      <span className="media-rated">{media.Rating}</span>
                    )}
                  </div>

                  {/* Request status row */}
                  <div className="middle-row">
                    <p className={`media-status ${statusClass}`}>
                      {statusText}
                    </p>
                  </div>

                  {/* Bottom row: date + Approve/Reject buttons */}
                  <div className="bottom-row">
                    <span className="requested-date">
                      Requested on{' '}
                      {media.createdAt
                        ? new Date(media.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'N/A'}
                    </span>
                    {isPending && (
                      <div className="admin-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="approve-btn"
                          onClick={() => handleStatusChange(media.id, 'approved')}
                        >
                          Approve
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => handleStatusChange(media.id, 'declined')}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <ToastContainer closeOnClick pauseOnHover />
    </div>
  );
};

export default RequestedMedia;
