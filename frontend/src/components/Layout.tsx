import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-primary-50">
      <nav className="bg-white shadow-sm border-b border-primary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center px-2 py-4">
                <img
                  src="/logo.png"
                  alt="BookNest Logo"
                  className="h-12 w-auto"
                  onError={(e) => {
                    // Hide image if it fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="text-xl font-bold text-primary-700 ml-1">BookNest</span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/')
                    ? 'border-primary-600 text-primary-800'
                    : 'border-transparent text-beige-500 hover:text-beige-700 hover:border-beige-300'
                    }`}
                >
                  Books
                </Link>
                <Link
                  to="/reservations"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/reservations')
                    ? 'border-primary-600 text-primary-800'
                    : 'border-transparent text-beige-500 hover:text-beige-700 hover:border-beige-300'
                    }`}
                >
                  My Reservations
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/admin')
                      ? 'border-primary-600 text-primary-800'
                      : 'border-transparent text-beige-500 hover:text-beige-700 hover:border-beige-300'
                      }`}
                  >
                    Admin Panel
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email}
              </Link>
              <button
                onClick={logout}
                className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
};

export default Layout;

