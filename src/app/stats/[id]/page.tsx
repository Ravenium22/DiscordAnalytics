'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle, SmilePlus } from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';
import StatCard from '@/components/ui/StatCard';
import EmojiCard from '@/components/ui/EmojiCard';
import WordBadge from '@/components/ui/WordBadge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';

interface UserStats {
  totalMessages: number;
  totalMessagesInDB: number;
  wordFrequency: { [key: string]: number };
  emojiFrequency: {
    custom: { [key: string]: number };
    unicode: { [key: string]: number };
  };
  userData: {
    author_id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

const parseEmojiName = (emojiText: string): string => {
  const parts = emojiText.replace(/[<>]/g, '').split(':');
  return parts.length === 3 ? parts[1] : parts[0];
};

const UserStatsPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${params.id}/stats`);
        if (!response.ok) {
          throw new Error('Failed to fetch user stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchStats();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-secondary h-12 w-12"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-primary/10 border border-primary/20 rounded-lg p-6 text-center">
          <p className="text-primary text-xl mb-4">{error || 'Failed to load stats'}</p>
          <Button
            variant="primary"
            onClick={() => router.push('/')}
            className="hover:bg-primary/20 transition-colors"
            aria-label="Return to Search"
          >
            Return to Search
          </Button>
        </div>
      </div>
    );
  }

  // Prepare emoji data
  const customEmojis = Object.entries(stats.emojiFrequency.custom)
    .sort(([, a], [, b]) => b - a)
    .map(([emoji, count]) => ({
      emoji,
      count,
      name: parseEmojiName(emoji),
    }))
    .slice(0, 20); // Limit to top 20

  const unicodeEmojis = Object.entries(stats.emojiFrequency.unicode)
    .sort(([, a], [, b]) => b - a)
    .map(([emoji, count]) => ({
      emoji,
      count,
      name: '', // Not needed for unicode emojis
    }))
    .slice(0, 20); // Limit to top 20

  // Prepare word frequency data
  const sortedWords = Object.entries(stats.wordFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20); // Limit to top 20 words

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark to-[#1d1d1d] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back to Search Button */}
        <Button
          variant="outline"
          onClick={() => router.push('/')}
          className="mb-8 flex items-center gap-2"
          aria-label="Back to Search"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Search
        </Button>

        {/* User Information */}
        <div className="flex items-center gap-6 mb-8">
          <UserAvatar
            name={stats.userData.display_name || stats.userData.username}
            avatarUrl={stats.userData.avatar_url || undefined}
            size="lg"
            className="rounded-full border-2 border-primary/50"
          />
          <div>
            <h1 className="text-4xl font-outfit font-bold text-secondary">
              {stats.userData.display_name || stats.userData.username}
            </h1>
            <p className="text-lg text-secondary/80">@{stats.userData.username}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <StatCard
            title="Total Messages"
            icon={<MessageCircle className="w-5 h-5 text-primary" />}
            value={stats.totalMessages.toLocaleString()}
          />
          <StatCard
            title="Total Emoji Usage"
            icon={<SmilePlus className="w-5 h-5 text-primary" />}
            value={(
              Object.values(stats.emojiFrequency.custom).reduce(
                (a, b) => a + b,
                0
              ) +
              Object.values(stats.emojiFrequency.unicode).reduce(
                (a, b) => a + b,
                0
              )
            ).toLocaleString()}
          />
        </div>

        {/* Word Frequency */}
        <Card className="bg-dark/50 border border-white/10 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-outfit font-semibold text-secondary">
              Most Used Words
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {sortedWords.map(([word, count]) => (
                <WordBadge key={word} word={word} count={count} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Emoji Usage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Custom Emojis */}
          <EmojiCard
            title="Custom Emojis"
            emojis={customEmojis}
            isCustom={true}
          />

          {/* Unicode Emojis */}
          <EmojiCard
            title="Unicode Emojis"
            emojis={unicodeEmojis}
            isCustom={false}
          />
        </div>
      </div>
    </div>
  );
};

export default UserStatsPage;
