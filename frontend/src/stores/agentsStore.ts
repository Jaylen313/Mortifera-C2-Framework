/**
 * Agents Store
 * 
 * Manages agent state and operations.
 * Uses React Query for server state management.
 */

import { create } from 'zustand';
import type { Agent } from '../types';

interface AgentsState {
  // Selected agent for details view
  selectedAgent: Agent | null;
  setSelectedAgent: (agent: Agent | null) => void;
  
  // Filter state
  statusFilter: string | null;
  setStatusFilter: (status: string | null) => void;
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useAgentsStore = create<AgentsState>((set) => ({
  selectedAgent: null,
  setSelectedAgent: (agent) => set({ selectedAgent: agent }),
  
  statusFilter: null,
  setStatusFilter: (status) => set({ statusFilter: status }),
  
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}));