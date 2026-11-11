import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log('Starting read_time migration (Full Recalculation)...');

  // Fetch all posts to recalculate
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, content');

  if (error) {
    console.error('Error fetching posts:', error.message);
    process.exit(1);
  }

  if (!posts || posts.length === 0) {
    console.log('No posts require migration. Everything is up to date!');
    return;
  }

  console.log(`Found ${posts.length} posts missing a read_time. Calculating...`);

  let successCount = 0;

  for (const post of posts) {
    // Calculate the exact read time
    const wordCount = post.content ? post.content.trim().split(/\s+/).length : 0;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    // Update the row
    const { error: updateError } = await supabase
      .from('posts')
      .update({ read_time: readTime })
      .eq('id', post.id);

    if (updateError) {
      console.error(`Failed to update post ${post.id}:`, updateError.message);
    } else {
      successCount++;
      console.log(`[Success] Post ${post.id} updated to ${readTime} MIN READ`);
    }
  }

  console.log(`\nMigration complete. Successfully updated ${successCount}/${posts.length} posts.`);
}

migrate();
