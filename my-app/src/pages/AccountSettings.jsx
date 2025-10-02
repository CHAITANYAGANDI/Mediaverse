import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 1) Import Toastify
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AccountSettings.css';

// Helper function to check token expiration
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // exp is in seconds; convert to milliseconds
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

const AccountSettings = () => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  // Helper: If token is missing/expired, log out and redirect
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

  // Button handlers from old code
  const handleEditProfile = () => {
    if (!verifyToken()) return;
    console.log('Edit Profile clicked!');
    navigate('/edit-profile');
  };

  const handleLoginSecurity = () => {
    if (!verifyToken()) return;
    console.log('Login & Security clicked!');
    navigate('/login-security');
  };

  const handlePersonalInfo = () => {
    if (!verifyToken()) return;
    console.log('Personal Information clicked!');
    navigate('/personal-info');
  };

  // Show confirmation dialog for account deletion
  const handleDeleteAccountClick = () => {
    if (!verifyToken()) return;
    console.log('Delete Account clicked!');
    setShowConfirm(true);
  };

  // Cancel deletion
  const handleCancelDelete = () => {
    setShowConfirm(false);
  };

  // Helper: Delete all user records in a given table
  const deleteAllUserRecords = async (tableName, userId) => {
    // 1) Get all records for this user
    const res = await fetch(`http://localhost:3002/${tableName}?user_id=${userId}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${tableName} for user_id=${userId}`);
    }
    const data = await res.json();

    // 2) Delete each record
    for (const record of data) {
      const deleteRes = await fetch(`http://localhost:3002/${tableName}/${record.id}`, {
        method: 'DELETE',
      });
      if (!deleteRes.ok) {
        throw new Error(`Failed to delete record ${record.id} from ${tableName}`);
      }
    }
  };

  // Confirm deletion: remove user data from all tables + delete user
  const handleConfirmDelete = async () => {
    try {
      // Re-check token
      const token = localStorage.getItem('jwtToken');
      if (!token || isTokenExpired(token)) {
        toast.error('Session expired. Please log in again.', {
          position: 'bottom-center',
          autoClose: 3000,
          style: { backgroundColor: '#dc3545', color: '#fff' },
        });
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('loggedInUser');
        navigate('/login');
        return;
      }

      // Get user from localStorage
      const storedUserString = localStorage.getItem('loggedInUser');
      if (!storedUserString) {
        throw new Error('No logged-in user found in localStorage.');
      }
      const user = JSON.parse(storedUserString);
      if (!user.id) {
        throw new Error('Logged-in user has no ID.');
      }

      const userId = user.id;

      // 1) Delete from each table referencing user_id
      await deleteAllUserRecords('user_ratings', userId);
      await deleteAllUserRecords('watch_list', userId);
      await deleteAllUserRecords('watch_history', userId);
      await deleteAllUserRecords('preferred_list', userId);
      await deleteAllUserRecords('user_requested_media', userId);

      // 2) Finally delete the user from "users" table
      const deleteUserRes = await fetch(`http://localhost:3002/users/${userId}`, {
        method: 'DELETE',
      });
      if (!deleteUserRes.ok) {
        throw new Error(`Failed to delete user with id=${userId}`);
      }

      // 3) Clear localStorage
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('loggedInUser');

      // 4) Show success toast and navigate
      toast.success('Account deleted successfully!', {
        position: 'bottom-center',
        autoClose: 3000,
        style: { backgroundColor: '#4BB543', color: '#fff' },
      });

      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account. Please try again.', {
        position: 'bottom-center',
        autoClose: 3000,
        style: { backgroundColor: '#dc3545', color: '#fff' },
      });
    } finally {
      setShowConfirm(false);
    }
  };

  return (
    <div className="account-settings-container">
      <h1 className="account-settings-title">Account Settings</h1>
      <p className="account-settings-subtitle">
        Manage your profile, security settings, and personal information here.
      </p>

      <div className="account-settings-options">
        <button className="settings-btn" onClick={handleEditProfile}>
          Edit Profile
        </button>
        <button className="settings-btn" onClick={handleLoginSecurity}>
          Login &amp; Security
        </button>
        <button className="settings-btn" onClick={handlePersonalInfo}>
          Personal Information
        </button>
        <button className="settings-btn delete-btn" onClick={handleDeleteAccountClick}>
          Delete Account
        </button>
      </div>

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className="delete-confirmation-overlay">
          <div className="delete-confirmation-dialog">
            <h2>Confirm Account Deletion</h2>
            <p>
              This action will permanently delete your account and all related data.
              Continue?
            </p>
            <div className="dialog-buttons">
              <button
                className="delete-btn"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
              <button
                className="cancel-btn"
                onClick={handleCancelDelete}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ToastContainer to display notifications */}
      <ToastContainer closeOnClick pauseOnHover />
    </div>
  );
};

export default AccountSettings;
