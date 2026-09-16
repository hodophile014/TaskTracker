import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../services/api';
import { User, UserRole } from '../types';
import { ShieldAlert, RefreshCw } from 'lucide-react';

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
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadUsers();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 60, color: '#94a3b8',
      }}>
        <ShieldAlert size={48} />
        <h2 style={{ marginTop: 16, fontSize: 18, fontWeight: 700, color: '#475569' }}>Access Denied</h2>
        <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>
          Only administrators can manage users.
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>Team &amp; Users</h2>
        <button
          onClick={loadUsers}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
            border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff',
            cursor: 'pointer', fontSize: 13, fontWeight: 500,
          }}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
          borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      <div style={{
        background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: 12 }}>Username</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: 12 }}>Email</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: 12 }}>Role</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: 12 }}>Active</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: 12 }}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isSelf = currentUser?.id === u.id;
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', backgroundColor: '#e0e7ff',
                          color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 13,
                        }}>
                          {u.username?.slice(0, 2).toUpperCase() || '??'}
                        </div>
                        <span style={{ fontWeight: 600 }}>
                          {u.username}
                          {isSelf && <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 6 }}>(you)</span>}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        disabled={isSelf}
                        style={{
                          padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                          border: '1px solid #e2e8f0', cursor: isSelf ? 'not-allowed' : 'pointer',
                          outline: 'none', opacity: isSelf ? 0.6 : 1,
                        }}
                      >
                        {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        disabled={isSelf}
                        style={{
                          padding: '4px 14px', borderRadius: 9999, fontSize: 12, fontWeight: 600,
                          border: 'none', cursor: isSelf ? 'not-allowed' : 'pointer',
                          backgroundColor: u.isActive ? '#dcfce7' : '#fef2f2',
                          color: u.isActive ? '#16a34a' : '#dc2626',
                          opacity: isSelf ? 0.6 : 1,
                        }}
                      >
                        {u.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: 13 }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

