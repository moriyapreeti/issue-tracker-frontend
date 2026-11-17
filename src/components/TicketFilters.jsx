import { PRIORITIES, STATUSES, TYPES } from '../utils/constants';

export default function TicketFilters({ filters, setFilters, projects, members, hideProject = false, hideStatus = false }) {
  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value, page: 0 }));
  const reset = () => setFilters((f) => ({ ...f, q: '', projectId: hideProject ? f.projectId : '', status: '', priority: '', type: '', assigneeId: '', mine: false, page: 0 }));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input className="input !w-full sm:!w-64" type="search" placeholder="Search title or description" aria-label="Search tickets"
        value={filters.q} onChange={set('q')} />
      {!hideProject && projects && (
        <select className="input !w-auto" aria-label="Project" value={filters.projectId} onChange={set('projectId')}>
          <option value="">All projects</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      )}
      {!hideStatus && (
        <select className="input !w-auto" aria-label="Status" value={filters.status} onChange={set('status')}>
          <option value="">Any status</option>
          {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      )}
      <select className="input !w-auto" aria-label="Priority" value={filters.priority} onChange={set('priority')}>
        <option value="">Any priority</option>
        {PRIORITIES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
      </select>
      <select className="input !w-auto" aria-label="Type" value={filters.type} onChange={set('type')}>
        <option value="">Any type</option>
        {TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
      </select>
      {members && (
        <select className="input !w-auto" aria-label="Assignee" value={filters.assigneeId} onChange={set('assigneeId')}>
          <option value="">Anyone</option>
          {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      )}
      <label className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold shadow-card">
        <input type="checkbox" className="rounded text-brand-600 focus:ring-brand-600" checked={filters.mine}
          onChange={(e) => setFilters((f) => ({ ...f, mine: e.target.checked, page: 0 }))} />
        Assigned to me
      </label>
      <button className="btn-ghost" onClick={reset}>Clear</button>
    </div>
  );
}
