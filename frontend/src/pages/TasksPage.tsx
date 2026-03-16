import React, { useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { CreateTaskForm } from '../components/tasks/CreateTaskForm';
import { TasksList } from '../components/tasks/TasksList';
import { Button } from '../components/common/Button';
import { Plus, List } from 'lucide-react';

export function TasksPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-dark-900 mb-2">
              Tasks
            </h1>
            <p className="text-dark-600">
              Create and manage tasks for your agents
            </p>
          </div>

          <Button
            variant={showCreateForm ? 'secondary' : 'primary'}
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? (
              <>
                <List className="w-4 h-4 mr-2" />
                View Tasks
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </>
            )}
          </Button>
        </div>

        {showCreateForm ? (
          <div className="max-w-2xl mx-auto">
            <CreateTaskForm
              onSuccess={() => setShowCreateForm(false)}
            />
          </div>
        ) : (
          <TasksList />
        )}
      </div>
    </MainLayout>
  );
}