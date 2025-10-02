// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminNavbar from './components/AdminNavbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AddMovieTvShow from './components/AddMovieTvShow';
import EditMoviesTvShows from './components/EditMoviesTvShows';
import DeleteMoviesTvShows from './components/DeleteMoviesTvShows';
import RequestedMedia from './components/RequestedMedia';
import ReviewModeration from './components/ReviewModeration';
import AdminLogin from './components/AdminLogin';
import ViewUsers from './components/ViewUsers';
import EditUsers from './components/EditUsers';
import DeleteUsers from './components/DeleteUsers';
import ChangeUserRole from './components/ChangeUserRole';
import AddAdmin from './components/AddAdmin';
import './styles/AdminLayout.css';

// Read the logged in user synchronously
const storedUser = localStorage.getItem('loggedInUser');
const initialAdminStatus = storedUser ? JSON.parse(storedUser).isAdmin === true : false;

const App = () => {
  const [isLoggedInAdmin, setIsLoggedInAdmin] = useState(initialAdminStatus);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Toggles the sidebar open/closed
  const handleToggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <Router>
      <Routes>
        {/* Login route for admin */}
        <Route path="/login" element={<AdminLogin />} />

        {isLoggedInAdmin ? (
          <>
            <Route
              path="/dashboard"
              element={
                <div className="admin-layout">
                  <AdminNavbar onToggleSidebar={handleToggleSidebar} />
                  <div className="admin-main">
                    {isSidebarOpen && <Sidebar />}
                    <div className="admin-content">
                      <Dashboard />
                    </div>
                  </div>
                </div>
              }
            />

            <Route
              path="/content-management/add"
              element={
                <div className="admin-layout">
                  <AdminNavbar onToggleSidebar={handleToggleSidebar} />
                  <div className="admin-main">
                    {isSidebarOpen && <Sidebar />}
                    <div className="admin-content">
                      <AddMovieTvShow />
                    </div>
                  </div>
                </div>
              }
            />

            <Route
              path="/content-management/edit"
              element={
                <div className="admin-layout">
                  <AdminNavbar onToggleSidebar={handleToggleSidebar} />
                  <div className="admin-main">
                    {isSidebarOpen && <Sidebar />}
                    <div className="admin-content">
                      <EditMoviesTvShows />
                    </div>
                  </div>
                </div>
              }
            />

            <Route
              path="/content-management/delete"
              element={
                <div className="admin-layout">
                  <AdminNavbar onToggleSidebar={handleToggleSidebar} />
                  <div className="admin-main">
                    {isSidebarOpen && <Sidebar />}
                    <div className="admin-content">
                      <DeleteMoviesTvShows />
                    </div>
                  </div>
                </div>
              }
            />

            <Route
              path="/content-management/user-requested"
              element={
                <div className="admin-layout">
                  <AdminNavbar onToggleSidebar={handleToggleSidebar} />
                  <div className="admin-main">
                    {isSidebarOpen && <Sidebar />}
                    <div className="admin-content">
                      <RequestedMedia />
                    </div>
                  </div>
                </div>
              }
            />

            <Route
              path="/content-management/review"
              element={
                <div className="admin-layout">
                  <AdminNavbar onToggleSidebar={handleToggleSidebar} />
                  <div className="admin-main">
                    {isSidebarOpen && <Sidebar />}
                    <div className="admin-content">
                      <ReviewModeration />
                    </div>
                  </div>
                </div>
              }
            />

            <Route
              path="/user-management/view"
              element={
                <div className="admin-layout">
                  <AdminNavbar onToggleSidebar={handleToggleSidebar} />
                  <div className="admin-main">
                    {isSidebarOpen && <Sidebar />}
                    <div className="admin-content">
                      <ViewUsers />
                    </div>
                  </div>
                </div>
              }
            />

            <Route
              path="/user-management/edit"
              element={
                <div className="admin-layout">
                  <AdminNavbar onToggleSidebar={handleToggleSidebar} />
                  <div className="admin-main">
                    {isSidebarOpen && <Sidebar />}
                    <div className="admin-content">
                      <EditUsers />
                    </div>
                  </div>
                </div>
              }
            />

            <Route
              path="/user-management/delete"
              element={
                <div className="admin-layout">
                  <AdminNavbar onToggleSidebar={handleToggleSidebar} />
                  <div className="admin-main">
                    {isSidebarOpen && <Sidebar />}
                    <div className="admin-content">
                      <DeleteUsers />
                    </div>
                  </div>
                </div>
              }
            />

            <Route
              path="/user-management/roles"
              element={
                <div className="admin-layout">
                  <AdminNavbar onToggleSidebar={handleToggleSidebar} />
                  <div className="admin-main">
                    {isSidebarOpen && <Sidebar />}
                    <div className="admin-content">
                      <ChangeUserRole />
                    </div>
                  </div>
                </div>
              }
            />

            <Route
              path="/user-management/add-admin"
              element={
                <div className="admin-layout">
                  <AdminNavbar onToggleSidebar={handleToggleSidebar} />
                  <div className="admin-main">
                    {isSidebarOpen && <Sidebar />}
                    <div className="admin-content">
                      <AddAdmin />
                    </div>
                  </div>
                </div>
              }
            />

            {/* Redirect any unknown path to the dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
};

export default App;
