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
  <div className="bg-bca-gray-800 rounded-lg overflow-hidden relative">
    <div className={`h-48 ${shimmer}`}></div>
    <div className="p-6">
      <div className={`h-6 rounded w-3/4 mb-4 ${shimmer}`}></div>
      <div className={`h-4 rounded w-1/2 mb-2 ${shimmer}`}></div>
      <div className={`h-4 rounded w-2/3 mb-4 ${shimmer}`}></div>
      <div className="flex justify-between items-center">
        <div className={`h-6 rounded w-20 ${shimmer}`}></div>
        <div className={`h-8 rounded w-24 ${shimmer}`}></div>
      </div>
    </div>
  </div>
);
