// src/components/MediaDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCheck } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css';          // Import default styles
import '../MovieDetail.css';
import Comments from '../components/comments';

const createSlug = (title) => title.replace(/\s+/g, '-').toLowerCase();

const MediaDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentsData, setCommentsData] = useState([]);
  const [previousCommentsLength, setPreviousCommentsLength] = useState(0);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  // Flag to ensure watch history is only added once per item load.
  const [historyAdded, setHistoryAdded] = useState(false);
  // State for uploader details (for user-added items)
  const [uploader, setUploader] = useState('');
  const [uploadedDate, setUploadedDate] = useState('');

  // Determine if user is logged in
  const isLoggedIn = !!localStorage.getItem('loggedInUser');

  // Function to toggle watchlist status
  const handleToggleWatchlist = async () => {
    if (!item) return;
    const storedUserStr = localStorage.getItem('loggedInUser');
    if (!storedUserStr) {
      navigate('/login');
      return;
    }
    let userId;
    try {
      const userObj = JSON.parse(storedUserStr);
      userId = userObj.id;
    } catch (error) {
      console.error("Error parsing loggedInUser:", error);
      return;
    }
    try {
      const res = await fetch(`http://localhost:3002/watch_list?user_id=${userId}&media_id=${item.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          // Already in watchlist; remove it
          const watchlistEntry = data[0];
          const deleteRes = await fetch(`http://localhost:3002/watch_list/${watchlistEntry.id}`, {
            method: 'DELETE'
          });
          if (deleteRes.ok) {
            setIsInWatchlist(false);
            toast.success("Removed from watchlist!", {
              position: "bottom-center",
              autoClose: 3000,
            });
          } else {
            throw new Error(`Failed to remove from watchlist: ${deleteRes.status}`);
          }
        } else {
          // Not in watchlist; add it
          const newWatchlistItem = {
            user_id: userId,
            media_id: item.id,
            Poster: item.Poster,
            Title: item.Title,
            Year: item.Year,
            Type: item.Type || item.media_type,
            createdAt: new Date().toISOString()
          };
          const postRes = await fetch('http://localhost:3002/watch_list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newWatchlistItem)
          });
          if (postRes.ok) {
            setIsInWatchlist(true);
            toast.success("Added to watchlist!", {
              position: "bottom-center",
              autoClose: 3000,
            });
          } else {
            throw new Error(`Failed to add to watchlist: ${postRes.status}`);
          }
        }
      }
    } catch (error) {
      console.error("Error toggling watchlist:", error);
      toast.error("Error toggling watchlist. Please try again.", {
        position: "bottom-center",
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        const [moviesResp, showsResp] = await Promise.all([
          fetch('http://localhost:3002/movies'),
          fetch('http://localhost:3002/tv_shows')
        ]);
        const moviesData = await moviesResp.json();
        const showsData = await showsResp.json();
        const combinedData = [...moviesData, ...showsData];
        const found = combinedData.find((itm) => createSlug(itm.Title) === slug);
        setItem(found || null);
      } catch (error) {
        console.error('Error fetching detail:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [slug]);

  useEffect(() => {
    if (item && !historyAdded) {
      addToWatchHistory(item);
      checkWatchlistStatus();
      // Only fetch uploader info if item was NOT added by admin
      if (!item.addedBy || item.addedBy.toLowerCase() !== 'admin') {
        fetchUploaderInfo(item);
      }
      setHistoryAdded(true);
    }
  }, [item, historyAdded]);

  const checkWatchlistStatus = async () => {
    const storedUserStr = localStorage.getItem('loggedInUser');
    let userId;
    try {
      const userObj = JSON.parse(storedUserStr);
      userId = userObj.id;
    } catch (err) {
      console.error('Error parsing loggedInUser:', err);
      return;
    }
    if (!userId || !item) return;
    try {
      const res = await fetch(`http://localhost:3002/watch_list?user_id=${userId}&media_id=${item.id}`);
      if (res.ok) {
        const data = await res.json();
        setIsInWatchlist(data && data.length > 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addToWatchHistory = async (detailItem) => {
    const storedUserStr = localStorage.getItem('loggedInUser');
    if (!storedUserStr) return;
    let userId;
    try {
      const userObj = JSON.parse(storedUserStr);
      userId = userObj.id;
    } catch (error) {
      console.error("Error parsing loggedInUser:", error);
      return;
    }
    const now = new Date();
    const dateString = now.toLocaleString('en-US', { month: 'short', day: 'numeric' });
    try {
      const res = await fetch(`http://localhost:3002/watch_history?user_id=${userId}&movie_id=${detailItem.id}&date=${dateString}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          return;
        }
      }
    } catch (err) {
      console.error("Error checking watch history:", err);
    }
    const newHistory = {
      user_id: userId,
      movie_id: detailItem.id,
      actors: detailItem.Actors,
      director: detailItem.Director,
      plot: detailItem.Plot,
      poster: detailItem.Poster,
      title: detailItem.Title,
      type: detailItem.Type,
      year: detailItem.Year,
      imdbRating: detailItem.imdbRating,
      date: dateString
    };
    try {
      const postRes = await fetch('http://localhost:3002/watch_history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHistory)
      });
      if (!postRes.ok) {
        console.error("Failed to add watch history:", postRes.status);
      }
    } catch (err) {
      console.error("Error adding watch history:", err);
    }
  };

  const fetchUploaderInfo = async (detailItem) => {
    try {
      const res = await fetch(`http://localhost:3002/user_requested_media?title=${encodeURIComponent(detailItem.Title)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          const mediaRequest = data[0];
          const userRes = await fetch(`http://localhost:3002/users/${mediaRequest.user_id}`);
          if (userRes.ok) {
            const userData = await userRes.json();
            setUploader(userData.user_name || 'Admin');
          } else {
            setUploader('Admin');
          }
          if (mediaRequest.createdAt) {
            const dateObj = new Date(mediaRequest.createdAt);
            const formattedDate = dateObj.toLocaleString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            });
            setUploadedDate(formattedDate);
          } else {
            setUploadedDate('N/A');
          }
        } else {
          setUploader('Admin');
          setUploadedDate('N/A');
        }
      }
    } catch (err) {
      console.error("Error fetching uploader info:", err);
      setUploader('Admin');
      setUploadedDate('N/A');
    }
  };

  const handleCommentsChange = (updatedComments) => {
    if (previousCommentsLength > 0 && updatedComments.length > previousCommentsLength) {
      toast.success('Review has been submitted successfully!', {
        position: 'bottom-center',
        autoClose: 3000,
        hideProgressBar: false,
        pauseOnHover: true,
        draggable: true,
      });
    }
    setPreviousCommentsLength(updatedComments.length);
    setCommentsData(updatedComments);
  };

  const renderAvgStars = (avg) => {
    const filledStars = Math.round(avg);
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= filledStars ? 'filled' : ''}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  if (loading) {
    return <div className="movie-detail-loading">Loading details...</div>;
  }

  if (!item) {
    return <div className="movie-detail-notfound">Item not found.</div>;
  }

  const genres = item.Genre ? item.Genre.split(',').map(g => g.trim()) : [];
  const actors = item.Actors ? item.Actors.split(',').map(a => a.trim()) : [];
  
  const averageRating = commentsData.length > 0
    ? commentsData.reduce((sum, c) => sum + c.rating, 0) / commentsData.length
    : 0;

  const adminUploaded = item.addedBy && item.addedBy.toLowerCase() === 'admin';
  const uploaderDisplay = adminUploaded ? "Admin" : (uploader || "N/A");
  const uploadedDateDisplay = adminUploaded && item.createdAt
    ? new Date(item.createdAt).toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : (uploadedDate || "N/A");

  return (
    <div className="movie-detail-container">
      <div>
        <title>Media Details</title>
        <ToastContainer />
      </div>

      <div
        className="movie-detail-content"
        style={{ backgroundImage: `url(${item.Poster})` }}
      >
        <div className="movie-detail-overlay" />
        <div className="movie-detail-row">
          <div className="movie-detail-left">
            <div className="poster-wrapper">
              <img src={item.Poster} alt={item.Title} className="detail-poster" />
              {isLoggedIn ? (
                <button className="overlay-icon-btn" onClick={handleToggleWatchlist}>
                  <FontAwesomeIcon icon={isInWatchlist ? faCheck : faPlus} />
                </button>
              ) : (
                <button className="overlay-icon-btn" onClick={() => navigate('/login')}>
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              )}
            </div>
          </div>
          <div className="movie-detail-right">
            <h1 className="detail-title">{item.Title}</h1>
            <p className="detail-year">{item.Year}</p>
            <p className="detail-genres">
              {genres.map((g, index) => (
                <span key={index} className="genre-pill">{g}</span>
              ))}
            </p>
            <div className="user-avg-rating">
              <span id="user-avg-rating-label">User Rating: </span>
              <div className="detail-stars">
                {renderAvgStars(averageRating)}
              </div>
              <span className="rating-out-of">
                <span className="rating-left">{averageRating.toFixed(1)}</span>
                <span className="slash"> / </span>
                <span className="rating-right">5</span>
              </span>
            </div>
            <p className="detail-imdb">
              IMDb: <strong>{item.imdbRating}</strong>
            </p>
          </div>
        </div>
      </div>
      <div className="movie-detail-lower">
        <div className="plot-director-container">
          <div className="plot-section">
            <h2>Plot summary</h2>
            <p className="plot-text">{item.Plot}</p>
            <p className="updated-by">
              Uploaded by: {uploaderDisplay}<br />
              {uploadedDateDisplay}
            </p>
          </div>
          <div className="director-cast-section">
            <div>
              <h3 className="director-heading">Director</h3>
              <p className="director-name">{item.Director}</p>
            </div>
            <div>
              <h3 className="top-cast-heading">Top cast</h3>
              <ul className="cast-list">
                {actors.map((actor, idx) => (
                  <li key={idx}>{actor}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <Comments movieId={item.id} onCommentsChange={handleCommentsChange} />
      </div>
    </div>
  );
};

export default MediaDetails;
