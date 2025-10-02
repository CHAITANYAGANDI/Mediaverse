import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginSecurity.css';

// Helper function to check if a token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    // Decode the token payload (assumes JWT structure: header.payload.signature)
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Compare the expiration (in seconds) to current time (in milliseconds)
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

const LoginSecurity = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // Fetched user data from JSON‑server
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Token verification helper: if token is expired, clear localStorage and navigate to login.
  const verifyToken = () => {
    const token = localStorage.getItem('jwtToken');
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('loggedInUser');
      navigate('/login');
      return false;
    }
    return true;
  };

  useEffect(() => {
    // Retrieve the user object from localStorage (it should contain the user id)
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

    // Fetch the full user details from the JSON‑server using the id from localStorage.
    const fetchUser = async () => {
      try {
        const resp = await fetch(`http://localhost:3002/users/${storedUser.id}`);
        if (!resp.ok) {
          throw new Error(`Server returned ${resp.status}`);
        }
        const data = await resp.json();
        setUser(data);
      } catch (err) {
        setError('Error fetching user data from JSON‑Server.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // Handlers for Edit actions with token verification
  const handleEditName = () => {
    if (!verifyToken()) return;
    navigate('/change-name');
  };

  const handleEditEmail = () => {
    if (!verifyToken()) return;
    navigate('/change-email');
  };

  const handleEditPassword = () => {
    if (!verifyToken()) return;
    navigate('/change-password');
  };

  // Handler for the "Done" button with token verification
  const handleDone = () => {
    if (!verifyToken()) return;
    navigate('/account-settings');
  };

  if (loading) {
    return <div className="login-security-container">Loading user data...</div>;
  }
  if (error) {
    return <div className="login-security-container">{error}</div>;
  }
  if (!user) {
    return (
      <div className="login-security-container">
        <p>No user data found.</p>
      </div>
    );
  }

  // For safety, mask the password with asterisks
  const maskedPassword = user.password ? '********' : '';

  return (
    <div className="login-security-container">
      <h1 className="login-security-title">Login &amp; Security</h1>
      <p className="login-security-subtitle">
        Manage your login credentials and security options below.
      </p>

      <div className="login-security-list">
        {/* Name row */}
        <div className="security-row">
          <div className="security-label">Name:</div>
          <div className="security-value">{user.name || 'No name set'}</div>
          <button className="security-edit-btn" onClick={handleEditName}>
            Edit
          </button>
        </div>

        {/* Email row */}
        <div className="security-row">
          <div className="security-label">Email:</div>
          <div className="security-value">{user.email || 'No email set'}</div>
          <button className="security-edit-btn" onClick={handleEditEmail}>
            Edit
          </button>
        </div>

        {/* Password row */}
        <div className="security-row">
          <div className="security-label">Password:</div>
          <div className="security-value">{maskedPassword}</div>
          <button className="security-edit-btn" onClick={handleEditPassword}>
            Edit
          </button>
        </div>
      </div>

      {/* "Done" button at the bottom */}
      <div className="done-button-row">
        <button className="done-button" onClick={handleDone}>
          Done
        </button>
      </div>
    </div>
  );
};

export default LoginSecurity;
