/**
 * Agent Card Component
 * 
 * Displays individual agent information in a card format.
 */

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Monitor, 
  User, 
  Network, 
  Clock,
  Circle,
  ChevronRight
} from 'lucide-react';
import { Card } from '../common/Card';
import type { Agent } from '../../types';
import { cn } from '../../utils/cn';

interface AgentCardProps {
  agent: Agent;
  onClick?: (agent: Agent) => void;
}

export function AgentCard({ agent, onClick }: AgentCardProps) {
  // Status indicator
  const statusConfig = {
    active: {
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      label: 'Active',
    },
    inactive: {
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      label: 'Inactive',
    },
    dead: {
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      label: 'Dead',
    },
  };

  const status = statusConfig[agent.status];

  // Calculate time since last seen
  const lastSeenText = formatDistanceToNow(new Date(agent.last_seen), {
    addSuffix: true,
  });

  return (
    <Card
      className={cn(
        'transition-all duration-200 cursor-pointer',
        'hover:shadow-lg hover:border-primary-500',
        onClick && 'hover:scale-[1.02]'
      )}
      padding="md"
      onClick={() => onClick?.(agent)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Status indicator */}
          <div className={cn('p-2 rounded-lg', status.bg)}>
            <Circle className={cn('w-5 h-5', status.color)} fill="currentColor" />
          </div>
          
          {/* Hostname */}
          <div>
            <h3 className="text-lg font-semibold text-dark-900">
              {agent.hostname}
            </h3>
            <p className="text-sm text-dark-600">
              {agent.agent_id}
            </p>
          </div>
        </div>

        {/* Status badge */}
        <span
          className={cn(
            'px-3 py-1 rounded-full text-xs font-medium',
            status.bg,
            status.color
          )}
        >
          {status.label}
        </span>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* OS */}
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-dark-600" />
          <div>
            <p className="text-xs text-dark-600">Operating System</p>
            <p className="text-sm font-medium text-dark-900">
              {agent.os || 'Unknown'}
            </p>
          </div>
        </div>

        {/* User */}
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-dark-600" />
          <div>
            <p className="text-xs text-dark-600">User</p>
            <p className="text-sm font-medium text-dark-900">
              {agent.username || 'Unknown'}
            </p>
          </div>
        </div>

        {/* IP */}
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-dark-600" />
          <div>
            <p className="text-xs text-dark-600">Internal IP</p>
            <p className="text-sm font-medium text-dark-900">
              {agent.internal_ip || 'Unknown'}
            </p>
          </div>
        </div>

        {/* Last Seen */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-dark-600" />
          <div>
            <p className="text-xs text-dark-600">Last Seen</p>
            <p className="text-sm font-medium text-dark-900">
              {lastSeenText}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      {onClick && (
        <div className="flex items-center justify-end text-primary-600 text-sm font-medium">
          View Details
          <ChevronRight className="w-4 h-4 ml-1" />
        </div>
      )}
    </Card>
  );
}