// src/components/Comments.jsx
import React, { useState, useEffect } from 'react';
import { jwtVerify } from 'jose'; // Ensure you have installed jose
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import './comments.css';

const SECRET_KEY = "your-secret-key";

const Comments = ({ movieId, onCommentsChange }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newCommentRating, setNewCommentRating] = useState(0);
  const [activeReply, setActiveReply] = useState({ commentId: null, text: '' });
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate();

  // Load dynamic user info from localStorage
  useEffect(() => {
    const storedUserStr = localStorage.getItem('loggedInUser');
    if (storedUserStr) {
      try {
        const userObj = JSON.parse(storedUserStr);
        setCurrentUser(userObj);
      } catch (error) {
        console.error("Error parsing stored user:", error);
      }
    }
  }, []);

  // Fetch comments for the current movie from JSON‑Server
  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:3002/user_ratings?movieId=${movieId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
        if (onCommentsChange) onCommentsChange(data);
      } else {
        console.error('Failed to fetch comments:', response.status);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  useEffect(() => {
    if (movieId) {
      fetchComments();
    }
  }, [movieId]);

  // Handler to add a new comment (with JWT verification)
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    // Get the JWT token from localStorage
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      alert("You are not authorized. Please log in.");
      navigate('/login');
      return;
    }

    // Verify the token using jose
    try {
      await jwtVerify(token, new TextEncoder().encode(SECRET_KEY));
      // If verification passes, continue
    } catch (error) {
      alert("Token verification failed. You are not authorized to submit a review. Redirecting to login.");
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('loggedInUser');
      setCurrentUser(null);
      navigate('/login');
      return;
    }

    // Build comment object, including user_id from currentUser
    const commentObj = {
      movieId,
      user_id: currentUser ? currentUser.id : null,
      text: newComment,
      author: currentUser ? currentUser.user_name : "Anonymous",
      date: new Date().toLocaleString(),
      rating: newCommentRating,
      replies: []
    };

    try {
      const response = await fetch('http://localhost:3002/user_ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentObj)
      });
      if (response.ok) {
        await fetchComments();
        setNewComment('');
        setIsInputFocused(false);
        setNewCommentRating(0);
      } else {
        console.error('Failed to add comment:', response.status);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Handler to open reply input for a given comment
  const handleOpenReply = (commentId) => {
    setActiveReply({ commentId, text: '' });
  };

  const handleCancelReply = () => {
    setActiveReply({ commentId: null, text: '' });
  };

  // Handler to submit a reply (PATCH request)
  const handleSubmitReply = async (commentId) => {
    if (!activeReply.text.trim()) return;

    const commentToUpdate = comments.find((c) => c.id === commentId);
    if (!commentToUpdate) return;

    const updatedReplies = [
      ...commentToUpdate.replies,
      {
        id: `reply-${Date.now()}`,
        text: activeReply.text,
        author: currentUser ? currentUser.user_name : "Anonymous",
        date: new Date().toLocaleString()
      }
    ];

    try {
      const response = await fetch(`http://localhost:3002/user_ratings/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replies: updatedReplies })
      });
      if (response.ok) {
        await fetchComments();
        setActiveReply({ commentId: null, text: '' });
      } else {
        console.error('Failed to update comment with reply:', response.status);
      }
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  // Renders star icons for rating selection
  const renderRatingStars = (rating, setRating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star-icon ${i <= rating ? 'filled' : ''}`}
          onClick={() => setRating(i)}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="comments-container">
      <div className="comments-header">
        <span className="comments-count">
          {comments.length > 0 ? `${comments.length} Reviews` : 'Reviews'}
        </span>
      </div>

      {/* New comment input */}
      <div className="rating-and-input">
        <div className="rating-row">
          <h3 className="rating-label">Your Rating</h3>
          <div className="rating-stars">
            {renderRatingStars(newCommentRating, setNewCommentRating)}
          </div>
          {newCommentRating > 0 && (
            <span className="rating-count">
              <span className="rating-left">{newCommentRating}</span>
              <span className="slash">/</span>
              <span className="rating-right">5</span>
            </span>
          )}
        </div>

        <div className="comment-input-row">
          <textarea 
            className="comment-input" 
            placeholder="Write a review..."
            value={newComment}
            onFocus={() => setIsInputFocused(true)}
            onChange={(e) => setNewComment(e.target.value)}
          ></textarea>
          {isInputFocused && (
            <div className="main-comment-buttons">
              <button 
                className="comment-cancel-btn" 
                onClick={() => {
                  setNewComment('');
                  setIsInputFocused(false);
                  setNewCommentRating(0);
                }}
              >
                Cancel
              </button>
              <button className="comment-submit-btn" onClick={handleAddComment}>
                Submit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* List of comments */}
      <div className="comment-list">
        {comments.map((c) => (
          <div key={c.id} className="comment-item">
            <p className="comment-author">
              {c.author} <span className="comment-date">{c.date}</span>
            </p>
            <p className="comment-text">{c.text}</p>
            {c.rating > 0 && (
              <div className="comment-rating">
                {[...Array(c.rating)].map((_, i) => (
                  <span key={i} className="star-icon filled">★</span>
                ))}
                {[...Array(5 - c.rating)].map((_, i) => (
                  <span key={i} className="star-icon">★</span>
                ))}
                <span className="rating-out-of">
                  <span className="rating-left">{c.rating}</span>
                  <span className="slash">/</span>
                  <span className="rating-right">5</span>
                </span>
              </div>
            )}
            <button className="reply-btn" onClick={() => handleOpenReply(c.id)}>
              Reply
            </button>
            {activeReply.commentId === c.id && (
              <div className="reply-input-container">
                <textarea 
                  className="reply-input" 
                  placeholder="Write a reply..."
                  value={activeReply.text}
                  onChange={(e) => setActiveReply({ ...activeReply, text: e.target.value })}
                ></textarea>
                <div className="reply-buttons">
                  <button className="reply-cancel-btn" onClick={handleCancelReply}>
                    Cancel
                  </button>
                  <button className="reply-submit-btn" onClick={() => handleSubmitReply(c.id)}>
                    Reply
                  </button>
                </div>
              </div>
            )}
            {c.replies && c.replies.length > 0 && (
              <div className="replies-list">
                {c.replies.map((rep) => (
                  <div key={rep.id} className="reply-item">
                    <p className="reply-author">
                      {rep.author} <span className="reply-date">{rep.date}</span>
                    </p>
                    <p className="reply-text">{rep.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comments;
