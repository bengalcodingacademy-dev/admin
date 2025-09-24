import React from 'react';

const shimmer = "animate-pulse bg-gradient-to-r from-bca-gray-800 via-bca-gray-700 to-bca-gray-800 bg-[length:200%_100%]";

export const SkeletonCard = () => (
  <div className="bg-bca-gray-800 rounded-lg p-6 relative overflow-hidden">
    <div className={`h-4 rounded w-3/4 mb-4 ${shimmer}`}></div>
    <div className={`h-3 rounded w-1/2 mb-2 ${shimmer}`}></div>
    <div className={`h-3 rounded w-2/3 ${shimmer}`}></div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="bg-bca-gray-800 rounded-lg p-4 relative overflow-hidden">
        <div className="flex items-center space-x-4">
          <div className={`h-10 w-10 rounded-full ${shimmer}`}></div>
          <div className="flex-1 space-y-2">
            <div className={`h-4 rounded w-1/4 ${shimmer}`}></div>
            <div className={`h-3 rounded w-1/2 ${shimmer}`}></div>
          </div>
          <div className={`h-8 w-20 rounded ${shimmer}`}></div>
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonForm = () => (
  <div className="space-y-6 relative overflow-hidden">
    <div className="space-y-2">
      <div className={`h-4 rounded w-1/4 ${shimmer}`}></div>
      <div className={`h-10 rounded ${shimmer}`}></div>
    </div>
    <div className="space-y-2">
      <div className={`h-4 rounded w-1/4 ${shimmer}`}></div>
      <div className={`h-10 rounded ${shimmer}`}></div>
    </div>
    <div className="space-y-2">
      <div className={`h-4 rounded w-1/4 ${shimmer}`}></div>
      <div className={`h-24 rounded ${shimmer}`}></div>
    </div>
    <div className={`h-10 rounded w-32 ${shimmer}`}></div>
  </div>
);

export const SkeletonStats = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="bg-bca-gray-800 rounded-lg p-6 relative overflow-hidden">
        <div className={`h-4 rounded w-1/2 mb-4 ${shimmer}`}></div>
        <div className={`h-8 rounded w-3/4 ${shimmer}`}></div>
      </div>
    ))}
  </div>
);

export const SkeletonCourseCard = () => (
  <div className="group relative bg-gradient-to-br from-[#1a0b2e]/80 to-[#0b0b0b]/80 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
    {/* Glow effect placeholder */}
    <div className="absolute inset-0 bg-gradient-to-br from-bca-gold/5 to-transparent rounded-2xl"></div>
    
    <div className="relative z-10">
      {/* Image placeholder */}
      <div className="relative overflow-hidden">
        <div className={`h-48 ${shimmer}`}></div>
        {/* Image overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>
      
      <div className="p-6">
        <div className="mb-3">
          {/* Title placeholder */}
          <div className={`h-6 rounded-lg w-3/4 mb-2 ${shimmer}`}></div>
          {/* Description placeholder */}
          <div className={`h-4 rounded-lg w-full mb-1 ${shimmer}`}></div>
          <div className={`h-4 rounded-lg w-2/3 ${shimmer}`}></div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Price placeholder */}
            <div className={`h-6 rounded-lg w-20 ${shimmer}`}></div>
            {/* Discount placeholder */}
            <div className={`h-4 rounded-lg w-12 ${shimmer}`}></div>
            {/* Badge placeholder */}
            <div className={`h-6 rounded-full w-16 ${shimmer}`}></div>
          </div>
          
          {/* Course type indicator placeholder */}
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${shimmer}`}></div>
            <div className={`h-3 rounded w-12 ${shimmer}`}></div>
          </div>
        </div>
        
        {/* Hover effect indicator placeholder */}
        <div className="mt-4 flex items-center justify-center">
          <div className={`h-4 rounded w-24 ${shimmer}`}></div>
        </div>
      </div>
    </div>
  </div>
);
