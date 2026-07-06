"use client";

import React, { useState, useEffect, useRef } from 'react';
import Card from './Card';

export default function InfiniteFeed({ initialPosts, initialFeaturedPost }) {
  const [posts, setPosts] = useState(initialPosts || []);
  const [featuredPost, setFeaturedPost] = useState(initialFeaturedPost);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
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

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loading, page]);

  const loadMorePosts = async () => {
    setLoading(true);
    const nextPage = page + 1;
    try {
      const { getLatestFeed } = await import('@/app/actions/posts');
      const { posts: newPosts } = await getLatestFeed(nextPage, 20);
      
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

  // Map database properties to what Card expects
  const mapPost = (p) => {
    if (!p) return null;
    let description = p.content || "";
    if (description.length > 150) description = description.substring(0, 150) + "...";
    
    return {
      id: p.id,
      title: p.title,
      description: description,
      image: p.cover_image,
      slug: p.slug,
      author: p.profiles?.full_name || p.profiles?.username || "Unknown",
      username: p.profiles?.username || "example-user",
      tags: p.tags || [],
      likes: p.likes || 0,
      comments: p.comments_count || 0,
      featured: false
    };
  };

  const mappedPosts = posts.map(mapPost);
  const mappedFeatured = mapPost(featuredPost);
  if (mappedFeatured) mappedFeatured.featured = true;

  return (
    <>
      <div className="flex flex-col gap-6 items-center">
        {mappedFeatured && (
          <Card
            key={`featured-${mappedFeatured.id}`}
            title={mappedFeatured.title}
            description={mappedFeatured.description}
            image={mappedFeatured.image}
            slug={mappedFeatured.slug}
            author={mappedFeatured.author || "Unknown"}
            username={mappedFeatured.username}
            tags={mappedFeatured.tags || []}
            likes={mappedFeatured.likes || 0}
            comments={mappedFeatured.comments || 0}
            featured={true}
          />
        )}
        {mappedPosts.map((post) => (
          <Card
            key={post.id}
            title={post.title}
            description={post.description}
            image={post.image}
            slug={post.slug}
            author={post.author || "Unknown"}
            username={post.username}
            tags={post.tags || []}
            likes={post.likes || 0}
            comments={post.comments || 0}
            featured={post.featured}
          />
        ))}
      </div>
      {hasMore && (
        <div ref={observerTarget} className="w-full h-20 flex justify-center items-center pb-10">
          {loading && <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>}
        </div>
      )}
    </>
  );
}
