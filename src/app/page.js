import { createClient } from '@/utils/supabase/server';
import Card from "./components/Card";
import CategoriesSidebar from "./components/HomeCategories";
import TagsCloud from "./components/PopularTags";
import TopPosts from "./components/TopPosts";
import Feed from "./components/Feed";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
  const fiveDaysAgoStr = fiveDaysAgo.toISOString();

  // 1. Fetch most popular posts from the last 5 days
  const { data: recentPopularPosts } = await supabase
    .from('posts')
    .select('*, profiles!posts_author_id_fkey(username, full_name, avatar_url)')
    .eq('published', true)
    .gte('created_at', fiveDaysAgoStr)
    .order('likes', { ascending: false })
    .limit(10);

  let realPosts = recentPopularPosts || [];

  // 2. Fallback: If we don't have 10 posts, fill the rest with all-time most popular
  if (realPosts.length < 10) {
    const { data: allTimePopular } = await supabase
      .from('posts')
      .select('*, profiles!posts_author_id_fkey(username, full_name, avatar_url)')
      .eq('published', true)
      .order('likes', { ascending: false })
      .limit(10 + realPosts.length); // Fetch enough to cover the gaps safely

    const existingIds = new Set(realPosts.map(p => p.id));
    const fallbackFiltered = (allTimePopular || []).filter(p => !existingIds.has(p.id));
    
    realPosts = [...realPosts, ...fallbackFiltered];
  }

  // Sort the final array by engagement (likes * 2 + comments) so the true most popular post is featured
  realPosts.sort((a, b) => {
    const scoreA = (a.likes || 0) * 2 + (a.comments_count || 0) + (a.views_count || 0);
    const scoreB = (b.likes || 0) * 2 + (b.comments_count || 0) + (b.views_count || 0);
    return scoreB - scoreA;
  });

  // Keep only top 10
  realPosts = realPosts.slice(0, 10);

  const heroPost = realPosts.length > 0 ? realPosts[0] : null;
  const gridPosts = realPosts.slice(1);

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).toUpperCase();
  };

  return (
    <div className="layout">
      <aside className="sidebar-left">
        <CategoriesSidebar />
      </aside>
      
      <Feed initialPosts={realPosts} isLoggedIn={!!user} />

      <aside className="sidebar-right">
        <TopPosts>
          <TagsCloud />
        </TopPosts>
      </aside>
    </div>
  );
}