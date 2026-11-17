import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Badges';

const icon = {
  dashboard: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
  projects: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  tickets: 'M4 6h16M4 12h16M4 18h10',
  users: 'M16 11a4 4 0 1 0-8 0M4 21a8 8 0 0 1 16 0',
};

function NavItem({ to, label, d, end, onClick }) {
  return (
    <NavLink to={to} end={end} onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${isActive ? 'bg-brand-600 text-white' : 'text-ink-300 hover:bg-ink-800 hover:text-white'}`}>
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
      {label}
    </NavLink>
  );
}

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="flex min-h-full">
      {open && <div className="fixed inset-0 z-30 bg-ink-950/50 lg:hidden" onClick={close} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-ink-900 px-3 py-5 transition-transform lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-8 flex items-center gap-2.5 px-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
            <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 6h14M5 12h9M5 18h12" /></svg>
          </span>
          <span className="font-display text-xl font-bold text-white">Triage</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          <NavItem to="/" end label="Dashboard" d={icon.dashboard} onClick={close} />
          <NavItem to="/projects" label="Projects" d={icon.projects} onClick={close} />
          <NavItem to="/tickets" label="All tickets" d={icon.tickets} onClick={close} />
          {isAdmin && <NavItem to="/users" label="People & roles" d={icon.users} onClick={close} />}
        </nav>
        <div className="border-t border-ink-700 pt-4">
          <div className="flex items-center gap-3 px-2">
            <Avatar user={user} size="h-9 w-9 text-sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user.name}</p>
              <p className="text-xs text-ink-300">{user.role.charAt(0) + user.role.slice(1).toLowerCase()}</p>
            </div>
          </div>
          <button className="mt-3 w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-ink-300 hover:bg-ink-800 hover:text-white"
            onClick={() => { logout(); navigate('/login'); }}>
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button className="btn-ghost px-2" onClick={() => setOpen(true)} aria-label="Open menu">☰</button>
          <span className="font-display text-lg font-bold">Triage</span>
        </header>
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
