/**
 * Agents Page
 * 
 * Main page for viewing and managing agents.
 */

import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { StatsCards } from '../components/dashboard/StatsCards';
import { AgentsList } from '../components/agents/AgentsList';

export function AgentsPage() {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-dark-900 mb-2">
            Agents
          </h1>
          <p className="text-dark-600">
            View and manage all connected agents
          </p>
        </div>

        {/* Stats */}
        <StatsCards />

        {/* Agents List */}
        <AgentsList />
      </div>
    </MainLayout>
  );
}