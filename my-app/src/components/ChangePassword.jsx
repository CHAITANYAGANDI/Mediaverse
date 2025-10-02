import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ChangePassword.css';

// Helper function to check if a token is expired (assumes standard JWT format)
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

const ChangePassword = () => {
  const navigate = useNavigate();

  // Form fields
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [retypeNewPassword, setRetypeNewPassword] = useState('');

  // User info, loading, and error states
  const [user, setUser] = useState(null);
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
        setUser(data);
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
      // If token is missing or expired, clear storage and redirect to login
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('loggedInUser');
      toast.error('Session expired. Please log in again.', {
        position: 'bottom-center',
        autoClose: 3000,
        style: {
          backgroundColor: '#dc3545',
          color: '#fff',
        },
      });
      navigate('/login');
      return;
    }

    if (!user) {
      setError('No user data loaded.');
      toast.error('No user data loaded.', {
        position: 'bottom-center',
        autoClose: 3000,
        style: {
          backgroundColor: '#dc3545',
          color: '#fff',
        },
      });
      return;
    }

    // Validate the current password input
    if (!bcrypt.compareSync(currentPasswordInput, user.password)) {
      setError('Current password is incorrect.');
      toast.error('Current password is incorrect.', {
        position: 'bottom-center',
        autoClose: 3000,
        style: {
          backgroundColor: '#dc3545',
          color: '#fff',
        },
      });
      return;
    }

    // Validate that the new passwords match
    if (newPassword !== retypeNewPassword) {
      setError('New passwords do not match.');
      toast.error('New passwords do not match.', {
        position: 'bottom-center',
        autoClose: 3000,
        style: {
          backgroundColor: '#dc3545',
          color: '#fff',
        },
      });
      return;
    }

    try {
      // Hash the new password with a salt factor of 10
      const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
      const resp = await fetch(`http://localhost:3002/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: hashedNewPassword })
      });
      if (!resp.ok) {
        throw new Error(`Server returned ${resp.status}`);
      }
      const updatedUser = await resp.json();
      // Update localStorage with the new user data
      localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
      toast.success('Password updated successfully!', {
        position: 'bottom-center',
        autoClose: 3000,
        style: {
          backgroundColor: '#4BB543',
          color: '#fff',
        },
      });
      // Navigate to /login-security after toast auto-closes
      setTimeout(() => {
        navigate('/login-security');
      }, 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to update password. Please try again.');
      toast.error('Failed to update password. Please try again.', {
        position: 'bottom-center',
        autoClose: 3000,
        style: {
          backgroundColor: '#dc3545',
          color: '#fff',
        },
      });
    }
  };

  if (loading) {
    return <div className="change-password-container">Loading user data...</div>;
  }
  if (error) {
    return <div className="change-password-container error-message">{error}</div>;
  }
  if (!user) {
    return (
      <div className="change-password-container">
        <p>No user found.</p>
      </div>
    );
  }

  return (
    <div className="change-password-container">
      <h1 className="change-password-title">Change password</h1>
      <p className="change-password-subtitle">
        To change the password for your account, use this form.
      </p>

      <form className="change-password-form" onSubmit={handleSaveChanges}>
        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label>Current password:</label>
          <input
            type="password"
            value={currentPasswordInput}
            onChange={(e) => setCurrentPasswordInput(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>New password:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Re-enter new password:</label>
          <input
            type="password"
            value={retypeNewPassword}
            onChange={(e) => setRetypeNewPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="save-changes-btn">
          Save changes
        </button>
      </form>
      {/* ToastContainer for displaying toast notifications */}
      <ToastContainer closeOnClick pauseOnHover />
    </div>
  );
};

export default ChangePassword;
