import React, { useEffect, useState } from 'react';
import { TaskItem, TaskPriority, TaskStatus, User } from '../types';
import { tasksApi, usersApi } from '../services/api';
import { X, Calendar, User as UserIcon, Flame, Check } from 'lucide-react';

interface TaskModalProps {
  task?: TaskItem | null;
  onClose: () => void;
  onSaved: () => void;
}

const priorities: { value: TaskPriority; label: string; color: string; bg: string }[] = [
  { value: 'Low', label: 'Low', color: '#0284c7', bg: '#e0f2fe' },
  { value: 'Medium', label: 'Medium', color: '#ca8a04', bg: '#fef9c3' },
  { value: 'High', label: 'High', color: '#ea580c', bg: '#ffedd5' },
  { value: 'Urgent', label: 'Urgent', color: '#e11d48', bg: '#ffe4e6' },
];

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
      setError('Please give your task pin a title');
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-pin-creator"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 28px 18px',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              {isEdit ? 'Edit Task Pin 📌' : 'Create Task Pin 📌'}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
              {isEdit ? 'Update task details, assignment, or deadlines' : 'Pin a new task to your board'}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: '#f0f0f0',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              transition: 'background 0.15s ease',
            }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{
            margin: '16px 28px 0',
            background: '#ffebee',
            color: 'var(--pinterest-red)',
            padding: '10px 16px',
            borderRadius: 14,
            fontSize: 13,
            fontWeight: 600,
            border: '1px solid #ffcdd2',
          }}>
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px 28px 28px' }}>
          {/* Title input */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
              Title *
            </label>
            <input
              type="text"
              className="pinterest-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a title to your pin..."
              required
              autoFocus
            />
          </div>

          {/* Description input */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
              Description
            </label>
            <textarea
              className="pinterest-input"
              style={{ minHeight: 90, resize: 'vertical' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this task about? Add key details, links, or notes..."
            />
          </div>

          {/* Priority Pill Selector */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
              Priority
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {priorities.map((p) => {
                const isSelected = priority === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-pill)',
                      border: isSelected ? `2px solid ${p.color}` : '2px solid transparent',
                      background: p.bg,
                      color: p.color,
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      boxShadow: isSelected ? `0 2px 8px ${p.color}40` : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {p.value === 'Urgent' && <Flame size={14} />}
                    {isSelected && <Check size={14} strokeWidth={3} />}
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Pill Selector */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
              Workflow Status
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {statuses.map((s) => {
                const isSelected = status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    style={{
                      padding: '7px 16px',
                      borderRadius: 'var(--radius-pill)',
                      border: isSelected ? '2px solid var(--text-primary)' : '2px solid var(--border-light)',
                      background: isSelected ? 'var(--text-primary)' : '#ffffff',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due Date & Assignee Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
                <Calendar size={14} />
                <span>Due Date</span>
              </label>
              <input
                type="date"
                className="pinterest-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
                <UserIcon size={14} />
                <span>Assignee</span>
              </label>
              <select
                className="pinterest-input"
                value={assignedToUserId || ''}
                onChange={(e) => setAssignedToUserId(e.target.value ? Number(e.target.value) : undefined)}
                style={{ cursor: 'pointer' }}
              >
                <option value="">Unassigned (You)</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 22px',
                borderRadius: 'var(--radius-pill)',
                border: '1.5px solid var(--border-light)',
                background: '#ffffff',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="btn-create-pin"
              style={{
                fontSize: 14,
                padding: '10px 26px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Saving...' : isEdit ? 'Update Pin' : 'Save Pin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
