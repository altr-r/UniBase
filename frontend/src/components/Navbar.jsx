import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Building2, BarChart3, Plus, Heart } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-blue-600 font-bold text-2xl">
              <Building2 className="mr-2" />
              UniBase
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium">Startups</Link>
            <Link to="/analytics" className="text-gray-600 hover:text-blue-600 font-medium flex items-center">
              <BarChart3 className="w-4 h-4 mr-1" /> Analytics
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/favorites" className="text-gray-600 hover:text-pink-500" title="Watchlist">
                    <Heart className="w-5 h-5" />
                </Link>
                
                <Link to="/create-startup" className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition flex items-center text-sm font-medium">
                  <Plus className="w-4 h-4 mr-1"/> Startup
                </Link>

                <div className="h-6 w-px bg-gray-300 mx-2"></div>

                <Link to="/profile" className="flex items-center text-gray-700 font-medium hover:text-blue-600">
                  <User className="w-5 h-5 mr-2" /> {user.name}
                </Link>
                <button onClick={handleLogout} title="Logout" className="text-red-500 hover:text-red-700">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link to="/login" className="text-blue-600 font-medium hover:underline">Login</Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;