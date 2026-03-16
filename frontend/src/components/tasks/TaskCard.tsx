import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Terminal, 
  CheckCircle, 
  XCircle, 
  Clock,
  Loader,
  Send,
  ChevronRight
} from 'lucide-react';
import { Card } from '../common/Card';
import type { Task } from '../../types';
import { cn } from '../../utils/cn';

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const statusConfig = {
    pending: {
      icon: Clock,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      label: 'Pending',
    },
    sent: {
      icon: Send,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      label: 'Sent',
    },
    running: {
      icon: Loader,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      label: 'Running',
    },
    completed: {
      icon: CheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      label: 'Completed',
    },
    failed: {
      icon: XCircle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      label: 'Failed',
    },
    cancelled: {
      icon: XCircle,
      color: 'text-gray-500',
      bg: 'bg-gray-500/10',
      label: 'Cancelled',
    },
  };

  const status = statusConfig[task.status];
  const StatusIcon = status.icon;

  const createdTime = formatDistanceToNow(new Date(task.created_at), {
    addSuffix: true,
  });

  const completedTime = task.completed_at
    ? formatDistanceToNow(new Date(task.completed_at), { addSuffix: true })
    : null;

  return (
    <Card
      className={cn(
        'transition-all duration-200 cursor-pointer',
        'hover:shadow-lg hover:border-primary-500',
        onClick && 'hover:scale-[1.01]'
      )}
      padding="md"
      onClick={() => onClick?.(task)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-dark-200 rounded-lg">
            <Terminal className="w-5 h-5 text-dark-700" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-dark-900 capitalize">
              {task.task_type.replace('_', ' ')}
            </h3>
            <p className="text-sm text-dark-600">
              ID: {task.id.substring(0, 8)}...
            </p>
          </div>
        </div>

        <div className={cn('flex items-center gap-2 px-3 py-1 rounded-full', status.bg)}>
          <StatusIcon className={cn('w-4 h-4', status.color)} />
          <span className={cn('text-xs font-medium', status.color)}>
            {status.label}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-dark-600 mb-1">Command:</p>
        <div className="bg-dark-50 rounded-lg p-3">
          <code className="text-sm font-mono text-dark-900 break-all">
            {task.command || 'No command'}
          </code>
        </div>
      </div>

      {task.result && (
        <div className="mb-4">
          <p className="text-xs text-dark-600 mb-1">
            {task.result.error ? 'Error:' : 'Output:'}
          </p>
          <div className={cn(
            'rounded-lg p-3 max-h-24 overflow-hidden',
            task.result.error ? 'bg-red-50' : 'bg-green-50'
          )}>
            <code className={cn(
              'text-sm font-mono line-clamp-3',
              task.result.error ? 'text-red-700' : 'text-green-700'
            )}>
              {task.result.error || task.result.output || 'No output'}
            </code>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-dark-600">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-xs">Created:</span>
            <span className="ml-1">{createdTime}</span>
          </div>
          {completedTime && (
            <div>
              <span className="text-xs">Completed:</span>
              <span className="ml-1">{completedTime}</span>
            </div>
          )}
        </div>

        {onClick && (
          <div className="flex items-center text-primary-600 font-medium">
            View Details
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-dark-200">
        <div className="flex items-center justify-between text-xs">
          <span className="text-dark-600">Priority:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={cn(
                  'w-2 h-2 rounded-full',
                  level <= task.priority
                    ? 'bg-primary-500'
                    : 'bg-dark-200'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}