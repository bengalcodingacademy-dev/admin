import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { SkeletonTable } from '../components/Skeleton';

export default function MeetingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState(null); // 'approve' or 'decline'
  const [adminMessage, setAdminMessage] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/meeting-requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Error loading meeting requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    try {
      const endpoint = action === 'approve' ? 'approve' : 'decline';
      await api.put(`/admin/meeting-requests/${selectedRequest.id}/${endpoint}`, {
        adminMessage
      });
      setShowModal(false);
      setAdminMessage('');
      setSelectedRequest(null);
      loadRequests();
    } catch (error) {
      console.error('Error updating meeting request:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'text-green-400 bg-green-500/20';
      case 'DECLINED': return 'text-red-400 bg-red-500/20';
      default: return 'text-yellow-400 bg-yellow-500/20';
    }
  };

  const openActionModal = (request, actionType) => {
    setSelectedRequest(request);
    setAction(actionType);
    setAdminMessage('');
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <SkeletonTable rows={5} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Meeting Requests</h1>
      
      <div className="space-y-4">
        {requests.map((request) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bca-gray-800 rounded-lg p-6 border border-bca-gray-700"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-bca-gray-700 flex items-center justify-center">
                    <span className="text-bca-gray-300 font-bold text-lg">
                      {request.studentName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{request.studentName}</h3>
                    <p className="text-bca-gray-300 text-sm">{request.studentEmail}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-bca-gray-400 text-sm">Preferred Date</p>
                    <p className="text-white font-semibold">
                      {new Date(request.preferredDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-bca-gray-400 text-sm">Preferred Time</p>
                    <p className="text-white font-semibold">{request.preferredTime}</p>
                  </div>
                </div>
                
                {request.message && (
                  <div className="mb-4">
                    <p className="text-bca-gray-400 text-sm">Message</p>
                    <p className="text-bca-gray-300 italic">"{request.message}"</p>
                  </div>
                )}
                
                {request.adminMessage && (
                  <div className="mb-4 p-4 bg-bca-gray-700 rounded-lg">
                    <p className="text-bca-cyan font-medium mb-1">Admin Response:</p>
                    <p className="text-white">{request.adminMessage}</p>
                  </div>
                )}
                
                <div className="text-bca-gray-400 text-sm">
                  Requested on {new Date(request.createdAt).toLocaleString()}
                </div>
              </div>
              
              {request.status === 'PENDING' && (
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => openActionModal(request, 'approve')}
                    className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => openActionModal(request, 'decline')}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      
      {requests.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-bca-gray-400 text-lg">No meeting requests found.</p>
        </div>
      )}

      {/* Action Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-bca-gray-800 rounded-xl p-6 border border-bca-gray-700"
            >
              <h2 className="text-xl font-bold text-white mb-4">
                {action === 'approve' ? 'Approve' : 'Decline'} Meeting Request
              </h2>
              
              <div className="mb-4">
                <p className="text-bca-gray-300 mb-2">
                  <strong>Student:</strong> {selectedRequest?.studentName}
                </p>
                <p className="text-bca-gray-300 mb-2">
                  <strong>Date:</strong> {selectedRequest?.preferredDate && new Date(selectedRequest.preferredDate).toLocaleDateString()}
                </p>
                <p className="text-bca-gray-300 mb-4">
                  <strong>Time:</strong> {selectedRequest?.preferredTime}
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-bca-gray-300 mb-2">
                  {action === 'approve' ? 'Approval' : 'Decline'} Message
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
                  placeholder={
                    action === 'approve' 
                      ? "Your meeting request has been approved! We will contact you soon to schedule the session."
                      : "Unfortunately, we cannot accommodate your meeting request at this time. Please try again later."
                  }
                  value={adminMessage}
                  onChange={(e) => setAdminMessage(e.target.value)}
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setAdminMessage('');
                    setSelectedRequest(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-bca-gray-600 text-bca-gray-300 hover:bg-bca-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    action === 'approve'
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  {action === 'approve' ? 'Approve' : 'Decline'} Request
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
