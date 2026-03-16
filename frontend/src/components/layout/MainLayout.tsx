/**
 * Main Layout Component
 * 
 * Wrapper with navigation and header.
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../common/Button';
import { 
  Shield, 
  Activity, 
  Zap, 
  Code, 
  Users, 
  LogOut,
  Menu,
  X,
  User,
  Mail,
  Calendar,
  Crown,
  ChevronDown
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { format } from 'date-fns';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Activity },
    { name: 'Agents', href: '/agents', icon: Shield },
    { name: 'Tasks', href: '/tasks', icon: Zap },
    { name: 'Generator', href: '/generator', icon: Code },
    { name: 'Users', href: '/users', icon: Users, adminOnly: true },
  ];

  // Filter navigation based on role
  const filteredNav = navigation.filter((item) => {
    if (item.adminOnly && user?.role !== 'admin') {
      return false;
    }
    return true;
  });

  const isActive = (href: string) => location.pathname === href;

  const getRoleIcon = () => {
    switch (user?.role) {
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

  const getRoleBadgeClass = () => {
    switch (user?.role) {
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
    <div className="min-h-screen bg-dark-50">
      {/* Header */}
      <header className="bg-dark-100 border-b border-dark-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-dark-900">
                  C2 Framework
                </h1>
                <p className="text-xs text-dark-600">
                  Command & Control
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {filteredNav.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                    isActive(item.href)
                      ? 'bg-primary-600 text-white'
                      : 'text-dark-700 hover:bg-dark-200'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="hidden md:flex items-center gap-2 px-3 py-2 bg-dark-200 hover:bg-dark-300 rounded-lg transition-colors"
                >
                  <div className="text-right">
                    <p className="text-sm font-medium text-dark-900">
                      {user?.username}
                    </p>
                    <p className="text-xs text-dark-600 capitalize">
                      {user?.role}
                    </p>
                  </div>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-dark-600 transition-transform",
                    profileOpen && "rotate-180"
                  )} />
                </button>

                {/* Profile Dropdown Menu */}
                {profileOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileOpen(false)}
                    />
                    
                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-80 bg-dark-100 border border-dark-200 rounded-lg shadow-xl z-50">
                      {/* Header */}
                      <div className="p-4 border-b border-dark-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary-500/10 rounded-lg">
                            {getRoleIcon()}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-dark-900">{user?.username}</p>
                            <p className="text-sm text-dark-600">{user?.email}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className={cn(
                            'text-xs px-2 py-1 rounded border font-medium uppercase',
                            getRoleBadgeClass()
                          )}>
                            {user?.role}
                          </span>
                        </div>
                      </div>

                      {/* Profile Info */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <Mail className="w-4 h-4 text-dark-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-dark-600">Email</p>
                            <p className="text-sm text-dark-900 font-medium">{user?.email}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Calendar className="w-4 h-4 text-dark-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-dark-600">Account Created</p>
                            <p className="text-sm text-dark-900 font-medium">
                              {user?.created_at ? format(new Date(user.created_at), 'PPP') : 'N/A'}
                            </p>
                          </div>
                        </div>

                        {user?.last_login && (
                          <div className="flex items-start gap-3">
                            <Activity className="w-4 h-4 text-dark-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs text-dark-600">Last Login</p>
                              <p className="text-sm text-dark-900 font-medium">
                                {format(new Date(user.last_login), 'PPpp')}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-start gap-3">
                          <Shield className="w-4 h-4 text-dark-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-dark-600">User ID</p>
                            <p className="text-xs text-dark-900 font-mono break-all">{user?.id}</p>
                          </div>
                        </div>
                      </div>

                      {/* Logout Button */}
                      <div className="p-4 border-t border-dark-200">
                        <Button 
                          variant="secondary" 
                          onClick={() => {
                            setProfileOpen(false);
                            logout();
                          }}
                          className="w-full justify-center"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Logout Button */}
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={logout}
                className="md:hidden"
              >
                <LogOut className="w-4 h-4" />
              </Button>

              {/* Mobile menu button */}
              <button
                className="md:hidden text-dark-700"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pt-4 border-t border-dark-200">
              {/* Mobile Profile Info */}
              <div className="mb-4 p-3 bg-dark-200 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary-500/10 rounded-lg">
                    {getRoleIcon()}
                  </div>
                  <div>
                    <p className="font-semibold text-dark-900">{user?.username}</p>
                    <p className="text-xs text-dark-600">{user?.email}</p>
                  </div>
                </div>
                <span className={cn(
                  'text-xs px-2 py-1 rounded border font-medium uppercase inline-block',
                  getRoleBadgeClass()
                )}>
                  {user?.role}
                </span>
              </div>

              {/* Mobile Nav Links */}
              {filteredNav.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1',
                    isActive(item.href)
                      ? 'bg-primary-600 text-white'
                      : 'text-dark-700 hover:bg-dark-200'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}