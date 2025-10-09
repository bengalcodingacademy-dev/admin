import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';

export default function PurchaseNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, today, week, month
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/purchase-notifications?filter=${filter}`);
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error loading purchase notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/admin/purchase-notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/admin/purchase-notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'PURCHASE': return '💰';
      case 'MONTHLY_PAYMENT': return '📅';
      case 'MANUAL_ACCESS': return '👤';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'PURCHASE': return 'text-bca-gold';
      case 'MONTHLY_PAYMENT': return 'text-bca-cyan';
      case 'MANUAL_ACCESS': return 'text-bca-purple';
      default: return 'text-bca-gray-300';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Purchase Notifications</h1>
          <p className="text-bca-gray-400">Real-time course purchase alerts</p>
        </div>
        
        <div className="flex items-center gap-4">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-bca-cyan text-black rounded-lg hover:bg-bca-cyan/80 transition-colors"
            >
              Mark All Read ({unreadCount})
            </button>
          )}
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-bca-gray-800 text-white rounded-lg border border-bca-gray-600 focus:border-bca-cyan focus:outline-none"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        <AnimatePresence>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bca-cyan mx-auto"></div>
              <p className="text-bca-gray-400 mt-2">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-xl font-semibold text-white mb-2">No notifications</h3>
              <p className="text-bca-gray-400">No purchase notifications found for the selected period.</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  notification.isRead 
                    ? 'bg-bca-gray-800 border-bca-gray-700' 
                    : 'bg-bca-gray-800/50 border-bca-cyan/50 shadow-lg shadow-bca-cyan/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-semibold ${getNotificationColor(notification.type)}`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-bca-gray-400 text-sm">
                          {getTimeAgo(notification.createdAt)}
                        </span>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-bca-cyan rounded-full"></div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-bca-gray-300 mb-3">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-bca-gray-400">
                      <span>👤 {notification.userName}</span>
                      <span>📧 {notification.userEmail}</span>
                      <span>💰 ₹{notification.amount}</span>
                      <span>📚 {notification.courseTitle}</span>
                    </div>
                  </div>
                  
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="px-3 py-1 bg-bca-cyan text-black rounded text-sm hover:bg-bca-cyan/80 transition-colors"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
