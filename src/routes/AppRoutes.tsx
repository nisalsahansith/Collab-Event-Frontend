import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Events from '../pages/Events';
import WelcomePage from '../pages/Welcome.page';
import CreatePost from '../pages/CreateAPost';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<WelcomePage />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/events" element={<Events />} />
    <Route path='/create-post' element={<CreatePost />} />
  </Routes>
);

export default AppRoutes;
