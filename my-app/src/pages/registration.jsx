// src/components/Registration.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilm } from '@fortawesome/free-solid-svg-icons';
import bcrypt from 'bcryptjs'; // Import bcryptjs
import './registration.css';

const Registration = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail]  = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    // Basic checks
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    // Hash the password using bcryptjs (using 10 salt rounds)
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    // Build user object with hashed password, createdAt date, and isAdmin:false
    const newUser = {
      name,
      email,
      password: hashedPassword,
      isAdmin: false,
      createdAt: new Date().toISOString()
    };

    try {
      // POST request to JSON‑Server
      const response = await fetch('http://localhost:3002/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const createdUser = await response.json();
      console.log('User created:', createdUser);

      // Navigate to login page after successful registration
      navigate('/login');
    } catch (error) {
      console.error('Error creating user:', error);
      alert('There was a problem creating your account. Please try again.');
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-box">
        {/* Header with Mediaverse icon + text */}
        <div className="registration-header">
          <FontAwesomeIcon icon={faFilm} className="registration-icon" />
          <h1 className="registration-title">Mediaverse</h1>
        </div>

        {/* Create Account heading */}
        <h2 className="create-account-heading">Create Account</h2>

        {/* Registration form */}
        <form onSubmit={handleRegister}>
          <label className="registration-label">Your name</label>
          <input
            type="text"
            className="registration-input"
            placeholder="First and last name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label className="registration-label">Email</label>
          <input
            type="email"
            className="registration-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="registration-label">Password</label>
          <input
            type="password"
            className="registration-input"
            placeholder="at least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p className="password-note">Passwords must be at least 8 characters.</p>

          <label className="registration-label">Re-enter password</label>
          <input
            type="password"
            className="registration-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" className="registration-button">
            Create your Mediaverse account
          </button>
        </form>

        <div className="already-have-account">
          <p>Already have an account?</p>
          <Link to="/login" className="signin-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Registration;
