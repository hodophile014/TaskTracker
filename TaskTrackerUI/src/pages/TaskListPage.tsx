import React, { useState } from 'react';
import { TaskItem, TaskStatus, TaskPriority } from '../types';
import {
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  LayoutGrid,
  List,
  Calendar,
  Flame,
  Check,
  Filter
} from 'lucide-react';

interface TaskListPageProps {
  tasks: TaskItem[];
  loading: boolean;
  onRefresh: () => void;
  onEditTask: (task: TaskItem) => void;
  onDeleteTask: (id: number) => void;
  onStatusChange: (id: number, status: TaskStatus) => void;
  externalSearch?: string;
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
  externalSearch = '',
}) => {
  const [internalSearch, setInternalSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const search = externalSearch || internalSearch;

  const filtered = tasks.filter((t) => {
    if (search) {
      const q = search.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchAssignee = t.assignedToName?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchAssignee) return false;
    }
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    return true;
  });

  const getPriorityBadge = (priority: string) => {
    const cls = `badge-pill badge-${priority.toLowerCase()}`;
    return (
      <span className={cls}>
        {priority === 'Urgent' && <Flame size={12} />}
        {priority}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      'To Do': 'status-todo',
      'In Progress': 'status-inprogress',
      'In Review': 'status-inreview',
      'Done': 'status-done',
    };
    return (
      <span className={`badge-pill ${map[status] || 'status-todo'}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (task: TaskItem) => {
    return task.status !== 'Done' && task.dueDate && new Date(task.dueDate) < new Date();
  };

  const getPriorityBannerClass = (priority: string, status: string) => {
    if (status === 'Done') return 'pin-banner-done';
    switch (priority.toLowerCase()) {
      case 'urgent': return 'pin-banner-urgent';
      case 'high': return 'pin-banner-high';
      case 'low': return 'pin-banner-low';
      default: return 'pin-banner-medium';
    }
  };

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '16px 8px 48px' }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 20,
      }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Explore Task Pins 📌
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2, fontWeight: 500 }}>
            {filtered.length} tasks matching your board filters
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* View toggle (Grid / Table) */}
          <div style={{
            display: 'flex',
            background: '#ffffff',
            borderRadius: 'var(--radius-pill)',
            padding: 4,
            border: '1px solid var(--border-light)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 700,
                background: viewMode === 'grid' ? 'var(--text-primary)' : 'transparent',
                color: viewMode === 'grid' ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              <LayoutGrid size={15} />
              <span>Pins</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 700,
                background: viewMode === 'table' ? 'var(--text-primary)' : 'transparent',
                color: viewMode === 'table' ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              <List size={15} />
              <span>List</span>
            </button>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-light)',
              background: '#ffffff',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--text-primary)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter pills bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
        marginBottom: 24,
        background: '#ffffff',
        padding: '12px 18px',
        borderRadius: 20,
        boxShadow: 'var(--card-shadow)',
        border: '1px solid var(--border-light)',
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: 12, color: 'var(--text-muted)' }} />
          <input
            value={internalSearch}
            onChange={(e) => setInternalSearch(e.target.value)}
            placeholder="Filter tasks by name or detail..."
            style={{
              width: '100%',
              height: 40,
              padding: '0 16px 0 40px',
              borderRadius: 'var(--radius-pill)',
              border: '1.5px solid var(--border-light)',
              background: '#f8f8f8',
              fontSize: 14,
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
        </div>

        {/* Status Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={14} color="var(--text-muted)" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-pill)',
              border: '1.5px solid var(--border-light)',
              background: '#f8f8f8',
              fontSize: 13,
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <option value="">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Priority Dropdown */}
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-pill)',
            border: '1.5px solid var(--border-light)',
            background: '#f8f8f8',
            fontSize: 13,
            fontWeight: 600,
            outline: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <option value="">All Priorities</option>
          {priorities.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Grid Mode (Pinterest Masonry Pins) */}
      {viewMode === 'grid' && (
        filtered.length === 0 ? (
          <div className="pinterest-empty-state">
            <div className="pinterest-empty-icon">
              <Search size={34} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800 }}>No task pins matched</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
              Try adjusting your search query or reset your status/priority filters.
            </p>
          </div>
        ) : (
          <div className="pins-masonry-grid">
            {filtered.map((task) => (
              <div
                key={task.id}
                className="pin-card"
                onClick={() => onEditTask(task)}
              >
                {/* Colorful Banner */}
                <div className={`pin-banner ${getPriorityBannerClass(task.priority, task.status)}`} />

                {/* Hover Quick Action Buttons */}
                <div
                  className="pin-actions-overlay"
                  onClick={(e) => e.stopPropagation()}
                >
                  {task.status !== 'Done' && (
                    <button
                      className="pin-btn-save"
                      onClick={() => onStatusChange(task.id, 'Done')}
                      title="Mark as Done"
                    >
                      <Check size={14} strokeWidth={3} />
                      <span>Done</span>
                    </button>
                  )}
                  <button
                    className="pin-btn-action"
                    onClick={() => onEditTask(task)}
                    title="Edit Task"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="pin-btn-action"
                    onClick={() => {
                      if (window.confirm(`Delete "${task.title}"?`)) {
                        onDeleteTask(task.id);
                      }
                    }}
                    title="Delete Task"
                    style={{ color: '#dc2626' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="pin-body">
                  <div className="pin-header-tags">
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {getPriorityBadge(task.priority)}
                      {getStatusBadge(task.status)}
                    </div>
                    {isOverdue(task) && (
                      <span className="badge-pill badge-urgent" style={{ fontSize: 10 }}>
                        Overdue
                      </span>
                    )}
                  </div>

                  <h3 className="pin-title">{task.title}</h3>

                  {task.description && (
                    <p className="pin-description">{task.description}</p>
                  )}

                  <div className="pin-footer">
                    <div className="pin-author">
                      <div className="pin-author-avatar">
                        {(task.assignedToName || task.creatorName || 'U').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="pin-author-name">
                        {task.assignedToName || task.creatorName || 'Unassigned'}
                      </span>
                    </div>

                    {task.dueDate && (
                      <div className={`pin-due-date ${isOverdue(task) ? 'overdue' : ''}`}>
                        <Calendar size={12} />
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Table Mode (Pinterest-styled Clean Table) */}
      {viewMode === 'table' && (
        <div style={{
          background: '#ffffff',
          borderRadius: 24,
          boxShadow: 'var(--card-shadow)',
          border: '1px solid var(--border-light)',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8f8f8', borderBottom: '1px solid var(--border-light)' }}>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 800, color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Task Title</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 800, color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Status</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 800, color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Priority</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 800, color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Assignee</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 800, color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Due Date</th>
                <th style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 800, color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                    {loading ? 'Loading tasks...' : 'No task pins found'}
                  </td>
                </tr>
              ) : (
                filtered.map((task) => (
                  <tr
                    key={task.id}
                    style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s ease' }}
                    onMouseOver={(e) => (e.currentTarget.style.background = '#fafafa')}
                    onMouseOut={(e) => (e.currentTarget.style.background = '#ffffff')}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 }}>{task.title}</div>
                      {task.description && (
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3, maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {task.description}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <select
                        value={task.status}
                        onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-pill)',
                          fontSize: 12,
                          fontWeight: 700,
                          border: '1.5px solid var(--border-light)',
                          background: '#f8f8f8',
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      >
                        {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '16px 20px' }}>{getPriorityBadge(task.priority)}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="pin-author-avatar">
                          {(task.assignedToName || 'U').slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {task.assignedToName || 'Unassigned'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        fontSize: 13,
                        color: isOverdue(task) ? '#dc2626' : 'var(--text-secondary)',
                        fontWeight: isOverdue(task) ? 800 : 500,
                      }}>
                        {formatDate(task.dueDate)}
                        {isOverdue(task) && ' (Overdue)'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => onEditTask(task)}
                          style={{
                            background: '#f0f0f0',
                            border: 'none',
                            borderRadius: '50%',
                            width: 34,
                            height: 34,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--text-primary)',
                          }}
                          title="Edit Task"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete "${task.title}"?`)) {
                              onDeleteTask(task.id);
                            }
                          }}
                          style={{
                            background: '#ffebee',
                            border: 'none',
                            borderRadius: '50%',
                            width: 34,
                            height: 34,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--pinterest-red)',
                          }}
                          title="Delete Task"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
