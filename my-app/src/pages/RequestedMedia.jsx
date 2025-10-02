// src/components/RequestedMedia.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css';
import './RequestedMedia.css'; // Make sure to import the CSS file

const RequestedMedia = () => {
  const navigate = useNavigate();
  const [requestedMediaList, setRequestedMediaList] = useState([]);

  // Helper to create a slug from a title
  const createSlug = (title) => title.replace(/\s+/g, '-').toLowerCase();

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

  // Withdraw media request: remove the record from JSON‑server and update the state
  const handleWithdraw = async (mediaId) => {
    try {
      const response = await fetch(`http://localhost:3002/user_requested_media/${mediaId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      // Remove the record from the state
      setRequestedMediaList((prev) =>
        prev.filter((media) => media.id !== mediaId)
      );
      toast.success("Media request withdrawn successfully!", {
        position: "bottom-center",
        autoClose: 3000,
        style: { backgroundColor: "#4BB543", color: "#fff" },
      });
    } catch (error) {
      console.error('Error withdrawing media request:', error);
      toast.error("Failed to withdraw media request. Please try again.", {
        position: "bottom-center",
        autoClose: 3000,
        style: { backgroundColor: "#dc3545", color: "#fff" },
      });
    }
  };

  // Determine status text and CSS class based on request_status
  const getStatusDisplay = (status) => {
    let statusText = '';
    let statusClass = '';
    if (status.toLowerCase() === 'pending') {
      statusText = 'Waiting for Admin Approval';
      statusClass = 'waiting-approval';
    } else if (status.toLowerCase() === 'approved') {
      statusText = 'Approved';
      statusClass = 'approved';
    } else if (status.toLowerCase() === 'declined') {
      statusText = 'Declined';
      statusClass = 'declined';
    } else {
      statusText = status;
    }
    return { statusText, statusClass };
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
            const { statusText, statusClass } = getStatusDisplay(media.request_status);
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

                  {/* Bottom row: date + Withdraw button */}
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
                      <button
                        className="withdraw-btn"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent navigateToDetails
                          handleWithdraw(media.id);
                        }}
                      >
                        Withdraw
                      </button>
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
