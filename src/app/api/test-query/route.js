import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug') || 'i-am-behind-and-i-cant-prove-it-but-does-it-matter';
    const username = searchParams.get('username') || 'admin';
    
    console.log("Testing with:", { slug, username });

    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles!posts_author_id_fkey!inner(username, full_name, avatar_url)')
      .eq('slug', slug)
      .eq('profiles.username', username)
      .single();

    return NextResponse.json({ data, error });
  } catch (err) {
    return NextResponse.json({ error: err.message });
  }
}
