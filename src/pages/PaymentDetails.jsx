import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export default function PaymentDetails() {
  const { year, month, day } = useParams();
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPaymentDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      let url = `/admin/stats/payments-by-date?year=${year}`;
      if (month) {
        url += `&month=${month}`;
      }
      if (day) {
        url += `&day=${day}`;
      }
      
      const response = await api.get(url);
      setPaymentDetails(response.data);
    } catch (error) {
      console.error('Error loading payment details:', error);
      setError('Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentDetails();
  }, [year, month, day]);

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

  const getDateTitle = () => {
    if (day && month) {
      return `${day}/${month}/${year}`;
    } else if (month) {
      return `${getMonthName(parseInt(month))} ${year}`;
    } else {
      return year;
    }
  };

  const getTotalAmount = () => {
    return paymentDetails.reduce((total, payment) => total + payment.amount, 0);
  };

  const handleBackToSales = () => {
    navigate('/admin/sales');
  };

  const handleGenerateInvoice = () => {
    // TODO: Implement invoice generation
    alert('Invoice generation feature will be available soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bca-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-bca-gold mb-4"></div>
          <p className="text-bca-gray-300 text-lg">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bca-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Data</h2>
          <p className="text-bca-gray-300 mb-6">{error}</p>
          <button
            onClick={handleBackToSales}
            className="px-6 py-3 bg-bca-gold text-black rounded-lg font-medium hover:bg-bca-gold/80 transition-colors"
          >
            Back to Sales Analytics
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bca-black">
      {/* Header Section */}
      <section className="py-8 bg-gradient-to-br from-bca-gray-900 to-bca-black border-b border-bca-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={handleBackToSales}
                className="flex items-center gap-2 text-bca-gray-300 hover:text-white transition-colors mb-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Sales Analytics
              </button>
              <h1 className="text-3xl font-bold text-white mb-2">Payment Details</h1>
              <p className="text-bca-gray-300 text-lg">{getDateTitle()}</p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-4">
              {paymentDetails.length > 0 && (
                <button
                  onClick={handleGenerateInvoice}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-400 hover:to-emerald-400 transition-all duration-300 shadow-lg hover:shadow-green-500/20 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate Invoice
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border border-blue-500/30"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-400 text-sm font-medium">Total Payments</p>
                  <p className="text-2xl font-bold text-white">{paymentDetails.length}</p>
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
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-500/30"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 text-sm font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(getTotalAmount())}</p>
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
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-400 text-sm font-medium">Average Payment</p>
                  <p className="text-2xl font-bold text-white">
                    {paymentDetails.length > 0 
                      ? formatCurrency(getTotalAmount() / paymentDetails.length)
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
        </div>
      </section>

      {/* Payment Details List */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {paymentDetails.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-bca-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-bca-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Payments Found</h3>
              <p className="text-bca-gray-400 mb-6">No payments were made on this date.</p>
              <button
                onClick={handleBackToSales}
                className="px-6 py-3 bg-bca-gold text-black rounded-lg font-medium hover:bg-bca-gold/80 transition-colors"
              >
                Back to Sales Analytics
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentDetails.map((payment, index) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-bca-gray-800/50 rounded-xl p-6 border border-bca-gray-700/50 hover:border-bca-gray-600/50 transition-all duration-300"
                >
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Student Info */}
                    <div>
                      <h4 className="text-sm font-semibold text-bca-gray-300 mb-3">Student Information</h4>
                      <div className="space-y-2">
                        <p className="text-white font-medium text-lg">{payment.user.name}</p>
                        <p className="text-bca-gray-400 text-sm">{payment.user.email}</p>
                        <p className="text-bca-gray-500 text-xs">ID: {payment.user.id.slice(-8)}</p>
                      </div>
                    </div>

                    {/* Course Info */}
                    <div>
                      <h4 className="text-sm font-semibold text-bca-gray-300 mb-3">Course Details</h4>
                      <div className="space-y-2">
                        <p className="text-white font-medium text-lg">{payment.course.title}</p>
                        {payment.isMonthlyPayment && (
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full">
                              Month {payment.monthNumber} of {payment.totalMonths}
                            </span>
                          </div>
                        )}
                        <p className="text-bca-gray-400 text-sm">
                          {payment.course.isMonthlyPayment ? 'Monthly Course' : 'One-time Course'}
                        </p>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div>
                      <h4 className="text-sm font-semibold text-bca-gray-300 mb-3">Payment Information</h4>
                      <div className="space-y-2">
                        <p className="text-bca-gold font-bold text-2xl">{formatCurrency(payment.amount)}</p>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <p className="text-green-400 text-sm font-medium">{payment.status}</p>
                        </div>
                        {payment.razorpayPaymentId && (
                          <p className="text-bca-gray-500 text-xs font-mono">
                            Payment ID: {payment.razorpayPaymentId.slice(-8)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Transaction Info */}
                    <div>
                      <h4 className="text-sm font-semibold text-bca-gray-300 mb-3">Transaction Details</h4>
                      <div className="space-y-2">
                        <p className="text-bca-gray-400 text-sm">
                          {new Date(payment.createdAt).toLocaleDateString('en-IN')}
                        </p>
                        <p className="text-bca-gray-400 text-sm">
                          {new Date(payment.createdAt).toLocaleTimeString('en-IN')}
                        </p>
                        {payment.razorpayOrderId && (
                          <p className="text-bca-gray-500 text-xs font-mono">
                            Order ID: {payment.razorpayOrderId.slice(-8)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
