// src/components/AdminLogin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilm } from '@fortawesome/free-solid-svg-icons';
import { SignJWT } from 'jose'; // Alternative JWT library
import bcrypt from 'bcryptjs';  // For comparing passwords
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdminLogin.css';

const SECRET_KEY = 'your-secret-key'; // For demonstration only. Keep this secret on the server.

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // If an admin is already logged in, redirect immediately
  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      if (userObj.isAdmin) {
        navigate('/dashboard');
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Fetch all users from JSON‑server
      const response = await fetch('http://localhost:3002/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users from server');
      }
      const users = await response.json();

      // Find an admin user that matches the email
      const foundUser = users.find(
        (user) => user.email === email && user.isAdmin === true
      );

      // Compare the entered password with the stored hashed password
      if (foundUser && bcrypt.compareSync(password, foundUser.password)) {
        console.log('Login successful:', foundUser);

        // Sign a JWT token with the user's name payload and 1h expiry
        const token = await new SignJWT({ name: foundUser.name })
          .setProtectedHeader({ alg: 'HS256' })
          .setExpirationTime('1h')
          .sign(new TextEncoder().encode(SECRET_KEY));

        // Store user info and token in localStorage
        localStorage.setItem('loggedInUser', JSON.stringify(foundUser));
        localStorage.setItem('jwtToken', token);

        toast.success(`Welcome back, ${foundUser.name.split(' ')[0]}!`, {
          position: 'bottom-center',
          autoClose: 3000,
        });

        // Redirect to the dashboard after a short delay to allow the toast to display
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        toast.error('Invalid email or password', {
          position: 'bottom-center',
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Error logging in:', error);
      toast.error('There was a problem logging in. Please try again.', {
        position: 'bottom-center',
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        {/* Header with film icon + Admin Console title */}
        <div className="admin-login-header">
          <FontAwesomeIcon icon={faFilm} className="admin-login-icon" />
          <h1 className="admin-login-title">Admin Console</h1>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin}>
          <label className="admin-login-label">Email</label>
          <input
            type="text"
            className="admin-login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="admin-login-label">Password</label>
          <input
            type="password"
            className="admin-login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="admin-login-button">
            Sign in
          </button>
        </form>
      </div>
      {/* ToastContainer renders the toast notifications */}
      <ToastContainer />
    </div>
  );
};

export default AdminLogin;
