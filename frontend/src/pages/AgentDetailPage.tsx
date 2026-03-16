/**
 * Agent Detail Page - Mythic C2 Style
 * 
 * Interactive terminal + task management
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Terminal as TerminalIcon,
  Zap,
  FileText,
  Info,
  Circle,
  Trash2
} from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { Terminal } from '../components/agents/Terminal';
import { AgentTasks } from '../components/agents/AgentTasks';
import { AgentInfo } from '../components/agents/AgentInfo';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { agentsApi } from '../lib/api';
import { cn } from '../utils/cn';
import type { Agent } from '../types';

type TabType = 'terminal' | 'tasks' | 'info';

interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'error';
  content: string;
  timestamp: Date;
}

export function AgentDetailPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('terminal');
  
  // Persist terminal state across tab switches
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);

  // Fetch agent details
  const { data: agent, isLoading } = useQuery({
    queryKey: ['agent', agentId],
    queryFn: () => agentsApi.getById(agentId!),
    refetchInterval: 5000,
    enabled: !!agentId,
  });

  // Delete agent mutation
  const deleteMutation = useMutation({
    mutationFn: () => agentsApi.delete(agentId!),
    onSuccess: () => {
      toast.success('Agent deleted');
      navigate('/agents');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete agent');
    },
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
        </div>
      </MainLayout>
    );
  }

  if (!agent) {
    return (
      <MainLayout>
        <Card className="text-center py-12">
          <p className="text-dark-600 mb-4">Agent not found</p>
          <Button onClick={() => navigate('/agents')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Agents
          </Button>
        </Card>
      </MainLayout>
    );
  }

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
    active: { color: 'text-green-500', bg: 'bg-green-500', label: 'ACTIVE' },
    inactive: { color: 'text-yellow-500', bg: 'bg-yellow-500', label: 'INACTIVE' },
    dead: { color: 'text-red-500', bg: 'bg-red-500', label: 'DEAD' },
  };

  const status = statusConfig[realStatus];

  const tabs = [
    { id: 'terminal', label: 'Terminal', icon: TerminalIcon },
    { id: 'tasks', label: 'Tasks', icon: Zap },
    { id: 'info', label: 'Info', icon: Info },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              onClick={() => navigate('/agents')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-dark-900">
                  {agent.hostname}
                </h1>
                <div className={cn(
                  'flex items-center gap-2 px-3 py-1 rounded-full',
                  status.bg + '/10'
                )}>
                  <Circle className={cn('w-3 h-3', status.bg)} fill="currentColor" />
                  <span className={cn('text-xs font-bold', status.color)}>
                    {status.label}
                  </span>
                </div>
              </div>
              <p className="text-dark-600 mt-1">
                {agent.agent_id} • {agent.username}@{agent.internal_ip}
              </p>
            </div>
          </div>

          <Button
            variant="danger"
            onClick={() => {
              if (confirm(`Delete agent ${agent.hostname}?`)) {
                deleteMutation.mutate();
              }
            }}
            isLoading={deleteMutation.isPending}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Agent
          </Button>
        </div>

        {/* Tabs */}
        <Card padding="none">
          <div className="border-b border-dark-200">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={cn(
                    'flex items-center gap-2 px-6 py-4 font-medium transition-colors',
                    'border-b-2',
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 bg-primary-50'
                      : 'border-transparent text-dark-600 hover:text-dark-900 hover:bg-dark-50'
                  )}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'terminal' && (
              <Terminal 
                agent={agent} 
                savedLines={terminalLines}
                savedHistory={commandHistory}
                onLinesChange={setTerminalLines}
                onHistoryChange={setCommandHistory}
              />
            )}
            {activeTab === 'tasks' && <AgentTasks agent={agent} />}
            {activeTab === 'info' && <AgentInfo agent={agent} />}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}