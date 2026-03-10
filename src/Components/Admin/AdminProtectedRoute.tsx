import React from 'react';
import { Navigate } from 'react-router-dom';

interface AdminProtectedRouteProps {
    children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
    const adminToken = localStorage.getItem('adminToken');
    
    if (!adminToken) {
        return <Navigate to="/C6XChange/admin/login" replace />;
    }
    
    return <>{children}</>;
};

export default AdminProtectedRoute;
