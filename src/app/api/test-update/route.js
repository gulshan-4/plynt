import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('profiles')
      .update({ tagline: 'Test tagline' })
      .eq('username', 'admin')
      .select();

    return NextResponse.json({ data, error });
  } catch (err) {
    return NextResponse.json({ error: err.message });
  }
}
