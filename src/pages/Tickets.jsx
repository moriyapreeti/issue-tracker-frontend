import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { projectsApi, ticketsApi, errorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import { useDebounce } from '../utils/helpers';
import { timeAgo } from '../utils/helpers';
import TicketFilters from '../components/TicketFilters';
import TicketForm from '../components/TicketForm';
import Modal from '../components/Modal';
import { PageLoader, EmptyState, Spinner } from '../components/Spinner';
import { Avatar, PriorityBadge, StatusBadge, TypeMark } from '../components/Badges';

const SIZE = 15;

export default function Tickets() {
  const toast = useToast();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sort, setSort] = useState('createdAt,desc');
  const [filters, setFilters] = useState({ q: '', projectId: '', status: '', priority: '', type: '', assigneeId: '', mine: false, page: 0 });
  const q = useDebounce(filters.q);

  useEffect(() => { projectsApi.list().then(setProjects).catch((e) => toast.error(errorMessage(e))); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const members = (() => {
    const src = filters.projectId ? projects.filter((p) => p.id === Number(filters.projectId)) : projects;
    const map = new Map();
    src.forEach((p) => p.members.forEach((m) => map.set(m.id, m)));
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  })();

  const load = useCallback(() => {
    setLoading(true);
    ticketsApi.search({ ...filters, q, size: SIZE, sort })
      .then(setResult)
      .catch((e) => { toast.error(errorMessage(e)); setResult((r) => r || { content: [], totalElements: 0, totalPages: 0, page: 0 }); })
      .finally(() => setLoading(false));
  }, [q, filters.projectId, filters.status, filters.priority, filters.type, filters.assigneeId, filters.mine, filters.page, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const create = async (data) => {
    try {
      const t = await ticketsApi.create(data);
      toast.success('Ticket created');
      setCreating(false);
      navigate(`/tickets/${t.id}`);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">All tickets</h1>
        <button className="btn-primary" onClick={() => setCreating(true)} disabled={projects.length === 0}>New ticket</button>
      </div>

      <TicketFilters filters={filters} setFilters={setFilters} projects={projects} members={members} />

      <div className="flex items-center justify-between text-sm text-ink-500">
        <span className="flex items-center gap-2">{result ? `${result.totalElements} ticket${result.totalElements === 1 ? '' : 's'}` : ''} {loading && <Spinner className="h-4 w-4" />}</span>
        <label className="flex items-center gap-2">Sort by
          <select className="input !w-auto" value={sort} onChange={(e) => { setSort(e.target.value); setFilters((f) => ({ ...f, page: 0 })); }}>
            <option value="createdAt,desc">Newest</option>
            <option value="createdAt,asc">Oldest</option>
            <option value="updatedAt,desc">Recently updated</option>
            <option value="priority,asc">Priority (A–Z)</option>
            <option value="title,asc">Title (A–Z)</option>
          </select>
        </label>
      </div>

      {!result ? <PageLoader label="Loading tickets…" /> : result.content.length === 0 ? (
        <EmptyState title="No tickets match" hint="Try clearing a filter, or create a new ticket." />
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-slate-100 text-xs text-ink-500">
              <tr><th className="px-4 py-3 font-semibold">Ticket</th><th className="px-2 py-3 font-semibold">Status</th><th className="px-2 py-3 font-semibold">Priority</th><th className="px-2 py-3 font-semibold">Assignee</th><th className="px-4 py-3 font-semibold">Updated</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {result.content.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link to={`/tickets/${t.id}`} className="flex items-center gap-2 font-semibold hover:text-brand-700">
                      <TypeMark type={t.type} /> <span>{t.title}</span>
                    </Link>
                    <p className="ml-4 text-xs text-ink-500">{t.projectKey}-{t.id} · {t.projectName}</p>
                  </td>
                  <td className="px-2 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-2 py-3"><PriorityBadge priority={t.priority} /></td>
                  <td className="px-2 py-3"><span className="flex items-center gap-2"><Avatar user={t.assignee} />{t.assignee?.name || <span className="text-ink-300">Unassigned</span>}</span></td>
                  <td className="px-4 py-3 text-ink-500">{timeAgo(t.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {result && result.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button className="btn-secondary" disabled={filters.page === 0} onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}>Previous</button>
          <span className="text-sm text-ink-500">Page {result.page + 1} of {result.totalPages}</span>
          <button className="btn-secondary" disabled={filters.page + 1 >= result.totalPages} onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}>Next</button>
        </div>
      )}

      {creating && (
        <Modal title="New ticket" wide onClose={() => setCreating(false)}>
          <TicketForm projects={projects} onSubmit={create} onCancel={() => setCreating(false)} />
        </Modal>
      )}
    </div>
  );
}
