// src/components/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilm } from '@fortawesome/free-solid-svg-icons';
import { SignJWT } from 'jose'; // Alternative JWT library
import bcrypt from 'bcryptjs';  // For comparing passwords
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';

const SECRET_KEY = 'your-secret-key'; // For demonstration only. Keep this secret on the server.

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Optionally, if a user is already logged in, you can redirect immediately
  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      navigate('/');
    }
  }, [navigate]);

  // Handle the login form submission
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // 1) Fetch all users from JSON-Server
      const response = await fetch('http://localhost:3002/users');
      if (!response.ok) {
        throw new Error(`Failed to fetch users from server: ${response.status}`);
      }
      const users = await response.json();

      // 2) Find a user that matches the email
      const foundUser = users.find(user => user.email === email);

      // 3) If user exists, compare the entered password with the stored hashed password using bcrypt
      if (foundUser && bcrypt.compareSync(password, foundUser.password)) {
        console.log('Login successful:', foundUser);
        
        // 4) Sign a JWT token with the user's name payload and 1h expiry using jose
        const token = await new SignJWT({ name: foundUser.name })
          .setProtectedHeader({ alg: 'HS256' })
          .setExpirationTime('1h')
          .sign(new TextEncoder().encode(SECRET_KEY));
        
        // 5) Store the user info and token in localStorage
        localStorage.setItem('loggedInUser', JSON.stringify(foundUser));
        localStorage.setItem('jwtToken', token);
        
        // Display a success toast
        toast.success(`Welcome back, ${foundUser.name.split(' ')[0]}!`, {
          position: 'bottom-center',
          autoClose: 3000,
        });
        
        // Redirect to home page after a short delay to let the toast display
        setTimeout(() => {
          navigate('/');
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
    <div className="login-container">
      <div className="login-box">
        {/* Header with icon + Mediaverse title */}
        <div className="login-header">
          <FontAwesomeIcon icon={faFilm} className="login-icon" />
          <h1 className="login-title">Mediaverse</h1>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin}>
          <label className="login-label">Email</label>
          <input
            type="text"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="login-label">Password</label>
          <input
            type="password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="login-button">
            Sign in
          </button>
        </form>

        <div className="new-to-mediaverse">
          <p>New to Mediaverse?</p>
          <Link to="/register" className="create-account-link">
            Create your Mediaverse Account
          </Link>
        </div>
      </div>
      {/* ToastContainer for displaying notifications */}
      <ToastContainer />
    </div>
  );
};

export default Login;
