import React, { useState } from 'react';
import { TaskItem, TaskStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Calendar,
  Pencil,
  Check,
  TrendingUp,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface DashboardProps {
  tasks: TaskItem[];
  searchQuery?: string;
  onEditTask?: (task: TaskItem) => void;
  onStatusChange?: (id: number, status: TaskStatus) => void;
  onNavigateToTasks?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  tasks,
  searchQuery = '',
  onEditTask,
  onStatusChange,
  onNavigateToTasks,
}) => {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'todo' | 'inprogress' | 'inreview' | 'done' | 'overdue'>('all');

  const now = new Date();

  const todoCount = tasks.filter((t) => t.status === 'To Do').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const inReviewCount = tasks.filter((t) => t.status === 'In Review').length;
  const doneCount = tasks.filter((t) => t.status === 'Done').length;
  const overdueCount = tasks.filter(
    (t) => t.status !== 'Done' && t.dueDate && new Date(t.dueDate) < now
  ).length;
  const completionRate = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchAssignee = task.assignedToName?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchAssignee) return false;
    }

    // Category filter
    if (selectedFilter === 'todo') return task.status === 'To Do';
    if (selectedFilter === 'inprogress') return task.status === 'In Progress';
    if (selectedFilter === 'inreview') return task.status === 'In Review';
    if (selectedFilter === 'done') return task.status === 'Done';
    if (selectedFilter === 'overdue') {
      return task.status !== 'Done' && task.dueDate && new Date(task.dueDate) < now;
    }
    return true;
  });

  const getPriorityBannerClass = (priority: string, status: string) => {
    if (status === 'Done') return 'pin-banner-done';
    switch (priority.toLowerCase()) {
      case 'urgent': return 'pin-banner-urgent';
      case 'high': return 'pin-banner-high';
      case 'low': return 'pin-banner-low';
      default: return 'pin-banner-medium';
    }
  };

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
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (task: TaskItem) => {
    return task.status !== 'Done' && task.dueDate && new Date(task.dueDate) < now;
  };

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '16px 8px 48px' }}>
      {/* Friendly Pinterest Greeting Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24,
      }}>
        <div>
          <h1 style={{
            fontSize: 28,
            fontWeight: 900,
            color: 'var(--text-primary)',
            letterSpacing: '-0.7px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span>Hi, {user?.username || 'there'}!</span>
            <span style={{ fontSize: 24 }}>📌</span>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 500 }}>
            Here is your creative task pinboard for today. You have {todoCount + inProgressCount} active tasks.
          </p>
        </div>

        {/* Completion Progress Tile */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          background: '#ffffff',
          padding: '12px 20px',
          borderRadius: 'var(--radius-pill)',
          boxShadow: 'var(--card-shadow)',
          border: '1px solid rgba(0,0,0,0.05)',
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'var(--pinterest-red-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--pinterest-red)',
          }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Completion Rate
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)' }}>
              {completionRate}% Completed
            </div>
          </div>
          <div style={{ width: 80, height: 8, background: '#e9e9e9', borderRadius: 9999, overflow: 'hidden' }}>
            <div style={{
              width: `${completionRate}%`,
              height: '100%',
              background: 'var(--pinterest-red)',
              borderRadius: 9999,
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
      </div>

      {/* Pinterest Board Stat Tiles */}
      <div className="pinterest-stat-grid">
        <div className="stat-tile">
          <div className="stat-tile-top">
            <div className="stat-tile-icon" style={{ background: '#eef2ff', color: '#6366f1' }}>
              <ClipboardList size={22} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', background: '#eef2ff', padding: '3px 8px', borderRadius: 9999 }}>
              Total Pins
            </span>
          </div>
          <div className="stat-tile-num">{tasks.length}</div>
          <div className="stat-tile-label">All Tracked Tasks</div>
        </div>

        <div className="stat-tile">
          <div className="stat-tile-top">
            <div className="stat-tile-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Clock size={22} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '3px 8px', borderRadius: 9999 }}>
              In Motion
            </span>
          </div>
          <div className="stat-tile-num">{inProgressCount}</div>
          <div className="stat-tile-label">In Progress</div>
        </div>

        <div className="stat-tile">
          <div className="stat-tile-top">
            <div className="stat-tile-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Sparkles size={22} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#d97706', background: '#fef3c7', padding: '3px 8px', borderRadius: 9999 }}>
              Review
            </span>
          </div>
          <div className="stat-tile-num">{inReviewCount}</div>
          <div className="stat-tile-label">In Review</div>
        </div>

        <div className="stat-tile">
          <div className="stat-tile-top">
            <div className="stat-tile-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
              <CheckCircle2 size={22} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '3px 8px', borderRadius: 9999 }}>
              Finished
            </span>
          </div>
          <div className="stat-tile-num">{doneCount}</div>
          <div className="stat-tile-label">Completed</div>
        </div>

        <div className="stat-tile">
          <div className="stat-tile-top">
            <div className="stat-tile-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
              <AlertTriangle size={22} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', background: '#fee2e2', padding: '3px 8px', borderRadius: 9999 }}>
              Action
            </span>
          </div>
          <div className="stat-tile-num">{overdueCount}</div>
          <div className="stat-tile-label">Overdue Tasks</div>
        </div>
      </div>

      {/* Pinterest Filter Pills Bar */}
      <div className="category-pills-bar">
        <button
          className={`category-chip ${selectedFilter === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('all')}
        >
          <span>All Pins</span>
          <span className="category-chip-count">{tasks.length}</span>
        </button>

        <button
          className={`category-chip ${selectedFilter === 'todo' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('todo')}
        >
          <span>📌 To Do</span>
          <span className="category-chip-count">{todoCount}</span>
        </button>

        <button
          className={`category-chip ${selectedFilter === 'inprogress' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('inprogress')}
        >
          <span>⚡ In Progress</span>
          <span className="category-chip-count">{inProgressCount}</span>
        </button>

        <button
          className={`category-chip ${selectedFilter === 'inreview' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('inreview')}
        >
          <span>🔍 In Review</span>
          <span className="category-chip-count">{inReviewCount}</span>
        </button>

        <button
          className={`category-chip ${selectedFilter === 'done' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('done')}
        >
          <span>✅ Done</span>
          <span className="category-chip-count">{doneCount}</span>
        </button>

        <button
          className={`category-chip ${selectedFilter === 'overdue' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('overdue')}
        >
          <span>⚠️ Overdue</span>
          <span className="category-chip-count">{overdueCount}</span>
        </button>
      </div>

      {/* Masonry Pins Board */}
      {filteredTasks.length === 0 ? (
        <div className="pinterest-empty-state">
          <div className="pinterest-empty-icon">
            <ClipboardList size={34} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
            No pins found in this view
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 360, marginTop: 6 }}>
            {searchQuery
              ? `No tasks match "${searchQuery}". Try searching with different keywords.`
              : 'Create a new task pin to start organizing your workflow!'}
          </p>
        </div>
      ) : (
        <div className="pins-masonry-grid">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="pin-card"
              onClick={() => onEditTask?.(task)}
            >
              {/* Colorful Priority Banner */}
              <div className={`pin-banner ${getPriorityBannerClass(task.priority, task.status)}`} />

              {/* Hover Quick Action Buttons */}
              <div
                className="pin-actions-overlay"
                onClick={(e) => e.stopPropagation()}
              >
                {task.status !== 'Done' && onStatusChange && (
                  <button
                    className="pin-btn-save"
                    onClick={() => onStatusChange(task.id, 'Done')}
                    title="Mark task as Done"
                  >
                    <Check size={14} strokeWidth={3} />
                    <span>Done</span>
                  </button>
                )}

                {onEditTask && (
                  <button
                    className="pin-btn-action"
                    onClick={() => onEditTask(task)}
                    title="Edit Task"
                  >
                    <Pencil size={14} />
                  </button>
                )}
              </div>

              {/* Pin Card Content */}
              <div className="pin-body">
                {/* Tags Row */}
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

                {/* Title */}
                <h3 className="pin-title">{task.title}</h3>

                {/* Description */}
                {task.description && (
                  <p className="pin-description">{task.description}</p>
                )}

                {/* Footer with Assignee & Due Date */}
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
      )}
    </div>
  );
};
