"use server"

import { createClient } from "@/utils/supabase/server";

export async function getSidebarData() {
  const supabase = await createClient();

  // 1. Fetch Latest Articles
  const { data: latestArticles } = await supabase
    .from('posts')
    .select('id, title, slug, cover_image, tags, profiles!posts_author_id_fkey(username)')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(3);

  // 2. Fetch Top Authors by Aggregate Likes
  const { data: popularPosts } = await supabase
    .from('posts')
    .select('likes, author_id, profiles!posts_author_id_fkey(id, username, full_name, avatar_url, bio)')
    .eq('published', true)
    .order('likes', { ascending: false })
    .limit(50);

  const authorLikesMap = {};

  if (popularPosts) {
    popularPosts.forEach((post) => {
      const authorId = post.author_id;
      if (!authorId || !post.profiles) return;

      if (!authorLikesMap[authorId]) {
        authorLikesMap[authorId] = {
          id: post.profiles.id,
          username: post.profiles.username,
          name: post.profiles.full_name || post.profiles.username,
          bio: post.profiles.bio || "Writer",
          avatar: post.profiles.avatar_url,
          totalLikes: 0
        };
      }
      authorLikesMap[authorId].totalLikes += (post.likes || 0);
    });
  }

  const topAuthors = Object.values(authorLikesMap)
    .sort((a, b) => b.totalLikes - a.totalLikes)
    .slice(0, 3);

  return { latestArticles: latestArticles || [], topAuthors };
}
