import { create } from 'zustand';
import type { Task } from '../types';

interface TasksState {
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  statusFilter: string | null;
  setStatusFilter: (status: string | null) => void;
  agentFilter: string | null;
  setAgentFilter: (agentId: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useTasksStore = create<TasksState>((set) => ({
  selectedTask: null,
  setSelectedTask: (task) => set({ selectedTask: task }),
  statusFilter: null,
  setStatusFilter: (status) => set({ statusFilter: status }),
  agentFilter: null,
  setAgentFilter: (agentId) => set({ agentFilter: agentId }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}));