import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import './AdminDashboard.css'; // Your custom CSS for admin dashboard

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Check if user is an admin before rendering the dashboard.
  // (Assuming the logged-in user has a `role` property.)
  const storedUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  if (!storedUser || storedUser.role !== 'admin') {
    toast.error('Access denied. Admins only.', {
      position: 'bottom-center',
      autoClose: 3000,
      style: { backgroundColor: '#dc3545', color: '#fff' },
    });
    navigate('/login');
    return null;
  }

  return (
    <div className="admin-dashboard-container">
      <h1>Admin Dashboard</h1>
      <p>Manage Movies/TV Shows, Users, and Metadata</p>

      <div className="admin-dashboard-options">
        <button
          className="admin-btn"
          onClick={() => navigate('/admin/movies')}
        >
          Manage Movies/TV Shows
        </button>
        <button
          className="admin-btn"
          onClick={() => navigate('/admin/users')}
        >
          Manage User Accounts
        </button>
        <button
          className="admin-btn"
          onClick={() => navigate('/admin/metadata')}
        >
          Manage Metadata
        </button>
        <button
          className="admin-btn"
          onClick={() => navigate('/admin/user-roles')}
        >
          Change User Roles
        </button>
      </div>

      <ToastContainer closeOnClick pauseOnHover />
    </div>
  );
};

export default AdminDashboard;
