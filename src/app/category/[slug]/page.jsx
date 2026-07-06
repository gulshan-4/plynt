import React from 'react';
import { createClient } from '@/utils/supabase/server';
import Card from '@/app/components/Card';
import CategoriesSidebar from '@/app/components/HomeCategories';
import TagsCloud from '@/app/components/PopularTags';
import { FiFolder } from 'react-icons/fi';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase();

  return {
    title: `${decodedSlug.charAt(0).toUpperCase() + decodedSlug.slice(1)} | Plynt.space Categories`,
    description: `Discover the best articles and tutorials about ${decodedSlug} on Plynt.space.`,
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase();

  const supabase = await createClient();

  // Fetch the category by slug
  const { data: category } = await supabase
    .from('categories')
    .select('id, name')
    .eq('slug', decodedSlug)
    .single();

  let query = supabase
    .from('posts')
    .select('*, profiles!posts_author_id_fkey(username, full_name)')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (category) {
    query = query.or(`category_id.eq.${category.id},tags.cs.{${decodedSlug}}`);
  } else {
    query = query.contains('tags', [decodedSlug]);
  }

  const { data: posts, error } = await query;

  if (error) {
    console.error("Error fetching category posts:", error);
  }

  return (
    <div className="bg-[#f9fafb] pb-8">
      {/* Category Hero Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 max-w-7xl py-6 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-3 border border-orange-100">
            <FiFolder size={20} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1 capitalize">
            {decodedSlug.replace('-', ' ')}
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base">
            Showing {posts?.length || 0} {posts?.length === 1 ? 'article' : 'articles'} in <span className="font-semibold text-gray-700 capitalize">{decodedSlug.replace('-', ' ')}</span>
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 max-w-7xl pt-6">
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <a href="/" className="hover:text-orange-600 transition-colors">Home</a>
          <span>/</span>
          <a href="/categories" className="hover:text-orange-600 transition-colors">Categories</a>
          <span>/</span>
          <span className="text-gray-700 font-medium capitalize">{decodedSlug.replace('-', ' ')}</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 max-w-7xl mt-4">
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-10">
          
          {/* Main Feed */}
          <main className="w-full lg:w-2/3 xl:w-3/4">
            {posts && posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {posts.map((post) => (
                  <Card
                    key={post.id}
                    title={post.title}
                    description={post.description}
                    image={post.cover_image}
                    slug={post.slug}
                    author={post.profiles?.full_name || post.profiles?.username || "Author"}
                    username={post.profiles?.username}
                    tags={post.tags || []}
                    likes={post.likes || 0}
                    comments={post.comments_count || 0}
                    featured={post.featured}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiFolder size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-500">
                  We couldn't find any published articles in the <span className="font-semibold capitalize">{decodedSlug.replace('-', ' ')}</span> category.
                </p>
              </div>
            )}
          </main>

          {/* Dedicated Sidebar */}
          <aside className="w-full lg:w-1/3 xl:w-1/4 space-y-6">
            <CategoriesSidebar />
            <TagsCloud />
          </aside>

        </div>
      </div>
    </div>
  );
}
