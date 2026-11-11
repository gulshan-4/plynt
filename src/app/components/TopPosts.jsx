"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getSidebarData } from "@/app/actions/sidebar";

export default function TopPosts({ children }) {
  const [latestArticles, setLatestArticles] = useState([]);
  const [topAuthors, setTopAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSidebar() {
      const { latestArticles, topAuthors } = await getSidebarData();
      setLatestArticles(latestArticles);
      setTopAuthors(topAuthors);
      setLoading(false);
    }
    loadSidebar();
  }, []);

  if (loading) {
    return (
      <div className="opacity-50 animate-pulse">
        <div className="sidebar-title">Latest Articles</div>
        <div className="h-20 bg-gray-200 rounded mb-4"></div>
        <div className="h-20 bg-gray-200 rounded mb-4"></div>
        {children}
        <div className="sidebar-title mt-6">Authors to Read</div>
        <div className="h-16 bg-gray-200 rounded mb-4"></div>
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="sidebar-title">Latest Articles</div>
        <div>
          {latestArticles?.length > 0 ? (
            latestArticles.map((article) => {
              const category = article.tags?.[0] || 'Article';
              const username = article.profiles?.username || 'user';
              
              return (
                <Link key={article.id} href={`/@${username}/${article.slug}`} className="latest-item">
                  {article.cover_image ? (
                    <img className="latest-img" src={article.cover_image} alt={article.title} />
                  ) : (
                    <div className="latest-no-img">
                      <span>{category.slice(0, 3).toUpperCase()}</span>
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="latest-title">{article.title}</div>
                    <div className="latest-cat">{category}</div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div style={{ fontSize: '14px', color: '#666', padding: '8px 0' }}>No articles yet.</div>
          )}
        </div>
      </div>

      {children}

      <div>
        <div className="sidebar-title">Authors to Read</div>
        <div className="author-list">
          {topAuthors.length > 0 ? (
            topAuthors.map((author) => (
              <div key={author.id} className="author-item">
                {author.avatar ? (
                  <div className="author-avatar" style={{ padding: 0, overflow: 'hidden' }}>
                    <img src={author.avatar} alt={author.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div className="author-avatar">{author.name.charAt(0).toUpperCase()}</div>
                )}
                
                <div className="author-info">
                  <div className="author-name">{author.name}</div>
                  <div className="author-bio">{author.bio}</div>
                </div>
                <Link href={`/@${author.username}`} className="author-follow" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  View
                </Link>
              </div>
            ))
          ) : (
            <div style={{ fontSize: '14px', color: '#666', padding: '8px 0' }}>No authors yet.</div>
          )}
        </div>
      </div>
    </>
  );
}