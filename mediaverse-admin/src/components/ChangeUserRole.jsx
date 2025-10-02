// src/pages/ChangeUserRole.jsx
import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import './ChangeUserRole.css';

const ChangeUserRole = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToChange, setUserToChange] = useState(null);

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

  // Helper: Verify token; if missing or expired, log out and redirect to login
  const verifyToken = () => {
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
      return false;
    }
    return true;
  };

  // Fetch all users on component mount
  useEffect(() => {
    const fetchAllUsers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:3002/users');
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }
        const data = await response.json();
        setUsers(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllUsers();
  }, []);

  // Called when "Change Role" button is clicked
  const handleChangeRoleClick = (user) => {
    if (!verifyToken()) return;
    setUserToChange(user);
    setShowConfirmModal(true);
  };

  // Actually change the user role after confirmation
  const confirmChangeRole = async () => {
    if (!verifyToken()) return;
    if (!userToChange) return;

    const newRole = !userToChange.isAdmin; // Flip from admin->user or user->admin
    try {
      // PATCH request to update isAdmin status
      const response = await fetch(`http://localhost:3002/users/${userToChange.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: newRole }),
      });
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userToChange.id ? { ...u, isAdmin: newRole } : u
        )
      );

      toast.success(`User "${userToChange.name}" role changed successfully!`, {
        position: 'bottom-center',
        autoClose: 3000,
      });
    } catch (err) {
      console.error('Error changing user role:', err);
      toast.error('Failed to change user role. Please try again.', {
        position: 'bottom-center',
        autoClose: 3000,
      });
    } finally {
      setShowConfirmModal(false);
      setUserToChange(null);
    }
  };

  // Close the modal without changing
  const cancelChangeRole = () => {
    setShowConfirmModal(false);
    setUserToChange(null);
  };

  return (
    <div className="change-role-container">
      <h1 className="change-role-title">Change User Role</h1>

      {isLoading && <div className="change-role-loading">Loading users...</div>}
      {error && <div className="change-role-error">{error}</div>}

      {!isLoading && !error && users.length === 0 && (
        <div className="no-users-row">No users found.</div>
      )}

      {/* Table of users */}
      {!isLoading && !error && users.length > 0 && (
        <div className="change-role-table-container">
          <div className="table-scroll">
            <table className="change-role-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Username</th>
                  <th>Current Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const roleLabel = user.isAdmin ? 'Admin' : 'User';
                  return (
                    <tr key={user.id}>
                      <td>{user.name || 'N/A'}</td>
                      <td>{user.email || 'N/A'}</td>
                      <td>{user.user_name || 'N/A'}</td>
                      <td>
                        <span
                          className={`role-badge ${
                            user.isAdmin ? 'admin-badge' : 'user-badge'
                          }`}
                        >
                          {roleLabel}
                        </span>
                      </td>
                      <td>
                        <button
                          className="change-role-btn"
                          onClick={() => handleChangeRoleClick(user)}
                        >
                          {user.isAdmin ? 'Make User' : 'Make Admin'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="table-footer">Total Users: {users.length}</div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && userToChange && (
        <div className="role-modal-overlay">
          <div className="role-modal-content">
            <h2>Confirm Role Change</h2>
            <p>
              Are you sure you want to change the role of{' '}
              <strong>{userToChange.name}</strong> from{' '}
              <strong>{userToChange.isAdmin ? 'Admin' : 'User'}</strong> to{' '}
              <strong>{!userToChange.isAdmin ? 'Admin' : 'User'}</strong>?
            </p>
            <div className="role-modal-buttons">
              <button className="role-confirm-btn" onClick={confirmChangeRole}>
                Change
              </button>
              <button className="role-cancel-btn" onClick={cancelChangeRole}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer closeOnClick pauseOnHover />
    </div>
  );
};

export default ChangeUserRole;
