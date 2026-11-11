'use client';

import { useState, useEffect, useRef } from 'react';
import Card from './Card';
import { getFeedPosts } from '../actions/posts';

export default function Feed({ initialPosts = [], isLoggedIn = false }) {
  const [activeTab, setActiveTab] = useState('for_you');
  const [posts, setPosts] = useState(initialPosts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length >= 10);

  const observerTarget = useRef(null);

  useEffect(() => {
    setPosts(initialPosts);
    setPage(1);
    setHasMore(initialPosts.length >= 10);
  }, [initialPosts]);

  const loadMorePosts = async () => {
    setLoading(true);
    const nextPage = page + 1;
    try {
      const { posts: newPosts } = await getFeedPosts(activeTab, nextPage, 10);

      if (newPosts && newPosts.length > 0) {
        setPosts(prev => [...prev, ...newPosts]);
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load more posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = async (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setLoading(true);
    setPosts([]);
    setPage(1);
    setHasMore(true);

    try {
      const { posts: newPosts } = await getFeedPosts(tab, 1, 10);
      setPosts(newPosts || []);
      setHasMore((newPosts || []).length >= 10);
    } catch (err) {
      console.error("Failed to fetch tab posts:", err);
    } finally {
      setLoading(false);
    }
  };

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

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loading, hasMore, page, activeTab]);

  const heroPost = (activeTab === 'for_you' && posts.length > 0) ? posts[0] : null;
  const gridPosts = (activeTab === 'for_you') ? posts.slice(1) : posts;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).toUpperCase();
  };

  const calculateReadTime = (content) => {
    if (!content) return "1 MIN READ";
    const wordCount = content.trim().split(/\s+/).length;
    const time = Math.max(1, Math.ceil(wordCount / 200));
    return `${time} MIN READ`;
  };

  return (
    <main className="feed">
      <div className="feed-tabs">
        <div
          className={`tab ${activeTab === 'for_you' ? 'active' : ''}`}
          onClick={() => handleTabChange('for_you')}
        >
          For You
        </div>
        {isLoggedIn && (
          <div
            className={`tab ${activeTab === 'following' ? 'active' : ''}`}
            onClick={() => handleTabChange('following')}
          >
            Following
          </div>
        )}
        <div
          className={`tab ${activeTab === 'new' ? 'active' : ''}`}
          onClick={() => handleTabChange('new')}
        >
          New
        </div>

      </div>

      {heroPost && (
        <Card
          key={`hero-${heroPost.id}`}
          title={heroPost.title}
          description={heroPost.content?.substring(0, 100) + '...'}
          image={heroPost.cover_image}
          category={heroPost.tags?.[0] || 'Article'}
          author={`@${heroPost.profiles?.username || 'user'}`}
          username={heroPost.profiles?.username || 'user'}
          avatarUrl={heroPost.profiles?.avatar_url || null}
          slug={heroPost.slug}
          date={formatDate(heroPost.created_at)}
          readTime={heroPost.read_time ? `${heroPost.read_time} MIN READ` : calculateReadTime(heroPost.content || heroPost.html)}
          likes={heroPost.likes || 0}
          comments={heroPost.comments_count || 0}
          featured={true}
        />
      )}

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

      {/* Intersection Observer Target */}
      <div ref={observerTarget} style={{ height: '20px' }}></div>

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
