import React from 'react';
import { TaskItem } from '../types';
import { ClipboardList, Clock, CheckCircle2, AlertTriangle, ListTodo, Loader } from 'lucide-react';

interface DashboardProps {
  tasks: TaskItem[];
}

export const Dashboard: React.FC<DashboardProps> = ({ tasks }) => {
  const now = new Date();

  const todoCount = tasks.filter((t) => t.status === 'To Do').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const inReviewCount = tasks.filter((t) => t.status === 'In Review').length;
  const doneCount = tasks.filter((t) => t.status === 'Done').length;
  const overdueCount = tasks.filter(
    (t) => t.status !== 'Done' && t.dueDate && new Date(t.dueDate) < now
  ).length;
  const completionRate = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    .slice(0, 5);

  const upcomingTasks = tasks
    .filter((t) => t.status !== 'Done' && t.dueDate && new Date(t.dueDate) >= now)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const cardStyle: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: 12,
    padding: '20px 24px',
    border: '1px solid #e2e8f0',
    flex: 1,
    minWidth: 150,
  };

  const getPriorityBadge = (priority: string) => {
    const cls = `badge-${priority.toLowerCase()}`;
    return (
      <span className={cls} style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600 }}>
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
      <span className={map[status] || ''} style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600 }}>
        {status}
      </span>
    );
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#0f172a' }}>Dashboard</h2>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <ClipboardList size={20} color="#4f46e5" />
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Total Tasks</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{tasks.length}</div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <ListTodo size={20} color="#475569" />
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>To Do</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#475569' }}>{todoCount}</div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Loader size={20} color="#2563eb" />
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>In Progress</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#2563eb' }}>{inProgressCount}</div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Clock size={20} color="#b45309" />
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>In Review</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#b45309' }}>{inReviewCount}</div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <CheckCircle2 size={20} color="#16a34a" />
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Done</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#16a34a' }}>{doneCount}</div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <AlertTriangle size={20} color="#dc2626" />
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Overdue</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#dc2626' }}>{overdueCount}</div>
        </div>
      </div>

      {/* Completion Rate */}
      <div style={{ ...cardStyle, marginBottom: 28, maxWidth: 320 }}>
        <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginBottom: 8 }}>Completion Rate</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: '#4f46e5' }}>{completionRate}%</div>
        <div style={{
          height: 8, backgroundColor: '#e2e8f0', borderRadius: 9999, marginTop: 10, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${completionRate}%`, backgroundColor: '#4f46e5',
            borderRadius: 9999, transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Two-column layout for lists */}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Recent Tasks */}
        <div style={{ ...cardStyle, minWidth: 300 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: '#0f172a' }}>Recent Tasks</h3>
          {recentTasks.length === 0 ? (
            <div style={{ fontSize: 13, color: '#94a3b8' }}>No tasks yet</div>
          ) : (
            recentTasks.map((task) => (
              <div key={task.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0', borderBottom: '1px solid #f1f5f9',
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{task.title}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                    {task.assignedToName || task.creatorName} • {new Date(task.createdDate).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {getStatusBadge(task.status)}
                  {getPriorityBadge(task.priority)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div style={{ ...cardStyle, minWidth: 300 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: '#0f172a' }}>Upcoming Deadlines</h3>
          {upcomingTasks.length === 0 ? (
            <div style={{ fontSize: 13, color: '#94a3b8' }}>No upcoming deadlines</div>
          ) : (
            upcomingTasks.map((task) => {
              const dueDate = new Date(task.dueDate);
              const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              const urgencyColor = diffDays <= 1 ? '#dc2626' : diffDays <= 3 ? '#d97706' : '#64748b';

              return (
                <div key={task.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: '1px solid #f1f5f9',
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{task.title}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                      {task.assignedToName || 'Unassigned'}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: urgencyColor }}>
                    {diffDays === 0 ? 'Due Today' : diffDays === 1 ? 'Due Tomorrow' : `${diffDays} days`}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

