import React from "react";
import CategoryCard from "../components/CategoryCard";
import Card from "../components/Card";
import { getSidebarCategories, getCategoryPreviews } from "../actions/categories";

const Categories = async () => {
  const sidebarCategories = await getSidebarCategories();
  const categoryPreviews = await getCategoryPreviews();

  const dummyArticles = [
    {
      id: 101,
      title: "What Is React.js and Why Should Every Developer Learn It in 2025?",
      slug: "what-is-react-js",
      image: "https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=400",
      author: "@admin",
      username: "admin",
      readTime: "8 min",
    },
    {
      id: 102,
      title: "Inside the Rust Rewrite: Why Startups Keep Betting on It",
      slug: "inside-the-rust-rewrite",
      image: null,
      author: "@admin",
      username: "admin",
      readTime: "5 min",
    },
    {
      id: 103,
      title: "The Death of the Passwords: Passkeys and the Future of Web Auth",
      slug: "death-of-passwords",
      image: "https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=400",
      author: "@admin",
      username: "admin",
      readTime: "6 min",
    }
  ];

  const categories = [
    {
      id: 1,
      name: "Technology",
      slug: "technology",
      featured: true,
      description: "Product launches, dev tools, and the platforms shaping how we build.",
      image: "https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=400",
      postCount: 14,
      articles: dummyArticles,
    },
    {
      id: 2,
      name: "Business",
      slug: "business",
      featured: false,
      description: "Startups, markets, and the money behind the next big idea.",
      image: "https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400",
      postCount: 8,
      articles: dummyArticles,
    },
    {
      id: 3,
      name: "Lifestyle",
      slug: "lifestyle",
      featured: false,
      description: "Habits, routines, and living with a bit more intention.",
      image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400",
      postCount: 7,
      articles: dummyArticles,
    },
    {
      id: 4,
      name: "Health",
      slug: "health",
      featured: false,
      description: "Sleep, nutrition, and the research behind feeling better.",
      image: "https://images.pexels.com/photos/6753354/pexels-photo-6753354.jpeg?auto=compress&cs=tinysrgb&w=400",
      postCount: 5,
      articles: [],
    },
    {
      id: 5,
      name: "Science",
      slug: "science",
      featured: false,
      description: "Space, biology, and discoveries pushing the field forward.",
      image: "https://images.pexels.com/photos/957010/pexels-photo-957010.jpeg?auto=compress&cs=tinysrgb&w=400",
      postCount: 4,
      articles: [],
    },
    {
      id: 6,
      name: "Entertainment",
      slug: "entertainment",
      featured: false,
      description: "Streaming, culture, and what's actually worth your time.",
      image: "https://images.pexels.com/photos/8263318/pexels-photo-8263318.jpeg?auto=compress&cs=tinysrgb&w=400",
      postCount: 4,
      articles: [],
    },
    {
      id: 7,
      name: "Sports",
      slug: "sports",
      featured: false,
      description: "Analytics, history, and the business behind the game.",
      image: "https://images.pexels.com/photos/2385477/pexels-photo-2385477.jpeg?auto=compress&cs=tinysrgb&w=400",
      postCount: 3,
      articles: [],
    }
  ];

  return (
    <div className="layout">
      {/* LEFT SIDEBAR: JUMP TO */}
      <aside className="sidebar-left">
        <div className="section-label">Jump To</div>
        {sidebarCategories.map(cat => (
          <a key={cat.id} href={`#${cat.slug}`} className="cat-item">
            {cat.name}
            <span className="cat-count">{cat.post_count || 0}</span>
          </a>
        ))}
      </aside>

      {/* MAIN COLUMN */}
      <main className="main-col">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Categories</h1>
          <p className="page-sub">
            Every story on Plynt, sorted into one of seven beats. Pick a lane below, or scroll through what each one's been publishing lately.
          </p>
        </div>

        {/* Category Grid */}
        <div className="category-grid">
          {[...sidebarCategories].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)).map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

        {/* Category Preview Sections */}
        {categoryPreviews.map(category => (
          <section key={category.id} className="category-section" id={category.slug}>
            <div className="category-section-head">
              <span className="category-section-title">{category.name}</span>
              <a href={`/category/${category.slug}`} className="see-all-link">See all {category.post_count} &rarr;</a>
            </div>
            <div className="article-grid">
              {category.posts.map((article) => (
                <Card
                  key={article.id}
                  title={article.title}
                  slug={article.slug}
                  image={article.cover_image}
                  author={article.profiles?.full_name || article.profiles?.username}
                  username={article.profiles?.username}
                  avatarUrl={article.profiles?.avatar_url}
                  category={category.name}
                  likes={article.likes}
                  comments={article.comments_count}
                  readTime={`${article.read_time || 5} MIN READ`}
                  date={new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  layout="grid"
                />
              ))}
            </div>
          </section>
        ))}

      </main>
    </div>
  );
};

export default Categories;