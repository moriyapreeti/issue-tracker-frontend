import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../api/client';
import { Spinner } from '../components/Spinner';

export function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-full lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink-900 p-12 lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
            <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 6h14M5 12h9M5 18h12" /></svg>
          </span>
          <span className="font-display text-2xl font-bold text-white">Triage</span>
        </div>
        <div>
          <h2 className="max-w-md font-display text-4xl font-bold leading-tight text-white">Know what's blocked, who's on it, and what shipped.</h2>
          <div className="mt-10 grid max-w-md grid-cols-3 gap-3" aria-hidden="true">
            {[['bg-slate-400', [3, 2]], ['bg-brand-500', [2, 3]], ['bg-emerald-400', [4, 1]]].map(([c, bars], i) => (
              <div key={i} className="space-y-2 rounded-xl bg-ink-800 p-3">
                <div className={`h-1.5 w-8 rounded-full ${c}`} />
                {Array.from({ length: bars[0] }).map((_, j) => (
                  <div key={j} className="rounded-md bg-ink-700 p-2"><div className="h-1.5 rounded bg-ink-500/60" style={{ width: `${55 + ((i + j) * 17) % 40}%` }} /></div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm text-ink-300">Projects, tickets and boards for small engineering teams.</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-ink-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-6 text-sm text-ink-500">{footer}</p>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Sign in" subtitle="Use your work email to pick up where you left off."
      footer={<>New here? <Link className="font-semibold text-brand-700 hover:underline" to="/register">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" className="input" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" className="input" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy && <Spinner className="h-4 w-4 text-white" />} Sign in</button>
      </form>
      <div className="mt-6 rounded-lg bg-white p-3 text-xs text-ink-500 shadow-card">
        <p className="mb-1 font-semibold text-ink-700">Demo accounts</p>
        <button className="block hover:text-brand-700" onClick={() => setForm({ email: 'admin@tracker.com', password: 'Admin@123' })}>Admin · admin@tracker.com</button>
        <button className="block hover:text-brand-700" onClick={() => setForm({ email: 'manager@tracker.com', password: 'Manager@123' })}>Manager · manager@tracker.com</button>
        <button className="block hover:text-brand-700" onClick={() => setForm({ email: 'dev@tracker.com', password: 'Dev@1234' })}>Developer · dev@tracker.com</button>
      </div>
    </AuthShell>
  );
}
