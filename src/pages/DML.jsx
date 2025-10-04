import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function DML() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Grant Course Access Form
  const [grantAccessForm, setGrantAccessForm] = useState({
    userEmail: '',
    courseId: '',
    accessType: 'full', // 'full' or 'monthly'
    monthNumber: 1,
    amountPaid: '',
    paymentMethod: 'cash',
    notes: ''
  });

  // User Management Form
  const [userForm, setUserForm] = useState({
    email: '',
    action: 'activate' // activate, deactivate, delete
  });

  // Interest Status Management Form
  const [interestStatusForm, setInterestStatusForm] = useState({
    userEmail: '',
    interestStatus: 'NOT_INTERESTED' // INTERESTED, NOT_INTERESTED, PURCHASED
  });

  // Courses list for dropdown
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);


  // Load courses on component mount
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoadingCourses(true);
    try {
      const response = await api.get('/admin/dml/courses');
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Failed to load courses:', error);
      showMessage('Failed to load courses', 'error');
    } finally {
      setLoadingCourses(false);
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleGrantAccess = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/admin/dml/grant-access', grantAccessForm);
      showMessage('Course access granted successfully!', 'success');
      setGrantAccessForm({
        userEmail: '',
        courseId: '',
        accessType: 'full',
        monthNumber: 1,
        amountPaid: '',
        paymentMethod: 'cash',
        notes: ''
      });
    } catch (error) {
      showMessage(error.response?.data?.error || 'Failed to grant access', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUserManagement = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/admin/dml/user-management', userForm);
      showMessage(`User ${userForm.action}d successfully!`, 'success');
      setUserForm({ email: '', action: 'activate' });
    } catch (error) {
      showMessage(error.response?.data?.error || 'Failed to manage user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInterestStatusUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/admin/dml/update-interest-status', interestStatusForm);
      showMessage(`User interest status updated to ${interestStatusForm.interestStatus}!`, 'success');
      setInterestStatusForm({ userEmail: '', interestStatus: 'NOT_INTERESTED' });
    } catch (error) {
      showMessage(error.response?.data?.error || 'Failed to update interest status', 'error');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-bca-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">DML Operations</h1>
          <p className="text-bca-gray-400">
            Perform important database operations and manual data management tasks
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            messageType === 'success' 
              ? 'bg-green-900/50 border border-green-500 text-green-300' 
              : 'bg-red-900/50 border border-red-500 text-red-300'
          }`}>
            {message}
          </div>
        )}

        <div className="grid gap-8">
          {/* Grant Course Access */}
          <div className="bg-gradient-to-br from-bca-gray-800 to-bca-gray-900 rounded-2xl p-6 border border-bca-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-bca-gold to-bca-cyan rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎓</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Grant Course Access</h2>
                <p className="text-bca-gray-400 text-sm">
                  Manually grant course access to users who paid personally
                </p>
              </div>
            </div>

            <form onSubmit={handleGrantAccess} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-bca-gray-300 mb-2">
                    User Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={grantAccessForm.userEmail}
                    onChange={(e) => setGrantAccessForm({...grantAccessForm, userEmail: e.target.value})}
                    className="w-full px-4 py-3 bg-bca-gray-700 border border-bca-gray-600 rounded-lg text-white placeholder-bca-gray-400 focus:border-bca-cyan focus:outline-none"
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-bca-gray-300 mb-2">
                    Select Course *
                  </label>
                  <select
                    required
                    value={grantAccessForm.courseId}
                    onChange={(e) => setGrantAccessForm({...grantAccessForm, courseId: e.target.value})}
                    className="w-full px-4 py-3 bg-bca-gray-700 border border-bca-gray-600 rounded-lg text-white focus:border-bca-cyan focus:outline-none"
                    disabled={loadingCourses}
                  >
                    <option value="">
                      {loadingCourses ? 'Loading courses...' : 'Select a course'}
                    </option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title} - ₹{course.price} {course.isActive ? '(Active)' : '(Inactive)'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-bca-gray-300 mb-2">
                    Access Type *
                  </label>
                  <select
                    required
                    value={grantAccessForm.accessType}
                    onChange={(e) => setGrantAccessForm({...grantAccessForm, accessType: e.target.value})}
                    className="w-full px-4 py-3 bg-bca-gray-700 border border-bca-gray-600 rounded-lg text-white focus:border-bca-cyan focus:outline-none"
                  >
                    <option value="full">Full Course Access</option>
                    <option value="monthly">Monthly Access Only</option>
                  </select>
                </div>
                {grantAccessForm.accessType === 'monthly' && (
                  <div>
                    <label className="block text-sm font-medium text-bca-gray-300 mb-2">
                      Month Number *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      required={grantAccessForm.accessType === 'monthly'}
                      value={grantAccessForm.monthNumber}
                      onChange={(e) => setGrantAccessForm({...grantAccessForm, monthNumber: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-bca-gray-700 border border-bca-gray-600 rounded-lg text-white placeholder-bca-gray-400 focus:border-bca-cyan focus:outline-none"
                      placeholder="1"
                    />
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-bca-gray-300 mb-2">
                    Amount Paid (₹)
                  </label>
                  <input
                    type="number"
                    value={grantAccessForm.amountPaid}
                    onChange={(e) => setGrantAccessForm({...grantAccessForm, amountPaid: e.target.value})}
                    className="w-full px-4 py-3 bg-bca-gray-700 border border-bca-gray-600 rounded-lg text-white placeholder-bca-gray-400 focus:border-bca-cyan focus:outline-none"
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-bca-gray-300 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={grantAccessForm.paymentMethod}
                    onChange={(e) => setGrantAccessForm({...grantAccessForm, paymentMethod: e.target.value})}
                    className="w-full px-4 py-3 bg-bca-gray-700 border border-bca-gray-600 rounded-lg text-white focus:border-bca-cyan focus:outline-none"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="upi">UPI</option>
                    <option value="cheque">Cheque</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-bca-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={grantAccessForm.notes}
                  onChange={(e) => setGrantAccessForm({...grantAccessForm, notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-bca-gray-700 border border-bca-gray-600 rounded-lg text-white placeholder-bca-gray-400 focus:border-bca-cyan focus:outline-none"
                  placeholder="Additional notes about the payment or user..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-bca-gold to-bca-cyan text-black font-semibold rounded-lg hover:from-bca-gold/90 hover:to-bca-cyan/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Grant Access'}
              </button>
            </form>

            {/* Course UUID Reference */}
            {grantAccessForm.courseId && (
              <div className="mt-4 p-3 bg-bca-gray-700/50 rounded-lg border border-bca-gray-600">
                <p className="text-sm text-bca-gray-300">
                  <span className="font-medium">Selected Course UUID:</span>
                  <br />
                  <code className="text-bca-cyan text-xs break-all">{grantAccessForm.courseId}</code>
                </p>
              </div>
            )}
          </div>

          {/* User Management */}
          <div className="bg-gradient-to-br from-bca-gray-800 to-bca-gray-900 rounded-2xl p-6 border border-bca-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-bca-cyan to-bca-gold rounded-xl flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">User Management</h2>
                <p className="text-bca-gray-400 text-sm">
                  Activate, deactivate, or manage user accounts
                </p>
              </div>
            </div>

            <form onSubmit={handleUserManagement} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-bca-gray-300 mb-2">
                    User Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                    className="w-full px-4 py-3 bg-bca-gray-700 border border-bca-gray-600 rounded-lg text-white placeholder-bca-gray-400 focus:border-bca-cyan focus:outline-none"
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-bca-gray-300 mb-2">
                    Action *
                  </label>
                  <select
                    value={userForm.action}
                    onChange={(e) => setUserForm({...userForm, action: e.target.value})}
                    className="w-full px-4 py-3 bg-bca-gray-700 border border-bca-gray-600 rounded-lg text-white focus:border-bca-cyan focus:outline-none"
                  >
                    <option value="activate">Activate User</option>
                    <option value="deactivate">Deactivate User</option>
                    <option value="delete">Delete User</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-bca-cyan to-bca-gold text-black font-semibold rounded-lg hover:from-bca-cyan/90 hover:to-bca-gold/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Execute Action'}
              </button>
            </form>
          </div>

          {/* Interest Status Management */}
          <div className="bg-gradient-to-br from-bca-gray-800 to-bca-gray-900 rounded-2xl p-6 border border-bca-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-bca-gold to-bca-cyan rounded-xl flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Interest Status Management</h2>
                <p className="text-bca-gray-400 text-sm">
                  Update user interest status (INTERESTED, NOT_INTERESTED, PURCHASED)
                </p>
              </div>
            </div>

            <form onSubmit={handleInterestStatusUpdate} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-bca-gray-300 mb-2">
                    User Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={interestStatusForm.userEmail}
                    onChange={(e) => setInterestStatusForm({...interestStatusForm, userEmail: e.target.value})}
                    className="w-full px-4 py-3 bg-bca-gray-700 border border-bca-gray-600 rounded-lg text-white focus:border-bca-cyan focus:outline-none"
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-bca-gray-300 mb-2">
                    Interest Status *
                  </label>
                  <select
                    value={interestStatusForm.interestStatus}
                    onChange={(e) => setInterestStatusForm({...interestStatusForm, interestStatus: e.target.value})}
                    className="w-full px-4 py-3 bg-bca-gray-700 border border-bca-gray-600 rounded-lg text-white focus:border-bca-cyan focus:outline-none"
                  >
                    <option value="INTERESTED">INTERESTED</option>
                    <option value="NOT_INTERESTED">NOT_INTERESTED</option>
                    <option value="PURCHASED">PURCHASED</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-bca-cyan to-bca-gold text-black font-semibold rounded-lg hover:from-bca-cyan/90 hover:to-bca-gold/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Interest Status'}
              </button>
            </form>
          </div>

        </div>

        {/* Warning Notice */}
        <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-yellow-400 text-xl">⚠️</span>
            <div>
              <h3 className="text-yellow-300 font-semibold mb-2">Important Notice</h3>
              <p className="text-yellow-200/80 text-sm">
                These operations directly modify the database. Please ensure you have the correct information before executing any action. 
                All DML operations are logged for audit purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
