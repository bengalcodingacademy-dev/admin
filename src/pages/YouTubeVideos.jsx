import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export default function YouTubeVideos() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    videoUrl: '',
    thumbnailUrl: '',
    isActive: true
  });

  const load = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/youtube-videos');
      setList(response.data);
    } catch (error) {
      console.error('Error loading YouTube videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVideo) {
        await api.put(`/admin/youtube-videos/${editingVideo.id}`, formData);
      } else {
        await api.post('/admin/youtube-videos', formData);
      }
      
      // Refresh the list with a small delay to ensure the video is created/updated
      setTimeout(() => {
        load();
      }, 500);
      
      setShowForm(false);
      setEditingVideo(null);
      setFormData({
        title: '',
        videoUrl: '',
        thumbnailUrl: '',
        isActive: true
      });
    } catch (error) {
      console.error('Error saving YouTube video:', error);
    }
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl || '',
      isActive: video.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this YouTube video?')) {
      try {
        await api.delete(`/admin/youtube-videos/${id}`);
        load();
      } catch (error) {
        console.error('Error deleting YouTube video:', error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingVideo(null);
    setFormData({
      title: '',
      videoUrl: '',
      thumbnailUrl: '',
      isActive: true
    });
  };

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Generate YouTube thumbnail URL
  const getYouTubeThumbnail = (url) => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bca-gray-900 via-bca-gray-800 to-bca-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-bca-gold mx-auto mb-4"></div>
          <p className="text-white/70 text-lg">Loading YouTube videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bca-gray-900 via-bca-gray-800 to-bca-gray-900 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            YouTube Videos Management
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-bca-gold to-bca-cyan mx-auto rounded-full mb-4"></div>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Manage YouTube videos for the homepage slideshow. Add engaging content to showcase your expertise.
          </p>
        </div>

        {/* Stats and Action Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="bg-gradient-to-r from-bca-gold/20 to-bca-cyan/20 backdrop-blur-sm rounded-xl p-4 border border-bca-gold/30">
              <div className="text-2xl font-bold text-white">{list.length}</div>
              <div className="text-white/70 text-sm">Total Videos</div>
            </div>
            <div className="bg-gradient-to-r from-bca-cyan/20 to-bca-gold/20 backdrop-blur-sm rounded-xl p-4 border border-bca-cyan/30">
              <div className="text-2xl font-bold text-white">{list.filter(v => v.isActive).length}</div>
              <div className="text-white/70 text-sm">Active Videos</div>
            </div>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="group relative px-8 py-4 bg-gradient-to-r from-bca-gold to-bca-gold/80 text-black rounded-xl font-semibold hover:from-bca-gold/90 hover:to-bca-gold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(253,176,0,0.4)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Video
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-bca-gold/20 to-bca-cyan/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>

        {/* Warning Banner */}
        {list.length < 6 && list.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-bca-red/20 to-bca-red/10 backdrop-blur-sm rounded-2xl p-6 border border-bca-red/30 mb-8"
          >
            <div className="flex items-center gap-4">
              <div className="text-bca-red text-3xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-bca-red font-bold text-lg mb-2">Minimum Videos Required</h3>
                <p className="text-white/80 text-base leading-relaxed">
                  You need at least <span className="font-semibold text-bca-gold">6 videos</span> for the homepage slideshow to work properly. 
                  Currently you have <span className="font-semibold text-bca-cyan">{list.length} video{list.length !== 1 ? 's' : ''}</span>.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Form Section */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-bca-gray-800/90 to-bca-gray-900/90 backdrop-blur-sm rounded-3xl p-8 border border-bca-gold/30 shadow-2xl mb-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {editingVideo ? 'Edit YouTube Video' : 'Add New YouTube Video'}
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-bca-gold to-bca-cyan mx-auto rounded-full"></div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
              <div className="space-y-2">
                <label className="block text-white text-base font-semibold mb-3">
                  Video Title <span className="text-bca-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-6 py-4 rounded-xl bg-black/50 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-bca-gold/50 focus:border-bca-gold/50 transition-all duration-200 text-base"
                  placeholder="Enter a descriptive title for your video"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-white text-base font-semibold mb-3">
                  YouTube URL <span className="text-bca-red">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={formData.videoUrl}
                  onChange={(e) => {
                    const newUrl = e.target.value;
                    setFormData({ 
                      ...formData, 
                      videoUrl: newUrl,
                      thumbnailUrl: newUrl ? getYouTubeThumbnail(newUrl) : ''
                    });
                  }}
                  className="w-full px-6 py-4 rounded-xl bg-black/50 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-bca-gold/50 focus:border-bca-gold/50 transition-all duration-200 text-base"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div className="flex items-center justify-center space-x-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <label className="flex items-center space-x-3 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 text-bca-gold bg-black/50 border-white/10 rounded focus:ring-bca-gold/50 focus:ring-2"
                  />
                  <span className="text-base font-medium">Make this video active on homepage</span>
                </label>
              </div>

              {formData.thumbnailUrl && (
                <div className="text-center">
                  <label className="block text-white text-base font-semibold mb-4">Thumbnail Preview</label>
                  <div className="inline-block p-2 bg-white/5 rounded-xl border border-white/10">
                    <img
                      src={formData.thumbnailUrl}
                      alt="Video thumbnail"
                      className="w-48 h-32 object-cover rounded-lg"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-6 justify-center">
                <button
                  type="submit"
                  className="group relative px-8 py-4 bg-gradient-to-r from-bca-gold to-bca-gold/80 text-black rounded-xl font-semibold hover:from-bca-gold/90 hover:to-bca-gold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(253,176,0,0.4)]"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {editingVideo ? 'Update Video' : 'Add Video'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-8 py-4 bg-gradient-to-r from-bca-gray-600 to-bca-gray-500 text-white rounded-xl font-semibold hover:from-bca-gray-500 hover:to-bca-gray-400 transition-all duration-300 hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {list.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-gradient-to-br from-bca-gray-800/90 to-bca-gray-900/90 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-bca-gold/50 transition-all duration-300 hover:shadow-[0_0_40px_rgba(253,176,0,0.2)] hover:scale-[1.02]"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-bca-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                {/* Thumbnail Section */}
                {video.thumbnailUrl && (
                  <div className="relative overflow-hidden">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-4 right-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        video.isActive 
                          ? 'bg-green-500/90 text-white' 
                          : 'bg-red-500/90 text-white'
                      }`}>
                        {video.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
                        <div className="flex items-center gap-2 text-white text-sm">
                          <svg className="w-4 h-4 text-bca-red" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                          <span className="truncate">YouTube Video</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Content Section */}
                <div className="p-6">
                  <h3 className="font-bold text-white text-lg mb-3 group-hover:text-bca-gold transition-colors duration-300 line-clamp-2">
                    {video.title}
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-bca-gray-400 text-sm">
                      <svg className="w-4 h-4 text-bca-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span className="truncate text-xs">{video.videoUrl}</span>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="px-6 pb-6">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(video)}
                      className="flex-1 group/btn relative px-4 py-3 bg-gradient-to-r from-bca-cyan/20 to-bca-cyan/10 text-bca-cyan rounded-xl text-sm font-semibold hover:from-bca-cyan/30 hover:to-bca-cyan/20 transition-all duration-300 border border-bca-cyan/30 hover:border-bca-cyan/50 hover:shadow-[0_0_20px_rgba(0,161,255,0.3)]"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </span>
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="flex-1 group/btn relative px-4 py-3 bg-gradient-to-r from-bca-red/20 to-bca-red/10 text-bca-red rounded-xl text-sm font-semibold hover:from-bca-red/30 hover:to-bca-red/20 transition-all duration-300 border border-bca-red/30 hover:border-bca-red/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {list.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-gradient-to-br from-bca-gray-800/50 to-bca-gray-900/50 backdrop-blur-sm rounded-3xl p-12 border border-white/10 max-w-md mx-auto">
              <div className="text-6xl mb-6">📹</div>
              <h3 className="text-xl font-bold text-white mb-4">No YouTube Videos Yet</h3>
              <p className="text-white/70 text-base mb-8 leading-relaxed">
                Start building your video collection to showcase your expertise on the homepage slideshow.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="group relative px-8 py-4 bg-gradient-to-r from-bca-gold to-bca-gold/80 text-black rounded-xl font-semibold hover:from-bca-gold/90 hover:to-bca-gold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(253,176,0,0.4)]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Your First Video
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
