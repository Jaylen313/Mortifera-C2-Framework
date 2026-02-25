/**
 * Dashboard Page
 * 
 * Overview of the C2 system.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { StatsCards } from '../components/dashboard/StatsCards';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { ArrowRight, Zap, Shield, Code } from 'lucide-react';

export function DashboardPage() {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-dark-900 mb-2">
            Dashboard
          </h1>
          <p className="text-dark-600">
            Overview of your command and control operations
          </p>
        </div>

        {/* Stats */}
        <StatsCards />

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-dark-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Shield className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-dark-900 mb-2">
                    View Agents
                  </h3>
                  <p className="text-sm text-dark-600 mb-4">
                    Manage all connected agents
                  </p>
                  <Link to="/agents">
                    <Button variant="secondary" size="sm">
                      Go to Agents
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Zap className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-dark-900 mb-2">
                    Manage Tasks
                  </h3>
                  <p className="text-sm text-dark-600 mb-4">
                    Create and monitor tasks
                  </p>
                  <Link to="/tasks">
                    <Button variant="secondary" size="sm">
                      Go to Tasks
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Code className="w-6 h-6 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-dark-900 mb-2">
                    Generate Agent
                  </h3>
                  <p className="text-sm text-dark-600 mb-4">
                    Create customized agents
                  </p>
                  <Link to="/generator">
                    <Button variant="secondary" size="sm">
                      Go to Generator
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}