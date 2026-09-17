import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 300,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="toast-item"
          style={{
            background: '#ffffff',
            borderRadius: 20,
            padding: '14px 18px',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            minWidth: 320,
            maxWidth: 420,
          }}
        >
          {toast.type === 'success' && (
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: '#059669',
            }}>
              <CheckCircle2 size={18} strokeWidth={2.5} />
            </div>
          )}
          {toast.type === 'error' && (
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#ffebee',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: 'var(--pinterest-red)',
            }}>
              <AlertCircle size={18} strokeWidth={2.5} />
            </div>
          )}
          {toast.type === 'info' && (
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: '#2563eb',
            }}>
              <Info size={18} strokeWidth={2.5} />
            </div>
          )}

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>{toast.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>{toast.message}</div>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            style={{
              background: '#f0f0f0',
              border: 'none',
              borderRadius: '50%',
              width: 26,
              height: 26,
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            title="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
