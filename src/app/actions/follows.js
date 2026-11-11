'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Follow or Unfollow a user
export async function toggleFollow(followingId) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }
  if (user.id === followingId) return { error: 'Cannot follow yourself' }

  // Check if already following
  const { data: existingFollow } = await supabase
    .from('follows')
    .select('*')
    .eq('follower_id', user.id)
    .eq('following_id', followingId)
    .single()

  let isFollowing = false;

  if (existingFollow) {
    // Unfollow
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', followingId)

    if (error) return { error: error.message }
  } else {
    // Follow
    const { error } = await supabase
      .from('follows')
      .insert([{ follower_id: user.id, following_id: followingId }])

    if (error) return { error: error.message }
    isFollowing = true;
  }

  // Revalidate profile pages and homepage feed
  revalidatePath('/')
  revalidatePath('/[user]', 'page')
  
  return { success: true, isFollowing }
}

// Check if current user is following the target user
export async function checkIsFollowing(followingId) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false;

  const { data } = await supabase
    .from('follows')
    .select('*')
    .eq('follower_id', user.id)
    .eq('following_id', followingId)
    .single()

  return !!data;
}
