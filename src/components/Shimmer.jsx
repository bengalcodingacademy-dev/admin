import React from 'react';

const Shimmer = ({ 
  type = 'card', 
  className = '', 
  count = 1,
  height = 'auto',
  width = '100%'
}) => {
  // Clean skeleton loading style - no borders, subtle gradients
  const shimmerClass = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]";
  const darkShimmerClass = "animate-pulse bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%]";
  
  const renderShimmer = () => {
    switch (type) {
      case 'card':
      case 'course-card':
        return (
          <div className={`group relative bg-gradient-to-br from-[#1a0b2e]/80 to-[#0b0b0b]/80 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden ${className}`} style={{ height, width }}>
            {/* Glow effect placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-bca-gold/5 to-transparent rounded-2xl"></div>
            
            <div className="relative z-10">
              {/* Image placeholder */}
              <div className="relative overflow-hidden">
                <div className={`w-full h-48 ${darkShimmerClass}`}></div>
                {/* Image overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              <div className="p-6">
                <div className="mb-3">
                  {/* Title placeholder */}
                  <div className={`h-6 rounded-lg w-3/4 mb-2 ${darkShimmerClass}`}></div>
                  {/* Description placeholder */}
                  <div className={`h-4 rounded-lg w-full mb-1 ${darkShimmerClass}`}></div>
                  <div className={`h-4 rounded-lg w-2/3 ${darkShimmerClass}`}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Price placeholder */}
                    <div className={`h-6 rounded-lg w-20 ${darkShimmerClass}`}></div>
                    {/* Discount placeholder */}
                    <div className={`h-4 rounded-lg w-12 ${darkShimmerClass}`}></div>
                    {/* Badge placeholder */}
                    <div className={`h-6 rounded-full w-16 ${darkShimmerClass}`}></div>
                  </div>
                  
                  {/* Course type indicator placeholder */}
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${darkShimmerClass}`}></div>
                    <div className={`h-3 rounded w-12 ${darkShimmerClass}`}></div>
                  </div>
                </div>
                
                {/* Hover effect indicator placeholder */}
                <div className="mt-4 flex items-center justify-center">
                  <div className={`h-4 rounded w-24 ${darkShimmerClass}`}></div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'table':
        return (
          <div className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 ${className}`} style={{ height, width }}>
            <div className="flex items-center space-x-4">
              <div className={`h-10 w-10 rounded-full ${darkShimmerClass}`}></div>
              <div className="flex-1 space-y-2">
                <div className={`h-4 rounded-lg w-1/4 ${darkShimmerClass}`}></div>
                <div className={`h-3 rounded-lg w-1/2 ${darkShimmerClass}`}></div>
              </div>
              <div className={`h-8 w-20 rounded-lg ${darkShimmerClass}`}></div>
            </div>
          </div>
        );

      case 'form':
        return (
          <div className={`space-y-6 ${className}`} style={{ height, width }}>
            <div className="space-y-2">
              <div className={`h-4 rounded-lg w-1/4 ${darkShimmerClass}`}></div>
              <div className={`h-10 rounded-lg ${darkShimmerClass}`}></div>
            </div>
            <div className="space-y-2">
              <div className={`h-4 rounded-lg w-1/4 ${darkShimmerClass}`}></div>
              <div className={`h-10 rounded-lg ${darkShimmerClass}`}></div>
            </div>
            <div className={`h-10 rounded-lg w-32 ${darkShimmerClass}`}></div>
          </div>
        );

      case 'stats':
        return (
          <div className={`bg-white/10 backdrop-blur-sm rounded-xl p-6 ${className}`} style={{ height, width }}>
            <div className={`h-8 rounded-lg w-1/2 mb-4 ${darkShimmerClass}`}></div>
            <div className={`h-12 rounded-lg w-3/4 ${darkShimmerClass}`}></div>
          </div>
        );

      case 'journey':
        return (
          <div className={`space-y-8 ${className}`} style={{ height, width }}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="relative flex items-start gap-6">
                {/* Step Number Circle */}
                <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 flex items-center justify-center">
                  <div className={`w-8 h-8 rounded ${darkShimmerClass}`}></div>
                </div>
                
                {/* Content Card */}
                <div className="flex-1 bg-gradient-to-br from-[#1a0b2e]/80 to-[#0b0b0b]/80 border border-white/10 rounded-2xl p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className={`h-6 rounded-lg w-3/4 mb-2 ${darkShimmerClass}`}></div>
                      <div className={`h-4 rounded-lg w-1/2 mb-3 ${darkShimmerClass}`}></div>
                      <div className={`h-4 rounded-lg w-full mb-1 ${darkShimmerClass}`}></div>
                      <div className={`h-4 rounded-lg w-2/3 ${darkShimmerClass}`}></div>
                    </div>
                    
                    {/* Progress Indicator */}
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-12 h-12 rounded-full ${darkShimmerClass}`}></div>
                      <div className={`h-3 rounded w-12 ${darkShimmerClass}`}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'faculty':
        return (
          <div className={`flex justify-center ${className}`} style={{ height, width }}>
            <div className="w-full max-w-md">
              <div className="bg-gradient-to-br from-[#1a0b2e]/80 to-[#0b0b0b]/80 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                {/* Faculty Avatar Section */}
                <div className="relative h-48 overflow-hidden flex items-center justify-center">
                  <div className={`w-24 h-24 rounded-full ${darkShimmerClass}`}></div>
                  <div className={`absolute top-4 right-4 w-8 h-8 rounded-full ${darkShimmerClass}`}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                
                <div className="p-6">
                  <div className="mb-3">
                    <div className={`h-6 rounded-lg w-3/4 mb-2 ${darkShimmerClass}`}></div>
                    <div className={`h-4 rounded-lg w-1/2 mb-2 ${darkShimmerClass}`}></div>
                    <div className={`h-4 rounded-lg w-full mb-1 ${darkShimmerClass}`}></div>
                    <div className={`h-4 rounded-lg w-2/3 ${darkShimmerClass}`}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-6 rounded-lg w-20 ${darkShimmerClass}`}></div>
                      <div className={`h-4 rounded-lg w-12 ${darkShimmerClass}`}></div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${darkShimmerClass}`}></div>
                      <div className={`h-3 rounded w-12 ${darkShimmerClass}`}></div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-center">
                    <div className={`h-4 rounded w-16 ${darkShimmerClass}`}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'text':
        return (
          <div className={`rounded-lg ${darkShimmerClass} ${className}`} style={{ height, width }}>
          </div>
        );

      default:
        return (
          <div className={`rounded-lg ${darkShimmerClass} ${className}`} style={{ height, width }}>
          </div>
        );
    }
  };

  if (count > 1) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index}>
            {renderShimmer()}
          </div>
        ))}
      </div>
    );
  }

  return renderShimmer();
};

export default Shimmer;
