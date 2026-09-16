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
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="toast-item"
          style={{
            background: '#ffffff',
            borderRadius: 10,
            padding: '12px 16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            minWidth: 320,
            maxWidth: 420,
          }}
        >
          {toast.type === 'success' && <CheckCircle2 size={20} color="#16a34a" style={{ marginTop: 2, flexShrink: 0 }} />}
          {toast.type === 'error' && <AlertCircle size={20} color="#dc2626" style={{ marginTop: 2, flexShrink: 0 }} />}
          {toast.type === 'info' && <Info size={20} color="#2563eb" style={{ marginTop: 2, flexShrink: 0 }} />}

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{toast.title}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{toast.message}</div>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: 2,
            }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

