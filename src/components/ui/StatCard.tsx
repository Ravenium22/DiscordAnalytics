// src/components/ui/StatCard.tsx
import React from 'react';
import { ReactNode } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';

interface StatCardProps {
  title: string;
  icon: ReactNode;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ title, icon, value }) => {
  return (
    <Card className="bg-dark/50 border border-white/10 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-outfit font-semibold text-secondary flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-outfit font-bold text-secondary">
          {value}
        </p>
      </CardContent>
    </Card>
  );
};

export default StatCard;
