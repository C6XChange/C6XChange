import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Panel from './Components/Pannel/Panel';
import Login from './Components/Login/Login';
import LandingPage from './Components/Landing/LandingPage';
import AdminLogin from './Components/Admin/AdminLogin';
import AdminDashboard from './Components/Admin/AdminDashboard';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';
import AdminProtectedRoute from './Components/Admin/AdminProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="App">
          <Routes>
            <Route path="/C6XChange" element={<LandingPage />} />
            <Route path="/C6XChange/login" element={<Login />} />
            <Route path="/C6XChange/admin" element={<AdminLogin />} />
            <Route 
              path="/C6XChange/admin/dashboard" 
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/C6XChange/dashboard/*" 
              element={
                <ProtectedRoute>
                  <Panel />
                </ProtectedRoute>
              } 
            />
            {/* Redirect root to /C6XChange */}
            <Route path="/" element={<Navigate to="/C6XChange" replace />} />
          </Routes>
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
