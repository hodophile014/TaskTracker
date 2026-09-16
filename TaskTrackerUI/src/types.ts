export type UserRole = 'Admin' | 'Manager' | 'Member';

export type TaskStatus = 'To Do' | 'In Progress' | 'In Review' | 'Done';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  taskCount?: number;
}

export interface AuthResponse {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  token: string;
  expiresAtUtc: string;
}

export interface TaskItem {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdDate: string;
  dueDate: string;
  userId: number;
  creatorName: string;
  creatorEmail: string;
  assignedToUserId?: number;
  assignedToName?: string;
  assignedToEmail?: string;
}

export interface TaskCreatePayload {
  title: string;
  description: string;
  dueDate?: string;
  priority?: TaskPriority;
  assignedToUserId?: number;
  status?: TaskStatus;
}

export interface TaskUpdatePayload {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToUserId?: number;
}

export interface UserWorkload {
  userId: number;
  username: string;
  email: string;
  role: string;
  assignedCount: number;
  completedCount: number;
}

export interface DashboardAnalytics {
  totalTasks: number;
  toDoTasks: number;
  inProgressTasks: number;
  inReviewTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionRate: number;
  tasksByPriority: Record<string, number>;
  tasksByStatus: Record<string, number>;
  teamWorkload: UserWorkload[];
  upcomingDeadlines: TaskItem[];
  recentTasks: TaskItem[];
}

