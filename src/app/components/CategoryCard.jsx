import Link from 'next/link';
import Image from 'next/image';
import React from 'react';

const CategoryCard = ({ category }) => {
  return (
    <article className={`group relative h-80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] 
      ${category.featured ? 'ring-2 ring-blue-400 ring-opacity-50 hover:ring-opacity-80' : ''}`}>

      {/* Featured Ribbon */}
      {category.featured && (
        <div className="absolute top-0 left-0 z-20 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 text-xs font-bold rounded-br-lg">
          Featured
        </div>
      )}

      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={category.image}
          alt={category.description || category.name}
          fill
          className="object-cover transform transition-transform duration-500 group-hover:scale-110"
        />
        <div className={`absolute inset-0 transition-opacity duration-300 
          ${category.featured ? 'bg-gradient-to-t from-blue-900/40 to-purple-900/30' : 'bg-gradient-to-t from-black/60 to-black/30'}
          group-hover:from-black/70 group-hover:to-black/40`} />
      </div>

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6 text-white">
        {/* Category Title and Metadata */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-2 leading-tight drop-shadow-lg">
            <Link
              href={`/categories/${category.slug}`}
              className={`text-white hover:text-blue-200 transition-colors ${category.featured ? 'text-blue-100' : ''}`}
            >
              {category.name}
            </Link>
          </h2>
          <div className="flex items-center gap-3 text-sm font-medium">
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 4.804A7.753 7.753 0 015.754 4C3.311 4 1 6.395 1 9.5 1 12.604 3.311 15 5.754 15c1.857 0 3.48-.968 4.246-2.414A7.753 7.753 0 0114.246 15C16.689 15 19 12.604 19 9.5 19 6.395 16.689 4 14.246 4c-1.857 0-3.48.968-4.246 2.414V4.804z" />
              </svg>
              {category.postCount} Articles
            </span>
            <span className="w-1 h-1 bg-white rounded-full" />
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {category.featured ? 'Featured' : 'Regular'}
            </span>
          </div>
        </div>

        {/* Enhanced Explore Button */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {category.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag}
                href={`/tags/${tag}`}
                className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium hover:bg-white/20 transition-colors"
              >
                #{tag}
              </Link>
            ))}
            {category.tags.length > 3 && (
              <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium">
                +{category.tags.length - 3}
              </span>
            )}
          </div>

          <Link
            href={`/categories/${category.slug}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all 
              ${category.featured
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-blue-500/30'
                : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'}
              group-hover:gap-3`}
          >
            <span>Explore</span>
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Enhanced Floating Save Button for Featured */}
      <button
        className={`absolute top-4 right-4 p-2 rounded-full transition-colors
          ${category.featured
            ? 'bg-blue-500/20 hover:bg-blue-500/30 backdrop-blur-sm'
            : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm'}`}
        aria-label="Save category"
      >
        <svg
          className={`w-5 h-5 ${category.featured ? 'text-white/70' : 'text-white'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
    </article>
  );
};

export default CategoryCard;