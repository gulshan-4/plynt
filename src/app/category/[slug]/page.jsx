import React from 'react';
import Card from '@/app/components/Card';
import Link from 'next/link';
import CategoryInfiniteGrid from '@/app/components/CategoryInfiniteGrid';
import FollowCategoryButton from '@/app/components/FollowCategoryButton';
import { getSidebarCategories, getCategoryPosts, checkIsFollowingCategory } from '@/app/actions/categories';
import { createClient } from '@/utils/supabase/server';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase();
  return {
    title: `${decodedSlug.charAt(0).toUpperCase() + decodedSlug.slice(1)} | Plynt.space Categories`,
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase();

  const sidebarCategories = await getSidebarCategories();

  const supabase = await createClient();

  // Fetch the category details
  const { data: categoryData } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', decodedSlug)
    .single();

  // Fetch initial articles (first 12) for this category
  const initialPosts = await getCategoryPosts(categoryData?.id, decodedSlug, 0, 12, 'latest');

  // Check if current user is following this category
  const initialIsFollowing = await checkIsFollowingCategory(categoryData?.id);

  const currentCategory = {
    name: categoryData?.name || decodedSlug.toUpperCase(),
    description: categoryData?.description || `Articles and tutorials about ${decodedSlug}.`,
    post_count: categoryData?.post_count || initialPosts?.length || 0,
    slug: decodedSlug,
    image_url: categoryData?.image_url || `/category-thumbs/covers/${decodedSlug}.jpg`,
  };

  return (
    <div className="layout">
      {/* LEFT SIDEBAR: JUMP TO */}
      <aside className="sidebar-left">
        <Link href="/categories" className="cat-item" style={{ fontSize: '0.75rem', fontWeight: 800, color: '#555' }}>
          &larr; ALL CATEGORIES
        </Link>
        <div className="section-label" style={{ marginTop: '1rem' }}>Categories</div>
        {sidebarCategories.map(cat => (
          <Link key={cat.id} href={`/category/${cat.slug}`} className="cat-item" style={{ fontWeight: cat.slug === decodedSlug ? 800 : 600 }}>
            {cat.name.toUpperCase()}
            <span className="cat-count">{cat.post_count}</span>
          </Link>
        ))}
      </aside>

      {/* MAIN COLUMN */}
      <main className="main-col">
        {/* Breadcrumbs */}
        <div className="cat-breadcrumb">
          <Link href="/categories">Categories</Link> / <span>{currentCategory.name}</span>
        </div>

        {/* Hero Banner */}
        <div className="cat-hero">
          <img src={currentCategory.image_url} className="cat-hero-bg" alt={currentCategory.name} />
          <div className="cat-hero-overlay"></div>
          <div className="cat-hero-content">
            <h1 className="cat-hero-title">{currentCategory.name}</h1>
            <p className="cat-hero-desc">{currentCategory.description}</p>
            <FollowCategoryButton 
              categoryId={categoryData?.id} 
              initialIsFollowing={initialIsFollowing} 
            />
          </div>
        </div>

        <CategoryInfiniteGrid
          initialPosts={initialPosts}
          categoryId={categoryData?.id}
          tagSlug={decodedSlug}
          categoryName={currentCategory.name}
        />
      </main>
    </div>
  );
}
