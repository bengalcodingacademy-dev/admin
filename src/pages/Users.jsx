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
  const [userStats, setUserStats] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('logged-in');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [copyToast, setCopyToast] = useState(null);
  
  const load = async (filter = 'logged-in', courseSlug = null) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'logged-in') params.append('filter', filter);
      if (courseSlug) params.append('courseSlug', courseSlug);
      
      const response = await api.get(`/admin/users?${params.toString()}`);
      setList(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/admin/users/stats');
      setUserStats(response.data);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };
  
  useEffect(() => { 
    load(); 
    loadStats(); 
  }, []);

  const handleFilterChange = (filter, courseSlug = null) => {
    setSelectedFilter(filter);
    setSelectedCourse(courseSlug);
    load(filter, courseSlug);
  };

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyToast(`${label} copied to clipboard!`);
      setTimeout(() => setCopyToast(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      setCopyToast('Failed to copy to clipboard');
      setTimeout(() => setCopyToast(null), 2000);
    }
  };

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
      
      {/* Category Cards */}
      {userStats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Verified Users Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              selectedFilter === 'logged-in' && !selectedCourse
                ? 'border-bca-cyan bg-bca-cyan/10'
                : 'border-bca-gray-700 bg-bca-gray-800 hover:border-bca-cyan/50'
            }`}
            onClick={() => handleFilterChange('logged-in')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Verified Users</h3>
                <p className="text-3xl font-bold text-bca-cyan mt-2">{userStats.loggedInUsers}</p>
                <p className="text-bca-gray-400 text-sm mt-1">Email verified users</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-bca-cyan/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-bca-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Course Users Cards */}
          {userStats.courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                selectedCourse === course.slug
                  ? 'border-bca-gold bg-bca-gold/10'
                  : 'border-bca-gray-700 bg-bca-gray-800 hover:border-bca-gold/50'
              }`}
              onClick={() => handleFilterChange('course', course.slug)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 
                    className="text-lg font-semibold text-white leading-tight" 
                    title={course.title}
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: '1.3',
                      maxHeight: '2.6em',
                      wordBreak: 'break-word'
                    }}
                  >
                    {course.title}
                  </h3>
                  <p className="text-3xl font-bold text-bca-gold mt-2">{course.userCount}</p>
                  <p className="text-bca-gray-400 text-sm mt-1">Enrolled users</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-bca-gold/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-bca-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-xl border-2 border-bca-gray-700 bg-bca-gray-800 animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-5 bg-bca-gray-700 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-bca-gray-700 rounded w-16 mb-1"></div>
                  <div className="h-4 bg-bca-gray-700 rounded w-32"></div>
                </div>
                <div className="w-12 h-12 rounded-full bg-bca-gray-700"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current Filter Display */}
      {selectedCourse && (
        <div className="mb-6 p-4 bg-bca-gray-800 rounded-lg border border-bca-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {userStats?.courses.find(c => c.slug === selectedCourse)?.title}
              </h3>
              <p className="text-bca-gray-400 text-sm">
                {list.length} user{list.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
        </div>
      )}
      
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
                     <div className="flex items-center gap-2">
                       <p className="text-bca-gray-300 text-sm">{u.email}</p>
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           copyToClipboard(u.email, 'Email address');
                         }}
                         className="text-bca-gray-400 hover:text-bca-cyan transition-colors"
                         title="Copy email address"
                       >
                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                         </svg>
                       </button>
                     </div>
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
                    <p className="text-bca-gold font-semibold">₹{(u.totalPaidRupees||0).toFixed(2)}</p>
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
                           <div className="flex justify-between items-center">
                             <span className="text-bca-gray-400">Phone:</span>
                             <div className="flex items-center gap-2">
                               <span className="text-white">
                                 {u.phone || 'Not provided'}
                               </span>
                               {u.phone && (
                                 <button
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     copyToClipboard(u.phone, 'Phone number');
                                   }}
                                   className="text-bca-gray-400 hover:text-bca-cyan transition-colors"
                                   title="Copy phone number"
                                 >
                                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                   </svg>
                                 </button>
                               )}
                             </div>
                           </div>
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
                             <span className="text-bca-gray-400">Interest Status:</span>
                             <span className={`font-semibold ${
                               u.interestStatus === 'PURCHASED' ? 'text-bca-gold' :
                               u.interestStatus === 'INTERESTED' ? 'text-bca-cyan' : 'text-bca-gray-400'
                             }`}>
                               {u.interestStatus || 'INTERESTED'}
                             </span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-bca-gray-400">Phone Verified:</span>
                             <span className={u.phoneVerifiedAt ? 'text-bca-gold' : 'text-bca-red'}>
                               {u.phoneVerifiedAt ? 'Yes' : 'No'}
                             </span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-bca-gray-400">Courses Purchased:</span>
                             <span className="text-white">{u.purchasesCount || 0}</span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-bca-gray-400">Total Spent:</span>
                             <span className="text-bca-gold font-semibold">₹{(u.totalPaidRupees||0).toFixed(2)}</span>
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
                           <div className="flex justify-between items-center">
                             <span className="text-bca-gray-400">User ID:</span>
                             <div className="flex items-center gap-2">
                               <span 
                                 className="text-white font-mono text-xs bg-bca-gray-600 px-2 py-1 rounded break-all"
                                 style={{ wordBreak: 'break-all', maxWidth: '200px' }}
                               >
                                 {u.id}
                               </span>
                               <button
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   copyToClipboard(u.id, 'User ID');
                                 }}
                                 className="text-bca-gray-400 hover:text-bca-cyan transition-colors"
                                 title="Copy full User ID"
                               >
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                 </svg>
                               </button>
                             </div>
                           </div>
                          {u.emailVerifiedAt && (
                            <div className="flex justify-between">
                              <span className="text-bca-gray-400">Email Verified:</span>
                              <span className="text-white">
                                {new Date(u.emailVerifiedAt).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Course Information */}
                      {u.courses && u.courses.length > 0 && (
                        <div className="md:col-span-2 lg:col-span-3">
                          <h4 className="text-sm font-semibold text-bca-gray-300 mb-2">Enrolled Courses</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {u.courses.map((course, index) => (
                              <div key={index} className="p-3 bg-bca-gray-700/50 rounded-lg border border-bca-gray-600">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h5 className="text-white font-medium text-sm">{course.title}</h5>
                                    <p className="text-bca-gray-400 text-xs">
                                      {course.type === 'monthly' ? 'Monthly Access' : 'Full Access'}
                                    </p>
                                  </div>
                                  <span className="px-2 py-1 bg-bca-gold/20 text-bca-gold text-xs rounded-full">
                                    {course.slug}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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

      {/* Toast Notification */}
      <AnimatePresence>
        {copyToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className="bg-bca-gray-800 border border-bca-cyan/30 rounded-lg px-4 py-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-bca-cyan/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-bca-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white text-sm font-medium">{copyToast}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
