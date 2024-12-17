import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function isCustomEmoji(text: string): boolean {
  return (text.startsWith('<:') || text.startsWith('<a:')) && text.endsWith('>');
}

function processMessage(content: string) {
  const words: string[] = [];
  const customEmojis: string[] = [];
  const unicodeEmojis: string[] = [];

  content.split(/\s+/).forEach(word => {
    if (isCustomEmoji(word)) {
      customEmojis.push(word);
    }
  });

  const flagRegex = /[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/g;
  const flags = content.match(flagRegex) || [];
  flags.forEach(flag => {
    unicodeEmojis.push(flag);
  });

  const contentWithoutFlags = content.replace(flagRegex, '');
  const otherEmojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  const otherEmojis = contentWithoutFlags.match(otherEmojiRegex) || [];
  otherEmojis.forEach(emoji => {
    if (!/[\u{1F3FB}-\u{1F3FF}]/gu.test(emoji)) {
      unicodeEmojis.push(emoji);
    }
  });

  content
    .replace(/<a?:[^>]+>/g, '')
    .toLowerCase()
    .split(/\s+/)
    .forEach(word => {
      const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
      if (
        cleanWord.length > 1 &&
        !/^\d+$/.test(cleanWord) &&
        !cleanWord.includes('http') &&
        !cleanWord.includes('www.') &&
        !/^[0-9<>:]+$/.test(cleanWord)
      ) {
        words.push(cleanWord);
      }
    });

  return { words, customEmojis, unicodeEmojis };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    const { data: mappingData, error: mappingError } = await supabase
      .from('user_mappings')
      .select('*')
      .eq('author_id', userId);

    if (mappingError || !mappingData || mappingData.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { count, error: countError } = await supabase
      .from('discord_messages')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', userId);

    if (countError) throw countError;

    let allMessages: any[] = [];
    let page = 0;
    const pageSize = 1000;
    const wordFrequency: { [key: string]: number } = {};
    const emojiFrequency: { [key: string]: number } = {};

    while (true) {
      const { data: messages, error: messagesError } = await supabase
        .from('discord_messages')
        .select('*')
        .eq('author_id', userId)
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (messagesError) throw messagesError;
      if (!messages || messages.length === 0) break;

      messages.forEach(message => {
        if (message.content) {
          const { words, customEmojis, unicodeEmojis } = processMessage(message.content);
          
          words.forEach(word => {
            wordFrequency[word] = (wordFrequency[word] || 0) + 1;
          });

          customEmojis.forEach(emoji => {
            emojiFrequency[emoji] = (emojiFrequency[emoji] || 0) + 1;
          });

          unicodeEmojis.forEach(emoji => {
            emojiFrequency[emoji] = (emojiFrequency[emoji] || 0) + 1;
          });
        }
      });

      allMessages = allMessages.concat(messages);
      
      if (messages.length < pageSize) break;
      page++;
    }

    return NextResponse.json({
      totalMessages: allMessages.length,
      totalMessagesInDB: count,
      wordFrequency: Object.fromEntries(
        Object.entries(wordFrequency)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 50)
      ),
      emojiFrequency: {
        custom: Object.fromEntries(
          Object.entries(emojiFrequency)
            .filter(([key]) => isCustomEmoji(key))
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
        ),
        unicode: Object.fromEntries(
          Object.entries(emojiFrequency)
            .filter(([key]) => !isCustomEmoji(key))
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
        )
      },
      userData: mappingData[0]
    });

  } catch (error) {
    console.error('Error in getUserStats:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}