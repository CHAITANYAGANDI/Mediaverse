// src/pages/DeleteUsers.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './DeleteUsers.css';

// Helper function: Check if token is expired
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

// Helper function: Verify token and, if expired, log out and navigate to login page
const verifyToken = (navigate) => {
  const token = localStorage.getItem('jwtToken');
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('loggedInUser');
    toast.error('Session expired. Please log in again.', {
      position: 'bottom-center',
      autoClose: 3000,
      style: { backgroundColor: '#dc3545', color: '#fff' },
    });
    navigate('/login');
    return false;
  }
  return true;
};

const DeleteUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // For confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

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

  // Trigger the confirmation modal (but don't delete yet)
  const handleDeleteClick = (user) => {
    // Verify token before opening modal
    if (!verifyToken(navigate)) return;
    setUserToDelete(user);
    setShowConfirmModal(true);
  };

  // Actually delete the user after confirmation
  const confirmDelete = async () => {
    if (!verifyToken(navigate)) return;
    if (!userToDelete) return;

    try {
      const response = await fetch(`http://localhost:3002/users/${userToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      toast.success('User deleted successfully!', {
        position: 'bottom-center',
        autoClose: 3000,
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user. Please try again.', {
        position: 'bottom-center',
        autoClose: 3000,
      });
    } finally {
      setShowConfirmModal(false);
      setUserToDelete(null);
    }
  };

  // Close the modal without deleting
  const cancelDelete = () => {
    setShowConfirmModal(false);
    setUserToDelete(null);
  };

  return (
    <div className="delete-users-container">
      <h1 className="delete-users-title">Delete Users</h1>

      {isLoading && <div className="loading-users">Loading users...</div>}
      {error && <div className="error-message">{error}</div>}
      {!isLoading && !error && users.length === 0 && (
        <div className="no-users-row">No users found.</div>
      )}

      {!isLoading && !error && users.length > 0 && (
        <div className="table-container">
          <div className="table-scroll">
            <table className="delete-users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Joined On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const joinedDate = user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : 'N/A';
                  return (
                    <tr key={user.id}>
                      <td>{user.name || 'N/A'}</td>
                      <td>{user.email || 'N/A'}</td>
                      <td>{user.user_name || 'N/A'}</td>
                      <td>{user.isAdmin ? 'Admin' : 'User'}</td>
                      <td>{joinedDate}</td>
                      <td>
                        <button
                          className="delete-user-btn"
                          onClick={() => handleDeleteClick(user)}
                        >
                          Delete
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
      {showConfirmModal && userToDelete && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-content">
            <h2>Confirm Deletion</h2>
            <p>
              Are you sure you want to delete <strong>{userToDelete.name}</strong>? <br />
              This action cannot be undone.
            </p>
            <div className="delete-modal-buttons">
              <button className="delete-confirm-btn" onClick={confirmDelete}>
                Delete
              </button>
              <button className="delete-cancel-btn" onClick={cancelDelete}>
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

export default DeleteUsers;
