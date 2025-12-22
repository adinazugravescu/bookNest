import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BookDetails from './pages/BookDetails';
import Reservations from './pages/Reservations';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authenticated, loading, user } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/books/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <BookDetails />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reservations"
        element={
          <ProtectedRoute>
            <Layout>
              <Reservations />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Layout>
              <AdminPanel />
            </Layout>
          </AdminRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;

