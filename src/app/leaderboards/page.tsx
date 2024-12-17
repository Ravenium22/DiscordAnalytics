// src/app/leaderboards/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  MessageCircle,
  Reply,
  SmilePlus,
  Flame,
  ArrowLeft,
  Crown,
  CheckCircle,
  Star,
} from 'lucide-react'; // Import Lucide-React icons
import UserAvatar from '@/components/ui/UserAvatar';

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string | null;
  value: number;
  hasSpecialAchievement?: boolean; // Optional: For badges
}

interface LeaderboardData {
  topMessages: LeaderboardEntry[];
  topGramen: LeaderboardEntry[];
  topReplies: LeaderboardEntry[];
  topEmojis: LeaderboardEntry[];
}

const LeaderboardCard = ({
  title,
  data,
  icon: Icon,
  valueLabel,
}: {
  title: string;
  data: LeaderboardEntry[];
  icon: any;
  valueLabel: string;
}) => {
  // Function to determine rank styles with gradients
  const getRankStyles = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'; // Gold Gradient
      case 2:
        return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white'; // Silver Gradient
      case 3:
        return 'bg-gradient-to-r from-orange-500 to-yellow-700 text-white'; // Bronze Gradient
      default:
        return 'bg-primary/80 text-white'; // Default
    }
  };

  // Use Lucide-React icons for rank indicators
  const rankIcons = [
    <Crown key="1" className="w-5 h-5 text-yellow-300" />, // Gold
    <CheckCircle key="2" className="w-5 h-5 text-gray-300" />, // Silver
    <Star key="3" className="w-5 h-5 text-yellow-700" />, // Bronze
  ];

  // Determine the maximum value for progress bars (if implemented)
  const maxValue = data.length > 0 ? Math.max(...data.map((e) => e.value)) : 1;

  return (
    <Card className="bg-card border-2 border-primary/20 shadow-card rounded-2xl p-6 transform transition-transform duration-200 hover:scale-105 hover:shadow-card-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-outfit font-bold uppercase tracking-wide text-secondary">
          <Icon className="w-6 h-6 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data?.map((entry: LeaderboardEntry, index: number) => {
            const rank = index + 1;
            return (
              <div
                key={entry.id}
                className="flex items-center gap-4 py-4 border-b border-secondary/20 last:border-0"
                title={`Rank #${rank} - ${entry.name}`} // Tooltip
              >
                {/* Rank Indicator */}
                <div
                  className={`font-bold text-xl w-12 h-12 rounded-full flex items-center justify-center ${getRankStyles(
                    rank
                  )} transition-transform duration-200 hover:scale-110`}
                >
                  {rank <= 3 ? rankIcons[rank - 1] : (
                    <>
                      <span className="text-lg font-semibold block">#</span>
                      <span className="text-xl">{rank}</span>
                    </>
                  )}
                </div>

                {/* User Avatar */}
                <UserAvatar
                  name={entry.name}
                  avatarUrl={entry.avatar || undefined}
                  size="md"
                  className="rounded-full"
                />

                {/* User Info */}
                <div className="flex-1">
                  <div className="font-medium text-secondary font-outfit text-base md:text-lg">
                    {entry.name}
                  </div>
                  <div className="text-sm text-secondary/80 font-outfit md:text-base">
                    {valueLabel}: {entry.value.toLocaleString()}
                  </div>

                  {/* Optional: Progress Bar */}
                  {/* 
                  <div className="w-full bg-secondary/10 rounded-full h-2 mt-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(entry.value / maxValue) * 100}%` }}
                    ></div>
                  </div>
                  */}
                </div>

                {/* Optional: Add a badge or icon */}
                {rank === 1 && (
                  <span className="text-yellow-500 font-semibold">Top Performer</span>
                )}
                {entry.hasSpecialAchievement && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default function LeaderboardsPage() {
  const router = useRouter();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/leaderboards');
        const result: LeaderboardData = await response.json();
        console.log('Leaderboard data:', result);
        setData(result);
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
        setError('Failed to load leaderboards');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-secondary text-xl font-outfit">
          Loading leaderboards...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark p-8">
        <div className="max-w-2xl mx-auto bg-primary/10 border border-primary/20 rounded-lg p-6 text-center">
          <div className="text-primary text-xl mb-4 font-outfit">{error}</div>
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="flex items-center gap-2 hover:bg-primary/10 transition-colors duration-200"
          >
            Return to Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark py-8 px-4 sm:px-6 md:px-8 lg:px-16 xl:px-32">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="flex items-center gap-2 hover:bg-primary/10 transition-colors duration-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
          </Button>
        </div>

        <h1 className="text-4xl font-outfit font-semibold text-secondary mb-8 text-center">
          Server Leaderboards
        </h1>

        {/* Flex layout for LeaderboardCards */}
        <div className="flex flex-wrap -mx-4">
          <div className="w-full md:w-1/2 px-4 mb-8">
            <LeaderboardCard
              title="Most Active Users"
              data={data?.topMessages || []}
              icon={MessageCircle}
              valueLabel="Messages"
            />
          </div>
          <div className="w-full md:w-1/2 px-4 mb-8">
            <LeaderboardCard
              title='Top "Gramen" Users'
              data={data?.topGramen || []}
              icon={Flame}
              valueLabel="Uses"
            />
          </div>
          <div className="w-full md:w-1/2 px-4 mb-8">
            <LeaderboardCard
              title="Most Interactive Users"
              data={data?.topReplies || []}
              icon={Reply}
              valueLabel="Replies"
            />
          </div>
          <div className="w-full md:w-1/2 px-4 mb-8">
            <LeaderboardCard
              title="Emoji Enthusiasts"
              data={data?.topEmojis || []}
              icon={SmilePlus}
              valueLabel="Emojis"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
