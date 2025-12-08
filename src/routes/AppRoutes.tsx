import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Events from '../pages/Events';
import WelcomePage from '../pages/Welcome.page';
import CreatePost from '../pages/CreateAPost';
import MessengerUI from '../pages/Message';
import ProfilePage from '../pages/ProfilePage';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<WelcomePage />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/events" element={<Events />} />
    <Route path='/create-post' element={<CreatePost />} />
    <Route path='/message' element={<MessengerUI />} />
    <Route path='/myprofile' element={<ProfilePage />} />
  </Routes>
);

export default AppRoutes;
