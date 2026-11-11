import React from 'react';
import Card from '@/app/components/Card';
import Link from 'next/link';
import { FiHash } from 'react-icons/fi';

export async function generateMetadata({ params }) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag).toLowerCase();
  return {
    title: `#${decodedTag} | Plynt.space`,
  };
}

export default async function TagPage({ params }) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag).toLowerCase();

  // STATIC DUMMY DATA
  const dummyArticles = [
    {
      id: 101,
      title: "What Is React.js and Why Should Every Developer Learn It in 2025?",
      slug: "what-is-react-js",
      image: "https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "TECHNOLOGY",
      author: "@admin",
      username: "admin",
      readTime: "8 min",
      date: "Jul 6, 2025"
    },
    {
      id: 102,
      title: "Why This Fintech Startup Rebuilt Its Entire Frontend in React",
      slug: "fintech-startup-react",
      image: null,
      category: "BUSINESS",
      author: "@john_doe",
      username: "john_doe",
      readTime: "6 min",
      date: "Jul 5, 2025"
    },
    {
      id: 103,
      title: "React Server Components, Explained for the Rest of Us",
      slug: "rsc-explained",
      image: "https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "TECHNOLOGY",
      author: "@mike_codes",
      username: "mike_codes",
      readTime: "7 min",
      date: "Jul 4, 2025"
    }
  ];

  return (
    <div className="tag-page layout">
      {/* LEFT SIDEBAR: TOP CONTRIBUTORS */}
      <aside className="sidebar-left">
        <Link href="/" className="back-link">&larr; Home</Link>

        <div className="section-label">Top Contributors</div>

        <div className="contributor-item">
          <div className="contributor-avatar">A</div>
          <div className="contributor-info">
            <div className="contributor-name">@admin</div>
            <div className="contributor-meta">3 posts on #{decodedTag}</div>
          </div>
          <button className="contributor-follow">Follow</button>
        </div>

        <div className="contributor-item">
          <div className="contributor-avatar">M</div>
          <div className="contributor-info">
            <div className="contributor-name">@mike_codes</div>
            <div className="contributor-meta">2 posts on #{decodedTag}</div>
          </div>
          <button className="contributor-follow">Follow</button>
        </div>

        <div className="contributor-item">
          <div className="contributor-avatar">J</div>
          <div className="contributor-info">
            <div className="contributor-name">@john_doe</div>
            <div className="contributor-meta">1 post on #{decodedTag}</div>
          </div>
          <button className="contributor-follow">Follow</button>
        </div>

        <p className="sidebar-note">Ranked by posts under this tag — the same authors shown in the grid.</p>
      </aside>

      {/* MAIN COLUMN */}
      <main className="main-col">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <span>Tags</span>
          <span>/</span>
          <span className="current">#{decodedTag}</span>
        </div>

        {/* Tag Hero */}
        <div className="tag-hero">
          <div className="tag-hero-mark"><span className="hash">#</span>{decodedTag}</div>
          <div className="tag-hero-meta">6 Articles &middot; Spans Technology, Business &amp; Lifestyle</div>
          <div className="tag-hero-actions">
            <button className="tag-follow-btn">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Follow Tag
            </button>
            <div className="related-tags">
              <span className="related-tags-label">Related:</span>
              <Link href="/tag/webdev" className="tag-chip">webdev</Link>
              <Link href="/tag/frontend" className="tag-chip">frontend</Link>
              <Link href="/tag/javascript" className="tag-chip">javascript</Link>
              <Link href="/tag/ai" className="tag-chip">ai</Link>
            </div>
          </div>
        </div>

        {/* Sort Tabs */}
        <div className="feed-tabs">
          <div className="tab active">Latest</div>
          <div className="tab">Popular</div>
          <div className="tab">Most Discussed</div>
        </div>

        {/* Article Grid */}
        <div className="article-grid">
          {dummyArticles.map((article) => (
            <Card
              key={article.id}
              title={article.title}
              slug={article.slug}
              image={article.image}
              author={article.author}
              username={article.username}
              category={article.category}
              readTime={article.readTime}
              date={article.date}
              layout="grid"
            />
          ))}
        </div>

      </main>
    </div>
  );
}
