/**
 * Agent Info Component
 * 
 * Displays detailed system information
 */

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../common/Card';
import type { Agent } from '../../types';

interface AgentInfoProps {
  agent: Agent;
}

export function AgentInfo({ agent }: AgentInfoProps) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="space-y-6">
      {/* System Information */}
      <div>
        <h3 className="text-lg font-semibold text-dark-900 mb-3">
          System Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <InfoItem
            label="Operating System"
            value={agent.os || 'Unknown'}
            onCopy={() => copyToClipboard(agent.os || '', 'OS')}
          />
          <InfoItem
            label="OS Version"
            value={agent.os_version || 'Unknown'}
            onCopy={() => copyToClipboard(agent.os_version || '', 'OS Version')}
          />
          <InfoItem
            label="Architecture"
            value={agent.architecture || 'Unknown'}
            onCopy={() => copyToClipboard(agent.architecture || '', 'Architecture')}
          />
          <InfoItem
            label="Privilege Level"
            value={agent.privilege_level || 'User'}
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
          <InfoItem
            label="Internal IP"
            value={agent.internal_ip || 'Unknown'}
            onCopy={() => copyToClipboard(agent.internal_ip || '', 'Internal IP')}
          />
          <InfoItem
            label="External IP"
            value={agent.external_ip || 'Unknown'}
            onCopy={() => copyToClipboard(agent.external_ip || '', 'External IP')}
          />
          <InfoItem
            label="Hostname"
            value={agent.hostname}
            onCopy={() => copyToClipboard(agent.hostname, 'Hostname')}
          />
          <InfoItem
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
          <InfoItem
            label="Username"
            value={agent.username || 'Unknown'}
            onCopy={() => copyToClipboard(agent.username || '', 'Username')}
          />
          <InfoItem
            label="Process Name"
            value={agent.process_name || 'Unknown'}
            onCopy={() => copyToClipboard(agent.process_name || '', 'Process')}
          />
          <InfoItem
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
          <InfoItem
            label="Sleep Interval"
            value={`${agent.sleep_interval} seconds`}
          />
          <InfoItem
            label="Jitter"
            value={`${(agent.jitter * 100).toFixed(0)}%`}
          />
          <InfoItem
            label="Last Seen"
            value={formatDistanceToNow(new Date(agent.last_seen), { addSuffix: true })}
          />
          <InfoItem
            label="First Seen"
            value={formatDistanceToNow(new Date(agent.created_at), { addSuffix: true })}
          />
        </div>
      </div>

      {/* Agent ID */}
      <div>
        <h3 className="text-lg font-semibold text-dark-900 mb-3">
          Agent Identifiers
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <InfoItem
            label="Agent ID"
            value={agent.agent_id}
            onCopy={() => copyToClipboard(agent.agent_id, 'Agent ID')}
          />
          <InfoItem
            label="Database ID"
            value={agent.id}
            onCopy={() => copyToClipboard(agent.id, 'Database ID')}
          />
        </div>
      </div>
    </div>
  );
}

// Helper component
interface InfoItemProps {
  label: string;
  value: string;
  onCopy?: () => void;
}

function InfoItem({ label, value, onCopy }: InfoItemProps) {
  return (
    <div className="bg-dark-50 rounded-lg p-3">
      <p className="text-xs text-dark-600 mb-1">{label}</p>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-dark-900 font-mono truncate">
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