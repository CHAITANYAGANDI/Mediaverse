import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();

  // State for user details and statistics
  const [userName, setUserName] = useState('Unknown User');
  const [joinedDate, setJoinedDate] = useState('Mar 2025');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [addedMediaCount, setAddedMediaCount] = useState(0);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [preferredListCount, setPreferredListCount] = useState(0);
  const [watchHistoryCount, setWatchHistoryCount] = useState(0);

  // Helper to check if a JWT token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // 'exp' is in seconds so multiply by 1000 to compare with Date.now()
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  };

  // Handle navigation with token verification
  const handleNavigation = (targetPath) => {
    const token = localStorage.getItem('jwtToken');
    if (isTokenExpired(token)) {
      // Token is expired or missing: log out the user and navigate to login
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('loggedInUser');
      navigate('/login');
    } else {
      navigate(targetPath);
    }
  };

  useEffect(() => {
    // Get logged-in user ID from localStorage
    const storedUserString = localStorage.getItem('loggedInUser');
    if (!storedUserString) {
      navigate('/login');
      return;
    }
    const storedUser = JSON.parse(storedUserString);
    if (!storedUser.id) {
      navigate('/login');
      return;
    }
    const userId = storedUser.id;

    // Fetch user details from JSON‑server
    fetch(`http://localhost:3002/users/${userId}`)
      .then((resp) => {
        if (!resp.ok) {
          throw new Error(`Server returned ${resp.status}`);
        }
        return resp.json();
      })
      .then((data) => {
        if (data.user_name) setUserName(data.user_name);
        if (data.bio) setBio(data.bio);
        if (data.profile_image) setProfileImage(data.profile_image);
        if (data.joinedDate) {
          const date = new Date(data.joinedDate);
          setJoinedDate(
            date.toLocaleString('default', { month: 'short', year: 'numeric' })
          );
        }
      })
      .catch((err) => console.error('Error fetching user details:', err));

    // Fetch watchlist count
    fetch(`http://localhost:3002/watch_list?user_id=${userId}`)
      .then((resp) => resp.json())
      .then((data) => {
        setWatchlistCount(Array.isArray(data) ? data.length : 0);
      })
      .catch((err) => console.error('Error fetching watchlist:', err));

    // Fetch added media count
    fetch(`http://localhost:3002/user_requested_media?user_id=${userId}`)
      .then((resp) => resp.json())
      .then((data) => {
        setAddedMediaCount(Array.isArray(data) ? data.length : 0);
      })
      .catch((err) => console.error('Error fetching added media:', err));

    // Fetch preferred list count
    fetch(`http://localhost:3002/preferred_list?user_id=${userId}`)
      .then((resp) => resp.json())
      .then((data) => {
        setPreferredListCount(Array.isArray(data) ? data.length : 0);
      })
      .catch((err) => console.error('Error fetching preferred list:', err));

    // Fetch watch history count
    fetch(`http://localhost:3002/watch_history?user_id=${userId}`)
      .then((resp) => resp.json())
      .then((data) => {
        setWatchHistoryCount(Array.isArray(data) ? data.length : 0);
      })
      .catch((err) => console.error('Error fetching watch history:', err));
  }, [navigate]);

  // Handlers for navigating to the respective pages when the stats boxes or edit profile are clicked
  const handleEditProfile = () => handleNavigation('/edit-profile');
  const goToAddedMedia = () => handleNavigation('/requested-media');
  const goToWatchList = () => handleNavigation('/watchlist');
  const goToPreferredList = () => handleNavigation('/preferred');
  const goToWatchHistory = () => handleNavigation('/watch-history');

  return (
    <div className="profile-container">
      <div className="profile-top">
        <div
          className="profile-avatar"
          style={{
            backgroundImage: profileImage
              ? `url(${profileImage})`
              : `url("data:image/svg+xml,%3Csvg width='512' height='512' viewBox='0 0 512 512' fill='%23ccc' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M256 256c70.7 0 128-57.3 128-128S326.7 0 256 0 128 57.3 128 128s57.3 128 128 128zm89.6 32h-11.2c-22 10.1-46.5 16-78.4 16s-56.4-5.9-78.4-16h-11.2C74.98 288 0 362.98 0 456v24c0 17.7 14.3 32 32 32h448c17.7 0 32-14.3 32-32v-24c0-93.02-74.98-168-166.4-168z'/%3E%3C/svg%3E")`
          }}
        ></div>
        <div className="profile-info">
          <h1 className="profile-username">{userName}</h1>
          <p className="profile-joined">Joined {joinedDate}</p>
          {bio && <p className="profile-bio">{bio}</p>}
          <button className="edit-profile-btn" onClick={handleEditProfile}>
            Edit profile
          </button>
        </div>
      </div>

      <div className="profile-stats">
        <div
          className="profile-stat-box"
          onClick={goToAddedMedia}
          style={{ cursor: 'pointer' }}
        >
          <span className="stat-value">{addedMediaCount}</span>
          <span className="stat-title">Added Media</span>
        </div>
        <div
          className="profile-stat-box"
          onClick={goToWatchList}
          style={{ cursor: 'pointer' }}
        >
          <span className="stat-value">{watchlistCount}</span>
          <span className="stat-title">Watch List</span>
        </div>
        <div
          className="profile-stat-box"
          onClick={goToPreferredList}
          style={{ cursor: 'pointer' }}
        >
          <span className="stat-value">{preferredListCount}</span>
          <span className="stat-title">Preferred List</span>
        </div>
        <div
          className="profile-stat-box"
          onClick={goToWatchHistory}
          style={{ cursor: 'pointer' }}
        >
          <span className="stat-value">{watchHistoryCount}</span>
          <span className="stat-title">Watch History</span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
