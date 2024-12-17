// src/components/ui/EmojiCard.tsx
import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';

interface Emoji {
  emoji: string;
  count: number;
  name: string;
}

interface EmojiCardProps {
  title: string;
  emojis: Emoji[];
  isCustom?: boolean;
}

const EmojiCard: React.FC<EmojiCardProps> = ({ title, emojis, isCustom = false }) => {
  return (
    <Card className="bg-dark/50 border border-white/10 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-outfit font-semibold text-secondary">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {emojis.map(({ emoji, count, name }) => (
            <div
              key={name}
              className="bg-primary/20 px-4 py-2 rounded-full flex items-center gap-2 font-medium text-secondary"
            >
              {isCustom ? (
                <div className="w-8 h-8 flex items-center justify-center">
                  <img
                    src={`/Emojis/${name}.png`}
                    alt={name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (target.src.endsWith('.png')) {
                        target.src = `/Emojis/${name}.gif`;
                      } else {
                        const parent = target.parentElement;
                        if (parent) {
                          const nameSpan = document.createElement('span');
                          nameSpan.textContent = name;
                          nameSpan.className = 'text-xs text-secondary';
                          target.style.display = 'none';
                          parent.appendChild(nameSpan);
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <span className="text-2xl">{emoji}</span>
              )}
              <span className="text-secondary/80">{count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmojiCard;
