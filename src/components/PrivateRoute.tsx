import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  const isAuthenticated = localStorage.getItem('username') && localStorage.getItem('password');

  return isAuthenticated ? children : <Navigate to="/api/auth/login" />;
}

export default PrivateRoute;