'use client';

import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/Card';

export default function LatestFeed({ initialPosts }) {
  const [posts, setPosts] = useState(initialPosts || []);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState((initialPosts?.length || 0) >= 19);
  const [loading, setLoading] = useState(false);
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMorePosts();
        }
      },
      { rootMargin: '200px' }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [hasMore, loading, page]);

  const loadMorePosts = async () => {
    setLoading(true);
    const nextPage = page + 1;
    try {
      const { getLatestFeed } = await import('@/app/actions/posts');
      const { posts: newPosts } = await getLatestFeed(nextPage, 20);
      if (newPosts && newPosts.length > 0) {
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          return [...prev, ...newPosts.filter(p => !existingIds.has(p.id))];
        });
        setPage(nextPage);
        setHasMore(newPosts.length >= 19);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load more posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    }).toUpperCase();
  };

  const calculateReadTime = (content) => {
    if (!content) return '1 MIN READ';
    const wordCount = content.trim().split(/\s+/).length;
    return `${Math.max(1, Math.ceil(wordCount / 200))} MIN READ`;
  };

  const gridPosts = posts;

  return (
    <main className="feed">
      <div className="article-grid">
        {gridPosts.map((post, index) => (
          <Card
            key={`${post.id}-${index}`}
            title={post.title}
            description={post.content?.substring(0, 100) + '...'}
            image={post.cover_image}
            category={post.tags?.[0] || 'Article'}
            author={`@${post.profiles?.username || 'user'}`}
            username={post.profiles?.username || 'user'}
            avatarUrl={post.profiles?.avatar_url || null}
            slug={post.slug}
            date={formatDate(post.created_at)}
            readTime={post.read_time ? `${post.read_time} MIN READ` : calculateReadTime(post.content || post.html)}
            likes={post.likes || 0}
            comments={post.comments_count || 0}
            featured={false}
          />
        ))}
      </div>

      {loading && (
        <div style={{ padding: '24px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px' }}>
          Loading more...
        </div>
      )}

      <div ref={observerTarget} style={{ height: '20px' }} />

      {!hasMore && posts.length > 0 && (
        <div style={{ padding: '24px', textAlign: 'center', opacity: 0.5, fontSize: '12px', fontWeight: 'bold' }}>
          You've reached the end!
        </div>
      )}

      {posts.length === 0 && !loading && (
        <div style={{ padding: '40px', textAlign: 'center', opacity: 0.5, fontSize: '14px', fontWeight: 'bold' }}>
          No posts found.
        </div>
      )}
    </main>
  );
}
