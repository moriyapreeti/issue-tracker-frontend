import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../api/client';
import { Spinner } from '../components/Spinner';
import { AuthShell } from './Login';

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(form);
      navigate('/', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const bind = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

  return (
    <AuthShell title="Create your account" subtitle="You'll join as a developer. An admin can change your role later."
      footer={<>Already registered? <Link className="font-semibold text-brand-700 hover:underline" to="/login">Sign in</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <div><label className="label" htmlFor="name">Full name</label><input id="name" className="input" required maxLength={100} autoComplete="name" {...bind('name')} /></div>
        <div><label className="label" htmlFor="email">Email</label><input id="email" type="email" className="input" required autoComplete="email" {...bind('email')} /></div>
        <div><label className="label" htmlFor="password">Password</label><input id="password" type="password" className="input" required minLength={6} autoComplete="new-password" {...bind('password')} /><p className="mt-1 text-xs text-ink-500">At least 6 characters.</p></div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy && <Spinner className="h-4 w-4 text-white" />} Create account</button>
      </form>
    </AuthShell>
  );
}
