import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddMedia.css';

// 1) Import Toastify
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Helper function to check if a JWT token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // The exp field is in seconds; convert to milliseconds
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

const AddMedia = () => {
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

  // 2) Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 3) Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check JWT token before submission
    const token = localStorage.getItem('jwtToken');
    if (isTokenExpired(token)) {
      toast.error('Your session has expired. Please log in again.', {
        position: 'bottom-center',
        autoClose: 3000,
      });
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('loggedInUser');
      navigate('/login');
      return;
    }

    // Check if user is logged in
    const storedUserString = localStorage.getItem('loggedInUser');
    if (!storedUserString) {
      toast.warn('Please log in to request media.', {
        position: 'bottom-center',
        autoClose: 3000,
      });
      navigate('/login');
      return;
    }
    const userObj = JSON.parse(storedUserString);
    const userId = userObj.id;

    // Build the new media object
    const newMedia = {
      id: Date.now().toString(), // or let JSON‑server auto-generate
      user_id: userId,
      media_type: formData.type,
      title: formData.title,
      year: formData.year,
      Rating: formData.rated,
      'Release Date': formData.releaseDate,
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
      request_status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      const response = await fetch('http://localhost:3002/user_requested_media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMedia)
      });
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      // If successful:
      toast.success('Your request has been submitted successfully!', {
        position: 'bottom-center',
        autoClose: 3000,
      });
      // Optionally wait a bit or navigate immediately
      setTimeout(() => {
        navigate('/requested-media');
      }, 1000);
    } catch (error) {
      console.error('Error adding requested media:', error);
      toast.error('Failed to submit your request. Please try again.', {
        position: 'bottom-center',
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="add-media-container">
      {/* 4) Include ToastContainer somewhere in your component tree.
             You can also place it once at the root (e.g., App.jsx). */}
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
            type="date"
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
          <label htmlFor="actors">Actors</label>
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

export default AddMedia;
