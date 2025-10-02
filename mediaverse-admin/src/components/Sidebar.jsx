// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faFilm, faChevronRight, faUsers } from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const [contentOpen, setContentOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const toggleContentMenu = () => {
    verifyToken(); // Check token before toggling
    setContentOpen(!contentOpen);
  };

  const toggleUserMenu = () => {
    verifyToken(); // Check token before toggling
    setUserOpen(!userOpen);
  };

  // Helper: Check if a token is expired.
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // 'exp' is in seconds, so multiply by 1000 for comparison with Date.now()
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  };

  // Verify token; if invalid or expired, remove token & user and navigate to login.
  const verifyToken = () => {
    const token = localStorage.getItem('jwtToken');
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('loggedInUser');
      navigate('/login');
    }
  };

  return (
    <div className="sidebar">
      <ul className="sidebar-nav">
        {/* Dashboard Link */}
        <li>
          <NavLink 
            to="/dashboard"
            onClick={verifyToken}
            className={({ isActive }) => 
              isActive ? "sidebar-nav-link big-menu-item active" : "sidebar-nav-link big-menu-item"
            }
          >
            <span className="nav-icon">
              <FontAwesomeIcon icon={faTachometerAlt} className="icon-svg" />
            </span>
            <span>Dashboard</span>
          </NavLink>
        </li>

        {/* Mediaverse Management heading */}
        <li className="nav-heading">
          <span>Mediaverse Management</span>
        </li>

        {/* Content Management dropdown */}
        <li className="nav-item dropdown">
          <button
            className={`dropdown-btn big-menu-item ${contentOpen ? 'active' : ''}`}
            onClick={toggleContentMenu}
          >
            <span className="nav-icon">
              <FontAwesomeIcon icon={faFilm} className="icon-svg" />
            </span>
            <span className={contentOpen ? "active-text" : ""}>Content Management</span>
            <span className={`dropdown-caret ${contentOpen ? 'rotate' : ''}`}>
              <FontAwesomeIcon icon={faChevronRight} className="caret-icon" />
            </span>
          </button>

          {contentOpen && (
            <ul className="dropdown-menu">
              <li>
                <NavLink
                  to="/content-management/add"
                  onClick={verifyToken}
                  className={({ isActive }) =>
                    isActive ? "sidebar-sub-link active" : "sidebar-sub-link"
                  }
                >
                  <span>●</span> Add Movie / TV Show
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/content-management/edit"
                  onClick={verifyToken}
                  className={({ isActive }) =>
                    isActive ? "sidebar-sub-link active" : "sidebar-sub-link"
                  }
                >
                  <span>●</span> Edit Movie / TV Show
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/content-management/delete"
                  onClick={verifyToken}
                  className={({ isActive }) =>
                    isActive ? "sidebar-sub-link active" : "sidebar-sub-link"
                  }
                >
                  <span>●</span> Delete Movie / TV Show
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/content-management/review"
                  onClick={verifyToken}
                  className={({ isActive }) =>
                    isActive ? "sidebar-sub-link active" : "sidebar-sub-link"
                  }
                >
                  <span>●</span> Review Moderation
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/content-management/user-requested"
                  onClick={verifyToken}
                  className={({ isActive }) =>
                    isActive ? "sidebar-sub-link active" : "sidebar-sub-link"
                  }
                >
                  <span>●</span> User Requested Media
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* User Management dropdown */}
        <li className="nav-item dropdown">
          <button
            className={`dropdown-btn big-menu-item ${userOpen ? 'active' : ''}`}
            onClick={toggleUserMenu}
          >
            <span className="nav-icon">
              <FontAwesomeIcon icon={faUsers} className="icon-svg" />
            </span>
            <span className={userOpen ? "active-text" : ""}>User Management</span>
            <span className={`dropdown-caret ${userOpen ? 'rotate' : ''}`}>
              <FontAwesomeIcon icon={faChevronRight} className="caret-icon" />
            </span>
          </button>
          {userOpen && (
            <ul className="dropdown-menu">
              <li>
                <NavLink
                  to="/user-management/add-admin"
                  onClick={verifyToken}
                  className={({ isActive }) =>
                    isActive ? "sidebar-sub-link active" : "sidebar-sub-link"
                  }
                >
                  <span>●</span> Add Admin
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/user-management/view"
                  onClick={verifyToken}
                  className={({ isActive }) =>
                    isActive ? "sidebar-sub-link active" : "sidebar-sub-link"
                  }
                >
                  <span>●</span> View Users
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/user-management/edit"
                  onClick={verifyToken}
                  className={({ isActive }) =>
                    isActive ? "sidebar-sub-link active" : "sidebar-sub-link"
                  }
                >
                  <span>●</span> Edit Users
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/user-management/delete"
                  onClick={verifyToken}
                  className={({ isActive }) =>
                    isActive ? "sidebar-sub-link active" : "sidebar-sub-link"
                  }
                >
                  <span>●</span> Delete Users
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/user-management/roles"
                  onClick={verifyToken}
                  className={({ isActive }) =>
                    isActive ? "sidebar-sub-link active" : "sidebar-sub-link"
                  }
                >
                  <span>●</span> Change User Roles
                </NavLink>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
