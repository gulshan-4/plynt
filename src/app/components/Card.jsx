"use client";

import React from "react";
import Link from "next/link";
import { FaHeart } from "react-icons/fa";
import { BiCommentDetail } from "react-icons/bi";

function Card({
  title,
  description,
  image,
  featured = false,
  slug = "example-article",
  author = "@author",
  username = "example-user",
  avatarUrl = null,
  category = "Uncategorized",
  readTime = "5 min read",
  date = "Jul 6, 2025",
  tags = [],
  likes = 0,
  comments = 0,
  layout = 'grid'
}) {
  const authorInitial = author.replace('@', '').charAt(0).toUpperCase() || 'A';

  const renderAvatar = (className) => {
    if (avatarUrl) {
      return (
        <div className={className} style={{ padding: 0, overflow: 'hidden', display: 'flex' }}>
          <img className=" !opacity-95" src={avatarUrl} alt={author} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      );
    }
    return <div className={className}>{authorInitial}</div>;
  };

  // ── Featured Card (Hero Card) ──────────────────────────────────────────────
  if (featured) {
    return (
      <Link href={`/@${username}/${slug}`} className="hero-card block">
        {image && (
          <img
            src={image}
            alt={title}
          />
        )}
        <div className="hero-overlay">
          <div className="hero-badges">
            <span className="badge-featured">Featured</span>
            <span className="badge-cat">{category}</span>
          </div>
          <div className="hero-title">{title}</div>
          <div className="hero-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {renderAvatar("hero-avatar")}
              <div className="hero-meta-text">
                <strong>{author}</strong> · {readTime} · {date}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.7)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaHeart /> {likes}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><BiCommentDetail size={16} /> {comments}</div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // ── Regular Card (Article Grid) ────────────────────────────────────────────
  return (
    <Link href={`/@${username}/${slug}`} className="article-card block">
      {image ? (
        <img className="card-img" src={image} alt={title} />
      ) : (
        <div className="card-no-image-header">
          <span className="no-img-label">{category}</span>
        </div>
      )}
      <div className="card-body">
        <div className="card-category">{category}</div>
        <div className="card-title">{title}</div>
        <div className="card-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {renderAvatar("card-avatar")}
            <span className="card-author">{author}</span> · <span>{readTime}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', fontWeight: 'bold' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaHeart /> {likes}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><BiCommentDetail size={14} /> {comments}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default Card;