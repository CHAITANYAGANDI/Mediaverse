import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ChangeName.css';

// Helper function to check if a token is expired (assumes standard JWT format)
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Compare expiration (in seconds) to current time (in ms)
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

const ChangeName = () => {
  const navigate = useNavigate();

  const [currentName, setCurrentName] = useState('');
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch user details on mount
  useEffect(() => {
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

    const fetchUser = async () => {
      try {
        const resp = await fetch(`http://localhost:3002/users/${storedUser.id}`);
        if (!resp.ok) {
          throw new Error(`Server returned ${resp.status}`);
        }
        const data = await resp.json();
        setCurrentName(data.name || '');
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

    // Check token validity before proceeding
    const token = localStorage.getItem('jwtToken');
    if (!token || isTokenExpired(token)) {
      // Token expired or not found, log out and navigate to login
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
      // PATCH request to update the user's name
      const resp = await fetch(`http://localhost:3002/users/${storedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });
      if (!resp.ok) {
        throw new Error(`Server returned ${resp.status}`);
      }
      const updatedUser = await resp.json();
      // Update localStorage with the new user data
      localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
      
      // Show success toast with the green color
      toast.success('Name updated successfully!', {
        position: 'bottom-center',
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        // style: {
        //   backgroundColor: '#4BB543', // Green color from your screenshot
        //   color: '#fff',
        // },
        onClose: () => navigate('/login-security'),
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to update name. Please try again.', {
        position: 'bottom-center',
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        // style: {
        //   backgroundColor: '#dc3545', // Red for error
        //   color: '#fff',
        // },
      });
      setError('Failed to update name. Please try again.');
    }
  };

  if (loading) {
    return <div className="change-name-container">Loading user data...</div>;
  }
  if (error) {
    return <div className="change-name-container">{error}</div>;
  }

  return (
    <div className="change-name-container">
      {/* Toast container for rendering toasts */}
      <ToastContainer />
      <h1 className="change-name-title">Change your name</h1>
      <p className="change-name-subtitle">
        If you want to change the name associated with your account, you may do so below.
      </p>

      <form className="change-name-form" onSubmit={handleSaveChanges}>
        <div className="form-group">
          <label>Current name:</label>
          <input type="text" value={currentName} disabled />
        </div>

        <div className="form-group">
          <label>New name:</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="save-changes-btn">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default ChangeName;
