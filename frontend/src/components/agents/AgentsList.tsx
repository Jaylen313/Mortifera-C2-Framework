/**
 * Agents List Component
 * 
 * Displays all agents with filtering and search.
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { agentsApi } from '../../lib/api';
import { useAgentsStore } from '../../stores/agentsStore';
import { AgentCard } from './AgentCard';
import { AgentDetailModal } from './AgentDetailModal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import type { Agent } from '../../types';

export function AgentsList() {
  const queryClient = useQueryClient();
  const { selectedAgent, setSelectedAgent, statusFilter, setStatusFilter, searchQuery, setSearchQuery } = useAgentsStore();

  // Fetch agents
  const { data: agents = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['agents', statusFilter],
    queryFn: () => agentsApi.list(statusFilter || undefined),
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  // Delete agent mutation
  const deleteMutation = useMutation({
    mutationFn: (agentId: string) => agentsApi.delete(agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      toast.success('Agent deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete agent');
    },
  });

  // Filter agents by search query
  const filteredAgents = agents.filter((agent) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      agent.hostname.toLowerCase().includes(query) ||
      agent.agent_id.toLowerCase().includes(query) ||
      agent.username?.toLowerCase().includes(query) ||
      agent.internal_ip?.toLowerCase().includes(query)
    );
  });

  // Status filter options
  const statusOptions = [
    { value: null, label: 'All Agents' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'dead', label: 'Dead' },
  ];

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-600" />
              <Input
                type="text"
                placeholder="Search agents by hostname, ID, user, or IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {statusOptions.map((option) => (
              <Button
                key={option.value || 'all'}
                variant={statusFilter === option.value ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setStatusFilter(option.value)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {option.label}
              </Button>
            ))}
          </div>

          {/* Refresh Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
          <p className="mt-4 text-dark-600">Loading agents...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredAgents.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-dark-600 mb-2">No agents found</p>
          {searchQuery ? (
            <p className="text-sm text-dark-500">
              Try adjusting your search query
            </p>
          ) : (
            <p className="text-sm text-dark-500">
              Generate and run an agent to get started
            </p>
          )}
        </Card>
      )}

      {/* Agents Grid */}
      {!isLoading && filteredAgents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onClick={setSelectedAgent}
            />
          ))}
        </div>
      )}

      {/* Results Count */}
      {!isLoading && filteredAgents.length > 0 && (
        <p className="text-sm text-dark-600 text-center">
          Showing {filteredAgents.length} of {agents.length} agent(s)
        </p>
      )}

      {/* Agent Detail Modal */}
      <AgentDetailModal
        agent={selectedAgent}
        onClose={() => setSelectedAgent(null)}
        onDelete={(agentId) => deleteMutation.mutate(agentId)}
      />
    </div>
  );
}