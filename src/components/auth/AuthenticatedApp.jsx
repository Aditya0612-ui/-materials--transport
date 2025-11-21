import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spinner, Container } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import LoginPage from './LoginPage';
import SupplierDashboard from '../dashboard/SupplierDashboard';

const AuthenticatedApp = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" size="lg" />
          <div className="mt-3">
            <h5>Loading Dashboard...</h5>
            <p className="text-muted">Please wait while we verify your session</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        } 
      />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard/*" 
        element={
          isAuthenticated ? <SupplierDashboard /> : <Navigate to="/login" replace />
        } 
      />
      
      {/* Default Route */}
      <Route 
        path="/" 
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        } 
      />
      
      {/* Catch all route */}
      <Route 
        path="*" 
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        } 
      />
    </Routes>
  );
};

export default AuthenticatedApp;
