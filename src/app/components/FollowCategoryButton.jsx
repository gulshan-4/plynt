"use client";

import React, { useState } from 'react';
import { toggleFollowCategory } from '@/app/actions/categories';

export default function FollowCategoryButton({ categoryId, initialIsFollowing }) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);
  const [hoverText, setHoverText] = useState('');

  const handleFollow = async () => {
    if (loading) return;
    
    setLoading(true);
    // Optimistic UI update
    const previousState = isFollowing;
    setIsFollowing(!isFollowing);
    setHoverText('');
    
    try {
      const newState = await toggleFollowCategory(categoryId);
      setIsFollowing(newState);
    } catch (error) {
      console.error("Failed to follow category", error);
      // Revert optimistic update
      setIsFollowing(previousState);
      alert("Failed to update follow status. Make sure you are signed in and the database is migrated.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      className="cat-hero-follow-btn" 
      onClick={handleFollow}
      disabled={loading}
      style={{ opacity: loading ? 0.7 : 1 }}
      onMouseEnter={() => isFollowing && setHoverText('- UNFOLLOW')}
      onMouseLeave={() => setHoverText('')}
    >
      {isFollowing ? (hoverText || 'FOLLOWING') : (
        <>
          <svg className='inline-block w-[13px] h-[13px] [stroke:currentColor] mr-1' viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14"></path>
          </svg> 
          FOLLOW CATEGORY
        </>
      )}
    </button>
  );
}
