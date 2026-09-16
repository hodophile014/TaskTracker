import * as signalR from '@microsoft/signalr';
import {
  AuthResponse,
  DashboardAnalytics,
  TaskCreatePayload,
  TaskItem,
  TaskStatus,
  TaskUpdatePayload,
  User,
  UserRole,
} from '../types';

const API_BASE = '/api';

export const getStoredToken = (): string | null => {
  return localStorage.getItem('tasktracker_token');
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem('tasktracker_token', token);
};

export const clearStoredToken = (): void => {
  localStorage.removeItem('tasktracker_token');
};

const getAuthHeaders = (): HeadersInit => {
  const token = getStoredToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data.errors && typeof data.errors === 'object') {
        const firstField = Object.keys(data.errors)[0];
        if (firstField && Array.isArray(data.errors[firstField])) {
          errorMsg = data.errors[firstField][0];
        } else {
          errorMsg = data.message || data.title || JSON.stringify(data);
        }
      } else {
        errorMsg = data.message || data.title || JSON.stringify(data);
      }
    } catch {
      // fallback to status text
      errorMsg = res.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }
  if (res.status === 204) {
    return {} as T;
  }
  return res.json();
}

// ================= AUTH API =================
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse<AuthResponse>(res);
    setStoredToken(data.token);
    return data;
  },

  register: async (payload: {
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    password: string;
    role?: UserRole;
  }): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await handleResponse<AuthResponse>(res);
    return data;
  },

  getMe: async (): Promise<User> => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<User>(res);
  },
};

// ================= TASKS API =================
export const tasksApi = {
  getTasks: async (params?: {
    status?: string;
    priority?: string;
    assignedToId?: number;
    search?: string;
  }): Promise<TaskItem[]> => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.priority) query.append('priority', params.priority);
    if (params?.assignedToId) query.append('assignedToId', params.assignedToId.toString());
    if (params?.search) query.append('search', params.search);

    const qs = query.toString();
    const url = `${API_BASE}/tasks${qs ? `?${qs}` : ''}`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse<TaskItem[]>(res);
  },

  getTask: async (id: number): Promise<TaskItem> => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<TaskItem>(res);
  },

  createTask: async (payload: TaskCreatePayload): Promise<TaskItem> => {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<TaskItem>(res);
  },

  updateTask: async (id: number, payload: TaskUpdatePayload): Promise<TaskItem> => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<TaskItem>(res);
  },

  updateStatus: async (id: number, status: TaskStatus): Promise<TaskItem> => {
    const res = await fetch(`${API_BASE}/tasks/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse<TaskItem>(res);
  },

  completeTask: async (id: number): Promise<TaskItem> => {
    const res = await fetch(`${API_BASE}/tasks/${id}/complete`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse<TaskItem>(res);
  },

  deleteTask: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    await handleResponse<void>(res);
  },
};

// ================= USERS API =================
export const usersApi = {
  getAllUsers: async (): Promise<User[]> => {
    const res = await fetch(`${API_BASE}/users`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<User[]>(res);
  },

  updateUserRole: async (id: number, role: UserRole): Promise<void> => {
    const res = await fetch(`${API_BASE}/users/${id}/role`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    });
    await handleResponse<void>(res);
  },

  toggleUserStatus: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/users/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    await handleResponse<void>(res);
  },
};

// ================= ANALYTICS API =================
export const analyticsApi = {
  getDashboard: async (): Promise<DashboardAnalytics> => {
    const res = await fetch(`${API_BASE}/analytics/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<DashboardAnalytics>(res);
  },
};

// ================= SIGNALR HUB CLIENT =================
export function createSignalRConnection(
  onTaskCreated: (task: TaskItem) => void,
  onTaskUpdated: (task: TaskItem) => void,
  onTaskDeleted: (taskId: number) => void,
  onTaskStatusChanged: (taskId: number, newStatus: string) => void
): signalR.HubConnection {
  const connection = new signalR.HubConnectionBuilder()
    .withUrl('/hubs/tasks', {
      accessTokenFactory: () => getStoredToken() || '',
      skipNegotiation: false,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  connection.on('TaskCreated', onTaskCreated);
  connection.on('TaskUpdated', onTaskUpdated);
  connection.on('TaskDeleted', onTaskDeleted);
  connection.on('TaskStatusChanged', onTaskStatusChanged);

  return connection;
}

