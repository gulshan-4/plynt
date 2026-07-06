import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function backfill() {
  console.log('Backfilling profiles for existing users...');
  
  // 1. Get all users from auth.users (admin API)
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
  
  if (usersError) {
    console.error('Error fetching users:', usersError);
    return;
  }

  console.log(`Found ${users.length} users in Auth.`);

  let added = 0;
  // 2. Loop through users and insert into profiles if missing
  for (const user of users) {
    // Check if profile exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      console.log(`Missing profile for ${user.email}. Creating...`);
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: user.user_metadata?.username || user.email.split('@')[0],
          full_name: user.user_metadata?.full_name || 'User',
          avatar_url: user.user_metadata?.avatar_url || '/user.webp'
        });

      if (insertError) {
        console.error(`Failed to create profile for ${user.email}:`, insertError);
      } else {
        added++;
      }
    }
  }

  console.log(`Backfill complete. Created ${added} missing profiles.`);
}

backfill();
