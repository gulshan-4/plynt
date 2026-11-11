import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return the categories directly as JSON
    return NextResponse.json(categories || []);
  } catch (err) {
    console.error('Unexpected error in /api/categories:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
