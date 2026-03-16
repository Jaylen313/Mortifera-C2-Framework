import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
  Shield, 
  Circle,
  ChevronRight,
  Clock,
  User,
  Globe,
  Terminal
} from 'lucide-react';
import { Card } from '../common/Card';
import type { Agent } from '../../types';
import { cn } from '../../utils/cn';

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const navigate = useNavigate();

  // Calculate real-time status
  const getAgentRealStatus = () => {
    const lastSeenDate = new Date(agent.last_seen);
    const minutesAgo = (Date.now() - lastSeenDate.getTime()) / 60000;
    
    if (minutesAgo > 30) return 'dead';
    if (minutesAgo > 5) return 'inactive';
    return 'active';
  };

  const realStatus = getAgentRealStatus();
  
  const statusConfig = {
    active: { color: 'text-green-500', bg: 'bg-green-500', label: 'Active' },
    inactive: { color: 'text-yellow-500', bg: 'bg-yellow-500', label: 'Inactive' },
    dead: { color: 'text-red-500', bg: 'bg-red-500', label: 'Dead' },
  };

  const status = statusConfig[realStatus];
  const lastSeenTime = formatDistanceToNow(new Date(agent.last_seen), { addSuffix: true });

  return (
    <Card
      className={cn(
        'transition-all duration-200 cursor-pointer',
        'hover:shadow-lg hover:border-primary-500 hover:scale-[1.01]'
      )}
      padding="md"
      onClick={() => navigate(`/agents/${agent.agent_id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500/10 rounded-lg">
            <Shield className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-dark-900">{agent.hostname}</h3>
            <p className="text-sm text-dark-600">{agent.agent_id.substring(0, 12)}...</p>
          </div>
        </div>

        <div className={cn('flex items-center gap-2 px-3 py-1 rounded-full', status.bg + '/10')}>
          <Circle className={cn('w-3 h-3', status.bg)} fill="currentColor" />
          <span className={cn('text-xs font-medium', status.color)}>{status.label}</span>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-dark-600" />
          <div>
            <p className="text-xs text-dark-600">OS</p>
            <p className="text-sm font-medium text-dark-900">{agent.os || 'Unknown'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-dark-600" />
          <div>
            <p className="text-xs text-dark-600">User</p>
            <p className="text-sm font-medium text-dark-900">{agent.username || 'Unknown'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-dark-600" />
          <div>
            <p className="text-xs text-dark-600">Internal IP</p>
            <p className="text-sm font-medium text-dark-900">{agent.internal_ip || 'Unknown'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-dark-600" />
          <div>
            <p className="text-xs text-dark-600">Last Seen</p>
            <p className="text-sm font-medium text-dark-900">{lastSeenTime}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end text-sm text-primary-600 font-medium pt-3 border-t border-dark-200">
        Click for details
        <ChevronRight className="w-4 h-4 ml-1" />
      </div>
    </Card>
  );
}