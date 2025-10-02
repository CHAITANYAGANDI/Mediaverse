// src/components/EditUsers.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './EditUsers.css';

/* Helper to check if token is expired */
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

/* Helper to verify token; if missing/expired, log out and redirect */
const verifyToken = (navigate) => {
  const token = localStorage.getItem('jwtToken');
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('loggedInUser');
    navigate('/login');
    return false;
  }
  return true;
};

/* Generic function to wrap any action that requires token verification */
const handleActionWithTokenCheck = (navigate, actionCallback) => {
  if (verifyToken(navigate)) {
    actionCallback();
  }
};

const EditUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // For modal
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

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

  // Open modal with a copy of the user data, after verifying token
  const handleEditUser = (user) => {
    handleActionWithTokenCheck(navigate, () => {
      setEditingUser({ ...user });
      setShowModal(true);
    });
  };

  // Close modal without saving
  const handleCloseModal = () => {
    handleActionWithTokenCheck(navigate, () => {
      setEditingUser(null);
      setShowModal(false);
    });
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save changes: PATCH request to JSON‑Server (with token verification)
  const handleSave = async (e) => {
    e.preventDefault();
    handleActionWithTokenCheck(navigate, async () => {
      if (!editingUser) return;
      try {
        const response = await fetch(`http://localhost:3002/users/${editingUser.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // Only update the fields we allow to be changed
            name: editingUser.name,
            email: editingUser.email,
            user_name: editingUser.user_name,
            bio: editingUser.bio,
            gender: editingUser.gender,
            dob: editingUser.dob,
            country: editingUser.country,
          }),
        });
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }
        const updatedUser = await response.json();

        // Update local state with the new user data
        setUsers((prev) =>
          prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
        );

        toast.success('User updated successfully!', {
          position: 'bottom-center',
          autoClose: 3000,
        });
        setEditingUser(null);
        setShowModal(false);
      } catch (err) {
        console.error('Error updating user:', err);
        toast.error('Failed to update user. Please try again.', {
          position: 'bottom-center',
          autoClose: 3000,
        });
      }
    });
  };

  return (
    <div className="edit-users-container">
      <h1 className="edit-users-title">Edit Users</h1>

      {isLoading && (
        <div className="loading-users">
          <p>Loading users...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Table of users */}
      {!isLoading && !error && (
        <div className="table-container">
          <div className="table-scroll">
            <table className="edit-users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Username</th>
                  <th>Bio</th>
                  <th>Gender</th>
                  <th>Date of Birth</th>
                  <th>Country</th>
                  <th>Role</th>
                  <th>Joined On</th>
                  <th></th> {/* for Edit button column */}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="no-users-row">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => {
                    const joinedDate = user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : 'N/A';

                    return (
                      <tr key={user.id}>
                        <td>{user.name || 'N/A'}</td>
                        <td>{user.email || 'N/A'}</td>
                        <td>{user.user_name || 'N/A'}</td>
                        <td className="bio-cell">{user.bio || 'N/A'}</td>
                        <td>{user.gender || 'N/A'}</td>
                        <td>{user.dob || 'N/A'}</td>
                        <td>{user.country || 'N/A'}</td>
                        <td>
                          <span
                            className={`role-badge ${
                              user.isAdmin ? 'admin-badge' : 'user-badge'
                            }`}
                          >
                            {user.isAdmin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td>{joinedDate}</td>
                        <td>
                          <button
                            className="edit-user-btn"
                            onClick={() => handleEditUser(user)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            Total Users: {users.length}
          </div>
        </div>
      )}

      {/* Modal for editing user details */}
      {showModal && editingUser && (
        <div className="edit-modal-overlay" onClick={handleCloseModal}>
          <div
            className="edit-modal-content"
            onClick={(e) => e.stopPropagation()} /* prevent overlay close */
          >
            <h2>Edit User</h2>
            <form className="edit-modal-form" onSubmit={handleSave}>
              {/* Name */}
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={editingUser.name || ''}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={editingUser.email || ''}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Username */}
              <div className="form-group">
                <label htmlFor="user_name">Username</label>
                <input
                  id="user_name"
                  name="user_name"
                  type="text"
                  value={editingUser.user_name || ''}
                  onChange={handleChange}
                />
              </div>

              {/* Bio */}
              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="2"
                  value={editingUser.bio || ''}
                  onChange={handleChange}
                />
              </div>

              {/* Gender */}
              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <input
                  id="gender"
                  name="gender"
                  type="text"
                  value={editingUser.gender || ''}
                  onChange={handleChange}
                />
              </div>

              {/* Date of Birth */}
              <div className="form-group">
                <label htmlFor="dob">Date of Birth</label>
                <input
                  id="dob"
                  name="dob"
                  type="text"
                  value={editingUser.dob || ''}
                  onChange={handleChange}
                />
              </div>

              {/* Country */}
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  id="country"
                  name="country"
                  type="text"
                  value={editingUser.country || ''}
                  onChange={handleChange}
                />
              </div>

              {/* Modal buttons */}
              <div className="edit-modal-buttons">
                <button type="button" className="cancel-edit-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="save-edit-btn">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer closeOnClick pauseOnHover />
    </div>
  );
};

export default EditUsers;
