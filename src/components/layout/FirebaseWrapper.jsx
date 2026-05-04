import React from 'react';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from '../../hooks/useAuth';

/**
 * This wrapper ensures that Firebase/Auth logic is ONLY
 * initialized when the user navigates to Articles or Admin pages.
 */
const FirebaseWrapper = () => {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
};

export default FirebaseWrapper;
