import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { CheckSquare, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await authApi.register({ firstName, lastName, email, password });
        setIsLogin(true);
        setPassword('');
        setSuccessMsg('Account created successfully! Please sign in with your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f7f7f8',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative Pinterest Floating Board Elements in Background */}
      <div style={{
        position: 'absolute',
        top: -60,
        left: -60,
        width: 320,
        height: 320,
        borderRadius: '50%',
        background: 'rgba(230, 0, 35, 0.05)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: -80,
        right: -80,
        width: 380,
        height: 380,
        borderRadius: '50%',
        background: 'rgba(99, 102, 241, 0.06)',
        pointerEvents: 'none',
      }} />

      {/* Main Pinterest Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: 36,
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
        padding: '48px 44px',
        width: '100%',
        maxWidth: 460,
        position: 'relative',
        zIndex: 10,
        border: '1px solid rgba(0,0,0,0.04)',
      }}>
        {/* Pinterest Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 54,
            height: 54,
            borderRadius: '50%',
            background: 'var(--pinterest-red)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: 14,
            boxShadow: '0 6px 18px var(--pinterest-red-glow)',
          }}>
            <CheckSquare size={28} strokeWidth={2.5} />
          </div>

          <h1 style={{
            fontSize: 26,
            fontWeight: 900,
            color: 'var(--text-primary)',
            letterSpacing: '-0.6px',
            margin: 0,
          }}>
            Welcome to TaskTracker 📌
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6, fontWeight: 500 }}>
            {isLogin
              ? 'Find and organize your team tasks on visual pinboards'
              : 'Join and create your collaborative workflow boards'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: '#ffebee',
            border: '1px solid #ffcdd2',
            color: 'var(--pinterest-red)',
            borderRadius: 16,
            padding: '12px 16px',
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 20,
          }}>
            {error}
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#059669',
            borderRadius: 16,
            padding: '12px 16px',
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
                  First Name
                </label>
                <input
                  className="pinterest-input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="John"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Last Name
                </label>
                <input
                  className="pinterest-input"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Doe"
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
              Email address
            </label>
            <input
              type="email"
              className="pinterest-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="pinterest-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 4,
                }}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-create-pin"
            style={{
              width: '100%',
              padding: '13px 0',
              justifyContent: 'center',
              fontSize: 15,
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Please wait...' : isLogin ? 'Log In' : 'Create Account'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Switch mode */}
        <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {isLogin ? 'Not on TaskTracker yet? ' : 'Already have an account? '}
          </span>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccessMsg('');
              setShowPassword(false);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--pinterest-red)',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
};
