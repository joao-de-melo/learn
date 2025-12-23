import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './i18n';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Privacy from './pages/Privacy';
import TermsOfService from './pages/TermsOfService';
import Kids from './pages/Kids';
import KidProfile from './pages/KidProfile';
import Games from './pages/Games';
import CreateGame from './pages/CreateGame';
import GameDetail from './pages/GameDetail';
import Play from './pages/Play';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return user ? <Navigate to="/" /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/kids" element={<PrivateRoute><Kids /></PrivateRoute>} />
      <Route path="/kids/:id" element={<PrivateRoute><KidProfile /></PrivateRoute>} />
      <Route path="/games" element={<PrivateRoute><Games /></PrivateRoute>} />
      <Route path="/games/create" element={<PrivateRoute><CreateGame /></PrivateRoute>} />
      <Route path="/games/:id" element={<PrivateRoute><GameDetail /></PrivateRoute>} />
      <Route path="/play/:token" element={<Play />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <div className="app">
          <AppRoutes />
        </div>
      </LanguageProvider>
    </AuthProvider>
  );
}
