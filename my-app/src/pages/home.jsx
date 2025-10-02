// src/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../HomePage.css';
import UserIcon from '../Icon/UserIcon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

// Helper function to create a slug from a title
function createSlug(title) {
  if (!title) return '';
  return title.replace(/\s+/g, '-').toLowerCase();
}

const HomePage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]); // Combined movies + TV shows
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRatings, setUserRatings] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState(null);
  const [showAllMedia, setShowAllMedia] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Check login status
  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setIsLoggedIn(true);
        setCurrentUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('loggedInUser');
      }
    }
  }, []);

  // Fetch all media data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [moviesResp, showsResp] = await Promise.all([
          fetch('http://localhost:3002/movies'),
          fetch('http://localhost:3002/tv_shows')
        ]);
        const moviesData = await moviesResp.json();
        const showsData = await showsResp.json();

        // Combine them into a single array
        const combinedData = [...moviesData, ...showsData];
        setItems(combinedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch user ratings if user is logged in
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      const fetchRatings = async () => {
        setLoadingRecommendations(true);
        try {
          const response = await fetch('http://localhost:3002/user_ratings');
          if (!response.ok) {
            throw new Error('Failed to fetch user ratings');
          }
          const ratingsData = await response.json();
          setUserRatings(ratingsData);
        } catch (error) {
          console.error('Error fetching ratings:', error);
          setRecommendationsError(error.message);
        } finally {
          setLoadingRecommendations(false);
        }
      };

      fetchRatings();
    }
  }, [isLoggedIn, currentUser]);

  // Generate recommendations based on user ratings
  useEffect(() => {
    if (isLoggedIn && currentUser && userRatings.length > 0 && items.length > 0) {
      console.log("Generating recommendations...");
      try {
        const currentUserId = currentUser.id.toString();
        
        // Filter for ratings of 4 or 5 for the current user
        const highRatings = userRatings.filter(record => {
          const recordUserId = record.user_id ? record.user_id.toString() : '';
          const rating = Number(record.rating);
          return recordUserId === currentUserId && rating >= 4;
        });
        
        console.log("High ratings for current user:", highRatings);
        
        // Map the high ratings to the corresponding media items
        const recsMap = new Map();
        highRatings.forEach(record => {
          const movieId = record.movieId || record.media_id || record.movie_id;
          
          if (movieId) {
            const found = items.find(media => {
              const mediaId = media.id ? media.id.toString() : '';
              return mediaId === movieId.toString();
            });
            
            if (found) {
              recsMap.set(movieId, found);
            }
          }
        });
        
        // Limit recommendations to 10 items
        const newRecs = Array.from(recsMap.values()).slice(0, 10);
        console.log("Final recommended items:", newRecs);
        setRecommended(newRecs);
        
        // Show all media if there are no recommendations
        setShowAllMedia(newRecs.length === 0);
      } catch (error) {
        console.error("Error generating recommendations:", error);
        setShowAllMedia(true);
      }
    } else if (!isLoggedIn) {
      // If not logged in, show all media
      setShowAllMedia(true);
    }
  }, [isLoggedIn, currentUser, userRatings, items]);

  // Calculate total pages
  const totalPages = Math.ceil(items.length / itemsPerPage);

  // Determine which items to display on the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = items.slice(startIndex, startIndex + itemsPerPage);

  // Pagination handlers
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages);
  };

  // On card click, navigate to /movies/:slug or /tvshows/:slug
  const handleCardClick = (item) => {
    const type = (item.media_type || item.Type || '').toLowerCase();
    const title = item.title || item.Title || '';
    const slug = createSlug(title);
    if (type === 'movie') {
      navigate(`/movies/${slug}`);
    } else if (type === 'series' || type === 'tvshow') {
      navigate(`/tvshows/${slug}`);
    }
  };

  // Render welcome message for non-logged in users
  const renderWelcomeSection = () => {
    return (
      <div className="welcome-section">
        <h1>Welcome to Mediaverse</h1>
        <div className="welcome-content">
          <p>Your ultimate destination for discovering, tracking, and enjoying the best movies and TV shows from around the world.</p>
          
          <div className="features">
            <div className="feature">
              <h3>Personalized Recommendations</h3>
              <p>Get tailored suggestions based on your viewing history and ratings. The more you use Mediaverse, the better we understand your taste.</p>
            </div>
            
            <div className="feature">
              <h3>Extensive Library</h3>
              <p>Access our vast collection of movies and TV shows spanning all genres, eras, and countries. From Hollywood blockbusters to indie gems.</p>
            </div>
            
            <div className="feature">
              <h3>Track Your Watching</h3>
              <p>Create watchlists, mark favorites, and keep track of what you've already seen. Never lose track of your entertainment journey.</p>
            </div>
          </div>
          
          <div className="cta-buttons">
            <button onClick={() => navigate('/login')} className="primary-btn">Log In</button>
            <button onClick={() => navigate('/register')} className="secondary-btn">Sign Up</button>
          </div>
          
          <p className="welcome-footer">Join thousands of entertainment enthusiasts already enjoying the Mediaverse experience.</p>
        </div>
      </div>
    );
  };

  // Render recommendations section
  const renderRecommendationsSection = () => {
    if (loadingRecommendations) {
      return (
        <div className="recommended-section" style={{ marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '1.8rem',
            color: '#2c3e50',
            borderBottom: '2px solid #3498db',
            paddingBottom: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            Recommended For You
          </h2>
          <p>Loading recommendations...</p>
        </div>
      );
    }

    if (recommendationsError) {
      return (
        <div className="recommended-section" style={{ marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '1.8rem',
            color: '#2c3e50',
            borderBottom: '2px solid #3498db',
            paddingBottom: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            Recommended For You
          </h2>
          <p>Error loading recommendations: {recommendationsError}</p>
        </div>
      );
    }

    if (recommended.length === 0) {
      return null; // Will show all media instead
    }

    return (
      <div className="recommended-section" style={{ marginBottom: '2rem' }}>
        <h2 style={{
          fontSize: '1.8rem',
          color: '#2c3e50',
          borderBottom: '2px solid #3498db',
          paddingBottom: '0.5rem',
          marginBottom: '1.5rem'
        }}>
          Recommended For You
        </h2>
        <div className="card-grid">
          {recommended.map(item => (
            <div 
              className="card" 
              key={item.id || Math.random().toString()}
              onClick={() => handleCardClick(item)}
              style={{ cursor: 'pointer' }}
            >
              <img 
                src={item.Poster || item.poster || '/default-poster.jpg'} 
                alt={item.Title || item.title || 'Movie poster'}
                className="card-img" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-poster.jpg';
                }}
              />
              <div className="card-content">
                <h3 className="card-title">
                  {(() => {
                    const title = item.Title || item.title || 'Untitled';
                    return title.length > 25 ? title.substring(0, 25) + '...' : title;
                  })()}
                </h3>
                <div className="card-details">
                  {item.Year || item.year ? <span>{item.Year || item.year}</span> : null}
                  {((item.Type || item.media_type)?.toLowerCase() === 'movie') && (
                    <span className="card-type">Movie</span>
                  )}
                  {(((item.Type || item.media_type)?.toLowerCase() === 'series') ||
                    ((item.Type || item.media_type)?.toLowerCase() === 'tvshow')) && (
                    <span className="card-type">TV Show</span>
                  )}
                </div>
              </div>
              <div className="card-overlay" onClick={(e) => {
                e.stopPropagation();
                handleCardClick(item);
              }}>
                {(() => {
                  const type = (item.Type || item.media_type || '').toLowerCase();
                  return type === 'movie' ? 'View Movie' : 'View Show';
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render all media section
  const renderAllMediaSection = () => {
    return (
      <>
        <h2 style={{
          fontSize: '1.8rem',
          color: '#2c3e50',
          borderBottom: '2px solid #3498db',
          paddingBottom: '0.5rem',
          marginBottom: '1.5rem'
        }}>
          {isLoggedIn ? "Explore All" : "Featured Content"}
        </h2>
        <div className="card-grid">
          {currentItems.map((item) => (
            <div
              className="card"
              key={item.id}
              onClick={() => handleCardClick(item)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={item.Poster || item.poster || '/default-poster.jpg'}
                alt={item.Title || item.title || 'Movie poster'}
                className="card-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-poster.jpg';
                }}
              />
              <div className="card-content">
                <h3 className="card-title">
                  {(() => {
                    const title = item.Title || item.title || 'Untitled';
                    return title.length > 25 ? title.substring(0, 25) + '...' : title;
                  })()}
                </h3>
                <div className="card-details">
                  {item.Year || item.year ? <span>{item.Year || item.year}</span> : null}
                  {((item.Type || item.media_type)?.toLowerCase() === 'movie') && (
                    <span className="card-type">Movie</span>
                  )}
                  {(((item.Type || item.media_type)?.toLowerCase() === 'series') ||
                    ((item.Type || item.media_type)?.toLowerCase() === 'tvshow')) && (
                    <span className="card-type">TV Show</span>
                  )}
                </div>
              </div>
              <div className="card-overlay" onClick={(e) => {
                e.stopPropagation();
                handleCardClick(item);
              }}>
                {(() => {
                  const type = (item.Type || item.media_type || '').toLowerCase();
                  return type === 'movie' ? 'View Movie' : 'View Show';
                })()}
              </div>
            </div>
          ))}
        </div>

        {items.length > itemsPerPage && (
          <div className="pagination">
            <button onClick={handleFirstPage} disabled={currentPage === 1}>
              &laquo;
            </button>
            <button onClick={handlePrevPage} disabled={currentPage === 1}>
              &lsaquo;
            </button>
            <span className="current-page">{currentPage}</span>
            <button onClick={handleNextPage} disabled={currentPage === totalPages}>
              &rsaquo;
            </button>
            <button onClick={handleLastPage} disabled={currentPage === totalPages}>
              &raquo;
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="home-container">
      <main className="main">
        {loading ? (
          <p>Loading content...</p>
        ) : (
          <>
            {!isLoggedIn ? (
              // Welcome section for non-logged in users
              renderWelcomeSection()
            ) : (
              // Recommendations section for logged in users
              <>
                {renderRecommendationsSection()}
                
                {(showAllMedia || recommended.length === 0) && renderAllMediaSection()}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default HomePage;