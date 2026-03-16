/**
 * TypeScript type definitions
 */

// ============================================
// USER & AUTH TYPES
// ============================================
export interface User {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'operator' | 'viewer';
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
}

// ============================================
// AGENT TYPES
// ============================================
export interface Agent {
  id: string;
  agent_id: string;
  hostname: string;
  username: string | null;
  domain: string | null;
  internal_ip: string | null;
  external_ip: string | null;
  os: string | null;
  os_version: string | null;
  architecture: string | null;
  process_name: string | null;
  process_id: number | null;
  privilege_level: string | null;
  sleep_interval: number;
  jitter: number;
  status: 'active' | 'inactive' | 'dead';
  last_seen: string;
  created_at: string;
  updated_at: string;
}

export interface AgentCreate {
  agent_id: string;
  hostname: string;
  username?: string;
  internal_ip?: string;
  os?: string;
  architecture?: string;
}

// ============================================
// TASK TYPES
// ============================================
export type TaskType = 
  | 'shell'
  | 'screenshot'
  | 'keylog_start'
  | 'keylog_stop'
  | 'keylog_dump'
  | 'file_upload'
  | 'file_download'
  | 'credentials';

export type TaskStatus = 
  | 'pending'
  | 'sent'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface Task {
  id: string;
  agent_id: string;
  task_type: TaskType;
  command: string;
  status: TaskStatus;
  priority: number;
  created_at: string;
  completed_at: string | null;
  result?: TaskResult;
}

export interface TaskCreate {
  agent_id: string;
  task_type: TaskType;
  command: string;
  priority?: number;
}

export interface TaskResult {
  output: string | null;
  error: string | null;
  execution_time: number;
}

// ============================================
// AGENT GENERATOR TYPES
// ============================================
export interface AgentGenerateRequest {
  platform: 'windows' | 'linux' | 'macos';
  c2_server: string;
  features: string[];
  sleep_interval: number;
  jitter: number;
  encryption_enabled: boolean;
  custom_name?: string;
  profile?: string;  // ← ADDED: Malleable C2 profile
}

export interface AgentGenerateResponse {
  success: boolean;
  agent_id: string;
  python_file: string;
  executable: string | null;
  download_python: string;
  download_executable: string | null;
  config: {
    platform: string;
    features: string[];
    sleep_interval: number;
    jitter: number;
    encryption_enabled: boolean;
    profile?: string;  // ← ADDED
  };
}

// ============================================
// MALLEABLE C2 PROFILE TYPES
// ============================================
export interface C2Profile {
  name: string;
  description: string;
}

// ============================================
// STATS TYPES
// ============================================
export interface DashboardStats {
  total_agents: number;
  active_agents: number;
  inactive_agents: number;
  total_tasks: number;
  pending_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
}