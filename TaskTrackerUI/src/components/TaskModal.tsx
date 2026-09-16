import React, { useEffect, useState } from 'react';
import { TaskItem, TaskPriority, TaskStatus, User } from '../types';
import { tasksApi, usersApi } from '../services/api';
import { X } from 'lucide-react';

interface TaskModalProps {
  task?: TaskItem | null;
  onClose: () => void;
  onSaved: () => void;
}

const priorities: TaskPriority[] = ['Low', 'Medium', 'High', 'Urgent'];
const statuses: TaskStatus[] = ['To Do', 'In Progress', 'In Review', 'Done'];

export const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onSaved }) => {
  const isEdit = Boolean(task);

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'Medium');
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'To Do');
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? task.dueDate.split('T')[0] : ''
  );
  const [assignedToUserId, setAssignedToUserId] = useState<number | undefined>(
    task?.assignedToUserId ?? undefined
  );

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    usersApi.getAllUsers()
      .then((data) => setUsers(data))
      .catch((err) => console.warn('Could not load users for assignment', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isEdit && task) {
        await tasksApi.updateTask(task.id, {
          title: title.trim(),
          description: description.trim(),
          priority,
          status,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          assignedToUserId: assignedToUserId || undefined,
        });
      } else {
        await tasksApi.createTask({
          title: title.trim(),
          description: description.trim(),
          priority,
          status,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          assignedToUserId: assignedToUserId || undefined,
        });
      }
      onSaved();
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: 6,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    marginTop: 4,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#334155',
    marginTop: 12,
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ padding: 24, maxWidth: 520 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
            {isEdit ? 'Edit Task' : 'Create New Task'}
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#b91c1c',
            padding: '8px 12px',
            borderRadius: 6,
            fontSize: 13,
            marginBottom: 12,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div>
            <label style={{ ...labelStyle, marginTop: 0 }}>Title *</label>
            <input
              type="text"
              style={inputStyle}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement user dashboard"
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about this task..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Priority</label>
              <select
                style={inputStyle}
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Status</label>
              <select
                style={inputStyle}
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Due Date</label>
              <input
                type="date"
                style={inputStyle}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Assignee</label>
              <select
                style={inputStyle}
                value={assignedToUserId || ''}
                onChange={(e) => setAssignedToUserId(e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">Unassigned (Defaults to you)</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '8px 20px',
                borderRadius: 6,
                border: 'none',
                background: '#4f46e5',
                color: '#ffffff',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 600,
              }}
            >
              {loading ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

