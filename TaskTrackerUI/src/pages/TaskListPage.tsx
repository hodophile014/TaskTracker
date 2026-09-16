import React, { useState } from 'react';
import { TaskItem, TaskStatus, TaskPriority } from '../types';
import { Search, RefreshCw, Pencil, Trash2 } from 'lucide-react';

interface TaskListPageProps {
  tasks: TaskItem[];
  loading: boolean;
  onRefresh: () => void;
  onEditTask: (task: TaskItem) => void;
  onDeleteTask: (id: number) => void;
  onStatusChange: (id: number, status: TaskStatus) => void;
}

const statuses: TaskStatus[] = ['To Do', 'In Progress', 'In Review', 'Done'];
const priorities: TaskPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

export const TaskListPage: React.FC<TaskListPageProps> = ({
  tasks,
  loading,
  onRefresh,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const filtered = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) &&
        !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    return true;
  });

  const selectStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 13,
    outline: 'none',
    backgroundColor: '#fff',
  };

  const getPriorityBadge = (priority: string) => {
    const cls = `badge-${priority.toLowerCase()}`;
    return (
      <span className={cls} style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600 }}>
        {priority}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOverdue = (task: TaskItem) => {
    return task.status !== 'Done' && task.dueDate && new Date(task.dueDate) < new Date();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>Task List</h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
            border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff',
            cursor: 'pointer', fontSize: 13, fontWeight: 500,
          }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 320 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: '#94a3b8' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            style={{
              ...selectStyle,
              width: '100%',
              paddingLeft: 36,
            }}
          />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={selectStyle}>
          <option value="">All Statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={selectStyle}>
          <option value="">All Priorities</option>
          {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{
        background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: 12 }}>Title</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: 12 }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: 12 }}>Priority</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: 12 }}>Assigned To</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: 12 }}>Due Date</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: 12 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                  {loading ? 'Loading tasks...' : 'No tasks found'}
                </td>
              </tr>
            ) : (
              filtered.map((task) => (
                <tr key={task.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{task.title}</div>
                    {task.description && (
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {task.description}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <select
                      value={task.status}
                      onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                      style={{
                        padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                        border: '1px solid #e2e8f0', cursor: 'pointer', outline: 'none',
                      }}
                    >
                      {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '12px 16px' }}>{getPriorityBadge(task.priority)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>
                    {task.assignedToName || '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: 13,
                      color: isOverdue(task) ? '#dc2626' : '#475569',
                      fontWeight: isOverdue(task) ? 600 : 400,
                    }}>
                      {formatDate(task.dueDate)}
                      {isOverdue(task) && ' (Overdue)'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => onEditTask(task)}
                        style={{
                          background: '#eef2ff', border: 'none', borderRadius: 6,
                          padding: '6px 8px', cursor: 'pointer', color: '#4f46e5',
                        }}
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete "${task.title}"?`)) {
                            onDeleteTask(task.id);
                          }
                        }}
                        style={{
                          background: '#fef2f2', border: 'none', borderRadius: 6,
                          padding: '6px 8px', cursor: 'pointer', color: '#dc2626',
                        }}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12, fontSize: 12, color: '#94a3b8' }}>
        Showing {filtered.length} of {tasks.length} tasks
      </div>
    </div>
  );
};

