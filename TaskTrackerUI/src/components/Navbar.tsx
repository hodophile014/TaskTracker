import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, CheckSquare, LogOut, LayoutDashboard, ListTodo, Columns3, Users, Search, X } from 'lucide-react';

export type Page = 'dashboard' | 'tasks' | 'kanban' | 'users';

interface NavbarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCreateModal: () => void;
  isRealtimeConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onPageChange,
  searchQuery,
  onSearchChange,
  onOpenCreateModal,
  isRealtimeConnected,
}) => {
  const { user, logout, isAdmin } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const navItems: { key: Page; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
    { key: 'tasks', label: 'Task Pins', icon: <ListTodo size={17} /> },
    { key: 'kanban', label: 'Kanban Boards', icon: <Columns3 size={17} /> },
  ];

  if (isAdmin) {
    navItems.push({ key: 'users', label: 'Team & Users', icon: <Users size={17} /> });
  }

  return (
    <header className="pinterest-navbar">
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          className="pinterest-logo-btn"
          onClick={() => onPageChange('dashboard')}
          title="TaskTracker Home"
        >
          <div className="pinterest-logo-icon">
            <CheckSquare size={22} strokeWidth={2.5} />
          </div>
          <span className="pinterest-logo-text">TaskTracker</span>
        </button>

        {/* Navigation Tab Pills (Pinterest Style) */}
        <nav className="nav-pills">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onPageChange(item.key)}
              className={`nav-pill-btn ${currentPage === item.key ? 'active' : ''}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Central Pinterest Rounded Search Bar */}
      <div className="pinterest-search-container">
        <Search size={18} className="search-icon-left" />
        <input
          type="text"
          className="pinterest-search-input"
          placeholder="Search pins, tasks, tags, or assignees..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            className="search-clear-btn"
            onClick={() => onSearchChange('')}
            title="Clear search"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div className="nav-actions">
        {/* Real-time live status pill */}
        <div
          className="live-sync-pill"
          title={isRealtimeConnected ? 'SignalR Live Sync Active' : 'Connecting to Live Updates...'}
        >
          <span className="live-sync-dot" />
          <span>{isRealtimeConnected ? 'Live' : 'Connecting...'}</span>
        </div>

        {/* Create Task Button (Pinterest Red Pill) */}
        <button
          className="btn-create-pin"
          onClick={onOpenCreateModal}
          title="Create a new task pin"
        >
          <Plus size={18} strokeWidth={3} />
          <span>Create Pin</span>
        </button>

        {/* User Profile Pill */}
        <div className="user-profile-pill">
          <div className="avatar-circle">
            {getInitials(user?.username)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {user?.username}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
              {user?.role}
            </span>
          </div>

          <button
            onClick={logout}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 4,
              transition: 'all 0.15s ease',
            }}
            title="Sign out"
            onMouseOver={(e) => {
              e.currentTarget.style.color = 'var(--pinterest-red)';
              e.currentTarget.style.background = '#ffebee';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
