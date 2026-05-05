import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // This is where useAuth is imported
import SuspenseFallback from '../common/SuspenseFallback'; // Assuming this path is correct

const AdminRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <SuspenseFallback />;
  if (!user) return <Navigate to="/admin/login" replace />;
  return <Navigate to="/admin/articles" replace />;
};

export default AdminRedirect;
