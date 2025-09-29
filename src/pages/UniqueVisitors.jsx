import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export default function UniqueVisitors() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    allTime: 0
  });
  const [dailyAnalytics, setDailyAnalytics] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [error, setError] = useState('');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    loadStats();
    loadAnalytics();
  }, [selectedYear, selectedMonth]);

  const loadStats = async () => {
    try {
      console.log('Loading visitor stats...');
      const response = await api.get('/visitors/stats');
      console.log('Visitor stats response:', response.data);
      setStats(response.data || {});
    } catch (error) {
      console.error('Error loading visitor stats:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      setError('Failed to load visitor statistics');
      setStats({ today: 0, thisWeek: 0, thisMonth: 0, allTime: 0 });
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      console.log(`Loading analytics for ${selectedYear}-${selectedMonth}...`);
      const response = await api.get(`/visitors/analytics?year=${selectedYear}&month=${selectedMonth}`);
      console.log('Analytics response:', response.data);
      setDailyAnalytics(response.data?.analytics || []);
    } catch (error) {
      console.error('Error loading visitor analytics:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      setError('Failed to load visitor analytics');
      setDailyAnalytics([]);
    } finally {
      setLoading(false);
    }
  };

  const getMaxVisitors = () => {
    if (!dailyAnalytics || dailyAnalytics.length === 0) return 1;
    return Math.max(...dailyAnalytics.map(day => day.count), 1);
  };

  const getTotalMonthlyVisitors = () => {
    if (!dailyAnalytics || dailyAnalytics.length === 0) return 0;
    return dailyAnalytics.reduce((sum, day) => sum + day.count, 0);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Unique Visitor Analytics</h1>
        <p className="text-bca-gray-300">
          Track and analyze unique website visitors with daily insights
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          title="Today's Visitors" 
          value={stats?.today || 0} 
          icon="📅" 
          color="blue" 
          delay={0}
        />
        <StatCard 
          title="This Week's Visitors" 
          value={stats?.thisWeek || 0} 
          icon="📊" 
          color="green" 
          delay={0.1}
        />
        <StatCard 
          title="This Month's Visitors" 
          value={stats?.thisMonth || 0} 
          icon="📈" 
          color="yellow" 
          delay={0.2}
        />
        <StatCard 
          title="All-Time Visitors" 
          value={stats?.allTime || 0} 
          icon="🌐" 
          color="purple" 
          delay={0.3}
        />
      </div>

      {/* Daily Analytics Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-bca-gray-800 rounded-lg p-6 border border-bca-gray-700"
      >
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 sm:mb-0">Daily Unique Visitors</h2>
          <div className="flex gap-4 ml-auto">
            <select
              className="bg-bca-gray-700 text-white p-2 rounded-lg border border-bca-gray-600 focus:outline-none focus:border-bca-gold"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {months.map((monthName, index) => (
                <option key={index} value={index + 1}>
                  {monthName}
                </option>
              ))}
            </select>
            <select
              className="bg-bca-gray-700 text-white p-2 rounded-lg border border-bca-gray-600 focus:outline-none focus:border-bca-gold"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-bca-gray-400 text-center py-10">Loading daily analytics...</div>
        ) : dailyAnalytics && dailyAnalytics.length > 0 ? (
          <div className="space-y-2">
            {dailyAnalytics.map((day, index) => {
              const percentage = (day.count / getMaxVisitors()) * 100;
              const date = new Date(day.date);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNumber = date.getDate();
              
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-16 text-sm text-bca-gray-400 text-center">
                    <div className="text-xs">{dayName}</div>
                    <div className="font-semibold text-white">{dayNumber}</div>
                  </div>
                  <div className="flex-1 bg-bca-gray-700 rounded-full h-6 relative overflow-hidden">
                    {day.count > 0 && (
                      <div
                        className="bg-gradient-to-r from-bca-gold to-bca-cyan h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {day.count}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            <div className="mt-6 text-center">
              <p className="text-bca-gray-400">
                Total unique visitors this month: <span className="text-bca-gold font-semibold">{getTotalMonthlyVisitors()}</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="text-bca-gray-400 text-center py-10">No visitor data for the selected month.</div>
        )}
      </motion.div>
    </div>
  );
}

const StatCard = ({ title, value, icon, color, delay }) => {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    purple: 'bg-purple-500/20 text-purple-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="bg-bca-gray-800 rounded-lg p-5 border border-bca-gray-700 flex flex-col items-center justify-center text-center"
    >
      <h3 className="text-bca-gray-300 text-sm font-medium mb-2">{title}</h3>
      <p className="text-white text-3xl font-bold">{value}</p>
    </motion.div>
  );
};
