"use client";

import React from "react";
import { BiCommentDetail } from "react-icons/bi";
import { FaHeart } from "react-icons/fa";
import Link from "next/link";

function Card({ title, description, image, featured = false, slug = "example-article", author = "Author", username = "example-user", tags = [], likes = 0, comments = 0 }) {
  // ── Featured Card ──────────────────────────────────────────────────────────
  if (featured) {
    return (
      <Link
        href={`/@${username}/${slug}`}
        className="w-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 group block"
      >
        {/* Cover image banner — hidden if no image */}
        {image && (
          <div className="w-full h-52 overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Featured label + tags row */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-blue-500 border border-blue-200 bg-blue-50 px-2.5 py-0.5 rounded-full">
              Featured
            </span>
            {tags && tags.length > 0 && tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[11px] text-gray-400 font-medium">#{tag}</span>
            ))}
          </div>

          {/* Title */}
          <h2 className="font-extrabold text-xl md:text-2xl text-gray-900 leading-snug mb-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h2>

          {/* Description */}
          {description && (
            <p className="text-gray-500 text-sm md:text-base line-clamp-2 leading-relaxed mb-4">
              {description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <BiCommentDetail size={14} />
                {comments} replies
              </span>
              <span className="flex items-center gap-1.5">
                <FaHeart size={12} className="text-pink-400" />
                {likes} likes
              </span>
            </div>
            <span
              className="font-medium text-gray-500 hover:text-blue-500 transition-colors cursor-pointer"
              onClick={(e) => { e.preventDefault(); window.location.href = `/@${username}`; }}
            >
              {author}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // ── Regular Card ───────────────────────────────────────────────────────────
  return (
    <Link
      href={`/@${username}/${slug}`}
      className="w-full flex gap-4 items-center bg-white rounded-xl p-3 md:p-4 border border-gray-100 border-l-4 border-l-transparent hover:border-gray-200 hover:border-l-blue-500 hover:shadow-md transition-all duration-300 group"
    >
      {/* Thumbnail */}
      {image && (
        <div className="shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col py-0.5">
        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-1">
            {tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[11px] font-medium text-gray-400 hover:text-gray-600 transition-colors">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="font-bold text-base md:text-lg text-gray-900 leading-snug mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-gray-500 text-xs md:text-sm line-clamp-1 leading-relaxed mb-2">
            {description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center gap-4 mt-auto text-xs text-gray-400">
          <span
            className="font-medium text-gray-500 hover:text-blue-500 transition-colors cursor-pointer"
            onClick={(e) => { e.preventDefault(); window.location.href = `/@${username}`; }}
          >
            {author}
          </span>
          <div className="w-1 h-1 rounded-full bg-gray-300"></div>
          <span className="flex items-center gap-1.5">
            <BiCommentDetail size={14} />
            {comments}
          </span>
          <span className="flex items-center gap-1.5">
            <FaHeart size={12} className="text-pink-400" />
            {likes}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default Card;