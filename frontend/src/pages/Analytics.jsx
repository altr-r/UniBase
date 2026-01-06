import { useEffect, useState } from 'react';
import { getLeaderboard } from '../services/analytics';
import { Link } from 'react-router';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getLeaderboard();
        setLeaderboard(data);
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Prepare Data for Chart
  const chartData = {
    labels: leaderboard.map(item => item.name),
    datasets: [
      {
        label: 'Total Funding Raised ($)',
        data: leaderboard.map(item => Number(item.total_raised)),
        backgroundColor: 'rgba(37, 99, 235, 0.6)', // Blue-600
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Top 5 Most Funded Startups' },
    },
  };

  if (loading) return <div className="p-10 text-center">Loading Analytics...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Ecosystem Analytics</h1>
          <p className="text-gray-500 mt-1">Real-time insights into market leaders.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: The Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Funding Leaderboard</h2>
          {leaderboard.length > 0 ? (
            <Bar options={options} data={chartData} />
          ) : (
            <p className="text-center text-gray-500 py-10">No investment data available yet.</p>
          )}
        </div>

        {/* Right: The List View */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Top Performers</h2>
          <div className="space-y-4">
            {leaderboard.map((startup, index) => (
              <div key={startup.startup_id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition">
                <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold mr-3 ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                  index === 1 ? 'bg-gray-200 text-gray-700' :
                  index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-700'
                }`}>
                  #{index + 1}
                </span>
                
                <div className="flex-grow">
                  <Link to={`/startup/${startup.startup_id}`} className="font-semibold text-gray-800 hover:text-blue-600 block">
                    {startup.name}
                  </Link>
                  <span className="text-xs text-gray-500">{startup.sector}</span>
                </div>

                <div className="text-right">
                  <span className="block font-bold text-green-600">
                    ${Number(startup.total_raised).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
            
            {leaderboard.length === 0 && <p className="text-gray-400 text-sm">No data to display.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;