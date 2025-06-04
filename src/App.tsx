import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import Login from './components/Login';
import Signup from './components/Signup';
import AdminDashboard from './components/AdminDashboard';
import MemberDashboard from './components/MemberDashboard';

const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: 'admin' | 'member' }> = ({ children, requiredRole }) => {
  const { user, isAuthReady } = useUser();

  if (!isAuthReady) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AuthRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthReady } = useUser();

  if (!isAuthReady) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/member'} replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const handleLoginSuccess = () => {
    // Login success is handled by AuthRedirect
  };

  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <AuthRedirect>
                <Login onLoginSuccess={handleLoginSuccess} />
              </AuthRedirect>
            }
          />
          <Route
            path="/signup"
            element={
              <AuthRedirect>
                <Signup onSuccess={() => {}} />
              </AuthRedirect>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/member"
            element={
              <ProtectedRoute requiredRole="member">
                <MemberDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;