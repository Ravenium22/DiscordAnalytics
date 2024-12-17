// src/app/api/leaderboards/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface MessageCount {
  author_id: string;
  message_count: number;
}

interface GramenCount {
  author_id: string;
  count: number;
}

interface ReplyCount {
  author_id: string;
  count: number;
}

interface EmojiCount {
  author_id: string;
  count: number;
}

interface UserDetail {
  author_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

// The shape of the response data from the RPC
interface RpcResponse {
    author_id: string;
    count: number; // Assuming the default structure, adjust if necessary
}

export async function GET(request: Request) {
    try {
        // Get top message users
        const { data: topMessages, error: messagesError } = await supabase
            .rpc<RpcResponse>('get_message_counts', { limit_num: 10 });

        if (messagesError) throw new Error(`Failed to fetch top messages: ${messagesError.message}`);

        // Get top Gramen users
        const { data: topGramen, error: gramenError } = await supabase
            .rpc<RpcResponse>('get_gramen_users', { limit_num: 10 });

        if (gramenError) throw new Error(`Failed to fetch top Gramen users: ${gramenError.message}`);

        // Get top reply users
        const { data: topReplies, error: repliesError } = await supabase
            .rpc<RpcResponse>('get_reply_counts', { limit_num: 10 });

        if (repliesError) throw new Error(`Failed to fetch top replies: ${repliesError.message}`);

        // Get top emoji users
        const { data: topEmojis, error: emojisError } = await supabase
            .rpc<RpcResponse>('get_emoji_users', { limit_num: 10 });

        if (emojisError) throw new Error(`Failed to fetch top emoji users: ${emojisError.message}`);

        // Get user details for all users
        const userIds = Array.from(new Set([
            ...topMessages.map((m: MessageCount) => m.author_id),
            ...topGramen.map((g: GramenCount) => g.author_id),
            ...topReplies.map((r: ReplyCount) => r.author_id),
            ...topEmojis.map((e: EmojiCount) => e.author_id)
        ]));

        const { data: userDetails, error: userError } = await supabase
            .from<UserDetail>('user_mappings')
            .select('*')
            .in('author_id', userIds);

        if (userError) throw new Error(`Failed to fetch user details: ${userError.message}`);

        // Format the response
        const formatLeaderboard = (data: any[], idField: string = 'author_id') =>
            data.map((entry: any) => {
                const user = userDetails.find((u: UserDetail) => u.author_id === entry[idField]);
                return {
                    id: entry[idField],
                    name: user ? user.display_name || user.username : 'Unknown User',
                    avatar: user?.avatar_url || null,
                    value: entry.message_count || entry.count || 0, // Handle variations in value field names
                };
            });

        return NextResponse.json({
            topMessages: formatLeaderboard(topMessages),
            topGramen: formatLeaderboard(topGramen),
            topReplies: formatLeaderboard(topReplies),
            topEmojis: formatLeaderboard(topEmojis)
        });

    } catch (error) {
        console.error('Error in leaderboards route:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch leaderboard data',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}