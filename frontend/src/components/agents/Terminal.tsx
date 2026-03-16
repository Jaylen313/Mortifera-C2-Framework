/**
 * Interactive Terminal Component
 * 
 * Mythic C2 style shell interface with state persistence
 */

import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Terminal as TerminalIcon, Loader } from 'lucide-react';
import { tasksApi } from '../../lib/api';
import type { Agent } from '../../types';

interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'error';
  content: string;
  timestamp: Date;
}

interface TerminalProps {
  agent: Agent;
  savedLines?: TerminalLine[];
  savedHistory?: string[];
  onLinesChange?: (lines: TerminalLine[]) => void;
  onHistoryChange?: (history: string[]) => void;
}

export function Terminal({ 
  agent, 
  savedLines, 
  savedHistory,
  onLinesChange,
  onHistoryChange 
}: TerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>(() => {
    if (savedLines && savedLines.length > 0) {
      return savedLines;
    }
    return [
      {
        id: '0',
        type: 'output',
        content: `Connected to ${agent.hostname} (${agent.agent_id})`,
        timestamp: new Date(),
      },
      {
        id: '1',
        type: 'output',
        content: `OS: ${agent.os} | User: ${agent.username} | IP: ${agent.internal_ip}`,
        timestamp: new Date(),
      },
    ];
  });
  
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>(savedHistory || []);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Sync state changes to parent
  useEffect(() => {
    if (onLinesChange) {
      onLinesChange(lines);
    }
  }, [lines, onLinesChange]);

  useEffect(() => {
    if (onHistoryChange) {
      onHistoryChange(commandHistory);
    }
  }, [commandHistory, onHistoryChange]);

  // Auto-scroll to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (command: string) =>
      tasksApi.create({
        agent_id: agent.agent_id,
        task_type: 'shell',
        command: command,
        priority: 5,
      }),
    onSuccess: (data) => {
      // Poll for result
      pollForResult(data.task_id);
    },
    onError: (error: any) => {
      addLine('error', error.response?.data?.detail || 'Failed to execute command');
    },
  });

  const pollForResult = (taskId: string) => {
    const interval = setInterval(async () => {
      try {
        const task = await tasksApi.getById(taskId);
        
        if (task.status === 'completed') {
          clearInterval(interval);
          if (task.result?.output) {
            addLine('output', task.result.output);
          }
          if (task.result?.error) {
            addLine('error', task.result.error);
          }
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
        } else if (task.status === 'failed') {
          clearInterval(interval);
          addLine('error', task.error || 'Task failed');
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
      } catch (error) {
        clearInterval(interval);
        addLine('error', 'Failed to get task result');
      }
    }, 2000); // Poll every 2 seconds

    // Stop polling after 2 minutes
    setTimeout(() => clearInterval(interval), 120000);
  };

  const addLine = (type: 'command' | 'output' | 'error', content: string) => {
    setLines((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type,
        content,
        timestamp: new Date(),
      },
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    const command = input.trim();
    
    // Add command to history
    setCommandHistory((prev) => [...prev, command]);
    setHistoryIndex(-1);

    // Add command line to terminal
    addLine('command', command);

    // Clear input
    setInput('');

    // Handle local commands
    if (command === 'clear') {
      setLines([]);
      return;
    }

    if (command === 'help') {
      addLine('output', 'Available commands:');
      addLine('output', '  clear     - Clear terminal');
      addLine('output', '  help      - Show this help');
      addLine('output', '  exit      - Return to agents list');
      addLine('output', '');
      addLine('output', 'All other commands are executed on the remote agent.');
      return;
    }

    if (command === 'exit') {
      window.location.href = '/agents';
      return;
    }

    // Execute remote command
    createTaskMutation.mutate(command);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      
      const newIndex = historyIndex === -1 
        ? commandHistory.length - 1 
        : Math.max(0, historyIndex - 1);
      
      setHistoryIndex(newIndex);
      setInput(commandHistory[newIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      
      const newIndex = historyIndex + 1;
      if (newIndex >= commandHistory.length) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Terminal Window */}
      <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700 shadow-2xl">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-b border-gray-700">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center gap-2 ml-4 text-gray-400 text-sm">
            <TerminalIcon className="w-4 h-4" />
            <span>{agent.username}@{agent.hostname}</span>
          </div>
        </div>

        {/* Terminal Content */}
        <div 
          className="p-4 h-96 overflow-y-auto font-mono text-sm"
          onClick={() => inputRef.current?.focus()}
        >
          {/* Output Lines */}
          {lines.map((line) => (
            <div key={line.id} className="mb-1">
              {line.type === 'command' && (
                <div className="text-green-400">
                  <span className="text-blue-400">{agent.username}@{agent.hostname}</span>
                  <span className="text-white">:</span>
                  <span className="text-blue-400">~</span>
                  <span className="text-white">$ </span>
                  <span>{line.content}</span>
                </div>
              )}
              {line.type === 'output' && (
                <div className="text-gray-300 whitespace-pre-wrap">{line.content}</div>
              )}
              {line.type === 'error' && (
                <div className="text-red-400 whitespace-pre-wrap">{line.content}</div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {createTaskMutation.isPending && (
            <div className="flex items-center gap-2 text-yellow-400 mb-1">
              <Loader className="w-4 h-4 animate-spin" />
              <span>Executing command...</span>
            </div>
          )}

          {/* Input Line */}
          <form onSubmit={handleSubmit} className="flex items-center">
            <span className="text-blue-400">{agent.username}@{agent.hostname}</span>
            <span className="text-white">:</span>
            <span className="text-blue-400">~</span>
            <span className="text-white">$ </span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-white outline-none ml-1"
              placeholder="Enter command..."
              disabled={createTaskMutation.isPending}
            />
          </form>

          <div ref={terminalEndRef} />
        </div>
      </div>

      {/* Quick Commands */}
      <div className="flex flex-wrap gap-2">
        {[
          'whoami',
          'hostname',
          'ipconfig',
          'dir',
          'pwd',
          'systeminfo',
          'tasklist',
          'netstat -an',
        ].map((cmd) => (
          <button
            key={cmd}
            onClick={() => {
              setInput(cmd);
              inputRef.current?.focus();
            }}
            className="px-3 py-1.5 bg-dark-100 hover:bg-dark-200 border border-dark-300 rounded text-sm font-mono text-dark-900 transition-colors"
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
}