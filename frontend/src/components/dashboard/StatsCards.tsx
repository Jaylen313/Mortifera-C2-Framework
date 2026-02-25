/**
 * Stats Cards Component
 * 
 * Displays key statistics about agents and tasks.
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Users, Zap, CheckCircle, XCircle, Clock } from 'lucide-react';
import { agentsApi, tasksApi } from '../../lib/api';
import { Card } from '../common/Card';

export function StatsCards() {
  // Fetch agents
  const { data: agents = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: () => agentsApi.list(),
    refetchInterval: 5000,
  });

  // Fetch tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksApi.list(),
    refetchInterval: 5000,
  });

  // Calculate stats
  const stats = {
    totalAgents: agents.length,
    activeAgents: agents.filter((a) => a.status === 'active').length,
    inactiveAgents: agents.filter((a) => a.status === 'inactive').length,
    deadAgents: agents.filter((a) => a.status === 'dead').length,
    totalTasks: tasks.length,
    pendingTasks: tasks.filter((t) => t.status === 'pending').length,
    completedTasks: tasks.filter((t) => t.status === 'completed').length,
    failedTasks: tasks.filter((t) => t.status === 'failed').length,
  };

  const statCards = [
    {
      label: 'Active Agents',
      value: stats.activeAgents,
      total: stats.totalAgents,
      icon: Activity,
      color: 'green',
    },
    {
      label: 'Inactive Agents',
      value: stats.inactiveAgents,
      total: stats.totalAgents,
      icon: Clock,
      color: 'yellow',
    },
    {
      label: 'Total Agents',
      value: stats.totalAgents,
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Pending Tasks',
      value: stats.pendingTasks,
      total: stats.totalTasks,
      icon: Zap,
      color: 'purple',
    },
    {
      label: 'Completed Tasks',
      value: stats.completedTasks,
      total: stats.totalTasks,
      icon: CheckCircle,
      color: 'green',
    },
    {
      label: 'Failed Tasks',
      value: stats.failedTasks,
      total: stats.totalTasks,
      icon: XCircle,
      color: 'red',
    },
  ];

  const colorClasses = {
    green: 'bg-green-500/10 text-green-500',
    yellow: 'bg-yellow-500/10 text-yellow-500',
    blue: 'bg-blue-500/10 text-blue-500',
    purple: 'bg-purple-500/10 text-purple-500',
    red: 'bg-red-500/10 text-red-500',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat) => (
        <Card key={stat.label}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-dark-600">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-dark-900">{stat.value}</p>
                {stat.total !== undefined && (
                  <p className="text-sm text-dark-600">/ {stat.total}</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}