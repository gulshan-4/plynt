import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const categories = [
  { name: 'Technology', slug: 'technology' },
  { name: 'Business', slug: 'business' },
  { name: 'Lifestyle', slug: 'lifestyle' },
  { name: 'Health', slug: 'health' },
  { name: 'Science', slug: 'science' },
  { name: 'Sports', slug: 'sports' },
  { name: 'Entertainment', slug: 'entertainment' },
  { name: 'Finance', slug: 'finance' }
];

async function seed() {
  console.log('Seeding categories...');

  // Clean up existing just in case
  await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const { data, error } = await supabase.from('categories').insert(categories).select();

  if (error) {
    console.error('Error seeding categories:', error);
  } else {
    console.log('Successfully seeded categories:');
    data.forEach(c => console.log(`- ${c.name}`));
  }
}

seed();