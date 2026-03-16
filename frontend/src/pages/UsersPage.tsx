/**
 * Users Page
 * 
 * User management interface (admin only).
 * List, create, edit, and delete users.
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
  Users as UsersIcon, 
  UserPlus, 
  Trash2, 
  Edit2,
  Shield,
  User,
  Crown,
  Loader,
  X,
  Check
} from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { cn } from '../utils/cn';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

// API calls - CORRECT ENDPOINT: /api/v1/operators
const operatorsApi = {
  list: async (): Promise<User[]> => {
    const response = await fetch('http://localhost:8000/api/v1/operators', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch operators');
    return response.json();
  },
  
  create: async (data: { username: string; email: string; password: string; role: string }) => {
    const response = await fetch('http://localhost:8000/api/v1/operators', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create operator');
    }
    return response.json();
  },
  
  delete: async (userId: string) => {
    const response = await fetch(`http://localhost:8000/api/v1/operators/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete operator');
    }
    return response.json();
  }
};

export function UsersPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'operator'
  });

  // Fetch operators
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['operators'],
    queryFn: operatorsApi.list
  });

  // Create operator mutation
  const createUserMutation = useMutation({
    mutationFn: operatorsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operators'] });
      toast.success('User created successfully');
      setShowCreateModal(false);
      setFormData({ username: '', email: '', password: '', role: 'operator' });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create user');
    }
  });

  // Delete operator mutation
  const deleteUserMutation = useMutation({
    mutationFn: operatorsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operators'] });
      toast.success('User deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete user');
    }
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(formData);
  };

  const handleDeleteUser = (userId: string, username: string) => {
    if (confirm(`Delete user "${username}"? This action cannot be undone.`)) {
      deleteUserMutation.mutate(userId);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'operator':
        return <Shield className="w-4 h-4 text-blue-600" />;
      case 'viewer':
        return <User className="w-4 h-4 text-gray-600" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'operator':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-dark-900 mb-2">
              User Management
            </h1>
            <p className="text-dark-600">
              Manage operator accounts and permissions
            </p>
          </div>

          <Button onClick={() => setShowCreateModal(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Create User
          </Button>
        </div>

        {/* Users List */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-500/10 rounded-lg">
              <UsersIcon className="w-5 h-5 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-dark-900">
              All Users ({users.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-primary-500" />
              <p className="ml-3 text-dark-600">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="w-16 h-16 mx-auto text-dark-300 mb-4" />
              <p className="text-dark-600 mb-4">No users found</p>
              <Button variant="secondary" onClick={() => setShowCreateModal(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Create First User
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-dark-50 rounded-lg hover:bg-dark-100 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-2 bg-primary-500/10 rounded-lg">
                      {getRoleIcon(user.role)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-dark-900">{user.username}</p>
                        <span
                          className={cn(
                            'text-xs px-2 py-1 rounded border font-medium uppercase',
                            getRoleBadgeClass(user.role)
                          )}
                        >
                          {user.role}
                        </span>
                        {user.is_active && (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 border border-green-300 rounded font-medium">
                            ACTIVE
                          </span>
                        )}
                        {!user.is_active && (
                          <span className="text-xs px-2 py-1 bg-red-100 text-red-800 border border-red-300 rounded font-medium">
                            INACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-dark-600 mt-1">{user.email}</p>
                      <div className="flex items-center gap-4 text-xs text-dark-500 mt-1">
                        <span>Created: {new Date(user.created_at).toLocaleDateString()}</span>
                        {user.last_login && (
                          <span>Last login: {new Date(user.last_login).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            />

            <Card className="relative w-full max-w-md">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-dark-900">Create User</h2>
                  <p className="text-sm text-dark-600 mt-1">
                    Add a new operator account
                  </p>
                </div>

                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-dark-600 hover:text-dark-900 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-dark-200 rounded-lg text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="johndoe"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-dark-200 rounded-lg text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-dark-200 rounded-lg text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-dark-600 mt-1">Minimum 8 characters</p>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-100 border border-dark-200 rounded-lg text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="viewer">Viewer - Read-only access</option>
                    <option value="operator">Operator - Can manage agents and tasks</option>
                    <option value="admin">Admin - Full system access</option>
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    isLoading={createUserMutation.isPending}
                  >
                    {createUserMutation.isPending ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Create User
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}