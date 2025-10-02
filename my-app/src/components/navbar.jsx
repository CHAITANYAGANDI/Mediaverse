import React, { useEffect, useState, useRef, useContext } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilm, faSearch, faBookmark, faBell } from '@fortawesome/free-solid-svg-icons';
import UserIcon from '../Icon/UserIcon';
import { FilterContext } from '../context/FilterContext';
import './Navbar.css';

const Navbar = () => {
  const { updateFilters } = useContext(FilterContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedRating, setSelectedRating] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');

  // State for logged in user
  const [loggedInUser, setLoggedInUser] = useState(null);

  const searchPanelRef = useRef(null);
  const searchIconRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setLoggedInUser(JSON.parse(storedUser));
    } else {
      setLoggedInUser(null);
    }
  }, [location]);

  useEffect(() => {
    // Listen for scroll events to add/remove "scrolled" class
    const handleScroll = () => {
      const header = document.querySelector('.header');
      if (window.scrollY > 0) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide search panel if click happens outside of it or the search icon
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchPanelRef.current &&
        !searchPanelRef.current.contains(event.target) &&
        searchIconRef.current &&
        !searchIconRef.current.contains(event.target)
      ) {
        setShowSearchPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchClick = (e) => {
    e.preventDefault();
    setShowSearchPanel((prev) => !prev);
  };

  const handleSearchSubmit = () => {
    // Update context with filter values
    updateFilters({
      searchTerm,
      selectedGenre,
      selectedRating,
      selectedYear,
      selectedLanguage,
    });
    setShowSearchPanel(false);

    const filtersArray = [];
    if (selectedGenre !== 'All') filtersArray.push(`genre=${selectedGenre}`);
    if (selectedRating !== 'All') filtersArray.push(`rating=${selectedRating}`);
    if (selectedYear !== 'All') filtersArray.push(`year=${selectedYear}`);
    if (selectedLanguage !== 'All') filtersArray.push(`language=${selectedLanguage}`);
    const filtersString = filtersArray.join('_');

    // Determine search term; if empty, use 'all'
    const term = searchTerm.trim() !== '' ? searchTerm.trim() : 'all';

    // Construct the route based on whether filters are applied
    const route = filtersString ? `/search/${term}/${filtersString}` : `/search/${term}`;

    // Navigate to the search route
    navigate(route);

    // Clear the search bar and reset filters
    setSearchTerm('');
    setSelectedGenre('All');
    setSelectedRating('All');
    setSelectedYear('All');
    setSelectedLanguage('All');
  };

  // Function to verify if the token is expired.
  // If expired or missing, logs out the user and navigates to the login page.
  const verifyToken = (e) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          e.preventDefault();
          localStorage.removeItem('jwtToken');
          localStorage.removeItem('loggedInUser');
          navigate('/login');
        }
      } catch (err) {
        console.error("Error verifying token:", err);
        e.preventDefault();
        navigate('/login');
      }
    } else {
      e.preventDefault();
      navigate('/login');
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <FontAwesomeIcon icon={faFilm} className="login-icon" />
          <NavLink to="/" className="login-title" style={{ textDecoration: 'none', color: 'inherit' }}>
            Mediaverse
          </NavLink>
        </div>

        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Home
        </NavLink>
        <NavLink to="/movies" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Movies
        </NavLink>
        <NavLink to="/tvshows" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          TV Shows
        </NavLink>
      </div>

      <div className="header-right">
        {/* Search icon toggles the search panel */}
        <Link
          ref={searchIconRef}
          className="nav-link icon-button"
          to="#"
          onClick={handleSearchClick}
        >
          <FontAwesomeIcon icon={faSearch} />
        </Link>

        {/* Watchlist icon + text */}
        <Link
          className="nav-link icon-button watchlist-link"
          to="/watchlist"
          onClick={verifyToken}
        >
          <FontAwesomeIcon icon={faBookmark} className="watchlist-icon" />
          <span className="watchlist-text">Watchlist</span>
        </Link>

        {/* Bell icon (notifications) */}
        <Link
          className="nav-link icon-button bell-link"
          to="/notifications"
          onClick={verifyToken}
        >
          <FontAwesomeIcon icon={faBell} className="bell-icon" />
        </Link>

        {loggedInUser ? (
          <div className="dropdown user-dropdown" style={{ width: '40px', height: '40px' }}>
            <div className="user-profile">
              <UserIcon width={40} height={40} />
            </div>
            <div className="dropdown-content">
              <Link className="dropdown-item" to="/profile" onClick={verifyToken}>
                Your Profile
              </Link>
              <Link className="dropdown-item" to="/add-media" onClick={verifyToken}>
                Add Movie / TV Show
              </Link>
              <Link className="dropdown-item" to="/watch-history" onClick={verifyToken}>
                Watch History
              </Link>
              <Link className="dropdown-item" to="/preferred" onClick={verifyToken}>
                Preferred List
              </Link>
              <Link className="dropdown-item" to="/account-settings" onClick={verifyToken}>
                Account Settings
              </Link>
              <button
                className="dropdown-item logout-btn"
                onClick={() => {
                  localStorage.removeItem('loggedInUser');
                  localStorage.removeItem('jwtToken');
                  setLoggedInUser(null);
                  navigate('/login');
                }}
              >
                Log out
              </button>
            </div>
          </div>
        ) : (
          <div className="dropdown" style={{ width: '40px', height: '40px' }}>
            <UserIcon width={40} height={40} />
            <div className="dropdown-content">
              <Link className="dropdown-item" to="/login">
                Login
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Render search panel if toggled */}
      {showSearchPanel && (
        <div ref={searchPanelRef} className="search-panel">
          <div className="search-bar">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="Search..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-row">
            <div className="filter">
              <label>Genre:</label>
              <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
                <option value="All">All</option>
                <option value="Action">Action</option>
                <option value="Drama">Drama</option>
                <option value="Comedy">Comedy</option>
              </select>
            </div>
            <div className="filter">
              <label>Rating:</label>
              <select value={selectedRating} onChange={(e) => setSelectedRating(e.target.value)}>
                <option value="All">All</option>
                <option value="G">G</option>
                <option value="PG">PG</option>
                <option value="PG-13">PG-13</option>
                <option value="R">R</option>
              </select>
            </div>
            <div className="filter">
              <label>Year:</label>
              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                <option value="All">All</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
              </select>
            </div>
            <div className="filter">
              <label>Language:</label>
              <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
                <option value="All">All</option>
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
            </div>
          </div>

          <div className="search-button-row">
            <button className="search-btn" onClick={handleSearchSubmit}>Search</button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
