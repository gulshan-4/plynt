"use client";

import React, { useState, useEffect, useRef } from 'react';
import Card from './Card';
import { getCategoryPosts } from '@/app/actions/categories';

export default function CategoryInfiniteGrid({ initialPosts, categoryId, tagSlug, categoryName }) {
  const [posts, setPosts] = useState(initialPosts || []);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialPosts?.length === 12);
  const [loading, setLoading] = useState(false);
  const [sortMode, setSortMode] = useState('latest'); // latest, popular, discussed
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, page, sortMode]);

  const loadMorePosts = async () => {
    setLoading(true);
    try {
      const nextPosts = await getCategoryPosts(categoryId, tagSlug, page, 12, sortMode);
      if (nextPosts && nextPosts.length > 0) {
        setPosts(prev => [...prev, ...nextPosts]);
        setPage(prev => prev + 1);
        if (nextPosts.length < 12) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = async (mode) => {
    if (sortMode === mode) return;
    
    setSortMode(mode);
    setLoading(true);
    setPosts([]); // Clear immediately for UX
    setHasMore(true);
    setPage(0); // Fetch first page

    try {
      const firstPagePosts = await getCategoryPosts(categoryId, tagSlug, 0, 12, mode);
      setPosts(firstPagePosts || []);
      setPage(1);
      if (!firstPagePosts || firstPagePosts.length < 12) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error changing tabs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Tabs */}
      <div className="cat-tabs">
        <div 
          className={`cat-tab ${sortMode === 'latest' ? 'active' : ''}`}
          onClick={() => handleTabChange('latest')}
        >
          LATEST
        </div>
        <div 
          className={`cat-tab ${sortMode === 'popular' ? 'active' : ''}`}
          onClick={() => handleTabChange('popular')}
        >
          POPULAR
        </div>
        <div 
          className={`cat-tab ${sortMode === 'discussed' ? 'active' : ''}`}
          onClick={() => handleTabChange('discussed')}
        >
          MOST DISCUSSED
        </div>
      </div>

      {/* Article Grid */}
      <div className="article-grid">
        {posts.map((article) => (
          <Card 
            key={article.id}
            title={article.title}
            slug={article.slug}
            image={article.cover_image}
            author={article.profiles?.full_name || article.profiles?.username}
            username={article.profiles?.username}
            avatarUrl={article.profiles?.avatar_url}
            category={categoryName}
            likes={article.likes}
            comments={article.comments_count}
            readTime={`${article.read_time || 5} MIN READ`}
            date={new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            layout="grid"
          />
        ))}
      </div>
      
      {/* Loading Indicator & Intersection Target */}
      <div ref={observerTarget} style={{ padding: '2rem 0', textAlign: 'center' }}>
        {loading && <p style={{ color: '#888', fontWeight: 'bold' }}>LOADING MORE...</p>}
        {!hasMore && posts.length > 0 && <p style={{ color: '#aaa', fontWeight: 'bold', fontSize: '0.8rem' }}>NO MORE ARTICLES</p>}
      </div>
    </>
  );
}
