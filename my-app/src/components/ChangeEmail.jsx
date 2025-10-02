import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 1) Import Toastify
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './ChangeEmail.css';

// Helper function to check if the token is expired (assumes a standard JWT)
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

const ChangeEmail = () => {
  const navigate = useNavigate();

  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get the logged-in user from localStorage
    const storedUserString = localStorage.getItem('loggedInUser');
    if (!storedUserString) {
      setError('No logged-in user found in localStorage.');
      setLoading(false);
      return;
    }
    const storedUser = JSON.parse(storedUserString);
    if (!storedUser.id) {
      setError('Logged-in user has no ID field.');
      setLoading(false);
      return;
    }

    // Fetch user data from JSON‑server using the ID
    const fetchUser = async () => {
      try {
        const resp = await fetch(`http://localhost:3002/users/${storedUser.id}`);
        if (!resp.ok) {
          throw new Error(`Server returned ${resp.status}`);
        }
        const data = await resp.json();
        setCurrentEmail(data.email || '');
      } catch (err) {
        setError('Error fetching user data from JSON‑Server.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setError('');

    // Verify the token before proceeding
    const token = localStorage.getItem('jwtToken');
    if (!token || isTokenExpired(token)) {
      // If token is missing or expired, clear storage and navigate to login
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('loggedInUser');
      toast.error('Session expired. Please log in again.', {
        position: 'bottom-center',
        autoClose: 3000,
        style: {
          backgroundColor: '#dc3545', // Red for error
          color: '#fff',
        },
      });
      navigate('/login');
      return;
    }

    // Re-check for the logged-in user from localStorage
    const storedUserString = localStorage.getItem('loggedInUser');
    if (!storedUserString) {
      setError('No logged-in user found in localStorage.');
      return;
    }
    const storedUser = JSON.parse(storedUserString);
    if (!storedUser.id) {
      setError('Logged-in user has no ID field.');
      return;
    }

    try {
      // PATCH request to update the user's email
      const resp = await fetch(`http://localhost:3002/users/${storedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail })
      });
      if (!resp.ok) {
        throw new Error(`Server returned ${resp.status}`);
      }
      const updatedUser = await resp.json();
      // Update localStorage with the new user data
      localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));

      // Show success toast (green color)
      toast.success('Email updated successfully!', {
        position: 'bottom-center',
        autoClose: 3000,
        style: {
          backgroundColor: '#4BB543', // Green color
          color: '#fff',
        },
      });

      // Navigate to /login-security (after toast auto-closes)
      setTimeout(() => {
        navigate('/login-security');
      }, 3000);

    } catch (err) {
      console.error(err);
      setError('Failed to update email. Please try again.');
      toast.error('Failed to update email. Please try again.', {
        position: 'bottom-center',
        autoClose: 3000,
        style: {
          backgroundColor: '#dc3545', // Red for error
          color: '#fff',
        },
      });
    }
  };

  if (loading) {
    return <div className="change-email-container">Loading user data...</div>;
  }
  if (error) {
    return <div className="change-email-container">{error}</div>;
  }

  return (
    <div className="change-email-container">
      {/* ToastContainer renders any toast notifications we trigger */}
      <ToastContainer />

      <h1 className="change-email-title">Change your email address</h1>
      <p className="change-email-subtitle">
        Current email address: <strong>{currentEmail || 'None'}</strong>
      </p>

      <form className="change-email-form" onSubmit={handleSaveChanges}>
        <div className="form-group">
          <label>New email address:</label>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="save-changes-btn">
          Continue
        </button>
      </form>
    </div>
  );
};

export default ChangeEmail;
