// src/components/AdminNavbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faFilm } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import './AdminNavbar.css';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const [loggedInAdmin, setLoggedInAdmin] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Check localStorage for an admin user
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      if (userObj.isAdmin) {
        setLoggedInAdmin(userObj);
      } else {
        setLoggedInAdmin(null);
      }
    }
  }, []);

  const handleLogout = () => {
    // Show a toast notification
    toast.success('You have been logged out successfully!', {
      position: 'bottom-center',
      autoClose: 3000,
    });
    // Remove user data from localStorage and redirect after a short delay
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('jwtToken');
    setLoggedInAdmin(null);
    // Use a slight delay to allow the toast to be seen
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  // Toggle the user dropdown on click
  const handleUserIconClick = () => {
    setShowDropdown((prev) => !prev);
  };

  return (
    <header className="admin-header">
      {/* Left side: Brand header as h1 */}
      <div className="admin-header-left">
        <FontAwesomeIcon icon={faFilm} className="login-icon" />
        <h1 className="navbar-brand">Mediaverse</h1>
      </div>

      {/* Center: Admin Console heading */}
      <div className="admin-header-center">
        <h1 className="admin-console-title">Admin Console</h1>
      </div>

      {/* Right side: User icon with dropdown */}
      <div className="admin-header-right">
        <div className="admin-user-dropdown">
          <FontAwesomeIcon
            icon={faUserCircle}
            className="admin-user-icon"
            onClick={handleUserIconClick}
          />
          <div className={`admin-user-dropdown-content ${showDropdown ? 'show' : ''}`}>
            {loggedInAdmin ? (
              <button className="admin-dropdown-item logout-btn" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <Link to="/login" className="admin-dropdown-item login-btn">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
