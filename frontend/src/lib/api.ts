/**
 * API Client
 * 
 * Central place for all API calls.
 * Uses axios to make HTTP requests to the backend.
 */

import axios from 'axios';
import type { 
  LoginCredentials, 
  AuthResponse,
  Agent,
  Task,
  TaskCreate,
  AgentGenerateRequest,
  AgentGenerateResponse,
  User
} from '../types';

// ============================================
// CONFIGURATION
// ============================================
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_V1 = `${API_BASE_URL}/api/v1`;

// ============================================
// AXIOS INSTANCE
// ============================================
const api = axios.create({
  baseURL: API_V1,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// REQUEST INTERCEPTOR (Add auth token)
// ============================================
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('access_token');
    
    // Add token to headers if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR (Handle errors)
// ============================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized, clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// AUTHENTICATION API
// ============================================
export const authApi = {
  /**
   * Login user
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Register new user
   */
  register: async (data: { email: string; username: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Get current user info
   */
  me: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};

// ============================================
// AGENTS API
// ============================================
export const agentsApi = {
  /**
   * Get all agents
   */
  list: async (status?: string): Promise<Agent[]> => {
    const params = status ? { status } : {};
    const response = await api.get<Agent[]>('/agents/agents', { params });
    return response.data;
  },

  /**
   * Get single agent
   */
  get: async (agentId: string): Promise<Agent> => {
    const response = await api.get<Agent>(`/agents/agents/${agentId}`);
    return response.data;
  },

  /**
   * Delete agent
   */
  delete: async (agentId: string): Promise<void> => {
    await api.delete(`/agents/agents/${agentId}`);
  },
};

// ============================================
// TASKS API
// ============================================
export const tasksApi = {
  /**
   * Get all tasks
   */
  list: async (agentId?: string, status?: string): Promise<Task[]> => {
    const params: any = {};
    if (agentId) params.agent_id = agentId;
    if (status) params.status = status;
    
    const response = await api.get<Task[]>('/tasks', { params });
    return response.data;
  },

  /**
   * Get single task with result
   */
  get: async (taskId: string): Promise<Task> => {
    const response = await api.get<Task>(`/tasks/${taskId}`);
    return response.data;
  },

  /**
   * Create new task
   */
  create: async (task: TaskCreate): Promise<{ task_id: string; status: string }> => {
    const response = await api.post('/tasks', task);
    return response.data;
  },
};

// ============================================
// GENERATOR API
// ============================================
export const generatorApi = {
  /**
   * Get supported platforms
   */
  getPlatforms: async (): Promise<{ platforms: string[] }> => {
    const response = await api.get('/generator/platforms');
    return response.data;
  },

  /**
   * Get features for platform
   */
  getFeatures: async (platform: string): Promise<{ platform: string; features: string[] }> => {
    const response = await api.get(`/generator/features/${platform}`);
    return response.data;
  },

  /**
   * Generate agent
   */
  generate: async (config: AgentGenerateRequest): Promise<AgentGenerateResponse> => {
    const response = await api.post<AgentGenerateResponse>('/generator/generate', config);
    return response.data;
  },

  /**
   * Download agent
   */
  download: async (filename: string): Promise<Blob> => {
    const response = await api.get(`/generator/download/${filename}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// ============================================
// OPERATORS API
// ============================================
export const operatorsApi = {
  /**
   * Get all operators
   */
  list: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/operators');
    return response.data;
  },

  /**
   * Create operator
   */
  create: async (data: { email: string; username: string; password: string; role: string }): Promise<User> => {
    const response = await api.post<User>('/operators', data);
    return response.data;
  },

  /**
   * Delete operator
   */
  delete: async (operatorId: string): Promise<void> => {
    await api.delete(`/operators/${operatorId}`);
  },
};

export default api;