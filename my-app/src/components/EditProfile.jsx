import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './EditProfile.css';

// Default avatar image (SVG data URL)
const defaultAvatar = "data:image/svg+xml,%3Csvg width='512' height='512' viewBox='0 0 512 512' fill='%23ccc' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M256 256c70.7 0 128-57.3 128-128S326.7 0 256 0 128 57.3 128 128s57.3 128 128 128zm89.6 32h-11.2c-22 10.1-46.5 16-78.4 16s-56.4-5.9-78.4-16h-11.2C74.98 288 0 362.98 0 456v24c0 17.7 14.3 32 32 32h448c17.7 0 32-14.3 32-32v-24c0-93.02-74.98-168-166.4-168z'/%3E%3C/svg%3E";

// Helper function to check if a JWT token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // payload.exp is in seconds, so convert to milliseconds
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

const EditProfile = () => {
  const navigate = useNavigate();

  // Retrieve the logged-in user from localStorage.
  const storedUser = localStorage.getItem('loggedInUser');
  const user = storedUser ? JSON.parse(storedUser) : { user_name: '', bio: '', profile_image: '' };

  // Initialize state from the stored user (for editing)
  const [username, setUsername] = useState(user.user_name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [profileImage, setProfileImage] = useState(user.profile_image || '');
  const [previewImage, setPreviewImage] = useState(user.profile_image || '');

  // Helper function to verify the JWT token.
  // If the token is missing or expired, clear localStorage and navigate to login.
  const verifyToken = () => {
    const token = localStorage.getItem('jwtToken');
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('loggedInUser');
      toast.error("Session expired. Please log in again.", {
        position: "bottom-center",
        autoClose: 3000,
        style: {
          backgroundColor: "#dc3545", // Red for error
          color: "#fff",
        },
      });
      navigate('/login');
      return false;
    }
    return true;
  };

  // When a new image file is selected, check token then update the preview and state.
  const handleImageChange = (e) => {
    if (!verifyToken()) return; // Verify token before proceeding
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!verifyToken()) return; // Verify token before saving

    // Build the updated user object using the new key user_name
    const updatedUser = { ...user, user_name: username, bio: bio, profile_image: profileImage };

    try {
      // Send a PATCH request to update the user on the JSON‑server
      const resp = await fetch(`http://localhost:3002/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });
      if (!resp.ok) {
        throw new Error(`Failed to update user: ${resp.statusText}`);
      }
      const data = await resp.json();
      // Update localStorage with the new user data
      localStorage.setItem('loggedInUser', JSON.stringify(data));

      // Show success toast (green background)
      toast.success("Profile updated successfully!", {
        position: "bottom-center",
        autoClose: 3000,
        style: {
          backgroundColor: "#4BB543", // Green color
          color: "#fff",
        },
      });

      // Clear all form fields permanently
      setUsername('');
      setBio('');
      setProfileImage('');
      setPreviewImage('');

      // Navigate back to the account settings page so the Profile component shows the changes
      // (After the toast autoCloses, or immediately if you prefer.)
      setTimeout(() => {
        navigate('/account-settings');
      }, 3000);

    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("There was an error updating your profile.", {
        position: "bottom-center",
        autoClose: 3000,
        style: {
          backgroundColor: "#dc3545", // Red for error
          color: "#fff",
        },
      });
    }
  };

  return (
    <div className="edit-profile-container">
      <h1 className="edit-profile-title">Edit Profile</h1>
      <form className="edit-profile-form" onSubmit={handleSave}>
        <div className="profile-image-section">
          <div className="profile-image-preview">
            {previewImage ? (
              <img src={previewImage} alt="Profile Preview" />
            ) : (
              <div 
                className="profile-image-placeholder"
                style={{ backgroundImage: `url(${defaultAvatar})` }}
              ></div>
            )}
          </div>
          <input 
            type="file"
            accept="image/*"
            id="profileImageInput"
            className="profile-image-input"
            onChange={handleImageChange}
          />
          <label htmlFor="profileImageInput" className="upload-button">Upload Image</label>
        </div>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input 
            type="text"
            id="username"
            className="edit-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea 
            id="bio"
            className="edit-textarea"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          ></textarea>
        </div>
        <button type="submit" className="save-button">Save</button>
      </form>
      
      {/* ToastContainer for displaying toast notifications */}
      <ToastContainer
        closeOnClick
        pauseOnHover
      />
    </div>
  );
};

export default EditProfile;
