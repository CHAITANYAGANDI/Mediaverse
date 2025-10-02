// src/components/AddMovieTvShow.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddMovieTvShow.css';

// Import Toastify
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddMovieTvShow = () => {
  const navigate = useNavigate();

  // Form data for adding new media
  const [formData, setFormData] = useState({
    type: 'movie',
    title: '',
    year: '',
    rated: '',
    releaseDate: '',
    runtime: '',
    genre: '',
    director: '',
    writer: '',
    actors: '',
    plot: '',
    language: '',
    country: '',
    poster: '',
    imdbRating: ''
  });

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

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission with token verification
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check token validity
    const token = localStorage.getItem('jwtToken');
    if (!token || isTokenExpired(token)) {
      toast.error("Session expired. Please log in again.", {
        position: "bottom-center",
        autoClose: 3000,
        style: { backgroundColor: "#dc3545", color: "#fff" }
      });
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('loggedInUser');
      navigate('/login');
      return;
    }

    // Build the new media object matching your JSON structure
    const newMedia = {
      id: Date.now().toString(), // Unique ID (or let backend auto-generate)
      media_type: formData.type,
      Title: formData.title,
      Year: formData.year,
      Rated: formData.rated,
      Released: formData.releaseDate, // Using "Released" field as in your JSON sample
      Runtime: formData.runtime,
      Genre: formData.genre,
      Director: formData.director,
      Writer: formData.writer,
      Actors: formData.actors,
      Plot: formData.plot,
      Language: formData.language,
      Country: formData.country,
      Poster: formData.poster,
      imdbRating: formData.imdbRating,
      addedBy: 'admin',
      createdAt: new Date().toISOString()
    };

    // Choose endpoint based on selected media type
    const endpoint =
      formData.type.toLowerCase() === 'movie'
        ? 'http://localhost:3002/movies'
        : 'http://localhost:3002/tv_shows';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMedia)
      });
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      toast.success('Your request has been submitted successfully!', {
        position: 'bottom-center',
        autoClose: 3000,
      });
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Error adding media:', error);
      toast.error('Failed to submit your request. Please try again.', {
        position: 'bottom-center',
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="add-media-container">
      <ToastContainer />

      <h1 className="add-media-title">Add Movie / TV Show</h1>
      <p className="add-media-description">
        Fill in the details below to request a new title.
      </p>

      <form className="add-media-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="type">Type of Media</label>
          <select name="type" id="type" value={formData.type} onChange={handleChange}>
            <option value="movie">Movie</option>
            <option value="tvshow">TV Show</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="year">Year</label>
          <input
            type="text"
            id="year"
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="rated">Rating</label>
          <input
            type="text"
            id="rated"
            name="rated"
            value={formData.rated}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="releaseDate">Release Date</label>
          <input
            type="text"
            id="releaseDate"
            name="releaseDate"
            value={formData.releaseDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="runtime">Runtime</label>
          <input
            type="text"
            id="runtime"
            name="runtime"
            value={formData.runtime}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="genre">Genre</label>
          <input
            type="text"
            id="genre"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="director">Director</label>
          <input
            type="text"
            id="director"
            name="director"
            value={formData.director}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="writer">Writer</label>
          <input
            type="text"
            id="writer"
            name="writer"
            value={formData.writer}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="actors">Actors (comma separated)</label>
          <input
            type="text"
            id="actors"
            name="actors"
            value={formData.actors}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="plot">Plot</label>
          <textarea
            id="plot"
            name="plot"
            value={formData.plot}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="language">Language</label>
          <input
            type="text"
            id="language"
            name="language"
            value={formData.language}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="country">Country</label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="poster">Poster URL</label>
          <input
            type="url"
            id="poster"
            name="poster"
            value={formData.poster}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="imdbRating">IMDb Rating</label>
          <input
            type="text"
            id="imdbRating"
            name="imdbRating"
            value={formData.imdbRating}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="add-media-submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddMovieTvShow;
