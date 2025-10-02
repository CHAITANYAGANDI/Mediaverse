// src/components/AddAdmin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs'; // For hashing the password
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AddAdmin.css';

// Helper function to check if token is expired
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

const AddAdmin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    user_name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Update form data on input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit form with token expiry check and toast notifications
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.name.trim() ||
      !formData.user_name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      setError('Please fill in all fields.');
      return;
    }

    // Check token validity before submitting
    const token = localStorage.getItem('jwtToken');
    if (!token || isTokenExpired(token)) {
      toast.error("Session expired. Please log in again.", {
        position: "bottom-center",
        autoClose: 3000,
        style: { backgroundColor: "#dc3545", color: "#fff" },
      });
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('loggedInUser');
      navigate('/login');
      return;
    }

    // Hash the password using bcryptjs
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(formData.password, saltRounds);

    // Build the new admin user object
    const newAdmin = {
      name: formData.name.trim(),
      user_name: formData.user_name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: hashedPassword,
      isAdmin: true,
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch('http://localhost:3002/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      setError(null);
      toast.success("New admin added successfully!", {
        position: "bottom-center",
        autoClose: 3000,
        style: {  marginLeft:"17rem" },
      });
      // Optionally, navigate to view users after a short delay:
      setTimeout(() => {
        navigate('/user-management/view');
      }, 1000);
    } catch (err) {
      console.error('Error adding admin:', err);
      setError('Failed to add admin. Please try again.');
      toast.error("Failed to add admin. Please try again.", {
        position: "bottom-center",
        autoClose: 3000,
        style: { backgroundColor: "#dc3545", color: "#fff" },
      });
    }
  };

  return (
    <div className="add-admin-container">
      <ToastContainer closeOnClick pauseOnHover />
      <h1 className="add-admin-title">Add Admin</h1>
      {error && <div className="add-admin-error">{error}</div>}
      {successMessage && <div className="add-admin-success">{successMessage}</div>}
      <form className="add-admin-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
          />
        </div>
        <div className="form-group">
          <label>User Name</label>
          <input
            type="text"
            name="user_name"
            value={formData.user_name}
            onChange={handleChange}
            placeholder="Preferred username"
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="admin@example.com"
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Choose a secure password"
          />
        </div>
        <button type="submit" className="add-admin-btn">
          Add Admin
        </button>
      </form>
    </div>
  );
};

export default AddAdmin;
