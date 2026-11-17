import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectsApi, errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import { PageLoader, EmptyState, Spinner } from '../components/Spinner';
import { Avatar, KeyChip } from '../components/Badges';

function ProjectForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({ name: '', key: '', description: '' });
  const [busy, setBusy] = useState(false);
  const bind = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { await onSubmit({ ...form, key: form.key.trim() || null }); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <div><label className="label" htmlFor="p-name">Project name</label><input id="p-name" className="input" required maxLength={120} autoFocus {...bind('name')} /></div>
      <div>
        <label className="label" htmlFor="p-key">Key <span className="font-normal text-ink-500">(optional, 2–10 letters)</span></label>
        <input id="p-key" className="input uppercase" pattern="[A-Za-z]{2,10}" maxLength={10} placeholder="Generated from the name" {...bind('key')} />
      </div>
      <div><label className="label" htmlFor="p-desc">Description</label><textarea id="p-desc" className="input min-h-24" maxLength={2000} {...bind('description')} /></div>
      <div className="flex justify-end gap-2">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" disabled={busy}>{busy && <Spinner className="h-4 w-4 text-white" />} Create project</button>
      </div>
    </form>
  );
}

export default function Projects() {
  const { canCreateProject } = useAuth();
  const toast = useToast();
  const [projects, setProjects] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    projectsApi.list().then(setProjects).catch((e) => { toast.error(errorMessage(e)); setProjects([]); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const create = async (data) => {
    try {
      const p = await projectsApi.create(data);
      setProjects((x) => [p, ...x]);
      setCreating(false);
      toast.success(`Project ${p.name} created`);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  if (!projects) return <PageLoader label="Loading projects…" />;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Projects</h1>
        {canCreateProject && <button className="btn-primary" onClick={() => setCreating(true)}>New project</button>}
      </div>

      {projects.length === 0 ? (
        <EmptyState title="No projects yet"
          hint={canCreateProject ? 'Create your first project to start tracking tickets.' : 'A manager or admin needs to add you to a project.'}
          action={canCreateProject && <button className="btn-primary mt-2" onClick={() => setCreating(true)}>New project</button>} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <li key={p.id}>
              <Link to={`/projects/${p.id}`} className="panel block h-full p-5 transition-shadow hover:shadow-lift">
                <div className="flex items-center justify-between">
                  <KeyChip>{p.key}</KeyChip>
                  <span className="text-xs font-semibold text-ink-500">{p.ticketCount} ticket{p.ticketCount === 1 ? '' : 's'}</span>
                </div>
                <h2 className="mt-3 text-lg font-bold">{p.name}</h2>
                <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-ink-500">{p.description || 'No description'}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="flex -space-x-2">{p.members.slice(0, 5).map((m) => <Avatar key={m.id} user={m} />)}</span>
                  <span className="text-xs text-ink-500">Owner: {p.owner.name}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {creating && <Modal title="New project" onClose={() => setCreating(false)}><ProjectForm onSubmit={create} onCancel={() => setCreating(false)} /></Modal>}
    </div>
  );
}
