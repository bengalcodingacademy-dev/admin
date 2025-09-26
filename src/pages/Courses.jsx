import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { SkeletonTable } from '../components/Skeleton';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// Custom Icons (matching CourseDetail.jsx)
const BookOpenIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const StarIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const CalendarIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function Courses() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    title:'',
    slug:'',
    priceRupees:0,
    shortDesc:'',
    longDesc:'',
    imageUrl:'',
    coupons: [], // Array of {code: '', discountPercent: 0}
    // Enhanced fields matching CourseDetail.jsx
    numberOfModules: 0,
    modules: [], // Array of {name: '', content: ''}
    numberOfLectures: 0,
    language: 'bengali',
    starRating: 4.9,
    numberOfStudents: 0,
    aboutCourse: '',
    courseIncludes: [], // Array of strings
    startDate: '',
    endDate: '',
    // Monthly payment fields
    durationMonths: 0,
    monthlyFeeRupees: 0,
    isMonthlyPayment: false,
    // Additional fields for course details
    modeOfCourse: 'LIVE + Recordings',
    classRecordingProvided: 'Yes [HD Quality]',
    doubtClasses: '20 Doubt Sessions',
    courseValidity: '2 Years',
    programmingLanguage: 'C++',
    classSchedule: '[Monday, Wednesday, Saturday, Sunday]',
    classTimings: '8:30pm - 11pm'
  });
  const [file, setFile] = useState(null);
  const [showCoupons, setShowCoupons] = useState(false);
  const [showModules, setShowModules] = useState(false);
  const [showIncludes, setShowIncludes] = useState(false);
  const [showTestimonials, setShowTestimonials] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialImages, setTestimonialImages] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const load = async () => {
    try {
      setLoading(true);
      console.log('Loading courses...');
      const response = await api.get('/admin/courses');
      console.log('Courses loaded:', response.data);
      setList(response.data);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { load(); }, []);
  
  const uploadPoster = async () => {
    if (!file) return null;
    const key = `courses/${form.slug || Date.now()}-${file.name}`;
    const presign = await api.post('/admin/uploads/presign', { key, contentType: file.type });
    if (presign.data.mode === 'post') {
      const { url, fields } = presign.data.post;
      const formData = new FormData();
      Object.entries(fields).forEach(([k, v]) => formData.append(k, v));
      formData.append('file', file);
      await fetch(url, { method: 'POST', body: formData });
    } else if (presign.data.uploadUrl) {
      await fetch(presign.data.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
    }
    return presign.data.publicUrl; // Direct S3 public URL
  };

  const uploadTestimonialImage = async (testimonialIndex, imageFile) => {
    if (!imageFile) return null;
    const key = `courses/testimonials/${Date.now()}-${imageFile.name}`;
    const presign = await api.post('/admin/uploads/presign', { key, contentType: imageFile.type });
    if (presign.data.mode === 'post') {
      const { url, fields } = presign.data.post;
      const formData = new FormData();
      Object.entries(fields).forEach(([k, v]) => formData.append(k, v));
      formData.append('file', imageFile);
      await fetch(url, { method: 'POST', body: formData });
    } else if (presign.data.uploadUrl) {
      await fetch(presign.data.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
    }
    return presign.data.publicUrl; // Direct S3 public URL
  };
  
  const create = async () => {
    try {
      // Clear previous messages and set loading
      setError('');
      setSuccess('');
      setIsCreating(true);
      
      // Basic validation
      if (!form.title.trim()) {
        setError('Course title is required');
        setIsCreating(false);
        return;
      }
      if (!form.slug.trim()) {
        setError('Course slug is required');
        setIsCreating(false);
        return;
      }
      if (!form.shortDesc.trim()) {
        setError('Short description is required');
        setIsCreating(false);
        return;
      }
      if (!form.longDesc.trim()) {
        setError('Long description is required');
        setIsCreating(false);
        return;
      }
      // Validate duration (required for both payment types)
      if (form.durationMonths <= 0) {
        setError('Duration must be at least 1 month');
        setIsCreating(false);
        return;
      }
      
      // Validate pricing based on payment type
      if (form.isMonthlyPayment) {
        if (form.monthlyFeeRupees <= 0) {
          setError('Monthly fee must be greater than 0');
          setIsCreating(false);
          return;
        }
      } else {
        if (form.priceRupees <= 0) {
          setError('Price must be greater than 0');
          setIsCreating(false);
          return;
        }
      }
      
      let imageUrl = form.imageUrl;
      if (file) imageUrl = await uploadPoster();
      
      const payload = { 
        ...form, 
        imageUrl,
        modulesJson: form.modules.length > 0 ? form.modules : null,
        courseIncludes: form.courseIncludes.length > 0 ? form.courseIncludes : null,
        startDate: form.startDate ? new Date(form.startDate) : null,
        // Store rupees directly
        priceRupees: form.isMonthlyPayment ? 0 : form.priceRupees,
        monthlyFeeRupees: form.isMonthlyPayment ? form.monthlyFeeRupees : 0,
        endDate: form.endDate ? new Date(form.endDate) : null
      };
      
      console.log('Form data before sending:', {
        isMonthlyPayment: form.isMonthlyPayment,
        priceRupees: form.priceRupees,
        monthlyFeeRupees: form.monthlyFeeRupees
      });
      console.log('Payload being sent:', {
        priceRupees: payload.priceRupees,
        monthlyFeeRupees: payload.monthlyFeeRupees
      });
      console.log('Price input value:', form.priceRupees, 'Type:', typeof form.priceRupees);
      
      if (!payload.imageUrl) delete payload.imageUrl;
      
      let response;
      let courseId;
      if (isEditing && editingCourse) {
        // Update existing course
        response = await api.put(`/admin/courses/${editingCourse.id}`, payload);
        courseId = editingCourse.id;
      } else {
        // Create new course
        response = await api.post('/admin/courses', payload);
        courseId = response.data.id;
      }
      
      // Create testimonials if any
      if (testimonials.length > 0) {
        for (let i = 0; i < testimonials.length; i++) {
          const testimonial = testimonials[i];
          let imageUrl = testimonial.studentImage;
          
          // Upload testimonial image if file exists
          if (testimonialImages[i]) {
            imageUrl = await uploadTestimonialImage(i, testimonialImages[i]);
          }
          
          await api.post('/admin/testimonials', {
            ...testimonial,
            studentImage: imageUrl,
            courseId: courseId
          });
        }
      }
      
      setSuccess(isEditing ? 'Course updated successfully!' : 'Course created successfully!');
      setIsCreating(false);
      
      // Reset form and editing state
      setForm({ 
        title:'', slug:'', priceRupees:0, shortDesc:'', longDesc:'', imageUrl:'', coupons: [],
        numberOfModules: 0, modules: [], numberOfLectures: 0, language: 'bengali',
        starRating: 4.9, numberOfStudents: 0, aboutCourse: '', courseIncludes: [],
        startDate: '', endDate: '', durationMonths: 0, monthlyFeeRupees: 0, isMonthlyPayment: false,
        modeOfCourse: 'LIVE + Recordings', classRecordingProvided: 'Yes [HD Quality]', 
        doubtClasses: '20 Doubt Sessions', courseValidity: '2 Years', programmingLanguage: 'C++',
        classSchedule: '[Monday, Wednesday, Saturday, Sunday]', classTimings: '8:30pm - 11pm'
      });
      setFile(null);
      setTestimonials([]);
      setTestimonialImages({});
      setShowCoupons(false);
      setShowModules(false);
      setShowIncludes(false);
      setShowTestimonials(false);
      setEditingCourse(null);
      setIsEditing(false);
      
      // Refresh the courses list with a small delay to ensure the course is created
      setTimeout(() => {
        load();
      }, 500);
    } catch (error) {
      console.error('Error creating course:', error);
      setIsCreating(false);
      
      // Handle different types of errors
      if (error.response?.data?.message) {
        // Handle Zod validation errors
        if (error.response.data.message.includes('ZodError')) {
          const zodError = error.response.data;
          if (zodError.issues && Array.isArray(zodError.issues)) {
            const errorMessages = zodError.issues.map(issue => {
              const field = issue.path.join('.');
              switch (issue.code) {
                case 'too_small':
                  return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${issue.minimum} characters long`;
                case 'too_big':
                  return `${field.charAt(0).toUpperCase() + field.slice(1)} must be no more than ${issue.maximum} characters long`;
                case 'invalid_type':
                  return `${field.charAt(0).toUpperCase() + field.slice(1)} has an invalid format`;
                case 'required':
                  return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
                default:
                  return `${field.charAt(0).toUpperCase() + field.slice(1)}: ${issue.message}`;
              }
            });
            setError(errorMessages.join(', '));
          } else {
            setError('Please check all required fields and try again');
          }
        } else {
          setError(error.response.data.message);
        }
      } else if (error.response?.status === 400) {
        setError('Invalid data provided. Please check all fields and try again.');
      } else if (error.response?.status === 401) {
        setError('You are not authorized to perform this action.');
      } else if (error.response?.status === 500) {
        setError('Server error occurred. Please try again later.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };
  
  const remove = async (id) => { 
    try {
      if (window.confirm('Are you sure you want to delete this course? This will permanently delete the course and all associated data (purchases, monthly payments, testimonials, coupons, announcements, course content). This action cannot be undone.')) {
        // Clear previous messages
        setError('');
        setSuccess('');
        
        // Show loading state
        setLoading(true);
        
        const response = await api.delete(`/admin/courses/${id}`); 
        console.log('Delete response:', response.data);
        
        // Show success message
        setSuccess('Course deleted successfully!');
        
        // Reload the courses list
        await load();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
        
        // Force a small delay to ensure the UI updates properly
        setTimeout(() => {
          // Scroll to top to show the updated list
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      setError(error.response?.data?.error || 'Failed to delete course. Please try again.');
      setLoading(false); // Reset loading state on error
    }
  };

  const editCourse = async (course) => {
    try {
      setEditingCourse(course);
      setIsEditing(true);
      
      // Debug: Log the raw price value from database
      console.log('Course price from DB:', course.priceRupees, 'Parsed:', parseFloat(course.priceRupees) || 0);
      
      // Populate form with course data
      setForm({
        title: course.title || '',
        slug: course.slug || '',
        priceRupees: parseFloat(course.priceRupees) || 0,
        shortDesc: course.shortDesc || '',
        longDesc: course.longDesc || '',
        imageUrl: course.imageUrl || '',
        coupons: course.coupons || [],
        numberOfModules: course.numberOfModules || 0,
        modules: course.modulesJson || [],
        numberOfLectures: course.numberOfLectures || 0,
        language: course.language || 'bengali',
        starRating: course.starRating || 4.9,
        numberOfStudents: course.numberOfStudents || 0,
        aboutCourse: course.aboutCourse || '',
        courseIncludes: course.courseIncludes || [],
        startDate: course.startDate ? new Date(course.startDate).toISOString().split('T')[0] : '',
        endDate: course.endDate ? new Date(course.endDate).toISOString().split('T')[0] : '',
        durationMonths: course.durationMonths || 0,
        monthlyFeeRupees: parseFloat(course.monthlyFeeRupees) || 0,
        isMonthlyPayment: course.isMonthlyPayment || false,
        modeOfCourse: 'LIVE + Recordings',
        classRecordingProvided: 'Yes [HD Quality]',
        doubtClasses: '20 Doubt Sessions',
        courseValidity: '2 Years',
        programmingLanguage: 'C++',
        classSchedule: '[Monday, Wednesday, Saturday, Sunday]',
        classTimings: '8:30pm - 11pm'
      });
      
      // Set testimonials if any
      if (course.testimonials && course.testimonials.length > 0) {
        setTestimonials(course.testimonials);
      }
      
      // Scroll to form
      document.getElementById('course-form')?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error loading course for editing:', error);
    }
  };

  const cancelEdit = () => {
    setEditingCourse(null);
    setIsEditing(false);
    // Reset form to default values
    setForm({
      title:'',
      slug:'',
      priceRupees:0,
      shortDesc:'',
      longDesc:'',
      imageUrl:'',
      coupons: [],
      numberOfModules: 0,
      modules: [],
      numberOfLectures: 0,
      language: 'bengali',
      starRating: 4.9,
      numberOfStudents: 0,
      aboutCourse: '',
      courseIncludes: [],
      startDate: '',
      endDate: '',
      durationMonths: 0,
      monthlyFeeRupees: 0,
      isMonthlyPayment: false,
      modeOfCourse: 'LIVE + Recordings',
      classRecordingProvided: 'Yes [HD Quality]',
      doubtClasses: '20 Doubt Sessions',
      courseValidity: '2 Years',
      programmingLanguage: 'C++',
      classSchedule: '[Monday, Wednesday, Saturday, Sunday]',
      classTimings: '8:30pm - 11pm'
    });
    setTestimonials([]);
    setTestimonialImages({});
  };

  const addCoupon = () => {
    setForm(prev => ({
      ...prev,
      coupons: [...prev.coupons, { code: '', discountPercent: 10 }]
    }));
  };

  const updateCoupon = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      coupons: prev.coupons.map((coupon, i) => 
        i === index ? { ...coupon, [field]: value } : coupon
      )
    }));
  };

  const removeCoupon = (index) => {
    setForm(prev => ({
      ...prev,
      coupons: prev.coupons.filter((_, i) => i !== index)
    }));
  };

  // Module management functions
  const addModule = () => {
    setForm(prev => ({
      ...prev,
      modules: [...prev.modules, { name: '', content: '' }]
    }));
  };

  const updateModule = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      modules: prev.modules.map((module, i) => 
        i === index ? { ...module, [field]: value } : module
      )
    }));
  };

  const removeModule = (index) => {
    setForm(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index)
    }));
  };

  // Course includes management functions
  const addInclude = () => {
    setForm(prev => ({
      ...prev,
      courseIncludes: [...prev.courseIncludes, '']
    }));
  };

  const updateInclude = (index, value) => {
    setForm(prev => ({
      ...prev,
      courseIncludes: prev.courseIncludes.map((item, i) => 
        i === index ? value : item
      )
    }));
  };

  const removeInclude = (index) => {
    setForm(prev => ({
      ...prev,
      courseIncludes: prev.courseIncludes.filter((_, i) => i !== index)
    }));
  };

  // Testimonials management functions
  const addTestimonial = () => {
    setTestimonials(prev => [...prev, {
      studentName: '',
      studentImage: '',
      studentAbout: '',
      comment: '',
      rating: 5
    }]);
  };

  const updateTestimonial = (index, field, value) => {
    setTestimonials(prev => prev.map((testimonial, i) => 
      i === index ? { ...testimonial, [field]: value } : testimonial
    ));
  };

  const removeTestimonial = (index) => {
    setTestimonials(prev => prev.filter((_, i) => i !== index));
    setTestimonialImages(prev => {
      const newImages = { ...prev };
      delete newImages[index];
      return newImages;
    });
  };

  const handleTestimonialImageChange = (index, file) => {
    setTestimonialImages(prev => ({
      ...prev,
      [index]: file
    }));
  };

  // Clear error when user starts typing
  const clearError = () => {
    if (error) setError('');
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <SkeletonTable rows={5} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bca-black text-white">
      {/* Breadcrumbs */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <nav className="text-sm text-bca-gray-400">
          <span className="hover:text-white">Admin</span>
          <span className="mx-2">›</span>
          <span className="text-white">Create Course</span>
        </nav>
      </div>

      {/* Welcome Message */}
      <div className="max-w-6xl mx-auto px-4 pb-6">
        <motion.div
          id="course-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-2">
            <h2 className="text-2xl font-bold text-bca-gold">
              {isEditing ? `Edit Course: ${editingCourse?.title}` : 'Create New Course'}
            </h2>
            {isEditing && (
              <button
                onClick={cancelEdit}
                className="px-4 py-2 bg-bca-gray-600 text-white rounded-lg hover:bg-bca-gray-500 transition-colors text-sm"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 pb-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/50 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div>
                <h3 className="text-red-400 font-semibold">Error</h3>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {success && (
        <div className="max-w-6xl mx-auto px-4 pb-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/20 border border-green-500/50 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <div>
                <h3 className="text-green-400 font-semibold">Success</h3>
                <p className="text-green-300 text-sm">{success}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Course Creation Form</h1>
              
              {/* Required Fields Note */}
              <div className="mb-6 p-4 bg-bca-gray-800 rounded-lg border border-bca-gray-700">
                <p className="text-bca-gray-300 text-sm">
                  <span className="text-red-400">*</span> Required fields must be filled out before creating the course.
                </p>
              </div>
              
              {/* Course Title Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-bca-gray-300 mb-2">
                  Course Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter course title"
                  className="w-full px-4 py-3 rounded-lg bg-bca-gray-800 border border-bca-gray-700 text-white focus:outline-none focus:border-bca-gold text-2xl font-bold"
                  value={form.title}
                  onChange={e=>{
                    setForm(f=>({...f,title: e.target.value}));
                    clearError();
                  }}
                />
              </div>

              {/* Course Info Tags */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full text-green-400 text-sm">
                  <BookOpenIcon className="w-4 h-4" />
                  <input
                    type="number"
                    placeholder="100"
                    className="bg-transparent border-none outline-none text-green-400 w-16"
                    value={form.numberOfLectures}
                    onChange={e=>setForm(f=>({...f,numberOfLectures: Number(e.target.value||0)}))}
                  />
                  <span>+ Lectures</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full text-blue-400 text-sm">
                  <select
                    className="bg-transparent border-none outline-none text-blue-400 capitalize"
                    value={form.language}
                    onChange={e=>setForm(f=>({...f,language: e.target.value}))}
                  >
                    <option value="bengali">Bengali</option>
                    <option value="hindi">Hindi</option>
                    <option value="english">English</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 rounded-full text-yellow-400 text-sm">
                  <StarIcon className="w-4 h-4" />
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    placeholder="4.9"
                    className="bg-transparent border-none outline-none text-yellow-400 w-12"
                    value={form.starRating}
                    onChange={e=>setForm(f=>({...f,starRating: Number(e.target.value||0)}))}
                  />
                  <span>★★★★</span>
                </div>
              </div>
            </motion.div>

            {/* About Course */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-white mb-4">About Course</h2>
              <div className="bg-white rounded-lg border border-gray-300">
                <CKEditor
                  editor={ClassicEditor}
                  data={form.aboutCourse}
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    setForm(prev => ({ ...prev, aboutCourse: data }));
                    clearError();
                  }}
                  config={{
                    toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'outdent', 'indent', '|', 'blockQuote', 'insertTable', 'undo', 'redo'],
                    placeholder: 'Enter detailed course description...'
                  }}
                  onReady={(editor) => {
                    // Apply light theme styling
                    const editorElement = editor.ui.getEditableElement();
                    const toolbarElement = editor.ui.view.toolbar.element;
                    
                    if (editorElement) {
                      editorElement.style.backgroundColor = '#ffffff';
                      editorElement.style.color = '#000000';
                      editorElement.style.border = '1px solid #d1d5db';
                      editorElement.style.minHeight = '200px';
                    }
                    
                    if (toolbarElement) {
                      toolbarElement.style.backgroundColor = '#f9fafb';
                      toolbarElement.style.borderBottom = '1px solid #e5e7eb';
                      toolbarElement.style.borderTop = '1px solid #e5e7eb';
                    }
                  }}
                />
              </div>
            </motion.div>

            {/* Long Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-white mb-4">
                Long Description <span className="text-red-400">*</span>
              </h2>
              <div className="bg-white rounded-lg border border-gray-300">
                <CKEditor
                  editor={ClassicEditor}
                  data={form.longDesc}
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    setForm(prev => ({ ...prev, longDesc: data }));
                    clearError();
                  }}
                  config={{
                    toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'outdent', 'indent', '|', 'blockQuote', 'insertTable', 'undo', 'redo'],
                    placeholder: 'Enter detailed course content...'
                  }}
                  onReady={(editor) => {
                    // Apply light theme styling
                    const editorElement = editor.ui.getEditableElement();
                    const toolbarElement = editor.ui.view.toolbar.element;
                    
                    if (editorElement) {
                      editorElement.style.backgroundColor = '#ffffff';
                      editorElement.style.color = '#000000';
                      editorElement.style.border = '1px solid #d1d5db';
                      editorElement.style.minHeight = '200px';
                    }
                    
                    if (toolbarElement) {
                      toolbarElement.style.backgroundColor = '#f9fafb';
                      toolbarElement.style.borderBottom = '1px solid #e5e7eb';
                      toolbarElement.style.borderTop = '1px solid #e5e7eb';
                    }
                  }}
                />
              </div>
            </motion.div>

            {/* Course Details Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Course Details</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-bca-gray-800 rounded-lg p-4 border border-bca-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-blue-400 text-sm">📚</span>
                    </div>
                    <span className="text-sm text-bca-gray-400">Mode of the Course</span>
                  </div>
                  <input
                    type="text"
                    className="w-full bg-transparent border-none outline-none text-white font-medium"
                    value={form.modeOfCourse}
                    onChange={e=>setForm(f=>({...f,modeOfCourse: e.target.value}))}
                  />
                </div>

                <div className="bg-bca-gray-800 rounded-lg p-4 border border-bca-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-green-400 text-sm">📋</span>
                    </div>
                    <span className="text-sm text-bca-gray-400">No. Of Lectures</span>
                  </div>
                  <input
                    type="number"
                    className="w-full bg-transparent border-none outline-none text-white font-medium"
                    value={form.numberOfLectures}
                    onChange={e=>setForm(f=>({...f,numberOfLectures: Number(e.target.value||0)}))}
                  />
                  <span className="text-white font-medium">LIVE lectures + Recordings [HomeWork Solutions]</span>
                </div>

                <div className="bg-bca-gray-800 rounded-lg p-4 border border-bca-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-purple-400 text-sm">🎥</span>
                    </div>
                    <span className="text-sm text-bca-gray-400">Class Recording Provided</span>
                  </div>
                  <input
                    type="text"
                    className="w-full bg-transparent border-none outline-none text-white font-medium"
                    value={form.classRecordingProvided}
                    onChange={e=>setForm(f=>({...f,classRecordingProvided: e.target.value}))}
                  />
                </div>

                <div className="bg-bca-gray-800 rounded-lg p-4 border border-bca-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-orange-400 text-sm">💬</span>
                    </div>
                    <span className="text-sm text-bca-gray-400">Doubt Classes</span>
                  </div>
                  <input
                    type="text"
                    className="w-full bg-transparent border-none outline-none text-white font-medium"
                    value={form.doubtClasses}
                    onChange={e=>setForm(f=>({...f,doubtClasses: e.target.value}))}
                  />
                </div>

                <div className="bg-bca-gray-800 rounded-lg p-4 border border-bca-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-red-400 text-sm">📅</span>
                    </div>
                    <span className="text-sm text-bca-gray-400">Course Validity</span>
                  </div>
                  <input
                    type="text"
                    className="w-full bg-transparent border-none outline-none text-white font-medium"
                    value={form.courseValidity}
                    onChange={e=>setForm(f=>({...f,courseValidity: e.target.value}))}
                  />
                </div>

                <div className="bg-bca-gray-800 rounded-lg p-4 border border-bca-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-cyan-400 text-sm">&lt;/&gt;</span>
                    </div>
                    <span className="text-sm text-bca-gray-400">Programming Language Used</span>
                  </div>
                  <input
                    type="text"
                    className="w-full bg-transparent border-none outline-none text-white font-medium"
                    value={form.programmingLanguage}
                    onChange={e=>setForm(f=>({...f,programmingLanguage: e.target.value}))}
                  />
                </div>

                <div className="bg-bca-gray-800 rounded-lg p-4 border border-bca-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <CalendarIcon className="w-4 h-4 text-yellow-400" />
                    </div>
                    <span className="text-sm text-bca-gray-400">Class starts on</span>
                  </div>
                  <input
                    type="date"
                    className="w-full bg-transparent border-none outline-none text-white font-medium"
                    value={form.startDate}
                    onChange={e=>setForm(f=>({...f,startDate: e.target.value}))}
                  />
                </div>

                <div className="bg-bca-gray-800 rounded-lg p-4 border border-bca-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                      <ClockIcon className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="text-sm text-bca-gray-400">Class Schedule LIVE</span>
                  </div>
                  <input
                    type="text"
                    className="w-full bg-transparent border-none outline-none text-white font-medium"
                    value={form.classSchedule}
                    onChange={e=>setForm(f=>({...f,classSchedule: e.target.value}))}
                  />
                </div>

                <div className="bg-bca-gray-800 rounded-lg p-4 border border-bca-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center">
                      <ClockIcon className="w-4 h-4 text-pink-400" />
                    </div>
                    <span className="text-sm text-bca-gray-400">Class Timings</span>
                  </div>
                  <input
                    type="text"
                    className="w-full bg-transparent border-none outline-none text-white font-medium"
                    value={form.classTimings}
                    onChange={e=>setForm(f=>({...f,classTimings: e.target.value}))}
                  />
                </div>
              </div>
            </motion.div>

            {/* Course Includes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-white mb-4">This Course Includes</h2>
              <p className="text-bca-gray-300 mb-6">
                Add what this course includes. Each item will be displayed with a checkmark.
              </p>
              
              <div className="space-y-3 mb-4">
                {form.courseIncludes.map((include, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Course inclusion (e.g., '100+ hours Video Content')"
                      className="flex-1 px-3 py-2 rounded-lg bg-bca-gray-800 border border-bca-gray-700 text-white focus:outline-none focus:border-bca-gold"
                      value={include}
                      onChange={e => updateInclude(index, e.target.value)}
                    />
                    <button
                      onClick={() => removeInclude(index)}
                      className="px-3 py-2 bg-bca-red/20 text-bca-red rounded-lg hover:bg-bca-red/30 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              
              <button
                onClick={addInclude}
                className="px-4 py-2 bg-bca-gold/20 text-bca-gold rounded-lg hover:bg-bca-gold/30 transition-colors"
              >
                + Add Course Inclusion
              </button>
            </motion.div>

            {/* Course Modules */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Comprehensive Course Modules</h2>
              <p className="text-bca-gray-300 mb-6">
                Add course modules with detailed content.
              </p>
              
              <div className="space-y-3">
                {form.modules.map((module, index) => (
                  <div key={index} className="bg-bca-gray-800 rounded-lg border border-bca-gray-700 overflow-hidden">
                    <div className="px-6 py-4">
                      <div className="flex items-center justify-between mb-4">
                        <input
                          type="text"
                          placeholder="Module Name (e.g., C++ Basics)"
                          className="flex-1 px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold font-medium"
                          value={module.name}
                          onChange={e => updateModule(index, 'name', e.target.value)}
                        />
                        <button
                          onClick={() => removeModule(index)}
                          className="ml-3 px-3 py-2 bg-bca-red/20 text-bca-red rounded-lg hover:bg-bca-red/30 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="bg-white rounded-lg border border-gray-300">
                        <CKEditor
                          editor={ClassicEditor}
                          data={module.content}
                          onChange={(event, editor) => {
                            const data = editor.getData();
                            updateModule(index, 'content', data);
                          }}
                          config={{
                            toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'outdent', 'indent', '|', 'blockQuote', 'insertTable', 'undo', 'redo'],
                            placeholder: 'Enter module content...'
                          }}
                          onReady={(editor) => {
                            // Apply light theme styling
                            const editorElement = editor.ui.getEditableElement();
                            const toolbarElement = editor.ui.view.toolbar.element;
                            
                            if (editorElement) {
                              editorElement.style.backgroundColor = '#ffffff';
                              editorElement.style.color = '#000000';
                              editorElement.style.border = '1px solid #d1d5db';
                              editorElement.style.minHeight = '200px';
                            }
                            
                            if (toolbarElement) {
                              toolbarElement.style.backgroundColor = '#f9fafb';
                              toolbarElement.style.borderBottom = '1px solid #e5e7eb';
                              toolbarElement.style.borderTop = '1px solid #e5e7eb';
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-4">
                <button
                  onClick={addModule}
                  className="px-6 py-3 bg-bca-gold/20 text-bca-gold rounded-lg hover:bg-bca-gold/30 transition-colors font-medium"
                >
                  + Add New Module
                </button>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Course Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-20"
            >
              <div className="bg-bca-gray-800 rounded-xl border border-bca-gray-700 overflow-hidden">
                {/* Course Banner */}
                <div className="relative h-48 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  {form.imageUrl && (
                    <img 
                      src={form.imageUrl} 
                      alt={form.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div className="relative z-10 text-center text-white">
                    <h3 className="text-lg font-bold mb-2">{form.title || 'Course Title'}</h3>
                  </div>
                </div>

                {/* Course Details Form */}
                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-bca-gray-300 mb-2">
                        Slug <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="course-slug"
                        className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
                        value={form.slug}
                        onChange={e=>{
                          setForm(f=>({...f,slug: e.target.value}));
                          clearError();
                        }}
                      />
                    </div>
                    
                    {!form.isMonthlyPayment && (
                      <div>
                        <label className="block text-sm font-medium text-bca-gray-300 mb-2">
                          Price (₹) <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="number"
                          placeholder="0"
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
                          value={form.priceRupees}
                          onChange={e=>{
                            setForm(f=>({...f,priceRupees: Number(e.target.value||0)}));
                            clearError();
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Monthly Payment Fields */}
                    <div className="col-span-2">
                      <div className="bg-bca-gray-800 rounded-lg p-4 border border-bca-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Payment Settings</h3>
                        <div className="mb-4 p-3 bg-bca-gray-700 rounded-lg">
                          <p className="text-bca-gray-300 text-sm">
                            {form.isMonthlyPayment ? (
                              <span className="text-bca-gold">💰 Monthly Payment Mode</span>
                            ) : (
                              <span className="text-bca-gold">💳 Single Payment Mode</span>
                            )}
                          </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-bca-gray-300 mb-2">
                              <input
                                type="checkbox"
                                className="mr-2"
                                checked={form.isMonthlyPayment}
                                onChange={e=>{
                                  const isMonthly = e.target.checked;
                                  setForm(f=>({
                                    ...f,
                                    isMonthlyPayment: isMonthly,
                                    // Clear the opposite price field when switching
                                    priceRupees: isMonthly ? 0 : f.priceRupees,
                                    monthlyFeeRupees: isMonthly ? f.monthlyFeeRupees : 0
                                    // Keep durationMonths for both payment types
                                  }));
                                  clearError();
                                }}
                              />
                              Enable Monthly Payment
                            </label>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-bca-gray-300 mb-2">
                              Duration (Months) *
                            </label>
                            <input
                              type="number"
                              placeholder="6"
                              min="1"
                              className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
                              value={form.durationMonths}
                              onChange={e=>setForm(f=>({...f,durationMonths: Number(e.target.value||0)}))}
                            />
                          </div>
                          {form.isMonthlyPayment && (
                            <div>
                              <label className="block text-sm font-medium text-bca-gray-300 mb-2">
                                Monthly Fee (₹)
                              </label>
                              <input
                                type="number"
                                placeholder="1500"
                                min="0"
                                step="0.01"
                                className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
                                value={form.monthlyFeeRupees}
                                onChange={e=>{
                                  const value = Number(e.target.value||0);
                                  console.log('Monthly fee input changed:', e.target.value, '->', value);
                                  setForm(f=>({...f,monthlyFeeRupees: value}));
                                }}
                              />
                            </div>
                          )}
                        </div>
                        {form.isMonthlyPayment && (
                          <div className="mt-3 p-3 bg-bca-gold/10 rounded-lg border border-bca-gold/30">
                            <p className="text-bca-gold text-sm">
                              💡 Monthly Payment: ₹{(parseFloat(form.monthlyFeeRupees) || 0).toFixed(2)} per month for {form.durationMonths} months
                              {form.durationMonths > 0 && form.monthlyFeeRupees > 0 && (
                                <span className="block mt-1">
                                  Total: ₹{(form.durationMonths * (parseFloat(form.monthlyFeeRupees) || 0)).toFixed(2)}
                                </span>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-bca-gray-300 mb-2">
                        Short Description <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        placeholder="Brief course description"
                        className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
                        value={form.shortDesc}
                        onChange={e=>{
                          setForm(f=>({...f,shortDesc: e.target.value}));
                          clearError();
                        }}
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-bca-gray-300 mb-2">Course Poster</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e=>setFile(e.target.files?.[0]||null)} 
                        className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold" 
                      />
                    </div>
                  </div>

                  {/* Coupon Key-Value Pairs */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Coupon Key-Value Pairs</h3>
                    <div className="space-y-3">
                      {form.coupons.map((coupon, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Coupon Key"
                            className="flex-1 px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
                            value={coupon.code}
                            onChange={e => updateCoupon(index, 'code', e.target.value)}
                          />
                          <input
                            type="number"
                            placeholder="Value"
                            min="1"
                            max="100"
                            className="w-24 px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
                            value={coupon.discountPercent}
                            onChange={e => updateCoupon(index, 'discountPercent', parseInt(e.target.value) || 0)}
                          />
                          <button
                            onClick={() => removeCoupon(index)}
                            className="px-3 py-2 bg-bca-red/20 text-bca-red rounded-lg hover:bg-bca-red/30 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={addCoupon}
                        className="w-full px-4 py-2 bg-bca-gold/20 text-bca-gold rounded-lg hover:bg-bca-gold/30 transition-colors"
                      >
                        + Add Coupon
                      </button>
                    </div>
                  </div>

                  {/* Create Course Button */}
                  <button 
                    onClick={create} 
                    disabled={isCreating}
                    className={`w-full py-4 font-bold text-lg rounded-lg transition-colors ${
                      isCreating 
                        ? 'bg-bca-gray-600 text-bca-gray-400 cursor-not-allowed' 
                        : 'bg-bca-gold text-black hover:bg-bca-gold/80'
                    }`}
                  >
                    {isCreating ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-bca-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        {isEditing ? 'Updating Course...' : 'Creating Course...'}
                      </div>
                    ) : (
                      isEditing ? 'Update Course' : 'Create Course'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Course List */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-white mb-6">Existing Courses</h2>
        <div className="grid gap-4">
          {list.map(c => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-bca-gray-800 rounded-lg p-6 border border-bca-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {c.imageUrl && (
                    <img
                      src={c.imageUrl}
                      alt={c.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white">{c.title}</h3>
                    <p className="text-bca-gray-300 text-sm mb-1">{c.shortDesc}</p>
                    {c.isMonthlyPayment ? (
                      <div>
                        <p className="text-bca-gold font-semibold">
                          ₹{(parseFloat(c.monthlyFeeRupees) || 0).toFixed(2)} per month for {c.durationMonths} months
                        </p>
                        <p className="text-bca-gray-400 text-xs">
                          Total: ₹{((parseFloat(c.monthlyFeeRupees) || 0) * (c.durationMonths || 0)).toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-bca-gold font-semibold">₹{(parseFloat(c.priceRupees) || 0).toFixed(2)}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={()=>editCourse(c)} 
                    className="px-4 py-2 bg-bca-cyan/20 text-bca-cyan rounded-lg hover:bg-bca-cyan/30 transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={()=>remove(c.id)} 
                    className="px-4 py-2 bg-bca-red/20 text-bca-red rounded-lg hover:bg-bca-red/30 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {list.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-bca-gray-400 text-lg">No courses found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
