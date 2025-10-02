import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilterContext } from '../context/FilterContext';
import '../Search.css';

function createSlug(title) {
  return title.replace(/\s+/g, '-').toLowerCase();
}

const Search = () => {
  const navigate = useNavigate();
  const { filters } = useContext(FilterContext);
  const [items, setItems] = useState([]);  // Combined movies and tv shows
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Function to filter items based on the filter context values
  const filterItems = (data) => {
    return data.filter(item => {
      let matches = true;
      // Check search term (if provided)
      if (filters.searchTerm && filters.searchTerm.trim() !== '') {
        matches =
          matches &&
          item.Title.toLowerCase().includes(filters.searchTerm.toLowerCase());
      }
      // Check Genre filter
      if (filters.selectedGenre !== 'All' && item.Genre) {
        matches =
          matches &&
          item.Genre.toLowerCase().includes(filters.selectedGenre.toLowerCase());
      }
      // Check Rating filter
      if (filters.selectedRating !== 'All' && item.Rated) {
        matches =
          matches &&
          item.Rated.toLowerCase() === filters.selectedRating.toLowerCase();
      }
      // Check Year filter
      if (filters.selectedYear !== 'All' && item.Year) {
        matches = matches && item.Year === filters.selectedYear;
      }
      // Check Language filter
      if (filters.selectedLanguage !== 'All' && item.Language) {
        matches =
          matches &&
          item.Language.toLowerCase().includes(filters.selectedLanguage.toLowerCase());
      }
      return matches;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch movies and tv shows concurrently
        const [moviesResp, tvResp] = await Promise.all([
          fetch('http://localhost:3002/movies'),
          fetch('http://localhost:3002/tv_shows')
        ]);
        const moviesData = await moviesResp.json();
        const tvData = await tvResp.json();
        // Combine both arrays
        const combinedData = [...moviesData, ...tvData];
        // Apply filtering
        const filtered = filterItems(combinedData);
        setItems(filtered);
        setCurrentPage(1); // Reset to first page when filters change
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  // Pagination calculations
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = items.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  // On card click, route to /movies/:slug or /tvshows/:slug
  const handleCardClick = (item) => {
    const slug = createSlug(item.Title);
    if (item.Type === 'movie') {
      navigate(`/movies/${slug}`);
    } else if (item.Type === 'series') {
      navigate(`/tvshows/${slug}`);
    }
  };

  return (
    <div className="search-results-container">
      {loading ? (
        <div className="search-loading">Loading search results...</div>
      ) : (
        <>
          {items.length > 0 ? (
            <>
              <div className="search-results-grid">
                {currentItems.map(item => (
                  <div
                    key={item.id}
                    className="search-result-card"
                    onClick={() => handleCardClick(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={item.Poster}
                      alt={item.Title}
                      className="search-result-img"
                    />
                    <div className="search-result-content">
                      <h3 className="search-result-title">
                        {item.Title && item.Title.length > 25
                          ? item.Title.substring(0, 25) + '...'
                          : item.Title}
                      </h3>
                      <div className="search-result-details">
                        <span className="search-result-year">{item.Year}</span>
                        {item.Type === 'movie' ? (
                          <span className="search-result-type">Movie</span>
                        ) : item.Type === 'series' ? (
                          <span className="search-result-type">TV Show</span>
                        ) : null}
                      </div>
                    </div>
                    {/* Overlay for glass effect and view text */}
                    <div className="card-overlay">
                      {item.Type === 'movie' ? 'View Movie' : 'View Show'}
                    </div>
                  </div>
                ))}
              </div>

              {items.length > itemsPerPage && (
                <div className="pagination">
                  <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                    &laquo;
                  </button>
                  <button onClick={handlePrevPage} disabled={currentPage === 1}>
                    &lsaquo;
                  </button>
                  <span className="current-page">{currentPage}</span>
                  <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                    &rsaquo;
                  </button>
                  <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                    &raquo;
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-results">No results found</div>
          )}
        </>
      )}
    </div>
  );
};

export default Search;
