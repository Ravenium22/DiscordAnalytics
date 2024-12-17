import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') ? 
      parseInt(searchParams.get('limit')!) : 50;
    const maxUsers = Math.min(Math.max(limit, 10), 100);

    const { data: messageStats, error: countError } = await supabase
      .rpc('get_message_counts', { limit_num: maxUsers });

    if (countError) throw countError;

    if (!messageStats || messageStats.length === 0) {
      return NextResponse.json({ nodes: [], links: [] });
    }

    const userIds = messageStats.map((stat: any) => stat.author_id);

    const [userDetailsResponse, interactionsResponse] = await Promise.all([
      supabase
        .from('user_mappings')
        .select('*')
        .in('author_id', userIds),
      
      supabase
        .from('user_interactions_view')
        .select('source_user_id, target_user_id, interaction_count')
        .in('source_user_id', userIds)
        .in('target_user_id', userIds)
        .order('interaction_count', { ascending: false })
        .limit(1000)
    ]);

    if (userDetailsResponse.error) throw userDetailsResponse.error;
    if (interactionsResponse.error) throw interactionsResponse.error;

    const userDetails = userDetailsResponse.data || [];
    const interactions = interactionsResponse.data || [];

    const nodes = userDetails.map((user: any) => ({
      id: user.author_id,
      name: user.display_name || user.username,
      avatar: user.avatar_url,
      messageCount: messageStats.find(
        (stat: any) => stat.author_id === user.author_id
      )?.message_count || 0
    }));

    const nodeIds = new Set(nodes.map(node => node.id));

    const links = interactions
      .filter(interaction => 
        nodeIds.has(interaction.source_user_id) && 
        nodeIds.has(interaction.target_user_id)
      )
      .map(interaction => ({
        source: interaction.source_user_id,
        target: interaction.target_user_id,
        value: interaction.interaction_count
      }));

    return NextResponse.json({ nodes, links });

  } catch (error) {
    console.error('Error in getNetwork:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}