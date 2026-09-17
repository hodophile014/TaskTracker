import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../services/api';
import { User, UserRole } from '../types';
import { ShieldAlert, RefreshCw, Users, Mail, Calendar, Shield } from 'lucide-react';

const roles: UserRole[] = ['Member', 'Manager', 'Admin'];

export const UsersPage: React.FC = () => {
  const { isAdmin, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await usersApi.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadUsers();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="pinterest-empty-state" style={{ maxWidth: 500, margin: '80px auto' }}>
        <div className="pinterest-empty-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
          <ShieldAlert size={36} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)' }}>Access Restricted</h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>
          Only team administrators have permission to manage board collaborators and user roles.
        </p>
      </div>
    );
  }

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    try {
      await usersApi.updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (err: any) {
      alert(`Failed to update role: ${err.message}`);
    }
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      await usersApi.toggleUserStatus(userId);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u)));
    } catch (err: any) {
      alert(`Failed to toggle status: ${err.message}`);
    }
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return { bg: '#f3e8ff', color: '#7e22ce', border: '#e9d5ff' };
      case 'Manager':
        return { bg: '#e0e7ff', color: '#4338ca', border: '#c7d2fe' };
      default:
        return { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
    }
  };

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '16px 8px 48px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24,
      }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Team Collaborators 👥
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2, fontWeight: 500 }}>
            Manage board members, permissions, and active accounts
          </p>
        </div>

        <button
          onClick={loadUsers}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 18px',
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
          <span>Refresh Team</span>
        </button>
      </div>

      {error && (
        <div style={{
          background: '#ffebee',
          color: 'var(--pinterest-red)',
          padding: '12px 18px',
          borderRadius: 16,
          marginBottom: 20,
          fontWeight: 600,
          border: '1px solid #ffcdd2',
        }}>
          {error}
        </div>
      )}

      {/* Collaborator Grid (Pinterest Card style) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 20,
      }}>
        {users.map((u) => {
          const isSelf = currentUser?.id === u.id;
          const roleStyle = getRoleBadgeStyle(u.role);

          return (
            <div
              key={u.id}
              style={{
                background: '#ffffff',
                borderRadius: 24,
                padding: '24px 22px',
                boxShadow: 'var(--card-shadow)',
                border: '1px solid var(--border-light)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Member Info Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: 18,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}>
                  {u.username?.slice(0, 2).toUpperCase() || 'U'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <h3 style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {u.username}
                    </h3>
                    {isSelf && (
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        background: '#e0e7ff',
                        color: '#4338ca',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-pill)',
                      }}>
                        You
                      </span>
                    )}
                  </div>

                  <div style={{
                    fontSize: 13,
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    marginTop: 3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    <Mail size={12} />
                    <span>{u.email}</span>
                  </div>
                </div>
              </div>

              {/* Roles & Status Controls */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 14,
                borderTop: '1px solid var(--border-subtle)',
                gap: 10,
              }}>
                {/* Role Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Shield size={14} color="var(--text-muted)" />
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                    disabled={isSelf}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: 12,
                      fontWeight: 800,
                      border: `1.5px solid ${roleStyle.border}`,
                      background: roleStyle.bg,
                      color: roleStyle.color,
                      cursor: isSelf ? 'not-allowed' : 'pointer',
                      outline: 'none',
                    }}
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Status Toggle Button */}
                <button
                  onClick={() => handleToggleStatus(u.id)}
                  disabled={isSelf}
                  style={{
                    padding: '5px 14px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: 12,
                    fontWeight: 800,
                    border: 'none',
                    cursor: isSelf ? 'not-allowed' : 'pointer',
                    background: u.isActive ? '#dcfce7' : '#fee2e2',
                    color: u.isActive ? '#16a34a' : '#dc2626',
                    transition: 'all 0.15s ease',
                  }}
                  title={isSelf ? 'Cannot deactivate your own account' : 'Toggle active status'}
                >
                  {u.isActive ? '● Active' : '○ Suspended'}
                </button>
              </div>

              {/* Member Since */}
              <div style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontWeight: 600,
              }}>
                <Calendar size={12} />
                <span>Joined {new Date(u.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
