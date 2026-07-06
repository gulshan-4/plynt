import useSWR from 'swr';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

// Supabase fetcher
const fetcher = async (url) => {
  if (url.startsWith('/api/posts/trending')) {
    const { data, error } = await supabase.from('posts').select('*, profiles!posts_author_id_fkey(username, full_name)').eq('published', true).order('likes', { ascending: false }).limit(10);
    if (error) throw error;
    return data;
  }
  
  if (url.startsWith('/api/posts/latest')) {
    const { data, error } = await supabase.from('posts').select('*, profiles!posts_author_id_fkey(username, full_name)').eq('published', true).order('created_at', { ascending: false }).limit(10);
    if (error) throw error;
    return data;
  }
  
  if (url.startsWith('/api/posts/top')) {
    const { data, error } = await supabase.from('posts').select('id, title, slug, cover_image, profiles!posts_author_id_fkey(username)').eq('published', true).order('likes', { ascending: false }).limit(3);
    if (error) throw error;
    return data;
  }

  if (url.startsWith('/api/users/') && url.includes('/posts/')) {
    const parsedUrl = new URL(`http://localhost${url}`);
    const pathParts = parsedUrl.pathname.split('/');
    const username = decodeURIComponent(pathParts[3]);
    const slug = decodeURIComponent(pathParts[5]);
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles!posts_author_id_fkey(username, full_name, avatar_url)')
      .eq('slug', slug)
      .single();
      
    if (error) throw error;
    
    if (data && data.profiles?.username !== username) {
      throw new Error("Article not found for this user");
    }
    
    return data;
  }

  if (url.startsWith('/api/users/')) {
    const username = decodeURIComponent(url.split('/').pop());
    const { data, error } = await supabase.from('profiles').select('*').eq('username', username).single();
    if (error) throw error;
    return data;
  }

  if (url.startsWith('/api/posts/search')) {
    const searchUrl = new URL(`http://localhost${url}`);
    const q = searchUrl.searchParams.get('q');
    if (!q) return [];
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles!posts_author_id_fkey(username, full_name)')
      .eq('published', true)
      .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  // Categories fetcher from Supabase
  if (url === '/api/categories') {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) throw error;
    return data || [];
  }

  // Tags fallback
  if (url === '/api/tags') {
    return [
      { id: 1, name: "React", slug: "react", count: 120 },
      { id: 2, name: "Next.js", slug: "nextjs", count: 85 },
      { id: 3, name: "Tailwind", slug: "tailwind", count: 64 },
    ];
  }


  return null;
};

// Hooks

export function useArticles(params = {}) {
  const query = new URLSearchParams(params).toString();
  const endpoint = params.sort === 'latest' ? `/api/posts/latest?${query}` : `/api/posts/trending?${query}`;
  const { data, error, isLoading } = useSWR(endpoint, fetcher);
  return { articles: data, error, isLoading };
}

export function useArticle(username, slug) {
  const { data, error, isLoading } = useSWR(username && slug ? `/api/users/${username}/posts/${slug}` : null, fetcher);
  return { article: data, error, isLoading };
}

export function useProfile(username) {
  const { data, error, isLoading } = useSWR(`/api/users/${username}`, fetcher);
  return { profile: data, error, isLoading };
}

export function useCategories() {
  const { data, error, isLoading } = useSWR('/api/categories', fetcher);
  return { categories: data, error, isLoading };
}

export function useTags() {
  const { data, error, isLoading } = useSWR('/api/tags', fetcher);
  return { tags: data, error, isLoading };
}

export function useTopPosts() {
  const { data, error, isLoading } = useSWR('/api/posts/top', fetcher);
  return { topPosts: data, error, isLoading };
}

export function useSearch(query) {
  const { data, error, isLoading } = useSWR(query ? `/api/posts/search?q=${encodeURIComponent(query)}` : null, fetcher);
  return { results: data, error, isLoading };
}
