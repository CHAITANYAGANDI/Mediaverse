// src/pages/ReviewModeration.jsx
import React, { useEffect, useState } from 'react';
import { Filter } from 'bad-words'; // Use named export from bad-words
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ReviewModeration.css';

const filter = new Filter(); // Create an instance of the bad-words filter

// Helper function to check if the token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // The token expiration time (exp) is in seconds, so convert to milliseconds.
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

// Helper function to verify token; if expired, log out and redirect to login
const verifyToken = (navigate) => {
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
    return false;
  }
  return true;
};

const ReviewModeration = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [moviesMap, setMoviesMap] = useState({}); // For quick lookup of movie/TV details
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1) Fetch all user ratings (reviews)
        const ratingsResp = await fetch('http://localhost:3002/user_ratings');
        if (!ratingsResp.ok) {
          throw new Error(`Failed to fetch user_ratings: ${ratingsResp.status}`);
        }
        const ratingsData = await ratingsResp.json();

        // 2) Fetch all movies + tv shows
        const [moviesResp, showsResp] = await Promise.all([
          fetch('http://localhost:3002/movies'),
          fetch('http://localhost:3002/tv_shows'),
        ]);
        if (!moviesResp.ok || !showsResp.ok) {
          throw new Error('Failed to fetch movies or tv_shows');
        }
        const moviesData = await moviesResp.json();
        const showsData = await showsResp.json();

        // Build a map for quick lookup by "movieId" or "id"
        const map = {};
        [...moviesData, ...showsData].forEach((item) => {
          map[item.id] = item;
        });
        setMoviesMap(map);

        // 3) Save the reviews
        setReviews(ratingsData);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle delete of a profane review with token verification
  const handleDeleteReview = async (reviewId) => {
    if (!verifyToken(navigate)) return;
    try {
      const resp = await fetch(`http://localhost:3002/user_ratings/${reviewId}`, {
        method: 'DELETE',
      });
      if (!resp.ok) {
        throw new Error(`Server returned ${resp.status}`);
      }
      // Remove from local state
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err) {
      console.error('Error deleting review:', err);
      alert('Failed to delete review. Check console for details.');
    }
  };

  // Merge each review with the corresponding movie/TV data, and check for profanity
  const mergedReviews = reviews.map((rev) => {
    const item = moviesMap[rev.movieId] || {};
    const text = rev.text || '';
    const isProfane = filter.isProfane(text);

    return {
      ...rev,
      isProfane,
      Poster: item.Poster || '',
      Title: item.Title || 'Unknown',
      Year: item.Year || '',
      imdbRating: item.imdbRating || '',
      Rated: item.Rated || '',
      Type: item.Type || item.media_type || '',
    };
  });

  // Only display reviews that contain profanity
  const profaneReviews = mergedReviews.filter((r) => r.isProfane);

  if (loading) {
    return <div className="review-moderation-container">Loading reviews...</div>;
  }

  return (
    <div className="review-moderation-container">
      <h1 className="review-moderation-title">Review Moderation</h1>
      <h2 className="section-heading">Profane Reviews</h2>
      {profaneReviews.length === 0 ? (
        <p className="no-reviews">No profane reviews found.</p>
      ) : (
        <div className="reviews-list">
          {profaneReviews.map((rev) => (
            <div key={rev.id} className="review-item profane">
              <div className="poster-container">
                <img src={rev.Poster} alt={rev.Title} className="review-poster" />
              </div>
              <div className="review-info">
                <div className="top-row">
                  <span className="review-title">
                    {rev.Title} {rev.Year ? `(${rev.Year})` : ''}
                  </span>
                  {rev.imdbRating && (
                    <span className="review-imdb">IMDb: {rev.imdbRating}/10</span>
                  )}
                  {rev.Rated && (
                    <span className="review-rated">{rev.Rated}</span>
                  )}
                </div>
                <div className="middle-row">
                  <p className="review-text">{rev.text}</p>
                </div>
                <div className="bottom-row">
                  <span className="review-date">
                    Reviewed on {rev.date ? rev.date : 'N/A'}
                  </span>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteReview(rev.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <ToastContainer closeOnClick pauseOnHover />
    </div>
  );
};

export default ReviewModeration;
