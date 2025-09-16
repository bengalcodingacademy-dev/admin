import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export default function Transactions() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const load = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/purchases');
      setPending(response.data.filter(p => p.status === 'PENDING'));
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { load(); }, []);

  const approve = async (id) => { 
    try {
      await api.post(`/admin/purchases/${id}/approve`); 
      load(); 
    } catch (error) {
      console.error('Error approving payment:', error);
    }
  };
  
  const decline = async (id) => { 
    try {
      await api.post(`/admin/purchases/${id}/decline`); 
      load(); 
    } catch (error) {
      console.error('Error declining payment:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center text-white/60">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Payment Management</h1>
        <p className="text-white/60">Review and approve pending payments</p>
      </div>

      {pending.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-white/60 text-lg">No pending transactions</div>
          <div className="text-white/40 text-sm mt-2">All payments have been processed</div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pending.map((payment, index) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-bca-gray-800/80 to-bca-gray-900/80 rounded-xl p-6 border border-bca-gray-700/50 hover:border-bca-gold/50 transition-all duration-300 group relative overflow-hidden backdrop-blur-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-bca-gold/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-bca-gold transition-colors duration-300">
                      {payment.user.name}
                    </h3>
                    <p className="text-sm text-bca-gray-300">{payment.user.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    payment.isMonthlyPayment 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    {payment.isMonthlyPayment ? 'Monthly' : 'One-time'}
                  </span>
                </div>

                {/* Course Info */}
                <div className="mb-4">
                  <h4 className="font-semibold text-white mb-1">{payment.course.title}</h4>
                  {payment.isMonthlyPayment && (
                    <p className="text-sm text-bca-gold">
                      Month {payment.monthNumber} of {payment.totalMonths}
                    </p>
                  )}
                </div>

                {/* Payment Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-bca-gray-300">Amount</span>
                    <span className="text-bca-gold font-semibold">₹{payment.amountCents}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-bca-gray-300">UPI Mobile</span>
                    <span className="text-white font-mono text-sm">{payment.upiMobile}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-bca-gray-300">Transaction ID</span>
                    <span className="text-white font-mono text-sm">{payment.upiTxnId}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-bca-gray-300">Submitted</span>
                    <span className="text-white text-sm">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => approve(payment.id)}
                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:from-green-400 hover:to-emerald-400 transition-all duration-300 shadow-lg"
                    style={{ boxShadow: '0 0 20px rgba(34,197,94,0.3)' }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => decline(payment.id)}
                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium hover:from-red-400 hover:to-rose-400 transition-all duration-300 shadow-lg"
                    style={{ boxShadow: '0 0 20px rgba(239,68,68,0.3)' }}
                  >
                    Decline
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
