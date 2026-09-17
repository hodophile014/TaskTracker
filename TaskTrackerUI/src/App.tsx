import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { TaskListPage } from './pages/TaskListPage';
import { KanbanPage } from './pages/KanbanPage';
import { UsersPage } from './pages/UsersPage';
import { Navbar, Page } from './components/Navbar';
import { TaskModal } from './components/TaskModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { createSignalRConnection, tasksApi } from './services/api';
import { TaskItem } from './types';
import { CheckSquare } from 'lucide-react';

export const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [page, setPage] = useState<Page>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTask, setEditTask] = useState<TaskItem | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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
        addToast('info', 'Task Pin Added', `"${task.title}" was pinned`);
      },
      (task) => {
        setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
        addToast('info', 'Pin Updated', `"${task.title}" was updated`);
      },
      (taskId) => {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        addToast('info', 'Pin Removed', `Task #${taskId} was deleted`);
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
    addToast('success', 'Pin Saved! 📌', 'Your new task pin has been added to the board');
  }, [loadTasks, addToast]);

  const handleTaskUpdated = useCallback(() => {
    setEditTask(null);
    loadTasks();
    addToast('success', 'Pin Updated', 'Task pin details updated successfully');
  }, [loadTasks, addToast]);

  const handleEditTask = useCallback((task: TaskItem) => {
    setEditTask(task);
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f7f7f8',
        gap: 16,
      }}>
        <div style={{
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: 'var(--pinterest-red)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 8px 24px var(--pinterest-red-glow)',
        }}>
          <CheckSquare size={26} strokeWidth={2.5} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>TaskTracker</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Loading your pinboards...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="pinterest-app">
      {/* Pinterest Top Navigation Bar */}
      <Navbar
        currentPage={page}
        onPageChange={setPage}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCreateModal={() => setShowCreateModal(true)}
        isRealtimeConnected={isRealtimeConnected}
      />

      {/* Main Canvas */}
      <main style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
        {page === 'dashboard' && (
          <Dashboard
            tasks={tasks}
            searchQuery={searchQuery}
            onEditTask={handleEditTask}
            onStatusChange={async (id, status) => {
              try {
                await tasksApi.updateStatus(id, status);
                loadTasks();
                addToast('success', 'Status Updated', `Task moved to ${status}`);
              } catch (err: any) {
                addToast('error', 'Update Failed', err.message);
              }
            }}
            onNavigateToTasks={() => setPage('tasks')}
          />
        )}

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
                addToast('success', 'Pin Removed', 'Task pin has been deleted');
              } catch (err: any) {
                addToast('error', 'Delete Failed', err.message);
              }
            }}
            onStatusChange={async (id, status) => {
              try {
                await tasksApi.updateStatus(id, status);
                loadTasks();
                addToast('success', 'Status Updated', `Task moved to ${status}`);
              } catch (err: any) {
                addToast('error', 'Status Update Failed', err.message);
              }
            }}
            externalSearch={searchQuery}
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
            searchQuery={searchQuery}
          />
        )}

        {page === 'users' && <UsersPage />}
      </main>

      {/* Create Task Pin Modal */}
      {showCreateModal && (
        <TaskModal
          onClose={() => setShowCreateModal(false)}
          onSaved={handleTaskCreated}
        />
      )}

      {/* Edit Task Pin Modal */}
      {editTask && (
        <TaskModal
          task={editTask}
          onClose={() => setEditTask(null)}
          onSaved={handleTaskUpdated}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
