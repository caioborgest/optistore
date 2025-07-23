
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckSquare, Clock, AlertTriangle, BarChart3 } from 'lucide-react';

interface TaskStatsProps {
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

export const TaskStats: React.FC<TaskStatsProps> = ({
  pending,
  inProgress,
  completed,
  overdue
}) => {
  const stats = [
    {
      title: 'Pendentes',
      value: pending,
      icon: Clock,
      color: 'text-yellow-500'
    },
    {
      title: 'Em Andamento',
      value: inProgress,
      icon: BarChart3,
      color: 'text-blue-500'
    },
    {
      title: 'Concluídas',
      value: completed,
      icon: CheckSquare,
      color: 'text-green-500'
    },
    {
      title: 'Atrasadas',
      value: overdue,
      icon: AlertTriangle,
      color: 'text-red-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
