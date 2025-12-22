import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
  const { authenticated, loading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authenticated) {
      navigate('/');
    }
  }, [authenticated, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/logo.png"
              alt="BookNest Logo"
              className="h-24 w-auto"
              onError={(e) => {
                // Hide image if it fails to load
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <h1 className="text-4xl font-bold text-primary-700 mb-2">BookNest</h1>
          <p className="text-gray-600">Book Rental Platform</p>
        </div>
        <div className="mt-8 space-y-6">
          <button
            onClick={login}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

