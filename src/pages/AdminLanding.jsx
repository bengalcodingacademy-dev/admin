import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminCard = ({ to, title, description, icon, color = 'gold' }) => {
  const colorClasses = {
    gold: 'border-bca-gold shadow-bca-gold/20 hover:shadow-bca-gold/40',
    cyan: 'border-bca-cyan shadow-bca-cyan/20 hover:shadow-bca-cyan/40',
    red: 'border-bca-red shadow-bca-red/20 hover:shadow-bca-red/40'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      className={`group relative overflow-hidden rounded-2xl border-2 ${colorClasses[color]} bg-bca-gray-800/50 backdrop-blur-sm p-4 md:p-6 transition-all duration-300 hover:bg-bca-gray-800/70`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
          <div className={`p-2 md:p-3 rounded-xl bg-${color === 'gold' ? 'bca-gold' : color === 'cyan' ? 'bca-cyan' : 'bca-red'}/20`}>
            <div className="w-4 h-4 md:w-6 md:h-6">
              {icon}
            </div>
          </div>
          <h3 className="text-base md:text-xl font-bold text-white group-hover:text-bca-gold transition-colors">
            {title}
          </h3>
        </div>
        <p className="text-bca-gray-300 mb-3 md:mb-4 text-xs md:text-sm leading-relaxed">
          {description}
        </p>
        <Link 
          to={to}
          className={`inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-${color === 'gold' ? 'bca-gold' : color === 'cyan' ? 'bca-cyan' : 'bca-red'}/20 text-${color === 'gold' ? 'bca-gold' : color === 'cyan' ? 'bca-cyan' : 'bca-red'} hover:bg-${color === 'gold' ? 'bca-gold' : color === 'cyan' ? 'bca-cyan' : 'bca-red'}/30 transition-all duration-200 font-medium text-xs md:text-sm`}
        >
          Manage
          <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </motion.div>
  );
};

export default function AdminLanding() {
  const cards = [
    {
      to: '/courses',
      title: 'Course Management',
      description: 'Create, edit, and manage courses with posters, pricing, and coupons.',
      icon: (
        <svg className="w-6 h-6 text-bca-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'gold'
    },
    {
      to: '/course-content',
      title: 'Upload Video & Notes',
      description: 'Manage course content including videos, GitHub repos, and notes for each month.',
      icon: (
        <svg className="w-6 h-6 text-bca-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      color: 'gold'
    },
    {
      to: '/webinars',
      title: 'Webinar Management',
      description: 'Schedule and manage free webinars for student engagement.',
      icon: (
        <svg className="w-6 h-6 text-bca-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      color: 'cyan'
    },
    {
      to: '/announcements',
      title: 'Announcements',
      description: 'Create and push announcements to keep students informed.',
      icon: (
        <svg className="w-6 h-6 text-bca-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
      color: 'cyan'
    },
    {
      to: '/sales',
      title: 'Sales Analytics',
      description: 'Track revenue, monthly sales, and purchase analytics.',
      icon: (
        <svg className="w-6 h-6 text-bca-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'gold'
    },
    {
      to: '/users',
      title: 'User Management',
      description: 'View and manage student profiles, roles, and enrollment status.',
      icon: (
        <svg className="w-6 h-6 text-bca-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      color: 'gold'
    },
    {
      to: '/testimonials',
      title: 'Testimonials',
      description: 'Manage student testimonials with images, comments, and ratings.',
      icon: (
        <svg className="w-6 h-6 text-bca-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
      color: 'cyan'
    },
    {
      to: '/youtube-videos',
      title: 'YouTube Videos',
      description: 'Manage YouTube videos for the homepage slideshow with automatic rotation.',
      icon: (
        <svg className="w-6 h-6 text-bca-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'gold'
    },
    {
      to: '/meeting-requests',
      title: 'Meeting Requests',
      description: 'Review and manage 1:1 meeting requests from students.',
      icon: (
        <svg className="w-6 h-6 text-bca-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'gold'
    },
    {
      to: '/unique-visitors',
      title: 'Unique Visitors',
      description: 'Track and analyze unique website visitors with daily analytics and statistics.',
      icon: (
        <svg className="w-6 h-6 text-bca-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'cyan'
    },
    {
      to: '/dml',
      title: 'DML Operations',
      description: 'Perform important database operations like granting course access for personal payments.',
      icon: (
        <svg className="w-6 h-6 text-bca-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'red'
    },
    {
      to: '/quiz-exams',
      title: 'Quiz Exam Management',
      description: 'Create comprehensive quiz exams with multiple questions, track student attempts, and analyze performance.',
      icon: (
        <svg className="w-6 h-6 text-bca-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      color: 'gold'
    },
    {
      to: '/quiz-analytics',
      title: 'Quiz Analytics',
      description: 'View detailed performance analytics, leaderboards, and insights for quiz exams and student progress.',
      icon: (
        <svg className="w-6 h-6 text-bca-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'cyan'
    }
  ];

  return (
    <div className="min-h-screen bg-bca-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-bca-gold via-bca-cyan to-bca-gold bg-clip-text text-transparent">
            BCA Admin Panel
          </h1>
          <p className="text-bca-gray-300 text-sm md:text-lg max-w-2xl mx-auto">
            Manage your coding academy with powerful tools and analytics
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
        >
          {cards.map((card, index) => (
            <motion.div
              key={card.to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <AdminCard {...card} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
