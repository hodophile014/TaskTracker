import React from 'react';
import { TaskItem, TaskStatus } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface KanbanPageProps {
  tasks: TaskItem[];
  onStatusChange: (id: number, status: TaskStatus) => void;
  onEditTask: (task: TaskItem) => void;
}

const columns: { status: TaskStatus; label: string; color: string; bgColor: string }[] = [
  { status: 'To Do', label: 'To Do', color: '#475569', bgColor: '#f1f5f9' },
  { status: 'In Progress', label: 'In Progress', color: '#2563eb', bgColor: '#eff6ff' },
  { status: 'In Review', label: 'In Review', color: '#b45309', bgColor: '#fffbeb' },
  { status: 'Done', label: 'Done', color: '#16a34a', bgColor: '#f0fdf4' },
];

const statusOrder: TaskStatus[] = ['To Do', 'In Progress', 'In Review', 'Done'];

export const KanbanPage: React.FC<KanbanPageProps> = ({ tasks, onStatusChange, onEditTask }) => {
  const getPriorityBadge = (priority: string) => {
    const cls = `badge-${priority.toLowerCase()}`;
    return (
      <span className={cls} style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600 }}>
        {priority}
      </span>
    );
  };

  const isOverdue = (task: TaskItem) => {
    return task.status !== 'Done' && task.dueDate && new Date(task.dueDate) < new Date();
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const moveTask = (task: TaskItem, direction: 'left' | 'right') => {
    const idx = statusOrder.indexOf(task.status);
    if (direction === 'left' && idx > 0) {
      onStatusChange(task.id, statusOrder[idx - 1]);
    } else if (direction === 'right' && idx < statusOrder.length - 1) {
      onStatusChange(task.id, statusOrder[idx + 1]);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#0f172a' }}>Kanban Board</h2>

      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16 }}>
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.status);
          const colIdx = statusOrder.indexOf(col.status);

          return (
            <div key={col.status} className="kanban-col" style={{ backgroundColor: col.bgColor }}>
              {/* Column Header */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 14, paddingBottom: 10, borderBottom: `2px solid ${col.color}20`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%', backgroundColor: col.color,
                  }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: col.color }}>{col.label}</span>
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 600, color: '#64748b',
                  backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: 9999,
                }}>
                  {colTasks.length}
                </span>
              </div>

              {/* Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                {colTasks.length === 0 ? (
                  <div style={{
                    textAlign: 'center', padding: 20, fontSize: 13, color: '#94a3b8',
                    border: '2px dashed #e2e8f0', borderRadius: 10,
                  }}>
                    No tasks
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div key={task.id} className="kanban-card">
                      {/* Title */}
                      <div
                        onClick={() => onEditTask(task)}
                        style={{
                          fontSize: 14, fontWeight: 600, color: '#0f172a', cursor: 'pointer',
                          marginBottom: 8,
                        }}
                      >
                        {task.title}
                      </div>

                      {/* Description snippet */}
                      {task.description && (
                        <div style={{
                          fontSize: 12, color: '#64748b', marginBottom: 8,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {task.description}
                        </div>
                      )}

                      {/* Badges row */}
                      <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                        {getPriorityBadge(task.priority)}
                        {isOverdue(task) && (
                          <span style={{
                            padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
                            backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
                          }}>
                            Overdue
                          </span>
                        )}
                      </div>

                      {/* Footer */}
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        paddingTop: 8, borderTop: '1px solid #f1f5f9',
                      }}>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>
                          {task.assignedToName || task.creatorName}
                          {task.dueDate && ` • ${formatDate(task.dueDate)}`}
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {colIdx > 0 && (
                            <button
                              onClick={() => moveTask(task, 'left')}
                              style={{
                                background: '#f1f5f9', border: 'none', borderRadius: 4,
                                padding: '3px 5px', cursor: 'pointer', color: '#64748b',
                              }}
                              title={`Move to ${statusOrder[colIdx - 1]}`}
                            >
                              <ChevronLeft size={14} />
                            </button>
                          )}
                          {colIdx < statusOrder.length - 1 && (
                            <button
                              onClick={() => moveTask(task, 'right')}
                              style={{
                                background: '#f1f5f9', border: 'none', borderRadius: 4,
                                padding: '3px 5px', cursor: 'pointer', color: '#64748b',
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

