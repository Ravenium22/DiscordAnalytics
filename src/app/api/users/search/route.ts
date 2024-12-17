import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    if (/^\d+$/.test(query)) {
      const { data: userData, error: userError } = await supabase
        .from('user_mappings')
        .select('*')
        .eq('author_id', query);

      if (userData && userData.length > 0) {
        return NextResponse.json(userData);
      }
    }

    const searchQuery = `%${query}%`;
    
    const { data: mappingResults, error: mappingError } = await supabase
      .from('user_mappings')
      .select('*')
      .or(`username.ilike.${searchQuery},display_name.ilike.${searchQuery}`)
      .limit(10);

    if (mappingError) throw mappingError;

    if (!mappingResults || mappingResults.length === 0) {
      return NextResponse.json([]);
    }

    const results = await Promise.all(mappingResults.map(async (user) => {
      const { count } = await supabase
        .from('discord_messages')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', user.author_id);

      return {
        ...user,
        hasMessages: count ? count > 0 : false,
        messageCount: count || 0
      };
    }));

    return NextResponse.json(results);
    
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}