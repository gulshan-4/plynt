'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getSidebarCategories() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

export async function getCategoryPreviews() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('categories')
    .select(`
      id, name, slug, post_count,
      posts!inner (
        id, title, slug, cover_image, created_at, tags, likes, comments_count, read_time,
        profiles!posts_author_id_fkey ( id, username, full_name, avatar_url )
      )
    `)
    .eq('posts.published', true)
    .order('likes', { foreignTable: 'posts', ascending: false })
    .limit(3, { foreignTable: 'posts' })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching category previews:', error);
    return [];
  }

  return data || [];
}

export async function getCategoryPosts(categoryId, tagSlug, page = 0, limit = 12, sortMode = 'latest') {
  const supabase = await createClient();

  let query = supabase
    .from('posts')
    .select('*, profiles!posts_author_id_fkey(username, full_name, avatar_url)')
    .eq('published', true);

  if (categoryId) {
    query = query.or(`category_id.eq.${categoryId},tags.cs.{${tagSlug}}`);
  } else {
    query = query.contains('tags', [tagSlug]);
  }

  // Sort
  if (sortMode === 'popular') {
    query = query.order('likes', { ascending: false });
  } else if (sortMode === 'discussed') {
    query = query.order('comments_count', { ascending: false });
  } else {
    // Default to latest
    query = query.order('created_at', { ascending: false });
  }

  // Secondary sort by id for stable pagination
  query = query.order('id', { ascending: false });

  // Pagination
  const from = page * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching paginated category posts:', error);
    return [];
  }

  return data || [];
}

export async function checkIsFollowingCategory(categoryId) {
  if (!categoryId) return false;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('category_followers')
    .select('created_at')
    .eq('user_id', user.id)
    .eq('category_id', categoryId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("checkIsFollowingCategory error:", error);
  }

  return !!data;
}

export async function toggleFollowCategory(categoryId) {
  if (!categoryId) throw new Error('Category ID required');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data } = await supabase
    .from('category_followers')
    .select('created_at')
    .eq('user_id', user.id)
    .eq('category_id', categoryId)
    .single();

  let isFollowing = false;

  if (data) {
    const { error } = await supabase
      .from('category_followers')
      .delete()
      .eq('user_id', user.id)
      .eq('category_id', categoryId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('category_followers')
      .insert({ user_id: user.id, category_id: categoryId });
    if (error) throw error;
    isFollowing = true;
  }
  
  revalidatePath('/category/[slug]', 'page');
  return isFollowing;
}
