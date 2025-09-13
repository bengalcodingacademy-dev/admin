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
      className={`group relative overflow-hidden rounded-2xl border-2 ${colorClasses[color]} bg-bca-gray-800/50 backdrop-blur-sm p-6 transition-all duration-300 hover:bg-bca-gray-800/70`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 rounded-xl bg-${color === 'gold' ? 'bca-gold' : color === 'cyan' ? 'bca-cyan' : 'bca-red'}/20`}>
            {icon}
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-bca-gold transition-colors">
            {title}
          </h3>
        </div>
        <p className="text-bca-gray-300 mb-4 text-sm leading-relaxed">
          {description}
        </p>
        <Link 
          to={to}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-${color === 'gold' ? 'bca-gold' : color === 'cyan' ? 'bca-cyan' : 'bca-red'}/20 text-${color === 'gold' ? 'bca-gold' : color === 'cyan' ? 'bca-cyan' : 'bca-red'} hover:bg-${color === 'gold' ? 'bca-gold' : color === 'cyan' ? 'bca-cyan' : 'bca-red'}/30 transition-all duration-200 font-medium`}
        >
          Manage
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      to: '/transactions',
      title: 'Transaction Management',
      description: 'Approve or decline UPI payments and manage student enrollments.',
      icon: (
        <svg className="w-6 h-6 text-bca-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'red'
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
      to: '/meeting-requests',
      title: 'Meeting Requests',
      description: 'Review and manage 1:1 meeting requests from students.',
      icon: (
        <svg className="w-6 h-6 text-bca-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'gold'
    }
  ];

  return (
    <div className="min-h-screen bg-bca-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-bca-gold via-bca-cyan to-bca-gold bg-clip-text text-transparent">
            BCA Admin Panel
          </h1>
          <p className="text-bca-gray-300 text-lg max-w-2xl mx-auto">
            Manage your coding academy with powerful tools and analytics
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
