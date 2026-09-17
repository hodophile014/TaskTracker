import React from 'react';
import { TaskItem, TaskStatus } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Flame,
  ListTodo,
  Loader2,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface KanbanPageProps {
  tasks: TaskItem[];
  onStatusChange: (id: number, status: TaskStatus) => void;
  onEditTask: (task: TaskItem) => void;
  searchQuery?: string;
}

interface ColumnConfig {
  status: TaskStatus;
  label: string;
  icon: React.ReactNode;
  accentColor: string;
  bgColor: string;
}

const columns: ColumnConfig[] = [
  {
    status: 'To Do',
    label: 'To Do Pins',
    icon: <ListTodo size={18} />,
    accentColor: '#64748b',
    bgColor: '#f1f5f9',
  },
  {
    status: 'In Progress',
    label: 'In Progress',
    icon: <Loader2 size={18} />,
    accentColor: '#2563eb',
    bgColor: '#eff6ff',
  },
  {
    status: 'In Review',
    label: 'In Review',
    icon: <Clock size={18} />,
    accentColor: '#d97706',
    bgColor: '#fffbeb',
  },
  {
    status: 'Done',
    label: 'Completed',
    icon: <CheckCircle2 size={18} />,
    accentColor: '#16a34a',
    bgColor: '#f0fdf4',
  },
];

const statusOrder: TaskStatus[] = ['To Do', 'In Progress', 'In Review', 'Done'];

export const KanbanPage: React.FC<KanbanPageProps> = ({
  tasks,
  onStatusChange,
  onEditTask,
  searchQuery = '',
}) => {
  const filteredTasks = tasks.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.assignedToName?.toLowerCase().includes(q)
    );
  });

  const getPriorityBadge = (priority: string) => {
    const cls = `badge-pill badge-${priority.toLowerCase()}`;
    return (
      <span className={cls} style={{ fontSize: 10 }}>
        {priority === 'Urgent' && <Flame size={10} />}
        {priority}
      </span>
    );
  };

  const isOverdue = (task: TaskItem) => {
    return task.status !== 'Done' && task.dueDate && new Date(task.dueDate) < new Date();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const moveTask = (task: TaskItem, direction: 'left' | 'right', e: React.MouseEvent) => {
    e.stopPropagation();
    const idx = statusOrder.indexOf(task.status);
    if (direction === 'left' && idx > 0) {
      onStatusChange(task.id, statusOrder[idx - 1]);
    } else if (direction === 'right' && idx < statusOrder.length - 1) {
      onStatusChange(task.id, statusOrder[idx + 1]);
    }
  };

  const getCardAccentClass = (priority: string, status: string) => {
    if (status === 'Done') return 'pin-banner-done';
    switch (priority.toLowerCase()) {
      case 'urgent': return 'pin-banner-urgent';
      case 'high': return 'pin-banner-high';
      case 'low': return 'pin-banner-low';
      default: return 'pin-banner-medium';
    }
  };

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto', padding: '16px 8px 48px' }}>
      {/* Page Title */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          Kanban Task Boards 📋
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3, fontWeight: 500 }}>
          Organize your tasks visually. Move pins across workflow boards.
        </p>
      </div>

      {/* Board Columns */}
      <div className="pinterest-board-container">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.status);
          const colIdx = statusOrder.indexOf(col.status);

          return (
            <div
              key={col.status}
              className="pinterest-board-col"
              style={{ backgroundColor: col.bgColor }}
            >
              {/* Column Header */}
              <div className="board-col-header">
                <div className="board-col-title">
                  <span style={{ color: col.accentColor }}>{col.icon}</span>
                  <span>{col.label}</span>
                </div>
                <span className="board-col-badge">{colTasks.length}</span>
              </div>

              {/* Cards List */}
              <div className="board-col-cards">
                {colTasks.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '36px 16px',
                    borderRadius: 20,
                    border: '2px dashed rgba(0,0,0,0.1)',
                    color: 'var(--text-muted)',
                    fontSize: 13,
                    fontWeight: 600,
                  }}>
                    No pins here yet
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="board-card"
                      onClick={() => onEditTask(task)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Accent stripe */}
                      <div
                        className={getCardAccentClass(task.priority, task.status)}
                        style={{ height: 6, borderRadius: 9999, marginBottom: 12 }}
                      />

                      {/* Top Badges */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        {getPriorityBadge(task.priority)}
                        {isOverdue(task) && (
                          <span className="badge-pill badge-urgent" style={{ fontSize: 10 }}>
                            Overdue
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.3 }}>
                        {task.title}
                      </div>

                      {/* Description preview */}
                      {task.description && (
                        <div style={{
                          fontSize: 12,
                          color: 'var(--text-secondary)',
                          marginBottom: 12,
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          {task.description}
                        </div>
                      )}

                      {/* Footer */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: 10,
                        borderTop: '1px solid #f1f5f9',
                      }}>
                        {/* Assignee & Due Date */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div className="pin-author-avatar" style={{ width: 22, height: 22, fontSize: 10 }}>
                            {(task.assignedToName || 'U').slice(0, 2).toUpperCase()}
                          </div>
                          {task.dueDate && (
                            <span style={{ fontSize: 11, color: isOverdue(task) ? '#dc2626' : 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Calendar size={10} />
                              {formatDate(task.dueDate)}
                            </span>
                          )}
                        </div>

                        {/* Move Left / Right arrow buttons */}
                        <div style={{ display: 'flex', gap: 4 }}>
                          {colIdx > 0 && (
                            <button
                              onClick={(e) => moveTask(task, 'left', e)}
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: '50%',
                                border: '1px solid #e2e8f0',
                                background: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                              }}
                              title={`Move to ${statusOrder[colIdx - 1]}`}
                            >
                              <ChevronLeft size={14} />
                            </button>
                          )}
                          {colIdx < statusOrder.length - 1 && (
                            <button
                              onClick={(e) => moveTask(task, 'right', e)}
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: '50%',
                                border: '1px solid #e2e8f0',
                                background: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                              }}
                              title={`Move to ${statusOrder[colIdx + 1]}`}
                            >
                              <ChevronRight size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
