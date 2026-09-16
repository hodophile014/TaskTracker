import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { TaskListPage } from './pages/TaskListPage';
import { KanbanPage } from './pages/KanbanPage';
import { UsersPage } from './pages/UsersPage';
import { Navbar } from './components/Navbar';
import { TaskModal } from './components/TaskModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { createSignalRConnection, tasksApi } from './services/api';
import { TaskItem } from './types';
import {
  LayoutDashboard,
  ListTodo,
  Columns3,
  Users,
} from 'lucide-react';

type Page = 'dashboard' | 'tasks' | 'kanban' | 'users';

export const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [page, setPage] = useState<Page>('dashboard');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTask, setEditTask] = useState<TaskItem | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const { isAdmin, isManager } = useAuth();

  const addToast = useCallback((type: ToastMessage['type'], title: string, message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadTasks = useCallback(async () => {
    setTasksLoading(true);
    try {
      const data = await tasksApi.getTasks();
      setTasks(data);
    } catch (err: any) {
      addToast('error', 'Failed to load tasks', err.message || 'Unknown error');
    } finally {
      setTasksLoading(false);
    }
  }, [addToast]);

  // Load tasks when user logs in
  useEffect(() => {
    if (user) {
      loadTasks();
    } else {
      setTasks([]);
    }
  }, [user, loadTasks]);

  // SignalR connection
  useEffect(() => {
    if (!user) return;

    const connection = createSignalRConnection(
      (task) => {
        setTasks((prev) => {
          if (prev.find((t) => t.id === task.id)) return prev;
          return [task, ...prev];
        });
        addToast('info', 'Task Created', `"${task.title}" was created`);
      },
      (task) => {
        setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
        addToast('info', 'Task Updated', `"${task.title}" was updated`);
      },
      (taskId) => {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        addToast('info', 'Task Deleted', `Task #${taskId} was removed`);
      },
      (taskId, newStatus) => {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: newStatus as any } : t))
        );
      }
    );

    connection
      .start()
      .then(() => setIsRealtimeConnected(true))
      .catch(() => setIsRealtimeConnected(false));

    connection.onreconnecting(() => setIsRealtimeConnected(false));
    connection.onreconnected(() => setIsRealtimeConnected(true));
    connection.onclose(() => setIsRealtimeConnected(false));

    return () => {
      connection.stop();
    };
  }, [user, addToast]);

  const handleTaskCreated = useCallback(() => {
    setShowCreateModal(false);
    loadTasks();
    addToast('success', 'Task Created', 'Your task has been created successfully');
  }, [loadTasks, addToast]);

  const handleTaskUpdated = useCallback(() => {
    setEditTask(null);
    loadTasks();
    addToast('success', 'Task Updated', 'Task has been updated successfully');
  }, [loadTasks, addToast]);

  const handleEditTask = useCallback((task: TaskItem) => {
    setEditTask(task);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#4f46e5' }}>TaskTracker</div>
          <div style={{ fontSize: 14, color: '#64748b', marginTop: 8 }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const navItems: { key: Page; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { key: 'tasks', label: 'Task List', icon: <ListTodo size={18} /> },
    { key: 'kanban', label: 'Kanban Board', icon: <Columns3 size={18} /> },
  ];

  if (isAdmin) {
    navItems.push({ key: 'users', label: 'Team & Users', icon: <Users size={18} /> });
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>TaskTracker</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Manage your workflow</div>
        </div>
        <nav style={{ padding: '12px 8px', flex: 1 }}>
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: page === item.key ? 600 : 500,
                backgroundColor: page === item.key ? '#eef2ff' : 'transparent',
                color: page === item.key ? '#4f46e5' : '#475569',
                transition: 'all 0.15s ease',
                marginBottom: 2,
                textAlign: 'left',
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Area */}
      <div className="main-content">
        <Navbar
          onOpenCreateModal={() => setShowCreateModal(true)}
          isRealtimeConnected={isRealtimeConnected}
        />
        <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          {page === 'dashboard' && <Dashboard tasks={tasks} />}
          {page === 'tasks' && (
            <TaskListPage
              tasks={tasks}
              loading={tasksLoading}
              onRefresh={loadTasks}
              onEditTask={handleEditTask}
              onDeleteTask={async (id) => {
                try {
                  await tasksApi.deleteTask(id);
                  loadTasks();
                  addToast('success', 'Task Deleted', 'Task has been deleted');
                } catch (err: any) {
                  addToast('error', 'Delete Failed', err.message);
                }
              }}
              onStatusChange={async (id, status) => {
                try {
                  await tasksApi.updateStatus(id, status);
                  loadTasks();
                } catch (err: any) {
                  addToast('error', 'Status Update Failed', err.message);
                }
              }}
            />
          )}
          {page === 'kanban' && (
            <KanbanPage
              tasks={tasks}
              onStatusChange={async (id, status) => {
                try {
                  await tasksApi.updateStatus(id, status);
                  loadTasks();
                } catch (err: any) {
                  addToast('error', 'Status Update Failed', err.message);
                }
              }}
              onEditTask={handleEditTask}
            />
          )}
          {page === 'users' && <UsersPage />}
        </main>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <TaskModal
          onClose={() => setShowCreateModal(false)}
          onSaved={handleTaskCreated}
        />
      )}

      {/* Edit Task Modal */}
      {editTask && (
        <TaskModal
          task={editTask}
          onClose={() => setEditTask(null)}
          onSaved={handleTaskUpdated}
        />
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

