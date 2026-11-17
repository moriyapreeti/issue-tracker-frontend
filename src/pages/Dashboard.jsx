import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectsApi, ticketsApi, errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageLoader, EmptyState } from '../components/Spinner';
import { KeyChip, PriorityBadge, StatusBadge, TypeMark, Avatar } from '../components/Badges';
import { timeAgo } from '../utils/helpers';

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.all([projectsApi.list(), ticketsApi.search({ mine: true, size: 100, sort: 'updatedAt,desc' })])
      .then(([projects, mine]) => setData({ projects, mine: mine.content, totalMine: mine.totalElements }))
      .catch((e) => { toast.error(errorMessage(e)); setData({ projects: [], mine: [], totalMine: 0 }); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!data) return <PageLoader label="Loading your dashboard…" />;

  const count = (s) => data.mine.filter((t) => t.status === s).length;
  const open = data.mine.filter((t) => t.status !== 'DONE');
  const urgent = open.filter((t) => t.priority === 'CRITICAL' || t.priority === 'HIGH').length;
  const stats = [
    { label: 'To do', value: count('TODO') },
    { label: 'In progress', value: count('IN_PROGRESS') },
    { label: 'Done', value: count('DONE') },
    { label: 'High or critical, still open', value: urgent },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hi {user.name.split(' ')[0]}, here's your work</h1>
        <p className="mt-1 text-ink-500">{open.length === 0 ? 'Nothing is assigned to you right now.' : `${open.length} open ticket${open.length === 1 ? '' : 's'} assigned to you.`}</p>
      </div>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="panel px-4 py-3">
            <dd className="font-display text-2xl font-bold">{s.value}</dd>
            <dt className="text-sm text-ink-500">{s.label}</dt>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section>
          <h2 className="mb-3 text-lg font-bold">Assigned to you</h2>
          {open.length === 0 ? (
            <EmptyState title="You're all caught up" hint="Open a project board to pick up something new." action={<Link to="/projects" className="btn-primary mt-2">Browse projects</Link>} />
          ) : (
            <ul className="panel divide-y divide-slate-100">
              {open.slice(0, 8).map((t) => (
                <li key={t.id}>
                  <Link to={`/tickets/${t.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
                    <TypeMark type={t.type} />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">{t.title}</span>
                    <span className="hidden text-xs text-ink-300 sm:inline">{timeAgo(t.updatedAt)}</span>
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold">Your projects</h2>
          {data.projects.length === 0 ? (
            <EmptyState title="No projects yet" hint="Ask a manager to add you to a project." />
          ) : (
            <ul className="panel divide-y divide-slate-100">
              {data.projects.slice(0, 6).map((p) => (
                <li key={p.id}>
                  <Link to={`/projects/${p.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
                    <KeyChip>{p.key}</KeyChip>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">{p.name}</span>
                    <span className="text-xs text-ink-500">{p.ticketCount} tickets</span>
                    <span className="flex -space-x-2">{p.members.slice(0, 3).map((m) => <Avatar key={m.id} user={m} size="h-6 w-6 text-[10px]" />)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
