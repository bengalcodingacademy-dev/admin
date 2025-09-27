import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export default function Sales() {
  const navigate = useNavigate();
  const [salesData, setSalesData] = useState({
    daily: [],
    monthly: [],
    yearly: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const loadSalesData = async () => {
    try {
      setLoading(true);
      
      // Load monthly sales data
      const monthlyResponse = await api.get(`/admin/stats/monthly-sales?year=${selectedYear}`);
      
      // Load daily sales data for current month
      const dailyResponse = await api.get(`/admin/stats/daily-sales?year=${selectedYear}&month=${new Date().getMonth() + 1}`);
      
      // Load yearly sales data
      const yearlyResponse = await api.get('/admin/stats/yearly-sales');
      
      setSalesData({
        daily: dailyResponse.data || [],
        monthly: monthlyResponse.data || [],
        yearly: yearlyResponse.data || []
      });
    } catch (error) {
      console.error('Error loading sales data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { 
    loadSalesData(); 
  }, [selectedYear]);

  const navigateToPaymentDetails = (dateInfo) => {
    let path = `/admin/payment-details/${dateInfo.year}`;
    if (dateInfo.month) {
      path += `/${dateInfo.month}`;
    }
    if (dateInfo.day) {
      path += `/${dateInfo.day}`;
    }
    navigate(path);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center text-white/60">Loading sales analytics...</div>
      </div>
    );
  }

  const getTotalSales = (data) => {
    return data.reduce((total, item) => total + (item.totalAmount || 0), 0);
  };

  const getTotalOrders = (data) => {
    return data.reduce((total, item) => total + (item.orderCount || 0), 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getMonthName = (monthNumber) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthNumber - 1] || '';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Sales Analytics</h1>
        <p className="text-white/60">Track your sales performance across different time periods</p>
      </div>

      {/* Period Selector */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            {['daily', 'monthly', 'yearly'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  selectedPeriod === period
                    ? 'bg-bca-gold text-black'
                    : 'bg-bca-gray-700 text-white hover:bg-bca-gray-600'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
          
          {selectedPeriod === 'monthly' && (
            <div className="flex items-center gap-2">
              <label className="text-white/60">Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-bca-gray-700 text-white px-3 py-2 rounded-lg border border-bca-gray-600 focus:border-bca-gold focus:outline-none"
              >
                {[2023, 2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm font-medium">Total Sales</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(getTotalSales(salesData[selectedPeriod]))}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border border-blue-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm font-medium">Total Orders</p>
              <p className="text-2xl font-bold text-white">
                {getTotalOrders(salesData[selectedPeriod])}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM8 15v-4h4v4H8z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-sm font-medium">Average Order</p>
              <p className="text-2xl font-bold text-white">
                {getTotalOrders(salesData[selectedPeriod]) > 0 
                  ? formatCurrency(getTotalSales(salesData[selectedPeriod]) / getTotalOrders(salesData[selectedPeriod]))
                  : formatCurrency(0)
                }
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Sales Data Grid */}
      <div className="grid gap-6">
        {selectedPeriod === 'monthly' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {salesData.monthly.map((month, index) => (
              <motion.div
                key={month.month}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigateToPaymentDetails({ 
                  year: selectedYear, 
                  month: month.month 
                })}
                className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                  month.totalAmount > 0
                    ? 'bg-gradient-to-br from-bca-gold/10 to-yellow-500/10 border-bca-gold/30 hover:border-bca-gold/50 hover:shadow-lg hover:shadow-yellow-500/20'
                    : 'bg-bca-gray-800/50 border-bca-gray-700/50 hover:border-bca-gray-600/50'
                }`}
              >
                <div className="text-center">
                  <p className="text-white/60 text-sm font-medium">{getMonthName(month.month)}</p>
                  <p className="text-white font-bold text-lg">{formatCurrency(month.totalAmount)}</p>
                  <p className="text-white/40 text-xs">{month.orderCount} orders</p>
                  {month.totalAmount > 0 && (
                    <p className="text-yellow-400 text-xs mt-1">Click to view details</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {selectedPeriod === 'daily' && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {salesData.daily.map((day, index) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => navigateToPaymentDetails({ 
                  year: selectedYear, 
                  month: new Date().getMonth() + 1, 
                  day: day.day 
                })}
                className={`p-3 rounded-lg border transition-all duration-300 cursor-pointer ${
                  day.totalAmount > 0
                    ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/20'
                    : 'bg-bca-gray-800/50 border-bca-gray-700/50 hover:border-bca-gray-600/50'
                }`}
              >
                <div className="text-center">
                  <p className="text-white/60 text-xs font-medium">{day.day}</p>
                  <p className="text-white font-semibold text-sm">{formatCurrency(day.totalAmount)}</p>
                  <p className="text-white/40 text-xs">{day.orderCount} orders</p>
                  {day.totalAmount > 0 && (
                    <p className="text-green-400 text-xs mt-1">Click to view details</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {selectedPeriod === 'yearly' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {salesData.yearly.map((year, index) => (
              <motion.div
                key={year.year}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigateToPaymentDetails({ 
                  year: year.year 
                })}
                className={`p-6 rounded-xl border transition-all duration-300 cursor-pointer ${
                  year.totalAmount > 0
                    ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20'
                    : 'bg-bca-gray-800/50 border-bca-gray-700/50 hover:border-bca-gray-600/50'
                }`}
              >
                <div className="text-center">
                  <p className="text-white/60 text-sm font-medium">{year.year}</p>
                  <p className="text-white font-bold text-2xl">{formatCurrency(year.totalAmount)}</p>
                  <p className="text-white/40 text-sm">{year.orderCount} orders</p>
                  {year.totalAmount > 0 && (
                    <p className="text-purple-400 text-xs mt-2">Click to view details</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Empty State */}
      {getTotalSales(salesData[selectedPeriod]) === 0 && (
        <div className="text-center py-12">
          <div className="text-white/60 text-lg">No sales data found</div>
          <div className="text-white/40 text-sm mt-2">
            {selectedPeriod === 'monthly' && `No sales recorded for ${selectedYear}`}
            {selectedPeriod === 'daily' && 'No sales recorded for this month'}
            {selectedPeriod === 'yearly' && 'No sales recorded yet'}
          </div>
        </div>
      )}

    </div>
  );
}
