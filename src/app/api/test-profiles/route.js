import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('profiles')
      .select('username, full_name');

    return NextResponse.json({ data, error });
  } catch (err) {
    return NextResponse.json({ error: err.message });
  }
}
