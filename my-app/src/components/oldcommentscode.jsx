import React, { useState } from 'react';
import './comments.css';

const Comments = ({ onCommentsChange }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);

  // For storing the rating for the *current* new comment
  const [newCommentRating, setNewCommentRating] = useState(0);

  // State for reply: stores the index of the comment being replied to and the reply text
  const [activeReply, setActiveReply] = useState({ index: null, text: '' });

  // Update both local state and notify parent
  const updateComments = (updated) => {
    setComments(updated);
    onCommentsChange(updated); // notify parent
  };

  // Handler to add a new comment
  const handleAddComment = () => {
    if (newComment.trim() === '') return;

    const commentObj = {
      text: newComment,
      author: 'CurrentUser', // Replace with dynamic user info if needed
      date: new Date().toLocaleString(),
      rating: newCommentRating,  // Store the chosen rating in the comment
      replies: []
    };
    const updated = [...comments, commentObj];
    updateComments(updated);
    setNewComment('');
    setIsInputFocused(false);
    setNewCommentRating(0); // Reset rating after submitting
  };

  // Handlers for reply functionality
  const handleOpenReply = (index) => {
    setActiveReply({ index, text: '' });
  };

  const handleCancelReply = () => {
    setActiveReply({ index: null, text: '' });
  };

  const handleSubmitReply = (index) => {
    if (activeReply.text.trim() === '') return;

    // Create reply object
    const replyObj = {
      text: activeReply.text,
      author: 'CurrentUser',
      date: new Date().toLocaleString()
    };

    // Insert reply into the targeted comment
    const updatedComments = [...comments];
    updatedComments[index].replies.push(replyObj);

    setComments(updatedComments);
    setActiveReply({ index: null, text: '' });
  };

  // Renders star icons for a given rating
  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star-icon ${i <= rating ? 'filled' : ''}`}
          onClick={() => setNewCommentRating(i)} // Let user pick rating
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

      {/* Rating + Comment Input */}
      <div className="rating-and-input">
        <div className="rating-row">
          <h3 className="rating-label">Your Rating</h3>
          <div className="rating-stars">
            {renderRatingStars(newCommentRating)}
          </div>
          {/* Show real-time rating like “3/5” */}
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
            placeholder="Review"
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

      {/* List of Comments */}
      <div className="comment-list">
        {comments.map((c, index) => (
          <div key={index} className="comment-item">
            <p className="comment-author">
              {c.author} <span className="comment-date">{c.date}</span>
            </p>
            <p className="comment-text">{c.text}</p>

            {/* Display the rating for this comment */}
            {c.rating > 0 && (
  <div className="comment-rating">
    {/* Filled and unfilled stars (unchanged) */}
    {[...Array(c.rating)].map((_, i) => (
      <span key={i} className="star-icon filled">★</span>
    ))}
    {[...Array(5 - c.rating)].map((_, i) => (
      <span key={i} className="star-icon">★</span>
    ))}

    {/* New: separate spans for X / 5 */}
    <span className="rating-out-of">
      <span className="rating-left">{c.rating}</span>
      <span className="slash"> / </span>
      <span className="rating-right">5</span>
    </span>
  </div>
)}


            {/* Reply button & logic */}
            <button 
              className="reply-btn"
              onClick={() => handleOpenReply(index)}
            >
              Reply
            </button>
            {activeReply.index === index && (
              <div className="reply-input-container">
                <textarea 
                  className="reply-input" 
                  placeholder="Write a reply..."
                  value={activeReply.text}
                  onChange={(e) => setActiveReply({ ...activeReply, text: e.target.value })}
                ></textarea>
                <div className="reply-buttons">
                  <button 
                    className="reply-cancel-btn" 
                    onClick={handleCancelReply}
                  >
                    Cancel
                  </button>
                  <button 
                    className="reply-submit-btn" 
                    onClick={() => handleSubmitReply(index)}
                  >
                    Reply
                  </button>
                </div>
              </div>
            )}
            {/* If any replies */}
            {c.replies && c.replies.length > 0 && (
              <div className="replies-list">
                {c.replies.map((rep, repIndex) => (
                  <div key={repIndex} className="reply-item">
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
