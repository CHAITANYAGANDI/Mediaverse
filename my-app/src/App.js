import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FilterProvider } from './context/FilterContext';
import Navbar from './components/navbar';
import HomePage from './pages/home';
import MoviesPage from './pages/movies';

import TVShowsPage from './pages/series';

import Detail from './pages/MovieDetails';


import Search from './pages/search'; // Import your Search component
import WatchListPage from './components/watchlist';

import Login from './components/Login';
import Register from './pages/registration';
import WatchHistory from './pages/watchhistory';
import AddMedia from './pages/AddMedia';
import PreferredList from './components/PreferredList';
import AccountSettings from './pages/AccountSettings';
import EditProfile from './components/EditProfile';
import Profile from './components/Profile';
import LoginSecurity from './pages/LoginSecurity';
import ChangeName from './components/ChangeName';
import ChangeEmail from './components/ChangeEmail';
import ChangePassword from './components/ChangePassword';
import PersonalInfo from './pages/PersonalInfo';
import RequestedMedia from './pages/RequestedMedia';
import Notifications from './components/Notifications'

const App = () => {
  return (
    <FilterProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MoviesPage />} />

          <Route path="/tvshows" element={<TVShowsPage />} />

          <Route path="/movies/:slug" element={<Detail />} />

          <Route path="/tvshows/:slug" element={<Detail />} />

          <Route path="/search/:searchTerm?/:filters?" element={<Search />} />

          <Route path="/watchlist" element={<WatchListPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="/watch-history" element={<WatchHistory />} />
          <Route path="/add-media" element={<AddMedia />} />
          <Route path="/requested-media" element={<RequestedMedia />} />
          <Route path="/preferred" element={<PreferredList />} />



          <Route path="/account-settings" element={<AccountSettings />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/login-security" element={<LoginSecurity />} />
          <Route path="/change-name" element={<ChangeName />} />
          <Route path="/change-email" element={<ChangeEmail />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/personal-info" element={<PersonalInfo />} />
          <Route path="/notifications" element={<Notifications />} />

        </Routes>
      </Router>
    </FilterProvider>
  );
};

export default App;
