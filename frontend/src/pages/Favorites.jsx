import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getMyFavorites } from '../services/community';
import { ArrowRight, Heart } from 'lucide-react';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavs = async () => {
        try {
            const data = await getMyFavorites();
            setFavorites(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    fetchFavs();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading Watchlist...</div>;

  return (
    <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 flex items-center">
            <Heart className="w-8 h-8 text-pink-500 mr-3 fill-current"/> My Watchlist
        </h1>
        
        {favorites.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                <p className="text-gray-500 mb-4">No favorites yet.</p>
                <Link to="/" className="text-blue-600 font-medium hover:underline">Browse Startups</Link>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favorites.map(startup => (
                    <div key={startup.startup_id} className="bg-white p-4 rounded-xl shadow-sm flex items-center border border-gray-100 hover:shadow-md transition">
                         <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center mr-4 overflow-hidden flex-shrink-0">
                            {startup.logo_url ? (
                                <img src={startup.logo_url} alt={startup.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-bold text-gray-400">{startup.name.charAt(0)}</span>
                            )}
                        </div>
                        <div className="flex-grow">
                            <h3 className="font-bold text-lg">{startup.name}</h3>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{startup.sector}</span>
                        </div>
                        <Link to={`/startup/${startup.startup_id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full">
                            <ArrowRight className="w-5 h-5"/>
                        </Link>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default Favorites;