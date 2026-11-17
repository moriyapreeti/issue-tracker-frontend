import { useState } from 'react';
import { PRIORITIES, STATUSES, TYPES } from '../utils/constants';
import { Spinner } from './Spinner';

export default function TicketForm({ projects, initial, lockProject = false, submitLabel = 'Create ticket', onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    projectId: initial?.projectId || projects[0]?.id || '',
    type: initial?.type || 'TASK',
    priority: initial?.priority || 'MEDIUM',
    status: initial?.status || 'TODO',
    assigneeId: initial?.assignee?.id || '',
  });
  const [saving, setSaving] = useState(false);
  const project = projects.find((p) => p.id === Number(form.projectId));
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const changeProject = (e) => {
    const id = Number(e.target.value);
    const p = projects.find((x) => x.id === id);
    setForm((f) => ({ ...f, projectId: id, assigneeId: p?.members.some((m) => m.id === Number(f.assigneeId)) ? f.assigneeId : '' }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        ...form,
        title: form.title.trim(),
        projectId: Number(form.projectId),
        assigneeId: form.assigneeId ? Number(form.assigneeId) : null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label" htmlFor="t-title">Title</label>
        <input id="t-title" className="input" required maxLength={200} value={form.title} onChange={set('title')} placeholder="What needs to be done?" autoFocus />
      </div>
      <div>
        <label className="label" htmlFor="t-desc">Description</label>
        <textarea id="t-desc" className="input min-h-28" maxLength={5000} value={form.description} onChange={set('description')} placeholder="Steps to reproduce, expected result, links…" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label" htmlFor="t-project">Project</label>
          <select id="t-project" className="input" value={form.projectId} onChange={changeProject} disabled={lockProject} required>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.key} · {p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="t-type">Type</label>
          <select id="t-type" className="input" value={form.type} onChange={set('type')}>
            {TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="t-priority">Priority</label>
          <select id="t-priority" className="input" value={form.priority} onChange={set('priority')}>
            {PRIORITIES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="t-status">Status</label>
          <select id="t-status" className="input" value={form.status} onChange={set('status')}>
            {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="t-assignee">Assignee</label>
          <select id="t-assignee" className="input" value={form.assigneeId} onChange={set('assigneeId')}>
            <option value="">Unassigned</option>
            {(project?.members || []).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" disabled={saving || !form.projectId}>
          {saving && <Spinner className="h-4 w-4 text-white" />} {submitLabel}
        </button>
      </div>
    </form>
  );
}
