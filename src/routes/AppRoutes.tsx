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
import SettingsPage from '../pages/Setting';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import VerifyOtp from '../pages/VerifyOtp';
import AdminDashboard from '../pages/AdminDashboard';
import UsersPage from '../pages/UserMAnagement';
import AdminReports from '../pages/AdminReports';
import AdminPostsPage from '../pages/AdminPostPage';
import AdminSettings from '../pages/AdminSettingPage';
import AdminAnalytics from '../pages/Analytics';

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
    <Route path='/setting' element={<SettingsPage />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/verify-otp" element={<VerifyOtp />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path='/admin-dashboard' element={<AdminDashboard />} />
    <Route path='/user-manage' element={<UsersPage />} />
    <Route path='/admin-report' element={<AdminReports />} />
    <Route path='admin-posts' element={<AdminPostsPage />} />
    <Route path='/admin-setting' element={<AdminSettings />} />
    <Route path='/anaytics' element={<AdminAnalytics />} />
  </Routes>
);

export default AppRoutes;
