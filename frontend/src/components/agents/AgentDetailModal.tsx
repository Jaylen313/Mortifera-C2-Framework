/**
 * Agent Detail Modal
 * 
 * Shows detailed information about an agent.
 */

import React from 'react';
import { X, Copy, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import type { Agent } from '../../types';
import { cn } from '../../utils/cn';

interface AgentDetailModalProps {
  agent: Agent | null;
  onClose: () => void;
  onDelete?: (agentId: string) => void;
}

export function AgentDetailModal({ agent, onClose, onDelete }: AgentDetailModalProps) {
  if (!agent) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <Card className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-dark-900 mb-1">
              {agent.hostname}
            </h2>
            <p className="text-sm text-dark-600">
              Agent ID: {agent.agent_id}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-dark-600 hover:text-dark-900 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Status */}
        <div className="mb-6">
          <span
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium',
              agent.status === 'active' && 'bg-green-500/10 text-green-600',
              agent.status === 'inactive' && 'bg-yellow-500/10 text-yellow-600',
              agent.status === 'dead' && 'bg-red-500/10 text-red-600'
            )}
          >
            <span className="w-2 h-2 rounded-full bg-current" />
            {agent.status.toUpperCase()}
          </span>
        </div>

        {/* Details Grid */}
        <div className="space-y-6">
          {/* System Information */}
          <div>
            <h3 className="text-lg font-semibold text-dark-900 mb-3">
              System Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem
                label="Operating System"
                value={agent.os || 'Unknown'}
                onCopy={() => copyToClipboard(agent.os || '', 'OS')}
              />
              <DetailItem
                label="OS Version"
                value={agent.os_version || 'Unknown'}
                onCopy={() => copyToClipboard(agent.os_version || '', 'OS Version')}
              />
              <DetailItem
                label="Architecture"
                value={agent.architecture || 'Unknown'}
                onCopy={() => copyToClipboard(agent.architecture || '', 'Architecture')}
              />
              <DetailItem
                label="Privilege Level"
                value={agent.privilege_level || 'Unknown'}
                onCopy={() => copyToClipboard(agent.privilege_level || '', 'Privilege')}
              />
            </div>
          </div>

          {/* Network Information */}
          <div>
            <h3 className="text-lg font-semibold text-dark-900 mb-3">
              Network Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem
                label="Internal IP"
                value={agent.internal_ip || 'Unknown'}
                onCopy={() => copyToClipboard(agent.internal_ip || '', 'Internal IP')}
              />
              <DetailItem
                label="External IP"
                value={agent.external_ip || 'Unknown'}
                onCopy={() => copyToClipboard(agent.external_ip || '', 'External IP')}
              />
              <DetailItem
                label="Hostname"
                value={agent.hostname}
                onCopy={() => copyToClipboard(agent.hostname, 'Hostname')}
              />
              <DetailItem
                label="Domain"
                value={agent.domain || 'None'}
                onCopy={() => copyToClipboard(agent.domain || '', 'Domain')}
              />
            </div>
          </div>

          {/* User Information */}
          <div>
            <h3 className="text-lg font-semibold text-dark-900 mb-3">
              User Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem
                label="Username"
                value={agent.username || 'Unknown'}
                onCopy={() => copyToClipboard(agent.username || '', 'Username')}
              />
              <DetailItem
                label="Process Name"
                value={agent.process_name || 'Unknown'}
                onCopy={() => copyToClipboard(agent.process_name || '', 'Process')}
              />
              <DetailItem
                label="Process ID"
                value={agent.process_id?.toString() || 'Unknown'}
                onCopy={() => copyToClipboard(agent.process_id?.toString() || '', 'PID')}
              />
            </div>
          </div>

          {/* Beacon Configuration */}
          <div>
            <h3 className="text-lg font-semibold text-dark-900 mb-3">
              Beacon Configuration
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem
                label="Sleep Interval"
                value={`${agent.sleep_interval} seconds`}
              />
              <DetailItem
                label="Jitter"
                value={`${(agent.jitter * 100).toFixed(0)}%`}
              />
              <DetailItem
                label="Last Seen"
                value={formatDistanceToNow(new Date(agent.last_seen), { addSuffix: true })}
              />
              <DetailItem
                label="First Seen"
                value={formatDistanceToNow(new Date(agent.created_at), { addSuffix: true })}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-dark-200">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Close
          </Button>
          {onDelete && (
            <Button
              variant="danger"
              onClick={() => {
                if (confirm(`Delete agent ${agent.hostname}?`)) {
                  onDelete(agent.agent_id);
                  onClose();
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Agent
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

// Helper component for detail items
interface DetailItemProps {
  label: string;
  value: string;
  onCopy?: () => void;
}

function DetailItem({ label, value, onCopy }: DetailItemProps) {
  return (
    <div className="bg-dark-50 rounded-lg p-3">
      <p className="text-xs text-dark-600 mb-1">{label}</p>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-dark-900 truncate">
          {value}
        </p>
        {onCopy && value !== 'Unknown' && (
          <button
            onClick={onCopy}
            className="ml-2 text-dark-600 hover:text-primary-600 transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}