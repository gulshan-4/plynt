'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Publishing a new post or updating an existing one
export async function publishPost(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to publish a post' }
  }

  const postId = formData.get('post_id')
  const title = formData.get('title')
  const slug = formData.get('slug')
  const content = formData.get('content')
  const html = formData.get('html')
  const tagsStr = formData.get('tags')
  const categoryId = formData.get('category_id')
  const coverImage = formData.get('cover_image') // Currently a URL if uploaded, or empty

  if (!title || !slug || !html) {
    return { error: 'Missing required fields' }
  }

  const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : []

  const postData = {
    title,
    slug,
    content,
    html,
    tags,
    category_id: categoryId || null,
    cover_image: coverImage || null,
    published: true,
    updated_at: new Date().toISOString()
  }

  let query = supabase.from('posts')

  if (postId) {
    // Updating existing post
    query = query.update(postData).eq('id', postId).eq('author_id', user.id)
  } else {
    // Inserting new post
    postData.author_id = user.id
    query = query.insert([postData])
  }

  const { data, error } = await query.select()

  if (error) {
    console.error("Error publishing/updating post:", error)
    if (error.code === '23505') {
      return { error: 'This URL slug is already taken. Please modify the slug in your Article Settings.' }
    }
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath(`/@${user.user_metadata?.username || user.id}/${slug}`)
  
  return { success: true, post: data[0] }
}

// Toggling a Like
export async function toggleLike(postId) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Check if like exists
  const { data: existingLike } = await supabase
    .from('likes')
    .select('*')
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .single()

  if (existingLike) {
    // Unlike
    await supabase.from('likes').delete().eq('user_id', user.id).eq('post_id', postId)
    // Decrement post likes count
    await supabase.rpc('decrement_likes', { p_id: postId }) // We might need to create this RPC, or we can just fetch and decrement, or let a trigger handle it.
  } else {
    // Like
    await supabase.from('likes').insert([{ user_id: user.id, post_id: postId }])
    await supabase.rpc('increment_likes', { p_id: postId })
  }

  revalidatePath('/')
  return { success: true }
}

// Toggling a Bookmark
export async function toggleBookmark(postId) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: existingBookmark } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .single()

  if (existingBookmark) {
    await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('post_id', postId)
  } else {
    await supabase.from('bookmarks').insert([{ user_id: user.id, post_id: postId }])
  }

  revalidatePath('/')
  return { success: true }
}

// Adding a comment
export async function addComment(postId, content) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  if (!content || !content.trim()) {
    return { error: 'Comment cannot be empty' }
  }

  const { data, error } = await supabase
    .from('comments')
    .insert([
      {
        post_id: postId,
        author_id: user.id,
        content: content.trim()
      }
    ])
    .select()

  if (error) return { error: error.message }

  // Increment comment count
  await supabase.rpc('increment_comments', { p_id: postId })

  revalidatePath('/')
  return { success: true, comment: data[0] }
}

// Adding a reply to a comment
export async function addReply(postId, parentId, content) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  if (!content || !content.trim()) {
    return { error: 'Reply cannot be empty' }
  }

  const { data, error } = await supabase
    .from('comments')
    .insert([
      {
        post_id: postId,
        parent_id: parentId,
        author_id: user.id,
        content: content.trim()
      }
    ])
    .select()

  if (error) return { error: error.message }

  // Increment comment count on the post
  await supabase.rpc('increment_comments', { p_id: postId })

  revalidatePath('/')
  return { success: true, comment: data[0] }
}

// Toggling a Comment Like
export async function toggleCommentLike(commentId) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: existingLike } = await supabase
    .from('comment_likes')
    .select('*')
    .eq('user_id', user.id)
    .eq('comment_id', commentId)
    .single()

  if (existingLike) {
    await supabase.from('comment_likes').delete().eq('user_id', user.id).eq('comment_id', commentId)
    await supabase.rpc('decrement_comment_likes', { c_id: commentId })
  } else {
    await supabase.from('comment_likes').insert([{ user_id: user.id, comment_id: commentId }])
    await supabase.rpc('increment_comment_likes', { c_id: commentId })
  }

  revalidatePath('/')
  return { success: true }
}

// Delete Post
export async function deletePost(postId) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('author_id', user.id) // Ensure only author can delete

  if (error) return { error: error.message }

  revalidatePath('/')
  return { success: true }
}

// Report Post
export async function reportPost(postId, reason) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('reports')
    .insert([
      {
        post_id: postId,
        reporter_id: user?.id || null, // Allow anonymous reporting if not logged in
        reason: reason
      }
    ])

  if (error) return { error: error.message }

  return { success: true }
}

// Fetch user interactions (likes/saves) for a specific post
export async function getUserInteraction(postId) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { isLiked: false, isSaved: false, userId: null }

  const [likeRes, saveRes] = await Promise.all([
    supabase.from('likes').select('user_id').eq('user_id', user.id).eq('post_id', postId).single(),
    supabase.from('bookmarks').select('user_id').eq('user_id', user.id).eq('post_id', postId).single()
  ])

  return {
    isLiked: !!likeRes.data,
    isSaved: !!saveRes.data,
    userId: user.id
  }
}

// Increment views for a post
export async function incrementPostView(postId) {
  const supabase = await createClient()
  await supabase.rpc('increment_views', { p_id: postId })
  return { success: true }
}

// Get the latest feed with pagination and a featured post on page 1
export async function getLatestFeed(page = 1, limit = 20) {
  const supabase = await createClient()
  const from = (page - 1) * limit
  const to = from + limit - 1

  let featuredPost = null

  // If page 1, fetch the featured post based on the algorithm
  // Algorithm: Most likes + views from the last 5 days
  if (page === 1) {
    const fiveDaysAgo = new Date()
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)

    const { data: topData } = await supabase
      .from('posts')
      .select('*, profiles!posts_author_id_fkey(username, avatar_url, full_name)')
      .eq('published', true)
      .gte('created_at', fiveDaysAgo.toISOString())
      .order('likes', { ascending: false }) // Postgres doesn't easily let us order by (likes+views) directly via PostgREST without an RPC or View, so we'll fetch top 20 and compute in JS
      .limit(20)

    if (topData && topData.length > 0) {
      // Sort by likes + views_count
      const sorted = topData.sort((a, b) => {
        const aScore = (a.likes || 0) + (a.views_count || 0)
        const bScore = (b.likes || 0) + (b.views_count || 0)
        return bScore - aScore
      })
      featuredPost = sorted[0]
    }
  }

  // Fetch the latest posts feed
  let query = supabase
    .from('posts')
    .select('*, profiles!posts_author_id_fkey(username, avatar_url, full_name)')
    .eq('published', true)

  if (featuredPost) {
    query = query.neq('id', featuredPost.id) // exclude the featured post from the main feed
  }

  query = query.order('created_at', { ascending: false }).range(from, to)

  const { data: posts, error } = await query

  if (error) {
    console.error("Error fetching latest feed:", error.message || error)
    return { posts: [] }
  }

  return { featuredPost, posts: posts || [] }
}
