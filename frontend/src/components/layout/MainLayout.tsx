/**
 * Main Layout Component
 * 
 * Wrapper with navigation and header.
 */

import React from 'react';
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
  X
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-dark-900">
                  {user?.username}
                </p>
                <p className="text-xs text-dark-600 capitalize">
                  {user?.role}
                </p>
              </div>

              <Button variant="secondary" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Logout</span>
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