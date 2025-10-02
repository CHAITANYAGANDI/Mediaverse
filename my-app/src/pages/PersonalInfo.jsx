import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify'; // Import toastify
import 'react-toastify/dist/ReactToastify.css';
import './PersonalInfo.css';

// Helper function to check if a JWT token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    // Decode the token payload (assumes JWT format)
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Check if the token has expired (exp is in seconds)
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

const PersonalInfo = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('');
  const [country, setCountry] = useState('United States');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load user data from localStorage and fetch full data from JSON‑Server
    const storedUserString = localStorage.getItem('loggedInUser');
    if (!storedUserString) {
      setError('No logged-in user found.');
      setLoading(false);
      return;
    }
    const storedUser = JSON.parse(storedUserString);
    if (!storedUser.id) {
      setError('Logged-in user has no ID.');
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const resp = await fetch(`http://localhost:3002/users/${storedUser.id}`);
        if (!resp.ok) {
          throw new Error(`Server returned ${resp.status}`);
        }
        const data = await resp.json();
        setUser(data);
        // Initialize form fields from user data (if available)
        if (data.gender) setGender(data.gender);
        if (data.dob) setDob(data.dob);
        if (data.country) setCountry(data.country);
      } catch (err) {
        console.error(err);
        setError('Error fetching user data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setError('');

    // Token verification: check if token exists and is valid
    const token = localStorage.getItem('jwtToken');
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('loggedInUser');
      toast.error("Session expired. Please log in again.", {
        position: "bottom-center",
        autoClose: 3000,
        style: { backgroundColor: "#dc3545", color: "#fff" },
      });
      navigate('/login');
      return;
    }

    if (!user) {
      setError('No user data loaded.');
      toast.error("No user data loaded.", {
        position: "bottom-center",
        autoClose: 3000,
        style: { backgroundColor: "#dc3545", color: "#fff" },
      });
      return;
    }

    try {
      const resp = await fetch(`http://localhost:3002/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gender,
          dob,
          country,
        }),
      });
      if (!resp.ok) {
        throw new Error(`Server returned ${resp.status}`);
      }
      const updatedUser = await resp.json();
      localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));

      // Show success toast and navigate after auto-close
      toast.success("Personal Information updated successfully!", {
        position: "bottom-center",
        autoClose: 3000,
        style: { backgroundColor: "#4BB543", color: "#fff" },
      });
      setTimeout(() => {
        navigate('/account-settings');
      }, 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to update personal information. Please try again.');
      toast.error("Failed to update personal information. Please try again.", {
        position: "bottom-center",
        autoClose: 3000,
        style: { backgroundColor: "#dc3545", color: "#fff" },
      });
    }
  };

  if (loading) {
    return <div className="personal-info-container">Loading user data...</div>;
  }
  if (error) {
    return <div className="personal-info-container error-message">{error}</div>;
  }
  if (!user) {
    return <div className="personal-info-container">No user data found.</div>;
  }

  return (
    <div className="personal-info-container">
      <h1 className="personal-info-title">Change your Personal Information</h1>
      <form className="personal-info-form" onSubmit={handleSaveChanges}>
        <div className="form-group">
          <label htmlFor="gender">Gender:</label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            {/* Additional options if needed */}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="dob">Date of Birth:</label>
          <input
            type="date"
            id="dob"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="country">Country/Region of Residence:</label>
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Australia">Australia</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <button type="submit" className="save-personal-info-btn">
          Submit
        </button>
      </form>
      {/* ToastContainer renders toast notifications */}
      <ToastContainer closeOnClick pauseOnHover />
    </div>
  );
};

export default PersonalInfo;
