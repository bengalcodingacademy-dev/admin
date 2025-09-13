import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { SkeletonTable } from '../components/Skeleton';

export default function Users() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);
  const [form, setForm] = useState({ name:'', email:'', role:'STUDENT', age:'', dateOfBirth:'' });
  
  const load = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setList(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { load(); }, []);

  const openEdit = (u) => { 
    setEditing(u.id); 
    setForm({ 
      name: u.name, 
      email: u.email, 
      role: u.role || 'STUDENT', 
      age: u.age || '', 
      dateOfBirth: (u.dateOfBirth || '').slice?.(0, 10) || '' 
    }); 
  };
  
  const save = async () => { 
    try {
      await api.put(`/admin/users/${editing}`, form); 
      setEditing(null); 
      load(); 
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const toggleExpanded = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ENROLLED': return 'text-bca-gold';
      case 'PENDING': return 'text-bca-cyan';
      default: return 'text-bca-gray-400';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'text-bca-red';
      case 'INSTRUCTOR': return 'text-bca-cyan';
      default: return 'text-bca-gold';
    }
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
      <h1 className="text-3xl font-bold text-white mb-8">User Management</h1>
      
      <div className="space-y-4">
        {list.map(u => (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bca-gray-800 rounded-lg border border-bca-gray-700 overflow-hidden"
          >
            {/* Main Row */}
            <div 
              className="p-6 cursor-pointer hover:bg-bca-gray-700/50 transition-colors"
              onClick={() => toggleExpanded(u.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-bca-gray-700 flex items-center justify-center">
                    <span className="text-bca-gray-300 font-bold text-lg">
                      {u.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{u.name}</h3>
                    <p className="text-bca-gray-300 text-sm">{u.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-bca-gray-400 text-xs">Role</p>
                    <p className={`font-semibold ${getRoleColor(u.role || 'STUDENT')}`}>
                      {u.role || 'STUDENT'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-bca-gray-400 text-xs">Age</p>
                    <p className="text-white font-semibold">{u.age ?? '-'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-bca-gray-400 text-xs">Purchased</p>
                    <p className="text-white font-semibold">{u.purchasesCount || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-bca-gray-400 text-xs">Total Paid</p>
                    <p className="text-bca-gold font-semibold">₹{((u.totalPaidCents||0)/100).toFixed(2)}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(u);
                      }}
                      className="px-4 py-2 bg-bca-cyan/20 text-bca-cyan rounded-lg hover:bg-bca-cyan/30 transition-colors"
                    >
                      Edit
                    </button>
                    <motion.div
                      animate={{ rotate: expandedUser === u.id ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <svg className="w-5 h-5 text-bca-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {expandedUser === u.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-bca-gray-700"
                >
                  <div className="p-6 bg-bca-gray-700/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <h4 className="text-sm font-semibold text-bca-gray-300 mb-2">Personal Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-bca-gray-400">Date of Birth:</span>
                            <span className="text-white">
                              {u.dateOfBirth ? new Date(u.dateOfBirth).toLocaleDateString() : 'Not provided'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-bca-gray-400">Email Verified:</span>
                            <span className={u.emailVerifiedAt ? 'text-bca-gold' : 'text-bca-red'}>
                              {u.emailVerifiedAt ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-bca-gray-400">Joined:</span>
                            <span className="text-white">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-bca-gray-300 mb-2">Account Status</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-bca-gray-400">Status:</span>
                            <span className={`font-semibold ${getStatusColor(u.status || 'NEW')}`}>
                              {u.status || 'NEW'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-bca-gray-400">Courses Purchased:</span>
                            <span className="text-white">{u.purchasesCount || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-bca-gray-400">Total Spent:</span>
                            <span className="text-bca-gold font-semibold">₹{((u.totalPaidCents||0)/100).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-bca-gray-300 mb-2">Profile</h4>
                        <div className="space-y-2 text-sm">
                          {u.photoUrl && (
                            <div className="flex justify-between items-center">
                              <span className="text-bca-gray-400">Profile Photo:</span>
                              <img
                                src={u.photoUrl}
                                alt={u.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-bca-gray-400">User ID:</span>
                            <span className="text-white font-mono text-xs">{u.id.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {list.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-bca-gray-400 text-lg">No users found.</p>
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editing && (
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
              className="w-full max-w-lg rounded-xl bg-bca-gray-800 border border-bca-gray-700 p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6">Edit User</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-bca-gray-300 mb-2">Name</label>
                  <input
                    placeholder="Name"
                    className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-bca-gray-300 mb-2">Email</label>
                  <input
                    placeholder="Email"
                    className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-bca-gray-300 mb-2">Role</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="INSTRUCTOR">INSTRUCTOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-bca-gray-300 mb-2">Age</label>
                  <input
                    type="number"
                    placeholder="Age"
                    className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
                    value={form.age}
                    onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-bca-gray-300 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    placeholder="DOB"
                    className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
                    value={form.dateOfBirth}
                    onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 rounded-lg border border-bca-gray-600 text-bca-gray-300 hover:bg-bca-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  className="px-4 py-2 rounded-lg bg-bca-gold text-black font-medium hover:bg-bca-gold/80 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
