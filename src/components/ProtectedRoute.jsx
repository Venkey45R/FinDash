import React from 'react';

/**
 * Single-user mode: ProtectedRoute just renders children directly.
 * No auth check needed.
 */
const ProtectedRoute = ({ children }) => {
  return children;
};

export default ProtectedRoute;
