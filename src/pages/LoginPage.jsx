import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import avyonLogo from "../assets/avyonicon.png";

export default function LoginPage() {
  const { login, authError, firebaseUser, isAdmin, isLoading, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // ✅ Once Firebase confirms the user AND the admin claim check has
  // resolved, actually leave the login page.
  useEffect(() => {
    if (!isLoading && firebaseUser && isAdmin) {
      navigate('/', { replace: true });
    }
  }, [isLoading, firebaseUser, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await login(email, password);
    setSubmitting(false);
  };

  // ...rest unchanged

  // Logged in via Firebase, but the account has no admin claim. Distinct
  // screen, distinct message — this is not "wrong password," it's "this
  // login isn't authorized for this panel."
  if (!isLoading && firebaseUser && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
        <div className="w-full max-w-sm bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-[var(--color-danger-bg)] flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-[var(--color-danger)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-[var(--color-text)] mb-1">No admin access</h1>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            {firebaseUser.email} is signed in, but doesn't have admin permissions for this panel.
          </p>
          <button
            onClick={logout}
            className="w-full py-2.5 rounded-lg bg-[var(--color-navy-900)] text-white text-sm font-medium hover:bg-[var(--color-navy-800)] transition-colors"
          >
            Sign in with a different account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
        <div className="w-24 h-24 rounded-2xl bg-[var(--color-white-900)] flex items-center justify-center mx-auto mb-4">
  <img
    src={avyonLogo}
    alt="Avyon"
    className="w-30 h-30 object-contain"
  />
</div>
          <h1 className="text-xl font-semibold text-[var(--color-text)]">Avyon Admin</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Subscription & business management</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 space-y-4">
          {authError && (
            <div className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-bg)] rounded-lg px-3 py-2">
              {authError}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Email</label>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-sm focus:border-[var(--color-teal-500)] outline-none transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-sm focus:border-[var(--color-teal-500)] outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-[var(--color-navy-900)] text-white text-sm font-medium hover:bg-[var(--color-navy-800)] disabled:opacity-60 transition-colors"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-xs text-[var(--color-text-muted)] text-center mt-6">
          Admin access is granted via Firebase custom claims.<br />
          No self-service signup — contact the super admin if you need access.
        </p>
      </div>
    </div>
  );
}
