// src/pages/ViewUsers.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ViewUsers.css';

const ViewUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to check token expiration
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // 'exp' is in seconds; multiply by 1000 for comparison with Date.now()
      return payload.exp * 1000 < Date.now();
    } catch (err) {
      console.error('Error decoding token:', err);
      return true;
    }
  };

  // Verify token before proceeding
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('loggedInUser');
      navigate('/login');
    }
  }, [navigate]);

  // Fetch users only if token is valid
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

  return (
    <div className="view-users-container">
      <h1 className="view-users-title">All Existing Users</h1>

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

      {!isLoading && !error && (
        <div className="table-container">
          <div className="table-scroll">
            <table className="view-users-table">
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
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="no-users-row">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
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
    </div>
  );
};

export default ViewUsers;
