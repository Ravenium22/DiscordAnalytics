// src/app/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';
import Image from 'next/image';

interface SearchResult {
  author_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  hasMessages: boolean;
  messageCount: number;
}

const HomePage: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!username.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/users/search?query=${encodeURIComponent(username)}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const viewUserStats = (userId: string) => {
    router.push(`/stats/${userId}`);
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      {/* Header */}
      <header className="py-4 px-6 flex items-center justify-between border-b border-secondary/5">
        <div className="flex items-center gap-2">
          <Image
            src="/logomark.png"
            alt="Discord Analytics Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <h1 className="text-2xl font-outfit font-semibold text-secondary">
            Discord Analytics
          </h1>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-4xl mx-auto text-center space-y-8">
          {/* Title */}
          <h1 className="text-6xl font-outfit font-semibold text-secondary mb-2">
            Discord Analytics
          </h1>
          <p className="text-xl text-secondary/80 font-outfit mb-8">
            Discover insights about Discord users and their interactions
          </p>

          {/* Quick Actions */}
          <div className="flex justify-center gap-4 mb-12">
            <Button
              variant="outline"
              onClick={() => router.push('/network')}
            >
              View Network
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/leaderboards')}
            >
              View Leaderboards
            </Button>
          </div>

          {/* Search Container */}
          <div className="relative w-full max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by username or display name"
                className="w-full px-6 py-4 bg-card border-2 border-primary/10 rounded-lg
                          text-lg text-secondary placeholder-secondary/40
                          focus:outline-none focus:border-primary/30
                          transition-all duration-200 font-outfit"
              />
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="absolute right-2"
                variant="primary"
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg text-primary max-w-2xl mx-auto font-outfit">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="w-full bg-dark border-t border-secondary/5 py-12">
          <div className="max-w-4xl mx-auto space-y-4 px-4">
            {searchResults.map((user) => (
              <div
                key={user.author_id}
                className="bg-card border border-secondary/10 rounded-lg p-6
                         hover:border-primary/20 transition-all duration-200"
              >
                <div className="flex items-center gap-6">
                  <UserAvatar
                    name={user.display_name || user.username || 'Unknown User'}
                    avatarUrl={user.avatar_url || undefined}
                    size="md"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-outfit font-semibold text-secondary">
                      {user.display_name}
                    </h3>
                    <p className="text-secondary/60 font-outfit">@{user.username}</p>
                    <div className="mt-2 flex gap-4">
                      <span className="text-accent font-outfit">
                        Messages: {user.messageCount.toLocaleString()}
                      </span>
                      {user.hasMessages ? (
                        <span className="text-green-500 font-outfit">Active User</span>
                      ) : (
                        <span className="text-secondary/40 font-outfit">No Messages</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => viewUserStats(user.author_id)}
                    disabled={!user.hasMessages}
                    className="flex items-center gap-2"
                  >
                    View Stats
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchResults.length === 0 && username && !loading && (
        <div className="w-full bg-dark border-t border-secondary/5 py-12">
          <div className="text-center text-secondary/60 font-outfit">
            No users found matching "{username}"
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;