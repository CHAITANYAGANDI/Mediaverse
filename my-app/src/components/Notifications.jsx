// src/components/Notifications.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Notifications.css';

// Helper to create a slug from a title
const createSlug = (title) => title.replace(/\s+/g, '-').toLowerCase();

// Helper to calculate how long ago something was created (e.g. "2 days ago")
const timeAgo = (dateString) => {
  const now = new Date();
  const created = new Date(dateString);
  const diffMs = now - created; // difference in milliseconds
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    // Check hours or minutes
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} min ago`;
    }
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
};

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Suppose the user is logged in and has an ID in localStorage
        const storedUserString = localStorage.getItem('loggedInUser');
        if (!storedUserString) {
          // If not logged in, redirect or just skip
          navigate('/login');
          return;
        }
        const userObj = JSON.parse(storedUserString);
        const userId = userObj.id;

        // Fetch user_requested_media for this user
        const resp = await fetch(`http://localhost:3002/user_requested_media?user_id=${userId}`);
        if (!resp.ok) {
          throw new Error(`Server returned ${resp.status}`);
        }
        const data = await resp.json();

        // Filter for records that are "approved" or "declined"
        const filtered = data.filter(
          (item) =>
            item.request_status?.toLowerCase() === 'approved' ||
            item.request_status?.toLowerCase() === 'declined'
        );

        setNotifications(filtered);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    fetchNotifications();
  }, [navigate]);

  // Navigate to the detail page for an approved/declined media
  const handleNotificationClick = (media) => {
    // If the request was for a "movie", navigate to /movies/:slug
    // If "tvshow", navigate to /tvshows/:slug
    const slug = createSlug(media.title || media.Title);
    if (media.media_type?.toLowerCase() === 'movie') {
      navigate(`/movies/${slug}`);
    } else {
      navigate(`/tvshows/${slug}`);
    }
  };

  return (
    <div className="notifications-container">
      <h1 className="notifications-title">Notifications</h1>
      {notifications.length === 0 ? (
        <p className="no-notifications">No new notifications.</p>
      ) : (
        <ul className="notifications-list">
          {notifications.map((item) => {
            const isApproved = item.request_status?.toLowerCase() === 'approved';
            const isDeclined = item.request_status?.toLowerCase() === 'declined';

            // Different text for approved vs. declined
            let heading = '';
            let subText = '';
            if (isApproved) {
              heading = `Now Available`;
              subText = `Tune in for a new ${item.media_type === 'tvshow' ? 'episode' : 'movie'}.`;
            } else if (isDeclined) {
              heading = `Declined`;
              subText = `This movie got declined which you added before.`;
            }

            // Calculate how long ago it was created
            const createdStr = item.createdAt ? timeAgo(item.createdAt) : 'N/A';

            return (
              <li
                key={item.id}
                className="notification-item"
                onClick={() => handleNotificationClick(item)}
              >
                {/* Poster image on the left */}
                {item.Poster && (
                  <img
                    src={item.Poster}
                    alt={item.title}
                    className="notification-poster"
                  />
                )}
                <div className="notification-content">
                  <div className="notification-heading">{heading}</div>
                  <div className="notification-title">{item.title}</div>
                  <div className="notification-subtext">{subText}</div>
                  <div className="notification-time">{createdStr}</div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
