'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import {
  MessageCircle,
  Reply,
  SmilePlus,
  Flame,
  ArrowUpDown,
} from 'lucide-react';
import { Button } from './button';
import UserAvatar from './UserAvatar';

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string | null;
  value: number;
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
  onSort,
  isAscending,
  loading,
  error,
}: {
  title: string;
  data: LeaderboardEntry[];
  icon: any;
  valueLabel: string;
  onSort: () => void;
  isAscending: boolean;
  loading: boolean;
  error: string;
}) => (
  <Card className="bg-card border-2 border-primary/20 shadow-lg">
    <CardHeader className="px-5 py-4">
      <div className="flex justify-between items-center">
        <CardTitle className="flex items-center gap-2 text-lg font-outfit font-semibold text-secondary">
          <Icon className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSort}
          className="flex items-center gap-1"
        >
          <ArrowUpDown className="w-4 h-4" />
          {isAscending ? 'Ascending' : 'Descending'}
        </Button>
      </div>
    </CardHeader>
    <CardContent className="px-1">
      {loading ? (
        <div className="text-center py-4 text-white/60">Loading...</div>
      ) : error ? (
        <div className="text-center py-4 text-red-400">{error}</div>
      ) : (
        <div className="space-y-4">
          {data.map((entry, index) => (
            <div
              key={entry.id}
              className="flex items-center gap-4 py-4 border-b border-secondary/20 last:border-0"
            >
              <div className="font-bold text-xl text-primary/80 w-8 text-center">
                {/* Display the rank number with improved styling */}
                <span className="text-base font-semibold block">#</span>
                <span className="text-xl">{index + 1}</span>
              </div>
              <UserAvatar
                name={entry.name}
                avatarUrl={entry.avatar || undefined}
                size="md"
                className="rounded-full"
              />
              <div className="flex-1">
                <div className="font-medium text-secondary font-outfit">
                  {entry.name}
                </div>
                <div className="text-sm text-secondary/80 font-outfit">
                  {valueLabel}: {entry.value.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

export function Leaderboards() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [sortOrders, setSortOrders] = useState({
    messages: false,
    gramen: false,
    replies: false,
    emojis: false,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchLeaderboards();
  }, [refreshKey]);

  const fetchLeaderboards = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/leaderboards');
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }

      const result: LeaderboardData = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching leaderboards:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load leaderboards'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (type: keyof typeof sortOrders) => {
    setSortOrders((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));

    if (data) {
      const newData = { ...data };
      newData[
        `top${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof LeaderboardData
      ] = [
        ...(data[
          `top${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof LeaderboardData
        ] || []),
      ].sort((a, b) =>
        sortOrders[type] ? a.value - b.value : b.value - a.value
      );
      setData(newData);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <LeaderboardCard
        title="Top Messages"
        data={data?.topMessages || []}
        icon={MessageCircle}
        valueLabel="Messages"
        onSort={() => handleSort('messages')}
        isAscending={sortOrders.messages}
        loading={loading}
        error={error}
      />
      <LeaderboardCard
        title='Top "Gramen" Users'
        data={data?.topGramen || []}
        icon={Flame}
        valueLabel="Uses"
        onSort={() => handleSort('gramen')}
        isAscending={sortOrders.gramen}
        loading={loading}
        error={error}
      />
      <LeaderboardCard
        title="Top Replies"
        data={data?.topReplies || []}
        icon={Reply}
        valueLabel="Replies"
        onSort={() => handleSort('replies')}
        isAscending={sortOrders.replies}
        loading={loading}
        error={error}
      />
      <LeaderboardCard
        title="Top Emoji Users"
        data={data?.topEmojis || []}
        icon={SmilePlus}
        valueLabel="Emojis"
        onSort={() => handleSort('emojis')}
        isAscending={sortOrders.emojis}
        loading={loading}
        error={error}
      />
    </div>
  );
}