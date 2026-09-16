import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, CheckSquare, LogOut, Radio } from 'lucide-react';

interface NavbarProps {
  onOpenCreateModal: () => void;
  isRealtimeConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCreateModal, isRealtimeConnected }) => {
  const { user, logout } = useAuth();

  const getRoleBadgeClass = (role?: string) => {
    switch (role) {
      case 'Admin': return 'role-admin';
      case 'Manager': return 'role-manager';
      default: return 'role-member';
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header
      style={{
        height: 68,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 10px rgba(79, 70, 229, 0.25)',
          }}
        >
          <CheckSquare size={22} />
        </div>
        <div>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>
            TaskTracker
          </span>
          <span style={{ fontSize: 12, color: '#64748b', marginLeft: 8, fontWeight: 500 }}>
            Web API &bull; Brevo &bull; React
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Real-time sync status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 12px',
            borderRadius: 9999,
            fontSize: 12,
            fontWeight: 600,
            backgroundColor: isRealtimeConnected ? '#ecfdf5' : '#fffbeb',
            color: isRealtimeConnected ? '#059669' : '#d97706',
            border: `1px solid ${isRealtimeConnected ? '#a7f3d0' : '#fde68a'}`,
          }}
          title={isRealtimeConnected ? 'SignalR live connection active' : 'Connecting to live updates'}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: isRealtimeConnected ? '#10b981' : '#f59e0b',
              boxShadow: isRealtimeConnected ? '0 0 8px #10b981' : 'none',
            }}
          />
          <Radio size={13} />
          {isRealtimeConnected ? 'Live Sync' : 'Reconnecting...'}
        </div>

        {/* New Task Button */}
        <button
          onClick={onOpenCreateModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 18px',
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#4338ca')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#4f46e5')}
        >
          <Plus size={18} />
          New Task
        </button>

        {/* User Profile Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderLeft: '1px solid #e2e8f0', paddingLeft: 16 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: '#e0e7ff',
              color: '#4338ca',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {getInitials(user?.username)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{user?.username}</span>
              <span
                className={getRoleBadgeClass(user?.role)}
                style={{
                  padding: '1px 8px',
                  borderRadius: 9999,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {user?.role}
              </span>
            </div>
            <span style={{ fontSize: 12, color: '#64748b' }}>{user?.email}</span>
          </div>

          <button
            onClick={logout}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: 8,
              borderRadius: 6,
              marginLeft: 4,
            }}
            title="Sign out"
            onMouseOver={(e) => (e.currentTarget.style.color = '#dc2626')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#64748b')}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

