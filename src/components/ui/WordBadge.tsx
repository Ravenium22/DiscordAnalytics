// src/components/ui/WordBadge.tsx
import React from 'react';

interface WordBadgeProps {
  word: string;
  count: number;
}

const WordBadge: React.FC<WordBadgeProps> = ({ word, count }) => {
  return (
    <div className="bg-primary/20 px-4 py-2 rounded-full flex items-center gap-2 font-outfit text-sm font-medium text-secondary">
      <span className="text-primary">{word}</span>
      <span className="text-secondary/80">{count}</span>
    </div>
  );
};

export default WordBadge;
